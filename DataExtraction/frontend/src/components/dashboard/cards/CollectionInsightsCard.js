import React from 'react';
import { motion } from 'framer-motion';
import { FiGrid, FiUsers, FiBarChart, FiTrendingUp, FiClock } from 'react-icons/fi';

const CollectionInsightsCard = ({ collectionData }) => {
  if (!collectionData) return null;
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const statVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + (i * 0.1),
        duration: 0.5
      }
    })
  };
  
  // Format large numbers
  const formatNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    
    return num.toString();
  };
  
  // Format currency
  const formatCurrency = (value, currency = '$') => {
    if (value === undefined || value === null) return 'N/A';
    
    // Convert value to number if it's a string
    let numValue;
    if (typeof value === 'string') {
      numValue = parseFloat(value);
    } else if (typeof value === 'number') {
      numValue = value;
    } else {
      return currency + ' N/A';
    }
    
    // Check if conversion resulted in a valid number
    if (isNaN(numValue)) {
      return currency + ' N/A';
    }
    
    // Format the number
    if (numValue >= 1000000) {
      return currency + ' ' + (numValue / 1000000).toFixed(2) + 'M';
    } else if (numValue >= 1000) {
      return currency + ' ' + (numValue / 1000).toFixed(2) + 'K';
    }
    
    return currency + ' ' + numValue.toFixed(2);
  };
  
  // Collection stats
  const stats = [
    { 
      name: 'Total Items', 
      value: formatNumber(collectionData.totalItems), 
      icon: <FiGrid />,
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      name: 'Owners', 
      value: formatNumber(collectionData.owners), 
      icon: <FiUsers />,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      name: 'Floor Price', 
      value: formatCurrency(collectionData.floorPrice, collectionData.currency || '$'), 
      icon: <FiBarChart />,
      color: 'from-green-500 to-emerald-500'
    },
    { 
      name: 'Volume Traded', 
      value: formatCurrency(collectionData.volumeTraded, collectionData.currency || '$'), 
      icon: <FiTrendingUp />,
      color: 'from-orange-500 to-yellow-500'
    }
  ];
  
  // Recent transactions
  const recentTransactions = collectionData.recentTransactions || [];

  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-neon-blue overflow-hidden relative"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-xl font-orbitron text-cyan-400 mb-4 flex items-center">
        <FiGrid className="mr-2" /> Collection Insights
      </h2>
      
      {/* Collection Info */}
      <div className="flex items-center mb-6">
        {collectionData.image && (
          <div className="w-16 h-16 rounded-lg overflow-hidden mr-4 border border-gray-700">
            <img 
              src={collectionData.image} 
              alt={collectionData.name} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <h3 className="text-lg font-medium text-white">{collectionData.name}</h3>
          {collectionData.creator && (
            <p className="text-sm text-gray-400">Created by {collectionData.creator}</p>
          )}
          {collectionData.createdAt && (
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <FiClock className="mr-1" /> 
              Created {new Date(collectionData.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            className={`bg-gradient-to-br ${stat.color} bg-opacity-10 rounded-lg p-4 flex flex-col items-center justify-center text-center`}
            custom={index}
            variants={statVariants}
          >
            <div className="w-10 h-10 rounded-full bg-gray-800 bg-opacity-50 flex items-center justify-center mb-2">
              {stat.icon}
            </div>
            <p className="text-xs text-gray-400 mb-1">{stat.name}</p>
            <p className="text-lg font-medium">{stat.value}</p>
          </motion.div>
        ))}
      </div>
      
      {/* Description */}
      {collectionData.description && (
        <motion.div 
          className="mb-6 bg-gray-800 bg-opacity-50 p-4 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-sm text-gray-400 mb-2">Description</h3>
          <p className="text-sm text-gray-300 line-clamp-3">{collectionData.description}</p>
        </motion.div>
      )}
      
      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div>
          <h3 className="text-sm text-gray-400 mb-3">Recent Transactions</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {recentTransactions.map((tx, index) => (
              <motion.div 
                key={index}
                className="bg-gray-800 bg-opacity-50 p-3 rounded-lg flex justify-between items-center"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
              >
                <div>
                  <p className="text-sm font-medium">
                    {tx.type === 'sale' ? 'Sold' : tx.type === 'mint' ? 'Minted' : tx.type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tx.date ? new Date(tx.date).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(tx.price, collectionData.currency || '$')}
                  </p>
                  {tx.tokenId && (
                    <p className="text-xs text-gray-500">Token #{tx.tokenId}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      
      {/* Market Trend */}
      {collectionData.marketTrend && (
        <motion.div 
          className="mt-6 p-3 rounded-lg border-l-2"
          style={{ 
            borderColor: 
              collectionData.marketTrend === 'up' ? '#10b981' : 
              collectionData.marketTrend === 'down' ? '#ef4444' : 
              '#6366f1',
            backgroundColor: 'rgba(17, 24, 39, 0.5)'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-sm mb-1 flex items-center"
            style={{ 
              color: 
                collectionData.marketTrend === 'up' ? '#10b981' : 
                collectionData.marketTrend === 'down' ? '#ef4444' : 
                '#6366f1'
            }}
          >
            {collectionData.marketTrend === 'up' ? (
              <>
                <FiTrendingUp className="mr-1" /> Upward Trend
              </>
            ) : collectionData.marketTrend === 'down' ? (
              <>
                <FiTrendingUp className="mr-1 transform rotate-180" /> Downward Trend
              </>
            ) : (
              <>
                <FiBarChart className="mr-1" /> Stable
              </>
            )}
          </h3>
          <p className="text-sm text-gray-300">
            {collectionData.marketTrendDescription || 
              `The collection is showing a ${collectionData.marketTrend === 'up' ? 'positive' : 
                collectionData.marketTrend === 'down' ? 'negative' : 'stable'} trend in the market.`
            }
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CollectionInsightsCard;