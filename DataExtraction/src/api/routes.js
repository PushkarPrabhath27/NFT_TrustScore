/**
 * API Routes for NFT Smart Contract Analysis System
 */

import express from 'express';
import { validateContractAddress } from '../utils/validators.js';
import { analyzeContract, getAnalysisResults, getHistoricalAnalysis } from './controllers/analysisController.js';
import authMiddleware from './middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/analyze
 * @desc    Analyze an NFT smart contract
 * @access  Public
 */
router.post('/analyze', (req, res, next) => {
  const { contractAddress } = req.body;
  if (!validateContractAddress(contractAddress)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid contract address',
      message: 'Please provide a valid Ethereum contract address'
    });
  }
  next();
}, analyzeContract);

/**
 * @route   GET /api/analysis/:contractAddress
 * @desc    Get analysis results for a contract address
 * @access  Protected
 */
router.get('/analysis/:contractAddress', authMiddleware, validateContractAddress, getAnalysisResults);

/**
 * @route   GET /api/history/:contractAddress
 * @desc    Get historical analysis for a contract address
 * @access  Protected
 */
router.get('/history/:contractAddress', authMiddleware, validateContractAddress, getHistoricalAnalysis);

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'NFT Smart Contract Analysis System'
  });
});

/**
 * @route   GET /api/ping
 * @desc    Ping endpoint for quick health checks
 * @access  Public
 */
router.get('/ping', (req, res) => {
  res.status(200).json({ 
    status: 'pong',
    timestamp: new Date().toISOString()
  });
});

export default router;