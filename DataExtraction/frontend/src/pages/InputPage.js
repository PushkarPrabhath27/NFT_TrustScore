import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiCheckCircle, FiInfo, FiAlertCircle } from 'react-icons/fi';

function isValidEthAddress(address) {
  // Normalize the address by trimming whitespace
  const trimmedAddress = address.trim();
  // Check if it's a valid Ethereum address format
  return /^0x[a-fA-F0-9]{40}$/.test(trimmedAddress);
}

const InputPage = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [navError, setNavError] = useState('');
  const [fetchSuccess, setFetchSuccess] = useState(false);
  const [metamaskAvailable, setMetamaskAvailable] = useState(false); // Default to false until confirmed
  
  // Check if MetaMask is available
  useEffect(() => {
    try {
      // Safely check for ethereum object
      const hasMetaMask = typeof window !== 'undefined' && 
                         window.ethereum !== undefined;
      
      setMetamaskAvailable(hasMetaMask);
      
      if (!hasMetaMask) {
        console.log('[InputPage] MetaMask extension not found. Some features may be limited.');
      } else {
        console.log('[InputPage] MetaMask extension detected.');
      }
    } catch (err) {
      // Suppress any errors from the check
      console.log('[InputPage] Error checking for MetaMask:', err.message);
      setMetamaskAvailable(false);
    }
  }, []);

  // No mock data generation as per requirements
  // We will only use real data from the backend API

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNavError('');
    setFetchSuccess(false);
    if (!isValidEthAddress(address)) {
      setError('Please enter a valid Ethereum address.');
      return;
    }
    setLoading(true);
    console.log('[InputPage] Fetching analysis for', address);
    try {
      // Make API request to backend
      console.log('[InputPage] Making API request to /api/analyze');
      
      // Trim and normalize the address
      const trimmedAddress = address.trim();
      
      // Keep the request minimal to avoid 431 errors
      const requestData = {
        contractAddress: trimmedAddress
      };
      
      // Validate one more time to be sure
      if (!isValidEthAddress(trimmedAddress)) {
        throw new Error('Invalid Ethereum address format. Please check and try again.');
      }
      
      const response = await fetch(`/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('[InputPage] API response status:', response.status);
      
      // Handle specific error codes
      if (response.status === 431) {
        throw new Error('Request header too large. Please try again with a different address or contact support.');
      }
      
      // Handle HTTP error responses
      if (!response.ok) {
        let errorMessage = `API request failed with status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (jsonError) {
          console.error('[InputPage] Error parsing error response:', jsonError);
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse response data
      const data = await response.json();
      console.log('[InputPage] Received data:', data);
      
      // Validate response data
      if (!data || !data.success || !data.data) {
        throw new Error('Invalid response format from API. Please try again later.');
      }
      
      // Store data in local storage
      localStorage.setItem(`nftAnalysis_${address}`, JSON.stringify(data));
      setFetchSuccess(true);
      console.log('[InputPage] Analysis fetched successfully, redirecting...');
      
      // Navigate to dashboard
      try {
        console.log('[InputPage] Attempting to navigate to:', `/dashboard/${address}`);
        navigate(`/dashboard/${address}`);
      } catch (navErr) {
        setNavError('Navigation failed. Please click the button below to open the dashboard.');
        console.error('[InputPage] Navigation error:', navErr);
      }
    } catch (err) {
      console.error('[InputPage] Error:', err);
      setError(err.message || 'Could not fetch analysis. Please check the address and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[70vh] px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="w-full max-w-3xl"
        variants={itemVariants}
      >
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-orbitron font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-neon-purple"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
          >
            NFT TrustScore Analyzer
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-300 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Enter an Ethereum NFT Smart Contract Address to analyze its trust score, price history, risk factors, and more.
          </motion.p>
          
          {!metamaskAvailable && (
            <motion.div 
              className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-md flex items-center text-yellow-200 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' }}
            >
              <FiInfo className="mr-2 flex-shrink-0" />
              <span>MetaMask extension not detected. Some blockchain features may be limited, but you can still use the NFT analysis tools.</span>
            </motion.div>
          )}
        </div>
        
        <motion.form 
          onSubmit={handleSubmit}
          className="w-full"
          variants={itemVariants}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Ethereum NFT Contract Address (0x...)"
              className="w-full pl-10 pr-4 py-4 bg-cyber-dark/60 border border-cyber-light/30 focus:border-electric-blue rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-electric-blue/50 transition-all duration-300"
              disabled={loading}
            />
            <motion.button
              type="submit"
              className={`absolute right-2 top-2 px-4 py-2 rounded-md ${loading ? 'bg-cyber-gray text-gray-400' : 'bg-gradient-to-r from-electric-blue to-neon-purple text-white'} font-medium transition-all duration-300`}
              whileHover={!loading ? { scale: 1.05 } : {}}
              whileTap={!loading ? { scale: 0.95 } : {}}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </motion.button>
          </div>
          
          {error && (
            <motion.div 
              className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md flex items-center text-red-200"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring' }}
            >
              <FiAlertCircle className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          
          {navError && fetchSuccess && (
            <motion.div className="mt-4 text-center">
              <p className="text-yellow-300 mb-2">{navError}</p>
              <motion.button
                onClick={() => navigate(`/dashboard/${address}`)}
                className="px-6 py-2 bg-gradient-to-r from-electric-blue to-neon-purple rounded-md text-white font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Go to Dashboard
              </motion.button>
            </motion.div>
          )}
        </motion.form>
        
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={itemVariants}
        >
          <motion.div 
            className="p-6 bg-cyber-dark/60 border border-cyber-light/30 rounded-lg"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 255, 255, 0.1)' }}
          >
            <h3 className="text-xl font-bold mb-2 text-electric-blue">Trust Score</h3>
            <p className="text-gray-400">Analyze the trustworthiness of NFT collections based on multiple factors.</p>
          </motion.div>
          
          <motion.div 
            className="p-6 bg-cyber-dark/60 border border-cyber-light/30 rounded-lg"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(157, 0, 255, 0.1)' }}
          >
            <h3 className="text-xl font-bold mb-2 text-neon-purple">Risk Analysis</h3>
            <p className="text-gray-400">Identify potential risks and vulnerabilities in NFT smart contracts.</p>
          </motion.div>
          
          <motion.div 
            className="p-6 bg-cyber-dark/60 border border-cyber-light/30 rounded-lg"
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(57, 255, 20, 0.1)' }}
          >
            <h3 className="text-xl font-bold mb-2 text-neon-green">Price Insights</h3>
            <p className="text-gray-400">Track historical prices and get predictions for future value trends.</p>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
  };

export default InputPage;