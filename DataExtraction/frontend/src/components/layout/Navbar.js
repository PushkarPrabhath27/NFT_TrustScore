import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSettings, FiSearch, FiMoon, FiSun } from 'react-icons/fi';
import { useDarkMode, useStoreActions } from '../../store/store';

const Navbar = ({ toggleSettings }) => {
  const darkMode = useDarkMode();
  const { toggleDarkMode } = useStoreActions();
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 glass ${scrolled ? 'shadow-lg' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-r from-electric-blue to-neon-purple flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            >
              <span className="text-white font-bold text-xl">N</span>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold neon-text-blue">NFT TrustScore</h1>
              <p className="text-xs text-gray-400">Powered by Hathor Blockchain</p>
            </div>
          </Link>

          {/* Center - Time and Status */}
          <div className="hidden md:flex flex-col items-center">
            <div className="text-sm text-gray-400">SYSTEM STATUS: ONLINE</div>
            <div className="text-xl neon-text-green font-mono">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-4">
            <motion.button
              className="p-2 rounded-full hover:bg-cyber-light transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
            >
              {darkMode ? <FiSun className="text-yellow-300" /> : <FiMoon className="text-blue-300" />}
            </motion.button>

            <motion.button
              className="p-2 rounded-full hover:bg-cyber-light transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiSearch className="text-electric-blue" />
            </motion.button>

            <motion.button
              className="p-2 rounded-full hover:bg-cyber-light transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSettings}
            >
              <FiSettings className="text-electric-blue" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;