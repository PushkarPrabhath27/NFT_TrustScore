/**
 * Backend Error Boundary Component
 * Catches and handles backend connection errors gracefully
 * Provides user-friendly error messages and recovery options
 */

import React, { Component } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Settings,
  HelpCircle
} from 'lucide-react';
import dynamicApiService from '../services/DynamicApiService.js';

class BackendErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      maxRetries: 3,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    // Check if this is a backend connection error
    const isBackendError = error.message && (
      error.message.includes('fetch') ||
      error.message.includes('Backend not found') ||
      error.message.includes('Unable to connect') ||
      error.message.includes('ERR_CONNECTION_REFUSED') ||
      error.message.includes('ERR_NETWORK')
    );

    if (isBackendError) {
      return {
        hasError: true,
        error: error,
        retryCount: 0
      };
    }

    // Let other errors bubble up
    return null;
  }

  componentDidCatch(error, errorInfo) {
    console.error('[BackendErrorBoundary] Caught error:', error);
    console.error('[BackendErrorBoundary] Error info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log error for debugging
    this.logError(error, errorInfo);
  }

  logError = (error, errorInfo) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      errorInfo: errorInfo,
      userAgent: navigator.userAgent,
      url: window.location.href,
      backendStatus: dynamicApiService.getServiceStatus()
    };

    console.error('[BackendErrorBoundary] Error log:', errorLog);
    
    // In a real application, you might want to send this to an error reporting service
    // Example: errorReportingService.logError(errorLog);
  };

  handleRetry = async () => {
    if (this.state.isRetrying) return;

    this.setState({ isRetrying: true });

    try {
      // Clear all caches and force fresh discovery
      dynamicApiService.clearAllCaches();
      
      // Wait a moment for the service to reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to discover backend again
      await dynamicApiService.discoverBackendURL();
      
      // If successful, reset error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: 0,
        isRetrying: false
      });
      
      console.log('[BackendErrorBoundary] Retry successful, backend discovered');
    } catch (retryError) {
      console.error('[BackendErrorBoundary] Retry failed:', retryError);
      
      this.setState(prevState => ({
        retryCount: prevState.retryCount + 1,
        isRetrying: false,
        error: retryError
      }));
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleOpenSettings = () => {
    // In a real application, you might open a settings modal or navigate to settings
    console.log('[BackendErrorBoundary] Opening settings...');
    // Example: this.props.onOpenSettings?.();
  };

  getErrorType = () => {
    const { error } = this.state;
    if (!error) return 'unknown';

    const message = error.message.toLowerCase();
    
    if (message.includes('backend not found') || message.includes('no backend found')) {
      return 'not_found';
    } else if (message.includes('timeout') || message.includes('timed out')) {
      return 'timeout';
    } else if (message.includes('connection refused') || message.includes('err_connection_refused')) {
      return 'connection_refused';
    } else if (message.includes('network') || message.includes('err_network')) {
      return 'network';
    } else {
      return 'unknown';
    }
  };

  getErrorMessage = () => {
    const errorType = this.getErrorType();
    const { retryCount, maxRetries } = this.state;

    const messages = {
      not_found: {
        title: 'Backend Server Not Found',
        description: 'The backend server is not running or not accessible on any of the expected ports.',
        suggestion: 'Please ensure the backend server is running and try again.'
      },
      timeout: {
        title: 'Connection Timeout',
        description: 'The backend server is taking too long to respond.',
        suggestion: 'The server might be overloaded. Please try again in a moment.'
      },
      connection_refused: {
        title: 'Connection Refused',
        description: 'The backend server is not accepting connections.',
        suggestion: 'Please check if the backend server is running and accessible.'
      },
      network: {
        title: 'Network Error',
        description: 'There was a problem with your network connection.',
        suggestion: 'Please check your internet connection and try again.'
      },
      unknown: {
        title: 'Backend Connection Error',
        description: 'An unexpected error occurred while connecting to the backend.',
        suggestion: 'Please try refreshing the page or contact support if the problem persists.'
      }
    };

    return messages[errorType] || messages.unknown;
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { retryCount, maxRetries, isRetrying } = this.state;
    const errorMessage = this.getErrorMessage();
    const canRetry = retryCount < maxRetries;

    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gray-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <motion.div
            className="text-center mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {errorMessage.title}
            </h1>
            <p className="text-gray-600 mb-4">
              {errorMessage.description}
            </p>
            <p className="text-sm text-gray-500">
              {errorMessage.suggestion}
            </p>
          </motion.div>

          <div className="space-y-3">
            {canRetry && (
              <motion.button
                onClick={this.handleRetry}
                disabled={isRetrying}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : `Retry (${retryCount}/${maxRetries})`}
              </motion.button>
            )}

            <motion.button
              onClick={this.handleRefresh}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Page
            </motion.button>

            <motion.button
              onClick={this.handleOpenSettings}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </motion.button>
          </div>

          {retryCount >= maxRetries && (
            <motion.div
              className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Maximum retry attempts reached</p>
                  <p className="text-yellow-700">
                    Please check if the backend server is running or contact support.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-4 text-center">
            <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 mx-auto">
              <HelpCircle className="w-4 h-4" />
              Need help?
            </button>
          </div>
        </div>
      </motion.div>
    );
  }
}

export default BackendErrorBoundary;
