import { expect } from 'chai';
import sinon from 'sinon';
import openSeaService from '../../src/services/openSeaService.js';
import * as apiService from '../../src/services/apiService.js';
import logger from '../../src/services/logger.js';

// Test contract addresses
const TEST_CONTRACT = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'; // Bored Ape Yacht Club
const UNKNOWN_CONTRACT = '0x0000000000000000000000000000000000000000';

describe('OpenSea Service', () => {
  let sandbox;
  
  // Mock data
  const mockCollectionData = {
    name: 'Test Collection',
    description: 'A test collection',
    image_url: 'https://test.com/image.png',
    external_url: 'https://test.com',
    twitter_username: 'test',
    discord_url: 'https://discord.gg/test',
    stats: {
      floor_price: 10.5,
      one_day_volume: 1000,
      total_volume: 100000
    },
    _source: 'test',
    _timestamp: new Date().toISOString()
  };
  
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    // Stub the logger to prevent test output pollution
    sandbox.stub(logger, 'debug');
    sandbox.stub(logger, 'info');
    sandbox.stub(logger, 'warn');
    sandbox.stub(logger, 'error');
  });
  
  afterEach(() => {
    sandbox.restore();
  });
  
  describe('getOpenSeaData', () => {
    it('should return collection data for a known contract', async () => {
      // Stub the API call
      sandbox.stub(apiService, 'fetchOpenSea')
        .withArgs('/collections/boredapeyachtclub')
        .resolves(mockCollectionData);
      
      const result = await openSeaService.getOpenSeaData(TEST_CONTRACT);
      
      expect(result).to.be.an('object');
      expect(result).to.have.property('name', 'Test Collection');
      expect(result).to.have.property('stats');
      expect(result._source).to.equal('opensea_v2');
    });
    
    it('should handle unknown contracts gracefully', async () => {
      sandbox.stub(apiService, 'fetchOpenSea').resolves(null);
      
      const result = await openSeaService.getOpenSeaData(UNKNOWN_CONTRACT);
      
      expect(result).to.be.null;
      expect(logger.warn.called).to.be.true;
    });
    
    it('should use fallback data when API fails', async () => {
      sandbox.stub(apiService, 'fetchOpenSea').rejects(new Error('API Error'));
      
      const result = await openSeaService.getOpenSeaData(TEST_CONTRACT);
      
      expect(result).to.be.an('object');
      expect(result).to.have.property('name', 'Bored Ape Yacht Club');
      expect(result._source).to.equal('fallback');
    });
  });
  
  describe('getRecentSales', () => {
    const mockSales = {
      asset_events: [
        {
          total_price: '1000000000000000000', // 1 ETH
          payment_token: { symbol: 'ETH' },
          transaction: { timestamp: '1234567890', transaction_hash: '0x123' },
          seller: { address: '0x111' },
          winner_account: { address: '0x222' },
          asset: { token_id: '1' }
        }
      ]
    };
    
    it('should return recent sales for a contract', async () => {
      sandbox.stub(apiService, 'fetchOpenSea')
        .withArgs('/events', sinon.match.any)
        .resolves(mockSales);
      
      const sales = await openSeaService.getRecentSales(TEST_CONTRACT);
      
      expect(sales).to.be.an('array');
      expect(sales).to.have.length(1);
      expect(sales[0]).to.have.property('price', '1000000000000000000');
      expect(sales[0]).to.have.property('currency', 'ETH');
    });
    
    it('should return empty array for invalid contract', async () => {
      sandbox.stub(apiService, 'fetchOpenSea').resolves({ asset_events: [] });
      
      const sales = await openSeaService.getRecentSales(UNKNOWN_CONTRACT);
      
      expect(sales).to.be.an('array').that.is.empty;
    });
  });
  
  describe('getFloorPriceHistory', () => {
    it('should generate floor price history from sales', async () => {
      const mockSales = [
        { 
          price: '2000000000000000000', // 2 ETH
          currency: 'ETH',
          timestamp: '1234567800',
          txHash: '0x123'
        },
        { 
          price: '1500000000000000000', // 1.5 ETH
          currency: 'ETH',
          timestamp: '1234567890',
          txHash: '0x124'
        },
        { 
          price: '1000000000000000000', // 1 ETH
          currency: 'ETH',
          timestamp: '1234567890', // Same day as above
          txHash: '0x125'
        }
      ];
      
      sandbox.stub(openSeaService, 'getRecentSales').resolves(mockSales);
      sandbox.stub(openSeaService, 'getOpenSeaData').resolves({ slug: 'test' });
      
      const history = await openSeaService.getFloorPriceHistory(TEST_CONTRACT);
      
      expect(history).to.be.an('array');
      expect(history).to.have.length(1); // Should be grouped by day
      expect(history[0]).to.have.property('price', 1); // Should take the minimum price for the day
    });
  });
  
  describe('getSimilarCollections', () => {
    it('should return similar collections', async () => {
      const mockSimilar = {
        collections: [
          { name: 'Similar 1', slug: 'similar-1' },
          { name: 'Similar 2', slug: 'similar-2' }
        ]
      };
      
      sandbox.stub(apiService, 'fetchOpenSea')
        .withArgs('/collections/test/similar')
        .resolves(mockSimilar);
      
      sandbox.stub(openSeaService, 'getOpenSeaData').resolves({ slug: 'test' });
      
      const similar = await openSeaService.getSimilarCollections(TEST_CONTRACT);
      
      expect(similar).to.be.an('array');
      expect(similar).to.have.length(2);
      expect(similar[0]).to.have.property('_source', 'opensea');
    });
  });
  
  describe('getCollectionStats', () => {
    it('should return collection stats', async () => {
      const mockStats = {
        stats: {
          floor_price: 10.5,
          one_day_volume: 1000,
          total_volume: 100000
        }
      };
      
      sandbox.stub(apiService, 'fetchOpenSea')
        .withArgs('/collection/test/stats')
        .resolves(mockStats);
      
      sandbox.stub(openSeaService, 'getOpenSeaData').resolves({ slug: 'test' });
      
      const stats = await openSeaService.getCollectionStats(TEST_CONTRACT);
      
      expect(stats).to.be.an('object');
      expect(stats).to.have.property('floor_price', 10.5);
      expect(stats).to.have.property('_source', 'opensea');
    });
  });
  
  describe('getCollectionTraits', () => {
    it('should return collection traits', async () => {
      const mockTraits = {
        traits: {
          'Background': [
            { value: 'Blue', count: 1000 },
            { value: 'Red', count: 500 }
          ],
          'Fur': [
            { value: 'Solid', count: 800 },
            { value: 'Striped', count: 700 }
          ]
        }
      };
      
      sandbox.stub(apiService, 'fetchOpenSea')
        .withArgs('/collection/test/traits')
        .resolves(mockTraits);
      
      sandbox.stub(openSeaService, 'getOpenSeaData').resolves({ slug: 'test' });
      
      const traits = await openSeaService.getCollectionTraits(TEST_CONTRACT);
      
      expect(traits).to.be.an('object');
      expect(traits).to.have.property('traits');
      expect(traits.traits).to.have.property('Background');
      expect(traits.traits).to.have.property('Fur');
      expect(traits._source).to.equal('opensea');
    });
    
    it('should handle API errors gracefully', async () => {
      sandbox.stub(apiService, 'fetchOpenSea')
        .withArgs('/collection/test/traits')
        .rejects(new Error('API Error'));
      
      sandbox.stub(openSeaService, 'getOpenSeaData').resolves({ slug: 'test' });
      
      const traits = await openSeaService.getCollectionTraits(TEST_CONTRACT);
      
      expect(traits).to.be.an('object').that.is.empty;
      expect(logger.error.calledOnce).to.be.true;
    });
  });
  
  describe('makeOpenSeaRequest', () => {
    it('should make API requests and handle responses', async () => {
      const testData = { test: 'data' };
      sandbox.stub(apiService, 'fetchOpenSea')
        .withArgs('/test/endpoint')
        .resolves(testData);
      
      const result = await openSeaService.makeOpenSeaRequest('/test/endpoint');
      
      expect(result).to.deep.equal(testData);
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      sandbox.stub(apiService, 'fetchOpenSea')
        .withArgs('/error/endpoint')
        .rejects(error);
      
      const result = await openSeaService.makeOpenSeaRequest('/error/endpoint');
      
      expect(result).to.be.null;
      expect(logger.error.calledOnce).to.be.true;
    });
  });

  describe('Error Handling', () => {
    it('should handle missing contract address gracefully', async () => {
      const result = await openSeaService.getOpenSeaData();
      expect(result).to.be.null;
      expect(logger.warn.calledWith('No contract address provided to getOpenSeaData')).to.be.true;
    });

    it('should handle invalid contract address format', async () => {
      const result = await openSeaService.getOpenSeaData('invalid-address');
      expect(result).to.be.null;
    });
  });
});
