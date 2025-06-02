/**
 * OpenSea API Service
 * Handles interactions with OpenSea API to fetch NFT collection data
 */

import config from '../config/apiConfig.js';
import logger from './logger.js';
import { ethers } from 'ethers';

// Cache management
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Add data to cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds
 */
const addToCache = (key, data, ttl = CACHE_DURATION) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttl
  });
  logger.debug(`Cached data for key: ${key}`);
};

/**
 * Get data from cache if it exists and hasn't expired
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if not found/expired
 */
const getFromCache = (key) => {
  const cached = cache.get(key);
  if (!cached) {
    return null;
  }
  
  if (cached.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  
  logger.debug(`Cache hit for key: ${key}`);
  return cached.data;
};

// Track active requests to prevent duplicate API calls
const activeRequests = new Map();

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
  }
};

// OpenSea API configuration
const OPENSEA_API_URL = process.env.OPENSEA_API_URL || 'https://api.opensea.io/api/v2';
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

// Cache management is already done at the top of the file

// Default headers for OpenSea API
const DEFAULT_HEADERS = {
  'X-API-KEY': OPENSEA_API_KEY,
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

// Rate limiting configuration
const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minute window
  MAX_REQUESTS: 30, // Max requests per window
  RETRY_AFTER_MS: 2000, // Default retry after 2 seconds
  MAX_RETRIES: 3, // Max retry attempts
  BACKOFF_FACTOR: 2, // Exponential backoff factor
  INITIAL_DELAY_MS: 1000, // Initial delay before first retry
};

// Track rate limits per endpoint
const rateLimits = new Map();

// Circuit breaker state
const circuitBreaker = {
  isOpen: false,
  lastFailure: 0,
  failureCount: 0,
  resetTimeout: 30000, // 30 seconds circuit breaker timeout
  threshold: 3, // Number of failures before opening the circuit
};

// Request queue for rate limiting
const requestQueue = [];
let isProcessingQueue = false;

/**
 * Check if we've exceeded the rate limit for an endpoint
 * @param {string} endpoint - The API endpoint being called
 * @returns {Promise<void>}
 * @throws {Error} If rate limited and need to wait
 */
async function checkRateLimit(endpoint) {
  const now = Date.now();
  
  // Check circuit breaker first
  if (circuitBreaker.isOpen) {
    if (now - circuitBreaker.lastFailure < circuitBreaker.resetTimeout) {
      throw new Error(`Circuit breaker is open. Too many failures. Retry after ${Math.ceil((circuitBreaker.lastFailure + circuitBreaker.resetTimeout - now) / 1000)}s`);
    } else {
      // Reset circuit breaker after timeout
      circuitBreaker.isOpen = false;
      circuitBreaker.failureCount = 0;
    }
  }
  
  // Initialize rate limit tracking for this endpoint if needed
  if (!rateLimits.has(endpoint)) {
    rateLimits.set(endpoint, {
      remaining: RATE_LIMIT.MAX_REQUESTS,
      reset: now + RATE_LIMIT.WINDOW_MS,
      lastRequest: 0,
      retryCount: 0,
    });
  }
  
  const limit = rateLimits.get(endpoint);
  
  // Reset rate limit window if expired
  if (now > limit.reset) {
    limit.remaining = RATE_LIMIT.MAX_REQUESTS;
    limit.reset = now + RATE_LIMIT.WINDOW_MS;
    limit.retryCount = 0;
  }
  
  // Check if we've exceeded the rate limit
  if (limit.remaining <= 0) {
    const waitTime = limit.reset - now + 1000; // Add 1s buffer
    logger.warn(`Rate limit exceeded for ${endpoint}. Waiting ${Math.ceil(waitTime / 1000)}s...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return checkRateLimit(endpoint); // Recursively check again after waiting
  }
  
  // Update rate limit tracking
  limit.remaining--;
  limit.lastRequest = now;
}

/**
 * Process the request queue with rate limiting
 */
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  try {
    const now = Date.now();
    const { resolve, reject, fn, endpoint } = requestQueue[0]; // Peek at the next request
    
    try {
      // Check rate limits before processing
      await checkRateLimit(endpoint);
      
      // Process the request
      const result = await fn();
      
      // Reset circuit breaker on success
      circuitBreaker.failureCount = 0;
      
      // Remove from queue and resolve
      requestQueue.shift();
      resolve(result);
    } catch (error) {
      // Handle rate limiting and circuit breaking
      if (error.message.includes('rate limit') || error.status === 429) {
        // Rate limited - retry with backoff
        const currentItem = requestQueue.shift();
        if (currentItem.retryCount < RATE_LIMIT.MAX_RETRIES) {
          currentItem.retryCount = (currentItem.retryCount || 0) + 1;
          const backoff = Math.min(
            RATE_LIMIT.INITIAL_DELAY_MS * Math.pow(RATE_LIMIT.BACKOFF_FACTOR, currentItem.retryCount - 1),
            30000 // Max 30s backoff
          );
          logger.warn(`Retry ${currentItem.retryCount}/${RATE_LIMIT.MAX_RETRIES} for ${endpoint} after ${backoff}ms`);
          await new Promise(resolve => setTimeout(resolve, backoff));
          requestQueue.unshift(currentItem); // Put back in queue
        } else {
          // Max retries reached
          requestQueue.shift();
          reject(new Error(`Max retries (${RATE_LIMIT.MAX_RETRIES}) exceeded for ${endpoint}`));
        }
      } else {
        // Other errors - update circuit breaker
        circuitBreaker.failureCount++;
        circuitBreaker.lastFailure = now;
        
        if (circuitBreaker.failureCount >= circuitBreaker.threshold) {
          circuitBreaker.isOpen = true;
          logger.error(`Circuit breaker opened for OpenSea API after ${circuitBreaker.failureCount} failures`);
          // Schedule circuit breaker reset
          setTimeout(() => {
            circuitBreaker.isOpen = false;
            circuitBreaker.failureCount = 0;
            logger.info('Circuit breaker reset');
          }, circuitBreaker.resetTimeout);
        }
        
        // Remove from queue and reject
        requestQueue.shift();
        reject(error);
      }
    }
  } finally {
    isProcessingQueue = false;
    // Process next item in queue if any
    if (requestQueue.length > 0) {
      process.nextTick(processQueue);
    }
  }
}

/**
 * Add a request to the queue with rate limiting
 * @param {Function} fn - The function to execute
 * @param {string} endpoint - The API endpoint being called
 * @returns {Promise<any>} The result of the function
 */
function enqueueRequest(fn, endpoint = 'default') {
  return new Promise((resolve, reject) => {
    requestQueue.push({ 
      resolve, 
      reject, 
      fn, 
      endpoint,
      retryCount: 0,
      queuedAt: Date.now()
    });
    processQueue();
  });
}

/**
 * Update rate limit information from response headers
 * @param {Headers} headers - Response headers
 * @param {string} endpoint - The API endpoint being called
 */
function updateRateLimits(headers, endpoint = 'default') {
  if (!rateLimits.has(endpoint)) {
    rateLimits.set(endpoint, {
      remaining: RATE_LIMIT.MAX_REQUESTS,
      reset: Date.now() + RATE_LIMIT.WINDOW_MS,
      lastRequest: 0,
      retryCount: 0,
    });
  }
  
  const limit = rateLimits.get(endpoint);
  
  // Update from headers if available
  const remaining = parseInt(headers.get('x-ratelimit-remaining'), 10);
  const reset = parseInt(headers.get('x-ratelimit-reset'), 10) * 1000; // Convert to ms
  
  if (!isNaN(remaining)) {
    limit.remaining = remaining;
  }
  
  if (!isNaN(reset)) {
    limit.reset = reset;
  } else if (limit.reset < Date.now()) {
    // Reset window if expired
    limit.reset = Date.now() + RATE_LIMIT.WINDOW_MS;
    limit.remaining = RATE_LIMIT.MAX_REQUESTS - 1; // Account for this request
  } else {
    limit.remaining = Math.max(0, limit.remaining - 1);
  }
  
  limit.lastRequest = Date.now();
  
  logger.debug(`Rate limits for ${endpoint}: ${limit.remaining} remaining, resets in ${Math.ceil((limit.reset - Date.now()) / 1000)}s`);
}

/**
 * Make an authenticated request to OpenSea API with retry and fallback
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Request options
 * @param {number} options.retryCount - Current retry attempt
 * @returns {Promise<Object>} API response data
 */
async function makeOpenSeaRequest(endpoint, options = {}) {
  const { retryCount = 0, maxRetries = RATE_LIMIT.MAX_RETRIES, ...requestOptions } = options;
  
  const requestFn = async () => {
    try {
      const response = await fetch(`${OPENSEA_API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          ...DEFAULT_HEADERS,
          ...(requestOptions.headers || {})
        },
        ...requestOptions
      });
      
      // Update rate limit info from headers with the specific endpoint
      updateRateLimits(response.headers, endpoint);
      
      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.status = response.status;
        
        // Handle rate limits
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
          logger.warn(`Rate limited. Waiting ${retryAfter} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          throw error; // Will trigger a retry
        }
        
        // Handle 404s gracefully
        if (response.status === 404) {
          logger.debug(`Resource not found: ${endpoint}`);
          return null;
        }
        
        throw error;
      }
      
      const data = await response.json();
      
      // Handle empty or invalid responses
      if (!data) {
        throw new Error('Empty response from OpenSea API');
      }
      
      return data;
    } catch (error) {
      logger.error(`OpenSea API Error (${endpoint}):`, error.message);
      
      // Only retry on network errors or server errors (5xx)
      const isServerError = !error.status || (error.status >= 500 && error.status < 600);
      
      if (isServerError && retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Exponential backoff with max 30s
        logger.warn(`Retrying ${endpoint} (${retryCount + 1}/${maxRetries}) in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeOpenSeaRequest(endpoint, { ...options, retryCount: retryCount + 1 });
      }
      
      // Return a fallback response for known collections
      if (endpoint.startsWith('/collection/')) {
        const address = endpoint.split('/').pop();
        const knownCollection = KNOWN_COLLECTIONS[address];
        if (knownCollection) {
          logger.warn(`Using fallback data for ${knownCollection.name}`);
          return { collection: knownCollection };
        }
      }
      
      // If we get here, all retries failed or it's a non-retryable error
      throw error;
    }
  };
  
  // Enqueue the request to handle rate limiting
  return enqueueRequest(requestFn);
}

/**
 * Get complete OpenSea data for a contract including collection, stats, sales, offers, and more
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<Object>} Complete OpenSea data for the contract
 */
export const getOpenSeaData = async (contractAddress) => {
  // Handle case where contractAddress might be an object
  let address = contractAddress;
  if (typeof contractAddress === 'object' && contractAddress !== null) {
    // Try to extract address from common property names
    address = contractAddress.address || contractAddress.contractAddress || contractAddress.contract_address;
    
    if (!address) {
      logger.warn('Received object without address property:', JSON.stringify(contractAddress));
      throw new Error('No valid address found in the provided object');
    }
  }

  // Validate contract address exists
  if (!address) {
    throw new Error('No contract address provided');
  }

  // Ensure address is a string and normalize it
  const normalizedAddress = String(address).toLowerCase().trim();
  
  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
    throw new Error(`Invalid Ethereum address format: ${normalizedAddress}`);
  }

  const cacheKey = `opensea_full_${normalizedAddress}`;
  
  // Check for existing active request
  if (activeRequests.has(cacheKey)) {
    logger.debug(`Reusing existing request for ${normalizedAddress}`);
    return activeRequests.get(cacheKey);
  }
  
  // Create a new request promise
  const requestPromise = (async () => {
    try {
      // Check rate limits before making requests
      await checkRateLimit('getOpenSeaData');
      
      // Check cache after rate limiting
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
      
      const startTime = Date.now();
      
      // Fetch all data in parallel with individual error boundaries
      const [
        collection,
        stats,
        sales,
        offers,
        owners,
        events,
        traits
      ] = await Promise.all([
        getCollection(normalizedAddress).catch(error => {
          logger.warn(`Error fetching collection for ${normalizedAddress}:`, error.message);
          return null;
        }),
        getCollectionStats(normalizedAddress).catch(error => {
          logger.warn(`Error fetching stats for ${normalizedAddress}:`, error.message);
          return null;
        }),
        getRecentSales(normalizedAddress, 100).catch(error => {
          logger.warn(`Error fetching sales for ${normalizedAddress}:`, error.message);
          return [];
        }),
        getOffers(normalizedAddress).catch(error => {
          logger.warn(`Error fetching offers for ${normalizedAddress}:`, error.message);
          return [];
        }),
        getOwners(normalizedAddress).catch(error => {
          logger.warn(`Error fetching owners for ${normalizedAddress}:`, error.message);
          return [];
        }),
        getEvents(normalizedAddress).catch(error => {
          logger.warn(`Error fetching events for ${normalizedAddress}:`, error.message);
          return [];
        }),
        getCollectionTraits(normalizedAddress).catch(error => {
          logger.warn(`Error fetching traits for ${normalizedAddress}:`, error.message);
          return {};
        })
      ]);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Process the data into a consistent format
      const result = {
        collection: collection || {},
        stats: stats || {},
        sales: sales || [],
        offers: offers || [],
        owners: owners || [],
        events: events || [],
        traits: traits || {},
        processingTime: `${processingTime}ms`,
        timestamp: new Date().toISOString(),
        contractAddress: normalizedAddress,
        _metadata: {
          fetchedAt: new Date().toISOString(),
          fetchDuration: processingTime,
          source: 'opensea_api'
        }
      };
      
      // Cache the result
      cache.set(cacheKey, result, CACHE_DURATION);
      
      logger.debug(`Fetched OpenSea data for ${normalizedAddress} in ${processingTime}ms`);
      return result;
    } catch (error) {
      logger.error(`Error in OpenSea request for ${normalizedAddress}:`, error);
      throw error;
    } finally {
      // Clean up the active request
      activeRequests.delete(cacheKey);
    }
  })();
  
  // Store the promise for potential reuse
  activeRequests.set(cacheKey, requestPromise);
  
  return requestPromise;
};

/**
 * Get collection statistics with enhanced data
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Collection statistics with additional metrics
 */
export const getCollectionStats = async (contractAddress) => {
  try {
    // First try to get collection slug
    let slug = '';
    let collectionData = null;
    
    // Try to get collection data first
    try {
      collectionData = await getOpenSeaData(contractAddress);
      if (collectionData?.collection?.slug) {
        slug = collectionData.collection.slug;
      } else if (KNOWN_COLLECTIONS[contractAddress.toLowerCase()]?.slug) {
        slug = KNOWN_COLLECTIONS[contractAddress.toLowerCase()].slug;
      } else {
        throw new Error('No collection slug found');
      }
    } catch (error) {
      logger.warn(`Failed to get collection data for ${contractAddress}:`, error.message);
      // Continue with empty slug to try other methods
    }
    
    let stats = {};
    
    // Try to get stats by slug first
    if (slug) {
      try {
        const statsData = await makeOpenSeaRequest(`/collection/${slug}/stats`);
        if (statsData?.stats) {
          stats = statsData.stats;
        }
      } catch (error) {
        logger.debug(`Failed to get stats by slug ${slug}:`, error.message);
      }
    }
    
    // If no stats from slug, try to calculate from recent sales
    if (Object.keys(stats).length === 0) {
      try {
        const recentSales = await getRecentSales(contractAddress, 100);
        if (recentSales.length > 0) {
          // Calculate basic stats from recent sales
          const prices = recentSales
            .map(sale => parseFloat(sale.total_price) / (10 ** (sale.payment_token?.decimals || 18)))
            .filter(price => price > 0);
          
          if (prices.length > 0) {
            stats = {
              one_day_volume: prices.reduce((sum, price) => sum + price, 0) / prices.length * 24, // Estimate
              one_day_change: 0,
              one_day_sales: prices.length,
              one_day_average_price: prices.reduce((sum, price) => sum + price, 0) / prices.length,
              seven_day_volume: prices.reduce((sum, price) => sum + price, 0) * 7, // Estimate
              seven_day_change: 0,
              seven_day_sales: prices.length * 7, // Estimate
              seven_day_average_price: prices.reduce((sum, price) => sum + price, 0) / prices.length,
              thirty_day_volume: prices.reduce((sum, price) => sum + price, 0) * 30, // Estimate
              thirty_day_change: 0,
              thirty_day_sales: prices.length * 30, // Estimate
              thirty_day_average_price: prices.reduce((sum, price) => sum + price, 0) / prices.length,
              total_volume: prices.reduce((sum, price) => sum + price, 0) * 30, // Estimate
              total_sales: prices.length * 30, // Estimate
              total_supply: 0, // Will be updated below
              count: 0, // Will be updated below
              num_owners: 0, // Will be updated below
              average_price: prices.reduce((sum, price) => sum + price, 0) / prices.length,
              num_reports: 0,
              market_cap: 0, // Will be updated below
              floor_price: Math.min(...prices)
            };
          }
        }
      } catch (error) {
        logger.warn(`Failed to calculate stats from sales for ${contractAddress}:`, error.message);
      }
    }
    
    // Add additional metadata if we have collection data
    if (collectionData?.collection) {
      stats = {
        ...stats,
        name: collectionData.collection.name,
        description: collectionData.collection.description,
        image_url: collectionData.collection.image_url,
        banner_image_url: collectionData.collection.banner_image_url,
        external_url: collectionData.collection.external_url,
        twitter_username: collectionData.collection.twitter_username,
        discord_url: collectionData.collection.discord_url,
        telegram_url: collectionData.collection.telegram_url,
        instagram_username: collectionData.collection.instagram_username,
        wiki_url: collectionData.collection.wiki_url,
        is_nsfw: collectionData.collection.is_nsfw || false,
        created_date: collectionData.collection.created_date,
        dev_seller_fee_basis_points: collectionData.collection.dev_seller_fee_basis_points || 0,
        dev_buyer_fee_basis_points: collectionData.collection.dev_buyer_fee_basis_points || 0,
        opensea_seller_fee_basis_points: collectionData.collection.opensea_seller_fee_basis_points || 250,
        opensea_buyer_fee_basis_points: collectionData.collection.opensea_buyer_fee_basis_points || 0,
        is_rarity_enabled: collectionData.collection.is_rarity_enabled || false,
        is_creator_fees_enforced: collectionData.collection.is_creator_fees_enforced || false
      };
      
      // Update counts if available
      if (collectionData.collection.stats) {
        stats = {
          ...stats,
          total_supply: collectionData.collection.stats.total_supply || stats.total_supply || 0,
          count: collectionData.collection.stats.count || stats.count || 0,
          num_owners: collectionData.collection.stats.num_owners || stats.num_owners || 0,
          market_cap: (stats.floor_price || 0) * (collectionData.collection.stats.total_supply || 0)
        };
      }
    }
    
    return stats;
  } catch (error) {
    logger.error(`Error in getCollectionStats for ${contractAddress}:`, error);
    throw error;
  }
};

/**
 * Get collection owners with their token counts
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Array>} Array of owner data
 */
async function getOwners(contractAddress) {
  const normalizedAddress = contractAddress.toLowerCase();
  
  try {
    const owners = [];
    let cursor = '';
    let hasMore = true;
    let page = 0;
    const maxPages = 10; // Limit to 10 pages to avoid rate limits
    
    while (hasMore && page < maxPages) {
      const params = {
        limit: 50,
        order_by: 'sale_count',
        order_direction: 'desc'
      };
      
      if (cursor) {
        params.cursor = cursor;
      }
      
      const response = await makeOpenSeaRequest(
        `/assets`,
        {
          params: {
            ...params,
            asset_contract_address: normalizedAddress,
            order_direction: 'desc',
            offset: page * 50,
            limit: 50
          }
        }
      );
      
      if (!response || !response.assets || !Array.isArray(response.assets)) {
        logger.warn(`[${normalizedAddress}] Invalid response format for owners`);
        break;
      }
      
      // Process owners from assets
      const assetOwners = response.assets
        .filter(asset => asset.owner)
        .map(asset => ({
          address: asset.owner.address,
          profile_img_url: asset.owner.profile_img_url,
          user: asset.owner.user
        }));
      
      owners.push(...assetOwners);
      
      // Check if we have more pages
      if (response.next) {
        cursor = response.next;
        page++;
      } else {
        hasMore = false;
      }
      
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Count unique owners
    const ownerCounts = owners.reduce((acc, owner) => {
      acc[owner.address] = (acc[owner.address] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array of { address, count, profile_img_url }
    const uniqueOwners = Object.entries(ownerCounts).map(([address, count]) => {
      const ownerData = owners.find(o => o.address === address);
      return {
        address,
        count,
        profile_img_url: ownerData?.profile_img_url || null,
        user: ownerData?.user || null
      };
    });
    
    // Sort by count descending
    return uniqueOwners.sort((a, b) => b.count - a.count);
    
  } catch (error) {
    logger.error(`[${normalizedAddress}] Error fetching owners:`, error.message);
    return [];
  }
};

/**
 * Get current offers for a collection
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Array>} Array of current offers
 */
async function getOffers(contractAddress) {
  const normalizedAddress = contractAddress.toLowerCase();
  
  try {
    // First try the v2 API
    const response = await makeOpenSeaRequest(
      `/events`,
      {
        params: {
          asset_contract_address: normalizedAddress,
          event_type: 'offer_entered',
          only_opensea: 'false',
          limit: 50,
          order_by: 'created_date',
          order_direction: 'desc'
        }
      }
    );
    
    if (!response || !response.asset_events || !Array.isArray(response.asset_events)) {
      logger.warn(`[${normalizedAddress}] Invalid response format for offers from v2 API`);
      
      // Fallback to v1 API
      const v1Response = await makeOpenSeaRequest(
        `/asset_contract/${normalizedAddress}/offers`,
        {
          limit: 50,
          order_by: 'created_date',
          order_direction: 'desc'
        }
      );
      
      if (!v1Response || !Array.isArray(v1Response.offers)) {
        logger.warn(`[${normalizedAddress}] Invalid response format for offers from v1 API`);
        return [];
      }
      
      // Format v1 response
      return v1Response.offers.map(offer => ({
        id: offer.id,
        created_date: offer.created_date,
        from_account: offer.maker,
        bid_amount: offer.current_price,
        payment_token: offer.payment_token_contract,
        quantity: offer.quantity || '1',
        expiration_time: offer.expiration_time
      }));
    }
    
    // Process v2 response
    const offers = response.asset_events
      .filter(event => event.bid_amount && event.from_account)
      .map(event => ({
        id: event.id,
        created_date: event.created_date || new Date().toISOString(),
        from_account: event.from_account,
        bid_amount: event.bid_amount,
        payment_token: event.payment_token || {
          symbol: 'ETH',
          decimals: 18,
          address: '0x0000000000000000000000000000000000000000'
        },
        quantity: event.quantity || '1',
        expiration_time: event.expiration_time || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Default 30 days
      }));
    
    return offers;
    
  } catch (error) {
    logger.error(`[${normalizedAddress}] Error fetching offers:`, error.message);
    return [];
  }
}

/**
 * Get recent events for a collection
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Array>} Array of recent events
 */
async function getEvents(contractAddress) {
  const normalizedAddress = contractAddress.toLowerCase();
  
  try {
    // First try the v2 API
    const response = await makeOpenSeaRequest(
      `/events`,
      {
        params: {
          asset_contract_address: normalizedAddress,
          event_type: ['successful', 'created', 'cancelled', 'bid_entered', 'bid_withdrawn', 'transfer'],
          only_opensea: 'false',
          limit: 50,
          offset: 0,
          order_by: 'created_date',
          order_direction: 'desc'
        }
      }
    );
    
    if (!response || !response.asset_events || !Array.isArray(response.asset_events)) {
      logger.warn(`[${normalizedAddress}] Invalid response format for events from v2 API`);
      
      // Fallback to v1 API
      const v1Response = await makeOpenSeaRequest(
        `/events`,
        {
          asset_contract_address: normalizedAddress,
          event_type: 'successful',
          only_opensea: 'true',
          limit: 50,
          offset: 0
        }
      );
      
      if (!v1Response || !v1Response.asset_events || !Array.isArray(v1Response.asset_events)) {
        logger.warn(`[${normalizedAddress}] Invalid response format for events from v1 API`);
        return [];
      }
      
      // Format v1 response
      return v1Response.asset_events.map(event => ({
        id: event.id,
        event_type: event.event_type,
        created_date: event.created_date || new Date().toISOString(),
        from_account: event.from_account,
        to_account: event.to_account,
        seller: event.seller,
        winner_account: event.winner_account,
        total_price: event.total_price || '0',
        payment_token: event.payment_token || {
          symbol: 'ETH',
          decimals: 18,
          address: '0x0000000000000000000000000000000000000000'
        },
        quantity: event.quantity || '1',
        asset: event.asset || {}
      }));
    }
    
    // Process v2 response
    const events = response.asset_events.map(event => ({
      id: event.id,
      event_type: event.event_type,
      created_date: event.created_date || new Date().toISOString(),
      from_account: event.from_account,
      to_account: event.to_account,
      seller: event.seller,
      winner_account: event.winner_account,
      total_price: event.total_price || '0',
      payment_token: event.payment_token || {
        symbol: 'ETH',
        decimals: 18,
        address: '0x0000000000000000000000000000000000000000'
      },
      quantity: event.quantity || '1',
      asset: event.asset || {}
    }));
    
    return events;
    
  } catch (error) {
    logger.error(`[${normalizedAddress}] Error fetching events:`, error.message);
    return [];
  }
}

/**
 * Get detailed collection data including stats from OpenSea
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Collection data with stats
 */
async function getCollectionWithStats(contractAddress) {
  const normalizedAddress = contractAddress.toLowerCase();
  
  try {
    // First try to get the collection data
    const collectionResponse = await makeOpenSeaRequest(`/collection/${normalizedAddress}`);
    
    if (collectionResponse && collectionResponse.collection) {
      return collectionResponse.collection;
    }
    
    // Fallback to contract data if collection not found
    const contractResponse = await makeOpenSeaRequest(`/asset_contract/${normalizedAddress}`);
    
    if (contractResponse) {
      return {
        name: contractResponse.name,
        description: contractResponse.description,
        image_url: contractResponse.image_url,
        external_link: contractResponse.external_link,
        stats: {
          floor_price: 0,
          one_day_volume: 0,
          one_day_change: 0,
          one_day_sales: 0,
          total_volume: 0,
          total_supply: 0,
          num_owners: 0,
          average_price: 0,
          market_cap: 0
        }
      };
    }
    
    return null;
  } catch (error) {
    logger.error(`Error fetching collection with stats for ${normalizedAddress}:`, error);
    return null;
  }
};

/**
 * Get collection data from OpenSea
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Collection data
 */

// Track request counts for rate limiting
const requestCounts = new Map();
const REQUEST_WINDOW_MS = 60000; // 1 minute window for rate limiting
const MAX_REQUESTS_PER_WINDOW = 30; // Max requests per minute

// Track last error time for circuit breaking
const lastErrorTime = new Map();
const CIRCUIT_BREAKER_MS = 30000; // 30 seconds circuit breaker

/**
 * Get collection data from OpenSea with fallback to known collections
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Collection data
 */
export const getCollection = async (contractAddress) => {
  const normalizedAddress = contractAddress.toLowerCase();
  const cacheKey = `collection_${normalizedAddress}`;
  
  // Return early for known collections
  if (KNOWN_COLLECTIONS[normalizedAddress]) {
    logger.debug(`Using known collection data for ${normalizedAddress}`);
    return KNOWN_COLLECTIONS[normalizedAddress];
  }
  
  // Check cache first
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // Check for existing active request to prevent duplicate API calls
  if (activeRequests.has(cacheKey)) {
    logger.debug(`Reusing existing collection request for ${normalizedAddress}`);
    return activeRequests.get(cacheKey);
  }
  
  const requestPromise = (async () => {
    try {
      // Use enqueueRequest to handle rate limiting
      const response = await enqueueRequest(
        () => makeOpenSeaRequest(`/asset_contract/${normalizedAddress}`),
        `asset_contract_${normalizedAddress}`
      );
      
      if (!response || !response.collection) {
        throw new Error('Invalid response format from OpenSea API');
      }
      
      const collectionData = {
        ...response.collection,
        contractAddress: normalizedAddress,
        _fetchedAt: new Date().toISOString(),
        _source: 'opensea_api'
      };
      
      // Cache the result with a shorter TTL for dynamic data
      addToCache(cacheKey, collectionData, 5 * 60 * 1000); // 5 minutes
      
      return collectionData;
    } catch (error) {
      logger.warn(`Error fetching collection for ${normalizedAddress}: ${error.message}`, {
        stack: error.stack,
        code: error.code,
        status: error.status
      });
      
      // Check cache for stale data first
      const cached = getFromCache(`collection_fallback_${normalizedAddress}`);
      if (cached) {
        logger.debug(`Using cached fallback data for ${normalizedAddress}`);
        return { ...cached, _stale: true };
      }
      
      // Return a minimal valid response structure on error
      const fallbackData = {
        name: `Collection ${normalizedAddress.slice(0, 8)}...`,
        description: 'Collection data could not be loaded',
        image_url: '',
        external_url: '',
        contractAddress: normalizedAddress,
        _error: error.message,
        _cachedAt: new Date().toISOString()
      };
      
      // Cache the fallback data with a short TTL
      addToCache(`collection_fallback_${normalizedAddress}`, fallbackData, 5 * 60 * 1000);
      
      return fallbackData;
    } finally {
      // Clean up the active request
      activeRequests.delete(cacheKey);
    }
  })();
  
  // Store the promise for potential reuse
  activeRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

/**
 * Get collection stats from OpenSea
 * @param {string} contractAddress - Contract address
 * @returns {Promise<Object>} Collection stats
 */
// This function is already defined earlier in the file

/**
 * Get recent sales for a collection with enhanced error handling and caching
 * @param {string} contractAddress - Contract address
 * @param {number} limit - Maximum number of sales to return (max 300)
 * @returns {Promise<Array>} Array of recent sales with formatted data
 */
/**
 * Get recent sales for a collection with enhanced error handling and caching
 * @param {string} contractAddress - Contract address
 * @param {number} limit - Maximum number of sales to return (max 50)
 * @returns {Promise<Array>} Array of recent sales with formatted data
 */
export const getRecentSales = async (contractAddress, limit = 5) => {
  const normalizedAddress = contractAddress.toLowerCase();
  const cacheKey = `sales_${normalizedAddress}_${limit}`;
  const endpoint = `events_collection_${normalizedAddress}`;
  
  // Check cache first
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // Check for existing active request
  if (activeRequests.has(cacheKey)) {
    logger.debug(`Reusing existing sales request for ${normalizedAddress}`);
    return activeRequests.get(cacheKey);
  }
  
  const requestPromise = (async () => {
    try {
      logger.debug(`Fetching recent sales for ${normalizedAddress}`);
      
      // Use enqueueRequest to handle rate limiting
      const response = await enqueueRequest(
        () => makeOpenSeaRequest(
          `/events/collection/${normalizedAddress}`,
          {
            params: {
              event_type: 'successful',
              only_opensea: 'false',
              offset: 0,
              limit: Math.min(limit, 50) // Enforce max limit
            }
          }
        ),
        endpoint
      );
      
      if (!response || !Array.isArray(response.asset_events)) {
        throw new Error('Invalid response format for sales data');
      }
      
      const sales = (response.asset_events || []).map(event => ({
        id: event.id,
        timestamp: event.created_date,
        tokenId: event.asset?.token_id || null,
        price: event.total_price ? parseFloat(ethers.utils.formatEther(event.total_price)) : 0,
        priceUsd: event.payment_token?.usd_price ? 
          parseFloat(event.payment_token.usd_price) * 
          parseFloat(ethers.utils.formatEther(event.total_price || '0')) : 0,
        paymentToken: event.payment_token?.symbol || 'ETH',
        from: event.from_account?.address || null,
        to: event.to_account?.address || null,
        transaction: event.transaction?.transaction_hash || null,
        _source: 'opensea_api'
      }));
      
      // Cache the result with a short TTL for dynamic data
      addToCache(cacheKey, sales, 2 * 60 * 1000); // Cache for 2 minutes
      
      return sales;
    } catch (error) {
      logger.warn(`Error fetching sales for ${normalizedAddress}: ${error.message}`, {
        stack: error.stack,
        code: error.code,
        status: error.status
      });
      
      // Check for cached fallback data
      const cachedFallback = getFromCache(`sales_fallback_${normalizedAddress}`);
      if (cachedFallback) {
        logger.debug(`Using cached fallback sales data for ${normalizedAddress}`);
        return cachedFallback;
      }
      
      // Return empty array as final fallback
      const fallbackData = [];
      
      // Cache the empty result with a short TTL
      addToCache(`sales_fallback_${normalizedAddress}`, fallbackData, 5 * 60 * 1000);
      
      return fallbackData;
    } finally {
      // Clean up the active request
      activeRequests.delete(cacheKey);
    }
  })();
  
  // Store the promise for potential reuse
  activeRequests.set(cacheKey, requestPromise);
  return requestPromise;
};

/**
 * Get floor price history for a collection
 * @param {string} contractAddress - Contract address
 * @param {string} timeFrame - Time frame for history (1d, 7d, 30d, all)
 * @returns {Promise<Array>} Array of historical floor prices
 */
export const getFloorPriceHistory = async (contractAddress, timeFrame = '7d') => {
  const startTime = Date.now();
  
  // Validate contract address
  if (typeof contractAddress !== 'string' || !contractAddress) {
    logger.warn('No contract address provided to getFloorPriceHistory or invalid type');
    return [];
  }

  // Ensure contractAddress is a string and normalize it
  const normalizedAddress = String(contractAddress).toLowerCase().trim();
  
  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
    logger.warn(`Invalid Ethereum address format provided to getFloorPriceHistory: ${typeof contractAddress}`, { contractAddress });
    return [];
  }

  const cacheKey = `floor_history:${normalizedAddress}:${timeFrame}`;
  
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
  
  // Validate contract address
  if (typeof contractAddress !== 'string' || !contractAddress) {
    logger.warn('No contract address provided to getSimilarCollections or invalid type');
    return [];
  }

  // Ensure contractAddress is a string and normalize it
  const normalizedAddress = String(contractAddress).toLowerCase().trim();
  
  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
    logger.warn(`Invalid Ethereum address format provided to getSimilarCollections: ${typeof contractAddress}`, { contractAddress });
    return [];
  }

  const cacheKey = `similar:${normalizedAddress}`;
  
  try {
    logger.debug(`Finding similar collections for contract: ${contractAddress}`);
    
    // Get collection data to find the slug
    const collectionData = await getOpenSeaData(contractAddress).catch(error => {
      logger.warn(`Error getting collection data for similar collections: ${error.message}`);
      return null;
    });
    
    // If we don't have a slug, return empty array as we can't find similar collections
    if (!collectionData?.slug) {
      logger.warn(`No collection slug found for contract: ${contractAddress}, cannot find similar collections`);
      return [];
    }
    
    // Try to get similar collections from OpenSea
    let similarResponse;
    try {
      similarResponse = await makeOpenSeaRequest(`/collections/${collectionData.slug}/similar`);
      
      if (similarResponse?.collections?.length) {
        const similar = similarResponse.collections.map(collection => ({
          address: collection.address,
          name: collection.name,
          slug: collection.slug,
          image_url: collection.image_url,
          stats: collection.stats || {
            total_volume: 0,
            total_supply: 0,
            count: 0,
            num_owners: 0,
            floor_price: 0,
            _source: 'fallback'
          },
          _source: 'opensea',
          _score: collection.score || 0,
          _isFallback: !collection.stats
        }));
        
        logger.info(`Found ${similar.length} similar collections for ${collectionData.slug} in ${Date.now() - startTime}ms`);
        return similar;
      }
    } catch (error) {
      logger.warn('Error fetching similar collections from OpenSea:', error.message);
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
 * Get traits for a collection with improved error handling
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<Object>} Collection traits data
 */
export const getCollectionTraits = async (contractAddress) => {
  const startTime = Date.now();
  
  // Validate input
  if (!contractAddress) {
    logger.warn('No contract address provided to getCollectionTraits');
    return { stats: {}, traits: {} };
  }
  
  // Ensure contractAddress is a string and normalize it
  const normalizedAddress = String(contractAddress).toLowerCase().trim();
  
  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
    logger.warn(`[${normalizedAddress}] Invalid Ethereum address format in getCollectionTraits`);
    return { stats: {}, traits: {} };
  }
  
  const cacheKey = `traits:${normalizedAddress}`;
  
  try {
    logger.debug(`Fetching traits for contract: ${contractAddress}`);
    
    // Get collection data to find the slug
    const collectionData = await getOpenSeaData(contractAddress).catch(error => {
      logger.warn(`Error getting collection data for traits: ${error.message}`);
      return null;
    });
    
    // If we don't have a slug, try to use the contract address directly
    const slugOrAddress = collectionData?.slug || contractAddress.toLowerCase();
    
    if (!collectionData?.slug) {
      logger.warn(`No collection slug found for contract: ${contractAddress}, using contract address`);
    }
    
    // Get traits from OpenSea with error handling
    let traitsResponse;
    try {
      traitsResponse = await makeOpenSeaRequest(`/collection/${slugOrAddress}/traits`);
    } catch (error) {
      logger.warn(`Error fetching traits for ${slugOrAddress}:`, error.message);
      traitsResponse = { traits: {} };
    }
    
    // Ensure we have a valid traits object
    if (!traitsResponse?.traits) {
      logger.warn(`No traits found for collection: ${slugOrAddress}`);
      traitsResponse = { traits: {} };
    }
    
    const traits = {
      ...traitsResponse,
      traits: traitsResponse.traits || {},
      _source: collectionData?._source || 'fallback',
      _updatedAt: new Date().toISOString(),
      _processingTimeMs: Date.now() - startTime,
      _warnings: [
        ...(collectionData?._warnings || []),
        ...(traitsResponse.traits ? [] : ['No traits data available from API'])
      ].filter(Boolean)
    };
    
    logger.info(`Fetched ${Object.keys(traits.traits).length} trait types for ${collectionData?.slug || slugOrAddress} in ${Date.now() - startTime}ms`);
    return traits;
    
  } catch (error) {
    // Log the error with context
    const errorMessage = `[${normalizedAddress}] Error in getCollectionTraits: ${error.message}`;
    
    // Don't log 404s as errors since they're expected for collections without traits
    if (error.message.includes('404')) {
      logger.debug(errorMessage);
    } else {
      logger.error(errorMessage, { 
        stack: error.stack,
        contractAddress: normalizedAddress 
      });
    }
    
    // Return empty traits object to allow graceful degradation
    return { stats: {}, traits: {} };
  }
};