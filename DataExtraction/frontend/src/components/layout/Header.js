import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useDarkMode, useStoreActions } from '../../store/store';

const Header = () => {
  const darkMode = useDarkMode();
  const { toggleDarkMode } = useStoreActions();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md ${scrolled ? 'bg-cyber-black/80 shadow-lg shadow-electric-blue/10' : 'bg-transparent'} transition-all duration-300`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-r from-electric-blue to-neon-purple flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <span className="text-white font-bold text-xl">N</span>
            </motion.div>
            <motion.h1 
              className="text-xl md:text-2xl font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-electric-blue to-neon-purple"
              whileHover={{ scale: 1.05 }}
            >
              NFT TrustScore
            </motion.h1>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-electric-blue transition-colors duration-300">
              Home
            </Link>
            <Link to="/about" className="text-white hover:text-electric-blue transition-colors duration-300">
              About
            </Link>
            <Link to="/docs" className="text-white hover:text-electric-blue transition-colors duration-300">
              Documentation
            </Link>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-cyber-light transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <FiSun className="text-electric-blue text-xl" />
              ) : (
                <FiMoon className="text-neon-purple text-xl" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;