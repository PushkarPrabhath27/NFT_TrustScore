/**
 * Dynamic API Service for NFT Smart Contract Analysis System
 * Handles all backend communication with dynamic port detection
 * and comprehensive error handling according to production-grade standards
 */

import backendDiscoveryService from './BackendDiscoveryService.js';
import logger from '../utils/Logger.js';

class DynamicApiService {
  constructor() {
    this.timeout = 30000; // 30 seconds timeout
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second initial delay
    this.baseURL = null; // Will be set dynamically
  }

  /**
   * Ensures we have a valid backend URL, discovering it if necessary
   * @returns {Promise<string>} The working backend URL
   */
  async ensureBackendURL() {
    if (!this.baseURL) {
      logger.debug('No backend URL cached, discovering...');
      this.baseURL = await backendDiscoveryService.discoverBackendURL();
    } else {
      // Verify the cached URL is still working
      const isReachable = await backendDiscoveryService.isBackendReachable();
      if (!isReachable) {
        logger.warn('Cached URL not reachable, re-discovering...', { url: this.baseURL });
        backendDiscoveryService.clearCache();
        this.baseURL = await backendDiscoveryService.discoverBackendURL();
      }
    }
    return this.baseURL;
  }

  /**
   * Validates Ethereum contract address format
   * @param {string} address - Contract address to validate
   * @returns {boolean} - True if valid Ethereum address
   */
  validateContractAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }
    
    const trimmedAddress = address.trim();
    // Check if it's a valid Ethereum address format (0x followed by 40 hex characters)
    return /^0x[a-fA-F0-9]{40}$/.test(trimmedAddress);
  }

  /**
   * Creates a fetch request with timeout and proper error handling
   * @param {string} url - Request URL
   * @param {object} options - Fetch options
   * @returns {Promise} - Fetch promise with timeout
   */
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  }

  /**
   * Implements exponential backoff retry logic
   * @param {Function} operation - Async operation to retry
   * @param {number} attempt - Current attempt number
   * @returns {Promise} - Result of the operation
   */
  async retryWithBackoff(operation, attempt = 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= this.retryAttempts) {
        throw error;
      }

      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }

      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      logger.logRetry(attempt, this.retryAttempts, delay);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(operation, attempt + 1);
    }
  }

  /**
   * Makes an API request with dynamic backend URL discovery
   * @param {string} endpoint - API endpoint path
   * @param {object} options - Fetch options
   * @returns {Promise} - API response
   */
  async makeRequest(endpoint, options = {}) {
    const baseURL = await this.ensureBackendURL();
    const url = `${baseURL}${endpoint}`;
    
    logger.logApiRequest(options.method || 'GET', url, options);
    
    const operation = async () => {
      const startTime = Date.now();
      const response = await this.fetchWithTimeout(url, options);
      const responseTime = Date.now() - startTime;
      
      logger.logApiResponse(url, response.status, responseTime);
      
      // Handle HTTP errors
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If we can't parse the error response, use the default message
          logger.warn('Failed to parse error response', { parseError: parseError.message });
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      return response;
    };

    try {
      return await this.retryWithBackoff(operation);
    } catch (error) {
      logger.logApiError(url, error, 0);
      
      // If it's a connection error, clear the cached URL and try once more
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        logger.warn('Connection error detected, clearing cache and retrying...', { error: error.message });
        backendDiscoveryService.clearCache();
        this.baseURL = null;
        
        // Try one more time with fresh discovery
        try {
          const baseURL = await this.ensureBackendURL();
          const url = `${baseURL}${endpoint}`;
          return await this.fetchWithTimeout(url, options);
        } catch (retryError) {
          logger.error('Retry failed', { retryError: retryError.message });
          throw new Error('Unable to connect to the analysis server. Please check your internet connection and try again.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Analyzes an NFT smart contract
   * @param {string} contractAddress - Ethereum contract address
   * @returns {Promise<object>} - Analysis results
   * @throws {Error} - Validation or network errors
   */
  async analyzeContract(contractAddress) {
    // Input validation
    if (!contractAddress) {
      throw new Error('Contract address is required');
    }

    if (!this.validateContractAddress(contractAddress)) {
      throw new Error('Invalid contract address format. Please provide a valid Ethereum address (0x followed by 40 hex characters)');
    }

    const trimmedAddress = contractAddress.trim();
    console.log(`[DynamicApiService] Analyzing contract: ${trimmedAddress}`);

    const response = await this.makeRequest('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ contractAddress: trimmedAddress }),
    });

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }

    if (!data.success) {
      throw new Error(data.error || data.message || 'Analysis failed');
    }

    if (!data.data) {
      throw new Error('No analysis data received from server');
    }

    console.log('[DynamicApiService] Analysis completed successfully');
    return data;
  }

  /**
   * Checks the health status of the API server
   * @returns {Promise<object>} - Health status
   */
  async checkHealth() {
    try {
      const response = await this.makeRequest('/api/health');
      const data = await response.json();
      console.log('[DynamicApiService] Health check passed');
      return data;
    } catch (error) {
      console.error('[DynamicApiService] Health check failed:', error);
      throw new Error('API server is not responding');
    }
  }

  /**
   * Fetches NFT data for the dashboard
   * @param {string} contractAddress - Contract address to fetch data for
   * @returns {Promise<object>} - NFT analysis data
   */
  async fetchNFTData(contractAddress) {
    if (!this.validateContractAddress(contractAddress)) {
      throw new Error('Invalid contract address format');
    }

    const response = await this.makeRequest(`/api/analyze/${contractAddress}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!data || !data.data) {
      throw new Error('Invalid response format from server');
    }

    return {
      success: true,
      data: data.data
    };
  }

  /**
   * Gets the current backend URL
   * @returns {string|null} - Current backend URL or null
   */
  getCurrentBackendURL() {
    return this.baseURL || backendDiscoveryService.getCurrentURL();
  }

  /**
   * Gets detailed service status for debugging
   * @returns {object} - Service status information
   */
  getServiceStatus() {
    return {
      baseURL: this.baseURL,
      discoveryStatus: backendDiscoveryService.getDiscoveryStatus(),
      config: {
        timeout: this.timeout,
        retryAttempts: this.retryAttempts,
        retryDelay: this.retryDelay
      }
    };
  }

  /**
   * Clears all caches and forces fresh discovery
   */
  clearAllCaches() {
    console.log('[DynamicApiService] Clearing all caches');
    this.baseURL = null;
    backendDiscoveryService.clearCache();
  }
}

// Export singleton instance
const dynamicApiService = new DynamicApiService();
export default dynamicApiService;
