/**
 * Tests for BackendDiscoveryService
 * Tests dynamic port discovery, caching, and error handling
 */

import BackendDiscoveryService from '../BackendDiscoveryService.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('BackendDiscoveryService', () => {
  let service;

  beforeEach(() => {
    service = new BackendDiscoveryService();
    fetch.mockClear();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('Port Discovery', () => {
    it('should discover backend on first port when available', async () => {
      // Mock successful response on port 3001
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      const result = await service.discoverBackendURL();

      expect(result).toBe('http://localhost:3001');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/health',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          })
        })
      );
    });

    it('should try multiple ports when first port fails', async () => {
      // Mock failures on ports 3001 and 3000, success on 3002
      fetch
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'ok' })
        });

      const result = await service.discoverBackendURL();

      expect(result).toBe('http://localhost:3002');
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw error when no ports respond', async () => {
      // Mock all ports failing
      fetch.mockRejectedValue(new Error('Connection refused'));

      await expect(service.discoverBackendURL()).rejects.toThrow(
        'Backend not found on any of the checked ports'
      );
    });

    it('should handle non-200 responses', async () => {
      // Mock 404 response
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      await expect(service.discoverBackendURL()).rejects.toThrow();
    });
  });

  describe('Caching', () => {
    it('should cache discovered URL', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      // First call should make network request
      const result1 = await service.discoverBackendURL();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await service.discoverBackendURL();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(result1).toBe(result2);
    });

    it('should clear cache when requested', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      await service.discoverBackendURL();
      service.clearCache();

      // Next call should make new network request
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      await service.discoverBackendURL();
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should return cached URL if still valid', () => {
      service.discoveredURL = 'http://localhost:3001';
      service.lastDiscoveryTime = Date.now();

      const result = service.getCurrentURL();
      expect(result).toBe('http://localhost:3001');
    });
  });

  describe('Backend Reachability', () => {
    it('should return true when backend is reachable', async () => {
      service.discoveredURL = 'http://localhost:3001';
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      const isReachable = await service.isBackendReachable();
      expect(isReachable).toBe(true);
    });

    it('should return false when backend is not reachable', async () => {
      service.discoveredURL = 'http://localhost:3001';
      fetch.mockRejectedValueOnce(new Error('Connection refused'));

      const isReachable = await service.isBackendReachable();
      expect(isReachable).toBe(false);
    });

    it('should return false when no URL is discovered', async () => {
      const isReachable = await service.isBackendReachable();
      expect(isReachable).toBe(false);
    });
  });

  describe('Status Information', () => {
    it('should return discovery status', () => {
      service.discoveredURL = 'http://localhost:3001';
      service.isDiscovering = false;
      service.lastDiscoveryTime = Date.now();

      const status = service.getDiscoveryStatus();
      
      expect(status).toEqual({
        discoveredURL: 'http://localhost:3001',
        isDiscovering: false,
        lastDiscoveryTime: expect.any(Number),
        cacheValid: true,
        config: expect.objectContaining({
          baseURL: 'http://localhost',
          ports: expect.any(Array),
          healthEndpoint: '/api/health',
          timeout: 2000
        })
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      fetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 100)
        )
      );

      await expect(service.discoverBackendURL()).rejects.toThrow();
    });

    it('should handle malformed responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      await expect(service.discoverBackendURL()).rejects.toThrow();
    });
  });
});
