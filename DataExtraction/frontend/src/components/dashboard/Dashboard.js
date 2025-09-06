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
import DataFlowTest from '../DataFlowTest';
import MockDataTest from '../MockDataTest';
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
  const [inputAddress, setInputAddress] = useState('');
  const [userId, setUserId] = useState('user123'); // Mock user ID
  const [timelineData, setTimelineData] = useState(null);
  const [predictiveData, setPredictiveData] = useState(null);
  const [fraudData, setFraudData] = useState(null);
  const [arData, setArData] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [marketInsightsData, setMarketInsightsData] = useState(null);
  const [analysisInProgress, setAnalysisInProgress] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const socketRef = useRef(null);
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

  useEffect(() => {
    if (!contractAddress) return;

    console.log('[Dashboard] Loading data for contract:', contractAddress);
    
    // First, check if we have cached data in localStorage
    const cachedData = localStorage.getItem(`nftAnalysis_${contractAddress}`);
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        console.log('[Dashboard] Found cached data:', {
          success: parsedData?.success,
          hasData: !!parsedData?.data,
          dataKeys: parsedData?.data ? Object.keys(parsedData.data) : []
        });
        
        if (parsedData?.success && parsedData?.data) {
          console.log('[Dashboard] Using cached data, setting NFT data...');
          setNFTData(parsedData.data);
          setIsLoading(false);
          setAnalysisInProgress(false);
          return; // Don't start WebSocket if we have cached data
        }
      } catch (error) {
        console.error('[Dashboard] Error parsing cached data:', error);
      }
    }

    setAnalysisInProgress(true);
    setIsLoading(true);
    setError(null);

    const socket = new WebSocket('ws://localhost:3004/ws');
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[Frontend] WebSocket connected');
      setWsConnected(true);
      socket.send(JSON.stringify({ type: 'analyze', contractAddress }));
    };

    socket.onmessage = (event) => {
      console.log('[Frontend] Raw WebSocket message received:', event.data);
      
      try {
        const message = JSON.parse(event.data);
        console.log('[Frontend] Parsed WebSocket message:', message);

        if (message.type === 'analysis' || message.type === 'update') {
          console.log('[Frontend] Updating state with received data:', message.data.data);
          setNFTData(message.data.data);
          setLastUpdated(message.data.data.lastUpdated);
          setIsLoading(false);
        } else {
          console.warn('[Frontend] Received unhandled message type:', message.type);
        }
      } catch (error) {
        console.error('[Frontend] Error parsing WebSocket message JSON:', error);
      }
    };

    socket.onerror = (e) => {
      console.error('WebSocket error', e);
      setError('WebSocket connection error. Please ensure the server is running.');
      setIsLoading(false);
    };

    socket.onclose = () => {
      console.warn('WebSocket closed');
      setWsConnected(false);
      setAnalysisInProgress(false);
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [contractAddress, setNFTData, setLastUpdated, setError]);

  const handleSearch = () => {
    if (!inputAddress.trim()) {
      setError('Please enter a contract address.');
      return;
    }
    setContractAddress(inputAddress.trim());
  };
  
  const renderHeader = () => (
    <div className="mb-6 flex items-center space-x-4 p-4 rounded-lg bg-gray-800/50">
      <TextField
        label="Contract Address"
        variant="outlined"
        fullWidth
        value={inputAddress}
        onChange={(e) => setInputAddress(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
        placeholder="Enter NFT contract address..."
        sx={{
            '& .MuiOutlinedInput-root': {
                '& fieldset': {
                    borderColor: 'rgba(147, 51, 234, 0.5)',
                },
                '&:hover fieldset': {
                    borderColor: 'rgba(147, 51, 234, 1)',
                },
            },
            '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
            },
            'input': {
                color: 'white',
            }
        }}
      />
      <Button
        variant="contained"
        onClick={handleSearch}
        disabled={analysisInProgress}
        sx={{ 
            backgroundColor: '#9333ea', 
            '&:hover': { backgroundColor: '#7e22ce' },
            height: '56px',
            px: 4
        }}
      >
        {analysisInProgress ? <CircularProgress size={24} color="inherit" /> : 'Analyze'}
      </Button>
    </div>
  );

  // Define renderMainDashboard function
  const renderMainDashboard = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <CircularProgress />
          <p className="ml-4 text-gray-400">Analyzing... Please wait.</p>
        </div>
      );
    }

    if (!nftData) {
      return (
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-400">Enter a contract address above to begin analysis.</p>
        </div>
      );
    }
    
    return (
      <>
        {/* Analysis Tabs - Show detailed analysis data */}
        <motion.div 
          className="mt-8 p-6 rounded-xl bg-gray-900/60 backdrop-blur-lg border border-cyan-400/30 shadow-neon-glow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-orbitron font-bold mb-4 text-cyan-400">Detailed Analysis</h2>
          <AnalysisTabs data={nftData} />
        </motion.div>

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
            <p className="text-sm text-gray-500 mt-2">
              Contract: {contractAddress}
            </p>
          </motion.div>
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div 
            className="mb-4 p-4 bg-blue-900/30 border border-blue-500/50 rounded-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-blue-400 font-bold mb-2">Debug Information</h3>
            <div className="text-sm text-blue-200 space-y-1">
              <p>Contract Address: {contractAddress}</p>
              <p>Has NFT Data: {nftData ? 'Yes' : 'No'}</p>
              <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
              <p>Analysis In Progress: {analysisInProgress ? 'Yes' : 'No'}</p>
              <p>WebSocket Connected: {wsConnected ? 'Yes' : 'No'}</p>
              {nftData && (
                <p>Data Keys: {Object.keys(nftData).join(', ')}</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Data Flow Test Component */}
        <DataFlowTest data={nftData} title="Dashboard NFT Data" />
        
        {/* Mock Data Test Component */}
        <MockDataTest />

        {renderHeader()}

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
