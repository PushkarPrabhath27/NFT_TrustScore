/**
 * Environment Configuration Example
 * Copy this file to environment.js and customize as needed
 */

export const ENVIRONMENT_CONFIG = {
  // Backend Configuration
  BACKEND: {
    // Base URL for backend server (without port)
    BASE_URL: process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost',
    
    // List of ports to check for backend (can be overridden by env var)
    PORTS: process.env.REACT_APP_BACKEND_PORTS 
      ? JSON.parse(process.env.REACT_APP_BACKEND_PORTS)
      : [3001, 3000, 3002, 3003, 5000, 8000, 8080, 4000, 5001, 3004, 3005],
    
    // Health check endpoint path
    HEALTH_ENDPOINT: process.env.REACT_APP_BACKEND_HEALTH_ENDPOINT || '/api/health',
    
    // Discovery timeout (in milliseconds)
    DISCOVERY_TIMEOUT: parseInt(process.env.REACT_APP_BACKEND_DISCOVERY_TIMEOUT) || 10000,
    
    // Port check timeout (in milliseconds)
    PORT_TIMEOUT: parseInt(process.env.REACT_APP_BACKEND_PORT_TIMEOUT) || 2000,
    
    // Cache time for discovered backend URL (in milliseconds)
    CACHE_TIME: parseInt(process.env.REACT_APP_BACKEND_CACHE_TIME) || 30000
  },
  
  // Development Configuration
  DEVELOPMENT: {
    // Enable detailed logging
    DEBUG_MODE: process.env.REACT_APP_DEBUG_MODE === 'true',
    
    // Show backend status indicator
    SHOW_BACKEND_STATUS: process.env.REACT_APP_SHOW_BACKEND_STATUS !== 'false',
    
    // Enable performance monitoring
    ENABLE_PERFORMANCE_MONITORING: process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING === 'true'
  },
  
  // API Configuration
  API: {
    // Request timeout (in milliseconds)
    TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
    
    // Number of retry attempts
    RETRY_ATTEMPTS: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS) || 3,
    
    // Retry delay (in milliseconds)
    RETRY_DELAY: parseInt(process.env.REACT_APP_API_RETRY_DELAY) || 1000
  }
};

export default ENVIRONMENT_CONFIG;
