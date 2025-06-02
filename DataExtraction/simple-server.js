import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware with enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Simple analyze endpoint
app.post('/api/analyze', (req, res) => {
  const { contractAddress } = req.body;
  
  if (!contractAddress) {
    return res.status(400).json({
      success: false,
      error: 'Contract address is required'
    });
  }

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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
