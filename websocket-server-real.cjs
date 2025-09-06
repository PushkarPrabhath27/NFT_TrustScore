const http = require('http');
const WebSocket = require('ws');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3004;
const HOST = '127.0.0.1';

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
  
  res.writeHead(404, headers);
  res.end(JSON.stringify({
    success: false,
    error: 'Not found',
    message: 'Invalid endpoint. Available endpoints: /api/health'
  }));
});

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

// Store active connections and their data
const activeConnections = new Map();

// Fetch real-time data from external APIs
async function fetchRealTimeData(contractAddress) {
  try {
    // In a real implementation, this would fetch data from blockchain APIs
    // For this example, we'll use our existing API server to get the initial data
    console.log(`[WebSocket Server] Fetching data from API for address: ${contractAddress}`);
    const response = await fetch(`http://${HOST}:4001/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contractAddress }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[WebSocket Server] Received data from API server. Status:', response.status);
    // Log only a portion of the data to avoid flooding the console
    console.log('[WebSocket Server] Data snippet:', JSON.stringify(data, null, 2).substring(0, 500));
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${contractAddress}:`, error);
    throw error;
  }
}

// Update data with real-time changes
function updateRealTimeData(data) {
  if (!data || !data.success || !data.data) {
    return data;
  }
  
  const updatedData = { ...data };
  const nftData = updatedData.data;
  
  // Update price with small random fluctuation (simulating real-time market changes)
  const currentPrice = parseFloat(nftData.priceData.currentPrice);
  const priceChange = (Math.random() * 0.02) - 0.01; // -1% to +1% change
  const newPrice = Math.max(0.001, currentPrice * (1 + priceChange));
  
  // Update price data
  nftData.priceData.currentPrice = newPrice.toFixed(4);
  nftData.priceData.priceChange24h = (parseFloat(nftData.priceData.priceChange24h) + priceChange * 100).toFixed(2);
  
  // Add new price point to history
  const newPricePoint = {
    date: new Date().toISOString(),
    price: parseFloat(newPrice.toFixed(4))
  };
  
  // Add to beginning and remove oldest if more than 30 points
  nftData.priceData.history.push(newPricePoint);
  if (nftData.priceData.history.length > 30) {
    nftData.priceData.history.shift();
  }
  
  // Update volume with small random change
  const volumeChange = Math.floor(Math.random() * 100) - 50;
  nftData.priceData.volume24h = Math.max(100, parseInt(nftData.priceData.volume24h) + volumeChange);
  
  // Occasionally update risk metrics (less frequently than price)
  if (Math.random() > 0.7) {
    const riskChange = (Math.random() * 4) - 2; // -2 to +2 change
    
    // Update risk metrics
    Object.keys(nftData.riskData).forEach(key => {
      if (key !== 'overallRisk') {
        nftData.riskData[key] = Math.min(100, Math.max(0, nftData.riskData[key] + riskChange));
      }
    });
    
    // Recalculate overall risk
    const riskValues = Object.entries(nftData.riskData)
      .filter(([key]) => key !== 'overallRisk')
      .map(([_, value]) => value);
      
    nftData.riskData.overallRisk = Math.floor(
      riskValues.reduce((sum, value) => sum + value, 0) / riskValues.length
    );
  }
  
  // Update last updated timestamp
  nftData.lastUpdated = new Date().toISOString();
  
  return updatedData;
}

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  let contractAddress = null;
  
  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to NFT Analysis WebSocket Server',
    timestamp: new Date().toISOString()
  }));
  
  // Handle messages from client
  ws.on('message', async (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      
      if (parsedMessage.type === 'analyze' && parsedMessage.contractAddress) {
        contractAddress = parsedMessage.contractAddress;
        console.log(`Analyzing contract: ${contractAddress}`);
        
        try {
          // Fetch initial data
          const initialData = await fetchRealTimeData(contractAddress);
          
          // Store the connection and data
          activeConnections.set(ws, {
            contractAddress,
            data: initialData
          });
          
          // Send initial data to client
          ws.send(JSON.stringify({
            type: 'analysis',
            data: initialData
          }));
          
          // Set up interval for real-time updates
          const updateInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              const connectionData = activeConnections.get(ws);
              if (connectionData) {
                // Update data with real-time changes
                const updatedData = updateRealTimeData(connectionData.data);
                
                // Store updated data
                activeConnections.set(ws, {
                  ...connectionData,
                  data: updatedData
                });
                
                // Send updated data to client
                ws.send(JSON.stringify({
                  type: 'update',
                  data: updatedData
                }));
              }
            } else {
              clearInterval(updateInterval);
            }
          }, 5000); // Update every 5 seconds
          
          ws.updateInterval = updateInterval;
          
        } catch (error) {
          console.error(`Error analyzing contract ${contractAddress}:`, error);
          ws.send(JSON.stringify({
            type: 'error',
            message: `Error analyzing contract: ${error.message}`,
            timestamp: new Date().toISOString()
          }));
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    
    // Clear update interval
    if (ws.updateInterval) {
      clearInterval(ws.updateInterval);
    }
    
    // Remove from active connections
    activeConnections.delete(ws);
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
  console.log(`  GET  http://${HOST}:${PORT}/api/health`);
  console.log('\nPress Ctrl+C to stop the server\n');
});