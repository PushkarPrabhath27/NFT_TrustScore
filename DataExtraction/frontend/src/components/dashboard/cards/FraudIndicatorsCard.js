import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiAlertOctagon, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const FraudIndicatorsCard = ({ fraudData }) => {
  if (!fraudData) return null;
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.3 + (i * 0.1),
        duration: 0.5
      }
    })
  };
  
  // Fraud indicators
  const indicators = [
    { 
      name: 'Wash Trading', 
      detected: fraudData.washTrading?.detected || false,
      severity: fraudData.washTrading?.severity || 0,
      description: fraudData.washTrading?.description || 'Artificial trading volume created by the same entity buying and selling the NFT.'
    },
    { 
      name: 'Price Manipulation', 
      detected: fraudData.priceManipulation?.detected || false,
      severity: fraudData.priceManipulation?.severity || 0,
      description: fraudData.priceManipulation?.description || 'Artificial inflation or deflation of NFT prices.'
    },
    { 
      name: 'Suspicious Transactions', 
      detected: fraudData.suspiciousTransactions?.detected || false,
      severity: fraudData.suspiciousTransactions?.severity || 0,
      description: fraudData.suspiciousTransactions?.description || 'Unusual transaction patterns that may indicate fraudulent activity.'
    },
    { 
      name: 'Fake Bidding', 
      detected: fraudData.fakeBidding?.detected || false,
      severity: fraudData.fakeBidding?.severity || 0,
      description: fraudData.fakeBidding?.description || 'Creating artificial demand through fake bids.'
    }
  ];
  
  // Filter detected indicators
  const detectedIndicators = indicators.filter(indicator => indicator.detected);
  
  // Get severity color
  const getSeverityColor = (severity) => {
    if (severity <= 3) return 'bg-yellow-500';
    if (severity <= 7) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Get severity text
  const getSeverityText = (severity) => {
    if (severity <= 3) return 'Low';
    if (severity <= 7) return 'Medium';
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
        <FiAlertOctagon className="mr-2" /> Fraud Indicators
      </h2>
      
      {/* Fraud Status */}
      <div className="mb-6 flex items-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-800 mr-4">
          {detectedIndicators.length > 0 ? (
            <FiAlertOctagon className="text-red-500 text-2xl" />
          ) : (
            <FiShield className="text-green-500 text-2xl" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium">
            {detectedIndicators.length > 0 ? (
              <span className="text-red-400">Potential fraud detected</span>
            ) : (
              <span className="text-green-400">No fraud indicators detected</span>
            )}
          </h3>
          <p className="text-sm text-gray-400">
            {detectedIndicators.length > 0 
              ? `${detectedIndicators.length} out of ${indicators.length} indicators flagged` 
              : 'All checks passed'}
          </p>
        </div>
      </div>
      
      {/* Indicators List */}
      <div className="space-y-3">
        {indicators.map((indicator, index) => (
          <motion.div 
            key={index}
            className={`p-3 rounded-lg ${indicator.detected ? 'bg-gray-800 bg-opacity-70' : 'bg-gray-800 bg-opacity-30'}`}
            custom={index}
            variants={itemVariants}
          >
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                {indicator.detected ? (
                  <FiXCircle className="text-red-400 mr-2" />
                ) : (
                  <FiCheckCircle className="text-green-400 mr-2" />
                )}
                <span className={`font-medium ${indicator.detected ? 'text-white' : 'text-gray-400'}`}>
                  {indicator.name}
                </span>
              </div>
              {indicator.detected && (
                <span className="text-xs px-2 py-1 rounded-full bg-opacity-20 font-medium" 
                  style={{ backgroundColor: getSeverityColor(indicator.severity), opacity: 0.2 }}>
                  {getSeverityText(indicator.severity)} Severity
                </span>
              )}
            </div>
            
            {indicator.detected && (
              <div className="mt-2">
                <p className="text-sm text-gray-400">{indicator.description}</p>
                {indicator.severity > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Severity</span>
                      <span>{indicator.severity}/10</span>
                    </div>
                    <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${getSeverityColor(indicator.severity)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${indicator.severity * 10}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Recommendations */}
      {fraudData.recommendations && fraudData.recommendations.length > 0 && (
        <motion.div 
          className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg border-l-2 border-cyan-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-sm text-cyan-400 mb-2">Recommendations</h3>
          <ul className="space-y-2">
            {fraudData.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start">
                <span className="text-cyan-400 mr-2">•</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FraudIndicatorsCard;