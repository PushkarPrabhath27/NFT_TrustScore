/**
 * Mock Data Test Component
 * Tests the UI with known-good mock data to isolate frontend behavior
 */

import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import AnalysisTabs from './dashboard/analysis/AnalysisTabs';

const MockDataTest = () => {
  const [showMockData, setShowMockData] = useState(false);

  // Mock data that matches the expected backend response structure
  const mockAnalysisData = {
    contractAddress: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
    nftData: {
      id: "1",
      name: "Bored Ape #1",
      tokenId: "1",
      image: "https://img.seadn.io/files/7a4c6a0a0b8a4a7c9b0b8a4a7c9b0b8a4.png",
      collection: "Bored Ape Yacht Club",
      creator: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      blockchain: "Ethereum",
      isVerified: true,
      trustScore: 85,
      riskLevel: "Low"
    },
    trustScoreData: {
      score: 85,
      confidence: "High",
      factors: [
        { name: "Contract Security", score: 90, weight: 0.25 },
        { name: "Developer Reputation", score: 80, weight: 0.15 },
        { name: "Transaction History", score: 85, weight: 0.20 },
        { name: "Community Metrics", score: 88, weight: 0.15 },
        { name: "Metadata Reliability", score: 82, weight: 0.25 }
      ],
      history: [
        { date: "2023-01-01", score: 80 },
        { date: "2023-02-01", score: 82 },
        { date: "2023-03-01", score: 84 },
        { date: "2023-04-01", score: 85 }
      ],
      strengths: [
        "Contract implements standard NFT interfaces",
        "Consistent transaction patterns",
        "Active community engagement"
      ],
      concerns: [
        "High gas fees during minting",
        "Limited utility features"
      ]
    },
    priceData: {
      current: 12.5,
      currency: "ETH",
      history: [
        { date: "2023-01-01", price: 8.2 },
        { date: "2023-02-01", price: 9.5 },
        { date: "2023-03-01", price: 10.8 },
        { date: "2023-04-01", price: 12.5 }
      ],
      prediction: {
        nextMonth: 13.2,
        threeMonth: 15.0,
        confidence: "High"
      },
      comparative: [
        { collection: "CryptoPunks", avgPrice: 15.2, difference: "-18%" },
        { collection: "Azuki", avgPrice: 8.5, difference: "+47%" }
      ]
    },
    riskData: {
      overallRisk: "Low",
      factors: [
        {
          name: "Contract Vulnerability",
          score: 15,
          level: "Low",
          description: "The smart contract has been audited and shows no vulnerabilities",
          impact: "Minimal risk of funds being stolen or locked",
          mitigationSteps: ["No action needed"],
          historicalTrend: "Stable"
        },
        {
          name: "Market Volatility",
          score: 35,
          level: "Medium",
          description: "Price has shown moderate volatility",
          impact: "Potential for value fluctuation",
          mitigationSteps: ["Monitor price trends", "Set stop-loss orders"],
          historicalTrend: "Increasing"
        }
      ],
      comparativeAnalysis: {
        labels: ["Contract Risk", "Market Risk", "Creator Risk", "Liquidity Risk"],
        comparisonItems: [
          { name: "This NFT", values: [15, 35, 20, 25] },
          { name: "Collection Average", values: [20, 40, 25, 30] },
          { name: "Market Average", values: [30, 45, 35, 40] }
        ]
      },
      mitigationRecommendations: [
        "Monitor price trends for optimal entry/exit",
        "Verify metadata accuracy before purchase"
      ]
    },
    fraudData: {
      fraudScore: 15,
      alertLevel: "Low",
      alertMessage: "No significant fraud indicators detected",
      indicators: [
        { name: "Wash Trading", severity: "Low", details: "Limited trading activity detected" },
        { name: "Smart Contract Vulnerabilities", severity: "Low", details: "Contract has been audited" },
        { name: "Metadata Authenticity", severity: "Low", details: "Metadata appears consistent" },
        { name: "Developer History", severity: "Low", details: "Strong developer reputation" }
      ]
    },
    collectionData: {
      name: "Bored Ape Yacht Club",
      address: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      overallTrustScore: 85,
      overallRiskLevel: "Low",
      verifiedMetadata: 95,
      riskFactors: ["Market volatility", "Floor price fluctuation"],
      trustScoreDistribution: [
        { score: "0-20", count: 5 },
        { score: "21-40", count: 15 },
        { score: "41-60", count: 45 },
        { score: "61-80", count: 120 },
        { score: "81-100", count: 65 }
      ],
      priceTrends: [
        { date: "2023-01-01", floorPrice: 8.0, avgPrice: 8.5, volume: 450 },
        { date: "2023-02-01", floorPrice: 9.0, avgPrice: 9.8, volume: 520 },
        { date: "2023-03-01", floorPrice: 10.5, avgPrice: 11.2, volume: 490 },
        { date: "2023-04-01", floorPrice: 12.0, avgPrice: 12.8, volume: 580 }
      ],
      rarityDistribution: [
        { name: "Common", value: 150 },
        { name: "Uncommon", value: 75 },
        { name: "Rare", value: 20 },
        { name: "Epic", value: 4 },
        { name: "Legendary", value: 1 }
      ],
      collectionItems: [
        {
          id: "1",
          name: "Bored Ape #1",
          trustScore: 88,
          rarity: "Rare",
          price: 12.5,
          risk: "Low"
        },
        {
          id: "2",
          name: "Bored Ape #2",
          trustScore: 82,
          rarity: "Common",
          price: 11.8,
          risk: "Low"
        }
      ]
    },
    portfolioData: {
      assets: [
        { id: "1", name: "Bored Ape #1", value: 12.5, trustScore: 88 },
        { id: "2", name: "Bored Ape #2", value: 11.8, trustScore: 82 }
      ],
      stats: {
        totalValue: 24.3,
        totalItems: 2,
        avgTrustScore: 85,
        riskDistribution: {
          Low: 2,
          Medium: 0,
          High: 0
        }
      },
      valueHistory: [
        { date: "2023-01-01", value: 20.0 },
        { date: "2023-02-01", value: 21.5 },
        { date: "2023-03-01", value: 23.0 },
        { date: "2023-04-01", value: 24.3 }
      ],
      collectionDistribution: [
        { name: "Bored Ape Yacht Club", value: 2 }
      ],
      trustScoreDistribution: [
        { range: "81-100", count: 2 }
      ]
    }
  };

  return (
    <Card sx={{ mb: 2, bgcolor: 'info.light' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Mock Data Test
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          This component tests the UI with known-good mock data to verify that the frontend
          can properly display analysis results when data is available.
        </Typography>
        
        <Button
          variant="contained"
          onClick={() => setShowMockData(!showMockData)}
          sx={{ mb: 2 }}
        >
          {showMockData ? 'Hide Mock Data' : 'Show Mock Data Test'}
        </Button>

        {showMockData && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Mock Analysis Data (Bored Ape Yacht Club):
            </Typography>
            <AnalysisTabs data={mockAnalysisData} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default MockDataTest;
