/**
 * OpenSea API Service
 * Handles interactions with OpenSea API to fetch NFT collection data
 */

import config from '../config/apiConfig.js';
import apiService from './apiService.js';
import logger from './logger.js';

// Known collection slugs for popular NFTs with fallback data
const KNOWN_COLLECTIONS = config.knownCollections || {
  '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d': {
    slug: 'boredapeyachtclub',
    name: 'Bored Ape Yacht Club',
    description: 'The Bored Ape Yacht Club is a collection of 10,000 unique Bored Ape NFTs— unique digital collectibles living on the Ethereum blockchain.',
    image_url: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB',
    external_url: 'https://boredapeyachtclub.com',
    twitter_username: 'BoredApeYC',
    discord_url: 'https://discord.gg/3P5K3dzgdB',
    _source: 'known_collection',
    _cached_at: new Date().toISOString()
  },
  '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e': {
    slug: 'doodles-official',
    name: 'Doodles',
    description: 'A community-driven collectibles project featuring art by Burnt Toast.',
    image_url: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOvdkqnVZPMNoWeyklPhDP8pqQl525Z3zB1Er9LfoHIfAeMpyn_5W3pdoafPb4Ly0mxTWzLG2eK6quj-5lSg9PQ',
    external_url: 'https://doodles.app',
    twitter_username: 'doodles',
    discord_url: 'https://discord.gg/doodles',
    _source: 'known_collection',
    _cached_at: new Date().toISOString()
  }
};

/**
 * Make an authenticated request to OpenSea API with retry and fallback
 */
export const makeOpenSeaRequest = async (endpoint, options = {}) => {
  const maxRetries = 2;
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const data = await apiService.fetchOpenSea(endpoint, options);
      if (data) {
        // If we have data and it's not an error response, return it
        if (data.error) {
          throw new Error(`API Error: ${data.error.message || 'Unknown error'}`);
        }
        return data;
      }
      throw new Error('No data returned from API');
    } catch (error) {
      lastError = error;
      const isRateLimit = error.response?.status === 429 || error.message.includes('429');
      const isServerError = error.response?.status >= 500;
      
      // Log the error with appropriate level
      const logData = { 
        endpoint, 
        attempt: attempt + 1,
        status: error.response?.status,
        error: error.message 
      };
      
      if (isRateLimit) {
        logger.warn(`OpenSea API rate limited`, logData);
      } else if (error.response?.status === 404) {
        logger.debug(`OpenSea API endpoint not found: ${endpoint}`, logData);
      } else {
        logger.error(`OpenSea API request failed`, logData);
      }
      
      // If not the last attempt and it's a retryable error, wait and retry
      if (attempt < maxRetries && (isRateLimit || isServerError)) {
        const delay = isRateLimit ? 2000 : 1000; // Longer delay for rate limits
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
        continue;
      }
      
      // If we get here, we've exhausted our retries or it's a non-retryable error
      break;
    }
  }
  
  // If we get here, all attempts failed
  throw lastError || new Error('OpenSea API request failed after retries');
}

/**
 * Get collection data from OpenSea API with fallback to known collections
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<Object>} OpenSea collection data with fallback
 */
export const getOpenSeaData = async (contractAddress) => {
  // Validate contract address
  if (!contractAddress) {
    logger.warn('No contract address provided to getOpenSeaData');
    return null;
  }

  // Ensure contractAddress is a string and normalize it
  const normalizedAddress = String(contractAddress).toLowerCase().trim();
  
  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
    logger.warn(`Invalid Ethereum address format: ${contractAddress}`);
    return null;
  }

  const knownCollection = KNOWN_COLLECTIONS[normalizedAddress];
  const startTime = Date.now();
  
  // Prepare fallback data from known collections
  const fallbackData = knownCollection ? {
    ...knownCollection,
    _source: 'known_collection',
    _cached_at: new Date().toISOString(),
    _warnings: ['Using known collection data - API data may be unavailable']
  } : null;

  try {
    // First try to get collection data using v2 API
    let collectionData = null;
    let source = 'unknown';
    
    // Try direct collection fetch for known collections
    if (knownCollection?.slug) {
      logger.debug(`Fetching collection data for ${knownCollection.slug}`);
      collectionData = await makeOpenSeaRequest(`/collections/${knownCollection.slug}`);
      if (collectionData) {
        source = 'opensea_v2';
        logger.debug(`Successfully fetched collection data from OpenSea v2: ${collectionData.name}`);
      }
    }
    
    // Fallback to contract-based lookup
    if (!collectionData) {
      logger.debug(`Trying contract-based lookup for ${normalizedAddress}`);
      const contractData = await makeOpenSeaRequest(`/asset_contract/${normalizedAddress}`);
      if (contractData?.collection?.slug) {
        collectionData = await makeOpenSeaRequest(`/collections/${contractData.collection.slug}`);
        if (collectionData) {
          source = 'opensea_v1';
          logger.debug(`Successfully fetched collection data from OpenSea v1: ${collectionData.name}`);
        }
      }
    }
    
    // If no data from API, use fallback if available
    if (!collectionData) {
      if (fallbackData) {
        logger.info(`Using fallback data for contract: ${contractAddress}`);
        return {
          ...fallbackData,
          stats: null,
          _source: 'fallback',
          _warnings: ['Using fallback data - API data unavailable']
        };
      }
      logger.warn(`No collection data found for contract: ${contractAddress}`);
      return null;
    }
    
    // Get collection stats if available
    let stats = null;
    const statsSlug = collectionData.slug || (collectionData.collection?.slug);
    
    if (statsSlug) {
      try {
        logger.debug(`Fetching stats for collection: ${statsSlug}`);
        const statsData = await makeOpenSeaRequest(`/collections/${statsSlug}/stats`);
        if (statsData?.stats) {
          stats = statsData.stats;
          logger.debug(`Successfully fetched stats for collection: ${statsSlug}`);
        }
      } catch (error) {
        logger.warn(`Failed to fetch stats for ${statsSlug}:`, error);
      }
    }
    
    // Format the response with metadata
    const result = {
      // Spread collection data first, then override with known collection data
      ...(collectionData.collection || collectionData || {}),
      // Override with known collection data if available
      ...(knownCollection || {}),
      // Add stats
      stats,
      // Add metadata
      _source: source,
      _timestamp: new Date().toISOString(),
      _processingTimeMs: Date.now() - startTime,
      // Ensure we have fallback values for critical fields
      name: collectionData.name || 
           collectionData.collection?.name || 
           knownCollection?.name || 
           `Collection ${normalizedAddress.slice(0, 8)}`,
      description: collectionData.description || 
                  collectionData.collection?.description || 
                  knownCollection?.description || 
                  'No description available',
      image_url: collectionData.image_url || 
                collectionData.collection?.image_url || 
                knownCollection?.image_url,
      external_url: collectionData.external_url || 
                   collectionData.collection?.external_url || 
                   knownCollection?.external_url,
      twitter_username: collectionData.twitter_username || 
                       collectionData.collection?.twitter_username || 
                       knownCollection?.twitter_username,
      discord_url: collectionData.discord_url || 
                 collectionData.collection?.discord_url || 
                 knownCollection?.discord_url,
      schema_name: collectionData.schema_name || 'unknown',
      address: collectionData.address || contractAddress,
      description: collectionData.description || collectionData.collection?.description,
      external_link: collectionData.external_link || collectionData.collection?.external_url,
      image_url: collectionData.image_url || collectionData.collection?.image_url,
      created_date: collectionData.created_date || collectionData.collection?.created_date
    };
    
    return result;
    
  } catch (error) {
    logger.error(`Error in getOpenSeaData for ${contractAddress}:`, error);
    
    // Return fallback data if available
    if (fallbackData) {
      logger.info(`Using fallback data due to error for contract: ${contractAddress}`);
      return {
        ...fallbackData,
        _source: 'fallback_error',
        _error: error.message,
        _warnings: ['Using fallback data due to error: ' + error.message]
      };
    }
    
    throw error;
  }
};

/**
 * Get recent sales for a collection
 * @param {string} contractAddress - Contract address
 * @param {number} limit - Maximum number of sales to return
 * @returns {Promise<Array>} Array of recent sales
 */
export const getRecentSales = async (contractAddress, limit = 10) => {
  const startTime = Date.now();
  
  if (!contractAddress) {
    logger.warn('No contract address provided to getRecentSales');
    return [];
  }

  const cacheKey = `sales:${contractAddress.toLowerCase()}:${limit}`;
  
  try {
    logger.debug(`Fetching recent sales for contract: ${contractAddress}`);
    
    // Get sales from OpenSea
    const response = await makeOpenSeaRequest('/events', {
      params: {
        asset_contract_address: contractAddress.toLowerCase(),
        event_type: 'successful',
        limit,
      },
    });

    if (!response?.asset_events?.length) {
      logger.debug(`No sales found for contract: ${contractAddress}`);
      return [];
    }

    // Process sales data
    const sales = response.asset_events.map(event => {
      try {
        return {
          price: event.total_price,
          currency: event.payment_token?.symbol || 'ETH',
          timestamp: event.transaction?.timestamp,
          from: event.seller?.address,
          to: event.winner_account?.address,
          txHash: event.transaction?.transaction_hash,
          tokenId: event.asset?.token_id,
          source: 'opensea',
          _metadata: {
            processedAt: new Date().toISOString(),
            source: 'opensea',
          }
        };
      } catch (error) {
        logger.warn('Error processing sale event:', { error, event });
        return null;
      }
    }).filter(Boolean); // Remove any null entries from failed processing
    
    logger.info(`Fetched ${sales.length} recent sales for ${contractAddress} in ${Date.now() - startTime}ms`);
    
    return sales;
    
  } catch (error) {
    logger.error('Error fetching recent sales:', { 
      contractAddress, 
      error: error.message,
      stack: error.stack 
    });
    
    // Return empty array on error to allow graceful degradation
    return [];
  }
};

/**
 * Get floor price history for a collection
 * @param {string} contractAddress - Contract address
 * @param {string} timeFrame - Time frame for history (1d, 7d, 30d, all)
 * @returns {Promise<Array>} Array of historical floor prices
 */
export const getFloorPriceHistory = async (contractAddress, timeFrame = '7d') => {
  const startTime = Date.now();
  
  if (!contractAddress) {
    logger.warn('No contract address provided to getFloorPriceHistory');
    return [];
  }

  const cacheKey = `floor_history:${contractAddress.toLowerCase()}:${timeFrame}`;
  
  try {
    logger.debug(`Fetching floor price history for contract: ${contractAddress}, timeFrame: ${timeFrame}`);
    
    // Get collection data to find the slug
    const collectionData = await getOpenSeaData(contractAddress);
    if (!collectionData?.slug) {
      logger.warn(`No collection slug found for contract: ${contractAddress}`);
      return [];
    }

    // For OpenSea, we'll use the events endpoint to build price history
    // This is an approximation since OpenSea doesn't provide direct historical floor price data
    const events = await getRecentSales(contractAddress, 100); // Get recent sales to build history
    
    if (!events.length) {
      logger.debug(`No sales data available to build floor price history for: ${contractAddress}`);
      return [];
    }
    
    // Group sales by day and find minimum price for each day
    const dailyPrices = {};
    
    events.forEach(sale => {
      if (!sale.timestamp || !sale.price) return;
      
      const date = new Date(sale.timestamp * 1000).toISOString().split('T')[0];
      const price = parseFloat(sale.price);
      
      if (!dailyPrices[date] || price < dailyPrices[date].price) {
        dailyPrices[date] = {
          date,
          price,
          currency: sale.currency || 'ETH',
          txHash: sale.txHash,
          sampleSize: 1
        };
      } else {
        dailyPrices[date].sampleSize = (dailyPrices[date].sampleSize || 1) + 1;
      }
    });
    
    // Convert to array and sort by date
    const history = Object.values(dailyPrices).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    logger.info(`Generated floor price history for ${contractAddress} with ${history.length} data points in ${Date.now() - startTime}ms`);
    
    return history;
    
  } catch (error) {
    logger.error('Error fetching floor price history:', { 
      contractAddress, 
      timeFrame,
      error: error.message,
      stack: error.stack 
    });
    
    // Return empty array on error to allow graceful degradation
    return [];
  }
};

/**
 * Get similar collections from OpenSea
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Array>} Array of similar collections
 */
export const getSimilarCollections = async (contractAddress) => {
  const startTime = Date.now();
  
  if (!contractAddress) {
    logger.warn('No contract address provided to getSimilarCollections');
    return [];
  }

  const cacheKey = `similar:${contractAddress.toLowerCase()}`;
  
  try {
    logger.debug(`Finding similar collections for contract: ${contractAddress}`);
    
    // Get collection data to find the slug
    const collectionData = await getOpenSeaData(contractAddress);
    if (!collectionData?.slug) {
      logger.warn(`No collection slug found for contract: ${contractAddress}`);
      return [];
    }
    
    // Try to get similar collections from OpenSea
    try {
      const similarResponse = await makeOpenSeaRequest(`/collections/${collectionData.slug}/similar`);
      
      if (similarResponse?.collections?.length) {
        const similar = similarResponse.collections.map(collection => ({
          address: collection.address,
          name: collection.name,
          slug: collection.slug,
          image_url: collection.image_url,
          stats: collection.stats,
          _source: 'opensea',
          _score: collection.score
        }));
        
        logger.info(`Found ${similar.length} similar collections for ${collectionData.slug} in ${Date.now() - startTime}ms`);
        return similar;
      }
    } catch (error) {
      logger.warn('Error fetching similar collections from OpenSea:', error);
      // Continue to fallback if this fails
    }
    
    // Fallback: Return empty array if no similar collections found
    logger.info(`No similar collections found for ${collectionData.slug}`);
    return [];
    
  } catch (error) {
    logger.error('Error finding similar collections:', { 
      contractAddress, 
      error: error.message,
      stack: error.stack 
    });
    
    // Return empty array on error to allow graceful degradation
    return [];
  }
};

/**
 * Get collection stats
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Collection statistics
 */
export const getCollectionStats = async (contractAddress) => {
  const startTime = Date.now();
  
  if (!contractAddress) {
    logger.warn('No contract address provided to getCollectionStats');
    return {};
  }

  const cacheKey = `stats:${contractAddress.toLowerCase()}`;
  
  try {
    logger.debug(`Fetching stats for contract: ${contractAddress}`);
    
    // Get collection data which includes stats
    const collectionData = await getOpenSeaData(contractAddress);
    
    if (!collectionData) {
      logger.warn(`No collection data found for contract: ${contractAddress}`);
      return {};
    }
    
    // Format stats with metadata
    const stats = {
      ...(collectionData.stats || {}),
      _source: collectionData._source || 'unknown',
      _updatedAt: new Date().toISOString(),
      _processingTimeMs: Date.now() - startTime
    };
    
    logger.info(`Fetched stats for ${contractAddress} in ${Date.now() - startTime}ms`);
    return stats;
    
  } catch (error) {
    logger.error('Error fetching collection stats:', { 
      contractAddress, 
      error: error.message,
      stack: error.stack 
    });
    
    // Return empty object on error to allow graceful degradation
    return {};
  }
};

/**
 * Get collection traits
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Collection traits and their rarities
 */
export const getCollectionTraits = async (contractAddress) => {
  const startTime = Date.now();
  
  if (!contractAddress) {
    logger.warn('No contract address provided to getCollectionTraits');
    return {};
  }

  const cacheKey = `traits:${contractAddress.toLowerCase()}`;
  
  try {
    logger.debug(`Fetching traits for contract: ${contractAddress}`);
    
    // Get collection data to find the slug
    const collectionData = await getOpenSeaData(contractAddress);
    if (!collectionData?.slug) {
      logger.warn(`No collection slug found for contract: ${contractAddress}`);
      return {};
    }
    
    // Get traits from OpenSea
    const traitsResponse = await makeOpenSeaRequest(`/collection/${collectionData.slug}/traits`);
    
    if (!traitsResponse?.traits) {
      logger.warn(`No traits found for collection: ${collectionData.slug}`);
      return {};
    }
    
    const traits = {
      ...traitsResponse,
      _source: 'opensea',
      _updatedAt: new Date().toISOString(),
      _processingTimeMs: Date.now() - startTime
    };
    
    logger.info(`Fetched ${Object.keys(traits.traits).length} trait types for ${collectionData.slug} in ${Date.now() - startTime}ms`);
    return traits;
    
  } catch (error) {
    logger.error('Error fetching collection traits:', { 
      contractAddress, 
      error: error.message,
      stack: error.stack 
    });
    
    // Return empty object on error to allow graceful degradation
    return {};
  }
};
