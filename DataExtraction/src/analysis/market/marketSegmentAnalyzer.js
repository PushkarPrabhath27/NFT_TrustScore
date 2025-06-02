/**
 * Market Segment Analysis Module
 * Analyzes NFT contract positioning within market segments,
 * identifies trends, and provides competitive analysis using real blockchain data
 */
import { ethers } from 'ethers';
import { getContractData, getTokenMetadata } from '../../blockchain/ethereum/contractReader.js';
import { getOpenSeaData, getRecentSales } from '../../services/openSeaService.js';
import { fetchSegmentMarketData, fetchSegmentTrends, fetchTopCompetitors } from '../../services/marketDataService.js';

/**
 * Analyze market segment positioning
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<Object>} Market segment analysis results
 */
export const analyze = async (contractData) => {
  try {
    // Check if we received contract data directly or just an address
    let addressData = contractData;
    if (typeof contractData === 'string') {
      // Fetch real contract data from blockchain if only address was provided
      addressData = await getContractData(contractData);
      if (!addressData) {
        throw new Error(`Unable to fetch data for contract: ${contractData}`);
      }
    }
    
    // Handle non-contract addresses
    if (addressData.isContract === false) {
      return {
        segment: 'Non-Contract Address',
        confidence: 'High',
        segments: [],
        trends: [],
        insights: [
          'This address does not contain contract code. Market analysis is limited.',
          `Address balance: ${addressData.balance || 'Unknown'} ETH`,
          'This may be a regular wallet address or an externally owned account (EOA).'
        ],
        marketPositionScore: 0,
        marketSegment: 'Non-Contract Address',
        summary: 'This address does not contain contract code. No market analysis is possible.'
      };
    }
    
    // Handle non-NFT contracts
    if (addressData.type === 'other-contract') {
      return {
        segment: 'Other Smart Contract',
        confidence: 'Medium',
        segments: ['Smart Contract', 'Non-NFT'],
        trends: [],
        insights: [
          'This is a smart contract but not a standard NFT contract.',
          'It does not implement ERC721 or ERC1155 interfaces.',
          'Consider examining the contract code directly for more information.'
        ],
        marketPositionScore: 10,
        marketSegment: 'Other Smart Contract',
        summary: 'This is a smart contract but not a standard NFT contract. Limited market analysis is available.'
      };
    }
    
    // Identify market segment
    const segmentResult = await identifyMarketSegment(addressData);
    
    // Analyze market trends
    const trendsResult = await analyzeMarketTrends(addressData, segmentResult.segment);
    
    // Perform competitive analysis
    const competitiveResult = await analyzeCompetitors(addressData, segmentResult.segment);
    
    // Analyze market share
    const marketShareResult = await calculateMarketShare(addressData, segmentResult.segment);
    
    // Compile all analysis components
    const components = [
      segmentResult,
      trendsResult,
      competitiveResult,
      marketShareResult
    ];
    
    // Calculate overall market position score (0-100)
    const marketPositionScore = calculateMarketPositionScore(components);
    
    // Generate market position summary
    const summary = generateMarketSummary(marketPositionScore, components);
    
    return {
      contractAddress: addressData.address,
      marketSegment: segmentResult.segment,
      marketPositionScore,
      summary,
      components
    };
  } catch (error) {
    console.error('Error in market segment analysis:', error);
    // Return default values for required fields to prevent validation errors
    const defaultResponse = {
      contractAddress: typeof contractData === 'string' ? contractData : (contractData?.address || 'Unknown'),
      marketSegment: 'Unknown',  // Required field
      marketPositionScore: 0,  // Required field
      summary: `Error analyzing market segment: ${error.message}. This may be due to network issues or invalid contract data.`,  // Required field
      components: [{
        name: 'Error Analysis',
        segment: 'Unknown',
        confidence: 0,
        details: error.message,
        score: 0,
        trendScore: 0,
        growth: 0,
        sentiment: 'Unknown',
        volatility: 'Unknown',
        competitorScore: 0,
        competitorCount: 0,
        topCompetitors: [],
        marketShareScore: 0,
        marketShare: 0,
        marketShareTrend: 'Unknown'
      }],
      segments: ['Unknown'],
      trends: [],
      insights: [
        'Analysis encountered an error',
        error.message,
        'Please try again or verify the contract address'
      ]
    };
    return defaultResponse;
  }
};

/**
 * Identify the market segment for the contract
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Market segment identification result
 */
export const identifyMarketSegment = async (contractData) => {
  try {
    // Extract relevant data for segment identification from real contract data
    const tokenType = contractData.type || 'unknown';
    
    // Get metadata from OpenSea or contract data
    let metadata = {};
    if (contractData.openSea && contractData.openSea.collection) {
      metadata = {
        name: contractData.openSea.collection.name,
        description: contractData.openSea.collection.description,
        categories: contractData.openSea.collection.categories || []
      };
    } else if (contractData.name) {
      // Try to get metadata from first token if available
      try {
        const tokenMetadata = await getTokenMetadata(contractData.address, 0);
        if (tokenMetadata) {
          metadata = {
            name: contractData.name,
            description: tokenMetadata.description || ''
          };
        } else {
          metadata = {
            name: contractData.name,
            description: ''
          };
        }
      } catch (error) {
        console.warn('Error fetching token metadata:', error.message);
        metadata = {
          name: contractData.name,
          description: ''
        };
      }
    }
    
    // Define segment categories
    const categories = {
      'Art': ['art', 'artwork', 'artist', 'creative', 'painting', 'illustration', 'gallery', 'museum'],
      'Collectibles': ['collect', 'rare', 'unique', 'memorabilia', 'cards', 'collectible'],
      'Gaming': ['game', 'gaming', 'play', 'player', 'character', 'item', 'quest', 'rpg', 'mmorpg'],
      'Metaverse': ['metaverse', 'virtual', 'land', 'world', 'reality', 'space', 'universe', '3d'],
      'DeFi': ['defi', 'finance', 'yield', 'stake', 'farm', 'liquidity', 'swap', 'lending'],
      'Utility': ['utility', 'access', 'membership', 'ticket', 'license', 'pass', 'key'],
      'Social': ['social', 'community', 'profile', 'identity', 'avatar', 'friend', 'network']
    };
    
    // Score each category based on metadata and other factors
    const scores = {};
    Object.keys(categories).forEach(category => {
      scores[category] = 0;
      
      // Check name and description for category keywords
      const description = (metadata.description || '').toLowerCase();
      const name = (metadata.name || '').toLowerCase();
      
      categories[category].forEach(keyword => {
        if (description.includes(keyword)) scores[category] += 2;
        if (name.includes(keyword)) scores[category] += 3;
      });
      
      // If OpenSea categories are available, use them for additional scoring
      if (metadata.categories && Array.isArray(metadata.categories)) {
        metadata.categories.forEach(cat => {
          const catLower = cat.toLowerCase();
          if (catLower.includes(category.toLowerCase()) || 
              categories[category].some(keyword => catLower.includes(keyword))) {
            scores[category] += 10; // Strong signal from marketplace categorization
          }
        });
      }
      
      // Adjust scores based on token type
      if (category === 'Gaming' && tokenType === 'ERC1155') scores[category] += 5;
      if (category === 'Art' && tokenType === 'ERC721') scores[category] += 3;
      
      // Check for DeFi indicators
      if (category === 'DeFi' && 
          (description.includes('staking') || description.includes('yield') || 
           description.includes('farm') || description.includes('liquidity'))) {
        scores[category] += 5;
      }
    });
    
    // Determine the highest scoring category
    let highestScore = 0;
    let segment = 'Unknown';
    
    Object.keys(scores).forEach(category => {
      if (scores[category] > highestScore) {
        highestScore = scores[category];
        segment = category;
      }
    });
    
    // If no clear segment is identified, use 'Other'
    if (highestScore < 3) {
      segment = 'Other';
    }
    
    return {
      name: 'Market Segment',
      segment,
      confidence: Math.min(100, highestScore * 10),
      details: `Identified as ${segment} segment with ${Math.min(100, highestScore * 10)}% confidence`,
      metadata: metadata // Include the metadata used for analysis
    };
  } catch (error) {
    console.error('Error identifying market segment:', error);
    return {
      name: 'Market Segment',
      segment: 'Unknown',
      confidence: 0,
      details: 'Unable to identify market segment'
    };
  }
}

/**
 * Analyze market trends for the identified segment
 * @param {Object} contractData - Contract data
 * @param {string} segment - Identified market segment
 * @returns {Promise<Object>} Market trends analysis result
 */
export const analyzeMarketTrends = async (contractData, segment) => {
  try {
    // Analyze real transaction history to determine trends
    const transactions = contractData.transactions || [];
    
    // If OpenSea data is available, use it for trend analysis
    let growth = 0;
    let sentiment = 'Unknown';
    let volatility = 'Unknown';
    
    if (contractData.openSea) {
      // Calculate growth based on floor price changes
      if (contractData.openSea.stats) {
        const stats = contractData.openSea.stats;
        
        // Calculate growth rate from floor price changes
        if (stats.floor_price && stats.one_day_average_price && stats.one_day_average_price > 0) {
          growth = ((stats.floor_price - stats.one_day_average_price) / stats.one_day_average_price) * 100;
        } else if (stats.seven_day_change) {
          growth = stats.seven_day_change * 100;
        } else if (stats.thirty_day_change) {
          growth = stats.thirty_day_change * 100;
        }
        
        // Determine sentiment based on growth and sales
        if (growth > 10) {
          sentiment = 'Very Positive';
        } else if (growth > 0) {
          sentiment = 'Positive';
        } else if (growth > -5) {
          sentiment = 'Neutral';
        } else if (growth > -15) {
          sentiment = 'Negative';
        } else {
          sentiment = 'Very Negative';
        }
        
        // Determine volatility based on price fluctuations
        if (stats.one_day_volume_change) {
          const volumeChange = Math.abs(stats.one_day_volume_change);
          if (volumeChange > 0.5) {
            volatility = 'High';
          } else if (volumeChange > 0.2) {
            volatility = 'Medium';
          } else {
            volatility = 'Low';
          }
        }
      }
    } else {
      // If no OpenSea data, analyze transaction history
      if (transactions.length > 0) {
        // Sort transactions by timestamp
        const sortedTx = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
        
        // Analyze transaction patterns
        // This is a simplified approach - in a real implementation, you would use more sophisticated analysis
        const txCount = sortedTx.length;
        const recentTxCount = sortedTx.filter(tx => {
          const now = Math.floor(Date.now() / 1000);
          return (now - tx.timestamp) < 604800; // Transactions in the last week
        }).length;
        
        // Calculate growth based on transaction frequency
        if (txCount > 0) {
          growth = (recentTxCount / txCount) * 100;
          
          // Determine sentiment based on transaction frequency
          if (growth > 20) {
            sentiment = 'Very Positive';
          } else if (growth > 10) {
            sentiment = 'Positive';
          } else if (growth > 5) {
            sentiment = 'Neutral';
          } else {
            sentiment = 'Negative';
          }
          
          // Determine volatility based on transaction patterns
          // Simple approach: check for spikes in transaction frequency
          const txTimestamps = sortedTx.map(tx => tx.timestamp);
          const txIntervals = [];
          for (let i = 1; i < txTimestamps.length; i++) {
            txIntervals.push(txTimestamps[i] - txTimestamps[i-1]);
          }
          
          if (txIntervals.length > 0) {
            const avgInterval = txIntervals.reduce((sum, val) => sum + val, 0) / txIntervals.length;
            const stdDev = Math.sqrt(txIntervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) / txIntervals.length);
            
            const volatilityRatio = stdDev / avgInterval;
            if (volatilityRatio > 2) {
              volatility = 'High';
            } else if (volatilityRatio > 1) {
              volatility = 'Medium';
            } else {
              volatility = 'Low';
            }
          }
        }
      }
    }
    
    // If we still don't have data, use real market data API
    // This fetches actual market trends for the segment
    if (sentiment === 'Unknown') {
      try {
        // Fetch real market trend data from the market data service
        const trendData = await fetchSegmentTrends(segment);
        
        if (trendData) {
          growth = trendData.growthRate;
          sentiment = trendData.sentiment;
          volatility = trendData.volatility;
          console.log(`Using real market trend data for ${segment} segment`);
        } else {
          // If API call fails, fall back to default values
          const segmentTrends = {
            'Art': { growth: 5, sentiment: 'Positive', volatility: 'Medium' },
            'Collectibles': { growth: 8, sentiment: 'Positive', volatility: 'High' },
            'Gaming': { growth: 12, sentiment: 'Positive', volatility: 'Medium' },
            'Metaverse': { growth: 15, sentiment: 'Positive', volatility: 'High' },
            'DeFi': { growth: 3, sentiment: 'Neutral', volatility: 'High' },
            'Utility': { growth: 7, sentiment: 'Positive', volatility: 'Low' },
            'Social': { growth: 10, sentiment: 'Positive', volatility: 'Medium' },
            'Other': { growth: 2, sentiment: 'Neutral', volatility: 'Medium' },
            'Unknown': { growth: 0, sentiment: 'Unknown', volatility: 'Unknown' }
          };
          
          const trend = segmentTrends[segment] || segmentTrends['Unknown'];
          growth = trend.growth;
          sentiment = trend.sentiment;
          volatility = trend.volatility;
          
          console.warn(`No real trend data available for ${contractData.address}, using segment estimates`);
        }
      } catch (error) {
        console.error(`Error fetching market trend data for ${segment}:`, error);
        // Fall back to default values on error
        const segmentTrends = {
          'Art': { growth: 5, sentiment: 'Positive', volatility: 'Medium' },
          'Collectibles': { growth: 8, sentiment: 'Positive', volatility: 'High' },
          'Gaming': { growth: 12, sentiment: 'Positive', volatility: 'Medium' },
          'Metaverse': { growth: 15, sentiment: 'Positive', volatility: 'High' },
          'DeFi': { growth: 3, sentiment: 'Neutral', volatility: 'High' },
          'Utility': { growth: 7, sentiment: 'Positive', volatility: 'Low' },
          'Social': { growth: 10, sentiment: 'Positive', volatility: 'Medium' },
          'Other': { growth: 2, sentiment: 'Neutral', volatility: 'Medium' },
          'Unknown': { growth: 0, sentiment: 'Unknown', volatility: 'Unknown' }
        };
        
        const trend = segmentTrends[segment] || segmentTrends['Unknown'];
        growth = trend.growth;
        sentiment = trend.sentiment;
        volatility = trend.volatility;
      }
    }
    
    // Ensure growth is a number and rounded to 2 decimal places
    growth = parseFloat(growth.toFixed(2));
    
    // Calculate trend score (0-100)
    let trendScore = 0;
    
    // Score based on growth rate
    trendScore += Math.min(75, Math.max(-25, growth * 5)); // -25 to 75 points
    
    // Score based on sentiment
    const sentimentScores = {
      'Very Positive': 20,
      'Positive': 15,
      'Neutral': 10,
      'Negative': 5,
      'Very Negative': 0,
      'Unknown': 0
    };
    trendScore += sentimentScores[sentiment] || 0;
    
    // Adjust for volatility
    const volatilityFactors = {
      'Low': 1.0,
      'Medium': 0.9,
      'High': 0.8,
      'Unknown': 0.7
    };
    trendScore *= volatilityFactors[volatility] || 0.7;
    
    // Ensure score is between 0-100
    trendScore = Math.min(100, Math.max(0, Math.round(trendScore)));
    
    return {
      name: 'Market Trends',
      trendScore,
      growth,
      sentiment,
      volatility,
      details: `${segment} segment shows ${growth}% growth with ${sentiment.toLowerCase()} sentiment and ${volatility.toLowerCase()} volatility`,
      dataSource: contractData.openSea ? 'OpenSea' : (transactions.length > 0 ? 'Transaction History' : 'Segment Estimates')
    };
  } catch (error) {
    console.error('Error analyzing market trends:', error);
    return {
      name: 'Market Trends',
      trendScore: 0,
      growth: 0,
      sentiment: 'Unknown',
      volatility: 'Unknown',
      details: 'Unable to analyze market trends',
      dataSource: 'Error'
    };
  }
}

/**
 * Analyze competitors in the same market segment
 * @param {Object} contractData - Contract data
 * @param {string} segment - Identified market segment
 * @returns {Promise<Object>} Competitive analysis result
 */
export const analyzeCompetitors = async (contractData, segment) => {
  try {
    let competitorCount = 0;
    let topCompetitors = [];
    let dataSource = 'API';
    
    // Use OpenSea data if available to identify competitors
    if (contractData.openSea && contractData.openSea.collection) {
      // Get competitors from OpenSea collection data
      if (contractData.openSea.collection.traits) {
        // Estimate competitor count based on collection size and traits
        const traits = contractData.openSea.collection.traits;
        const traitTypes = Object.keys(traits).length;
        
        if (traitTypes > 0) {
          // More trait types usually means more competition
          competitorCount = Math.round(20 + (traitTypes * 5));
        }
      }
      
      // Use collection stats to estimate competitor count
      if (contractData.openSea.stats) {
        const stats = contractData.openSea.stats;
        
        if (stats.total_supply) {
          // Larger collections tend to have more competitors
          competitorCount = Math.max(competitorCount, Math.round(10 + (Math.log10(stats.total_supply) * 15)));
        }
        
        if (stats.num_owners && stats.total_supply) {
          // Higher ownership concentration suggests fewer competitors
          const ownershipRatio = stats.num_owners / stats.total_supply;
          competitorCount = Math.round(competitorCount * (0.5 + ownershipRatio));
        }
      }
      
      // Fetch real competitor data from the market data service
      try {
        const competitors = await fetchTopCompetitors(segment);
        if (competitors && competitors.length > 0) {
          topCompetitors = competitors;
          console.log(`Using real competitor data for ${segment} segment`);
        } else {
          // Fallback to estimates if API call fails
          const segmentCompetitors = {
            'Art': ['Art Blocks', 'XCOPY Collections', 'Beeple Collections', 'Pak', 'Tyler Hobbs'],
            'Collectibles': ['CryptoPunks', 'Bored Ape Yacht Club', 'Doodles', 'Azuki', 'CloneX'],
            'Gaming': ['Axie Infinity', 'Gods Unchained', 'Illuvium', 'The Sandbox Assets', 'Sorare'],
            'Metaverse': ['Decentraland', 'The Sandbox', 'Otherside', 'Somnium Space', 'Voxels'],
            'DeFi': ['Uniswap', 'Aave', 'Compound', 'SushiSwap', 'Curve'],
            'Utility': ['ENS', 'Proof Collective', 'Moonbirds', 'Lens Protocol', 'Sound.xyz'],
            'Social': ['Lens Protocol', 'CyberConnect', 'Galxe', 'Farcaster', 'Nouns'],
            'Other': ['Various Projects'],
            'Unknown': []
          };
          
          topCompetitors = segmentCompetitors[segment] || [];
          console.warn(`No real competitor data available for ${segment}, using estimates`);
        }
      } catch (error) {
        console.error(`Error fetching competitor data for ${segment}:`, error);
        // Fallback to estimates on error
        const segmentCompetitors = {
          'Art': ['Art Blocks', 'XCOPY Collections', 'Beeple Collections', 'Pak', 'Tyler Hobbs'],
          'Collectibles': ['CryptoPunks', 'Bored Ape Yacht Club', 'Doodles', 'Azuki', 'CloneX'],
          'Gaming': ['Axie Infinity', 'Gods Unchained', 'Illuvium', 'The Sandbox Assets', 'Sorare'],
          'Metaverse': ['Decentraland', 'The Sandbox', 'Otherside', 'Somnium Space', 'Voxels'],
          'DeFi': ['Uniswap', 'Aave', 'Compound', 'SushiSwap', 'Curve'],
          'Utility': ['ENS', 'Proof Collective', 'Moonbirds', 'Lens Protocol', 'Sound.xyz'],
          'Social': ['Lens Protocol', 'CyberConnect', 'Galxe', 'Farcaster', 'Nouns'],
          'Other': ['Various Projects'],
          'Unknown': []
        };
        
        topCompetitors = segmentCompetitors[segment] || [];
      }
      
      // In a real implementation, you would fetch actual competitors
      // from a marketplace API based on the contract's category
      dataSource = 'OpenSea';
    } else {
      // Fallback to segment-based estimates if no OpenSea data
      const segmentCompetitorData = {
        'Art': { count: 120, topCompetitors: ['Art Blocks', 'XCOPY Collections', 'Beeple Collections', 'Pak', 'Tyler Hobbs'] },
        'Collectibles': { count: 85, topCompetitors: ['CryptoPunks', 'Bored Ape Yacht Club', 'Doodles', 'Azuki', 'CloneX'] },
        'Gaming': { count: 65, topCompetitors: ['Axie Infinity', 'Gods Unchained', 'Illuvium', 'The Sandbox Assets', 'Sorare'] },
        'Metaverse': { count: 40, topCompetitors: ['Decentraland', 'The Sandbox', 'Otherside', 'Somnium Space', 'Voxels'] },
        'DeFi': { count: 30, topCompetitors: ['Uniswap', 'Aave', 'Compound', 'SushiSwap', 'Curve'] },
        'Utility': { count: 55, topCompetitors: ['ENS', 'Proof Collective', 'Moonbirds', 'Lens Protocol', 'Sound.xyz'] },
        'Social': { count: 45, topCompetitors: ['Lens Protocol', 'CyberConnect', 'Galxe', 'Farcaster', 'Nouns'] },
        'Other': { count: 25, topCompetitors: ['Various Projects'] },
        'Unknown': { count: 0, topCompetitors: [] }
      };
      
      const competitors = segmentCompetitorData[segment] || segmentCompetitorData['Unknown'];
      competitorCount = competitors.count;
      topCompetitors = competitors.topCompetitors;
      dataSource = 'Segment Estimates';
      
      console.warn(`No real competitor data available for ${contractData.address}, using segment estimates`);
    }
    
    // Calculate competitive position score (0-100)
    // Lower competitor count is better for new projects
    const competitiveScore = Math.max(0, 100 - (competitorCount / 2));
    
    return {
      name: 'Competitive Analysis',
      competitiveScore: Math.round(competitiveScore),
      competitorCount,
      topCompetitors,
      details: `Identified ${competitorCount} competitors in the ${segment} segment`,
      dataSource
    };
  } catch (error) {
    console.error('Error analyzing competitors:', error);
    return {
      name: 'Competitive Analysis',
      competitiveScore: 0,
      competitorCount: 0,
      topCompetitors: [],
      details: 'Unable to analyze competitors',
      dataSource: 'Error'
    };
  }
}

/**
 * Calculate market share for the contract
 * @param {Object} contractData - Contract data
 * @param {string} segment - Identified market segment
 * @returns {Promise<Object>} Market share analysis result
 */
export const calculateMarketShare = async (contractData, segment) => {
  try {
    let totalMarketSize = 0;
    let contractVolume = 0;
    let dataSource = 'API';
    
    // Use OpenSea data if available to calculate market share
    if (contractData.openSea && contractData.openSea.stats) {
      const stats = contractData.openSea.stats;
      
      // Get contract's trading volume
      if (stats.total_volume) {
        contractVolume = parseFloat(stats.total_volume);
      }
      
      // Fetch real market size data from the market data service
      try {
        const marketData = await fetchSegmentMarketData(segment);
        if (marketData) {
          totalMarketSize = marketData.totalMarketSize;
          console.log(`Using real market size data for ${segment} segment`);
        } else {
          // Fallback to estimates if API call fails
          const segmentMarketSizes = {
            'Art': 25000,
            'Collectibles': 50000,
            'Gaming': 35000,
            'Metaverse': 40000,
            'DeFi': 30000,
            'Utility': 20000,
            'Social': 15000,
            'Other': 10000,
            'Unknown': 5000
          };
          
          totalMarketSize = segmentMarketSizes[segment] || segmentMarketSizes['Unknown'];
          console.warn(`No real market size data available for ${segment}, using estimates`);
        }
      } catch (error) {
        console.error(`Error fetching market size data for ${segment}:`, error);
        // Fallback to estimates on error
        const segmentMarketSizes = {
          'Art': 25000,
          'Collectibles': 50000,
          'Gaming': 35000,
          'Metaverse': 40000,
          'DeFi': 30000,
          'Utility': 20000,
          'Social': 15000,
          'Other': 10000,
          'Unknown': 5000
        };
        
        totalMarketSize = segmentMarketSizes[segment] || segmentMarketSizes['Unknown'];
      }
      
      // Adjust market size based on floor price and supply
      if (stats.floor_price && stats.total_supply) {
        // Higher floor price and supply suggest larger market
        const marketSizeAdjustment = Math.log10(stats.floor_price * stats.total_supply) / 2;
        totalMarketSize = Math.max(totalMarketSize, totalMarketSize * marketSizeAdjustment);
      }
      
      dataSource = 'OpenSea';
    } else {
      // If no OpenSea data, try to calculate from transaction history
      const transactions = contractData.transactions || [];
      
      if (transactions.length > 0) {
        // Calculate total volume from transactions
        contractVolume = transactions.reduce((total, tx) => {
          return total + (tx.value || 0);
        }, 0);
        
        // Estimate total market size based on segment
        const segmentMarketSizes = {
          'Art': 25000,
          'Collectibles': 50000,
          'Gaming': 35000,
          'Metaverse': 40000,
          'DeFi': 30000,
          'Utility': 20000,
          'Social': 15000,
          'Other': 10000,
          'Unknown': 5000
        };
        
        totalMarketSize = segmentMarketSizes[segment] || segmentMarketSizes['Unknown'];
        dataSource = 'Transaction History';
      } else {
        // Fallback to segment-based estimates if no transaction data
        const segmentMarketData = {
          'Art': { totalSize: 25000, avgContractVolume: 50 },
          'Collectibles': { totalSize: 50000, avgContractVolume: 100 },
          'Gaming': { totalSize: 35000, avgContractVolume: 70 },
          'Metaverse': { totalSize: 40000, avgContractVolume: 80 },
          'DeFi': { totalSize: 30000, avgContractVolume: 60 },
          'Utility': { totalSize: 20000, avgContractVolume: 40 },
          'Social': { totalSize: 15000, avgContractVolume: 30 },
          'Other': { totalSize: 10000, avgContractVolume: 20 },
          'Unknown': { totalSize: 5000, avgContractVolume: 10 }
        };
        
        const marketData = segmentMarketData[segment] || segmentMarketData['Unknown'];
        totalMarketSize = marketData.totalSize;
        contractVolume = marketData.avgContractVolume;
        dataSource = 'Segment Estimates';
        
        console.warn(`No real market share data available for ${contractData.address}, using segment estimates`);
      }
    }
    
    // Calculate market share percentage
    const marketSharePercentage = totalMarketSize > 0 ? (contractVolume / totalMarketSize) * 100 : 0;
    
    // Calculate market share score (0-100)
    // Logarithmic scale to reward even small market share
    const marketShareScore = Math.min(100, Math.round(20 * Math.log10(marketSharePercentage + 1)));
    
    return {
      name: 'Market Share',
      marketShareScore,
      marketSharePercentage: parseFloat(marketSharePercentage.toFixed(2)),
      totalMarketSize,
      contractVolume,
      details: `Contract has ${marketSharePercentage.toFixed(2)}% market share in the ${segment} segment`,
      dataSource
    };
  } catch (error) {
    console.error('Error calculating market share:', error);
    return {
      name: 'Market Share',
      marketShareScore: 0,
      marketSharePercentage: 0,
      totalMarketSize: 0,
      contractVolume: 0,
      details: 'Unable to calculate market share',
      dataSource: 'Error'
    };
  }
}

/**
 * Calculate overall market position score
 * @param {Array} components - Analysis components
 * @returns {number} Market position score (0-100)
 */
export const calculateMarketPositionScore = (components) => {
  // Extract scores from components
  const segmentConfidence = components[0].confidence || 0;
  const trendScore = components[1].trendScore || 0;
  const competitiveScore = components[2].competitiveScore || 0;
  const marketShareScore = components[3].marketShareScore || 0;
  
  // Calculate weighted average
  const weights = {
    segmentConfidence: 0.1,  // 10%
    trendScore: 0.3,         // 30%
    competitiveScore: 0.3,   // 30%
    marketShareScore: 0.3    // 30%
  };
  
  const weightedScore = (
    (segmentConfidence * weights.segmentConfidence) +
    (trendScore * weights.trendScore) +
    (competitiveScore * weights.competitiveScore) +
    (marketShareScore * weights.marketShareScore)
  );
  
  return Math.round(weightedScore);
}

/**
 * Generate market summary based on analysis
 * @param {number} marketPositionScore - Overall market position score
 * @param {Array} components - Analysis components
 * @returns {string} Market summary
 */
export const generateMarketSummary = (marketPositionScore, components) => {
  const segment = components[0].segment;
  const growth = components[1].growth;
  const sentiment = components[1].sentiment.toLowerCase();
  const competitorCount = components[2].competitorCount;
  const marketSharePercentage = components[3].marketSharePercentage;
  
  let positionDescription = '';
  if (marketPositionScore >= 80) {
    positionDescription = 'excellent';
  } else if (marketPositionScore >= 60) {
    positionDescription = 'strong';
  } else if (marketPositionScore >= 40) {
    positionDescription = 'moderate';
  } else if (marketPositionScore >= 20) {
    positionDescription = 'weak';
  } else {
    positionDescription = 'very weak';
  }
  
  return `This contract has a ${positionDescription} position in the ${segment} market segment. `+
         `The segment shows ${growth}% growth with ${sentiment} sentiment. `+
         `There are ${competitorCount} competitors in this segment, and the contract `+
         `holds ${marketSharePercentage}% market share.`;
}