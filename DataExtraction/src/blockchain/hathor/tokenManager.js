/**
 * Hathor Blockchain Integration - Token Manager
 * Handles custom token creation and storage of analysis data on Hathor blockchain
 */

import axios from 'axios';
import { 
  isWalletInitialized, 
  initializeHathorWallet, 
  getCurrentWalletAddress 
} from './wallet.js';

// Hathor node configuration
const HATHOR_HEADLESS_URL = process.env.HATHOR_HEADLESS_URL || 'http://localhost:8000/v1a/';
const HATHOR_WALLET_ID = process.env.HATHOR_WALLET_ID || 'nft-analysis-wallet';

/**
 * Create a custom Hathor token to represent an analyzed NFT contract
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<string>} Token ID
 */
export const createHathorToken = async (contractAddress) => {
  try {
    if (!isWalletInitialized()) {
      await initializeHathorWallet();
    }
    
    // Create token configuration
    const tokenName = `NFT-Analysis-${contractAddress.substring(0, 8)}`;
    const tokenSymbol = `NFTA-${contractAddress.substring(0, 4)}`;
    const tokenData = {
      name: tokenName,
      symbol: tokenSymbol,
      amount: 100, // Fixed amount for analysis tokens
      address: getCurrentWalletAddress(),
      change_address: getCurrentWalletAddress(),
      create_mint: true,
      mint_authority_address: getCurrentWalletAddress()
    };
    
    // Create token
    const response = await axios.post(`${HATHOR_HEADLESS_URL}wallet/create-token`, {
      wallet_id: HATHOR_WALLET_ID,
      ...tokenData
    });
    
    console.log(`Created Hathor token for contract ${contractAddress}: ${response.data.hash}`);
    return response.data.hash; // Token ID is the transaction hash
  } catch (error) {
    console.error('Failed to create Hathor token:', error);
    throw error;
  }
};

/**
 * Store analysis data on Hathor blockchain as token metadata
 * @param {string} tokenId - Hathor token ID
 * @param {Object} analysisData - Analysis data to store
 * @returns {Promise<string>} Transaction hash
 */
export const storeAnalysisOnHathor = async (tokenId, analysisData) => {
  try {
    if (!isWalletInitialized()) {
      await initializeHathorWallet();
    }
    
    // Prepare metadata
    const metadata = {
      contractAddress: analysisData.contractAddress,
      trustScore: analysisData.trustScore,
      riskLevel: analysisData.riskLevel,
      timestamp: analysisData.timestamp,
      version: '1.0'
    };
    
    // Convert metadata to string
    const metadataString = JSON.stringify(metadata);
    
    // Create transaction with metadata
    const txData = {
      token: tokenId,
      address: getCurrentWalletAddress(),
      value: 1,
      change_address: getCurrentWalletAddress(),
      data: Buffer.from(metadataString).toString('hex') // Convert to hex
    };
    
    // Send transaction
    const response = await axios.post(`${HATHOR_HEADLESS_URL}wallet/simple-send-tx`, {
      wallet_id: HATHOR_WALLET_ID,
      ...txData
    });
    
    console.log(`Stored analysis data on Hathor blockchain: ${response.data.hash}`);
    return response.data.hash;
  } catch (error) {
    console.error('Failed to store analysis on Hathor:', error);
    throw error;
  }
};

/**
 * Retrieve analysis data from Hathor blockchain
 * @param {string} tokenId - Hathor token ID
 * @returns {Promise<Object>} Analysis data
 */
export const retrieveAnalysisFromHathor = async (tokenId) => {
  try {
    if (!isWalletInitialized()) {
      await initializeHathorWallet();
    }
    
    // Get token transactions
    const response = await axios.get(`${HATHOR_HEADLESS_URL}wallet/token-history`, {
      params: {
        wallet_id: HATHOR_WALLET_ID,
        token: tokenId,
        count: 10
      }
    });
    
    // Find transaction with metadata
    const txWithMetadata = response.data.history.find(tx => tx.data);
    
    if (!txWithMetadata || !txWithMetadata.data) {
      throw new Error('No metadata found for this token');
    }
    
    // Decode metadata
    const metadataHex = txWithMetadata.data;
    const metadataString = Buffer.from(metadataHex, 'hex').toString();
    const metadata = JSON.parse(metadataString);
    
    return metadata;
  } catch (error) {
    console.error('Failed to retrieve analysis from Hathor:', error);
    throw error;
  }
};

/**
 * Update analysis data on Hathor blockchain
 * @param {string} tokenId - Hathor token ID
 * @param {Object} analysisData - Updated analysis data
 * @returns {Promise<string>} Transaction hash
 */
/**
 * Update analysis data on Hathor blockchain
 * @param {string} tokenId - Hathor token ID
 * @param {Object} analysisData - Updated analysis data
 * @returns {Promise<string>} Transaction hash
 */
export const updateAnalysisOnHathor = async (tokenId, analysisData) => {
  try {
    // Store updated analysis (creates a new transaction)
    return await storeAnalysisOnHathor(tokenId, analysisData);
  } catch (error) {
    console.error('Failed to update analysis on Hathor:', error);
    throw error;
  }
};

/**
 * Get all analysis tokens created by this wallet
 * @returns {Promise<Array>} List of analysis tokens
 */
/**
 * Get all analysis tokens created by this wallet
 * @returns {Promise<Array>} List of analysis tokens
 */
export const getAllAnalysisTokens = async () => {
  try {
    if (!isWalletInitialized()) {
      await initializeHathorWallet();
    }
    
    // Get all tokens
    const response = await axios.get(`${HATHOR_HEADLESS_URL}wallet/tokens`, {
      params: { wallet_id: HATHOR_WALLET_ID }
    });
    
    return response.data.tokens;
  } catch (error) {
    console.error('Failed to get analysis tokens:', error);
    throw error;
  }
};

/**
 * Utilize Hathor's nanopayments for efficient data processing
 * @param {string} tokenId - Hathor token ID
 * @param {string} recipient - Recipient address
 * @param {number} amount - Amount to send
 * @returns {Promise<string>} Transaction hash
 */
/**
 * Utilize Hathor's nanopayments for efficient data processing
 * @param {string} tokenId - Hathor token ID
 * @param {string} recipient - Recipient address
 * @param {number} amount - Amount to send
 * @returns {Promise<string>} Transaction hash
 */
export const createNanopayment = async (tokenId, recipient, amount) => {
  try {
    if (!isWalletInitialized()) {
      await initializeHathorWallet();
    }
    
    // Create nanopayment
    const response = await axios.post(`${HATHOR_HEADLESS_URL}wallet/nano-contracts/create`, {
      wallet_id: HATHOR_WALLET_ID,
      token: tokenId,
      address: recipient,
      value: amount,
      change_address: getCurrentWalletAddress()
    });
    
    console.log(`Created nanopayment: ${response.data.hash}`);
    return response.data.hash;
  } catch (error) {
    console.error('Failed to create nanopayment:', error);
    throw error;
  }
};

// For backward compatibility
export default {
  createHathorToken,
  storeAnalysisOnHathor,
  retrieveAnalysisFromHathor,
  updateAnalysisOnHathor,
  getAllAnalysisTokens,
  createNanopayment
};