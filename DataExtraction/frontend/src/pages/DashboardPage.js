import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCopy, FiRefreshCw, FiHome, FiInfo, FiAlertTriangle, FiCheckCircle, FiWifi, FiWifiOff } from 'react-icons/fi';
import apiService from '../services/api';
import Dashboard from '../components/dashboard/Dashboard';
import { useStoreActions } from '../store/store';
import { Box, Typography, Paper, CircularProgress, Chip, Grid, Tooltip, IconButton, Button, Fade, AppBar, Toolbar, Link as MuiLink } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import AnalysisTabs from '../components/dashboard/analysis/AnalysisTabs';

const DashboardPage = () => {
  const { contractAddress } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Store actions for global state management
  const { updateData, setError: setStoreError } = useStoreActions();
  
  // Refs for polling connection and cleanup
  const connectionRef = useRef(null);
  const [pollingConnected, setPollingConnected] = useState(false);

  // Updates global store with response data
  const processApiData = useCallback((responseData) => {
    if (!responseData || !responseData.data) {
      throw new Error('Invalid response data format');
    }
    
    const { data } = responseData;
    console.log('[DashboardPage] Processing API data:', data);
    
    // Basic NFT data
    const nftData = {
      name: data.name || 'Unknown',
      collection: data.name || 'Unknown',
      tokenId: data.tokenId || 'N/A',
      blockchain: data.blockchain || 'Ethereum',
      creator: data.owner || 'Unknown',
      isVerified: data.isVerified || false,
      standard: data.standard || 'ERC-721',
      description: data.description || `A collection of ${data.totalSupply || 10000} NFTs with symbol ${data.symbol || 'NFT'}`,
      image: data.image || '/placeholder-nft.jpg'
    };
    
    // Trust score data
    const trustScoreData = {
      score: Math.floor((data.analysis.security + data.analysis.activity + 
               data.analysis.community + data.analysis.liquidity) / 4),
      factors: [
        { name: 'Security', impact: data.analysis.security - 50 },
        { name: 'Activity', impact: data.analysis.activity - 50 },
        { name: 'Community', impact: data.analysis.community - 50 },
        { name: 'Liquidity', impact: data.analysis.liquidity - 50 }
      ],
      recommendation: data.recommendation || 'This collection has a good trust score. Consider monitoring for any changes in activity or liquidity.'
    };
    
    // Price data
    const priceData = {
      currentPrice: data.currentPrice || '0.5',
      priceChange24h: data.priceChange24h || '-8.00',
      volume24h: data.volume24h || 1302,
      currency: data.currency || 'ETH',
      history: data.priceHistory || Array(30).fill(0).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: (0.5 + Math.sin(i / 4) * 0.2).toFixed(4)
      })),
      floorPrice: data.priceData?.currentPrice || '0.5',
      marketCap: data.marketCap || '5000000',
      totalVolume: data.totalVolume || '2500000'
    };
    
    // Risk data
    const riskData = {
      contractSecurity: data.analysis.security || 72,
      marketVolatility: data.analysis.liquidity || 60,
      ownershipConcentration: data.analysis.security || 72,
      tradingActivity: data.analysis.activity || 62,
      overallRisk: Math.floor((data.analysis.security + data.analysis.liquidity + data.analysis.activity) / 3) || 66
    };
    
    // Analytics data for charts
    const analyticsData = {
      volume: data.volumeData || Array(30).fill(0).map((_, i) => ({ date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], volume: Math.floor(Math.random() * 500) + 100 })),
      holders: data.holdersData || Array(30).fill(0).map((_, i) => ({ date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], holders: Math.floor(Math.random() * 100) + 500 + i * 3 })),
      transactions: data.transactionData || Array(30).fill(0).map((_, i) => ({ date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], count: Math.floor(Math.random() * 50) + 10 })),
    };
    
    // Market insights
    const marketInsights = {
      volatility: data.volatility || 'medium',
      trend: data.trend || 'stable',
      liquidity: data.liquidity || 'medium',
      sentiment: data.sentiment || 'positive',
      comparableCollections: data.comparableCollections || [
        { name: 'Similar Collection 1', price: '0.45', change: '+5.2%' },
        { name: 'Similar Collection 2', price: '0.62', change: '-2.1%' },
        { name: 'Similar Collection 3', price: '0.38', change: '+1.8%' }
      ]
    };
    
    // Social metrics
    const socialMetrics = {
      twitterFollowers: data.twitterFollowers || 12500,
      discordMembers: data.discordMembers || 8700,
      sentimentScore: data.sentimentScore || 72,
      communityGrowth: data.communityGrowth || '+8.5%',
      engagement: data.engagement || 'high'
    };
    
    // Market trends
    const marketTrends = {
      direction: data.trendDirection || 'up',
      strength: data.trendStrength || 'moderate',
      support: data.supportLevel || '0.42',
      resistance: data.resistanceLevel || '0.58',
      prediction: data.prediction || 'The collection is expected to maintain steady growth over the next 30 days.'
    };
    
    // Contract activity
    const contractActivity = {
      recentTransactions: data.recentTransactions || [],
      transactionVolume: data.txVolume || 1250,
      uniqueHolders: data.uniqueHolders || 754,
      averageHoldingTime: data.avgHoldTime || '45 days'
    };
    
    // Update all the store data
    updateData({
      nftData,
      trustScore: trustScoreData,
      riskData,
      priceData,
      analyticsData,
      marketInsights,
      socialMetrics,
      marketTrends,
      contractActivity
    });
    
    // Return formatted data for component props
    return {
      nftData,
      trustScoreData,
      priceData,
      riskData,
      collectionData: {
        name: data.name || 'Unknown Collection',
        image: '/images/collections/3.jpg',
        creator: data.owner || 'Unknown Creator',
        createdAt: data.createdAt || new Date().toISOString(),
        totalItems: data.totalSupply || 5302,
        totalOwners: data.totalOwners || 3200,
        floorPrice: priceData.floorPrice,
        volume: priceData.totalVolume
      },
      fraudIndicators: {
        suspiciousActivity: data.analysis.security < 50,
        priceManipulation: data.analysis.liquidity < 50,
        fakeVolume: data.analysis.activity < 50,
        contractRisks: data.analysis.security < 40,
        communityWarnings: data.analysis.community < 50
      },
      
      // Recent transactions
      recentTransactions: data.recentTransactions || []
    };
  }, []);

  const fetchData = useCallback(async (force = false) => {
    setLoading(!force);
    setRefreshing(force);
    setError('');
    setStoreError(''); // Clear any store error
    const key = `nftAnalysis_${contractAddress}`;
    console.log('[DashboardPage] Fetching data for contract:', contractAddress);
    
    // Use cached data if available and not forcing refresh
    if (!force) {
      const cached = localStorage.getItem(key);
      if (cached) {
        console.log('[DashboardPage] Using cached data');
        try {
          const parsedData = JSON.parse(cached);
          processApiData(parsedData);
          setData(parsedData);
          setLoading(false);
          return;
        } catch (err) {
          console.warn('[DashboardPage] Error parsing cached data:', err);
          // Continue to fetch fresh data if cache parsing fails
        }
      }
    }
    
    try {
      console.log('[DashboardPage] Making API request using apiService');
      const response = await apiService.fetchNFTData(contractAddress);
      console.log('[DashboardPage] Received data:', response);
      
      // Check if the response has the expected structure
      if (!response.success || !response.data) {
        throw new Error('Invalid response format from API');
      }
      
      // Process the API response and update the store
      processApiData(response);
      
      // Update timestamps
      setLastUpdated(new Date());
      localStorage.setItem(key, JSON.stringify(response));
      setData(response);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('[DashboardPage] Error fetching data:', error);
      setError(error.message || 'Failed to fetch NFT analysis');
      setStoreError(error.message || 'Failed to fetch NFT analysis');
      setLoading(false);
      setRefreshing(false);
    }
  }, [contractAddress, processApiData, setStoreError]);

  // Set up polling connection for real-time updates
  useEffect(() => {
    let intervalId = null;
    if (contractAddress) {
      // Initial data fetch
      fetchData();
      // Set up polling connection for real-time updates
      console.log('[DashboardPage] Setting up polling connection for', contractAddress);
      const pollData = async () => {
        try {
          if (loading || refreshing) {
            console.log('[DashboardPage] Skipping poll while loading/refreshing');
            return;
          }
          const response = await apiService.fetchNFTData(contractAddress);
          console.log('[DashboardPage] Received polling data:', response);
          if (response && response.success && response.data) {
            processApiData(response);
            setData(response);
            setLastUpdated(new Date());
            const key = `nftAnalysis_${contractAddress}`;
            localStorage.setItem(key, JSON.stringify(response));
          }
        } catch (error) {
          console.error('[DashboardPage] Error polling data:', error);
        }
      };
      if (!intervalId) {
        intervalId = setInterval(pollData, 10000);
        console.log('[DashboardPage] Created polling interval:', intervalId);
      }
      // Clean up the polling connection when the component unmounts or contractAddress changes
      return () => {
        if (intervalId) {
          console.log('[DashboardPage] Cleaning up polling connection:', intervalId);
          clearInterval(intervalId);
          intervalId = null;
        }
      };
    } else {
      setError('No contract address provided');
      setLoading(false);
      // Always return a cleanup function to avoid runtime errors
      return () => {};
    }
  }, [contractAddress, fetchData, loading, refreshing]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };
  
  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Analyzing NFT data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full">
            <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
          </div>
          <h2 className="mb-4 text-xl font-bold text-center text-gray-800 dark:text-gray-100">Error</h2>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={handleGoHome}
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiHome className="inline-block mr-2" />
              Go Home
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 ml-4 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <FiRefreshCw className="inline-block mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <FiInfo className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
          </div>
          <h2 className="mb-4 text-xl font-bold text-center text-gray-800 dark:text-gray-100">No Data Available</h2>
          <p className="mb-6 text-center text-gray-600 dark:text-gray-300">We couldn't find any data for this NFT.</p>
          <div className="flex justify-center">
            <button
              onClick={handleGoHome}
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FiHome className="inline-block mr-2" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Analyzing NFT data...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full">
              <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-300" />
            </div>
            <h2 className="mb-4 text-xl font-bold text-center text-gray-800 dark:text-gray-100">Error</h2>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-300">{error}</p>
            <div className="flex justify-center">
              <button
                onClick={handleGoHome}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FiHome className="inline-block mr-2" />
                Go Home
              </button>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 ml-4 text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <FiRefreshCw className="inline-block mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : !data ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <FiInfo className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
            </div>
            <h2 className="mb-4 text-xl font-bold text-center text-gray-800 dark:text-gray-100">No Data Available</h2>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-300">We couldn't find any data for this NFT.</p>
            <div className="flex justify-center">
              <button
                onClick={handleGoHome}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FiHome className="inline-block mr-2" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto">
          {/* Header with contract address and actions */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="flex flex-col mb-4 md:mb-0">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-2">NFT Analysis</h1>
              <div className="flex items-center">
                <span className="text-sm font-mono text-gray-600 dark:text-gray-300 truncate max-w-[150px] md:max-w-xs">
                  {contractAddress}
                </span>
                <button 
                  onClick={handleCopyAddress}
                  className="ml-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 focus:outline-none"
                  aria-label="Copy contract address"
                >
                  {copySuccess ? 
                    <FiCheckCircle className="w-4 h-4 text-green-500" /> : 
                    <FiCopy className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center mt-2 text-sm">
                {pollingConnected ? (
                  <span className="flex items-center text-green-500 dark:text-green-400">
                    <FiWifi className="mr-1" /> Live updates enabled
                  </span>
                ) : (
                  <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <FiWifiOff className="mr-1" /> Live updates disabled
                  </span>
                )}
                {lastUpdated && (
                  <span className="ml-4 text-gray-500 dark:text-gray-400">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleGoHome}
                className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <FiHome className="inline-block mr-1" />
                Home
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`px-3 py-1 text-sm text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 ${refreshing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                <FiRefreshCw className={`inline-block mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Advanced Dashboard with all features */}
          <div className="dashboard-container">
            <Dashboard section="main" />
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;