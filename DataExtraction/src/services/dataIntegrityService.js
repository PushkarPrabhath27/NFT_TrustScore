/**
 * Data Integrity Service
 * Ensures data consistency and accuracy across the application
 */

import { ethers } from 'ethers';
import { getOpenSeaData } from './openSeaService.js';
import { getContractData } from '../blockchain/ethereum/contractReader.js';

// Cache for storing API responses
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const responseCache = new Map();

class DataIntegrityService {
  constructor() {
    this.providers = {
      alchemy: process.env.ALCHEMY_API_KEY ? new ethers.providers.AlchemyProvider(
        'homestead',
        process.env.ALCHEMY_API_KEY
      ) : null,
      infura: process.env.INFURA_PROJECT_ID ? new ethers.providers.InfuraProvider(
        'homestead',
        process.env.INFURA_PROJECT_ID
      ) : null
    };
  }

  /**
   * Get data with retry and fallback
   */
  async getWithFallback(endpoint, options = {}, useCache = true) {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    const now = Date.now();

    // Check cache first
    if (useCache && responseCache.has(cacheKey)) {
      const { timestamp, data } = responseCache.get(cacheKey);
      if (now - timestamp < CACHE_TTL) {
        return data;
      }
    }

    try {
      const response = await fetch(endpoint, {
        ...options,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache successful responses
      if (useCache) {
        responseCache.set(cacheKey, {
          timestamp: now,
          data
        });
      }

      return data;
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error.message);
      return null;
    }
  }

  /**
   * Verify and complete NFT metadata
   */
  async verifyMetadata(metadata, contractAddress, tokenId) {
    if (!metadata) {
      metadata = {};
    }

    // Required fields with defaults
    const defaults = {
      name: `NFT #${tokenId}`,
      description: `An NFT from contract ${contractAddress}`,
      image: null,
      external_url: `https://etherscan.io/token/${contractAddress}?a=${tokenId}`,
      attributes: []
    };

    // Apply defaults for missing fields
    const completeMetadata = { ...defaults, ...metadata };

    // Validate image URL
    if (completeMetadata.image) {
      try {
        new URL(completeMetadata.image);
      } catch (e) {
        console.warn(`Invalid image URL for ${contractAddress}/${tokenId}:`, completeMetadata.image);
        completeMetadata.image = null;
      }
    }

    // Add validation status
    completeMetadata._validation = {
      isValid: Object.keys(defaults).every(key => 
        completeMetadata[key] !== null && 
        completeMetadata[key] !== undefined &&
        completeMetadata[key] !== ''
      ),
      timestamp: new Date().toISOString()
    };

    return completeMetadata;
  }

  /**
   * Get sales data with fallback to multiple sources
   */
  async getSalesData(contractAddress, limit = 10) {
    // Try OpenSea first
    try {
      const openSeaSales = await getOpenSeaData(contractAddress);
      if (openSeaSales?.sales?.length > 0) {
        return openSeaSales.sales.slice(0, limit).map(sale => ({
          price: sale.total_price,
          currency: sale.payment_token?.symbol || 'ETH',
          timestamp: sale.transaction?.timestamp,
          from: sale.seller?.address,
          to: sale.winner_account?.address,
          txHash: sale.transaction?.transaction_hash,
          source: 'opensea'
        }));
      }
    } catch (error) {
      console.warn('Error fetching OpenSea sales:', error.message);
    }

    // Fallback to Alchemy if available
    if (process.env.ALCHEMY_API_KEY) {
      try {
        // Get the latest block number to calculate a reasonable range
        const latestBlock = await this.providers.infura.getBlockNumber();
        
        // Use only the last 10,000 blocks (approximately 1-2 days) to avoid the query limit error
        const fromBlock = Math.max(0, latestBlock - 10000);
        
        console.log(`Fetching Alchemy sales data from block ${fromBlock} to latest for ${contractAddress}`);
        
        const response = await this.getWithFallback(
          `https://eth-mainnet.g.alchemy.com/nft/v2/${process.env.ALCHEMY_API_KEY}/getNFTSales`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fromBlock: '0x' + fromBlock.toString(16), // Convert to hex format
              toBlock: 'latest',
              contractAddress,
              limit
            })
          }
        );

        if (response?.nftSales?.length > 0) {
          return response.nftSales.map(sale => ({
            price: sale.sellerFee?.amount,
            currency: sale.sellerFee?.tokenSymbol || 'ETH',
            timestamp: sale.blockTimestamp,
            from: sale.sellerAddress,
            to: sale.buyerAddress,
            txHash: sale.transactionHash,
            source: 'alchemy'
          }));
        }
      } catch (error) {
        console.warn('Error fetching Alchemy sales:', error.message);
      }
    }

    // Return empty array if no sales data found
    return [];
  }

  /**
   * Verify creator information
   */
  async verifyCreator(contractAddress) {
    try {
      // Get contract deployment transaction
      const provider = this.providers.alchemy || this.providers.infura;
      if (!provider) return null;

      const contract = new ethers.Contract(
        contractAddress,
        ['function owner() view returns (address)'],
        provider
      );

      // Get creator from deployment transaction
      const tx = await provider.getTransactionReceipt(contractAddress);
      if (!tx?.from) return null;

      // Get contract owner if available
      let owner = null;
      try {
        owner = await contract.owner();
      } catch (e) {
        // Contract might not have owner() function
      }

      return {
        deployer: tx.from,
        owner: owner || null,
        verified: false, // Would need additional verification
        verificationSources: ['blockchain'],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error verifying creator:', error);
      return null;
    }
  }
}

const dataIntegrityService = new DataIntegrityService();
export default dataIntegrityService;
