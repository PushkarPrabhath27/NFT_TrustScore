const http = require('http');
const url = require('url');

const PORT = 3005;  // Changed port to 3005
const HOST = '0.0.0.0';  // Changed to 0.0.0.0 to accept connections from any IP

// [Previous code remains the same until the server creation]

// Create server
const server = http.createServer(async (req, res) => {
  const { method, url: reqUrl } = req;
  const { pathname, query } = url.parse(reqUrl, true);
  
  console.log(`[${new Date().toISOString()}] ${method} ${reqUrl}`);
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    sendResponse(res, 200, {});
    return;
  }
  
  // Health check endpoint
  if (method === 'GET' && pathname === '/api/health') {
    sendResponse(res, 200, { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'Server is running on port 3005'
    });
    return;
  }
  
  // Analyze endpoint
  if (method === 'POST' && pathname === '/api/analyze') {
    try {
      const body = await parseBody(req);
      const contractAddress = body.contractAddress || '';
      
      if (!contractAddress) {
        return sendResponse(res, 400, {
          success: false,
          error: 'Contract address is required',
        });
      }
      
      console.log(`Analyzing contract: ${contractAddress}`);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate mock response
      const responseData = generateMockData(contractAddress);
      sendResponse(res, 200, responseData);
      
    } catch (error) {
      console.error('Error processing request:', error);
      sendResponse(res, 500, {
        success: false,
        error: 'Internal server error',
        message: error.message,
      });
    }
    return;
  }
  
  // Not found
  sendResponse(res, 404, { 
    success: false, 
    error: 'Not found',
    availableEndpoints: [
      'GET  /api/health',
      'POST /api/analyze'
    ]
  });
});

// Start server
server.listen(PORT, HOST, () => {
  console.log(`\n🚀 API Server running at http://${HOST}:${PORT}/`);
  console.log('Endpoints:');
  console.log(`  GET  http://${HOST}:${PORT}/api/health`);
  console.log(`  POST http://${HOST}:${PORT}/api/analyze`);
  console.log('\nPress Ctrl+C to stop the server\n');
});

// [Rest of the code remains the same]

// Helper function to parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        if (body) {
          resolve(JSON.parse(body));
        } else {
          resolve({});
        }
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Helper function to send JSON response
function sendResponse(res, statusCode, data) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.statusCode = statusCode;
  res.end(JSON.stringify(data, null, 2));
}

// Mock data generator
function generateMockData(contractAddress) {
  return {
    success: true,
    data: {
      contractAddress,
      name: 'Mock NFT Collection',
      symbol: 'MOCK',
      totalSupply: '10000',
      owner: '0x0000000000000000000000000000000000000000',
      analysis: {
        security: Math.floor(Math.random() * 30) + 70, // 70-100
        activity: Math.floor(Math.random() * 30) + 60, // 60-90
        community: Math.floor(Math.random() * 30) + 50, // 50-80
        liquidity: Math.floor(Math.random() * 30) + 65, // 65-95
      },
      priceData: {
        currentPrice: (Math.random() * 2).toFixed(4),
        priceChange24h: (Math.random() * 10 - 5).toFixed(2),
        volume24h: Math.floor(Math.random() * 5000) + 1000,
      },
      lastUpdated: new Date().toISOString(),
    },
  };
}

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
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
