import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const BAYC_ADDRESS = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

if (!OPENSEA_API_KEY) {
  console.error('Error: OPENSEA_API_KEY is not set in .env file');
  process.exit(1);
}

async function fetchCollectionData() {
  try {
    console.log('Fetching BAYC collection data...');
    
    const response = await fetch(
      `https://api.opensea.io/api/v2/collections/ethereum/${BAYC_ADDRESS}`,
      {
        headers: {
          'X-API-KEY': OPENSEA_API_KEY,
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`OpenSea API error: ${response.status} ${response.statusText}`);
    }
    
    const collectionData = await response.json();
    
    // Now fetch the stats
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
      throw new Error(`OpenSea Stats API error: ${statsResponse.status} ${statsResponse.statusText}`);
    }
    
    const statsData = await statsResponse.json();
    
    // Format the response
    const result = {
      collection: {
        name: collectionData.name,
        description: collectionData.description,
        imageUrl: collectionData.image_url,
        externalUrl: collectionData.external_url,
        discordUrl: collectionData.discord_url,
        twitterUsername: collectionData.twitter_username,
        isVerified: collectionData.safelist_request_status === 'verified',
        contractAddress: BAYC_ADDRESS,
        totalSupply: collectionData.stats?.total_supply || 0,
        numOwners: collectionData.stats?.num_owners || 0,
        floorPrice: statsData?.floor_price || 0,
        totalVolume: statsData?.total_volume || 0,
        oneDayVolume: statsData?.one_day_volume || 0,
        oneDaySales: statsData?.one_day_sales || 0,
        thirtyDayVolume: statsData?.thirty_day_volume || 0,
        thirtyDaySales: statsData?.thirty_day_sales || 0,
        averagePrice: statsData?.average_price || 0,
        marketCap: statsData?.market_cap || 0,
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
    process.exit(1);
  }
}

// Run the function
fetchCollectionData();
