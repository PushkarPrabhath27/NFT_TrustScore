/**
 * Blockchain Integration - Main Entry Point
 * Exports all blockchain integration modules
 */

// Import Ethereum module
export { default as ethereum } from './ethereum/index.js';

// Import Hathor module
export { default as hathor, wallet as hathorWallet, tokenManager } from './hathor/index.js';

// Import and re-export individual functions from ethereum
import ethereum from './ethereum/index.js';

// Re-export all Ethereum functions
export const {
  connectToEthereum,
  getContract,
  getContractData,
  getTokenMetadata,
  getTokenBalance,
  getTokenMetadataByTokenURI,
  getTransactionHistory,
  getBlockByNumber,
  getBlockByHash,
  getTransactionReceipt,
  getTokenTransfers,
  getTokenHolders,
  getContractEvents,
  getTokenInfo,
  getTokenHoldings,
  getTokenTransfersByAddress,
  getTokenTransfersByContract,
  getTokenTransfersByBlock,
  getTokenTransfersByTxHash,
  getTokenTransfersByTokenId,
  getTokenTransfersByFromAddress,
  getTokenTransfersByToAddress,
  getTokenTransfersByFromAndToAddress,
  getTokenTransfersByTokenIdAndFromAddress,
  getTokenTransfersByTokenIdAndToAddress,
  getTokenTransfersByTokenIdAndFromAndToAddress,
  getTokenTransfersByContractAndFromAddress,
  getTokenTransfersByContractAndToAddress,
  getTokenTransfersByContractAndFromAndToAddress,
  getTokenTransfersByContractAndTokenId,
  getTokenTransfersByContractTokenIdAndFromAddress,
  getTokenTransfersByContractTokenIdAndToAddress,
  getTokenTransfersByContractTokenIdAndFromAndToAddress,
  getTokenTransfersByBlockNumber,
  getTokenTransfersByBlockHash,
  getTokenTransfersByTxHashAndLogIndex,
  getTokenTransfersByTxHashAndLogIndexRange,
  getTokenTransfersByBlockNumberAndLogIndex,
  getTokenTransfersByBlockNumberAndLogIndexRange,
  getTokenTransfersByBlockHashAndLogIndex,
  getTokenTransfersByBlockHashAndLogIndexRange,
  getTokenTransfersByFromBlockAndToBlock,
  getTokenTransfersByFromBlockAndToBlockAndPage,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffset,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSort,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirection,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilter,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndFromAddress,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndToAddress,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndFromAndToAddress,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndContractAddress,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndTokenId,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndContractAddressAndTokenId,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndFromAddressAndToAddress,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndFromAddressAndContractAddress,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndFromAddressAndTokenId,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndToAddressAndContractAddress,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndToAddressAndTokenId,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndFromAddressAndToAddressAndContractAddress,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndFromAddressAndToAddressAndTokenId,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndFromAddressAndContractAddressAndTokenId,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndToAddressAndContractAddressAndTokenId,
  getTokenTransfersByFromBlockAndToBlockAndPageAndOffsetAndSortAndDirectionAndFilterAndFromAddressAndToAddressAndContractAddressAndTokenId
} = ethereum;

// Re-export all Hathor functions
export const {
  // Wallet functions
  initializeHathorWallet,
  getWalletBalance,
  getTransactionHistory: getHathorTransactionHistory,
  getCurrentWalletAddress,
  isWalletInitialized,
  getWalletAddress,
  checkWalletStatus,
  createWallet,
  startWallet,
  
  // Token manager functions
  createHathorToken,
  storeAnalysisOnHathor,
  retrieveAnalysisFromHathor,
  updateAnalysisOnHathor,
  getAllAnalysisTokens,
  createNanopayment
} = hathor;

// Default export for backward compatibility
export default {
  ethereum,
  hathor,
  // Re-export all ethereum and hathor methods for backward compatibility
  ...ethereum,
  ...hathor
};
