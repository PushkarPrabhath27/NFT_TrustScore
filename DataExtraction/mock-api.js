import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
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
  const { contractAddress } = req.body;
  
  if (!contractAddress) {
    return res.status(400).json({
      success: false,
      error: 'Contract address is required'
    });
  }

  console.log(`Analyzing contract: ${contractAddress}`);
  
  // Mock response
  const mockResponse = {
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

  res.json(mockResponse);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  POST http://localhost:${PORT}/api/analyze\n`);
});
