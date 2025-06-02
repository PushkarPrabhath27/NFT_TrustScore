import React, { useState, useEffect, Suspense, lazy, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useStore, 
  useDarkMode, 
  useStoreActions,
  useTrustScore,
  useRiskData,
  usePriceData,
  useAnalyticsData,
  useMarketInsights,
  useSocialMetrics,
  useMarketTrends,
  useContractActivity
} from '../../store/store';
import { FiInfo, FiAlertTriangle, FiCheckCircle, FiClock, FiBarChart2, FiTrendingUp, FiUsers } from 'react-icons/fi';
import AnalysisTabs from './analysis/AnalysisTabs';
import { TextField, Button, CircularProgress } from '@mui/material';

// Lazy load components for better performance
const TrustScoreGauge = lazy(() => import('./charts/TrustScoreGauge'));
const RiskAssessmentChart = lazy(() => import('./charts/RiskAssessmentChart'));
const PriceHistoryChart = lazy(() => import('./charts/PriceHistoryChart'));
const MarketTrendChart = lazy(() => import('./charts/MarketTrendChart'));
const TrendList = lazy(() => import('./charts/TrendList'));
const AnalyticsCard = lazy(() => import('./charts/AnalyticsCard'));
const RelationshipGraph = lazy(() => import('./charts/RelationshipGraph'));
const InteractiveTimeline = lazy(() => import('./charts/InteractiveTimeline'));
const PredictiveAnalytics = lazy(() => import('./charts/PredictiveAnalytics'));
const FraudDetectionVisual = lazy(() => import('./charts/FraudDetectionVisual'));
const ARVisualization = lazy(() => import('./charts/ARVisualization'));
const PortfolioTracker = lazy(() => import('./charts/PortfolioTracker'));
const RiskMetricCard = lazy(() => import('./cards/RiskMetricCard'));
const DataExplorerTable = lazy(() => import('./tables/DataExplorerTable'));
const MarketInsights = lazy(() => import('./analysis/MarketInsights'));

// Helper functions for risk colors (moved to top level before component)
const getRiskLabel = (value) => {
  if (value < 20) return 'Very Low';
  if (value < 40) return 'Low';
  if (value < 60) return 'Medium';
  if (value < 80) return 'High';
  return 'Very High';
};

const getRiskColor = (value) => {
  if (value < 20) return 'text-green-500';
  if (value < 40) return 'text-green-400';
  if (value < 60) return 'text-yellow-500';
  if (value < 80) return 'text-orange-500';
  return 'text-red-500';
};

const getRiskBgColor = (value) => {
  if (value < 20) return 'bg-green-500';
  if (value < 40) return 'bg-green-400';
  if (value < 60) return 'bg-yellow-500';
  if (value < 80) return 'bg-orange-500';
  return 'bg-red-500';
};

const getOverallRiskColor = (risk) => {
  switch (risk) {
    case 'Low': return 'text-green-500';
    case 'Medium': return 'text-yellow-500';
    case 'High': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

const Dashboard = ({ section = 'main' }) => {
  console.log('[Dashboard] Section Prop:', section);
  const darkMode = useDarkMode();
  
  // Animation variants for container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };
  
  // Use store hooks with built-in null safety
  const { error, animationsEnabled, lastUpdated } = useStore();
  const nftData = useStore(state => state.nftData);
  const { setNFTData, setLastUpdated, setError, setLoading: setStoreLoading } = useStoreActions();
  const trustScore = useTrustScore();
  const riskData = useRiskData();
  const priceData = usePriceData();
  const analyticsData = useAnalyticsData();
  const marketInsights = useMarketInsights();
  const socialMetrics = useSocialMetrics();
  const marketTrends = useMarketTrends();
  const contractActivity = useContractActivity();
  
  // Local state for additional data
  const [contractAddress, setContractAddress] = useState('');
  const [userId, setUserId] = useState('user123'); // Mock user ID
  const [timelineData, setTimelineData] = useState(null);
  const [predictiveData, setPredictiveData] = useState(null);
  const [fraudData, setFraudData] = useState(null);
  const [arData, setArData] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [marketInsightsData, setMarketInsightsData] = useState(null);
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [cleanupFunction, setCleanupFunction] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processedRiskData, setProcessedRiskData] = useState(null);
  
  // userId is already defined above

  // Process risk data for visualization using useMemo
  const processedRiskMetrics = useMemo(() => {
    if (!riskData) return null;
    return {
      metrics: [
        { name: 'Volatility', value: riskData.volatility || 0 },
        { name: 'Liquidity', value: riskData.liquidity || 0 },
        { name: 'Market Cap', value: riskData.marketCap || 0 },
        { name: 'Volume', value: riskData.volume || 0 },
        { name: 'Supply', value: riskData.supply || 0 }
      ],
      recommendations: riskData.recommendations || []
    };
  }, [riskData]);

  // Define fetchAdditionalData function to generate mock data
  const fetchAdditionalData = useCallback((address) => {
    console.log('[Dashboard] Fetching additional data for:', address);
    try {
      // Mock timeline data
      const mockTimelineData = Array(10).fill(0).map((_, i) => ({
        id: i,
        date: new Date(Date.now() - (9 - i) * 30 * 24 * 60 * 60 * 1000),
        event: `Event ${i}`,
        value: Math.random() * 10,
        type: ['mint', 'sale', 'transfer', 'listing'][Math.floor(Math.random() * 4)]
      }));
      setTimelineData(mockTimelineData);
      
      // Mock predictive data
      const mockPredictiveData = {
        predictions: Array(7).fill(0).map((_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
          predicted: 2 + Math.random() * 3,
          actual: i < 3 ? 2 + Math.random() * 3 : null
        })),
        confidence: 0.85,
        trend: 'upward'
      };
      setPredictiveData(mockPredictiveData);
      
      // Mock fraud detection data
      const mockFraudData = {
        riskScore: Math.random() * 100,
        anomalies: [
          { type: 'price', severity: Math.random() * 100, description: 'Unusual price movement' },
          { type: 'volume', severity: Math.random() * 100, description: 'Suspicious trading volume' },
          { type: 'wallet', severity: Math.random() * 100, description: 'New wallet interactions' }
        ],
        recommendations: [
          'Monitor trading patterns',
          'Verify contract source code',
          'Check creator credentials'
        ]
      };
      setFraudData(mockFraudData);
      
      // Mock market insights data
      const mockMarketInsightsData = {
        trends: [
          { name: 'Floor Price', data: Array(30).fill(0).map((_, i) => 0.5 + Math.sin(i / 5) * 0.2) },
          { name: 'Volume', data: Array(30).fill(0).map((_, i) => 20 + Math.random() * 15) }
        ],
        comparisons: [
          { name: 'Similar NFT 1', price: 0.8, change: 2.5 },
          { name: 'Similar NFT 2', price: 1.2, change: -1.8 },
          { name: 'Similar NFT 3', price: 0.6, change: 0.7 }
        ],
        marketMetrics: [
          { name: 'Floor Price', value: 0.5, change: 3.2 },
          { name: '24h Volume', value: 45.8, change: 12.5 },
          { name: 'Market Cap', value: 1250000, change: 5.7 },
          { name: 'Holders', value: 3500, change: 2.1 }
        ]
      };
      setMarketInsightsData(mockMarketInsightsData);
      
      // Mock AR data
      const mockArData = {
        modelUrl: null,
        previewImageUrl: null,
        hasArModel: false,
        modelType: 'placeholder',
        dimensions: { width: 500, height: 500, depth: 500 }
      };
      setArData(mockArData);
      
      // Mock portfolio data
      const mockPortfolioData = {
        holdings: [
          { id: 1, name: 'NFT 1', value: 0.5, change: 5.2 },
          { id: 2, name: 'NFT 2', value: 1.2, change: -2.3 },
          { id: 3, name: 'NFT 3', value: 0.8, change: 1.7 }
        ],
        totalValue: 2.5,
        totalChange: 1.8,
        history: Array(30).fill(0).map((_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
          value: 2 + Math.sin(i / 4) * 0.5
        }))
      };
      setPortfolioData(mockPortfolioData);
      
      console.log('[Dashboard] Mock data generated successfully');
    } catch (error) {
      console.error('[Dashboard] Error generating mock data:', error);
      setError('Failed to generate visualization data');
    }
  }, [setError]);
  
  // Process analytics data for cards
  const analyticsMetrics = useMemo(() => {
    if (!marketTrends || !contractActivity) return [];
    return [
      {
        title: '24h Volume',
        value: marketTrends.volume24h || 0,
        change: marketTrends.volumeChange24h,
        format: 'currency'
      },
      {
        title: 'Floor Price',
        value: marketTrends.floorPrice || 0,
        change: marketTrends.floorPriceChange24h,
        format: 'number'
      },
      {
        title: 'Holders',
        value: contractActivity.uniqueHolders || 0,
        change: contractActivity.holdersChange24h,
        format: 'number'
      },
      {
        title: 'Market Cap',
        value: marketTrends.marketCap || 0,
        change: marketTrends.marketCapChange24h,
        format: 'currency'
      }
    ];
  }, [marketTrends, contractActivity]);

  // Configure explorer table columns
  const explorerColumns = [
    { key: 'timestamp', label: 'Time', type: 'date' },
    { key: 'type', label: 'Type', type: 'text' },
    { key: 'price', label: 'Price', type: 'currency' },
    { key: 'from', label: 'From', type: 'text' },
    { key: 'to', label: 'To', type: 'text' },
    { key: 'tokenId', label: 'Token ID', type: 'number' }
  ];
  
  // Get store actions at top level
  const storeActions = useStoreActions();
  const { updateData, validateTrustScore } = storeActions;

  console.log('[Dashboard] Store Data:', { 
    nftData, 
    riskData, 
    priceData, 
    trustScore, 
    analyticsData,
    marketInsights,
    socialMetrics 
  });

  // These variables are already defined above

  // Define pulse animation for cards
  const pulseAnimation = animationsEnabled ? {
    boxShadow: ['0 0 10px rgba(49, 130, 206, 0.3)', '0 0 20px rgba(49, 130, 206, 0.5)', '0 0 10px rgba(49, 130, 206, 0.3)'],
    transition: { duration: 2, repeat: Infinity }
  } : {};

  // Automatically fetch data when component mounts
  useEffect(() => {
    const fetchNFTData = async () => {
      setAnalysisInProgress(true);
      setIsLoading(true);
      setError(null);
      
      try {
        // Make sure to validate trust score on component mount
        validateTrustScore();
        
        // Use HTTP-based polling approach instead of WebSockets
        console.log('[Dashboard] Setting up HTTP polling connection');
        
        // Initialize connection
        const connectResponse = await fetch('http://localhost:3001/api/ws-connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!connectResponse.ok) {
          throw new Error(`Failed to connect: ${connectResponse.status}`);
        }
        
        const connectData = await connectResponse.json();
        const sessionId = connectData.sessionId;
        console.log(`[Dashboard] Connection established with session ID: ${sessionId}`);
        setWsConnected(true);
        
        // Set up polling interval
        const pollInterval = setInterval(async () => {
          try {
            const pollResponse = await fetch(`http://localhost:3001/api/ws-poll/${sessionId}`);
            if (!pollResponse.ok) {
              console.error(`[Dashboard] Polling error: ${pollResponse.status}`);
              return;
            }
            
            const pollData = await pollResponse.json();
            
            // Process any messages
            if (pollData.messages && pollData.messages.length > 0) {
              pollData.messages.forEach(message => {
                console.log('[Dashboard] Received message:', message);
                
                if (message.type === 'analysis_result') {
                  if (message.data) {
                    setNFTData(message.data);
                    setLastUpdated(message.data.lastUpdated);
                    setIsLoading(false);
                    
                    // Fetch additional data for new components
                    fetchAdditionalData(message.data.contractAddress);
                  }
                }
              });
            }
          } catch (error) {
            console.error('[Dashboard] Polling error:', error);
          }
        }, 1000); // Poll every second
        
        // Send section info if needed
        if (section !== 'main') {
          await fetch('http://localhost:3001/api/ws-send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sessionId,
              message: { type: 'section', section }
            })
          });
        }
        
        // Return cleanup function
        return () => {
          clearInterval(pollInterval);
          
          // Close the connection
          fetch('http://localhost:3001/api/ws-close', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
          }).catch(error => {
            console.error('[Dashboard] Error closing connection:', error);
          });
        };
      } catch (error) {
        console.error('[Dashboard] Error setting up connection:', error);
        setError('Error setting up connection. Attempting HTTP fallback.');
        fallbackToHttpRequest();
      }
    };
    
    // HTTP fallback function for when WebSocket connection fails
    const fallbackToHttpRequest = async () => {
      try {
        console.log('[Dashboard] Falling back to HTTP request');
        setIsLoading(true);
        
        const response = await fetch('http://127.0.0.1:3001/api/nft-data');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('[Dashboard] Received HTTP data:', data);
        
        updateData({
          trustScore: data.trustScore,
          nftData: data,
          riskData: data.riskData,
          priceData: data.priceData || null,
          analyticsData: data.analytics,
          lastUpdated: new Date().toISOString()
        });
        setError(null);
        
        // Generate mock data for additional visualizations
        try {
          // Mock timeline data
          const mockTimelineData = [
            { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), event: 'Contract Created', value: 0, type: 'creation' },
            { date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), event: 'First Sale', value: 1.2, type: 'sale' },
            { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), event: 'Floor Price Change', value: 1.5, type: 'price' },
            { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), event: 'Volume Spike', value: 3.7, type: 'volume' },
            { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), event: 'Whale Purchase', value: 4.1, type: 'purchase' },
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), event: 'Collection Trend', value: 4.8, type: 'trend' },
            { date: new Date(), event: 'Current Activity', value: 5.2, type: 'current' }
          ];
          setTimelineData(mockTimelineData);
          
          // Mock predictive analytics data
        const mockPredictiveData = {
          pricePrediction: {
            current: 2.5,
            oneDay: 2.7,
            oneWeek: 3.1,
            oneMonth: 3.8,
            confidence: 0.75
          },
          volumePrediction: {
            current: 45,
            oneDay: 50,
            oneWeek: 65,
            oneMonth: 80,
            confidence: 0.68
          },
          trendIndicators: [
            { name: 'Market Sentiment', impact: 0.8, direction: 'positive' },
            { name: 'Whale Activity', impact: 0.6, direction: 'positive' },
            { name: 'Social Media Buzz', impact: 0.9, direction: 'positive' },
            { name: 'Similar NFTs Performance', impact: 0.5, direction: 'neutral' },
            { name: 'Creator Reputation', impact: 0.7, direction: 'positive' }
          ]
        };
        setPredictiveData(mockPredictiveData);

        // Mock fraud detection data
        const mockFraudData = {
          riskScore: Math.floor(Math.random() * 100),
          indicators: [
            { name: 'Wash Trading', value: Math.floor(Math.random() * 100), threshold: 70 },
            { name: 'Price Manipulation', value: Math.floor(Math.random() * 100), threshold: 65 },
            { name: 'Fake Volume', value: Math.floor(Math.random() * 100), threshold: 75 },
            { name: 'Suspicious Transfers', value: Math.floor(Math.random() * 100), threshold: 80 }
          ],
          recentAlerts: [
            { type: 'warning', message: 'Unusual trading pattern detected', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
            { type: 'info', message: 'Price volatility above market average', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
            { type: 'critical', message: 'Potential wash trading activity', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
          ]
        };
        setFraudData(mockFraudData);

        // Mock market insights data
        const mockMarketInsightsData = {
          volatility: 'medium',
          trend: 'stable',
          liquidity: 'medium',
          sentiment: 'positive',
          comparableCollections: [
            { name: 'Similar Collection 1', price: '0.45', change: '+5.2%' },
            { name: 'Similar Collection 2', price: '0.62', change: '-2.1%' },
            { name: 'Similar Collection 3', price: '0.38', change: '+1.8%' }
          ],
          marketMetrics: [
            { name: 'Floor Price', value: data.floorPrice || 0.5, change: 3.2 },
            { name: '24h Volume', value: data.volume24h || 45.8, change: 12.5 },
            { name: 'Market Cap', value: data.marketCap || 1250000, change: 5.7 },
            { name: 'Holders', value: data.holders || 3500, change: 2.1 }
          ]
        };
        setMarketInsightsData(mockMarketInsightsData);
          // Process risk data for visualization
          const processedRisk = data.riskData ? {
            overall: data.riskData.overallRisk || 50,
            metrics: [
              { name: 'Smart Contract', value: data.riskData.contractRisk || 0, description: 'Smart contract security assessment' },
              { name: 'Market Volatility', value: data.riskData.marketRisk || 0, description: 'Price stability and market conditions' },
              { name: 'Liquidity', value: data.riskData.liquidityRisk || 0, description: 'Trading volume and liquidity assessment' },
              { name: 'Creator History', value: data.riskData.creatorRisk || 0, description: 'Creator reputation and history' },
              { name: 'Ownership', value: data.riskData.ownershipRisk || 0, description: 'Ownership concentration risk' }
            ]
          } : null;
          setProcessedRiskData(processedRisk);
          
          // Mock AR data
          const mockArData = {
            modelUrl: null, // In a real app, this would be a URL to a 3D model
            previewImageUrl: null, // In a real app, this would be a URL to a preview image
            hasArModel: false,
            modelType: 'placeholder',
            dimensions: { width: 500, height: 500, depth: 500 }
          };
          setArData(mockArData);
          
          // Mock portfolio data
          const mockPortfolioData = {
            holdings: [
              { id: 1, name: 'NFT 1', value: 0.5, change: 5.2 },
              { id: 2, name: 'NFT 2', value: 1.2, change: -2.3 },
              { id: 3, name: 'NFT 3', value: 0.8, change: 1.7 }
            ],
            totalValue: 2.5,
            totalChange: 1.8,
            history: Array(30).fill(0).map((_, i) => ({
              date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
              value: 2 + Math.sin(i / 4) * 0.5
            }))
          };
          setPortfolioData(mockPortfolioData);
          
          console.log('[Dashboard] Mock data generated successfully');
        } catch (mockError) {
          console.error('[Dashboard] Error generating mock data:', mockError);
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching data via HTTP:', error);
        setError('Failed to connect to the backend server via HTTP.');
      } finally {
        setAnalysisInProgress(false);
        setIsLoading(false);
      }
    };
    
    // Call fetchNFTData on component mount
    fetchNFTData();
    // Return cleanup function
    return typeof cleanupFunction === 'function' ? cleanupFunction : () => {};
  }, [contractAddress, fetchAdditionalData, updateData, setError]);
  
  // Define renderMainDashboard function
  const renderMainDashboard = () => {
    if (!nftData) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400">No NFT data available. Please enter a contract address to analyze.</p>
        </div>
      );
    }
    
    return (
      <>
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trust Score */}
          <motion.div 
            className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900/60' : 'bg-white'} backdrop-blur-lg border border-neon-purple/30 shadow-neon-glow`}
            animate={pulseAnimation}
          >
            <h2 className="text-xl font-orbitron font-bold mb-4 text-neon-purple">Trust Score</h2>
            <div className="h-64">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Trust Score...</div>}>
                <TrustScoreGauge />
              </Suspense>
            </div>
          </motion.div>

          {/* Risk Assessment */}
          <motion.div 
            className={`p-6 rounded-xl ${darkMode ? 'bg-gray-900/60' : 'bg-white'} backdrop-blur-lg border border-neon-pink/30 shadow-neon-glow`}
            animate={pulseAnimation}
          >
            <h2 className="text-xl font-orbitron font-bold mb-4 text-neon-pink">Risk Assessment</h2>
            <div className="h-64">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Risk Assessment...</div>}>
                <RiskAssessmentChart data={processedRiskData?.metrics || processedRiskMetrics?.metrics || []} />
              </Suspense>
            </div>
          </motion.div>
        </div>
        
        {/* Interactive Timeline - Full Width */}
        {timelineData && (
          <motion.div 
            variants={itemVariants} 
            className="mt-8 p-6 rounded-xl bg-gray-900/60 backdrop-blur-lg border border-blue-400/30 shadow-neon-glow"
            animate={pulseAnimation}
          >
            <h2 className="text-xl font-orbitron font-bold mb-4 text-blue-400">NFT Value Timeline</h2>
            <div className="h-80">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Timeline Data...</div>}>
                <InteractiveTimeline data={timelineData} />
              </Suspense>
            </div>
          </motion.div>
        )}
        
        {/* Predictive Analytics */}
        {predictiveData && (
          <motion.div 
            variants={itemVariants} 
            className="mt-8 p-6 rounded-xl bg-gray-900/60 backdrop-blur-lg border border-green-400/30 shadow-neon-glow"
            animate={pulseAnimation}
          >
            <h2 className="text-xl font-orbitron font-bold mb-4 text-green-400">Price Predictions</h2>
            <div className="h-80">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Predictions...</div>}>
                <PredictiveAnalytics data={predictiveData || {}} />
              </Suspense>
            </div>
          </motion.div>
        )}
        {/* Fraud Detection */}
        {fraudData && (
          <motion.div 
            variants={itemVariants} 
            className="mt-8 p-6 rounded-xl bg-gray-900/60 backdrop-blur-lg border border-red-400/30 shadow-neon-glow"
            animate={pulseAnimation}
          >
            <h2 className="text-xl font-orbitron font-bold mb-4 text-red-400">Fraud Analysis</h2>
            <div className="h-80">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Fraud Detection...</div>}>
                <FraudDetectionVisual data={fraudData || {}} />
              </Suspense>
            </div>
          </motion.div>
        )}
        
        {/* Market Insights */}
        {marketInsightsData && (
          <motion.div 
            variants={itemVariants} 
            className="mt-8 p-6 rounded-xl bg-gray-900/60 backdrop-blur-lg border border-yellow-400/30 shadow-neon-glow"
            animate={pulseAnimation}
          >
            <h2 className="text-xl font-orbitron font-bold mb-4 text-yellow-400">Market Insights</h2>
            <div className="h-80">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Market Insights...</div>}>
                <MarketInsights data={marketInsightsData || {}} />
              </Suspense>
            </div>
          </motion.div>
        )}
        {/* Portfolio Tracker */}
        {portfolioData && (
          <motion.div 
            variants={itemVariants} 
            className="mt-8 p-6 rounded-xl bg-gray-900/60 backdrop-blur-lg border border-purple-400/30 shadow-neon-glow"
            animate={pulseAnimation}
          >
            <h2 className="text-xl font-orbitron font-bold mb-4 text-purple-400">Portfolio Tracker</h2>
            <div className="h-80">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Portfolio Data...</div>}>
                <PortfolioTracker 
                  userId={userId} 
                  portfolioData={portfolioData} 
                  contractAddress={contractAddress} 
                />
              </Suspense>
            </div>
          </motion.div>
        )}

        {/* AR Visualization */}
        {arData && (
          <motion.div 
            variants={itemVariants} 
            className="mt-8 p-6 rounded-xl bg-gray-900/60 backdrop-blur-lg border border-cyan-400/30 shadow-neon-glow"
            animate={pulseAnimation}
          >
            <h2 className="text-xl font-orbitron font-bold mb-4 text-cyan-400">AR Visualization</h2>
            <div className="h-80">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading AR Data...</div>}>
                <ARVisualization data={arData || {}} />
              </Suspense>
            </div>
          </motion.div>
        )}

        {/* Last Updated */}
        <AnimatePresence>
          {lastUpdated && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-right text-sm text-gray-400 font-rajdhani"
            >
              Last updated: {new Date(lastUpdated).toLocaleString()}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };
  
  // Define renderAnalytics, renderRisk, renderExplorer, renderHistory, and renderMarketInsights functions
  const renderAnalytics = () => (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Analytics</h2>
      <p>Analytics section coming soon...</p>
    </div>
  );
  
  const renderRisk = () => (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Risk Assessment</h2>
      <p>Risk assessment section coming soon...</p>
    </div>
  );
  
  const renderExplorer = () => (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Explorer</h2>
      <p>Explorer section coming soon...</p>
    </div>
  );
  
  const renderHistory = () => (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">History</h2>
      <p>History section coming soon...</p>
    </div>
  );
  
  const renderMarketInsights = () => (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Market Insights</h2>
      <p>Market insights section coming soon...</p>
    </div>
  );
  
  // Main return for Dashboard component
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full p-6 ${darkMode ? 'bg-gray-950/40 text-white' : 'bg-gray-50/40 text-gray-900'} backdrop-blur-sm rounded-xl shadow-lg font-rajdhani max-w-7xl mx-auto`}
    >
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg"
            >
              <p className="text-red-500">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {analysisInProgress && !nftData && (
          <motion.div 
            className="flex flex-col items-center justify-center py-12"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <p className="text-xl font-rajdhani text-gray-400">
              Loading NFT data...
            </p>
          </motion.div>
        )}

        {/* Render the appropriate dashboard section */}
        {section === 'main' && renderMainDashboard()}
        {section === 'analytics' && renderAnalytics()}
        {section === 'risk' && renderRisk()}
        {section === 'explorer' && renderExplorer()}
        {section === 'history' && renderHistory()}
        {section === 'market-insights' && renderMarketInsights()}
      </Suspense>
    </motion.div>
  );
};

export default Dashboard;
