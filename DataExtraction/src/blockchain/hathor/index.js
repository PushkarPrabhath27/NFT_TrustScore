/**
 * Hathor Blockchain Integration - Main Entry Point
 * Exports Hathor wallet and token manager functionality
 */

// Import wallet module
export { default as wallet } from './wallet.js';

// Import token manager module
export { default as tokenManager } from './tokenManager.js';

// Import and re-export individual functions from wallet
import wallet from './wallet.js';
import tokenManager from './tokenManager.js';

// For backward compatibility
export const {
  initializeHathorWallet,
  getWalletBalance,
  getTransactionHistory,
  getCurrentWalletAddress,
  isWalletInitialized,
  getWalletAddress,
  checkWalletStatus,
  createWallet,
  startWallet
} = wallet;

// For backward compatibility
export const {
  createHathorToken,
  storeAnalysisOnHathor,
  retrieveAnalysisFromHathor,
  updateAnalysisOnHathor,
  getAllAnalysisTokens,
  createNanopayment
} = tokenManager;

// Default export for backward compatibility
export default {
  wallet,
  tokenManager,
  // Re-export all wallet and token manager methods for backward compatibility
  ...wallet,
  ...tokenManager
};
