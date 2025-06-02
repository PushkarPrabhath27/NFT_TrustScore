import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useStore,
  useDarkMode,
  useAnimationsEnabled 
} from '../../../store/store';

const ContractActivityTimeline = () => {
  // Get data from store
  const nftData = useStore(state => state.nftData);
  const analyticsData = useStore(state => state.analyticsData);
  const darkMode = useDarkMode();
  const animationsEnabled = useAnimationsEnabled();
  const [expandedEvent, setExpandedEvent] = useState(null);

  // Robust contract activity fallback logic
  let activity = [];
  if (nftData && Array.isArray(nftData.activity) && nftData.activity.length > 0) {
    activity = nftData.activity;
  } else if (nftData && Array.isArray(nftData.transactions) && nftData.transactions.length > 0) {
    // Try to adapt transactions array to activity timeline format
    activity = nftData.transactions.map(tx => ({
      type: tx.type || 'transaction',
      timestamp: tx.timestamp,
      from: tx.from,
      to: tx.to,
      price: tx.value,
      tokenId: tx.tokenId,
      transactionHash: tx.hash,
      blockNumber: tx.blockNumber,
      description: tx.description || '',
    }));
  } else if (analyticsData && Array.isArray(analyticsData.activity) && analyticsData.activity.length > 0) {
    activity = analyticsData.activity;
  }

  // Debug logging
  console.log('[ContractActivityTimeline] Activity events:', activity);

  // If still no data, show placeholder
  if (!activity || !Array.isArray(activity) || activity.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No contract activity data available</p>
      </div>
    );
  }

  // Sort data by timestamp (newest first)
  const sortedData = [...activity].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Get event icon based on type
  const getEventIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'mint':
        return (
          <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center border border-neon-green">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neon-green" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'transfer':
        return (
          <div className="w-8 h-8 rounded-full bg-electric-blue/20 flex items-center justify-center border border-electric-blue">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-electric-blue" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
          </div>
        );
      case 'sale':
        return (
          <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center border border-neon-purple">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neon-purple" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'approval':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-500/20 flex items-center justify-center border border-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  // Get event color based on type
  const getEventColor = (type) => {
    switch (type.toLowerCase()) {
      case 'mint':
        return 'text-neon-green';
      case 'transfer':
        return 'text-electric-blue';
      case 'sale':
        return 'text-neon-purple';
      case 'approval':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Format address (truncate)
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar pr-2">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div 
          className={`absolute left-4 top-4 bottom-0 w-0.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
          style={{ transform: 'translateX(-50%)' }}
        >
          {/* Animated pulse effect on the line */}
          {animationsEnabled && (
            <motion.div 
              className="absolute top-0 w-full h-24 bg-gradient-to-b from-electric-blue via-transparent to-transparent"
              animate={{
                y: [0, 100, 0],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'loop',
              }}
            />
          )}
        </div>

        {/* Timeline events */}
        <div className="ml-8 space-y-6">
          {sortedData.map((event, index) => (
            <motion.div 
              key={index}
              className={`relative ${index === sortedData.length - 1 ? 'pb-0' : 'pb-2'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Event icon */}
              <div className="absolute -left-10 mt-1">
                {getEventIcon(event.type)}
              </div>

              {/* Event card */}
              <motion.div 
                className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/60' : 'bg-white'} backdrop-blur-sm border ${expandedEvent === index ? 'border-electric-blue shadow-neon-glow' : `border-gray-200 ${darkMode ? 'border-gray-700' : ''}`}`}
                whileHover={{ scale: 1.02 }}
                onClick={() => setExpandedEvent(expandedEvent === index ? null : index)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`text-sm font-orbitron font-bold ${getEventColor(event.type)}`}>
                      {event.type}
                    </h3>
                    <p className="text-xs text-gray-500 font-rajdhani">
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                  <div className="text-xs font-mono bg-gray-900/30 px-2 py-1 rounded">
                    {event.tokenId ? `Token #${event.tokenId}` : ''}
                  </div>
                </div>

                {/* Basic info always visible */}
                <div className="mt-2 text-sm">
                  {event.from && (
                    <p className="text-xs">
                      <span className="text-gray-500">From:</span> {formatAddress(event.from)}
                    </p>
                  )}
                  {event.to && (
                    <p className="text-xs">
                      <span className="text-gray-500">To:</span> {formatAddress(event.to)}
                    </p>
                  )}
                  {event.price && (
                    <p className="text-xs font-semibold">
                      <span className="text-gray-500">Price:</span> {event.price} HTR
                    </p>
                  )}
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {expandedEvent === index && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="space-y-2 text-xs">
                        {event.transactionHash && (
                          <p className="font-mono break-all">
                            <span className="text-gray-500">Tx Hash:</span> {event.transactionHash}
                          </p>
                        )}
                        {event.blockNumber && (
                          <p>
                            <span className="text-gray-500">Block:</span> {event.blockNumber}
                          </p>
                        )}
                        {event.description && (
                          <p>
                            <span className="text-gray-500">Details:</span> {event.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expand/collapse indicator */}
                <div className="mt-2 flex justify-center">
                  <motion.div 
                    animate={{ rotate: expandedEvent === index ? 180 : 0 }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${expandedEvent === index ? 'bg-electric-blue/20' : 'bg-gray-200/20'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${expandedEvent === index ? 'text-electric-blue' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContractActivityTimeline;