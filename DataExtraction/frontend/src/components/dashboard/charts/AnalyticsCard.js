import React from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../../../store/store';

const AnalyticsCard = ({ title, value, change, format }) => {
  const darkMode = useDarkMode();

  const formatValue = (val) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(val);
    }
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getChangeColor = (changeValue) => {
    if (!changeValue) return 'text-gray-400';
    return changeValue > 0 ? 'text-green-400' : 'text-red-400';
  };

  const getChangeIcon = (changeValue) => {
    if (!changeValue) return null;
    return changeValue > 0 ? '↑' : '↓';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        p-4 rounded-lg shadow-lg
        ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
        border border-electric-blue/20
        hover:border-electric-blue/50 transition-colors duration-200
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {change !== undefined && (
          <div className={`flex items-center ${getChangeColor(change)}`}>
            <span className="text-sm mr-1">{getChangeIcon(change)}</span>
            <span className="text-sm">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <div className="flex items-baseline">
        <div className="text-2xl font-semibold text-electric-blue">
          {formatValue(value)}
        </div>
      </div>

      <motion.div
        className="w-full h-1 bg-gray-700 mt-4 rounded-full overflow-hidden"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <motion.div
          className="h-full bg-electric-blue"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.5, duration: 1 }}
        />
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsCard;