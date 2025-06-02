const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3006;
const HOST = '127.0.0.1';
const DEFAULT_CONTRACT_ADDRESS = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';

// Create HTTP server
const server = http.createServer((req, res) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    }));
    return;
  }
  
  if ((req.url === '/' || req.url === '/api/nft-data') && req.method === 'GET') {
    res.writeHead(200, headers);
    const formattedData = generateFormattedData(DEFAULT_CONTRACT_ADDRESS);
    res.end(JSON.stringify(formattedData));
    return;
  }

  res.writeHead(404, headers);
  res.end(JSON.stringify({
    success: false,
    error: 'Not found',
    message: 'Invalid endpoint. Available endpoints: /, /api/health, /api/nft-data'
  }));
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Generate formatted NFT data
function generateFormattedData(contractAddress) {
  const trustScore = Math.floor(Math.random() * 30) + 70;
  const activityScore = Math.floor(Math.random() * 30) + 60;
  const communityScore = Math.floor(Math.random() * 30) + 50;
  const liquidityScore = Math.floor(Math.random() * 30) + 65;
  const currentPrice = Number((Math.random() * 2).toFixed(4));
  const priceChange = Number((Math.random() * 10 - 5).toFixed(2));
  const volume = Math.floor(Math.random() * 5000) + 1000;
  
  // Generate historical price data with volume
  const priceData = Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - index));
    return {
      timestamp: date.toISOString(),
      price: Number((Math.random() * 2 + 1).toFixed(4)),
      volume: Math.floor(Math.random() * 1000) + 100
    };
  });

  // Generate market trends data
  const marketTrends = Array.from({ length: 10 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (9 - index));
    return {
      timestamp: date.toISOString(),
      event: ['Sale', 'Listing', 'Transfer', 'Mint'][Math.floor(Math.random() * 4)],
      price: Number((Math.random() * 2 + 1).toFixed(4)),
      tokenId: Math.floor(Math.random() * 10000)
    };
  });

  // Generate risk metrics
  const riskMetrics = {
    contractSecurity: Math.floor(Math.random() * 30) + 70,
    marketVolatility: Math.floor(Math.random() * 30) + 60,
    ownershipConcentration: Math.floor(Math.random() * 30) + 50,
    tradingActivity: Math.floor(Math.random() * 30) + 65,
    overallRisk: 0
  };
  riskMetrics.overallRisk = Math.floor(
    Object.values(riskMetrics).reduce((sum, value) => sum + value, 0) / 
    (Object.keys(riskMetrics).length - 1)
  );

  return {
    contractAddress,
    name: 'Bored Ape Yacht Club',
    symbol: 'BAYC',
    totalSupply: '10000',
    trustScore,
    marketSegment: 'Art & Collectibles',
    riskData: riskMetrics,
    priceData: priceData,
    marketTrends: marketTrends,
    priceStats: {
      currentPrice,
      priceChange24h: priceChange,
      volume24h: volume,
      trend: priceChange > 0 ? 'Upward' : 'Downward',
      allTimeHigh: Number((Math.max(...priceData.map(d => d.price)) + 0.5).toFixed(4)),
      allTimeLow: Number((Math.min(...priceData.map(d => d.price)) - 0.2).toFixed(4))
    },
    analytics: {
      uniqueHolders: Math.floor(Math.random() * 3000) + 2000,
      averageHoldingPeriod: Math.floor(Math.random() * 90) + 30,
      tradingVolume7d: Math.floor(Math.random() * 10000) + 5000,
      activeListings: Math.floor(Math.random() * 500) + 100
    },
    lastUpdated: new Date().toISOString()
  };
}

// Calculate risk level
function calculateRiskLevel(score) {
  if (score >= 80) return 'Low';
  if (score >= 60) return 'Medium';
  return 'High';
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to NFT Analysis WebSocket Server',
    timestamp: new Date().toISOString()
  }));
  
  const formattedData = generateFormattedData(DEFAULT_CONTRACT_ADDRESS);
  ws.send(JSON.stringify({
    type: 'analysis',
    data: formattedData
  }));
  
  const updateInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const updatedData = generateFormattedData(DEFAULT_CONTRACT_ADDRESS);
      ws.send(JSON.stringify({
        type: 'update',
        data: updatedData
      }));
    } else {
      clearInterval(updateInterval);
    }
  }, 5000);
  
  ws.updateInterval = updateInterval;
  
  ws.on('close', () => {
    console.log('Client disconnected');
    if (ws.updateInterval) {
      clearInterval(ws.updateInterval);
    }
  });
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server has been stopped.');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, HOST, () => {
  console.log(`\n🚀 WebSocket Server running at http://${HOST}:${PORT}/`);
  console.log(`WebSocket endpoint: ws://${HOST}:${PORT}`);
  console.log('HTTP Endpoints:');
  console.log(`  GET  http://${HOST}:${PORT}/`);
  console.log(`  GET  http://${HOST}:${PORT}/api/health`);
  console.log(`  GET  http://${HOST}:${PORT}/api/nft-data`);
  console.log('\nPress Ctrl+C to stop the server\n');
});
