/**
 * Collection Analysis Module
 * Analyzes NFT collection characteristics, rarity, and creator reputation
 * using real blockchain data
 */

import { ethers } from 'ethers';
import { getContractData, getTokenMetadata } from '../../blockchain/ethereum/contractReader.js';
import { getOpenSeaData, getRecentSales } from '../../services/openSeaService.js';

/**
 * Analyze NFT collection
 * @param {Object} contractData - Contract data from blockchain
 * @returns {Promise<Object>} Collection analysis results
 */
export const analyze = async (contractData) => {
  try {
    if (!contractData) {
      throw new Error('Contract data is required');
    }
    
    // Handle non-contract addresses
    if (contractData.isContract === false) {
      return {
        name: 'Non-Contract Address',
        symbol: 'N/A',
        type: 'EOA',
        items: [],
        traits: [],
        rarity: [],
        insights: [
          'This address does not contain contract code. Collection analysis is limited.',
          `Address balance: ${contractData.balance || 'Unknown'} ETH`,
          'This may be a regular wallet address or an externally owned account (EOA).'
        ]
      };
    }
    
    // Handle non-NFT contracts
    if (contractData.type === 'other-contract') {
      return {
        name: contractData.name || 'Unknown Contract',
        symbol: contractData.symbol || 'N/A',
        type: 'Non-NFT Contract',
        items: [],
        traits: [],
        rarity: [],
        insights: [
          'This is a smart contract but not a standard NFT contract.',
          'It does not implement ERC721 or ERC1155 interfaces.',
          'Consider examining the contract code directly for more information.'
        ]
      };
    }
    
    // Extract basic collection information
    const collectionInfo = await extractCollectionInfo(contractData);
    
    // Analyze collection traits and rarity
    const rarityAnalysis = await analyzeRarity(contractData);
    
    // Analyze creator reputation
    const creatorAnalysis = await analyzeCreator(contractData);
    
    // Analyze collection uniqueness
    const uniquenessAnalysis = await analyzeUniqueness(contractData);
    
    // Analyze collection activity
    const activityAnalysis = await analyzeActivity(contractData);
    
    // Calculate overall collection score (0-100)
    const collectionScore = calculateCollectionScore([
      rarityAnalysis,
      creatorAnalysis,
      uniquenessAnalysis,
      activityAnalysis
    ]);
    
    return {
      ...collectionInfo,
      collectionScore,
      components: [
        rarityAnalysis,
        creatorAnalysis,
        uniquenessAnalysis,
        activityAnalysis
      ]
    };
  } catch (error) {
    console.error('Error in collection analysis:', error);
    throw error;
  }
};

/**
 * Extract basic collection information
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Collection information
 */
export const extractCollectionInfo = async (contractData) => {
  try {
    let name = 'Unknown Collection';
    let symbol = '';
    let totalSupply = 0;
    let image = '';
    let description = '';
    let creator = '';
    let creatorName = '';
    let isVerified = false;
    
    // Extract data from contract
    if (contractData.name) {
      name = contractData.name;
    }
    
    if (contractData.symbol) {
      symbol = contractData.symbol;
    }
    
    if (contractData.creator) {
      creator = contractData.creator;
    }
    
    // Use OpenSea data if available
    if (contractData.openSea && contractData.openSea.collection) {
      const collection = contractData.openSea.collection;
      
      if (collection.name) {
        name = collection.name;
      }
      
      if (collection.description) {
        description = collection.description;
      }
      
      if (collection.image_url) {
        image = collection.image_url;
      }
      
      if (collection.stats && collection.stats.total_supply) {
        totalSupply = collection.stats.total_supply;
      }
      
      if (collection.primary_asset_contracts && collection.primary_asset_contracts.length > 0) {
        const contract = collection.primary_asset_contracts[0];
        if (contract.creator) {
          creatorName = contract.creator.user?.username || '';
          isVerified = contract.creator.config === 'verified';
        }
      }
    }
    
    return {
      name,
      symbol,
      description,
      image,
      totalSupply,
      creator,
      creatorName,
      isVerified,
      contractAddress: contractData.address,
      tokenType: contractData.type || 'unknown'
    };
  } catch (error) {
    console.error('Error extracting collection info:', error);
    return {
      name: 'Unknown Collection',
      symbol: '',
      description: '',
      image: '',
      totalSupply: 0,
      creator: '',
      creatorName: '',
      isVerified: false,
      contractAddress: contractData.address,
      tokenType: 'unknown'
    };
  }
}

/**
 * Analyze collection rarity
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Rarity analysis result
 */
export const analyzeRarity = async (contractData) => {
  try {
    let rarityScore = 0;
    let traitTypes = 0;
    let uniqueTraits = 0;
    let rarityDistribution = {};
    
    // Use OpenSea data if available
    if (contractData.openSea && contractData.openSea.collection && contractData.openSea.collection.traits) {
      const traits = contractData.openSea.collection.traits;
      traitTypes = Object.keys(traits).length;
      
      // Calculate unique traits
      Object.keys(traits).forEach(traitType => {
        uniqueTraits += Object.keys(traits[traitType]).length;
      });
      
      // Calculate rarity distribution
      Object.keys(traits).forEach(traitType => {
        const traitValues = traits[traitType];
        const totalCount = Object.values(traitValues).reduce((sum, count) => sum + count, 0);
        
        rarityDistribution[traitType] = {
          totalCount,
          values: {}
        };
        
        Object.keys(traitValues).forEach(value => {
          const count = traitValues[value];
          const rarity = count / totalCount;
          rarityDistribution[traitType].values[value] = {
            count,
            rarity
          };
        });
      });
      
      // Calculate rarity score based on trait diversity
      rarityScore = Math.min(100, (traitTypes * 10) + (uniqueTraits / 5));
    } else {
      // If no OpenSea data, try to analyze a sample of tokens
      try {
        // Sample up to 5 tokens for analysis
        const sampleSize = 5;
        const tokenMetadataPromises = [];
        
        for (let i = 0; i < sampleSize; i++) {
          tokenMetadataPromises.push(getTokenMetadata(contractData.address, i).catch(() => null));
        }
        
        const tokenMetadatas = await Promise.all(tokenMetadataPromises);
        const validMetadatas = tokenMetadatas.filter(metadata => metadata !== null);
        
        if (validMetadatas.length > 0) {
          // Extract traits from token metadata
          const allTraits = new Set();
          const allTraitTypes = new Set();
          
          validMetadatas.forEach(metadata => {
            if (metadata.attributes && Array.isArray(metadata.attributes)) {
              metadata.attributes.forEach(attr => {
                if (attr.trait_type) {
                  allTraitTypes.add(attr.trait_type);
                  allTraits.add(`${attr.trait_type}:${attr.value}`);
                }
              });
            }
          });
          
          traitTypes = allTraitTypes.size;
          uniqueTraits = allTraits.size;
          
          // Estimate rarity score based on sample
          rarityScore = Math.min(100, (traitTypes * 10) + (uniqueTraits / 2));
        } else {
          // No valid metadata found
          rarityScore = 0;
        }
      } catch (error) {
        console.warn('Error analyzing token metadata for rarity:', error.message);
        rarityScore = 0;
      }
    }
    
    return {
      name: 'Collection Rarity',
      rarityScore,
      traitTypes,
      uniqueTraits,
      details: `Collection has ${traitTypes} trait types with ${uniqueTraits} unique trait values`,
      rarityDistribution
    };
  } catch (error) {
    console.error('Error analyzing collection rarity:', error);
    return {
      name: 'Collection Rarity',
      rarityScore: 0,
      traitTypes: 0,
      uniqueTraits: 0,
      details: 'Unable to analyze collection rarity',
      rarityDistribution: {}
    };
  }
}

/**
 * Analyze creator reputation
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Creator analysis result
 */
export const analyzeCreator = async (contractData) => {
  try {
    let creatorScore = 0;
    let creatorAddress = contractData.creator || '';
    let creatorVerified = false;
    let creatorCollections = [];
    let creatorHistory = [];
    
    // Use OpenSea data if available
    if (contractData.openSea && contractData.openSea.collection) {
      const collection = contractData.openSea.collection;
      
      if (collection.primary_asset_contracts && collection.primary_asset_contracts.length > 0) {
        const contract = collection.primary_asset_contracts[0];
        if (contract.creator) {
          creatorVerified = contract.creator.config === 'verified';
          
          // If creator is verified, give a base score
          if (creatorVerified) {
            creatorScore += 50;
          }
        }
      }
      
      // Check for social media presence
      if (collection.discord_url || collection.twitter_username || collection.instagram_username) {
        creatorScore += 20;
      }
      
      // Check for external URL
      if (collection.external_url) {
        creatorScore += 10;
      }
    }
    
    // In a real implementation, you would fetch creator's other collections
    // and analyze their performance
    
    // Ensure score is between 0-100
    creatorScore = Math.min(100, Math.max(0, creatorScore));
    
    return {
      name: 'Creator Reputation',
      creatorScore,
      creatorAddress,
      creatorVerified,
      creatorCollections,
      creatorHistory,
      details: `Creator has a reputation score of ${creatorScore}/100`
    };
  } catch (error) {
    console.error('Error analyzing creator reputation:', error);
    return {
      name: 'Creator Reputation',
      creatorScore: 0,
      creatorAddress: '',
      creatorVerified: false,
      creatorCollections: [],
      creatorHistory: [],
      details: 'Unable to analyze creator reputation'
    };
  }
}

/**
 * Analyze collection uniqueness
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Uniqueness analysis result
 */
export const analyzeUniqueness = async (contractData) => {
  try {
    let uniquenessScore = 0;
    let uniqueOwners = 0;
    let ownershipConcentration = 0;
    
    // Use OpenSea data if available
    if (contractData.openSea && contractData.openSea.stats) {
      const stats = contractData.openSea.stats;
      
      if (stats.num_owners && stats.total_supply && stats.total_supply > 0) {
        uniqueOwners = stats.num_owners;
        ownershipConcentration = uniqueOwners / stats.total_supply;
        
        // Calculate uniqueness score based on ownership distribution
        uniquenessScore = Math.min(100, ownershipConcentration * 100);
      }
    }
    
    return {
      name: 'Collection Uniqueness',
      uniquenessScore,
      uniqueOwners,
      ownershipConcentration,
      details: `Collection has ${uniqueOwners} unique owners with ${(ownershipConcentration * 100).toFixed(2)}% ownership distribution`
    };
  } catch (error) {
    console.error('Error analyzing collection uniqueness:', error);
    return {
      name: 'Collection Uniqueness',
      uniquenessScore: 0,
      uniqueOwners: 0,
      ownershipConcentration: 0,
      details: 'Unable to analyze collection uniqueness'
    };
  }
}

/**
 * Analyze collection activity
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Activity analysis result
 */
export const analyzeActivity = async (contractData) => {
  try {
    let activityScore = 0;
    let salesVolume = 0;
    let salesCount = 0;
    let averagePrice = 0;
    
    // Use OpenSea data if available
    if (contractData.openSea && contractData.openSea.stats) {
      const stats = contractData.openSea.stats;
      
      if (stats.total_volume) {
        salesVolume = stats.total_volume;
      }
      
      if (stats.total_sales) {
        salesCount = stats.total_sales;
      }
      
      if (salesCount > 0) {
        averagePrice = salesVolume / salesCount;
      }
      
      // Calculate activity score based on sales volume and count
      // This is a simplified approach - in a real implementation, you would use more sophisticated analysis
      if (salesCount > 1000) {
        activityScore = 100;
      } else if (salesCount > 500) {
        activityScore = 80;
      } else if (salesCount > 100) {
        activityScore = 60;
      } else if (salesCount > 50) {
        activityScore = 40;
      } else if (salesCount > 10) {
        activityScore = 20;
      } else {
        activityScore = Math.min(100, salesCount * 2);
      }
    } else {
      // If no OpenSea data, try to analyze transaction history
      const transactions = contractData.transactions || [];
      
      if (transactions.length > 0) {
        salesCount = transactions.length;
        activityScore = Math.min(100, salesCount);
      }
    }
    
    return {
      name: 'Collection Activity',
      activityScore,
      salesVolume,
      salesCount,
      averagePrice,
      details: `Collection has ${salesCount} sales with average price of ${averagePrice.toFixed(4)} ETH`
    };
  } catch (error) {
    console.error('Error analyzing collection activity:', error);
    return {
      name: 'Collection Activity',
      activityScore: 0,
      salesVolume: 0,
      salesCount: 0,
      averagePrice: 0,
      details: 'Unable to analyze collection activity'
    };
  }
}

/**
 * Calculate overall collection score
 * @param {Array} components - Analysis components
 * @returns {number} Overall collection score (0-100)
 */
export const calculateCollectionScore = (components) => {
  try {
    // Define weights for each component
    const weights = {
      'Collection Rarity': 0.3,
      'Creator Reputation': 0.2,
      'Collection Uniqueness': 0.25,
      'Collection Activity': 0.25
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    // Calculate weighted score
    components.forEach(component => {
      const weight = weights[component.name] || 0;
      let score = 0;
      
      if (component.name === 'Collection Rarity') {
        score = component.rarityScore || 0;
      } else if (component.name === 'Creator Reputation') {
        score = component.creatorScore || 0;
      } else if (component.name === 'Collection Uniqueness') {
        score = component.uniquenessScore || 0;
      } else if (component.name === 'Collection Activity') {
        score = component.activityScore || 0;
      }
      
      totalScore += score * weight;
      totalWeight += weight;
    });
    
    // Calculate final score
    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, Math.round(finalScore)));
  } catch (error) {
    console.error('Error calculating collection score:', error);
    return 0;
  }
};

// Default export for backward compatibility
export default {
  analyze,
  extractCollectionInfo,
  analyzeRarity,
  analyzeCreator,
  analyzeUniqueness,
  analyzeActivity,
  calculateCollectionScore
};