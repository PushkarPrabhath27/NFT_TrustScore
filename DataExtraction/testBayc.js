import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import { getCollectionWithStats } from './src/services/openSeaService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function testBayc() {
  try {
    const baycAddress = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
    console.log('Starting BAYC data fetch...');
    
    console.log('Fetching collection data...');
    const collection = await getCollectionWithStats(baycAddress);
    console.log('Successfully fetched collection data');
    
    if (!collection) {
      throw new Error('No collection data received');
    }
    
    console.log('Processing collection data...');
    
    // Extract and format the relevant data
    const result = {
      collection: {
        name: collection.name,
        description: collection.description,
        imageUrl: collection.image_url,
        externalUrl: collection.external_url,
        discordUrl: collection.discord_url,
        twitterUsername: collection.twitter_username,
        isVerified: collection.safelist_request_status === 'verified',
        contractAddress: collection.primary_asset_contracts?.[0]?.address,
        totalSupply: collection.stats?.total_supply || 0,
        numOwners: collection.stats?.num_owners || 0,
        floorPrice: collection.stats?.floor_price || 0,
        totalVolume: collection.stats?.total_volume || 0,
        oneDayVolume: collection.stats?.one_day_volume || 0,
        oneDaySales: collection.stats?.one_day_sales || 0,
        thirtyDayVolume: collection.stats?.thirty_day_volume || 0,
        thirtyDaySales: collection.stats?.thirty_day_sales || 0,
        averagePrice: collection.stats?.average_price || 0,
        marketCap: collection.stats?.market_cap || 0,
        _source: 'opensea_api',
        _timestamp: new Date().toISOString()
      },
      creatorData: {
        // This would need to be fetched separately as OpenSea doesn't expose creator info directly
        dataUnavailable: true,
        _reason: 'Creator data not available via OpenSea API'
      },
      riskAssessment: {
        // This would come from smart contract analysis
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
    console.error('Error fetching BAYC data:', error.message);
    process.exit(1);
  }
}

testBayc();
