/**
 * Tests for DynamicApiService
 * Tests API service with dynamic backend discovery
 */

import DynamicApiService from '../DynamicApiService.js';
import BackendDiscoveryService from '../BackendDiscoveryService.js';

// Mock the BackendDiscoveryService
jest.mock('../BackendDiscoveryService.js');

describe('DynamicApiService', () => {
  let service;
  let mockDiscoveryService;

  beforeEach(() => {
    service = new DynamicApiService();
    mockDiscoveryService = {
      discoverBackendURL: jest.fn(),
      isBackendReachable: jest.fn(),
      clearCache: jest.fn(),
      getCurrentURL: jest.fn()
    };
    
    // Replace the singleton instance
    BackendDiscoveryService.mockImplementation(() => mockDiscoveryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Backend URL Management', () => {
    it('should discover backend URL when not cached', async () => {
      mockDiscoveryService.discoverBackendURL.mockResolvedValue('http://localhost:3001');
      mockDiscoveryService.isBackendReachable.mockResolvedValue(true);

      const url = await service.ensureBackendURL();

      expect(url).toBe('http://localhost:3001');
      expect(mockDiscoveryService.discoverBackendURL).toHaveBeenCalled();
    });

    it('should use cached URL when available and reachable', async () => {
      service.baseURL = 'http://localhost:3001';
      mockDiscoveryService.isBackendReachable.mockResolvedValue(true);

      const url = await service.ensureBackendURL();

      expect(url).toBe('http://localhost:3001');
      expect(mockDiscoveryService.discoverBackendURL).not.toHaveBeenCalled();
    });

    it('should re-discover when cached URL is not reachable', async () => {
      service.baseURL = 'http://localhost:3001';
      mockDiscoveryService.isBackendReachable.mockResolvedValue(false);
      mockDiscoveryService.discoverBackendURL.mockResolvedValue('http://localhost:3002');

      const url = await service.ensureBackendURL();

      expect(url).toBe('http://localhost:3002');
      expect(mockDiscoveryService.discoverBackendURL).toHaveBeenCalled();
    });
  });

  describe('API Requests', () => {
    beforeEach(() => {
      service.baseURL = 'http://localhost:3001';
      global.fetch = jest.fn();
    });

    afterEach(() => {
      global.fetch.mockClear();
    });

    it('should make successful API request', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ success: true, data: { test: 'data' } })
      };
      global.fetch.mockResolvedValueOnce(mockResponse);

      const response = await service.makeRequest('/api/test');

      expect(response).toBe(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ error: 'Not found' })
      };
      global.fetch.mockResolvedValueOnce(mockResponse);

      await expect(service.makeRequest('/api/test')).rejects.toThrow('Not found');
    });

    it('should retry on connection errors', async () => {
      // First call fails, second succeeds
      global.fetch
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      mockDiscoveryService.clearCache.mockResolvedValue();
      mockDiscoveryService.discoverBackendURL.mockResolvedValue('http://localhost:3002');

      const response = await service.makeRequest('/api/test');

      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockDiscoveryService.clearCache).toHaveBeenCalled();
    });
  });

  describe('Contract Analysis', () => {
    beforeEach(() => {
      service.baseURL = 'http://localhost:3001';
      global.fetch = jest.fn();
    });

    it('should validate contract address format', () => {
      expect(service.validateContractAddress('0x1234567890123456789012345678901234567890')).toBe(true);
      expect(service.validateContractAddress('0x123')).toBe(false);
      expect(service.validateContractAddress('invalid')).toBe(false);
      expect(service.validateContractAddress('')).toBe(false);
    });

    it('should analyze contract successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { contractAddress: '0x123...', trustScore: 85 }
        })
      };
      global.fetch.mockResolvedValueOnce(mockResponse);

      const result = await service.analyzeContract('0x1234567890123456789012345678901234567890');

      expect(result.success).toBe(true);
      expect(result.data.trustScore).toBe(85);
    });

    it('should throw error for invalid contract address', async () => {
      await expect(service.analyzeContract('invalid')).rejects.toThrow(
        'Invalid contract address format'
      );
    });

    it('should throw error for missing contract address', async () => {
      await expect(service.analyzeContract('')).rejects.toThrow(
        'Contract address is required'
      );
    });
  });

  describe('Health Check', () => {
    beforeEach(() => {
      service.baseURL = 'http://localhost:3001';
      global.fetch = jest.fn();
    });

    it('should check health successfully', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      };
      global.fetch.mockResolvedValueOnce(mockResponse);

      const result = await service.checkHealth();

      expect(result.status).toBe('ok');
      expect(global.fetch).toHaveBeenCalledWith(
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

    it('should throw error when health check fails', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(service.checkHealth()).rejects.toThrow(
        'API server is not responding'
      );
    });
  });

  describe('Service Status', () => {
    it('should return current backend URL', () => {
      service.baseURL = 'http://localhost:3001';
      mockDiscoveryService.getCurrentURL.mockReturnValue('http://localhost:3001');

      const url = service.getCurrentBackendURL();
      expect(url).toBe('http://localhost:3001');
    });

    it('should return service status', () => {
      service.baseURL = 'http://localhost:3001';
      mockDiscoveryService.getDiscoveryStatus.mockReturnValue({
        discoveredURL: 'http://localhost:3001',
        isDiscovering: false
      });

      const status = service.getServiceStatus();
      
      expect(status).toEqual({
        baseURL: 'http://localhost:3001',
        discoveryStatus: {
          discoveredURL: 'http://localhost:3001',
          isDiscovering: false
        },
        config: expect.objectContaining({
          timeout: 30000,
          retryAttempts: 3,
          retryDelay: 1000
        })
      });
    });

    it('should clear all caches', () => {
      service.clearAllCaches();
      expect(mockDiscoveryService.clearCache).toHaveBeenCalled();
    });
  });
});
