/**
 * Analysis Dashboard Component
 * Main dashboard for displaying NFT contract analysis results
 * with structured sections and comprehensive data visualization
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Typography,
  Alert,
  Skeleton,
  Fab,
  Tooltip,
  Snackbar,
  useTheme,
  useMediaQuery
} from '@mui/material';
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

// Import services
import apiService from '../services/ApiService';

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

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError('');
      
      console.log('[AnalysisDashboard] Fetching data for contract:', contractAddress);
      
      const result = await apiService.analyzeContract(contractAddress);
      
      if (!result || !result.contractAddress) {
        throw new Error('Invalid response data received from server');
      }
      
      console.log('[AnalysisDashboard] Data received:', result);
      
      setData(result);
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

  // Load data on component mount or contract address change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoized loading skeleton
  const loadingSkeleton = useMemo(() => (
    <Grid container spacing={3}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Grid item xs={12} md={6} lg={4} key={index}>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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

        {/* Main Dashboard Grid */}
        <Grid container spacing={3}>
          {/* Collection Analysis */}
          {data?.collectionData && (
            <Grid item xs={12} lg={6}>
              <CollectionAnalysis 
                collectionData={data.collectionData}
                contractInfo={{
                  name: data.name,
                  symbol: data.symbol,
                  totalSupply: data.totalSupply,
                  owner: data.owner
                }}
              />
            </Grid>
          )}

          {/* Price Analysis */}
          {data?.priceData && (
            <Grid item xs={12} lg={6}>
              <PriceAnalysis priceData={data.priceData} />
            </Grid>
          )}

          {/* Risk Assessment */}
          {data?.riskAssessment && (
            <Grid item xs={12} md={6}>
              <RiskAssessment riskAssessment={data.riskAssessment} />
            </Grid>
          )}

          {/* Fraud Detection */}
          {data?.fraudDetection && (
            <Grid item xs={12} md={6}>
              <FraudDetection fraudDetection={data.fraudDetection} />
            </Grid>
          )}

          {/* Social Metrics */}
          {data?.socialMetrics && (
            <Grid item xs={12} md={6}>
              <SocialMetrics socialMetrics={data.socialMetrics} />
            </Grid>
          )}

          {/* Blockchain Metadata */}
          {data?.blockchainMetadata && (
            <Grid item xs={12} md={6}>
              <BlockchainMetadata 
                blockchainMetadata={data.blockchainMetadata}
                blockchain={data.blockchain}
              />
            </Grid>
          )}

          {/* Recent Transactions */}
          {data?.recentTransactions && (
            <Grid item xs={12}>
              <RecentTransactions 
                transactions={data.recentTransactions}
                contractAddress={contractAddress}
              />
            </Grid>
          )}
        </Grid>

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