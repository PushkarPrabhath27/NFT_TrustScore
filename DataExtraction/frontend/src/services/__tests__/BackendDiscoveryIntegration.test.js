/**
 * Integration Tests for Backend Discovery
 * Tests real-world scenarios with different backend configurations
 */

import BackendDiscoveryService from '../BackendDiscoveryService.js';
import DynamicApiService from '../DynamicApiService.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('Backend Discovery Integration Tests', () => {
  let discoveryService;
  let apiService;

  beforeEach(() => {
    discoveryService = new BackendDiscoveryService();
    apiService = new DynamicApiService();
    fetch.mockClear();
  });

  afterEach(() => {
    discoveryService.clearCache();
    apiService.clearAllCaches();
  });

  describe('Scenario 1: Backend on Default Port (3001)', () => {
    it('should discover and connect to backend on port 3001', async () => {
      // Mock successful response on port 3001
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ 
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'NFT Smart Contract Analysis System'
        })
      });

      const backendURL = await discoveryService.discoverBackendURL();
      expect(backendURL).toBe('http://localhost:3001');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should make successful API calls after discovery', async () => {
      // Mock discovery
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      await discoveryService.discoverBackendURL();

      // Mock API call
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { contractAddress: '0x123...', trustScore: 85 }
        })
      });

      const result = await apiService.analyzeContract('0x1234567890123456789012345678901234567890');
      expect(result.success).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Scenario 2: Backend on Fallback Port (3002)', () => {
    it('should discover backend on port 3002 when 3001 is unavailable', async () => {
      // Mock failures on ports 3001 and 3000, success on 3002
      fetch
        .mockRejectedValueOnce(new Error('Connection refused')) // 3001
        .mockRejectedValueOnce(new Error('Connection refused')) // 3000
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'ok' })
        }); // 3002

      const backendURL = await discoveryService.discoverBackendURL();
      expect(backendURL).toBe('http://localhost:3002');
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should cache the discovered port and reuse it', async () => {
      // First discovery
      fetch
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockRejectedValueOnce(new Error('Connection refused'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'ok' })
        });

      const url1 = await discoveryService.discoverBackendURL();
      expect(url1).toBe('http://localhost:3002');

      // Second discovery should use cache
      const url2 = await discoveryService.discoverBackendURL();
      expect(url2).toBe('http://localhost:3002');
      expect(fetch).toHaveBeenCalledTimes(3); // Still only 3 calls
    });
  });

  describe('Scenario 3: Backend Not Running', () => {
    it('should throw error when no backend is found', async () => {
      // Mock all ports failing
      fetch.mockRejectedValue(new Error('Connection refused'));

      await expect(discoveryService.discoverBackendURL()).rejects.toThrow(
        'Backend not found on any of the checked ports'
      );
    });

    it('should provide helpful error message with port list', async () => {
      fetch.mockRejectedValue(new Error('Connection refused'));

      try {
        await discoveryService.discoverBackendURL();
      } catch (error) {
        expect(error.message).toContain('Backend not found on any of the checked ports');
        expect(error.message).toContain('3001, 3000, 3002, 3003, 5000, 8000, 8080, 4000, 5001, 3004, 3005');
      }
    });
  });

  describe('Scenario 4: Backend Health Endpoint Unavailable', () => {
    it('should handle 404 responses from health endpoint', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(discoveryService.discoverBackendURL()).rejects.toThrow();
    });

    it('should handle 500 responses from health endpoint', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(discoveryService.discoverBackendURL()).rejects.toThrow();
    });
  });

  describe('Scenario 5: Network Timeout', () => {
    it('should handle network timeouts gracefully', async () => {
      fetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 100)
        )
      );

      await expect(discoveryService.discoverBackendURL()).rejects.toThrow();
    });
  });

  describe('Scenario 6: Backend Restart During Operation', () => {
    it('should re-discover backend when connection is lost', async () => {
      // Initial discovery
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      await discoveryService.discoverBackendURL();
      expect(discoveryService.getCurrentURL()).toBe('http://localhost:3001');

      // Simulate backend restart - health check fails
      fetch.mockRejectedValueOnce(new Error('Connection refused'));

      const isReachable = await discoveryService.isBackendReachable();
      expect(isReachable).toBe(false);

      // Re-discovery should find backend on different port
      fetch
        .mockRejectedValueOnce(new Error('Connection refused')) // 3001
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'ok' })
        }); // 3000

      const newURL = await discoveryService.discoverBackendURL();
      expect(newURL).toBe('http://localhost:3000');
    });
  });

  describe('Scenario 7: Multiple Concurrent Discovery Requests', () => {
    it('should handle multiple concurrent discovery requests efficiently', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      // Start multiple discovery requests simultaneously
      const promises = [
        discoveryService.discoverBackendURL(),
        discoveryService.discoverBackendURL(),
        discoveryService.discoverBackendURL()
      ];

      const results = await Promise.all(promises);

      // All should return the same URL
      expect(results[0]).toBe('http://localhost:3001');
      expect(results[1]).toBe('http://localhost:3001');
      expect(results[2]).toBe('http://localhost:3001');

      // Should only make one network request
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Scenario 8: Configuration Override', () => {
    it('should respect custom port configuration', async () => {
      // Mock custom configuration
      const originalEnv = process.env.REACT_APP_BACKEND_PORTS;
      process.env.REACT_APP_BACKEND_PORTS = '[9000,9001,9002]';

      // Create new service instance to pick up env changes
      const customService = new BackendDiscoveryService();

      // Mock failure on custom ports, success on 9002
      fetch
        .mockRejectedValueOnce(new Error('Connection refused')) // 9000
        .mockRejectedValueOnce(new Error('Connection refused')) // 9001
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'ok' })
        }); // 9002

      const result = await customService.discoverBackendURL();
      expect(result).toBe('http://localhost:9002');

      // Restore original env
      process.env.REACT_APP_BACKEND_PORTS = originalEnv;
    });
  });

  describe('Scenario 9: Error Recovery and Retry', () => {
    it('should retry API calls after backend reconnection', async () => {
      // Initial discovery
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      await discoveryService.discoverBackendURL();

      // First API call fails
      fetch.mockRejectedValueOnce(new Error('Connection refused'));

      // Re-discovery succeeds
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      // Second API call succeeds
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { contractAddress: '0x123...', trustScore: 85 }
        })
      });

      const result = await apiService.analyzeContract('0x1234567890123456789012345678901234567890');
      expect(result.success).toBe(true);
    });
  });

  describe('Scenario 10: Performance and Caching', () => {
    it('should cache results for performance', async () => {
      // First discovery
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      const start1 = Date.now();
      await discoveryService.discoverBackendURL();
      const time1 = Date.now() - start1;

      // Second discovery should be much faster (cached)
      const start2 = Date.now();
      await discoveryService.discoverBackendURL();
      const time2 = Date.now() - start2;

      expect(time2).toBeLessThan(time1);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should respect cache timeout', async () => {
      // Mock short cache time
      const originalCacheTime = discoveryService.discoveryCacheTime;
      discoveryService.discoveryCacheTime = 100; // 100ms

      // First discovery
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      await discoveryService.discoverBackendURL();

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Second discovery should make new request
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      });

      await discoveryService.discoverBackendURL();
      expect(fetch).toHaveBeenCalledTimes(2);

      // Restore original cache time
      discoveryService.discoveryCacheTime = originalCacheTime;
    });
  });
});
