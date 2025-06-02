const net = require('net');

const HOST = '127.0.0.1';
const PORT = 3001;

console.log(`Attempting to connect to ${HOST}:${PORT}...`);

// Try to connect to the server
const client = new net.Socket();

client.on('connect', () => {
  console.log('Successfully connected to the server!');
  client.end();
  process.exit(0);
});

client.on('error', (error) => {
  console.error('Connection error:', error.message);
  console.log('\nTroubleshooting steps:');
  console.log('1. Make sure the server is running in another terminal');
  console.log('2. Check if any firewall is blocking the connection');
  console.log('3. Try a different port number');
  process.exit(1);
});

client.connect(PORT, HOST);

// Set a timeout
setTimeout(() => {
  console.error('Connection timeout - server did not respond');
  client.destroy();
  process.exit(1);
}, 5000);
