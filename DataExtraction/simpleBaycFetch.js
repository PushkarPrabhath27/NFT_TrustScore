// Simple script to fetch BAYC data using fetch API
const fetch = require('node-fetch');
require('dotenv').config();

const BAYC_ADDRESS = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

async function fetchBaycData() {
  try {
    console.log('Fetching BAYC data...');
    
    // Fetch collection data
    const collectionResponse = await fetch(
      `https://api.opensea.io/api/v2/collections/ethereum/${BAYC_ADDRESS}`,
      {
        headers: {
          'X-API-KEY': OPENSEA_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!collectionResponse.ok) {
      throw new Error(`Failed to fetch collection: ${collectionResponse.status} ${collectionResponse.statusText}`);
    }
    
    const collection = await collectionResponse.json();
    console.log('Collection Data:', JSON.stringify(collection, null, 2));
    
    // Fetch stats
    const statsResponse = await fetch(
      `https://api.opensea.io/api/v2/collections/ethereum/${BAYC_ADDRESS}/stats`,
      {
        headers: {
          'X-API-KEY': OPENSEA_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!statsResponse.ok) {
      throw new Error(`Failed to fetch stats: ${statsResponse.status} ${statsResponse.statusText}`);
    }
    
    const stats = await statsResponse.json();
    console.log('\nStats:', JSON.stringify(stats, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the function
fetchBaycData();
