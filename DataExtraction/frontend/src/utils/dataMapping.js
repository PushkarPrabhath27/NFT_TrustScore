/**
 * Data Mapping Utility
 * Maps backend API response data to frontend component expected structure
 */

/**
 * Maps raw backend data to frontend component structure
 * @param {Object} rawData - Raw data from backend API
 * @returns {Object} Mapped data structure for frontend components
 */
export const mapBackendDataToFrontend = (rawData) => {
  if (!rawData || typeof rawData !== 'object') {
    return {};
  }

  console.log('🔄 [DataMapping] Mapping backend data:', rawData);

  // Create mapped data structure
  const mappedData = {
    // Summary & Segmentation
    summary: rawData.summary || rawData.analysisSummary || rawData.overview || null,
    marketSegment: rawData.marketSegment || rawData.segment || rawData.marketCategory || null,
    marketPositionScore: rawData.marketPositionScore || rawData.positionScore || rawData.score || null,

    // Market & Price Analysis
    marketData: rawData.marketData || rawData.market || rawData.marketAnalysis || {
      marketCap: rawData.marketCap || 0,
      volume24h: rawData.volume24h || rawData.volume || 0,
      totalSupply: rawData.totalSupply || 0,
      holders: rawData.holders || rawData.holderCount || 0,
      liquidity: rawData.liquidity || 0,
      volatility: rawData.volatility || 0
    },
    priceData: rawData.priceData || rawData.price || rawData.pricing || {
      current: rawData.currentPrice || rawData.price || 0,
      previous: rawData.previousPrice || 0,
      currency: rawData.currency || 'ETH',
      history: rawData.priceHistory || rawData.history || [],
      prediction: rawData.pricePrediction || null
    },

    // Portfolio & Holdings
    portfolioData: rawData.portfolioData || rawData.portfolio || rawData.holdings || {
      totalValue: rawData.totalValue || 0,
      totalAssets: rawData.totalAssets || 0,
      assets: rawData.assets || [],
      distribution: rawData.distribution || {},
      performance: rawData.performance || {},
      riskMetrics: rawData.riskMetrics || {},
      diversification: rawData.diversification || {}
    },

    // Creator & Collection
    creatorData: rawData.creatorData || rawData.creator || rawData.artist || {
      name: rawData.creatorName || rawData.artistName || 'Unknown Creator',
      address: rawData.creatorAddress || rawData.artistAddress || null,
      verified: rawData.creatorVerified || rawData.artistVerified || false,
      reputation: rawData.creatorReputation || rawData.artistReputation || 0,
      socialLinks: rawData.creatorSocialLinks || rawData.artistSocialLinks || {},
      bio: rawData.creatorBio || rawData.artistBio || null,
      website: rawData.creatorWebsite || rawData.artistWebsite || null,
      totalCollections: rawData.creatorTotalCollections || 0,
      totalNFTs: rawData.creatorTotalNFTs || 0
    },
    collectionData: rawData.collectionData || rawData.collection || rawData.collectionInfo || {
      name: rawData.collectionName || 'Unknown Collection',
      symbol: rawData.collectionSymbol || null,
      description: rawData.collectionDescription || null,
      totalSupply: rawData.collectionTotalSupply || rawData.totalSupply || 0,
      floorPrice: rawData.collectionFloorPrice || rawData.floorPrice || 0,
      volume: rawData.collectionVolume || rawData.volume || 0,
      owners: rawData.collectionOwners || rawData.owners || 0,
      website: rawData.collectionWebsite || null,
      twitter: rawData.collectionTwitter || null,
      discord: rawData.collectionDiscord || null,
      traits: rawData.collectionTraits || rawData.traits || [],
      rarity: rawData.collectionRarity || rawData.rarity || null
    },

    // Risk & Trust Assessment
    riskData: rawData.riskData || rawData.risk || rawData.riskAnalysis || {
      overallRisk: rawData.overallRisk || rawData.riskLevel || 'Unknown',
      riskScore: rawData.riskScore || 0,
      factors: rawData.riskFactors || rawData.factors || [],
      volatility: rawData.riskVolatility || rawData.volatility || 0,
      liquidity: rawData.riskLiquidity || rawData.liquidity || 0,
      marketCap: rawData.riskMarketCap || rawData.marketCap || 0
    },
    fraudData: rawData.fraudData || rawData.fraud || rawData.fraudAnalysis || {
      fraudScore: rawData.fraudScore || 0,
      alertLevel: rawData.fraudAlertLevel || rawData.alertLevel || 'Unknown',
      indicators: rawData.fraudIndicators || rawData.indicators || [],
      confidence: rawData.fraudConfidence || rawData.confidence || 0
    },
    trustScoreData: rawData.trustScoreData || rawData.trustScore || rawData.trust || {
      score: rawData.trustScore || rawData.score || 0,
      confidence: rawData.trustConfidence || rawData.confidence || 'Unknown',
      factors: rawData.trustFactors || rawData.factors || [],
      breakdown: rawData.trustBreakdown || rawData.breakdown || {}
    },

    // NFT-Specific Data
    nftData: rawData.nftData || rawData.nft || rawData.nftInfo || {
      id: rawData.nftId || rawData.id || 'Unknown',
      name: rawData.nftName || rawData.name || 'Unnamed NFT',
      description: rawData.nftDescription || rawData.description || null,
      image: rawData.nftImage || rawData.image || null,
      animationUrl: rawData.nftAnimationUrl || rawData.animationUrl || null,
      externalUrl: rawData.nftExternalUrl || rawData.externalUrl || null,
      attributes: rawData.nftAttributes || rawData.attributes || [],
      rarity: rawData.nftRarity || rawData.rarity || null,
      rarityRank: rawData.nftRarityRank || rawData.rarityRank || null,
      lastSale: rawData.nftLastSale || rawData.lastSale || null,
      currentPrice: rawData.nftCurrentPrice || rawData.currentPrice || null,
      owner: rawData.nftOwner || rawData.owner || null,
      creator: rawData.nftCreator || rawData.creator || null,
      tokenStandard: rawData.nftTokenStandard || rawData.tokenStandard || null,
      blockchain: rawData.nftBlockchain || rawData.blockchain || null,
      contractAddress: rawData.nftContractAddress || rawData.contractAddress || null,
      tokenId: rawData.nftTokenId || rawData.tokenId || null,
      metadata: rawData.nftMetadata || rawData.metadata || {}
    }
  };

  // Log the mapping results
  console.log('✅ [DataMapping] Mapped data structure:', {
    originalKeys: Object.keys(rawData),
    mappedKeys: Object.keys(mappedData),
    hasSummary: !!mappedData.summary,
    hasMarketData: !!mappedData.marketData,
    hasPriceData: !!mappedData.priceData,
    hasNftData: !!mappedData.nftData,
    hasTrustScoreData: !!mappedData.trustScoreData,
    hasRiskData: !!mappedData.riskData,
    hasFraudData: !!mappedData.fraudData,
    hasCreatorData: !!mappedData.creatorData,
    hasCollectionData: !!mappedData.collectionData,
    hasPortfolioData: !!mappedData.portfolioData
  });

  return mappedData;
};

/**
 * Validates that mapped data has the expected structure
 * @param {Object} mappedData - Mapped data to validate
 * @returns {Object} Validation results
 */
export const validateMappedData = (mappedData) => {
  const validation = {
    isValid: true,
    issues: [],
    dataCount: 0
  };

  const expectedFields = [
    'summary', 'marketData', 'priceData', 'nftData', 'trustScoreData',
    'riskData', 'fraudData', 'creatorData', 'collectionData', 'portfolioData'
  ];

  expectedFields.forEach(field => {
    if (mappedData[field] && mappedData[field] !== null) {
      validation.dataCount++;
    } else {
      validation.issues.push(`Missing or null: ${field}`);
    }
  });

  if (validation.dataCount === 0) {
    validation.isValid = false;
    validation.issues.push('No valid data found in mapped structure');
  }

  console.log('🔍 [DataMapping] Validation results:', validation);
  return validation;
};
