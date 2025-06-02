import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-cyber-black flex flex-col items-center justify-center z-50">
      <motion.div
        className="w-32 h-32 relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        {/* Outer ring */}
        <motion.div 
          className="absolute inset-0 border-4 border-transparent border-t-electric-blue border-r-neon-purple rounded-full"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Middle ring */}
        <motion.div 
          className="absolute inset-4 border-4 border-transparent border-t-neon-purple border-r-neon-green rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner ring */}
        <motion.div 
          className="absolute inset-8 border-4 border-transparent border-t-neon-green border-r-electric-blue rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Center dot */}
        <motion.div 
          className="absolute inset-0 m-auto w-4 h-4 bg-white rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      
      <motion.h1 
        className="mt-8 text-2xl font-bold neon-text-blue"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        NFT TrustScore Analyzer
      </motion.h1>
      
      <motion.div
        className="mt-4 flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div 
          className="w-3 h-3 rounded-full bg-electric-blue"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="w-3 h-3 rounded-full bg-neon-purple"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.div 
          className="w-3 h-3 rounded-full bg-neon-green"
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
      </motion.div>
      
      <motion.p
        className="mt-4 text-gray-400 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Initializing Hathor Blockchain Connection...
      </motion.p>
    </div>
  );
};

export default LoadingScreen;