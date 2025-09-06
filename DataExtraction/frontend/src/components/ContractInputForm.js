/**
 * Contract Input Form Component
 * Handles contract address input, validation, and submission
 * with comprehensive error handling and user feedback
 */

import React, { useState, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  Tooltip,
  IconButton,
  Fade
} from '@mui/material';
import { FiSearch, FiInfo, FiX, FiHome } from 'react-icons/fi';
import apiService from '../services/ApiService';

const ContractInputForm = () => {
  const navigate = useNavigate();
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  /**
   * Validates contract address in real-time
   * @param {string} address - Contract address to validate
   */
  const validateAddress = useCallback((address) => {
    if (!address.trim()) {
      setValidationError('');
      setIsValid(false);
      return;
    }

    if (!apiService.validateContractAddress(address)) {
      setValidationError('Invalid Ethereum address format (must start with 0x followed by 40 hex characters)');
      setIsValid(false);
      return;
    }

    setValidationError('');
    setIsValid(true);
  }, []);

  /**
   * Handles input change with real-time validation
   * @param {Event} event - Input change event
   */
  const handleInputChange = useCallback((event) => {
    const value = event.target.value.trim();
    setContractAddress(value);
    setError(''); // Clear any previous submission errors
    validateAddress(value);
  }, [validateAddress]);

  /**
   * Clears the input field and resets validation state
   */
  const handleClear = useCallback(() => {
    setContractAddress('');
    setError('');
    setValidationError('');
    setIsValid(false);
  }, []);

  /**
   * Attempts to connect to MetaMask and get current account
   */
  const handleConnectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        setError('MetaMask is not installed. Please install MetaMask to use this feature.');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        const account = accounts[0];
        setContractAddress(account);
        validateAddress(account);
        setError('');
      }
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error);
      setError('Failed to connect to MetaMask. Please try again.');
    }
  }, [validateAddress]);

  /**
   * Handles form submission and navigation to dashboard
   * @param {Event} event - Form submit event
   */
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    // Reset error states
    setError('');
    setValidationError('');

    // Validate input
    if (!contractAddress.trim()) {
      setValidationError('Please enter a contract address');
      return;
    }

    if (!isValid) {
      setValidationError('Please enter a valid Ethereum contract address');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      // Test the API connection and validate the contract
      console.log('[ContractInputForm] Submitting contract address:', contractAddress);
      
      // Make the API call to analyze the contract
      const response = await apiService.analyzeContract(contractAddress);
      
      console.log('[ContractInputForm] API Response received:', {
        success: response?.success,
        hasData: !!response?.data,
        dataKeys: response?.data ? Object.keys(response.data) : [],
        responseStructure: {
          success: typeof response?.success,
          data: typeof response?.data,
          source: response?.source
        }
      });
      
      if (!response || !response.success) {
        throw new Error(response?.error || 'Failed to analyze contract');
      }
      
      // Log the analysis data structure for debugging
      console.log('[ContractInputForm] Analysis data structure:', {
        contractAddress: response.data?.contractAddress,
        nftData: response.data?.nftData ? 'Present' : 'Missing',
        trustScoreData: response.data?.trustScoreData ? 'Present' : 'Missing',
        priceData: response.data?.priceData ? 'Present' : 'Missing',
        riskData: response.data?.riskData ? 'Present' : 'Missing',
        fraudData: response.data?.fraudData ? 'Present' : 'Missing',
        collectionData: response.data?.collectionData ? 'Present' : 'Missing',
        marketData: response.data?.marketData ? 'Present' : 'Missing',
        portfolioData: response.data?.portfolioData ? 'Present' : 'Missing',
        creatorData: response.data?.creatorData ? 'Present' : 'Missing'
      });
      
      // Store the analysis result in localStorage for the dashboard
      localStorage.setItem(`nftAnalysis_${contractAddress}`, JSON.stringify(response));
      console.log('[ContractInputForm] Data stored in localStorage');
      
      // Update the analysis result state
      setAnalysisResult(response.data);
      setLoading(false);
      
      // Navigate to dashboard with the contract address
      console.log('[ContractInputForm] Analysis successful, navigating to dashboard...');
      navigate(`/analyze/${contractAddress}`);
      
    } catch (error) {
      console.error('[ContractInputForm] Submission error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }, [contractAddress, isValid, navigate]);

  /**
   * Handles Enter key press for form submission
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter' && isValid && !loading) {
      handleSubmit(event);
    }
  }, [isValid, loading, handleSubmit]);

  const handleReset = useCallback(() => {
    setContractAddress('');
    setError('');
    setValidationError('');
    setIsValid(false);
    setAnalysisResult(null);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={3}
        sx={{
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          padding: 3,
          color: 'white',
          maxWidth: 800,
          margin: '0 auto'
        }}
      >
        <Box textAlign="center" mb={3}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            NFT Smart Contract Analyzer
          </Typography>
          <Typography variant="body1" color="rgba(255, 255, 255, 0.8)">
            {analysisResult ? 'Analysis Results' : 'Enter an Ethereum contract address to analyze NFT collections, assess risks, and detect fraud'}
          </Typography>
        </Box>

        {!analysisResult ? (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Contract Address"
              placeholder="0x1234567890123456789012345678901234567890"
              value={contractAddress}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              error={!!validationError}
              helperText={validationError || 'Enter a valid Ethereum contract address (0x...)'}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch color="rgba(255, 255, 255, 0.7)" />
                  </InputAdornment>
                ),
                endAdornment: contractAddress && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClear}
                      edge="end"
                      disabled={loading}
                      sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                    >
                      <FiX />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.23)'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.4)'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)'
                },
                '& .MuiInputBase-input': {
                  color: 'white'
                }
              }}
            />

            {error && (
              <Fade in={!!error}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            <Box display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!isValid || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <FiSearch />}
              >
                {loading ? 'Analyzing...' : 'Analyze Contract'}
              </Button>

              <Tooltip title="Connect MetaMask wallet">
                <Button
                  variant="outlined"
                  onClick={handleConnectWallet}
                  disabled={loading}
                  startIcon={<FiHome />}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.23)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      background: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  Connect Wallet
                </Button>
              </Tooltip>
            </Box>
          </Box>
        ) : (
          <Box>
            {/* Analysis Result Content */}
            <Alert severity="success" sx={{ mb: 2 }}>
              Analysis completed successfully! Redirecting to dashboard...
            </Alert>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Contract: {contractAddress}
            </Typography>
            <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" sx={{ mb: 2 }}>
              If you are not redirected automatically, please wait a moment or refresh the page.
            </Typography>
            <Button
              variant="outlined"
              onClick={handleReset}
              sx={{ mt: 2 }}
            >
              Analyze Another Contract
            </Button>
          </Box>
        )}
      </Paper>

      {!analysisResult && (
        <Box mt={3} textAlign="center">
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" gutterBottom>
            Try these example contracts:
          </Typography>
          <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1}>
            {[
              '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', // BAYC
              '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB', // CryptoPunks
              '0xED5AF388653567Af2F388E6224dC7C4b3241C544'  // Azuki
            ].map((address, index) => (
              <Button
                key={index}
                size="small"
                variant="text"
                onClick={() => {
                  setContractAddress(address);
                  validateAddress(address);
                }}
                disabled={loading}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  '&:hover': {
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {apiService.formatAddress(address, 6, 4)}
              </Button>
            ))}
          </Box>
        </Box>
      )}
    </motion.div>
  );
};

export default ContractInputForm;