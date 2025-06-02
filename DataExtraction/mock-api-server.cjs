// Simple Mock API Server for NFT Analysis
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Analyze endpoint
app.post('/api/analyze', (req, res) => {
  console.log('Analyze endpoint called with:', req.body);
  
  const { contractAddress } = req.body;
  
  if (!contractAddress) {
    console.log('No contract address provided');
    return res.status(400).json({
      success: false,
      error: 'Contract address is required',
      timestamp: new Date().toISOString()
    });
  }

  console.log(`Processing request for contract: ${contractAddress}`);
  
  // Mock response
  const mockData = {
    success: true,
    data: {
      contractAddress,
      name: 'Mock NFT Collection',
      symbol: 'MOCK',
      totalSupply: '10000',
      owner: '0x0000000000000000000000000000000000000000',
      analysis: {
        security: 85,
        activity: 72,
        community: 65,
        liquidity: 90
      },
      priceData: {
        currentPrice: 0.5,
        priceChange24h: 2.5,
        volume24h: 2500
      },
      lastUpdated: new Date().toISOString()
    }
  };

  console.log('Sending response:', JSON.stringify(mockData, null, 2));
  res.json(mockData);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log(`- POST /api/analyze`);
  console.log(`- GET  /api/health\n`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
