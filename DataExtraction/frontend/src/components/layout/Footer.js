import React from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiInfo } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer 
      className="py-6 px-4 bg-cyber-dark/80 backdrop-blur-md border-t border-cyber-light/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <motion.p 
              className="text-sm text-gray-400"
              whileHover={{ color: '#00FFFF' }}
            >
              © {currentYear} NFT TrustScore Analyzer. All rights reserved.
            </motion.p>
          </div>
          
          <div className="flex space-x-4">
            <motion.a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-electric-blue transition-colors duration-300"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiGithub size={20} />
            </motion.a>
            <motion.a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-electric-blue transition-colors duration-300"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiTwitter size={20} />
            </motion.a>
            <motion.a 
              href="/about" 
              className="text-gray-400 hover:text-electric-blue transition-colors duration-300"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiInfo size={20} />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;