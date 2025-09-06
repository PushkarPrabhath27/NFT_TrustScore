/**
 * Backend Configuration for Dynamic Port Detection
 * This configuration defines the ports to check when looking for the backend server
 */

// Default backend configuration
export const BACKEND_CONFIG = {
  // Base URL for local development
  BASE_URL: process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost',
  
  // List of ports to check in order of preference
  // These are common ports used by Node.js/Express applications
  // Note: Port 3000 is excluded as it's typically used by React dev server
  PORTS: process.env.REACT_APP_BACKEND_PORTS 
    ? JSON.parse(process.env.REACT_APP_BACKEND_PORTS)
    : [
        3001, // Default port for this project
        3002, // Next available if 3001 is taken
        3003, // Next available if 3002 is taken
        5000, // Common Express.js port
        8000, // Common alternative port
        8080, // Common web server port
        4000, // Common GraphQL server port
        5001, // Alternative Express port
        3004, // Additional fallback
        3005, // Additional fallback
        3006  // Additional fallback
      ],
  
  // Health check endpoint path
  HEALTH_ENDPOINT: process.env.REACT_APP_BACKEND_HEALTH_ENDPOINT || '/api/health',
  
  // Timeout for each port check (in milliseconds)
  PORT_CHECK_TIMEOUT: parseInt(process.env.REACT_APP_BACKEND_PORT_TIMEOUT) || 2000,
  
  // Maximum time to wait for all port checks (in milliseconds)
  MAX_DETECTION_TIME: parseInt(process.env.REACT_APP_BACKEND_DISCOVERY_TIMEOUT) || 10000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 500,
  
  // Cache time for discovered backend URL (in milliseconds)
  CACHE_TIME: parseInt(process.env.REACT_APP_BACKEND_CACHE_TIME) || 30000
};

// Environment-specific overrides
export const getBackendConfig = () => {
  const config = { ...BACKEND_CONFIG };
  
  // Override with environment variables if available
  if (process.env.REACT_APP_BACKEND_BASE_URL) {
    config.BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
  }
  
  if (process.env.REACT_APP_BACKEND_PORTS) {
    try {
      const customPorts = JSON.parse(process.env.REACT_APP_BACKEND_PORTS);
      if (Array.isArray(customPorts)) {
        config.PORTS = customPorts;
      }
    } catch (error) {
      console.warn('Invalid REACT_APP_BACKEND_PORTS format, using default ports');
    }
  }
  
  if (process.env.REACT_APP_BACKEND_HEALTH_ENDPOINT) {
    config.HEALTH_ENDPOINT = process.env.REACT_APP_BACKEND_HEALTH_ENDPOINT;
  }
  
  return config;
};

export default BACKEND_CONFIG;
