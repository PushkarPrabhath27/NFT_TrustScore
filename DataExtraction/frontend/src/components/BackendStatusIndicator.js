/**
 * Backend Status Indicator Component
 * Provides visual feedback about backend connection status
 * Shows discovery progress, connection status, and error messages
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Error, 
  Warning, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Info
} from 'lucide-react';
import dynamicApiService from '../services/DynamicApiService.js';

const BackendStatusIndicator = ({ 
  showDetails = false, 
  onStatusChange = null,
  className = '' 
}) => {
  const [status, setStatus] = useState('unknown');
  const [message, setMessage] = useState('');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [backendURL, setBackendURL] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const statusConfig = {
    connected: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      message: 'Backend connected'
    },
    disconnected: {
      icon: WifiOff,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      message: 'Backend disconnected'
    },
    discovering: {
      icon: RefreshCw,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      message: 'Searching for backend...'
    },
    error: {
      icon: Error,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      message: 'Connection error'
    },
    unknown: {
      icon: Info,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      message: 'Status unknown'
    }
  };

  const checkBackendStatus = async () => {
    try {
      setIsDiscovering(true);
      setStatus('discovering');
      setMessage('Searching for backend server...');
      
      // Get service status
      const serviceStatus = dynamicApiService.getServiceStatus();
      setBackendURL(serviceStatus.baseURL);
      
      // Try to check health
      await dynamicApiService.checkHealth();
      
      setStatus('connected');
      setMessage(`Connected to ${serviceStatus.baseURL}`);
      setErrorDetails(null);
      setLastCheck(new Date());
      
      if (onStatusChange) {
        onStatusChange('connected', serviceStatus.baseURL);
      }
    } catch (error) {
      console.error('[BackendStatusIndicator] Backend check failed:', error);
      
      setStatus('error');
      setMessage('Backend not reachable');
      setErrorDetails({
        message: error.message,
        timestamp: new Date(),
        serviceStatus: dynamicApiService.getServiceStatus()
      });
      setLastCheck(new Date());
      
      if (onStatusChange) {
        onStatusChange('error', null, error);
      }
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleRetry = () => {
    dynamicApiService.clearAllCaches();
    checkBackendStatus();
  };

  const handleRefresh = () => {
    checkBackendStatus();
  };

  useEffect(() => {
    // Initial check
    checkBackendStatus();
    
    // Set up periodic checks every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const currentConfig = statusConfig[status];
  const IconComponent = currentConfig.icon;

  return (
    <div className={`backend-status-indicator ${className}`}>
      <motion.div
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border
          ${currentConfig.bgColor} ${currentConfig.borderColor}
          transition-all duration-200
        `}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={`${currentConfig.color}`}
          animate={isDiscovering ? { rotate: 360 } : { rotate: 0 }}
          transition={isDiscovering ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        >
          <IconComponent size={16} />
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${currentConfig.color}`}>
            {currentConfig.message}
          </p>
          {backendURL && (
            <p className="text-xs text-gray-600 truncate">
              {backendURL}
            </p>
          )}
          {lastCheck && (
            <p className="text-xs text-gray-500">
              Last checked: {lastCheck.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            onClick={handleRefresh}
            className="p-1 rounded hover:bg-white/50 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={isDiscovering}
          >
            <RefreshCw 
              size={14} 
              className={`${isDiscovering ? 'animate-spin' : ''} ${currentConfig.color}`}
            />
          </motion.button>
          
          {status === 'error' && (
            <motion.button
              onClick={handleRetry}
              className="p-1 rounded hover:bg-white/50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wifi size={14} className={currentConfig.color} />
            </motion.button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetails && errorDetails && (
          <motion.div
            className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-2">
              <Warning size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Connection Error Details
                </h4>
                <p className="text-xs text-red-700 mb-2">
                  {errorDetails.message}
                </p>
                <div className="text-xs text-red-600 space-y-1">
                  <p>Timestamp: {errorDetails.timestamp.toLocaleString()}</p>
                  <p>Checked ports: {errorDetails.serviceStatus.discoveryStatus.config.ports.join(', ')}</p>
                  <p>Base URL: {errorDetails.serviceStatus.discoveryStatus.config.baseURL}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BackendStatusIndicator;
