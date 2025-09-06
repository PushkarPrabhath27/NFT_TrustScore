/**
 * Centralized API Service for NFT Smart Contract Analysis System
 * Handles all backend communication with comprehensive error handling
 * and validation according to production-grade standards
 * 
 * This service now uses dynamic backend discovery to handle port changes
 */

import dynamicApiService from './DynamicApiService.js';

class ApiService {
  constructor() {
    // Legacy fallback for direct URL specification
    this.legacyBaseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
    this.timeout = 30000; // 30 seconds timeout
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second initial delay
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
      console.warn(`API request failed, retrying in ${delay}ms (attempt ${attempt}/${this.retryAttempts})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(operation, attempt + 1);
    }
  }

  /**
   * Analyzes an NFT smart contract
   * @param {string} contractAddress - Ethereum contract address
   * @returns {Promise<object>} - Analysis results
   * @throws {Error} - Validation or network errors
   */
  async analyzeContract(contractAddress) {
    console.log('[ApiService] Delegating to DynamicApiService for contract analysis');
    return await dynamicApiService.analyzeContract(contractAddress);
  }

  /**
   * Checks the health status of the API server
   * @returns {Promise<object>} - Health status
   */
  async checkHealth() {
    console.log('[ApiService] Delegating to DynamicApiService for health check');
    return await dynamicApiService.checkHealth();
  }

  /**
   * Validates if the API response contains all required fields
   * @param {object} data - API response data
   * @returns {boolean} - True if data structure is valid
   */
  validateResponseData(data) {
    if (!data || !data.data) {
      return false;
    }

    const requiredFields = [
      'contractAddress',
      'name',
      'analysis',
      'trustScore',
      'priceData',
      'collectionData'
    ];

    return requiredFields.every(field => {
      const hasField = data.data.hasOwnProperty(field);
      if (!hasField) {
        console.warn(`[ApiService] Missing required field: ${field}`);
      }
      return hasField;
    });
  }

  /**
   * Formats contract address for display (truncated with ellipsis)
   * @param {string} address - Full contract address
   * @param {number} startChars - Number of characters to show at start
   * @param {number} endChars - Number of characters to show at end
   * @returns {string} - Formatted address
   */
  formatAddress(address, startChars = 6, endChars = 4) {
    if (!address || address.length <= startChars + endChars) {
      return address;
    }
    
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  /**
   * Formats price values with appropriate decimal places
   * @param {string|number} price - Price value
   * @param {string} currency - Currency symbol
   * @returns {string} - Formatted price
   */
  formatPrice(price, currency = 'ETH') {
    if (!price || isNaN(price)) {
      return `0 ${currency}`;
    }
    
    const numPrice = parseFloat(price);
    const decimals = numPrice < 1 ? 4 : 2;
    
    return `${numPrice.toFixed(decimals)} ${currency}`;
  }

  /**
   * Fetches NFT data for the dashboard
   * @param {string} contractAddress - Contract address to fetch data for
   * @returns {Promise<object>} - NFT analysis data
   */
  async fetchNFTData(contractAddress) {
    console.log('[ApiService] Delegating to DynamicApiService for NFT data fetch');
    return await dynamicApiService.fetchNFTData(contractAddress);
  }

  /**
   * Formats percentage values
   * @param {string|number} percentage - Percentage value
   * @returns {string} - Formatted percentage
   */
  formatPercentage(percentage) {
    if (!percentage || isNaN(percentage)) {
      return '0%';
    }
    
    const numPercentage = parseFloat(percentage);
    const sign = numPercentage > 0 ? '+' : '';
    
    return `${sign}${numPercentage.toFixed(2)}%`;
  }

  /**
   * Formats large numbers with appropriate suffixes (K, M, B)
   * @param {string|number} number - Number to format
   * @returns {string} - Formatted number
   */
  formatLargeNumber(number) {
    if (!number || isNaN(number)) {
      return '0';
    }
    
    const num = parseFloat(number);
    
    if (num >= 1e9) {
      return `${(num / 1e9).toFixed(1)}B`;
    }
    if (num >= 1e6) {
      return `${(num / 1e6).toFixed(1)}M`;
    }
    if (num >= 1e3) {
      return `${(num / 1e3).toFixed(1)}K`;
    }
    
    return num.toString();
  }

  /**
   * Formats date strings for display
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date
   */
  formatDate(dateString) {
    if (!dateString) {
      return 'Unknown';
    }
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid Date';
    }
  }

  /**
   * Gets the current backend URL being used
   * @returns {string|null} - Current backend URL or null
   */
  getCurrentBackendURL() {
    return dynamicApiService.getCurrentBackendURL();
  }

  /**
   * Gets detailed service status for debugging
   * @returns {object} - Service status information
   */
  getServiceStatus() {
    return dynamicApiService.getServiceStatus();
  }

  /**
   * Clears all caches and forces fresh backend discovery
   */
  clearAllCaches() {
    dynamicApiService.clearAllCaches();
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;