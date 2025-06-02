import React from 'react';
import { motion } from 'framer-motion';
import { useDarkMode } from '../../../store/store';

const RiskMetricCard = ({ title, value, recommendations = [] }) => {
  const darkMode = useDarkMode();

  const getRiskColor = (val) => {
    if (val >= 80) return 'text-red-500';
    if (val >= 60) return 'text-orange-500';
    if (val >= 40) return 'text-yellow-500';
    if (val >= 20) return 'text-green-400';
    return 'text-green-500';
  };

  const getRiskLabel = (val) => {
    if (val >= 80) return 'Critical';
    if (val >= 60) return 'High';
    if (val >= 40) return 'Medium';
    if (val >= 20) return 'Low';
    return 'Very Low';
  };

  const getProgressColor = (val) => {
    if (val >= 80) return 'bg-red-500';
    if (val >= 60) return 'bg-orange-500';
    if (val >= 40) return 'bg-yellow-500';
    if (val >= 20) return 'bg-green-400';
    return 'bg-green-500';
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className={`text-sm font-medium ${getRiskColor(value)}`}>
          {getRiskLabel(value)}
        </span>
      </div>

      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-electric-blue bg-electric-blue/10">
              Risk Score
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-electric-blue">
              {value}%
            </span>
          </div>
        </div>
        <div className="flex h-2 mb-4 overflow-hidden rounded-full bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className={`flex flex-col justify-center ${getProgressColor(value)}`}
          />
        </div>
      </div>

      {recommendations && recommendations.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Recommendations</h4>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start text-sm"
              >
                <span className="text-electric-blue mr-2">•</span>
                {recommendation}
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

export default RiskMetricCard;