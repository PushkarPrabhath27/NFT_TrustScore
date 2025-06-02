import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiBarChart2, FiInfo, FiTarget } from 'react-icons/fi';

const MarketInsights = ({ marketData, collectionData }) => {
  const [loading, setLoading] = useState(true);
  const [marketPosition, setMarketPosition] = useState(null);
  const [categoryRanking, setCategoryRanking] = useState(null);
  const [marketSegmentation, setMarketSegmentation] = useState([]);
  const [competitiveAnalysis, setCompetitiveAnalysis] = useState([]);
  const [selectedTab, setSelectedTab] = useState('position');
  
  useEffect(() => {
    if (marketData && collectionData) {
      setLoading(true);
      
      // Process market position data
      const position = {
        percentile: marketData.marketPosition?.percentile || 85,
        volumeRank: marketData.marketPosition?.volumeRank || 120,
        pricePercentile: marketData.marketPosition?.pricePercentile || 72,
        growthPercentile: marketData.marketPosition?.growthPercentile || 91,
        totalCollections: marketData.marketPosition?.totalCollections || 10000,
        category: marketData.marketPosition?.category || 'Art',
        categoryRank: marketData.marketPosition?.categoryRank || 15,
        totalInCategory: marketData.marketPosition?.totalInCategory || 2500
      };
      setMarketPosition(position);
      
      // Process category ranking
      const category = {
        name: position.category,
        rank: position.categoryRank,
        total: position.totalInCategory,
        percentile: Math.round((1 - (position.categoryRank / position.totalInCategory)) * 100),
        trends: marketData.categoryTrends || [
          { period: '1d', change: 2.5 },
          { period: '7d', change: -1.2 },
          { period: '30d', change: 15.7 },
          { period: '90d', change: 42.3 }
        ]
      };
      setCategoryRanking(category);
      
      // Process market segmentation data
      const segments = marketData.marketSegmentation || [
        { name: 'Art', value: 35, totalVolume: '12,500 ETH', growth: 15 },
        { name: 'Collectibles', value: 25, totalVolume: '8,750 ETH', growth: 22 },
        { name: 'Gaming', value: 20, totalVolume: '7,000 ETH', growth: 45 },
        { name: 'Metaverse', value: 12, totalVolume: '4,200 ETH', growth: 30 },
        { name: 'Utility', value: 8, totalVolume: '2,800 ETH', growth: -5 }
      ];
      setMarketSegmentation(segments);
      
      // Process competitive analysis data
      const competitors = marketData.competitiveAnalysis || [
        { name: collectionData.name || 'This Collection', floorPrice: collectionData.floorPrice || 1.2, volume: collectionData.volume || 350, holders: collectionData.uniqueOwners || 1200, sentiment: collectionData.sentiment || 85 },
        { name: 'Competitor A', floorPrice: 1.8, volume: 420, holders: 980, sentiment: 78 },
        { name: 'Competitor B', floorPrice: 0.9, volume: 280, holders: 1500, sentiment: 92 },
        { name: 'Competitor C', floorPrice: 2.4, volume: 180, holders: 650, sentiment: 71 },
        { name: 'Competitor D', floorPrice: 1.1, volume: 390, holders: 1050, sentiment: 83 }
      ];
      setCompetitiveAnalysis(competitors);
      
      setLoading(false);
    }
  }, [marketData, collectionData]);
  
  // Format percentile to show as "top X%"
  const formatPercentile = (percentile) => {
    return `Top ${100 - percentile}%`;
  };
  
  // Get color based on percentile
  const getPercentileColor = (percentile) => {
    if (percentile >= 90) return 'text-green-500';
    if (percentile >= 70) return 'text-green-400';
    if (percentile >= 50) return 'text-yellow-500';
    if (percentile >= 30) return 'text-orange-500';
    return 'text-red-500';
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="text-gray-300 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="mt-1">
              {entry.name}: <span className="font-semibold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Format volume data for bar chart
  const formatVolumeData = () => {
    return competitiveAnalysis.map(item => ({
      name: item.name.length > 10 ? `${item.name.substring(0, 10)}...` : item.name,
      fullName: item.name,
      volume: item.volume
    }));
  };
  
  // Format sentiment data for radar chart
  const formatCompetitiveData = () => {
    const metrics = ['floorPrice', 'volume', 'holders', 'sentiment'];
    const metricNames = {
      floorPrice: 'Floor Price',
      volume: 'Volume',
      holders: 'Holders',
      sentiment: 'Sentiment'
    };
    
    // Normalize all values to 0-100 scale
    const maxValues = {
      floorPrice: Math.max(...competitiveAnalysis.map(item => item.floorPrice)),
      volume: Math.max(...competitiveAnalysis.map(item => item.volume)),
      holders: Math.max(...competitiveAnalysis.map(item => item.holders)),
      sentiment: 100
    };
    
    return competitiveAnalysis.map(item => {
      const result = { name: item.name };
      
      metrics.forEach(metric => {
        result[metricNames[metric]] = (item[metric] / maxValues[metric]) * 100;
      });
      
      return result;
    });
  };
  
  // Format category trends
  const formatTrend = (value) => {
    const formatted = value > 0 ? `+${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
    return (
      <span className={value >= 0 ? 'text-green-400' : 'text-red-400'}>
        {value >= 0 ? <FiTrendingUp className="inline mr-1" /> : <FiTrendingDown className="inline mr-1" />}
        {formatted}
      </span>
    );
  };
  
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg w-full h-80 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading market insights...</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 rounded-xl p-6 shadow-lg w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Market Insights</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedTab('position')}
            className={`px-3 py-1 text-sm rounded-full ${
              selectedTab === 'position' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Market Position
          </button>
          <button
            onClick={() => setSelectedTab('segmentation')}
            className={`px-3 py-1 text-sm rounded-full ${
              selectedTab === 'segmentation' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Segmentation
          </button>
          <button
            onClick={() => setSelectedTab('competitive')}
            className={`px-3 py-1 text-sm rounded-full ${
              selectedTab === 'competitive' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Competitors
          </button>
        </div>
      </div>
      
      {selectedTab === 'position' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Overall Market Position</p>
              <p className={`text-2xl font-bold ${getPercentileColor(marketPosition.percentile)}`}>
                {formatPercentile(marketPosition.percentile)}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Rank {marketPosition.volumeRank} of {marketPosition.totalCollections}
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Price Positioning</p>
              <p className={`text-2xl font-bold ${getPercentileColor(marketPosition.pricePercentile)}`}>
                {formatPercentile(marketPosition.pricePercentile)}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Based on floor price comparison
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Growth Rate</p>
              <p className={`text-2xl font-bold ${getPercentileColor(marketPosition.growthPercentile)}`}>
                {formatPercentile(marketPosition.growthPercentile)}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Based on 30-day volume change
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">{categoryRanking.name} Category</p>
              <p className={`text-2xl font-bold ${getPercentileColor(categoryRanking.percentile)}`}>
                Rank #{categoryRanking.rank}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Out of {categoryRanking.total} collections
              </p>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">{categoryRanking.name} Category Trends</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryRanking.trends.map((trend, index) => (
                <div key={index} className="bg-gray-900 rounded p-3">
                  <p className="text-gray-400 text-sm">{trend.period} Change</p>
                  <p className="text-xl font-bold mt-1">{formatTrend(trend.change)}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2 flex items-center">
              <FiTarget className="mr-2" /> Market Position Analysis
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              This collection is positioned in the {formatPercentile(marketPosition.percentile)} of all NFT collections, 
              with particular strength in growth rate ({formatPercentile(marketPosition.growthPercentile)}). 
              Within the {categoryRanking.name} category, it ranks #{categoryRanking.rank} out of {categoryRanking.total} collections.
            </p>
            <div className="mt-2 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
              <p className="text-blue-400 text-sm flex items-center">
                <FiInfo className="mr-2 flex-shrink-0" />
                Collections in the top quartile of their category typically see 3.5x more trading volume than average collections.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {selectedTab === 'segmentation' && (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center">
              <FiBarChart2 className="mr-2" /> Market Segmentation
            </h4>
            <p className="text-gray-400 text-sm mb-4">
              Breakdown of the NFT market by category showing relative market share and growth rates.
            </p>
            
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={marketSegmentation}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="value" name="Market Share (%)" fill="#3B82F6" />
                  <Bar dataKey="growth" name="Growth Rate (%)" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {marketSegmentation.map((segment, index) => (
                <div key={index} className="bg-gray-900 rounded p-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-white font-medium">{segment.name}</p>
                    <span className={segment.growth >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {segment.growth > 0 ? '+' : ''}{segment.growth}%
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{segment.value}% Market Share</p>
                  <p className="text-gray-400 text-xs">Volume: {segment.totalVolume}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-2">Market Implications</h4>
            <p className="text-gray-400 text-sm">
              The {categoryRanking.name} segment represents {marketSegmentation.find(s => s.name === categoryRanking.name)?.value || 0}% 
              of the total market with a {marketSegmentation.find(s => s.name === categoryRanking.name)?.growth || 0}% growth rate. 
              This collection's position within this segment gives it access to a substantial and growing market.
            </p>
            
            <div className="mt-4 p-3 bg-green-900/20 border border-green-800 rounded-lg">
              <p className="text-green-400 text-sm flex items-center">
                <FiInfo className="mr-2 flex-shrink-0" />
                Collections in high-growth segments like {
                  marketSegmentation.sort((a, b) => b.growth - a.growth)[0].name
                } (currently at {
                  marketSegmentation.sort((a, b) => b.growth - a.growth)[0].growth
                }% growth) often present good investment opportunities.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {selectedTab === 'competitive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Trading Volume Comparison</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={formatVolumeData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                    <YAxis tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      formatter={(value, name, props) => [`${value} ETH`, 'Volume']}
                      labelFormatter={(label, props) => props[0].payload.fullName}
                    />
                    <Bar 
                      dataKey="volume" 
                      fill="#3B82F6" 
                      name="Trading Volume (ETH)"
                      isAnimationActive={true}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Competitive Analysis</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={formatCompetitiveData()}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                    <Radar
                      name={collectionData.name || 'This Collection'}
                      dataKey="Sentiment"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Floor Price"
                      dataKey="Floor Price"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Volume"
                      dataKey="Volume"
                      stroke="#ffc658"
                      fill="#ffc658"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Holders"
                      dataKey="Holders"
                      stroke="#ff8042"
                      fill="#ff8042"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h4 className="text-white font-medium">Competitive Comparison</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-gray-300">Collection</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-300">Floor Price (ETH)</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-300">Volume (ETH)</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-300">Holders</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-300">Sentiment Score</th>
                  </tr>
                </thead>
                <tbody>
                  {competitiveAnalysis.map((competitor, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-gray-700 last:border-b-0 hover:bg-gray-750 ${
                        competitor.name === (collectionData.name || 'This Collection') ? 'bg-blue-900/30' : ''
                      }`}
                    >
                      <td className="p-3 text-white font-medium">{competitor.name}</td>
                      <td className="p-3 text-gray-300">{competitor.floorPrice.toFixed(2)}</td>
                      <td className="p-3 text-gray-300">{competitor.volume}</td>
                      <td className="p-3 text-gray-300">{competitor.holders.toLocaleString()}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                            <div 
                              className="h-2.5 rounded-full"
                              style={{ 
                                width: `${competitor.sentiment}%`,
                                backgroundColor: competitor.sentiment > 80 ? '#10B981' : 
                                                competitor.sentiment > 60 ? '#FBBF24' : 
                                                '#EF4444'
                              }}
                            ></div>
                          </div>
                          <span className="text-gray-300 text-sm">{competitor.sentiment}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <FiInfo className="mr-1" />
        <p>Market insights are updated daily based on blockchain analytics and market intelligence.</p>
      </div>
    </motion.div>
  );
};

export default MarketInsights;
