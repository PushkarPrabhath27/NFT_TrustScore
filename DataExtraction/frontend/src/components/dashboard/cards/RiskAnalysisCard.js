import React from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiBarChart2, FiActivity } from 'react-icons/fi';

const RiskAnalysisCard = ({ riskData }) => {
  if (!riskData) return null;
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const barVariants = {
    hidden: width => ({ width: 0 }),
    visible: width => ({
      width: `${width}%`,
      transition: { duration: 0.8, delay: 0.3, ease: 'easeOut' }
    })
  };
  
  // Risk metrics
  const riskMetrics = [
    { name: 'Volatility', value: riskData.volatility || 0, icon: <FiActivity /> },
    { name: 'Liquidity Risk', value: riskData.liquidityRisk || 0, icon: <FiBarChart2 /> },
    { name: 'Market Risk', value: riskData.marketRisk || 0, icon: <FiAlertTriangle /> },
    { name: 'Smart Contract Risk', value: riskData.contractRisk || 0, icon: <FiAlertTriangle /> },
  ];
  
  // Get color based on risk value
  const getRiskColor = (value) => {
    if (value <= 30) return 'bg-green-500';
    if (value <= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  // Calculate overall risk
  const overallRisk = riskData.overallRisk || 
    Math.round(riskMetrics.reduce((sum, metric) => sum + metric.value, 0) / riskMetrics.length);
  
  // Get risk level text
  const getRiskLevelText = (value) => {
    if (value <= 30) return 'Low';
    if (value <= 60) return 'Medium';
    return 'High';
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-neon-blue overflow-hidden relative"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-xl font-orbitron text-cyan-400 mb-4 flex items-center">
        <FiAlertTriangle className="mr-2" /> Risk Analysis
      </h2>
      
      {/* Overall Risk */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Overall Risk</span>
          <span className="text-sm font-medium">
            <span className={overallRisk <= 30 ? 'text-green-400' : overallRisk <= 60 ? 'text-yellow-400' : 'text-red-400'}>
              {getRiskLevelText(overallRisk)}
            </span>
            <span className="text-gray-400 ml-2">{overallRisk}%</span>
          </span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${getRiskColor(overallRisk)}`}
            custom={overallRisk}
            variants={barVariants}
            initial="hidden"
            animate="visible"
          />
        </div>
      </div>
      
      {/* Risk Metrics */}
      <div className="space-y-4">
        {riskMetrics.map((metric, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-400 flex items-center">
                <span className="mr-2">{metric.icon}</span>
                {metric.name}
              </span>
              <span className="text-sm text-gray-300">{metric.value}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${getRiskColor(metric.value)}`}
                custom={metric.value}
                variants={barVariants}
                initial="hidden"
                animate="visible"
              />
            </div>
          </div>
        ))}
      </div>
      
      {/* Risk Factors */}
      {riskData.riskFactors && riskData.riskFactors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm text-gray-400 mb-2">Key Risk Factors</h3>
          <div className="space-y-2">
            {riskData.riskFactors.map((factor, index) => (
              <motion.div 
                key={index}
                className="bg-gray-800 bg-opacity-50 p-3 rounded border-l-2 border-yellow-500"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
              >
                <div className="flex items-start">
                  <FiAlertTriangle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white">{factor.description}</p>
                    {factor.recommendation && (
                      <p className="text-xs text-gray-400 mt-1">{factor.recommendation}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RiskAnalysisCard;