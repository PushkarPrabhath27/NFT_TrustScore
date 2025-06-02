// API Configuration
export default {
  // API Configuration
  api: {
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
    timeout: 10000, // 10 seconds
  },
  
  // OpenSea API Configuration
  opensea: {
    baseUrl: process.env.OPENSEA_API_URL || 'https://api.opensea.io/api/v2',
    apiKey: process.env.OPENSEA_API_KEY || '35c310c1c29846db8a57a47413a85efc',
    rateLimit: 4, // requests per second
    maxConcurrent: 5,
  },
  
  // Alchemy API Configuration
  alchemy: {
    apiKey: process.env.ALCHEMY_API_KEY,
    baseUrl: 'https://eth-mainnet.g.alchemy.com/nft/v2',
    maxBlockRange: 2000, // Maximum block range for event queries
  },
  
  // MongoDB Configuration
  mongo: {
    strictQuery: false, // Set to false to suppress deprecation warning
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  
  // Price Data Configuration
  price: {
    defaultCurrency: 'ETH',
    pricePrecision: 6,
    maxPriceHistoryDays: 365, // 1 year
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss',
  },
  
  // Feature Flags
  features: {
    enableFallbackData: true,
    enablePriceCache: true,
    enableRetry: true,
  },
  
  // Known Collection Overrides
  knownCollections: {
    '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e': { // Doodles
      name: 'Doodles',
      slug: 'doodles-official',
      image_url: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOvdkqnVZPMNoWeyklPhDP8pqQl525Z3zB1Er9LfoHIfAeMpyn_5W3pdoafPb4Ly0mxTWzLG2eK6quj-5lSg9PQ',
      external_url: 'https://doodles.app',
      description: 'A community-driven collectibles project featuring art by Burnt Toast.',
    },
    // Add more known collections as needed
  }
};
