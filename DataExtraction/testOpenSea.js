// Simple test script for OpenSea API
const axios = require('axios');
require('dotenv').config();

const BAYC_ADDRESS = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

if (!OPENSEA_API_KEY) {
  console.error('Error: OPENSEA_API_KEY is not set in .env file');
  process.exit(1);
}

console.log('OpenSea API Key:', OPENSEA_API_KEY ? '***' + OPENSEA_API_KEY.slice(-4) : 'Not set');

async function testOpenSea() {
  try {
    console.log('Testing OpenSea API...');
    
    // Make a simple request to OpenSea API
    const response = await axios.get(
      `https://api.opensea.io/api/v2/collections/ethereum/${BAYC_ADDRESS}`,
      {
        headers: {
          'X-API-KEY': OPENSEA_API_KEY,
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 seconds timeout
      }
    );
    
    console.log('OpenSea API Response Status:', response.status);
    console.log('Collection Name:', response.data.name);
    console.log('Description:', response.data.description?.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('Error testing OpenSea API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    console.error('Full error:', error);
  }
}

testOpenSea();
