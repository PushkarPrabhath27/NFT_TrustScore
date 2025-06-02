const http = require('http');
const url = require('url');

const PORT = 3001;

const server = http.createServer((req, res) => {
  const { method, url: reqUrl } = req;
  const parsedUrl = url.parse(reqUrl, true);
  const pathname = parsedUrl.pathname;
  
  console.log(`[${new Date().toISOString()}] ${method} ${reqUrl}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check endpoint
  if (method === 'GET' && pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString() 
    }));
    return;
  }
  
  // Analyze endpoint
  if (method === 'POST' && pathname === '/api/analyze') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const contractAddress = data.contractAddress || '';
        
        console.log(`Analyzing contract: ${contractAddress}`);
        
        const response = {
          success: true,
          data: {
            contractAddress,
            name: 'Test NFT Collection',
            symbol: 'TEST',
            totalSupply: '10000',
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
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
      } catch (error) {
        console.error('Error processing request:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: 'Internal server error' 
        }));
      }
    });
    
    return;
  }
  
  // Not found
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Simple HTTP Server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  POST http://localhost:${PORT}/api/analyze\n`);
});

// Handle errors
server.on('error', (error) => {
  console.error('Server error:', error);
});
