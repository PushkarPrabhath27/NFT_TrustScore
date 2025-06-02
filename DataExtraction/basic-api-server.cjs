const express = require('express');
const cors = require('cors');

// Use a different port to avoid conflicts
const PORT = 3006;
const HOST = '127.0.0.1';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Analyze endpoint
app.post('/api/analyze', (req, res) => {
  try {
    console.log('Request body:', req.body);
    const { contractAddress } = req.body || {};
    
    if (!contractAddress) {
      console.log('Missing contract address');
      return res.status(400).json({
        success: false,
        error: 'Contract address is required',
      });
    }
    
    console.log(`Analyzing contract: ${contractAddress}`);
    
    // Generate mock data for testing
    const mockData = {
      success: true,
      data: {
        contractAddress,
        name: `NFT Collection #${contractAddress.slice(-4)}`,
        symbol: 'NFT',
        totalSupply: '10000',
        owner: '0x1234567890abcdef',
        blockchain: 'Ethereum',
        tokenId: '123',
        isVerified: true,
        standard: 'ERC-721',
        description: 'A unique collection of NFTs',
        image: '/placeholder-nft.jpg',
        createdAt: new Date().toISOString(),
        
        // Analysis scores
        analysis: {
          security: 85,
          activity: 75,
          community: 80,
          liquidity: 70,
        },
        
        // Trust score data
        trustScore: {
          score: 78,
          factors: [
            { name: 'Security', impact: 35 },
            { name: 'Activity', impact: 25 },
            { name: 'Community', impact: 30 },
            { name: 'Liquidity', impact: 20 }
          ],
          recommendation: 'This collection has a moderate trust score. Consider monitoring for any changes in activity or liquidity.'
        },
        
        // Price data
        priceData: {
          currentPrice: '1.25',
          priceChange24h: '5.2',
          volume24h: 3500,
          currency: 'ETH',
          history: [
            { date: new Date(Date.now() - 86400000 * 30).toISOString(), price: 0.8 },
            { date: new Date(Date.now() - 86400000 * 20).toISOString(), price: 0.9 },
            { date: new Date(Date.now() - 86400000 * 10).toISOString(), price: 1.1 },
            { date: new Date().toISOString(), price: 1.25 }
          ],
          change7d: '15.3',
          allTimeHigh: '1.8',
          allTimeHighDate: new Date(Date.now() - 86400000 * 45).toISOString(),
          allTimeLow: '0.5',
          allTimeLowDate: new Date(Date.now() - 86400000 * 90).toISOString()
        },
        
        lastUpdated: new Date().toISOString(),
      },
    };
    
    console.log(`Generated analysis data for contract: ${contractAddress}`);
    res.json(mockData);
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'NFT Analyzer API Server',
    endpoints: [
      { method: 'GET', path: '/api/health', description: 'Health check endpoint' },
      { method: 'POST', path: '/api/analyze', description: 'Analyze NFT contract' }
    ],
    version: '1.0.0'
  });
});

// Handle 404 errors
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Handle errors
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`\n🚀 API Server running at http://${HOST}:${PORT}/`);
  console.log('Endpoints:');
  console.log(`  GET  http://${HOST}:${PORT}/api/health`);
  console.log(`  POST http://${HOST}:${PORT}/api/analyze`);
  console.log('\nPress Ctrl+C to stop the server\n');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT signal (Ctrl+C)');
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server has been stopped.');
    process.exit(0);
  });
});

// Prevent server from shutting down on uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

// Prevent server from shutting down on unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM signal');
  console.log('Server will continue running...');
});