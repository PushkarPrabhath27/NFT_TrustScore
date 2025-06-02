import { ethers } from 'ethers';
import NodeCache from 'node-cache';
import * as apiService from './apiService.js';
import logger from './logger.js';
import config from '../config/apiConfig.js';

// Cache for price data (5 minutes TTL)
const priceCache = new NodeCache({ stdTTL: 300 });

class PriceService {
  constructor() {
    this.providers = this.initializeProviders();
  }

  initializeProviders() {
    const providers = {};
    
    // Initialize Alchemy provider if API key is available
    if (config.alchemy.apiKey) {
      providers.alchemy = new ethers.providers.AlchemyProvider(
        'homestead',
        config.alchemy.apiKey
      );
    }
    
    // Initialize Infura provider if project ID is available
    if (process.env.INFURA_PROJECT_ID) {
      providers.infura = new ethers.providers.InfuraProvider(
        'homestead',
        process.env.INFURA_PROJECT_ID
      );
    }
    
    // Fallback to default provider if no specific providers are configured
    if (Object.keys(providers).length === 0) {
      providers.default = ethers.getDefaultProvider('homestead');
    }
    
    return providers;
  }

  /**
   * Get the best available provider
   */
  getProvider() {
    return (
      this.providers.alchemy ||
      this.providers.infura ||
      this.providers.default
    );
  }

  /**
   * Format price with proper decimal places
   */
  formatPrice(price, decimals = 18) {
    if (!price) return null;
    
    try {
      const formatted = ethers.utils.formatUnits(price.toString(), decimals);
      return parseFloat(parseFloat(formatted).toFixed(config.price.pricePrecision));
    } catch (error) {
      logger.error(`Error formatting price: ${error.message}`, { price, decimals });
      return null;
    }
  }

  /**
   * Get current price of an NFT collection
   */
  async getCollectionPrice(contractAddress) {
    const cacheKey = `price:${contractAddress.toLowerCase()}`;
    
    // Check cache first
    const cachedPrice = priceCache.get(cacheKey);
    if (cachedPrice) {
      return { ...cachedPrice, _cached: true };
    }
    
    try {
      // Try to get floor price from OpenSea
      try {
        const collection = await apiService.fetchOpenSea(
          `/collection/${contractAddress}`
        );
        
        if (collection?.stats?.floor_price) {
          const priceData = {
            price: collection.stats.floor_price,
            currency: 'ETH',
            source: 'opensea',
            timestamp: new Date().toISOString(),
          };
          
          // Cache the result
          priceCache.set(cacheKey, priceData);
          return priceData;
        }
      } catch (error) {
        logger.warn(`Failed to get price from OpenSea: ${error.message}`);
      }
      
      // Fallback to recent sales
      try {
        const sales = await apiService.getPriceHistory(contractAddress, { limit: 10 });
        
        if (sales.length > 0) {
          // Calculate average price from recent sales
          const validSales = sales.filter(s => s.price && s.currency === 'ETH');
          if (validSales.length > 0) {
            const total = validSales.reduce((sum, sale) => sum + parseFloat(sale.price), 0);
            const averagePrice = total / validSales.length;
            
            const priceData = {
              price: averagePrice,
              currency: 'ETH',
              source: 'recent_sales',
              timestamp: new Date().toISOString(),
              sampleSize: validSales.length,
            };
            
            // Cache the result
            priceCache.set(cacheKey, priceData);
            return priceData;
          }
        }
      } catch (error) {
        logger.warn(`Failed to get price from sales: ${error.message}`);
      }
      
      // If all else fails, return null
      return {
        price: null,
        currency: 'ETH',
        source: 'none',
        timestamp: new Date().toISOString(),
        error: 'Could not determine price',
      };
      
    } catch (error) {
      logger.error(`Error in getCollectionPrice: ${error.message}`, { contractAddress });
      throw error;
    }
  }

  /**
   * Get historical price data for a collection
   */
  async getPriceHistory(contractAddress, days = 30) {
    const cacheKey = `history:${contractAddress}:${days}`;
    
    // Check cache first
    const cachedHistory = priceCache.get(cacheKey);
    if (cachedHistory) {
      return { ...cachedHistory, _cached: true };
    }
    
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      // Get events from OpenSea
      const events = await apiService.getPriceHistory(contractAddress, {
        fromBlock: Math.floor(startDate.getTime() / 1000),
        toBlock: Math.floor(endDate.getTime() / 1000),
        limit: 100, // Adjust based on API limits
      });
      
      // Process events into daily data
      const dailyData = {};
      
      events.forEach(event => {
        if (!event.timestamp || !event.price) return;
        
        const date = new Date(event.timestamp * 1000).toISOString().split('T')[0];
        
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            prices: [],
            volume: 0,
            transactions: 0,
          };
        }
        
        dailyData[date].prices.push(parseFloat(event.price));
        dailyData[date].volume += parseFloat(event.price);
        dailyData[date].transactions++;
      });
      
      // Calculate daily averages
      const result = Object.values(dailyData).map(day => ({
        date: day.date,
        averagePrice: day.prices.reduce((a, b) => a + b, 0) / day.prices.length,
        minPrice: Math.min(...day.prices),
        maxPrice: Math.max(...day.prices),
        volume: day.volume,
        transactions: day.transactions,
      }));
      
      // Sort by date ascending
      result.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Cache the result
      priceCache.set(cacheKey, result);
      
      return result;
      
    } catch (error) {
      logger.error(`Error in getPriceHistory: ${error.message}`, { contractAddress, days });
      throw error;
    }
  }

  /**
   * Get price for a specific NFT
   */
  async getNFTPrice(contractAddress, tokenId) {
    const cacheKey = `nft:${contractAddress}:${tokenId}`;
    
    // Check cache first
    const cachedPrice = priceCache.get(cacheKey);
    if (cachedPrice) {
      return { ...cachedPrice, _cached: true };
    }
    
    try {
      // Try to get price from OpenSea
      try {
        const nft = await apiService.fetchOpenSea(`/asset/${contractAddress}/${tokenId}`);
        
        if (nft?.sell_orders?.[0]?.current_price) {
          const price = this.formatPrice(
            nft.sell_orders[0].current_price,
            nft.sell_orders[0]?.payment_token_contract?.decimals || 18
          );
          
          const priceData = {
            price,
            currency: nft.sell_orders[0]?.payment_token_contract?.symbol || 'ETH',
            source: 'opensea',
            timestamp: new Date().toISOString(),
          };
          
          // Cache the result
          priceCache.set(cacheKey, priceData);
          return priceData;
        }
      } catch (error) {
        logger.warn(`Failed to get NFT price from OpenSea: ${error.message}`);
      }
      
      // Fallback to collection floor price
      const collectionPrice = await this.getCollectionPrice(contractAddress);
      if (collectionPrice?.price) {
        return {
          ...collectionPrice,
          source: `${collectionPrice.source}_collection_floor`,
        };
      }
      
      // If all else fails, return null
      return {
        price: null,
        currency: 'ETH',
        source: 'none',
        timestamp: new Date().toISOString(),
        error: 'Could not determine price',
      };
      
    } catch (error) {
      logger.error(`Error in getNFTPrice: ${error.message}`, { contractAddress, tokenId });
      throw error;
    }
  }
}

const priceService = new PriceService();
export default priceService;
