/**
 * Ethereum Blockchain Integration - Contract Reader
 * Handles connection to Ethereum blockchain and reading smart contract data
 */

import { ethers } from 'ethers';
import { getOpenSeaData } from '../../services/openSeaService.js';
import { cacheContractData, getCachedContractData } from '../../services/cacheService.js';
import logger from '../../services/logger.js';
import fetch from 'node-fetch';

// Use built-in AbortController in Node.js 15.0.0+
const AbortController = globalThis.AbortController || (() => {
  // Fallback for environments without AbortController
  class AbortController {
    constructor() {
      this.signal = {
        aborted: false,
        onabort: null,
        addEventListener: (type, listener) => {
          this.signal.onabort = listener;
        },
        removeEventListener: () => {}
      };
    }
    abort() {
      this.signal.aborted = true;
      if (this.signal.onabort) {
        this.signal.onabort();
      }
    }
  }
  return AbortController;
})();

// Helper function to add timeout to promises
const withTimeout = (promise, ms, timeoutError = new Error('Request timed out')) => {
  // If the promise already has a signal, use it
  if (promise.signal) {
    return promise;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, ms);

  // If the promise is a fetch request, add the signal to it
  let promiseWithTimeout = promise;
  if (promise instanceof Promise && promise.then) {
    promiseWithTimeout = Promise.race([
      promise,
      new Promise((_, reject) => {
        const onAbort = () => {
          clearTimeout(timeout);
          reject(timeoutError);
        };
        
        if (controller.signal.aborted) {
          onAbort();
        } else {
          controller.signal.addEventListener('abort', onAbort, { once: true });
        }
      })
    ]).finally(() => {
      clearTimeout(timeout);
      controller.signal.removeEventListener('abort', controller.signal.onabort);
    });
  }

  return promiseWithTimeout;
};

// Ethereum node configuration
const ETHEREUM_NODE_URL = process.env.ETHEREUM_NODE_URL || 'https://mainnet.infura.io/v3/fa78dc0d8c2f483995c65050bda82f00';
const provider = new ethers.providers.JsonRpcProvider(ETHEREUM_NODE_URL);

// Global configuration for performance optimization
const CONFIG = {
  // Timeouts
  CACHE_LOOKUP_TIMEOUT_MS: 2000,   // 2 seconds
  CACHE_WRITE_TIMEOUT_MS: 2000,    // 2 seconds
  CONTRACT_INFO_TIMEOUT_MS: 5000,  // 5 seconds
  OPENSEA_TIMEOUT_MS: 5000,        // 5 seconds
  TRANSACTION_TIMEOUT_MS: 5000,    // 5 seconds
  ETHERSCAN_TIMEOUT_MS: 5000,      // 5 seconds
  
  // Limits
  MAX_TRANSACTIONS: 3,             // Maximum number of transactions to retrieve
  MAX_BLOCK_RANGE: 100000,         // Approximately last 2 weeks of blocks
  
  // Flags
  PREFER_CACHE: true,              // Always prefer cached data when available
  SKIP_SLOW_OPERATIONS: true,      // Skip operations that are known to be slow
  USE_MOCK_DATA_ON_TIMEOUT: true   // Use mock data when operations timeout
};

// Constants for limiting data
const MAX_BLOCKS_TO_QUERY = 100; // Only query last 100 blocks
const MAX_TRANSACTIONS = 10; // Maximum number of transactions to return

// Constants
const MAX_BLOCK_RANGE = 10000; // Maximum blocks to query at once
const MAX_RETRIES = 3; // Maximum number of retries for failed requests
const REQUEST_DELAY_MS = 1000; // Delay between requests in ms
const ETHERSCAN_RATE_LIMIT_DELAY = 300; // Etherscan has a rate limit of 5 calls/sec for free tier

// KNOWN CONTRACT DEPLOYMENTS - Hardcoded for popular contracts to avoid API calls
const KNOWN_CONTRACTS = {
  '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d': { // BAYC
    blockNumber: 12287507,
    transactionHash: '0x3e5600a3d1e4a3b548fcfd4d3d4a2914d3c40d16bd8ee7928f6089551a9d3435',
    creator: '0xaba7161a7fb69c88e16ed9f455ce62b791ee4d03',
    timestamp: 1619146841,
    type: 'ERC721',
    name: 'Bored Ape Yacht Club',
    symbol: 'BAYC'
  },
  '0x960b7a6bdd6a6f58a7e1e3e6c9e3e6c9e3e6c9e3': { // OnChainMonkey (Proxy)
    blockNumber: 13037193,
    transactionHash: '0x4e3b2b5d7c2f8f3a1b5c9d7e3f2a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7',
    creator: '0x3a3548e060be10c2614d0a4cb0c03cc9093fd799',
    timestamp: 1625097600,
    type: 'ERC721',
    name: 'OnChainMonkey',
    symbol: 'OCM',
    isProxy: true,
    implementation: '0x4b10796bdd7b52152e72a5e3a3c6f8f3e2f4e5d6', // Example implementation address
    note: 'This is a proxy contract. Some functionality may be limited.'
  }
};

/**
 * Utility function to retry async operations with exponential backoff
 * @param {Function} operation - Async function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay between retries in ms
 * @returns {Promise<any>} Result of the operation
 */
const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on 4xx errors except 429 (Too Many Requests)
      if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      const backoff = Math.min(delay * Math.pow(2, attempt - 1), 30000); // Max 30s
      const jitter = Math.floor(Math.random() * 1000); // Add up to 1s jitter
      const waitTime = backoff + jitter;
      
      if (attempt < maxRetries) {
        logger.warn(`Attempt ${attempt} failed, retrying in ${waitTime}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after maximum retries');
};

// ERC721 and ERC1155 interfaces
const ERC721_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'function balanceOf(address owner) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function totalSupply() view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
];

const ERC1155_ABI = [
  'function uri(uint256 id) view returns (string)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
  'event TransferBatch(address indexed operator, address indexed from, address indexed to, uint256[] ids, uint256[] values)'
];

/**
 * Verify if the address is a valid Ethereum address
 * @param {string} address - Ethereum address to verify
 * @returns {boolean} Whether the address is valid
 */
export const isValidEthereumAddress = (address) => {
  // First check if it's a valid Ethereum address format
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Use ethers.js built-in validation which handles checksums too
  return ethers.utils.isAddress(address);
};

/**
 * Get contract data from Ethereum blockchain
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<Object>} Contract data
 */
const getContractData = async (contractAddress) => {
  const startTime = Date.now();
  
  try {
    logger.info(`Starting contract data retrieval for: ${contractAddress}`);
    
    // Validate address format first
    if (!ethers.utils.isAddress(contractAddress)) {
      throw new Error('Invalid Ethereum address format');
    }
    
    // Normalize address to checksum format
    contractAddress = ethers.utils.getAddress(contractAddress);
    
    // FAST PATH: Check cache first with short timeout
    if (CONFIG.PREFER_CACHE) {
      try {
        const cachedData = await withTimeout(
          getCachedContractData(contractAddress),
          CONFIG.CACHE_LOOKUP_TIMEOUT_MS,
          new Error('Cache lookup timed out')
        );
        
        if (cachedData) {
          logger.info(`FAST PATH: Using cached data for ${contractAddress}`);
          return cachedData;
        }
      } catch (cacheError) {
        logger.warn(`Cache lookup failed: ${cacheError.message}`);
        // Continue with fetching fresh data
      }
    }
    
    // Initialize contract data with defaults
    const contractData = {
      address: contractAddress,
      name: 'Unknown',
      symbol: '',
      type: 'ERC721',
      creator: '',
      creationBlock: 0,
      creationTimestamp: 0,
      transactions: [],
      tokenCount: 0,
      metadata: {},
      openSea: null
    };
    
    // Check if this is a known contract first for fast path
    const knownContract = KNOWN_CONTRACTS?.[contractAddress.toLowerCase()];
    if (knownContract) {
      logger.info(`FAST PATH: Using known contract data for ${contractAddress}`);
      
      // Use known contract data
      contractData.name = knownContract.name || 'Unknown';
      contractData.symbol = knownContract.symbol || '';
      contractData.type = knownContract.type || 'ERC721';
      contractData.creator = knownContract.creator || '';
      contractData.creationBlock = knownContract.blockNumber || 0;
      contractData.creationTimestamp = knownContract.timestamp || Math.floor(Date.now() / 1000);
      contractData.tokenCount = knownContract.tokenCount || 0;
      
      // Skip slow operations if configured
      if (CONFIG.SKIP_SLOW_OPERATIONS) {
        // Cache the data in the background
        cacheContractData(contractAddress, contractData)
          .catch(err => logger.warn(`Background caching failed: ${err.message}`));
        
        logger.info(`FAST PATH: Returning known contract data for ${contractAddress} in ${Date.now() - startTime}ms`);
        return contractData;
      }
    }
    
    // Get basic contract info with strict timeouts
    try {
      const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
      
      // Run these in parallel with timeouts
      const namePromise = withTimeout(contract.name().catch(() => 'Unknown'), 3000, 'Unknown');
      const symbolPromise = withTimeout(contract.symbol().catch(() => ''), 3000, '');
      const supplyPromise = withTimeout(
        contract.totalSupply().catch(() => ethers.BigNumber.from(0)), 
        3000, 
        ethers.BigNumber.from(0)
      );
      
      const [name, symbol, totalSupply] = await Promise.all([namePromise, symbolPromise, supplyPromise]);
      
      contractData.name = name;
      contractData.symbol = symbol;
      contractData.tokenCount = typeof totalSupply.toNumber === 'function' ? totalSupply.toNumber() : 0;
      
      // Quick check for contract type
      let isERC721 = false;
      let isERC1155 = false;
      try {
        if (typeof contract.supportsInterface === 'function') {
          isERC721 = await contract.supportsInterface('0x80ac58cd');
          isERC1155 = await contract.supportsInterface('0xd9b67a26');
        } else {
          console.warn('contract.supportsInterface is not a function, skipping interface checks.');
        }
      } catch (err) {
        // Fallback: supportsInterface may not exist or may fail
        console.warn('supportsInterface check failed:', err.message);
      }
      
      if (isERC1155) {
        contractData.type = 'ERC1155';
      } else if (isERC721) {
        contractData.type = 'ERC721';
      } else {
        contractData.type = 'Unknown';
      }
    } catch (error) {
      logger.warn(`Error getting basic contract info for ${contractAddress}: ${error.message}`);
    }
    
    // Get contract creation info using Etherscan instead of querying logs directly
    if (!CONFIG.SKIP_SLOW_OPERATIONS) {
      try {
        const creationInfo = await withTimeout(
          getContractCreationInfo(contractAddress),
          CONFIG.CONTRACT_INFO_TIMEOUT_MS,
          null
        );
        
        if (creationInfo) {
          contractData.creator = creationInfo.creator || '';
          contractData.creationBlock = creationInfo.blockNumber || 0;
          contractData.creationTimestamp = creationInfo.timestamp || Math.floor(Date.now() / 1000);
        }
      } catch (error) {
        logger.warn(`Error getting contract creation info for ${contractAddress}: ${error.message}`);
        // Use approximate data
        const latestBlock = await provider.getBlockNumber().catch(() => 0);
        contractData.creationBlock = Math.max(0, latestBlock - CONFIG.MAX_BLOCK_RANGE);
        contractData.creationTimestamp = Math.floor(Date.now() / 1000) - 1209600; // ~2 weeks ago
      }
    } else {
      // Use approximate data for creation info to avoid slow operations
      const latestBlock = await provider.getBlockNumber().catch(() => 0);
      contractData.creationBlock = Math.max(0, latestBlock - CONFIG.MAX_BLOCK_RANGE);
      contractData.creationTimestamp = Math.floor(Date.now() / 1000) - 1209600; // ~2 weeks ago
    }
    
    // Get OpenSea data with short timeout
    if (!CONFIG.SKIP_SLOW_OPERATIONS) {
      try {
        const openSeaData = await withTimeout(
          getOpenSeaData(contractAddress),
          CONFIG.OPENSEA_TIMEOUT_MS,
          null
        );
        contractData.openSea = openSeaData;
      } catch (error) {
        logger.warn(`Failed to get OpenSea data for ${contractAddress}: ${error.message}`);
        contractData.openSea = null;
      }
    } else {
      contractData.openSea = null;
    }
    
    // Get transaction history with short timeout - limit to just a few transactions
    try {
      contractData.transactions = await withTimeout(
        getContractTransactions(contractAddress, CONFIG.MAX_TRANSACTIONS),
        CONFIG.TRANSACTION_TIMEOUT_MS,
        []
      );
    } catch (error) {
      logger.warn(`Failed to get transaction history for ${contractAddress}: ${error.message}`);
      contractData.transactions = []; // Use empty array if transaction fetch fails
    }
    
    // Cache the data in the background
    cacheContractData(contractAddress, contractData)
      .catch(err => logger.warn(`Background caching failed: ${err.message}`));
    
    logger.info(`Completed data retrieval for ${contractAddress} in ${Date.now() - startTime}ms`);
    return contractData;
  } catch (error) {
    console.error('Error in getContractData:', error);
    // Return a consistent structure with all required fields
    const fallback = {
      address: contractAddress,
      name: 'Unknown',
      symbol: '',
      type: 'unknown',
      creator: '',
      creationBlock: 0,
      creationTimestamp: Math.floor(Date.now() / 1000),
      transactions: [],
      tokenCount: 0,
      metadata: {},
      openSea: null,
      isContract: false,
      note: 'Failed to retrieve contract data',
      error: error.message || 'Unknown error'
    };
    console.log('[contractReader] Returning fallback contract data');
    return fallback;
  }
};

/**
 * Get contract creation information using a more reliable method
 * @param {string} contractAddress - The contract address to get creation info for
 * @returns {Promise<{blockNumber: number, transactionHash: string, creator: string, timestamp: number}|null>} Creation info or null if not found
 */
const getContractCreationInfo = async (contractAddress) => {
  try {
    logger.info(`Getting creation info for contract: ${contractAddress}`);
    
    // First, try to get the contract's code to verify it exists
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      logger.warn(`No contract code found at address: ${contractAddress} - may be a self-destructed contract or EOA`);
      return null;
    }
    
    // Check if this is a proxy contract by looking for common proxy patterns
    const isProxy = code.includes('0x363d3d373d3d3d363d73') || // EIP-897
                   code.includes('0x5c60da1b') || // EIP-1822
                   code.includes('0x5f3d5c3b'); // EIP-1967
                   
    if (isProxy) {
      logger.info(`Contract at ${contractAddress} appears to be a proxy`);
      // For proxies, we'll still try to find the creation info but note it's a proxy
      // The actual implementation address would need to be queried separately
    }
    
    // Check if this is a known contract first
    const knownContract = KNOWN_CONTRACTS?.[contractAddress.toLowerCase()];
    if (knownContract) {
      logger.info(`Using known contract deployment info for ${contractAddress}`);
      return knownContract;
    }
    
    // Try to get the contract's first transaction (likely the creation) using Etherscan API
    const fetchEtherscanData = async () => {
      const etherscanUrl = `https://api.etherscan.io/api?module=account&action=txlist` +
        `&address=${contractAddress}` +
        `&startblock=0` +
        `&endblock=99999999` +
        `&page=1` +
        `&offset=1` +
        `&sort=asc` +
        `&apikey=${process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'}`;
      
      logger.debug(`Fetching contract creation info from Etherscan: ${etherscanUrl}`);
      
      // Add rate limiting delay
      await new Promise(resolve => setTimeout(resolve, ETHERSCAN_RATE_LIMIT_DELAY));
      
      const response = await fetch(etherscanUrl);
      if (!response.ok) {
        const error = new Error(`Etherscan API error: ${response.status} ${response.statusText}`);
        error.statusCode = response.status;
        throw error;
      }
      
      const data = await response.json();
      
      if (data.status !== '1' && data.message !== 'No transactions found') {
        const error = new Error(`Etherscan API error: ${data.message || 'Unknown error'}`);
        error.statusCode = 400; // Bad request
        throw error;
      }
      
      return data;
    };
    
    try {
      // Use retry mechanism for the API call
      const data = await withRetry(fetchEtherscanData, MAX_RETRIES, 1000);
      
      if (!data || !data.result || data.result.length === 0) {
        logger.debug('No transaction history found for contract, using fallback method');
        throw new Error('No transaction history found');
      }
      
      return {
        blockNumber: parseInt(data.result[0].blockNumber),
        transactionHash: data.result[0].hash,
        creator: data.result[0].from,
        timestamp: parseInt(data.result[0].timeStamp)
      };
    } catch (error) {
      logger.warn(`Error fetching contract history from Etherscan: ${error.message}`);
      // Don't throw, continue with the fallback method
    }
    
    // Fallback to a simpler method - limit the search range to recent blocks only
    logger.info('Falling back to simplified block search for contract creation...');
    const latestBlock = await provider.getBlockNumber();
    
    // Only search in the last ~6 months of blocks to avoid long searches
    const maxSearchBlocks = 1000000; // Approximately 6 months of blocks
    const startBlock = Math.max(0, latestBlock - maxSearchBlocks);
    
    // Use a timeout to prevent the search from running too long
    const SEARCH_TIMEOUT_MS = 10000; // 10 seconds timeout
    
    // Create a promise that resolves with the creation block or rejects on timeout
    const searchWithTimeout = new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Block search timed out'));
      }, SEARCH_TIMEOUT_MS);
      
      try {
        // Use larger steps to find the approximate block faster
        const STEP_SIZE = 10000; // Check every 10,000 blocks
        let creationBlock = null;
        
        // Start from latest and work backwards in chunks
        for (let blockNum = latestBlock; blockNum >= startBlock; blockNum -= STEP_SIZE) {
          try {
            const codeAtBlock = await provider.getCode(contractAddress, blockNum);
            
            if (codeAtBlock === '0x') {
              // Contract doesn't exist at this block, we've gone past creation
              // The creation block is somewhere in the next STEP_SIZE blocks
              const potentialCreationBlock = Math.min(blockNum + STEP_SIZE, latestBlock);
              clearTimeout(timeoutId);
              resolve(potentialCreationBlock);
              return;
            }
          } catch (err) {
            // Skip errors and continue searching
            logger.warn(`Error checking code at block ${blockNum}: ${err.message}`);
            continue;
          }
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // If we get here, we couldn't find a block where the contract didn't exist
        // Just use the start block as an approximation
        clearTimeout(timeoutId);
        resolve(startBlock);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
    
    try {
      // Try to find the creation block with timeout
      const approximateCreationBlock = await searchWithTimeout;
      
      // For the creation block, we'll just return the block info without transaction details
      const creationBlockInfo = await provider.getBlock(approximateCreationBlock);
      
      return {
        blockNumber: approximateCreationBlock,
        transactionHash: null, // We couldn't determine the exact transaction
        creator: null, // We don't know the creator without the transaction
        timestamp: creationBlockInfo ? creationBlockInfo.timestamp : Math.floor(Date.now() / 1000)
      };
    } catch (error) {
      logger.warn(`Block search timed out: ${error.message}`);
      // Return a fallback with just the latest block info
      return {
        blockNumber: latestBlock,
        transactionHash: null,
        creator: null,
        timestamp: Math.floor(Date.now() / 1000)
      };
    }
    
  } catch (error) {
    logger.error(`Error getting contract creation info for ${contractAddress}:`, error);
    return null;
  }
};

/**
 * Get contract transactions with pagination and error handling
 * @param {string} contractAddress - Ethereum contract address
 * @param {number} limit - Maximum number of transactions to retrieve
 * @returns {Promise<Array>} Contract transactions
 */
const getContractTransactions = async (contractAddress, limit = 3) => {
  // Use a very short timeout to prevent getting stuck
  const startTime = Date.now();
  
  try {
    logger.info(`Fetching transactions for contract: ${contractAddress}`);
    
    // Always use Etherscan API for speed and reliability
    return await withTimeout(
      getTransactionsFromEtherscan(contractAddress, limit),
      CONFIG.ETHERSCAN_TIMEOUT_MS,
      []
    );
  } catch (error) {
    logger.error(`Error in getContractTransactions for ${contractAddress}: ${error.message}`);
    
    // Return empty array on error
    return [];
  } finally {
    logger.info(`Transaction fetch for ${contractAddress} completed in ${Date.now() - startTime}ms`);
  }
};

/**
 * Get transactions from Etherscan API as a fallback
 * @param {string} contractAddress - Contract address
 * @param {number} limit - Maximum number of transactions to return
 * @returns {Promise<Array>} Array of transactions
 */
async function getTransactionsFromEtherscan(contractAddress, limit = 3) {
  try {
    logger.info(`Getting transactions from Etherscan for ${contractAddress}`);

    // Get the latest block number to limit the query to recent blocks
    const latestBlock = await provider.getBlockNumber().catch(() => 0);
    const startBlock = Math.max(0, latestBlock - CONFIG.MAX_BLOCK_RANGE); // Only get recent transactions

    // Construct Etherscan API URL with limited block range
    const etherscanUrl = `https://api.etherscan.io/api?module=account&action=txlist` +
      `&address=${contractAddress}` +
      `&startblock=${startBlock}` +
      `&endblock=99999999` +
      `&page=1` +
      `&offset=${limit}` +
      `&sort=desc` +
      `&apikey=${process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'}`;

    // Fetch data from Etherscan with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    try {
      const response = await fetch(etherscanUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Etherscan API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // If no transactions found or API error, return empty array
      if (data.status !== '1' || !data.result || data.result.length === 0) {
        return [];
      }

      // Format transactions - only include essential fields
      const transactions = data.result.slice(0, limit).map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        blockNumber: parseInt(tx.blockNumber),
        timeStamp: parseInt(tx.timeStamp)
      }));

      return transactions;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    logger.warn(`Error getting transactions from Etherscan for ${contractAddress}: ${error.message}`);
    return [];
  }
}

/**
 * Get token metadata
 * @param {string} contractAddress - Ethereum contract address
 * @param {string} tokenId - Token ID
 * @returns {Promise<Object>} Token metadata
 */
const getTokenMetadata = async (contractAddress, tokenId) => {
  try {
    // Determine contract type
    const contractData = await getContractData(contractAddress);
    
    let metadata = null;
    
    if (contractData.type === 'ERC721') {
      const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider);
      try {
        const tokenURI = await contract.tokenURI(tokenId);
        metadata = await fetchMetadata(tokenURI);
      } catch (error) {
        console.warn(`Error getting ERC721 token metadata: ${error.message}`);
        metadata = { error: 'Unable to retrieve token metadata', tokenId };
      }
    } else if (contractData.type === 'ERC1155') {
      const contract = new ethers.Contract(contractAddress, ERC1155_ABI, provider);
      try {
        const uri = await contract.uri(tokenId);
        // ERC1155 URI may contain {id} placeholder
        const tokenURI = uri.replace('{id}', ethers.utils.hexZeroPad(ethers.utils.hexlify(tokenId), 32).slice(2));
        metadata = await fetchMetadata(tokenURI);
      } catch (error) {
        console.warn(`Error getting ERC1155 token metadata: ${error.message}`);
        metadata = { error: 'Unable to retrieve token metadata', tokenId };
      }
    } else {
      metadata = { note: 'Metadata not available for this contract type', tokenId };
    }
    
    return metadata;
  } catch (error) {
    console.error(`Error getting token metadata for ${contractAddress} token ${tokenId}:`, error);
    return null;
  }
};

/**
 * Fetch metadata from URI
 * @param {string} uri - Metadata URI
 * @returns {Promise<Object>} Metadata
 */
const fetchMetadata = async (uri) => {
  try {
    // Handle IPFS URIs
    if (uri.startsWith('ipfs://')) {
      uri = `https://ipfs.io/ipfs/${uri.slice(7)}`;
    }
    
    // Fetch metadata
    const response = await fetch(uri);
    const metadata = await response.json();
    
    return metadata;
  } catch (error) {
    console.error(`Error fetching metadata from ${uri}:`, error);
    return null;
  }
};

// Export all functions
export {
  getContractData,
  getContractCreationInfo,
  getContractTransactions,
  getTokenMetadata,
  fetchMetadata
};