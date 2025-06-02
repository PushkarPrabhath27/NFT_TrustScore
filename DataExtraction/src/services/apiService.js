import axios from 'axios';
import { ethers } from 'ethers';
import config from '../config/apiConfig.js';
import logger from './logger.js';

class ApiService {
  constructor() {
    this.axios = axios.create({
      timeout: config.api.timeout,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NFT-Analysis-System/1.0',
      },
    });
    
    // Initialize rate limiting
    this.rateLimits = new Map();
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor for rate limiting
    this.axios.interceptors.request.use(
      async (config) => {
        const { host } = new URL(config.baseURL || config.url);
        const now = Date.now();
        
        // Check rate limit
        const lastRequest = this.rateLimits.get(host) || 0;
        const timeSinceLastRequest = now - lastRequest;
        const minInterval = 1000 / (config.rateLimit || 1);
        
        if (timeSinceLastRequest < minInterval) {
          await new Promise(resolve => 
            setTimeout(resolve, minInterval - timeSinceLastRequest)
          );
        }
        
        this.rateLimits.set(host, Date.now());
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor for retry logic
    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { config, response } = error;
        
        // Don't retry if no config or retry is disabled
        if (!config || !config.retry) {
          return Promise.reject(error);
        }
        
        // Don't retry for these status codes
        if (response && [400, 401, 403, 404].includes(response.status)) {
          return Promise.reject(error);
        }
        
        // Set retry count
        config.retryCount = config.retryCount || 0;
        
        // Check if we've exceeded the max retries
        if (config.retryCount >= config.retry) {
          return Promise.reject(error);
        }
        
        // Calculate retry delay with exponential backoff
        const delay = Math.min(
          config.retryDelay * Math.pow(2, config.retryCount) + Math.random() * 1000,
          30000 // Max 30 seconds
        );
        
        config.retryCount++;
        logger.warn(`Retry ${config.retryCount}/${config.retry} for ${config.url} after ${delay}ms`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.axios(config);
      }
    );
  }
  
  /**
   * Make an API request with retry and fallback
   * @param {Object} options - Axios request options
   * @returns {Promise<Object>} API response data
   */
  async request(options) {
    const defaultOptions = {
      retry: config.api.maxRetries,
      retryDelay: config.api.retryDelay,
      timeout: config.api.timeout,
    };
    
    try {
      const response = await this.axios({
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers,
        },
      });
      
      return response.data;
    } catch (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        logger.error(`API Error ${error.response.status}: ${error.response.statusText}`, {
          url: options.url,
          method: options.method || 'GET',
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        // The request was made but no response was received
        logger.error(`API Request Failed: No response received`, {
          url: options.url,
          method: options.method || 'GET',
          code: error.code,
          message: error.message,
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        logger.error(`API Request Setup Error: ${error.message}`, {
          url: options.url,
          method: options.method || 'GET',
          stack: error.stack,
        });
      }
      
      throw error;
    }
  }
  
  /**
   * Fetch data from OpenSea API
   */
  async fetchOpenSea(endpoint, options = {}) {
    const url = `${config.opensea.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const headers = {
      'X-API-KEY': config.opensea.apiKey,
      ...options.headers,
    };
    
    return this.request({
      url,
      method: 'GET',
      headers,
      ...options,
    });
  }
  
  /**
   * Fetch data from Alchemy API
   */
  async fetchAlchemy(endpoint, params = {}) {
    if (!config.alchemy.apiKey) {
      throw new Error('Alchemy API key is not configured');
    }
    
    const url = `${config.alchemy.baseUrl}/${config.alchemy.apiKey}${endpoint}`;
    
    return this.request({
      url,
      method: 'POST',
      data: params,
    });
  }
  
  /**
   * Get NFT metadata from multiple sources with fallback
   */
  async getNFTMetadata(contractAddress, tokenId) {
    try {
      // Try OpenSea first
      try {
        const data = await this.fetchOpenSea(`/asset/${contractAddress}/${tokenId}`);
        if (data) return { ...data, _source: 'opensea' };
      } catch (error) {
        logger.warn(`Failed to fetch from OpenSea: ${error.message}`);
      }
      
      // Fallback to Alchemy
      try {
        const data = await this.fetchAlchemy('/getNFTMetadata', {
          contractAddress,
          tokenId,
          tokenType: 'erc721',
        });
        if (data) return { ...data, _source: 'alchemy' };
      } catch (error) {
        logger.warn(`Failed to fetch from Alchemy: ${error.message}`);
      }
      
      // Fallback to contract URI
      try {
        const provider = new ethers.providers.InfuraProvider('homestead', process.env.INFURA_PROJECT_ID);
        const contract = new ethers.Contract(contractAddress, [
          'function tokenURI(uint256) view returns (string)',
          'function uri(uint256) view returns (string)',
        ], provider);
        
        let tokenURI;
        try {
          tokenURI = await contract.tokenURI(tokenId);
        } catch {
          tokenURI = await contract.uri(tokenId);
        }
        
        if (tokenURI) {
          // Handle IPFS hashes
          if (tokenURI.startsWith('ipfs://')) {
            tokenURI = `https://ipfs.io/ipfs/${tokenURI.split('ipfs://')[1]}`;
          }
          
          const metadata = await this.request({
            url: tokenURI,
            method: 'GET',
          });
          
          return { ...metadata, _source: 'contract_uri' };
        }
      } catch (error) {
        logger.warn(`Failed to fetch from contract URI: ${error.message}`);
      }
      
      // Return fallback data if all else fails
      return {
        name: `#${tokenId}`,
        description: `NFT #${tokenId} from ${contractAddress}`,
        image: null,
        _source: 'fallback',
        _warnings: ['Could not fetch metadata from any source'],
      };
      
    } catch (error) {
      logger.error(`Error in getNFTMetadata: ${error.message}`, { contractAddress, tokenId });
      throw error;
    }
  }
  
  /**
   * Get price history with pagination
   */
  async getPriceHistory(contractAddress, options = {}) {
    const { fromBlock, toBlock, limit = 100 } = options;
    const events = [];
    
    try {
      // Try OpenSea first
      const params = {
        asset_contract_address: contractAddress,
        event_type: 'successful',
        limit,
      };
      
      if (fromBlock) params.occurred_after = new Date(fromBlock * 1000).toISOString();
      if (toBlock) params.occurred_before = new Date(toBlock * 1000).toISOString();
      
      const response = await this.fetchOpenSea('/events', { params });
      
      if (response.asset_events?.length) {
        return response.asset_events.map(event => ({
          price: event.total_price,
          currency: event.payment_token?.symbol || 'ETH',
          timestamp: event.transaction?.timestamp,
          from: event.seller?.address,
          to: event.winner_account?.address,
          txHash: event.transaction?.transaction_hash,
          source: 'opensea',
        }));
      }
      
      // Fallback to Alchemy if no OpenSea data
      const alchemyParams = {
        fromBlock: fromBlock || '0x0',
        toBlock: toBlock || 'latest',
        contractAddress,
        limit,
      };
      
      const alchemyResponse = await this.fetchAlchemy('/getNFTSales', alchemyParams);
      
      if (alchemyResponse?.nftSales?.length) {
        return alchemyResponse.nftSales.map(sale => ({
          price: sale.sellerFee?.amount,
          currency: sale.sellerFee?.tokenSymbol || 'ETH',
          timestamp: sale.blockTimestamp,
          from: sale.sellerAddress,
          to: sale.buyerAddress,
          txHash: sale.transactionHash,
          source: 'alchemy',
        }));
      }
      
      return [];
      
    } catch (error) {
      logger.error(`Error fetching price history: ${error.message}`, { contractAddress });
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;
