import React from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../../../store/store';

const TrendList = ({ trends }) => {
  const darkMode = useDarkMode();

  if (!trends || trends.length === 0) return null;

  const getEventIcon = (event) => {
    switch (event.toLowerCase()) {
      case 'sale':
        return '💰';
      case 'listing':
        return '📋';
      case 'transfer':
        return '↔️';
      case 'mint':
        return '⭐';
      default:
        return '📊';
    }
  };

  const getEventColor = (event) => {
    switch (event.toLowerCase()) {
      case 'sale':
        return 'text-green-400';
      case 'listing':
        return 'text-blue-400';
      case 'transfer':
        return 'text-purple-400';
      case 'mint':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full bg-gray-800 rounded-lg p-4 shadow-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}
    >
      <h3 className="text-xl font-semibold mb-4 text-electric-blue">Recent Activity</h3>
      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {trends.map((trend, index) => (
          <motion.div
            key={`${trend.timestamp}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl">{getEventIcon(trend.event)}</span>
              <div>
                <p className={`font-semibold ${getEventColor(trend.event)}`}>
                  {trend.event}
                </p>
                <p className="text-sm text-gray-400">
                  {new Date(trend.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-electric-blue">
                {trend.price.toFixed(4)} ETH
              </p>
              <p className="text-sm text-gray-400">
                Token #{trend.tokenId}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrendList;