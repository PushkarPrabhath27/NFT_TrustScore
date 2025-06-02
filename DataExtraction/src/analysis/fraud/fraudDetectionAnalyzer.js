/**
 * Fraud Detection Module
 * Scans for smart contract vulnerabilities, suspicious transaction patterns,
 * metadata authenticity, and wash trading indicators
 */

/**
 * Analyze contract for fraud indicators
 * @param {Object} contractData - Contract data from Ethereum blockchain
 * @returns {Promise<Object>} Fraud detection results
 */
export const analyze = async (contractData) => {
  try {
    // Handle non-contract addresses
    if (contractData.isContract === false) {
      return {
        fraudScore: 'N/A',
        alertLevel: 'Info',
        alertMessage: 'This address does not contain contract code. Fraud detection is limited.',
        indicators: [
          {
            name: 'Address Type',
            result: 'Non-Contract',
            severity: 'Info',
            details: `This is a regular wallet address with ${contractData.balance || 'unknown'} ETH balance. No smart contract code to analyze.`
          }
        ]
      };
    }
    
    // Handle non-NFT contracts
    if (contractData.type === 'other-contract' || contractData.type === 'non-contract') {
      return {
        fraudScore: 50,
        alertLevel: 'Medium',
        alertMessage: 'This is a non-standard smart contract. Limited fraud detection possible.',
        indicators: [
          {
            name: 'Contract Type',
            result: 'Non-Standard',
            severity: 'Medium',
            details: 'This smart contract does not implement standard NFT interfaces (ERC721/ERC1155). Manual code review recommended.'
          },
          {
            name: 'Transaction Analysis',
            result: 'Limited',
            severity: 'Medium',
            details: `${contractData.transactions ? contractData.transactions.length : 0} transactions analyzed. Non-standard contract behavior may hide suspicious patterns.`
          }
        ]
      };
    }
    
    // Scan for different fraud indicators
    const washTradingResult = await detectWashTrading(contractData);
    const contractVulnerabilitiesResult = await detectContractVulnerabilities(contractData);
    const metadataAuthenticityResult = await verifyMetadataAuthenticity(contractData);
    const developerHistoryResult = await checkDeveloperHistory(contractData);
    
    // Compile all indicators
    const indicators = [
      washTradingResult,
      contractVulnerabilitiesResult,
      metadataAuthenticityResult,
      developerHistoryResult
    ];
    
    // Calculate overall fraud score (0-100, lower is better)
    const fraudScore = calculateFraudScore(indicators);
    
    // Determine alert level
    const alertLevel = determineFraudAlertLevel(fraudScore);
    
    // Generate alert message
    const alertMessage = generateFraudAlertMessage(alertLevel, indicators);
    
    return {
      fraudScore,
      alertLevel,
      alertMessage,
      indicators
    };
  } catch (error) {
    console.error('Error in fraud detection analysis:', error);
    throw error;
  }
};

/**
 * Detect wash trading by analyzing transaction patterns
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Wash trading detection result
 */
async function detectWashTrading(contractData) {
  try {
    // Extract transaction history from contract data
    const transactions = contractData.transactions || [];
    
    // Check for circular trading patterns (same NFT repeatedly traded between same addresses)
    const circularTradingPatterns = detectCircularTrading(transactions);
    
    // Check for abnormal trading frequency
    const abnormalFrequency = detectAbnormalFrequency(transactions);
    
    // Check for price manipulation patterns
    const priceManipulation = detectPriceManipulation(transactions);
    
    // Determine severity based on findings
    let severity = 'None';
    let details = 'No suspicious trading patterns detected';
    
    if (circularTradingPatterns.length > 0 && priceManipulation) {
      severity = 'Critical';
      details = `Detected ${circularTradingPatterns.length} circular trading patterns and price manipulation`;
    } else if (circularTradingPatterns.length > 0) {
      severity = 'High';
      details = `Detected ${circularTradingPatterns.length} circular trading patterns`;
    } else if (priceManipulation) {
      severity = 'Medium';
      details = 'Detected potential price manipulation patterns';
    } else if (abnormalFrequency) {
      severity = 'Low';
      details = 'Abnormal trading frequency detected';
    }
    
    return {
      name: 'Wash Trading',
      severity,
      details
    };
  } catch (error) {
    console.error('Error in wash trading detection:', error);
    return {
      name: 'Wash Trading',
      severity: 'Unknown',
      details: 'Error analyzing trading patterns'
    };
  }
}

/**
 * Detect circular trading patterns
 * @param {Array} transactions - Transaction history
 * @returns {Array} Detected circular trading patterns
 */
function detectCircularTrading(transactions) {
  // For demonstration purposes, we'll implement a simplified version
  const patterns = [];
  const addressPairs = new Map();
  
  // Track transactions between address pairs
  transactions.forEach(tx => {
    if (!tx.from || !tx.to || !tx.tokenId) return;
    
    const key = `${tx.from}-${tx.to}-${tx.tokenId}`;
    const reverseKey = `${tx.to}-${tx.from}-${tx.tokenId}`;
    
    if (addressPairs.has(reverseKey)) {
      // Found a circular pattern
      patterns.push({
        tokenId: tx.tokenId,
        addresses: [tx.from, tx.to],
        transactions: [addressPairs.get(reverseKey), tx]
      });
    }
    
    addressPairs.set(key, tx);
  });
  
  return patterns;
}

/**
 * Detect abnormal trading frequency
 * @param {Array} transactions - Transaction history
 * @returns {boolean} Whether abnormal frequency was detected
 */
function detectAbnormalFrequency(transactions) {
  if (transactions.length < 5) return false;
  
  // Group transactions by token ID
  const tokenTransactions = new Map();
  transactions.forEach(tx => {
    if (!tx.tokenId || !tx.timestamp) return;
    
    if (!tokenTransactions.has(tx.tokenId)) {
      tokenTransactions.set(tx.tokenId, []);
    }
    tokenTransactions.get(tx.tokenId).push(tx);
  });
  
  // Check for tokens with abnormally high trading frequency
  for (const [tokenId, txs] of tokenTransactions.entries()) {
    if (txs.length < 5) continue;
    
    // Sort transactions by timestamp
    txs.sort((a, b) => a.timestamp - b.timestamp);
    
    // Check time intervals between transactions
    const intervals = [];
    for (let i = 1; i < txs.length; i++) {
      intervals.push(txs[i].timestamp - txs[i-1].timestamp);
    }
    
    // Calculate average interval
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    // If average interval is less than 1 hour (3600 seconds), flag as abnormal
    if (avgInterval < 3600) {
      return true;
    }
  }
  
  return false;
}

/**
 * Detect price manipulation patterns
 * @param {Array} transactions - Transaction history
 * @returns {boolean} Whether price manipulation was detected
 */
function detectPriceManipulation(transactions) {
  if (transactions.length < 5) return false;
  
  // Group transactions by token ID
  const tokenTransactions = new Map();
  transactions.forEach(tx => {
    if (!tx.tokenId || !tx.price) return;
    
    if (!tokenTransactions.has(tx.tokenId)) {
      tokenTransactions.set(tx.tokenId, []);
    }
    tokenTransactions.get(tx.tokenId).push(tx);
  });
  
  // Check for tokens with suspicious price patterns
  for (const [tokenId, txs] of tokenTransactions.entries()) {
    if (txs.length < 5) continue;
    
    // Sort transactions by timestamp
    txs.sort((a, b) => a.timestamp - b.timestamp);
    
    // Check for rapid price increases followed by drops
    for (let i = 2; i < txs.length; i++) {
      const price1 = txs[i-2].price;
      const price2 = txs[i-1].price;
      const price3 = txs[i].price;
      
      // If price increased by 100% and then dropped by 50%
      if (price2 > price1 * 2 && price3 < price2 * 0.5) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Detect contract vulnerabilities through static code analysis
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Contract vulnerabilities detection result
 */
async function detectContractVulnerabilities(contractData) {
  try {
    // Extract contract code and ABI from contract data
    const contractCode = contractData.sourceCode || '';
    const contractAbi = contractData.abi || [];
    
    // Initialize vulnerabilities array
    const vulnerabilities = [];
    
    // Check for reentrancy vulnerabilities
    const reentrancyIssues = checkForReentrancy(contractCode);
    if (reentrancyIssues) vulnerabilities.push(reentrancyIssues);
    
    // Check for integer overflow/underflow vulnerabilities
    const integerIssues = checkForIntegerOverflow(contractCode);
    if (integerIssues) vulnerabilities.push(integerIssues);
    
    // Check for access control issues
    const accessControlIssues = checkForAccessControlIssues(contractCode, contractAbi);
    if (accessControlIssues) vulnerabilities.push(accessControlIssues);
    
    // Check for front-running vulnerabilities
    const frontRunningIssues = checkForFrontRunning(contractCode);
    if (frontRunningIssues) vulnerabilities.push(frontRunningIssues);
    
    // Determine severity based on findings
    let severity = 'None';
    let details = 'No vulnerabilities detected';
    
    if (vulnerabilities.length > 0) {
      // Find the highest severity vulnerability
      const severityLevels = {
        'Critical': 4,
        'High': 3,
        'Medium': 2,
        'Low': 1,
        'None': 0
      };
      
      let highestSeverity = 'None';
      vulnerabilities.forEach(vuln => {
        if (severityLevels[vuln.severity] > severityLevels[highestSeverity]) {
          highestSeverity = vuln.severity;
        }
      });
      
      severity = highestSeverity;
      details = `Found ${vulnerabilities.length} potential vulnerabilities: ${vulnerabilities.map(v => v.name).join(', ')}`;
    }
    
    return {
      name: 'Smart Contract Vulnerabilities',
      severity,
      details,
      vulnerabilities
    };
  } catch (error) {
    console.error('Error in contract vulnerability detection:', error);
    return {
      name: 'Smart Contract Vulnerabilities',
      severity: 'Unknown',
      details: 'Error analyzing contract code'
    };
  }
}

/**
 * Check for reentrancy vulnerabilities
 * @param {string} contractCode - Smart contract source code
 * @returns {Object|null} Vulnerability details if found
 */
function checkForReentrancy(contractCode) {
  // Check for patterns that might indicate reentrancy vulnerabilities
  const hasExternalCalls = /(\.call\{value|\.(send|transfer)\()/i.test(contractCode);
  const hasStateChangesAfterCalls = /(\.call\{value.*?;\s*\w+\s*=|\.(send|transfer)\(.*?;\s*\w+\s*=)/is.test(contractCode);
  
  if (hasExternalCalls && hasStateChangesAfterCalls) {
    return {
      name: 'Reentrancy',
      severity: 'High',
      description: 'Contract may be vulnerable to reentrancy attacks due to state changes after external calls'
    };
  }
  
  return null;
}

/**
 * Check for integer overflow/underflow vulnerabilities
 * @param {string} contractCode - Smart contract source code
 * @returns {Object|null} Vulnerability details if found
 */
function checkForIntegerOverflow(contractCode) {
  // Check if SafeMath is used
  const usesSafeMath = /using\s+SafeMath\s+for\s+uint/i.test(contractCode);
  
  // Check for unchecked arithmetic operations
  const hasUncheckedArithmetic = /\w+\s*\+=|\w+\s*\-=|\w+\s*\*=|\w+\s*\/=|\+\+\w+|\w+\+\+|\-\-\w+|\w+\-\-/g.test(contractCode);
  
  if (hasUncheckedArithmetic && !usesSafeMath && !/0\.8\.[0-9]+/.test(contractCode)) {
    return {
      name: 'Integer Overflow/Underflow',
      severity: 'Medium',
      description: 'Contract may be vulnerable to integer overflow/underflow attacks due to unchecked arithmetic operations'
    };
  }
  
  return null;
}

/**
 * Check for access control issues
 * @param {string} contractCode - Smart contract source code
 * @param {Array} contractAbi - Smart contract ABI
 * @returns {Object|null} Vulnerability details if found
 */
function checkForAccessControlIssues(contractCode, contractAbi) {
  // Check for missing access control modifiers
  const hasCriticalFunctions = /(function\s+withdraw|function\s+transferOwnership|function\s+selfdestruct|function\s+suicide)/i.test(contractCode);
  const hasAccessControl = /(onlyOwner|require\(\s*msg\.sender\s*==\s*owner\)|require\(\s*_isOwner\(\)\s*\))/i.test(contractCode);
  
  if (hasCriticalFunctions && !hasAccessControl) {
    return {
      name: 'Access Control',
      severity: 'Critical',
      description: 'Critical functions may lack proper access control mechanisms'
    };
  }
  
  return null;
}

/**
 * Check for front-running vulnerabilities
 * @param {string} contractCode - Smart contract source code
 * @returns {Object|null} Vulnerability details if found
 */
function checkForFrontRunning(contractCode) {
  // Check for patterns that might indicate front-running vulnerabilities
  const hasPriceCalculation = /(price|rate|value)\s*=\s*[^;]+/i.test(contractCode);
  const hasTimeLocks = /block\.(timestamp|number)/i.test(contractCode);
  
  if (hasPriceCalculation && !hasTimeLocks) {
    return {
      name: 'Front-Running',
      severity: 'Medium',
      description: 'Contract may be vulnerable to front-running attacks due to price calculations without time locks'
    };
  }
  
  return null;
}

/**
 * Verify metadata authenticity by checking consistency and validity
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Metadata authenticity verification result
 */
async function verifyMetadataAuthenticity(contractData) {
  try {
    // Extract metadata from contract data
    const metadata = contractData.metadata || {};
    const tokenUris = contractData.tokenUris || [];
    
    // Initialize issues array
    const issues = [];
    
    // Check for metadata completeness
    const completenessIssues = checkMetadataCompleteness(metadata);
    if (completenessIssues) issues.push(completenessIssues);
    
    // Check for metadata consistency across tokens
    const consistencyIssues = checkMetadataConsistency(tokenUris);
    if (consistencyIssues) issues.push(consistencyIssues);
    
    // Check for metadata URI validity
    const uriValidityIssues = checkUriValidity(tokenUris);
    if (uriValidityIssues) issues.push(uriValidityIssues);
    
    // Check for metadata tampering
    const tamperingIssues = checkForMetadataTampering(contractData);
    if (tamperingIssues) issues.push(tamperingIssues);
    
    // Determine severity based on findings
    let severity = 'None';
    let details = 'All metadata properly verified';
    
    if (issues.length > 0) {
      // Find the highest severity issue
      const severityLevels = {
        'Critical': 4,
        'High': 3,
        'Medium': 2,
        'Low': 1,
        'None': 0
      };
      
      let highestSeverity = 'None';
      issues.forEach(issue => {
        if (severityLevels[issue.severity] > severityLevels[highestSeverity]) {
          highestSeverity = issue.severity;
        }
      });
      
      severity = highestSeverity;
      details = `Found ${issues.length} metadata issues: ${issues.map(i => i.name).join(', ')}`;
    }
    
    return {
      name: 'Metadata Authenticity',
      severity,
      details,
      issues
    };
  } catch (error) {
    console.error('Error in metadata authenticity verification:', error);
    return {
      name: 'Metadata Authenticity',
      severity: 'Unknown',
      details: 'Error analyzing metadata'
    };
  }
}

/**
 * Check metadata completeness
 * @param {Object} metadata - Contract metadata
 * @returns {Object|null} Issue details if found
 */
function checkMetadataCompleteness(metadata) {
  // Check for required metadata fields
  const requiredFields = ['name', 'description', 'image'];
  const missingFields = requiredFields.filter(field => !metadata[field]);
  
  if (missingFields.length > 0) {
    return {
      name: 'Incomplete Metadata',
      severity: missingFields.includes('image') ? 'Medium' : 'Low',
      description: `Missing required metadata fields: ${missingFields.join(', ')}`
    };
  }
  
  return null;
}

/**
 * Check metadata consistency across tokens
 * @param {Array} tokenUris - Array of token URIs
 * @returns {Object|null} Issue details if found
 */
function checkMetadataConsistency(tokenUris) {
  if (tokenUris.length < 2) return null;
  
  // Check for inconsistent URI patterns
  const uriPatterns = new Set();
  tokenUris.forEach(uri => {
    // Extract the base pattern (everything before the token ID)
    const pattern = uri.replace(/\d+(\.json)?$/, '{id}$1');
    uriPatterns.add(pattern);
  });
  
  if (uriPatterns.size > 1) {
    return {
      name: 'Inconsistent Metadata URIs',
      severity: 'Medium',
      description: `Found ${uriPatterns.size} different URI patterns across tokens`
    };
  }
  
  return null;
}

/**
 * Check URI validity
 * @param {Array} tokenUris - Array of token URIs
 * @returns {Object|null} Issue details if found
 */
function checkUriValidity(tokenUris) {
  if (tokenUris.length === 0) return null;
  
  // Check for centralized storage
  const centralizedStoragePatterns = [
    /^http:\/\//i,  // Non-HTTPS URLs
    /^https:\/\/api\./i,  // API endpoints that might change
    /^https:\/\/[^\/]+\.com\/[^\/]+/i  // Generic web hosting
  ];
  
  const hasCentralizedStorage = tokenUris.some(uri => 
    centralizedStoragePatterns.some(pattern => pattern.test(uri))
  );
  
  // Check for decentralized storage
  const decentralizedStoragePatterns = [
    /^ipfs:\/\//i,
    /^https:\/\/ipfs\.io\//i,
    /^https:\/\/[^\/]+\.infura\.io\//i,
    /^https:\/\/[^\/]+\.arweave\.net\//i
  ];
  
  const hasDecentralizedStorage = tokenUris.some(uri => 
    decentralizedStoragePatterns.some(pattern => pattern.test(uri))
  );
  
  if (hasCentralizedStorage && !hasDecentralizedStorage) {
    return {
      name: 'Centralized Metadata Storage',
      severity: 'Medium',
      description: 'Metadata is stored on centralized servers which may lead to availability issues'
    };
  }
  
  return null;
}

/**
 * Check for metadata tampering
 * @param {Object} contractData - Contract data
 * @returns {Object|null} Issue details if found
 */
function checkForMetadataTampering(contractData) {
  // Check if contract has a frozen metadata flag
  const isFrozen = contractData.metadataFrozen || false;
  
  // Check if contract has a function to update metadata URIs
  const hasUpdateFunction = contractData.sourceCode && 
    /(function\s+setBaseURI|function\s+setTokenURI)/i.test(contractData.sourceCode);
  
  if (hasUpdateFunction && !isFrozen) {
    return {
      name: 'Mutable Metadata',
      severity: 'High',
      description: 'Contract allows metadata to be changed after minting, which may lead to fraud'
    };
  }
  
  return null;
}

/**
 * Check developer history for suspicious activity
 * @param {Object} contractData - Contract data
 * @returns {Promise<Object>} Developer history check result
 */
async function checkDeveloperHistory(contractData) {
  try {
    // Extract developer information from contract data
    const developerAddress = contractData.developerAddress || '';
    const developerContracts = contractData.developerContracts || [];
    const developerTransactions = contractData.developerTransactions || [];
    
    // Initialize risk factors array
    const riskFactors = [];
    
    // Check for developer address age
    const addressAgeRisk = checkAddressAge(contractData);
    if (addressAgeRisk) riskFactors.push(addressAgeRisk);
    
    // Check for previous rug pulls or scams
    const previousScamsRisk = checkPreviousScams(developerContracts);
    if (previousScamsRisk) riskFactors.push(previousScamsRisk);
    
    // Check for suspicious transaction patterns
    const suspiciousTransactionsRisk = checkSuspiciousTransactions(developerTransactions);
    if (suspiciousTransactionsRisk) riskFactors.push(suspiciousTransactionsRisk);
    
    // Check for developer social presence
    const socialPresenceRisk = checkSocialPresence(contractData);
    if (socialPresenceRisk) riskFactors.push(socialPresenceRisk);
    
    // Determine severity based on findings
    let severity = 'None';
    let details = 'Developer has positive track record';
    
    if (riskFactors.length > 0) {
      // Find the highest severity risk factor
      const severityLevels = {
        'Critical': 4,
        'High': 3,
        'Medium': 2,
        'Low': 1,
        'None': 0
      };
      
      let highestSeverity = 'None';
      riskFactors.forEach(risk => {
        if (severityLevels[risk.severity] > severityLevels[highestSeverity]) {
          highestSeverity = risk.severity;
        }
      });
      
      severity = highestSeverity;
      details = `Found ${riskFactors.length} developer risk factors: ${riskFactors.map(r => r.name).join(', ')}`;
    }
    
    return {
      name: 'Developer History',
      severity,
      details,
      riskFactors
    };
  } catch (error) {
    console.error('Error in developer history check:', error);
    return {
      name: 'Developer History',
      severity: 'Unknown',
      details: 'Error analyzing developer history'
    };
  }
}

/**
 * Check address age
 * @param {Object} contractData - Contract data
 * @returns {Object|null} Risk factor details if found
 */
function checkAddressAge(contractData) {
  // Check how old the developer address is
  const addressCreationBlock = contractData.developerAddressCreationBlock || 0;
  const contractCreationBlock = contractData.creationBlock || 0;
  
  if (addressCreationBlock === 0) return null;
  
  // Calculate the difference in blocks
  const blockDifference = contractCreationBlock - addressCreationBlock;
  
  // If address was created less than 1000 blocks before the contract
  if (blockDifference < 1000 && blockDifference >= 0) {
    return {
      name: 'New Developer Address',
      severity: 'High',
      description: 'Developer address was created shortly before the contract, which may indicate a throwaway account'
    };
  }
  
  return null;
}

/**
 * Check for previous scams
 * @param {Array} developerContracts - Previous contracts by the developer
 * @returns {Object|null} Risk factor details if found
 */
function checkPreviousScams(developerContracts) {
  if (developerContracts.length === 0) return null;
  
  // Check if any previous contracts were flagged as scams
  const scamContracts = developerContracts.filter(contract => contract.isScam);
  
  if (scamContracts.length > 0) {
    return {
      name: 'Previous Scams',
      severity: 'Critical',
      description: `Developer has been associated with ${scamContracts.length} previous scam contracts`
    };
  }
  
  return null;
}

/**
 * Check for suspicious transactions
 * @param {Array} transactions - Developer transactions
 * @returns {Object|null} Risk factor details if found
 */
function checkSuspiciousTransactions(transactions) {
  if (transactions.length === 0) return null;
  
  // Check for large fund withdrawals
  const largeWithdrawals = transactions.filter(tx => 
    tx.type === 'withdrawal' && tx.value > 10 // More than 10 ETH
  );
  
  if (largeWithdrawals.length > 0) {
    return {
      name: 'Large Withdrawals',
      severity: 'Medium',
      description: `Developer has made ${largeWithdrawals.length} large fund withdrawals`
    };
  }
  
  return null;
}

/**
 * Check for developer social presence
 * @param {Object} contractData - Contract data
 * @returns {Object|null} Risk factor details if found
 */
function checkSocialPresence(contractData) {
  // Check if developer has verified social media accounts
  const hasSocialMedia = contractData.developerSocialMedia && 
    Object.keys(contractData.developerSocialMedia).length > 0;
  
  // Check if developer has a verified identity
  const hasVerifiedIdentity = contractData.developerVerified || false;
  
  if (!hasSocialMedia && !hasVerifiedIdentity) {
    return {
      name: 'No Social Presence',
      severity: 'Medium',
      description: 'Developer has no verified social media accounts or identity'
    };
  }
  
  return null;
}

/**
 * Calculate fraud score
 * @param {Array} indicators - Fraud indicators
 * @returns {number} Fraud score (0-100, lower is better)
 */
function calculateFraudScore(indicators) {
  // Map severity to score
  const severityScores = {
    'None': 0,
    'Low': 25,
    'Medium': 50,
    'High': 75,
    'Critical': 100
  };
  
  // Calculate average score
  const totalScore = indicators.reduce((sum, indicator) => {
    return sum + severityScores[indicator.severity] || 0;
  }, 0);
  
  return Math.round(totalScore / indicators.length);
}

/**
 * Determine fraud alert level
 * @param {number} fraudScore - Fraud score
 * @returns {string} Alert level (Low, Medium, High, Critical)
 */
function determineFraudAlertLevel(fraudScore) {
  if (fraudScore < 20) {
    return 'Low';
  } else if (fraudScore < 40) {
    return 'Medium';
  } else if (fraudScore < 70) {
    return 'High';
  } else {
    return 'Critical';
  }
}

/**
 * Generate fraud alert message
 * @param {string} alertLevel - Alert level
 * @param {Array} indicators - Fraud indicators
 * @returns {string} Alert message
 */
function generateFraudAlertMessage(alertLevel, indicators) {
  switch (alertLevel) {
    case 'Low':
      return 'No significant fraud indicators detected';
    case 'Medium':
      return 'Some potential fraud indicators detected, exercise caution';
    case 'High':
      return 'Multiple fraud indicators detected, high risk';
    case 'Critical':
      return 'Critical fraud indicators detected, avoid this contract';
    default:
      return 'Unable to determine fraud risk';
  }
}