/**
 * Hathor Blockchain Integration - Wallet Module
 * Handles connection to Hathor's headless wallet API
 */

import axios from 'axios';
import { createHash, randomBytes } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Hathor node configuration
const HATHOR_NODE_URL = process.env.HATHOR_NODE_URL || 'https://node1.hackaton.hathor.network/v1a/';
const HATHOR_HEADLESS_URL = process.env.HATHOR_HEADLESS_URL || 'http://localhost:8000/v1a/';
const HATHOR_WALLET_ID = process.env.HATHOR_WALLET_ID || 'nft-analysis-wallet';
const HATHOR_WALLET_SEED = process.env.HATHOR_WALLET_SEED || 'spatial scale walk large harvest hospital essay matrix garbage ketchup notable ritual theory raccoon glad bottom work bronze manual risk donate until hard ketchup';

// Wallet state
let walletInitialized = false;
let walletAddress = null;

/**
 * Initialize the Hathor wallet
 * @returns {Promise<void>}
 */
export const initializeHathorWallet = async () => {
  try {
    // Check if wallet exists
    const walletStatus = await checkWalletStatus();
    
    if (!walletStatus.exists) {
      // Create wallet if it doesn't exist
      await createWallet();
    } else if (!walletStatus.ready) {
      // Start wallet if it exists but isn't ready
      await startWallet();
    }
    
    // Get wallet address
    walletAddress = await getWalletAddress();
    walletInitialized = true;
    
    console.log(`Hathor wallet initialized with address: ${walletAddress}`);
    return walletAddress;
  } catch (error) {
    console.error('Failed to initialize Hathor wallet:', error);
    throw error;
  }
};

/**
 * Check the status of the wallet
 * @returns {Promise<Object>} Wallet status
 */
const checkWalletStatus = async () => {
  try {
    const response = await axios.get(`${HATHOR_HEADLESS_URL}wallet/status`, {
      params: { wallet_id: HATHOR_WALLET_ID }
    });
    
    return {
      exists: true,
      ready: response.data.status === 'ready'
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { exists: false, ready: false };
    }
    throw error;
  }
}

/**
 * Create a new Hathor wallet
 * @returns {Promise<void>}
 */
const createWallet = async () => {
  try {
    // Generate seed if not provided
    const seed = HATHOR_WALLET_SEED || crypto.randomBytes(16).toString('hex');
    
    // Create wallet
    await axios.post(`${HATHOR_HEADLESS_URL}wallet/create`, {
      wallet_id: HATHOR_WALLET_ID,
      seedKey: seed,
      passphrase: ''
    });
    
    // Start wallet
    await startWallet();
    
    console.log('Hathor wallet created successfully');
  } catch (error) {
    console.error('Failed to create Hathor wallet:', error);
    throw error;
  }
}

/**
 * Start the Hathor wallet
 * @returns {Promise<void>}
 */
const startWallet = async () => {
  try {
    await axios.post(`${HATHOR_HEADLESS_URL}wallet/start`, {
      wallet_id: HATHOR_WALLET_ID
    });
    
    // Wait for wallet to be ready
    let ready = false;
    let attempts = 0;
    
    while (!ready && attempts < 10) {
      const status = await checkWalletStatus();
      ready = status.ready;
      
      if (!ready) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
    }
    
    if (!ready) {
      throw new Error('Wallet failed to start after multiple attempts');
    }
    
    console.log('Hathor wallet started successfully');
  } catch (error) {
    console.error('Failed to start Hathor wallet:', error);
    throw error;
  }
}

/**
 * Get the wallet address
 * @returns {Promise<string>} Wallet address
 */
async function getWalletAddress() {
  try {
    const response = await axios.get(`${HATHOR_HEADLESS_URL}wallet/address`, {
      params: { wallet_id: HATHOR_WALLET_ID, index: 0 }
    });
    
    return response.data.address;
  } catch (error) {
    console.error('Failed to get wallet address:', error);
    throw error;
  }
}

/**
 * Get the wallet balance
 * @returns {Promise<Object>} Wallet balance
 */
export const getWalletBalance = async () => {
  try {
    if (!walletInitialized) {
      await exports.initializeHathorWallet();
    }
    
    const response = await axios.get(`${HATHOR_HEADLESS_URL}wallet/balance`, {
      params: { wallet_id: HATHOR_WALLET_ID }
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    throw error;
  }
};

/**
 * Get transaction history
 * @param {number} count - Number of transactions to retrieve
 * @returns {Promise<Array>} Transaction history
 */
export const getTransactionHistory = async (count = 20) => {
  try {
    if (!walletInitialized) {
      await exports.initializeHathorWallet();
    }
    
    const response = await axios.get(`${HATHOR_HEADLESS_URL}wallet/tx-history`, {
      params: { wallet_id: HATHOR_WALLET_ID, count }
    });
    
    return response.data.history;
  } catch (error) {
    console.error('Failed to get transaction history:', error);
    throw error;
  }
};

/**
 * Get the current wallet address
 * @returns {string} Wallet address
 */
/**
 * Get the current wallet address
 * @returns {string} Wallet address
 */
export const getCurrentWalletAddress = () => {
  return walletAddress;
};

/**
 * Check if the wallet is initialized
 * @returns {boolean} Whether the wallet is initialized
 */
export const isWalletInitialized = () => {
  return walletInitialized;
};

// For backward compatibility
export default {
  initializeHathorWallet,
  getWalletBalance,
  getTransactionHistory,
  getCurrentWalletAddress,
  isWalletInitialized,
  getWalletAddress,
  checkWalletStatus,
  createWallet,
  startWallet
};