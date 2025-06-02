/**
 * NFT Item Analysis Module
 * Analyzes individual NFT items within a collection, focusing on rarity, traits, and value
 * using real blockchain data with fallback mechanisms
 */

import { ethers } from 'ethers';
import { getContractData, getTokenMetadata } from '../../blockchain/ethereum/contractReader.js';
import { getOpenSeaData, getRecentSales } from '../../services/openSeaService.js';
import dataIntegrityService from '../../services/dataIntegrityService.js';

// Cache for storing analysis results
const analysisCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// Default values for missing data
const DEFAULT_NFT_ITEM = {
  name: 'Unnamed NFT',
  description: 'No description available',
  image: null,
  attributes: [],
  rarity: 'common',
  lastSale: null,
  price: {
    current: null,
    currency: 'ETH',
    source: 'none',
    timestamp: new Date().toISOString()
  },
  _status: {
    isFallback: true,
    lastUpdated: new Date().toISOString(),
    warnings: ['Using fallback data - no metadata available']
  }
};

/**
 * Analyze NFT items within a collection with enhanced error handling
 * @param {Object} contractData - Contract data from blockchain
 * @param {number} sampleSize - Number of items to analyze (default: 10)
 * @returns {Promise<Object>} NFT items analysis results with fallback data
 */
export const analyzeItems = async (contractData, sampleSize = 10) => {
  const startTime = Date.now();
  const cacheKey = `items-${contractData?.address}-${sampleSize}`;
  
  // Check cache first
  if (analysisCache.has(cacheKey)) {
    const { timestamp, data } = analysisCache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      console.log(`Returning cached analysis for ${contractData?.address}`);
      return { ...data, _cached: true };
    }
  }

  try {
    if (!contractData) {
      throw new Error('Contract data is required');
    }
    
    // Handle non-contract addresses
    if (contractData.isContract === false) {
      const result = {
        ...DEFAULT_NFT_ITEM,
        tokenId: 'n/a',
        name: 'Non-Contract Address',
        description: 'Not an NFT',
        _status: {
          ...DEFAULT_NFT_ITEM._status,
          warnings: [
            'This address does not contain contract code. NFT analysis is limited.',
            `Address balance: ${contractData.balance || 'Unknown'} ETH`,
            'This may be a regular wallet address or an externally owned account (EOA).'
          ]
        }
      };
      
      // Cache the result
      analysisCache.set(cacheKey, {
        timestamp: Date.now(),
        data: result
      });
      
      return result;
    }
    
    // Handle non-NFT contracts
    if (contractData.type === 'other-contract') {
      const result = {
        ...DEFAULT_NFT_ITEM,
        tokenId: 'n/a',
        name: contractData.name || 'Unknown Contract',
        description: 'Non-NFT Smart Contract',
        _status: {
          ...DEFAULT_NFT_ITEM._status,
          warnings: [
            'This is a smart contract but not a standard NFT contract.',
            'It does not implement ERC721 or ERC1155 interfaces.',
            'NFT token analysis is not applicable for this contract type.'
          ]
        }
      };
      
      // Cache the result
      analysisCache.set(cacheKey, {
        timestamp: Date.now(),
        data: result
      });
      
      return result;
    }
    
    // Get sample of NFT items for analysis with error handling
    let items = [];
    try {
      items = await getSampleItems(contractData, sampleSize);
    } catch (error) {
      console.error('Error fetching NFT items:', error);
      // Fallback to default items if we can't fetch any
      items = Array(sampleSize).fill(null).map((_, i) => ({
        ...DEFAULT_NFT_ITEM,
        tokenId: i.toString(),
        _status: {
          ...DEFAULT_NFT_ITEM._status,
          warnings: [
            'Failed to fetch NFT items from the contract',
            'Using placeholder data',
            `Error: ${error.message}`
          ]
        }
      }));
    }
    
    // Ensure we have the requested number of items
    while (items.length < sampleSize) {
      items.push({
        ...DEFAULT_NFT_ITEM,
        tokenId: `placeholder-${items.length}`,
        _status: {
          ...DEFAULT_NFT_ITEM._status,
          warnings: ['Placeholder item - could not fetch enough items from contract']
        }
      });
    }
    
    // Get recent sales for price estimation
    let recentSales = [];
    try {
      recentSales = await getRecentSales(contractData.address, sampleSize * 2);
    } catch (error) {
      console.warn('Could not fetch recent sales:', error.message);
    }
    
    // Analyze traits and rarity across items
    const traitAnalysis = analyzeTraits(items);
    
    // Calculate rarity scores for each item
    const rarityScores = calculateRarityScores(items, traitAnalysis);
    
    // Estimate value for each item based on rarity and recent sales
    const valueEstimates = estimateItemValues(items, rarityScores, {
      ...contractData,
      recentSales
    });
    
    // Combine all data into final result
    const analyzedItems = items.map((item, index) => {
      const rarityScore = rarityScores[index] || 0;
      const rarityTier = getRarityTier(rarityScore);
      
      return {
        ...item,
        rarityScore,
        rarity: rarityTier,
        estimatedValue: valueEstimates[index] || {
          min: null,
          max: null,
          currency: 'ETH',
          confidence: 'low',
          factors: ['No sales data available']
        },
        _status: {
          ...(item._status || DEFAULT_NFT_ITEM._status),
          lastUpdated: new Date().toISOString(),
          isFallback: item._status?.isFallback || false
        }
      };
    });
    
    // Sort items by rarity score (highest first)
    analyzedItems.sort((a, b) => (b.rarityScore || 0) - (a.rarityScore || 0));
    
    const result = {
      contractAddress: contractData.address,
      itemCount: analyzedItems.length,
      items: analyzedItems,
      traitAnalysis,
      _metadata: {
        analyzedAt: new Date().toISOString(),
        analysisTimeMs: Date.now() - startTime,
        sampleSize: Math.min(sampleSize, analyzedItems.length),
        hasFallbackData: analyzedItems.some(item => item._status?.isFallback)
      }
    };
    
    // Cache the result
    analysisCache.set(cacheKey, {
      timestamp: Date.now(),
      data: result
    });
    
    return result;
    
  } catch (error) {
    console.error('Critical error in NFT item analysis:', error);
    
    // Return a meaningful error response
    return {
      ...DEFAULT_NFT_ITEM,
      _status: {
        error: true,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        warnings: ['Critical error during analysis - using fallback data']
      },
      items: Array(sampleSize).fill(null).map((_, i) => ({
        ...DEFAULT_NFT_ITEM,
        tokenId: `error-${i}`,
        _status: {
          ...DEFAULT_NFT_ITEM._status,
          warnings: ['Analysis failed - using fallback data']
        }
      }))
    };
  }
};

/**
 * Convert a rarity score to a tier name
 * @param {number} score - Rarity score (0-1)
 * @returns {string} Rarity tier name
 */
function getRarityTier(score) {
  if (score >= 0.95) return 'mythic';
  if (score >= 0.85) return 'legendary';
  if (score >= 0.7) return 'epic';
  if (score >= 0.5) return 'rare';
  if (score >= 0.3) return 'uncommon';
  return 'common';
}

/**
 * Get a sample of NFT items from the collection
 * @param {Object} contractData - Contract data
 * @param {number} sampleSize - Number of items to sample
 * @returns {Promise<Array>} Sample of NFT items
 */
async function getSampleItems(contractData, sampleSize) {
  try {
    const items = [];
    let totalSupply = 0;
    
    // Try to determine total supply
    if (contractData.openSea && contractData.openSea.stats && contractData.openSea.stats.total_supply) {
      totalSupply = contractData.openSea.stats.total_supply;
    } else {
      // Default to a reasonable number if total supply is unknown
      totalSupply = 100;
    }
    
    // Adjust sample size if it exceeds total supply
    const adjustedSampleSize = Math.min(sampleSize, totalSupply);
    
    // Generate token IDs to sample
    // For a real implementation, you would use a more sophisticated sampling method
    const tokenIds = [];
    
    if (totalSupply <= adjustedSampleSize) {
      // If total supply is small, sample all items
      for (let i = 0; i < totalSupply; i++) {
        tokenIds.push(i);
      }
    } else {
      // Otherwise, sample randomly
      const interval = Math.floor(totalSupply / adjustedSampleSize);
      for (let i = 0; i < adjustedSampleSize; i++) {
        tokenIds.push(Math.floor(Math.random() * totalSupply));
      }
    }
    
    // Fetch metadata for each token ID
    const metadataPromises = tokenIds.map(tokenId => 
      getTokenMetadata(contractData.address, tokenId)
        .catch(error => {
          console.warn(`Error fetching metadata for token ${tokenId}:`, error.message);
          return null;
        })
    );
    
    const metadatas = await Promise.all(metadataPromises);
    
    // Process each metadata
    metadatas.forEach((metadata, index) => {
      if (metadata) {
        items.push({
          tokenId: tokenIds[index].toString(),
          name: metadata.name || `Token #${tokenIds[index]}`,
          description: metadata.description || '',
          image: metadata.image || '',
          attributes: metadata.attributes || [],
          traits: processTraits(metadata.attributes || [])
        });
      }
    });
    
    return items;
  } catch (error) {
    console.error('Error getting sample items:', error);
    return [];
  }
}

/**
 * Process traits from token metadata
 * @param {Array} attributes - Token attributes
 * @returns {Object} Processed traits
 */
function processTraits(attributes) {
  const traits = {};
  
  attributes.forEach(attr => {
    if (attr.trait_type && attr.value !== undefined) {
      traits[attr.trait_type] = attr.value.toString();
    }
  });
  
  return traits;
}

/**
 * Analyze traits across all items
 * @param {Array} items - NFT items
 * @returns {Object} Trait analysis
 */
function analyzeTraits(items) {
  const traitTypes = {};
  const traitCounts = {};
  
  // Count occurrences of each trait type and value
  items.forEach(item => {
    Object.entries(item.traits).forEach(([traitType, traitValue]) => {
      // Initialize trait type if not exists
      if (!traitTypes[traitType]) {
        traitTypes[traitType] = new Set();
        traitCounts[traitType] = {};
      }
      
      // Add trait value to set of values for this trait type
      traitTypes[traitType].add(traitValue);
      
      // Increment count for this trait value
      if (!traitCounts[traitType][traitValue]) {
        traitCounts[traitType][traitValue] = 0;
      }
      traitCounts[traitType][traitValue]++;
    });
  });
  
  // Convert trait types to array of values
  const traitAnalysis = {};
  
  Object.entries(traitTypes).forEach(([traitType, valueSet]) => {
    const values = Array.from(valueSet);
    const valueCounts = {};
    
    values.forEach(value => {
      valueCounts[value] = {
        count: traitCounts[traitType][value],
        frequency: traitCounts[traitType][value] / items.length
      };
    });
    
    traitAnalysis[traitType] = {
      uniqueValues: values.length,
      values: valueCounts
    };
  });
  
  return traitAnalysis;
}

/**
 * Calculate rarity scores for each item
 * @param {Array} items - NFT items
 * @param {Object} traitAnalysis - Trait analysis
 * @returns {Array} Rarity scores
 */
function calculateRarityScores(items, traitAnalysis) {
  return items.map(item => {
    let rarityScore = 0;
    
    // Calculate rarity score based on trait frequencies
    Object.entries(item.traits).forEach(([traitType, traitValue]) => {
      if (traitAnalysis[traitType] && traitAnalysis[traitType].values[traitValue]) {
        const frequency = traitAnalysis[traitType].values[traitValue].frequency;
        // Rarer traits (lower frequency) contribute more to the rarity score
        rarityScore += 1 / frequency;
      }
    });
    
    // Bonus for having more traits than average
    const avgTraitCount = Object.keys(traitAnalysis).length / 2;
    const itemTraitCount = Object.keys(item.traits).length;
    
    if (itemTraitCount > avgTraitCount) {
      rarityScore *= 1 + ((itemTraitCount - avgTraitCount) / avgTraitCount) * 0.5;
    }
    
    return Math.round(rarityScore);
  });
}

/**
 * Estimate values for each item based on rarity
 * @param {Array} items - NFT items
 * @param {Array} rarityScores - Rarity scores
 * @param {Object} contractData - Contract data
 * @returns {Array} Value estimates
 */
function estimateItemValues(items, rarityScores, contractData) {
  // Get base price from contract data
  let basePrice = 0;
  
  if (contractData.openSea && contractData.openSea.stats && contractData.openSea.stats.floor_price) {
    basePrice = contractData.openSea.stats.floor_price;
  } else {
    // Default to a reasonable value if floor price is unknown
    basePrice = 0.01; // 0.01 ETH
  }
  
  // Find min and max rarity scores
  const minRarity = Math.min(...rarityScores);
  const maxRarity = Math.max(...rarityScores);
  const rarityRange = maxRarity - minRarity;
  
  // Calculate value estimates based on rarity scores
  return rarityScores.map(score => {
    if (rarityRange === 0) {
      return basePrice;
    }
    
    // Normalize rarity score to 0-1 range
    const normalizedScore = (score - minRarity) / rarityRange;
    
    // Calculate value multiplier based on normalized score
    // Rarer items (higher score) get higher multipliers
    const multiplier = 1 + (normalizedScore * 4); // 1x to 5x multiplier
    
    return parseFloat((basePrice * multiplier).toFixed(4));
  });
}

/**
 * Get detailed information for a specific NFT item
 * @param {string} contractAddress - Contract address
 * @param {string} tokenId - Token ID
 * @returns {Promise<Object>} Detailed item information
 */
export const getItemDetails = async (contractAddress, tokenId) => {
  try {
    // Get contract data
    const contractData = await getContractData(contractAddress);
    
    // Get token metadata
    const metadata = await getTokenMetadata(contractAddress, tokenId);
    
    if (!metadata) {
      throw new Error(`Unable to fetch metadata for token ${tokenId}`);
    }
    
    // Process item
    const item = {
      tokenId,
      name: metadata.name || `Token #${tokenId}`,
      description: metadata.description || '',
      image: metadata.image || '',
      attributes: metadata.attributes || [],
      traits: processTraits(metadata.attributes || [])
    };
    
    // Get sample items for comparison
    const sampleItems = await getSampleItems(contractData, 20);
    
    // Analyze traits
    const traitAnalysis = analyzeTraits([...sampleItems, item]);
    
    // Calculate rarity score
    const allItems = [...sampleItems, item];
    const rarityScores = calculateRarityScores(allItems, traitAnalysis);
    
    // Get rarity score for the requested item (last in the array)
    const rarityScore = rarityScores[rarityScores.length - 1];
    
    // Estimate value
    const valueEstimates = estimateItemValues(allItems, rarityScores, contractData);
    const estimatedValue = valueEstimates[valueEstimates.length - 1];
    
    // Calculate rarity rank
    const sortedScores = [...rarityScores].sort((a, b) => b - a);
    const rarityRank = sortedScores.indexOf(rarityScore) + 1;
    
    // Calculate rarity percentile
    const rarityPercentile = Math.round((1 - (rarityRank / allItems.length)) * 100);
    
    return {
      ...item,
      rarityScore,
      rarityRank,
      rarityPercentile,
      estimatedValue,
      traitAnalysis: Object.entries(item.traits).map(([traitType, traitValue]) => ({
        traitType,
        traitValue,
        rarity: traitAnalysis[traitType]?.values[traitValue]?.frequency || 0,
        rarityScore: traitAnalysis[traitType]?.values[traitValue]?.frequency ? 1 / traitAnalysis[traitType].values[traitValue].frequency : 0
      }))
    };
  } catch (error) {
    console.error(`Error getting details for token ${tokenId}:`, error);
    throw error;
  }
};