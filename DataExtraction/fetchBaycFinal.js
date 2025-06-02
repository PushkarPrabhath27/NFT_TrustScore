// Simple script to fetch BAYC data using node-fetch
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const BAYC_ADDRESS = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

if (!OPENSEA_API_KEY) {
  console.error('Error: OPENSEA_API_KEY is not set in .env file');
  process.exit(1);
}

async function fetchBaycData() {
  try {
    console.log('Fetching BAYC data...');
    
    // Fetch collection data
    console.log('Fetching collection data...');
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
      const errorText = await collectionResponse.text();
      throw new Error(`Failed to fetch collection: ${collectionResponse.status} ${collectionResponse.statusText}\n${errorText}`);
    }
    
    const collection = await collectionResponse.json();
    
    // Fetch stats
    console.log('Fetching collection stats...');
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
      const errorText = await statsResponse.text();
      throw new Error(`Failed to fetch stats: ${statsResponse.status} ${statsResponse.statusText}\n${errorText}`);
    }
    
    const stats = await statsResponse.json();
    
    // Format the response according to the required structure
    const result = {
      collection: {
        name: collection.name,
        description: collection.description,
        imageUrl: collection.image_url,
        externalUrl: collection.external_url,
        discordUrl: collection.discord_url,
        twitterUsername: collection.twitter_username,
        isVerified: collection.safelist_request_status === 'verified',
        contractAddress: BAYC_ADDRESS,
        totalSupply: collection.stats?.total_supply || 0,
        numOwners: collection.stats?.num_owners || 0,
        floorPrice: stats?.floor_price || 0,
        totalVolume: stats?.total_volume || 0,
        oneDayVolume: stats?.one_day_volume || 0,
        oneDaySales: stats?.one_day_sales || 0,
        thirtyDayVolume: stats?.thirty_day_volume || 0,
        thirtyDaySales: stats?.thirty_day_sales || 0,
        averagePrice: stats?.average_price || 0,
        marketCap: stats?.market_cap || 0,
        _source: 'opensea_api',
        _timestamp: new Date().toISOString()
      },
      creatorData: {
        dataUnavailable: true,
        _reason: 'Creator data not available via OpenSea API'
      },
      riskAssessment: {
        dataUnavailable: true,
        _reason: 'Smart contract analysis not implemented'
      },
      _metadata: {
        success: true,
        source: 'opensea_api',
        timestamp: new Date().toISOString()
      }
    };
    
    console.log(JSON.stringify(result, null, 2));
    
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
