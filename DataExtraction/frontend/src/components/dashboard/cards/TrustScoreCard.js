import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const TrustScoreCard = ({ trustScoreData }) => {
  if (!trustScoreData) return null;
  
  const score = trustScoreData.score || 0;
  const factors = trustScoreData.factors || [];
  
  // Determine score color and status
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getScoreStatus = (score) => {
    if (score >= 80) return { text: 'Excellent', icon: <FiCheckCircle className="text-green-400" /> };
    if (score >= 60) return { text: 'Good', icon: <FiCheckCircle className="text-blue-400" /> };
    if (score >= 40) return { text: 'Fair', icon: <FiAlertCircle className="text-yellow-400" /> };
    return { text: 'Poor', icon: <FiAlertCircle className="text-red-400" /> };
  };
  
  const scoreStatus = getScoreStatus(score);
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const scoreCircleVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        delay: 0.3, 
        duration: 0.8,
        type: 'spring',
        stiffness: 100 
      } 
    }
  };
  
  const factorVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: i => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.5 + (i * 0.1),
        duration: 0.5
      }
    })
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-neon-blue overflow-hidden relative"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-xl font-orbitron text-cyan-400 mb-4 flex items-center">
        <FiShield className="mr-2" /> Trust Score Analysis
      </h2>
      
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Score Circle */}
        <motion.div 
          className="relative flex-shrink-0"
          variants={scoreCircleVariants}
        >
          <div className="w-32 h-32 rounded-full border-4 border-gray-700 flex items-center justify-center bg-gray-800 shadow-neon-blue">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
          </div>
          <div className="absolute -bottom-2 left-0 right-0 text-center">
            <span className="bg-gray-800 px-3 py-1 rounded-full text-sm font-medium flex items-center justify-center mx-auto w-max">
              {scoreStatus.icon}
              <span className="ml-1">{scoreStatus.text}</span>
            </span>
          </div>
        </motion.div>
        
        {/* Factors */}
        <div className="flex-grow">
          <h3 className="text-sm text-gray-400 mb-2">Key Factors</h3>
          <div className="space-y-2">
            {factors.length > 0 ? (
              factors.map((factor, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center justify-between bg-gray-800 bg-opacity-50 p-2 rounded"
                  custom={index}
                  variants={factorVariants}
                >
                  <span className="text-sm text-gray-300">{factor.name}</span>
                  <span className={`text-sm font-medium ${factor.impact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {factor.impact > 0 ? '+' : ''}{factor.impact}
                  </span>
                </motion.div>
              ))
            ) : (
              <motion.div 
                className="text-sm text-gray-400 italic"
                variants={factorVariants}
                custom={0}
              >
                No factor data available
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recommendation */}
      {trustScoreData.recommendation && (
        <motion.div 
          className="mt-4 p-3 bg-gray-800 bg-opacity-50 rounded border-l-2 border-cyan-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-sm text-cyan-400 mb-1">Recommendation</h3>
          <p className="text-sm text-gray-300">{trustScoreData.recommendation}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TrustScoreCard;