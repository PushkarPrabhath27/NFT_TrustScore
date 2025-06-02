import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiBarChart2, FiAlertTriangle, FiDatabase, FiClock, FiMenu, FiX } from 'react-icons/fi';
import { 
  useStore, 
  useStoreActions 
} from '../../store/store';

const Sidebar = () => {
  const { sidebarCollapsed, nftData, trustScoreData } = useStore();
  const { toggleSidebar } = useStoreActions();

  const sidebarVariants = {
    expanded: { width: '240px' },
    collapsed: { width: '70px' },
  };

  const navItems = [
    { icon: <FiHome />, text: 'Dashboard', path: '/' },
    { icon: <FiBarChart2 />, text: 'Analytics', path: '/analytics' },
    { icon: <FiAlertTriangle />, text: 'Risk Assessment', path: '/risk' },
    { icon: <FiDatabase />, text: 'Data Explorer', path: '/explorer' },
    { icon: <FiClock />, text: 'History', path: '/history' },
  ];

  return (
    <motion.div
      className="fixed left-0 top-16 bottom-0 bg-cyber-dark glass z-40 overflow-hidden"
      variants={sidebarVariants}
      initial={sidebarCollapsed ? 'collapsed' : 'expanded'}
      animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="h-full flex flex-col justify-between py-4">
        <div>
          {/* Toggle Button */}
          <div className="px-4 mb-6 flex justify-end">
            <motion.button
              onClick={toggleSidebar}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full hover:bg-cyber-light transition-colors"
            >
              {sidebarCollapsed ? <FiMenu className="text-electric-blue" /> : <FiX className="text-electric-blue" />}
            </motion.button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${isActive ? 'bg-cyber-light neon-border-blue' : 'hover:bg-cyber-gray'}`
                }
              >
                <div className="text-xl text-electric-blue">{item.icon}</div>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {item.text}
                  </motion.span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Quick Stats */}
        {!sidebarCollapsed && nftData && trustScoreData && (
          <motion.div
            className="mt-auto mx-3 p-3 rounded-lg glass"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold mb-2 text-gray-400">QUICK STATS</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs">Trust Score</span>
                <span className="text-xs font-bold neon-text-blue">{trustScoreData.score}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Risk Level</span>
                <span className="text-xs font-bold neon-text-green">{nftData.riskLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs">Last Updated</span>
                <span className="text-xs font-bold">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;