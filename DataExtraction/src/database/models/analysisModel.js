/**
 * Analysis Model
 * MongoDB schema for storing NFT contract analysis results
 */

import mongoose from 'mongoose';

// Define the schema for analysis results
const AnalysisSchema = new mongoose.Schema({
  contractAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  marketSegment: {
    type: String,
    required: true
  },
  marketPositionScore: {
    type: Number,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  components: [
    {
      name: String,
      segment: String,
      confidence: Number,
      details: String,
      trendScore: Number,
      growth: Number,
      sentiment: String,
      volatility: String,
      competitorScore: Number,
      competitorCount: Number,
      topCompetitors: [String],
      marketShareScore: Number,
      marketShare: Number,
      marketShareTrend: String
    }
  ],
  trustScoreData: {
    score: Number,
    creatorScore: Number,
    contractScore: Number,
    communityScore: Number,
    liquidityScore: Number,
    details: String
  },
  priceData: {
    currentPrice: Number,
    priceHistory: [{
      date: Date,
      price: Number
    }],
    priceVolatility: String,
    priceTrend: String
  },
  riskData: {
    overallRisk: String,
    riskFactors: [{
      name: String,
      level: String,
      details: String
    }]
  },
  fraudData: {
    isSuspicious: Boolean,
    suspiciousFactors: [String],
    riskLevel: String
  },
  collectionData: {
    name: String,
    totalSupply: Number,
    uniqueOwners: Number,
    image: String,
    isVerified: Boolean
  },
  creatorData: {
    address: String,
    name: String,
    isVerified: Boolean,
    trustScore: Number,
    collections: [String],
    socialLinks: [{
      platform: String,
      url: String
    }]
  },
  hathorTokenId: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Create the model
const Analysis = mongoose.model('Analysis', AnalysisSchema);

export default Analysis;