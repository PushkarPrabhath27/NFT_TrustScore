import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/store';

// Import chart components
import RiskAssessmentChart from './charts/RiskAssessmentChart';
import ContractActivityTimeline from './charts/ContractActivityTimeline';

const EntityDetailsModal = ({ isOpen, onClose, nftData }) => {
  const { darkMode, animationsEnabled } = useStore();

  // Close modal on escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // If modal is not open or no data, don't render
  if (!isOpen || !nftData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-neon-glow border border-electric-blue/30 backdrop-blur-lg`}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-purple">
                  {nftData.name} Details
                </h2>
                <p className="text-gray-500 font-rajdhani">
                  Comprehensive analysis and metrics
                </p>

                {/* Close button */}
                <motion.button
                  className={`absolute top-6 right-6 p-2 rounded-full ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left column - NFT Info */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* NFT Basic Info Card */}
                    <motion.div
                      className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/60' : 'bg-gray-50'} backdrop-blur-sm border border-electric-blue/30 relative overflow-hidden`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-electric-blue/10 rounded-full blur-3xl"></div>
                      
                      <h3 className="text-lg font-orbitron font-bold mb-4 text-electric-blue">
                        Contract Information
                      </h3>
                      
                      <div className="space-y-4 font-rajdhani">
                        <div>
                          <p className="text-gray-500 text-sm">Name</p>
                          <p className="text-lg font-semibold">{nftData.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Symbol</p>
                          <p className="text-lg font-semibold">{nftData.symbol}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Contract Address</p>
                          <p className="text-sm font-mono break-all">{nftData.contractAddress}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Token Standard</p>
                          <p className="text-lg font-semibold">{nftData.tokenStandard || 'HTR-NFT'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Total Supply</p>
                          <p className="text-lg font-semibold">{nftData.totalSupply}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Creator</p>
                          <p className="text-sm font-mono break-all">{nftData.creator || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Creation Date</p>
                          <p className="text-lg font-semibold">{nftData.creationDate ? new Date(nftData.creationDate).toLocaleDateString() : 'Unknown'}</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Trust Score Card */}
                    <motion.div
                      className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/60' : 'bg-gray-50'} backdrop-blur-sm border border-electric-blue/30 relative overflow-hidden`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="absolute -top-24 -left-24 w-48 h-48 bg-neon-purple/10 rounded-full blur-3xl"></div>
                      
                      <h3 className="text-lg font-orbitron font-bold mb-4 text-neon-purple">
                        Trust Score Breakdown
                      </h3>
                      
                      <div className="space-y-4 font-rajdhani">
                        {nftData.trustFactors && Object.entries(nftData.trustFactors).map(([key, value]) => (
                          <div key={key}>
                            <div className="flex justify-between items-center">
                              <p className="text-gray-500 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="text-sm font-semibold">{value}/100</p>
                            </div>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-electric-blue to-neon-purple"
                                initial={{ width: 0 }}
                                animate={{ width: `${value}%` }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                              ></motion.div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Right column - Charts and Data */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Risk Assessment Chart */}
                    <motion.div
                      className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/60' : 'bg-gray-50'} backdrop-blur-sm border border-electric-blue/30`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h3 className="text-lg font-orbitron font-bold mb-4 text-electric-blue">
                        Risk Assessment
                      </h3>
                      
                      <div className="h-80">
                        <RiskAssessmentChart data={nftData.riskData} />
                      </div>
                    </motion.div>

                    {/* Contract Activity Timeline */}
                    <motion.div
                      className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/60' : 'bg-gray-50'} backdrop-blur-sm border border-electric-blue/30`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-lg font-orbitron font-bold mb-4 text-neon-purple">
                        Contract Activity
                      </h3>
                      
                      <div className="h-80">
                        <ContractActivityTimeline data={nftData.activityTimeline} />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Additional Data Section */}
                <motion.div
                  className={`mt-6 p-6 rounded-xl ${darkMode ? 'bg-gray-800/60' : 'bg-gray-50'} backdrop-blur-sm border border-electric-blue/30`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-lg font-orbitron font-bold mb-4 text-neon-green">
                    Additional Metrics
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Metrics cards */}
                    {generateMetricsCards(nftData).map((metric, index) => (
                      <motion.div
                        key={metric.label}
                        className={`p-4 rounded-lg ${darkMode ? 'bg-gray-900/60' : 'bg-white'} border border-gray-200 dark:border-gray-700`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + (index * 0.1) }}
                        whileHover={animationsEnabled ? { y: -5, boxShadow: '0 10px 25px -5px rgba(0, 255, 255, 0.1)' } : {}}
                      >
                        <p className="text-xs text-gray-500 font-rajdhani">{metric.label}</p>
                        <p className={`text-lg font-bold font-orbitron ${metric.color}`}>
                          {metric.value}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <p className="text-sm text-gray-500 font-rajdhani">
                  Last updated: {nftData.lastUpdated ? new Date(nftData.lastUpdated).toLocaleString() : 'Unknown'}
                </p>
                
                <motion.button
                  className="px-4 py-2 rounded-lg font-orbitron font-bold text-white bg-gradient-to-r from-electric-blue to-neon-purple hover:from-neon-purple hover:to-electric-blue transition-all duration-300 shadow-neon-glow"
                  onClick={onClose}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper function to generate metrics cards
const generateMetricsCards = (nftData) => {
  const metrics = [
    {
      label: 'Holders',
      value: nftData.holders || '0',
      color: 'text-electric-blue'
    },
    {
      label: 'Transactions',
      value: nftData.transactions || '0',
      color: 'text-neon-purple'
    },
    {
      label: 'Floor Price',
      value: nftData.floorPrice ? `${nftData.floorPrice} HTR` : 'N/A',
      color: 'text-neon-green'
    },
    {
      label: 'Volume (24h)',
      value: nftData.volume24h ? `${nftData.volume24h} HTR` : 'N/A',
      color: 'text-yellow-500'
    },
    {
      label: 'Unique Owners',
      value: nftData.uniqueOwners || '0',
      color: 'text-electric-blue'
    },
    {
      label: 'Royalty',
      value: nftData.royalty ? `${nftData.royalty}%` : 'N/A',
      color: 'text-neon-purple'
    },
    {
      label: 'Market Cap',
      value: nftData.marketCap ? `${nftData.marketCap} HTR` : 'N/A',
      color: 'text-neon-green'
    },
    {
      label: 'Liquidity Score',
      value: nftData.liquidityScore ? `${nftData.liquidityScore}/100` : 'N/A',
      color: 'text-yellow-500'
    }
  ];

  return metrics;
};

export default EntityDetailsModal;