import http from 'http';

const server = http.createServer((req, res) => {
  res.end('Test server running');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  
  // Auto-shutdown after 5 seconds for testing
  setTimeout(() => {
    console.log('Shutting down test server');
    process.exit(0);
  }, 5000);
});

export default server;
