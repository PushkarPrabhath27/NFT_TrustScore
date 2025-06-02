/**
 * Cache Service
 * Provides caching functionality for blockchain data and analysis results to reduce API calls
 */

// In-memory cache for contract data and analysis results
const contractDataCache = new Map();
const analysisResultsCache = new Map();

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Cache contract data
 * @param {string} contractAddress - Ethereum contract address
 * @param {Object} contractData - Contract data to cache
 * @returns {Promise<boolean>} Whether the data was successfully cached
 */
export const cacheContractData = async (contractAddress, contractData) => {
  try {
    if (!contractAddress || !contractData) {
      return false;
    }
    
    // Add timestamp for cache expiration
    const cachedData = {
      data: contractData,
      timestamp: Date.now()
    };
    
    // Store in cache
    contractDataCache.set(contractAddress.toLowerCase(), cachedData);
    
    return true;
  } catch (error) {
    console.error(`Error caching contract data for ${contractAddress}:`, error);
    return false;
  }
};

/**
 * Get cached contract data
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<Object|null>} Cached contract data or null if not found/expired
 */
export const getCachedContractData = async (contractAddress) => {
  try {
    if (!contractAddress) {
      return null;
    }
    
    const cachedData = contractDataCache.get(contractAddress.toLowerCase());
    
    // Check if data exists and is not expired
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_EXPIRATION) {
      return cachedData.data;
    }
    
    // Remove expired data
    if (cachedData) {
      contractDataCache.delete(contractAddress.toLowerCase());
    }
    
    return null;
  } catch (error) {
    console.error(`Error retrieving cached contract data for ${contractAddress}:`, error);
    return null;
  }
};

/**
 * Clear cache for a specific contract
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<boolean>} Whether the cache was successfully cleared
 */
export const clearContractCache = async (contractAddress) => {
  try {
    if (!contractAddress) {
      return false;
    }
    
    contractDataCache.delete(contractAddress.toLowerCase());
    return true;
  } catch (error) {
    console.error(`Error clearing contract cache for ${contractAddress}:`, error);
    return false;
  }
};

/**
 * Cache analysis results
 * @param {string} contractAddress - Ethereum contract address
 * @param {Object} analysisResult - Analysis results to cache
 * @returns {Promise<boolean>} Whether the data was successfully cached
 */
export const cacheAnalysisResults = async (contractAddress, analysisResult) => {
  try {
    if (!contractAddress || !analysisResult) {
      return false;
    }
    
    // Add timestamp for cache expiration
    const cachedData = {
      data: analysisResult,
      timestamp: Date.now()
    };
    
    // Store in cache
    analysisResultsCache.set(contractAddress.toLowerCase(), cachedData);
    
    return true;
  } catch (error) {
    console.error(`Error caching analysis results for ${contractAddress}:`, error);
    return false;
  }
};

/**
 * Get cached analysis results
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<Object|null>} Cached analysis results or null if not found/expired
 */
export const getCachedAnalysis = async (contractAddress) => {
  try {
    if (!contractAddress) {
      return null;
    }
    
    const cachedData = analysisResultsCache.get(contractAddress.toLowerCase());
    
    // Check if data exists and is not expired
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_EXPIRATION) {
      return cachedData.data;
    }
    
    // Remove expired data
    if (cachedData) {
      analysisResultsCache.delete(contractAddress.toLowerCase());
    }
    
    return null;
  } catch (error) {
    console.error(`Error retrieving cached analysis for ${contractAddress}:`, error);
    return null;
  }
};

/**
 * Clear analysis cache for a specific contract
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<boolean>} Whether the cache was successfully cleared
 */
export const clearAnalysisCache = async (contractAddress) => {
  try {
    if (!contractAddress) {
      return false;
    }
    
    analysisResultsCache.delete(contractAddress.toLowerCase());
    return true;
  } catch (error) {
    console.error(`Error clearing analysis cache for ${contractAddress}:`, error);
    return false;
  }
};

/**
 * Clear all cached data
 * @returns {Promise<boolean>} Whether the cache was successfully cleared
 */
export const clearAllCache = async () => {
  try {
    contractDataCache.clear();
    analysisResultsCache.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all cache:', error);
    return false;
  }
};