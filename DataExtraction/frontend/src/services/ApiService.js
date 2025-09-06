/**
 * Centralized API Service for NFT Smart Contract Analysis System
 * Handles all backend communication with comprehensive error handling
 * and validation according to production-grade standards
 */

class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
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
    // Input validation
    if (!contractAddress) {
      throw new Error('Contract address is required');
    }

    if (!this.validateContractAddress(contractAddress)) {
      throw new Error('Invalid contract address format. Please provide a valid Ethereum address (0x followed by 40 hex characters)');
    }

    const trimmedAddress = contractAddress.trim();
    console.log(`[ApiService] Analyzing contract: ${trimmedAddress}`);

    const operation = async () => {
      const response = await this.fetchWithTimeout(`${this.baseURL}/api/analyze`, {
        method: 'POST',
        body: JSON.stringify({ contractAddress: trimmedAddress }),
      });

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
          console.warn('Failed to parse error response:', parseError);
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

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

      console.log('[ApiService] Analysis completed successfully');
      return data;
    };

    try {
      return await this.retryWithBackoff(operation);
    } catch (error) {
      console.error('[ApiService] Analysis failed:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to the analysis server. Please check your internet connection and try again.');
      }
      
      if (error.message.includes('timeout')) {
        throw new Error('The analysis is taking longer than expected. Please try again.');
      }
      
      throw error;
    }
  }

  /**
   * Checks the health status of the API server
   * @returns {Promise<object>} - Health status
   */
  async checkHealth() {
    try {
      const response = await this.fetchWithTimeout(`${this.baseURL}/api/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[ApiService] Health check passed');
      return data;
    } catch (error) {
      console.error('[ApiService] Health check failed:', error);
      throw new Error('API server is not responding');
    }
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
    if (!this.validateContractAddress(contractAddress)) {
      throw new Error('Invalid contract address format');
    }

    const operation = async () => {
      const response = await this.fetchWithTimeout(
        `${this.baseURL}/api/analyze/${contractAddress}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch NFT data: ${response.status}`);
      }

      const data = await response.json();
      
      if (!this.validateResponseData(data)) {
        throw new Error('Invalid response format from server');
      }

      return {
        success: true,
        data: data.data
      };
    };

    try {
      return await this.retryWithBackoff(operation);
    } catch (error) {
      console.error('[ApiService] Failed to fetch NFT data:', error);
      throw error;
    }
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
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;