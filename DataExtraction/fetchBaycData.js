const axios = require('axios');
require('dotenv').config();

async function fetchBaycData() {
  try {
    const response = await axios.get(
      'https://api.opensea.io/api/v2/collections/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('BAYC Collection Data:', JSON.stringify(response.data, null, 2));
    
    // Fetch stats separately
    const statsResponse = await axios.get(
      'https://api.opensea.io/api/v2/collections/ethereum/0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d/stats',
      {
        headers: {
          'X-API-KEY': process.env.OPENSEA_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('\nBAYC Collection Stats:', JSON.stringify(statsResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error fetching BAYC data:', error.response?.data || error.message);
  }
}

fetchBaycData();
