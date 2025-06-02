import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiMoon, FiSun, FiZap, FiEye, FiBarChart2 } from 'react-icons/fi';
import { 
  useDarkMode, 
  useAnimationsEnabled, 
  useVisualizationType,
  useStoreActions
} from '../../store/store';

const SettingsPanel = ({ isOpen, onClose }) => {
  const darkMode = useDarkMode();
  const animationsEnabled = useAnimationsEnabled();
  const visualizationType = useVisualizationType();
  const { 
    toggleDarkMode, 
    toggleAnimations,
    setVisualizationType 
  } = useStoreActions();

  const panelVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const visualizationOptions = [
    { id: 'default', name: 'Default', icon: <FiBarChart2 /> },
    { id: '3d', name: '3D Charts', icon: <FiEye /> },
    { id: 'minimal', name: 'Minimal', icon: <FiZap /> }
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />

      {/* Settings Panel */}
      <motion.div
        className="fixed right-0 top-0 bottom-0 w-80 bg-cyber-dark glass z-50 p-6 overflow-y-auto"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold neon-text-blue">Settings</h2>
          <motion.button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cyber-light transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX className="text-electric-blue" />
          </motion.button>
        </div>

        <div className="space-y-6">
          {/* Theme Toggle */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400">APPEARANCE</h3>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {darkMode ? <FiMoon className="text-blue-300" /> : <FiSun className="text-yellow-300" />}
                <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full flex items-center transition-colors ${darkMode ? 'bg-electric-blue' : 'bg-gray-600'}`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-md"
                  animate={{ x: darkMode ? 26 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          {/* Animations Toggle */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400">ANIMATIONS</h3>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FiZap className="text-yellow-300" />
                <span>Enable Animations</span>
              </div>
              <button
                onClick={toggleAnimations}
                className={`w-12 h-6 rounded-full flex items-center transition-colors ${animationsEnabled ? 'bg-electric-blue' : 'bg-gray-600'}`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-md"
                  animate={{ x: animationsEnabled ? 26 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          {/* Visualization Type */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-400">VISUALIZATION STYLE</h3>
            <div className="grid grid-cols-3 gap-2">
              {visualizationOptions.map((option) => (
                <motion.button
                  key={option.id}
                  className={`p-3 rounded-lg flex flex-col items-center justify-center space-y-1 ${visualizationType === option.id ? 'neon-border-blue bg-cyber-light' : 'border border-gray-700 hover:border-electric-blue'}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setVisualizationType(option.id)}
                >
                  <div className={`text-xl ${visualizationType === option.id ? 'text-electric-blue' : 'text-gray-400'}`}>
                    {option.icon}
                  </div>
                  <span className="text-xs">{option.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4">
            <motion.button
              className="w-full py-2 px-4 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reset All Settings
            </motion.button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            NFT TrustScore Analyzer v1.0.0<br />
            Powered by Hathor Blockchain
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default SettingsPanel;