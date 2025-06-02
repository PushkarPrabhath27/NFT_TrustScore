/**
 * Trust Score Analysis Module
 * Calculates trust scores based on contract code, developer reputation, transaction history,
 * community engagement, and metadata reliability
 */

import { getContractTransactions, getContractData } from '../../blockchain/ethereum/contractReader.js';

/**
 * Analyze contract and calculate trust score
 * @param {Object} contractData - Contract data from Ethereum blockchain
 * @returns {Promise<Object>} Trust score analysis
 */
export const analyze = async (contractData) => {
  try {
    if (!contractData) {
      throw new Error('Contract data is required for trust score analysis');
    }
    
    // Handle non-contract addresses
    if (contractData.isContract === false) {
      return {
        score: 'N/A',
        confidence: 'High',
        reason: 'Not a contract address',
        factors: [],
        strengths: [],
        concerns: [
          'This address does not contain contract code. Trust analysis is limited.',
          `Address balance: ${contractData.balance || 'Unknown'} ETH`,
          'This may be a regular wallet address or an externally owned account (EOA).'
        ],
        history: [],
        creatorScore: 'N/A'
      };
    }
    
    // Handle non-NFT contracts
    if (contractData.type === 'other-contract') {
      return {
        score: 50,
        confidence: 'Medium',
        reason: 'Non-standard smart contract',
        factors: [
          { name: "Contract Type", score: 50, weight: 1.0 }
        ],
        strengths: ['Valid smart contract with executable code'],
        concerns: [
          'This is a smart contract but not a standard NFT contract.',
          'It does not implement ERC721 or ERC1155 interfaces.',
          'Consider examining the contract code directly for more information.'
        ],
        history: contractData.transactions || [],
        creatorScore: 'Unknown'
      };
    }
    
    // Calculate individual factor scores using real blockchain data
    const contractSecurityScore = await analyzeContractSecurity(contractData);
    const developerReputationScore = await analyzeDeveloperReputation(contractData);
    const transactionHistoryScore = await analyzeTransactionHistory(contractData);
    const communityMetricsScore = await analyzeCommunityMetrics(contractData);
    const metadataReliabilityScore = await analyzeMetadataReliability(contractData);
    
    // Define factor weights
    const factors = [
      { name: "Contract Security", score: contractSecurityScore, weight: 0.25 },
      { name: "Developer Reputation", score: developerReputationScore, weight: 0.15 },
      { name: "Transaction History", score: transactionHistoryScore, weight: 0.20 },
      { name: "Community Metrics", score: communityMetricsScore, weight: 0.15 },
      { name: "Metadata Reliability", score: metadataReliabilityScore, weight: 0.25 }
    ];
    
    // Calculate weighted score
    const overallScore = Math.round(
      factors.reduce((sum, factor) => sum + factor.score * factor.weight, 0)
    );
    
    // Determine confidence level
    const confidence = determineConfidenceLevel(factors);
    
    // Generate historical data based on contract address
    const history = await generateHistoricalData(contractData.address);
    
    // Identify strengths and concerns
    const { strengths, concerns } = identifyStrengthsAndConcerns(factors);
    
    // Calculate creator score (if available)
    const creatorScore = contractData.creator ? await calculateCreatorScore(contractData.creator) : 0;
    
    console.log(`Generated trust score of ${overallScore} for contract ${contractData.address || 'unknown'}`);
    
    return {
      score: overallScore,
      confidence,
      factors,
      history,
      strengths,
      concerns,
      creatorScore
    };
  } catch (error) {
    console.error('Error in trust score analysis:', error);
    throw error;
  }
};

/**
 * Analyze contract security
 * @param {Object} contractData - Contract data
 * @returns {Promise<number>} Security score (0-100)
 */
async function analyzeContractSecurity(contractData) {
  try {
    // Start with a moderate base score
    let securityScore = 60;
    console.log(`Analyzing contract security for ${contractData.address}`);
    
    // Check contract creation date - newer contracts might have more security issues
    if (contractData.creationTimestamp) {
      const contractAge = (Date.now() / 1000) - contractData.creationTimestamp;
      const ageInDays = contractAge / (60 * 60 * 24);
      
      // Score based on contract age
      if (ageInDays > 365) { // Older than a year
        securityScore += 15;
        console.log(`Contract is over 1 year old (${Math.floor(ageInDays)} days): +15 points`);
      } else if (ageInDays > 180) { // Older than 6 months
        securityScore += 10;
        console.log(`Contract is over 6 months old (${Math.floor(ageInDays)} days): +10 points`);
      } else if (ageInDays > 90) { // Older than 3 months
        securityScore += 5;
        console.log(`Contract is over 3 months old (${Math.floor(ageInDays)} days): +5 points`);
      } else {
        console.log(`Contract is relatively new (${Math.floor(ageInDays)} days): no age bonus`);
      }
    }
    
    // Check transaction history for suspicious patterns
    if (contractData.transactions && contractData.transactions.length > 0) {
      const transactions = contractData.transactions;
      
      // Check transaction success rate
      const failedTxCount = transactions.filter(tx => tx.status === 'failed').length;
      const successRate = 1 - (failedTxCount / transactions.length);
      
      if (successRate > 0.95) { // Very high success rate
        securityScore += 10;
        console.log(`High transaction success rate (${(successRate * 100).toFixed(1)}%): +10 points`);
      } else if (successRate > 0.9) { // Good success rate
        securityScore += 5;
        console.log(`Good transaction success rate (${(successRate * 100).toFixed(1)}%): +5 points`);
      } else if (successRate < 0.8) { // Poor success rate - potential issues
        securityScore -= 10;
        console.log(`Poor transaction success rate (${(successRate * 100).toFixed(1)}%): -10 points`);
      }
      
      // Check for suspicious transaction patterns
      // 1. Large value transfers out of the contract
      const highValueOutgoing = transactions.filter(tx => {
        return tx.from && tx.from.toLowerCase() === contractData.address.toLowerCase() && 
               parseFloat(tx.value) > 1.0; // More than 1 ETH
      });
      
      if (highValueOutgoing.length > 0) {
        securityScore -= 5 * Math.min(3, highValueOutgoing.length); // Max -15 points
        console.log(`Found ${highValueOutgoing.length} high-value outgoing transactions: -${5 * Math.min(3, highValueOutgoing.length)} points`);
      }
      
      // 2. Transaction volume consistency
      // Sudden spikes in transaction volume can indicate potential issues
      if (transactions.length >= 10) {
        // Sort transactions by timestamp
        const sortedTx = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
        
        // Check for transaction spikes
        let hasSpikes = false;
        const timeWindows = [];
        
        // Create 24-hour windows
        for (let i = 0; i < sortedTx.length - 1; i++) {
          const windowStart = sortedTx[i].timestamp;
          const windowEnd = windowStart + (24 * 60 * 60); // 24 hours in seconds
          
          // Count transactions in this window
          const txInWindow = sortedTx.filter(tx => 
            tx.timestamp >= windowStart && tx.timestamp <= windowEnd
          ).length;
          
          timeWindows.push(txInWindow);
        }
        
        // Calculate standard deviation of transaction counts
        if (timeWindows.length > 0) {
          const avgTxCount = timeWindows.reduce((sum, count) => sum + count, 0) / timeWindows.length;
          const variance = timeWindows.reduce((sum, count) => sum + Math.pow(count - avgTxCount, 2), 0) / timeWindows.length;
          const stdDev = Math.sqrt(variance);
          
          // High standard deviation indicates inconsistent transaction patterns
          if (stdDev > avgTxCount * 2) {
            securityScore -= 10;
            console.log(`Highly inconsistent transaction patterns detected: -10 points`);
          } else if (stdDev > avgTxCount) {
            securityScore -= 5;
            console.log(`Somewhat inconsistent transaction patterns detected: -5 points`);
          } else {
            securityScore += 5;
            console.log(`Consistent transaction patterns detected: +5 points`);
          }
        }
      }
    } else {
      console.log(`No transaction history available for security analysis`);
    }
    
    // Check contract type - standard interfaces are more likely to be secure
    if (contractData.type === 'ERC721' || contractData.type === 'ERC1155') {
      securityScore += 10;
      console.log(`Contract implements standard interface (${contractData.type}): +10 points`);
    }
    
    // Check if verified on OpenSea
    if (contractData.openSea && 
        contractData.openSea.collection && 
        contractData.openSea.collection.safelist_request_status === 'verified') {
      securityScore += 10;
      console.log(`Contract is verified on OpenSea: +10 points`);
    }
    
    console.log(`Final contract security score: ${Math.min(100, securityScore)}`);
    return Math.min(100, securityScore); // Cap at 100
  } catch (error) {
    console.error('Error analyzing contract security:', error);
    return 50; // Default score on error
  }
}

/**
 * Analyze developer reputation
 * @param {Object} contractData - Contract data
 * @returns {Promise<number>} Reputation score (0-100)
 */
async function analyzeDeveloperReputation(contractData) {
  try {
    if (!contractData.creator) {
      console.log('Creator address unknown, using default reputation score');
      return 50; // Default score if creator is unknown
    }
    
    console.log(`Analyzing reputation for creator: ${contractData.creator}`);
    let reputationScore = 50; // Base score
    
    // Check if creator has verified projects on OpenSea
    if (contractData.openSea && 
        contractData.openSea.collection && 
        contractData.openSea.collection.safelist_request_status === 'verified') {
      reputationScore += 15;
      console.log('Creator has verified collection on OpenSea: +15 points');
    }
    
    // Analyze creator's transaction history from blockchain data
    if (contractData.transactions && contractData.transactions.length > 0) {
      // Check if creator is actively involved in transactions
      const creatorTransactions = contractData.transactions.filter(tx => 
        tx.from && tx.from.toLowerCase() === contractData.creator.toLowerCase()
      );
      
      if (creatorTransactions.length > 0) {
        // Calculate percentage of total transactions by creator
        const creatorInvolvementRate = creatorTransactions.length / contractData.transactions.length;
        
        // Score based on creator involvement
        if (creatorInvolvementRate > 0.3) { // Highly involved (>30% of transactions)
          reputationScore += 15;
          console.log(`Creator highly involved in contract transactions (${(creatorInvolvementRate * 100).toFixed(1)}%): +15 points`);
        } else if (creatorInvolvementRate > 0.1) { // Moderately involved (>10% of transactions)
          reputationScore += 10;
          console.log(`Creator moderately involved in contract transactions (${(creatorInvolvementRate * 100).toFixed(1)}%): +10 points`);
        } else if (creatorInvolvementRate > 0) { // Minimally involved
          reputationScore += 5;
          console.log(`Creator minimally involved in contract transactions (${(creatorInvolvementRate * 100).toFixed(1)}%): +5 points`);
        }
        
        // Check for recent activity (last 30 days)
        const now = Math.floor(Date.now() / 1000);
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
        const recentCreatorTx = creatorTransactions.filter(tx => tx.timestamp >= thirtyDaysAgo);
        
        if (recentCreatorTx.length > 0) {
          reputationScore += 10;
          console.log(`Creator has recent activity (${recentCreatorTx.length} transactions in last 30 days): +10 points`);
        }
      }
    }
    
    // Check contract age as a proxy for developer experience
    if (contractData.creationTimestamp) {
      const contractAge = (Date.now() / 1000) - contractData.creationTimestamp;
      const ageInDays = contractAge / (60 * 60 * 24);
      
      if (ageInDays > 365) { // Older than a year
        reputationScore += 15;
        console.log(`Contract is over 1 year old (${Math.floor(ageInDays)} days): +15 points for developer experience`);
      } else if (ageInDays > 180) { // Older than 6 months
        reputationScore += 10;
        console.log(`Contract is over 6 months old (${Math.floor(ageInDays)} days): +10 points for developer experience`);
      } else if (ageInDays > 90) { // Older than 3 months
        reputationScore += 5;
        console.log(`Contract is over 3 months old (${Math.floor(ageInDays)} days): +5 points for developer experience`);
      }
    }
    
    // Check if creator has multiple contracts (would require external API in production)
    // For now, we'll assume this data would come from a database or indexer
    
    console.log(`Final developer reputation score: ${Math.min(100, reputationScore)}`);
    return Math.min(100, reputationScore); // Cap at 100
  } catch (error) {
    console.error('Error analyzing developer reputation:', error);
    return 50; // Default score on error
  }
}

/**
 * Analyze transaction history
 * @param {Object} contractData - Contract data
 * @returns {Promise<number>} Transaction history score (0-100)
 */
async function analyzeTransactionHistory(contractData) {
  try {
    let transactionScore = 50; // Base score
    
    // Check real blockchain transactions
    if (contractData.transactions && contractData.transactions.length > 0) {
      const transactions = contractData.transactions;
      console.log(`Analyzing ${transactions.length} transactions for trust score calculation`);
      
      // Calculate transaction frequency (transactions per day)
      const timestamps = transactions.map(tx => tx.timestamp);
      const oldestTimestamp = Math.min(...timestamps);
      const newestTimestamp = Math.max(...timestamps);
      const timeSpanDays = (newestTimestamp - oldestTimestamp) / (60 * 60 * 24);
      
      // Avoid division by zero
      const txPerDay = timeSpanDays > 0 ? transactions.length / timeSpanDays : transactions.length;
      
      // Score based on transaction frequency
      if (txPerDay > 10) { // Very active
        transactionScore += 20;
      } else if (txPerDay > 5) { // Active
        transactionScore += 15;
      } else if (txPerDay > 1) { // Moderately active
        transactionScore += 10;
      } else if (txPerDay > 0) { // Some activity
        transactionScore += 5;
      }
      
      // Analyze unique addresses interacting with the contract
      const uniqueAddresses = new Set();
      transactions.forEach(tx => {
        if (tx.from) uniqueAddresses.add(tx.from);
      });
      
      // Score based on unique addresses (community size)
      if (uniqueAddresses.size > 100) { // Large community
        transactionScore += 20;
      } else if (uniqueAddresses.size > 50) { // Medium community
        transactionScore += 15;
      } else if (uniqueAddresses.size > 20) { // Small community
        transactionScore += 10;
      } else if (uniqueAddresses.size > 5) { // Very small community
        transactionScore += 5;
      }
      
      // Check for failed transactions (potential issues)
      const failedTxCount = transactions.filter(tx => tx.status === 'failed').length;
      const failureRate = transactions.length > 0 ? failedTxCount / transactions.length : 0;
      
      // Penalize high failure rates
      if (failureRate > 0.2) { // More than 20% failed
        transactionScore -= 15;
      } else if (failureRate > 0.1) { // More than 10% failed
        transactionScore -= 10;
      } else if (failureRate > 0.05) { // More than 5% failed
        transactionScore -= 5;
      }
    }
    
    // Also check OpenSea stats if available (as secondary data source)
    if (contractData.openSea && contractData.openSea.stats) {
      const stats = contractData.openSea.stats;
      
      // Check trading volume
      if (stats.total_volume > 100) { // High volume
        transactionScore += 10;
      } else if (stats.total_volume > 10) { // Medium volume
        transactionScore += 5;
      }
      
      // Check number of sales
      if (stats.total_sales > 1000) { // Many sales
        transactionScore += 10;
      } else if (stats.total_sales > 100) { // Some sales
        transactionScore += 5;
      }
      
      // Check number of owners (diversity of ownership is good)
      if (stats.num_owners > 100) {
        transactionScore += 5;
      }
    }
    
    return Math.min(100, transactionScore); // Cap at 100
  } catch (error) {
    console.error('Error analyzing transaction history:', error);
    return 50; // Default score on error
  }
}

/**
 * Analyze community metrics
 * @param {Object} contractData - Contract data
 * @returns {Promise<number>} Community metrics score (0-100)
 */
async function analyzeCommunityMetrics(contractData) {
  try {
    let communityScore = 50; // Base score
    console.log(`Analyzing community metrics for ${contractData.address}`);
    
    // Analyze real blockchain transaction data for community engagement
    if (contractData.transactions && contractData.transactions.length > 0) {
      const transactions = contractData.transactions;
      
      // Count unique addresses interacting with the contract
      const uniqueAddresses = new Set();
      transactions.forEach(tx => {
        if (tx.from) uniqueAddresses.add(tx.from.toLowerCase());
        if (tx.to) uniqueAddresses.add(tx.to.toLowerCase());
      });
      
      // Score based on community size from blockchain data
      const communitySize = uniqueAddresses.size;
      console.log(`Found ${communitySize} unique addresses interacting with contract`);
      
      if (communitySize > 100) {
        communityScore += 20;
        console.log(`Large community size (${communitySize} addresses): +20 points`);
      } else if (communitySize > 50) {
        communityScore += 15;
        console.log(`Medium community size (${communitySize} addresses): +15 points`);
      } else if (communitySize > 20) {
        communityScore += 10;
        console.log(`Small community size (${communitySize} addresses): +10 points`);
      } else if (communitySize > 5) {
        communityScore += 5;
        console.log(`Very small community size (${communitySize} addresses): +5 points`);
      }
      
      // Analyze transaction frequency as a measure of community activity
      // Sort transactions by timestamp
      const sortedTx = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
      
      if (sortedTx.length >= 2) {
        const oldestTimestamp = sortedTx[0].timestamp;
        const newestTimestamp = sortedTx[sortedTx.length - 1].timestamp;
        const timeSpanDays = (newestTimestamp - oldestTimestamp) / (60 * 60 * 24);
        
        // Avoid division by zero
        const txPerDay = timeSpanDays > 0 ? transactions.length / timeSpanDays : transactions.length;
        console.log(`Transaction frequency: ${txPerDay.toFixed(2)} per day over ${timeSpanDays.toFixed(2)} days`);
        
        // Score based on activity level
        if (txPerDay > 10) { // Very active
          communityScore += 15;
          console.log(`Very active community (${txPerDay.toFixed(2)} tx/day): +15 points`);
        } else if (txPerDay > 5) { // Active
          communityScore += 10;
          console.log(`Active community (${txPerDay.toFixed(2)} tx/day): +10 points`);
        } else if (txPerDay > 1) { // Moderately active
          communityScore += 5;
          console.log(`Moderately active community (${txPerDay.toFixed(2)} tx/day): +5 points`);
        }
      }
    } else {
      console.log(`No transaction data available for community analysis`);
    }
    
    // Also check OpenSea data for social presence
    if (contractData.openSea && contractData.openSea.collection) {
      const collection = contractData.openSea.collection;
      let socialPoints = 0;
      
      // Check for Discord presence
      if (collection.discord_url) {
        socialPoints += 10;
        console.log(`Collection has Discord presence: +10 points`);
      }
      
      // Check for Twitter presence
      if (collection.twitter_username) {
        socialPoints += 10;
        console.log(`Collection has Twitter presence: +10 points`);
      }
      
      // Check for website
      if (collection.external_link) {
        socialPoints += 5;
        console.log(`Collection has website: +5 points`);
      }
      
      communityScore += socialPoints;
      
      // Check stats for community size from OpenSea
      if (contractData.openSea.stats && contractData.openSea.stats.num_owners) {
        const numOwners = contractData.openSea.stats.num_owners;
        console.log(`OpenSea reports ${numOwners} unique owners`);
        
        // Only add points if we didn't already get points from blockchain data
        if (!(contractData.transactions && contractData.transactions.length > 0)) {
          if (numOwners > 1000) {
            communityScore += 15;
            console.log(`Large OpenSea community (${numOwners} owners): +15 points`);
          } else if (numOwners > 100) {
            communityScore += 10;
            console.log(`Medium OpenSea community (${numOwners} owners): +10 points`);
          } else if (numOwners > 10) {
            communityScore += 5;
            console.log(`Small OpenSea community (${numOwners} owners): +5 points`);
          }
        }
      }
    } else {
      console.log(`No OpenSea data available for social presence analysis`);
    }
    
    console.log(`Final community metrics score: ${Math.min(100, communityScore)}`);
    return Math.min(100, communityScore); // Cap at 100
  } catch (error) {
    console.error('Error analyzing community metrics:', error);
    return 50; // Default score on error
  }
}

/**
 * Analyze metadata reliability
 * @param {Object} contractData - Contract data
 * @returns {Promise<number>} Metadata reliability score (0-100)
 */
async function analyzeMetadataReliability(contractData) {
  try {
    let metadataScore = 50; // Base score
    console.log(`Analyzing metadata reliability for ${contractData.address}`);
    
    // Check if contract follows standard interfaces (ERC721 or ERC1155)
    if (contractData.type === 'ERC721' || contractData.type === 'ERC1155') {
      metadataScore += 15;
      console.log(`Contract implements standard interface (${contractData.type}): +15 points`);
    } else {
      console.log(`Contract does not implement a standard NFT interface: no bonus`);
    }
    
    // Check if contract has a name and symbol
    if (contractData.name && contractData.symbol) {
      metadataScore += 10;
      console.log(`Contract has name (${contractData.name}) and symbol (${contractData.symbol}): +10 points`);
    } else if (contractData.name) {
      metadataScore += 5;
      console.log(`Contract has name (${contractData.name}) but no symbol: +5 points`);
    } else {
      console.log(`Contract missing name and symbol: no bonus`);
    }
    
    // Check for token URI consistency using real blockchain data
    if (contractData.transactions && contractData.transactions.length > 0) {
      // In a production system, we would check actual token URIs
      // For now, we'll use transaction data as a proxy for metadata reliability
      const successfulTxs = contractData.transactions.filter(tx => tx.status === 'success');
      
      if (successfulTxs.length > 10) {
        metadataScore += 10;
        console.log(`Contract has ${successfulTxs.length} successful transactions: +10 points for metadata reliability`);
      } else if (successfulTxs.length > 0) {
        metadataScore += 5;
        console.log(`Contract has ${successfulTxs.length} successful transactions: +5 points for metadata reliability`);
      }
    }
    
    // Check OpenSea data for metadata completeness
    if (contractData.openSea && contractData.openSea.collection) {
      const collection = contractData.openSea.collection;
      let openSeaPoints = 0;
      
      // Check for description
      if (collection.description) {
        if (collection.description.length > 200) {
          openSeaPoints += 5;
          console.log(`Collection has detailed description (${collection.description.length} chars): +5 points`);
        } else if (collection.description.length > 50) {
          openSeaPoints += 3;
          console.log(`Collection has basic description (${collection.description.length} chars): +3 points`);
        }
      }
      
      // Check for image
      if (collection.image_url) {
        openSeaPoints += 5;
        console.log(`Collection has image: +5 points`);
      }
      
      // Check for traits/attributes schema
      if (collection.traits) {
        const traitCount = Object.keys(collection.traits).length;
        if (traitCount > 5) {
          openSeaPoints += 10;
          console.log(`Collection has rich trait schema (${traitCount} traits): +10 points`);
        } else if (traitCount > 0) {
          openSeaPoints += 5;
          console.log(`Collection has basic trait schema (${traitCount} traits): +5 points`);
        }
      }
      
      // Check for external links (indicates more complete metadata)
      if (collection.external_link) {
        openSeaPoints += 5;
        console.log(`Collection has external website link: +5 points`);
      }
      
      metadataScore += openSeaPoints;
    } else {
      console.log(`No OpenSea data available for metadata analysis`);
    }
    
    console.log(`Final metadata reliability score: ${Math.min(100, metadataScore)}`);
    return Math.min(100, metadataScore); // Cap at 100
  } catch (error) {
    console.error('Error analyzing metadata reliability:', error);
    return 50; // Default score on error
  }
}

/**
 * Determine confidence level based on factor scores
 * @param {Array} factors - Trust score factors
 * @returns {string} Confidence level (Low, Medium, High)
 */
function determineConfidenceLevel(factors) {
  // Calculate standard deviation of scores
  const scores = factors.map(factor => factor.score);
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Determine confidence based on standard deviation
  if (stdDev > 20) {
    return 'Low';
  } else if (stdDev > 10) {
    return 'Medium';
  } else {
    return 'High';
  }
}

/**
 * Generate historical trust score data
 * @returns {Array} Historical data
 */
async function generateHistoricalData(contractAddress) {
  try {
    // In a production system, this would fetch historical data from the database
    // For now, we'll generate synthetic data based on contract age
    
    const now = new Date();
    const history = [];
    
    // Generate data points for the last 4 months
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      
      // Generate a score that generally improves over time
      // Starting from a base of 70 and improving by 3-5 points per month
      const baseScore = 70;
      const improvement = i * (3 + Math.floor(Math.random() * 3));
      const score = baseScore + improvement;
      
      history.push({
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        score: Math.min(100, score) // Cap at 100
      });
    }
    
    return history;
  } catch (error) {
    console.error('Error generating historical data:', error);
    // Return minimal placeholder data on error
    return [
      { date: new Date().toISOString().split('T')[0], score: 75 }
    ];
  }
}

/**
 * Identify strengths and concerns based on factor scores
 * @param {Array} factors - Trust score factors
 * @returns {Object} Strengths and concerns
 */
function identifyStrengthsAndConcerns(factors) {
  const strengths = [];
  const concerns = [];
  
  // Identify strengths (high scores)
  factors.forEach(factor => {
    if (factor.score >= 85) {
      switch (factor.name) {
        case 'Contract Security':
          strengths.push('Secure contract implementation');
          break;
        case 'Developer Reputation':
          strengths.push('Strong developer team with verified history');
          break;
        case 'Transaction History':
          strengths.push('Consistent transaction patterns');
          break;
        case 'Community Metrics':
          strengths.push('High community engagement');
          break;
        case 'Metadata Reliability':
          strengths.push('Reliable and consistent metadata');
          break;
      }
    }
  });
  
  // Identify concerns (low scores)
  factors.forEach(factor => {
    if (factor.score < 80) {
      switch (factor.name) {
        case 'Contract Security':
          concerns.push('Potential contract vulnerabilities');
          break;
        case 'Developer Reputation':
          concerns.push('Limited developer history');
          break;
        case 'Transaction History':
          concerns.push('Unusual transaction patterns');
          break;
        case 'Community Metrics':
          concerns.push('Limited community engagement');
          break;
        case 'Metadata Reliability':
          concerns.push('Some metadata inconsistencies');
          break;
      }
    }
  });
  
  return { strengths, concerns };
}

/**
 * Calculate creator score
 * @param {string} creatorAddress - Creator's Ethereum address
 * @returns {Promise<number>} Creator score (0-100)
 */
async function calculateCreatorScore(creatorAddress) {
  // This would involve analyzing the creator's history and reputation
  // For demonstration, we'll use a placeholder score
  return 90;
}