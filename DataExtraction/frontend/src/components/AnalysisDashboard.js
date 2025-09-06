/**
 * Analysis Dashboard Component
 * Main dashboard for displaying NFT contract analysis results
 * with structured sections and comprehensive data visualization
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Alert,
  Skeleton,
  Fab,
  Tooltip,
  Snackbar,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  Refresh as RefreshIcon,
  Share as ShareIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

// Import dashboard sections
import CollectionAnalysis from './dashboard/CollectionAnalysis';
import RiskAssessment from './dashboard/RiskAssessment';
import FraudDetection from './dashboard/FraudDetection';
import BlockchainMetadata from './dashboard/BlockchainMetadata';
import PriceAnalysis from './dashboard/PriceAnalysis';
import SocialMetrics from './dashboard/SocialMetrics';
import RecentTransactions from './dashboard/RecentTransactions';
import TrustScoreOverview from './dashboard/TrustScoreOverview';

// Import new section components
import MarketPriceSection from './dashboard/sections/MarketPriceSection';
import RiskTrustSection from './dashboard/sections/RiskTrustSection';
import CreatorCollectionSection from './dashboard/sections/CreatorCollectionSection';
import NFTSpecificSection from './dashboard/sections/NFTSpecificSection';
import SummarySegmentationSection from './dashboard/sections/SummarySegmentationSection';
import PortfolioSection from './dashboard/sections/PortfolioSection';

// Import utilities and components
import apiService from '../services/ApiService';
import DataFlowTest from './DataFlowTest';
import RawDataViewer from './RawDataViewer';
import DataHealthIndicator from './DataHealthIndicator';
import { groupAnalysisData, getOverallDataHealth, createDebugSummary } from '../utils/dataGrouping';
import { mapBackendDataToFrontend, validateMappedData } from '../utils/dataMapping';
import { animationVariants, dashboardStyles } from '../theme/dashboardTheme';

const AnalysisDashboard = ({ contractAddress, onError }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  /**
   * Shows a snackbar notification
   * @param {string} message - Message to display
   * @param {string} severity - Severity level (success, error, warning, info)
   */
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  /**
   * Closes the snackbar
   */
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  /**
   * Fetches analysis data from the API
   * @param {boolean} isRefresh - Whether this is a refresh operation
   */
  const fetchData = useCallback(async (isRefresh = false) => {
    if (!contractAddress) {
      setError('No contract address provided');
      setLoading(false);
      return;
    }

    // Check localStorage first if not refreshing
    if (!isRefresh) {
      // Check for cached mapped data first
      const cachedMappedData = localStorage.getItem(`nftAnalysis_mapped_${contractAddress}`);
      if (cachedMappedData) {
        try {
          const parsedMappedData = JSON.parse(cachedMappedData);
          console.log('[AnalysisDashboard] Found cached mapped data:', {
            hasData: !!parsedMappedData,
            dataKeys: parsedMappedData ? Object.keys(parsedMappedData) : []
          });
          
          if (parsedMappedData && typeof parsedMappedData === 'object') {
            console.log('[AnalysisDashboard] Using cached mapped data');
            setData(parsedMappedData);
            setLastUpdated(new Date());
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('[AnalysisDashboard] Error parsing cached mapped data:', error);
        }
      }
      
      // Fallback to original cached data
      const cachedData = localStorage.getItem(`nftAnalysis_${contractAddress}`);
      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          console.log('[AnalysisDashboard] Found cached original data:', {
            success: parsedData?.success,
            hasData: !!parsedData?.data,
            dataKeys: parsedData?.data ? Object.keys(parsedData.data) : []
          });
          
          if (parsedData?.success && parsedData?.data) {
            console.log('[AnalysisDashboard] Using cached original data (mapping now)');
            const mappedData = mapBackendDataToFrontend(parsedData.data);
            setData(mappedData);
            setLastUpdated(new Date());
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('[AnalysisDashboard] Error parsing cached original data:', error);
          // Continue to fetch fresh data if cache parsing fails
        }
      }
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError('');
      
      console.log('[AnalysisDashboard] Fetching data for contract:', contractAddress);
      
      const result = await apiService.analyzeContract(contractAddress);
      
      if (!result || !result.success || !result.data) {
        throw new Error('Invalid response data received from server');
      }
      
      console.log('[AnalysisDashboard] Data received:', result);
      
      // 🚨 COMPREHENSIVE FRONTEND DATA LOGGING
      console.log('🚨 Final Dashboard Data Structure:', {
        success: result.success,
        dataKeys: result.data ? Object.keys(result.data) : [],
        summary: result.data?.summary,
        nftData: result.data?.nftData,
        trustScoreData: result.data?.trustScoreData,
        priceData: result.data?.priceData,
        riskData: result.data?.riskData,
        fraudData: result.data?.fraudData,
        collectionData: result.data?.collectionData,
        marketData: result.data?.marketData,
        portfolioData: result.data?.portfolioData,
        creatorData: result.data?.creatorData
      });
      
      // 🚨 DETAILED DATA INSPECTION
      console.log('🚨 FULL BACKEND RESPONSE:', result);
      console.log('🚨 RAW DATA OBJECT:', result.data);
      if (result.data) {
        console.log('🚨 DATA KEYS AND VALUES:');
        Object.keys(result.data).forEach(key => {
          console.log(`  ${key}:`, result.data[key], `(type: ${typeof result.data[key]})`);
        });
      }
      
      // Log specific field validation
      console.log('🚨 Frontend Field Validation:', {
        'summary exists': !!result.data?.summary,
        'summary type': typeof result.data?.summary,
        'nftData exists': !!result.data?.nftData,
        'nftData type': typeof result.data?.nftData,
        'trustScoreData exists': !!result.data?.trustScoreData,
        'trustScoreData type': typeof result.data?.trustScoreData,
        'priceData exists': !!result.data?.priceData,
        'priceData type': typeof result.data?.priceData,
        'riskData exists': !!result.data?.riskData,
        'riskData type': typeof result.data?.riskData
      });
      
      // Map backend data to frontend structure
      const mappedData = mapBackendDataToFrontend(result.data);
      const validation = validateMappedData(mappedData);
      
      console.log('🔄 [AnalysisDashboard] Data mapping completed:', {
        originalDataKeys: result.data ? Object.keys(result.data) : [],
        mappedDataKeys: Object.keys(mappedData),
        validationResults: validation
      });
      
      // Store both original and mapped data in localStorage
      localStorage.setItem(`nftAnalysis_${contractAddress}`, JSON.stringify(result));
      localStorage.setItem(`nftAnalysis_mapped_${contractAddress}`, JSON.stringify(mappedData));
      
      setData(mappedData);
      setLastUpdated(new Date());
      
      if (isRefresh) {
        showSnackbar('Data refreshed successfully', 'success');
      }
      
    } catch (error) {
      console.error('[AnalysisDashboard] Error fetching data:', error);
      const errorMessage = error.message || 'Failed to load analysis data';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      if (isRefresh) {
        showSnackbar('Failed to refresh data', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [contractAddress, onError, showSnackbar]);

  /**
   * Handles manual refresh of data
   */
  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  /**
   * Handles sharing the analysis results
   */
  const handleShare = useCallback(async () => {
    try {
      if (navigator.share && data) {
        await navigator.share({
          title: `NFT Analysis: ${data.name || data.contractAddress}`,
          text: `Check out this NFT contract analysis with trust score: ${data.trustScore?.overall || 'N/A'}`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        showSnackbar('Link copied to clipboard', 'success');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      showSnackbar('Failed to share', 'error');
    }
  }, [data, showSnackbar]);

  /**
   * Handles downloading analysis data as JSON
   */
  const handleDownload = useCallback(() => {
    if (!data) return;
    
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `nft-analysis-${data.contractAddress}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      showSnackbar('Analysis data downloaded', 'success');
    } catch (error) {
      console.error('Error downloading data:', error);
      showSnackbar('Failed to download data', 'error');
    }
  }, [data, showSnackbar]);

  /**
   * Handles debug data logging
   */
  const handleDebugData = useCallback(() => {
    if (!data) {
      console.log('🔍 Debug: No data available');
      return;
    }
    
    const debugSummary = createDebugSummary(data);
    console.log('🔍 Full Analysis Data Debug Summary:', debugSummary);
    console.log('🔍 Raw Analysis Data:', data);
    
    showSnackbar('Debug data logged to console', 'info');
  }, [data, showSnackbar]);

  /**
   * Toggles debug information display
   */
  const toggleDebugInfo = useCallback(() => {
    setShowDebugInfo(prev => !prev);
  }, []);

  // Memoized data health analysis
  const dataHealth = useMemo(() => {
    if (!data) return null;
    const groupedData = groupAnalysisData(data);
    return getOverallDataHealth(groupedData);
  }, [data]);

  // Load data on component mount or contract address change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized loading skeleton
  const loadingSkeleton = useMemo(() => (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid xs={12} md={6} lg={4} key={index}>
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ borderRadius: 2 }}
            animation="wave"
          />
        </Grid>
      ))}
    </Grid>
  ), []);

  // Error state
  if (error && !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Alert 
          severity="error" 
          sx={{ 
            maxWidth: 600, 
            mx: 'auto', 
            mt: 4,
            borderRadius: 2
          }}
          action={
            <Tooltip title="Retry">
              <Fab
                size="small"
                color="error"
                onClick={() => fetchData()}
                sx={{ ml: 2 }}
              >
                <RefreshIcon />
              </Fab>
            </Tooltip>
          }
        >
          <Typography variant="h6" gutterBottom>
            Analysis Failed
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
      </motion.div>
    );
  }

  // Loading state
  if (loading && !data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Box sx={{ p: 3 }}>
          <Box textAlign="center" mb={4}>
            <Skeleton variant="text" width={300} height={40} sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="text" width={200} height={20} sx={{ mx: 'auto' }} />
          </Box>
          {loadingSkeleton}
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div
      {...animationVariants.fadeInUp}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header Section */}
        <Box mb={4} textAlign="center">
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            gutterBottom 
            fontWeight="bold"
            color="primary"
          >
            {data?.name || 'NFT Contract Analysis'}
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            gutterBottom
          >
            {apiService.formatAddress(contractAddress)}
          </Typography>
          
          {lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {apiService.formatDate(lastUpdated)}
            </Typography>
          )}
        </Box>

        {/* Data Health Indicator */}
        {data && (
          <Box mb={4}>
            <DataHealthIndicator 
              analysisData={data}
              onDebugClick={handleDebugData}
              onRefreshClick={handleRefresh}
              showDetails={showDebugInfo}
            />
          </Box>
        )}

        {/* Debug Controls */}
        {process.env.NODE_ENV === 'development' && (
          <Box mb={4} display="flex" gap={2} flexWrap="wrap">
            <Button 
              variant="outlined" 
              onClick={handleDebugData}
              size="small"
            >
              Debug Data to Console
            </Button>
            <Button 
              variant="outlined" 
              onClick={toggleDebugInfo}
              size="small"
            >
              {showDebugInfo ? 'Hide' : 'Show'} Debug Info
            </Button>
          </Box>
        )}

        {/* Data Flow Test Component */}
        <DataFlowTest data={data} title="Analysis Dashboard Data" />
        
        {/* Raw Data Viewer Component */}
        <RawDataViewer data={data} title="Backend Response Data" />

        {/* Trust Score Overview */}
        {data?.trustScore && (
          <Box mb={4}>
            <TrustScoreOverview 
              trustScore={data.trustScore}
              contractInfo={{
                name: data.name,
                symbol: data.symbol,
                isVerified: data.isVerified,
                standard: data.standard
              }}
            />
          </Box>
        )}

        {/* Main Dashboard Grid - New Section-Based Layout */}
        <motion.div
          {...animationVariants.staggerContainer}
        >
          <Grid container spacing={3}>
          {/* Summary & Segmentation Section */}
          <Grid xs={12} lg={6}>
            <motion.div {...animationVariants.slideUp}>
              <SummarySegmentationSection 
                summary={data?.summary}
                marketSegment={data?.marketSegment}
                marketPositionScore={data?.marketPositionScore}
              />
            </motion.div>
          </Grid>

          {/* Market & Price Analysis Section */}
          <Grid xs={12} lg={6}>
            <motion.div {...animationVariants.slideUp}>
              <MarketPriceSection 
                marketData={data?.marketData}
                priceData={data?.priceData}
              />
            </motion.div>
          </Grid>

          {/* Risk & Trust Assessment Section */}
          <Grid xs={12} lg={6}>
            <motion.div {...animationVariants.slideUp}>
              <RiskTrustSection 
                riskData={data?.riskData}
                fraudData={data?.fraudData}
                trustScoreData={data?.trustScoreData}
              />
            </motion.div>
          </Grid>

          {/* Creator & Collection Section */}
          <Grid xs={12} lg={6}>
            <motion.div {...animationVariants.slideUp}>
              <CreatorCollectionSection 
                creatorData={data?.creatorData}
                collectionData={data?.collectionData}
              />
            </motion.div>
          </Grid>

          {/* Portfolio Section */}
          <Grid xs={12} lg={6}>
            <motion.div {...animationVariants.slideUp}>
              <PortfolioSection 
                portfolioData={data?.portfolioData}
              />
            </motion.div>
          </Grid>

          {/* NFT-Specific Section */}
          <Grid xs={12} lg={6}>
            <motion.div {...animationVariants.slideUp}>
              <NFTSpecificSection 
                nftData={data?.nftData}
              />
            </motion.div>
          </Grid>

          {/* Legacy Components (for backward compatibility) */}
          {data?.socialMetrics && (
            <Grid item xs={12} md={6}>
              <SocialMetrics socialMetrics={data.socialMetrics} />
            </Grid>
          )}

          {data?.blockchainMetadata && (
            <Grid item xs={12} md={6}>
              <BlockchainMetadata 
                blockchainMetadata={data.blockchainMetadata}
                blockchain={data.blockchain}
              />
            </Grid>
          )}

          {data?.recentTransactions && (
            <Grid item xs={12}>
              <RecentTransactions 
                transactions={data.recentTransactions}
                contractAddress={contractAddress}
              />
            </Grid>
          )}
          </Grid>
        </motion.div>

        {/* Floating Action Buttons */}
        <Box
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 24 },
            right: { xs: 16, md: 24 },
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            zIndex: 1000
          }}
        >
          <Tooltip title="Refresh Data" placement="left">
            <Fab
              color="primary"
              onClick={handleRefresh}
              disabled={refreshing}
              size={isMobile ? "medium" : "large"}
            >
              <RefreshIcon sx={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </Fab>
          </Tooltip>

          <Tooltip title="Share Analysis" placement="left">
            <Fab
              color="secondary"
              onClick={handleShare}
              size={isMobile ? "small" : "medium"}
            >
              <ShareIcon />
            </Fab>
          </Tooltip>

          <Tooltip title="Download Data" placement="left">
            <Fab
              color="info"
              onClick={handleDownload}
              size={isMobile ? "small" : "medium"}
            >
              <DownloadIcon />
            </Fab>
          </Tooltip>
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </motion.div>
  );
};

export default AnalysisDashboard;