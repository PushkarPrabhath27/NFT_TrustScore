import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiShield, FiInfo } from 'react-icons/fi';
import { useDarkMode } from '../../../store/store';

const RiskMetricCard = ({ title, value, description, type = 'risk', icon }) => {
  const darkMode = useDarkMode();
  
  // Helper function to get color based on risk value
  const getRiskColor = (value, type) => {
    if (type === 'trust') {
      // For trust scores, higher is better
      if (value >= 80) return 'text-green-500';
      if (value >= 60) return 'text-blue-500';
      if (value >= 40) return 'text-yellow-500';
      if (value >= 20) return 'text-orange-500';
      return 'text-red-500';
    } else {
      // For risk scores, lower is better
      if (value < 20) return 'text-green-500';
      if (value < 40) return 'text-blue-500';
      if (value < 60) return 'text-yellow-500';
      if (value < 80) return 'text-orange-500';
      return 'text-red-500';
    }
  };
  
  // Helper function to get background color based on risk value
  const getRiskBgColor = (value, type) => {
    if (type === 'trust') {
      // For trust scores, higher is better
      if (value >= 80) return 'bg-green-500/20';
      if (value >= 60) return 'bg-blue-500/20';
      if (value >= 40) return 'bg-yellow-500/20';
      if (value >= 20) return 'bg-orange-500/20';
      return 'bg-red-500/20';
    } else {
      // For risk scores, lower is better
      if (value < 20) return 'bg-green-500/20';
      if (value < 40) return 'bg-blue-500/20';
      if (value < 60) return 'bg-yellow-500/20';
      if (value < 80) return 'bg-orange-500/20';
      return 'bg-red-500/20';
    }
  };
  
  // Helper function to get label based on risk value
  const getRiskLabel = (value, type) => {
    if (type === 'trust') {
      // For trust scores, higher is better
      if (value >= 80) return 'Very High';
      if (value >= 60) return 'High';
      if (value >= 40) return 'Medium';
      if (value >= 20) return 'Low';
      return 'Very Low';
    } else {
      // For risk scores, lower is better
      if (value < 20) return 'Very Low';
      if (value < 40) return 'Low';
      if (value < 60) return 'Medium';
      if (value < 80) return 'High';
      return 'Very High';
    }
  };
  
  // Get appropriate icon
  const IconComponent = icon || (type === 'trust' ? FiShield : FiAlertTriangle);
  
  // Get appropriate colors and label
  const textColor = getRiskColor(value, type);
  const bgColor = getRiskBgColor(value, type);
  const label = getRiskLabel(value, type);
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{title}</h3>
        <div className={`p-1.5 rounded-full ${bgColor}`}>
          <IconComponent className={`w-4 h-4 ${textColor}`} />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className={`text-2xl font-bold ${textColor}`}>{value}</span>
          <span className={`text-xs ${textColor}`}>{label}</span>
        </div>
        
        <div className="relative w-12 h-12">
          <svg viewBox="0 0 36 36" className="w-12 h-12 transform -rotate-90">
            <path
              className={`stroke-current ${darkMode ? 'text-gray-700' : 'text-gray-200'}`}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`stroke-current ${textColor}`}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${value}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      </div>
      
      {description && (
        <div className="mt-2 text-xs text-gray-500 flex items-start">
          <FiInfo className="mr-1 mt-0.5 flex-shrink-0" />
          <p>{description}</p>
        </div>
      )}
    </motion.div>
  );
};

export default RiskMetricCard;
