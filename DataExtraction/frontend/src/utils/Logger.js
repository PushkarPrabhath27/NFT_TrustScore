/**
 * Enhanced Logging Utility for Backend Discovery
 * Provides structured logging with different levels and formatting
 */

class Logger {
  constructor() {
    this.isDebugMode = process.env.REACT_APP_DEBUG_MODE === 'true';
    this.logLevel = process.env.REACT_APP_LOG_LEVEL || 'info';
    this.showTimestamps = process.env.REACT_APP_LOG_TIMESTAMPS !== 'false';
    this.colors = {
      debug: '#6B7280',
      info: '#3B82F6',
      warn: '#F59E0B',
      error: '#EF4444',
      success: '#10B981'
    };
  }

  /**
   * Formats log message with timestamp and level
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {object} data - Additional data
   * @returns {string} Formatted log message
   */
  formatMessage(level, message, data = null) {
    const timestamp = this.showTimestamps ? new Date().toISOString() : '';
    const prefix = `[BackendDiscovery:${level.toUpperCase()}]`;
    const dataStr = data ? ` ${JSON.stringify(data, null, 2)}` : '';
    
    return `${timestamp} ${prefix} ${message}${dataStr}`;
  }

  /**
   * Logs debug information (only in debug mode)
   * @param {string} message - Debug message
   * @param {object} data - Additional data
   */
  debug(message, data = null) {
    if (this.isDebugMode && this.shouldLog('debug')) {
      const formatted = this.formatMessage('debug', message, data);
      console.log(`%c${formatted}`, `color: ${this.colors.debug}`);
    }
  }

  /**
   * Logs general information
   * @param {string} message - Info message
   * @param {object} data - Additional data
   */
  info(message, data = null) {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('info', message, data);
      console.log(`%c${formatted}`, `color: ${this.colors.info}`);
    }
  }

  /**
   * Logs warning messages
   * @param {string} message - Warning message
   * @param {object} data - Additional data
   */
  warn(message, data = null) {
    if (this.shouldLog('warn')) {
      const formatted = this.formatMessage('warn', message, data);
      console.warn(`%c${formatted}`, `color: ${this.colors.warn}`);
    }
  }

  /**
   * Logs error messages
   * @param {string} message - Error message
   * @param {object} data - Additional data
   */
  error(message, data = null) {
    if (this.shouldLog('error')) {
      const formatted = this.formatMessage('error', message, data);
      console.error(`%c${formatted}`, `color: ${this.colors.error}`);
    }
  }

  /**
   * Logs success messages
   * @param {string} message - Success message
   * @param {object} data - Additional data
   */
  success(message, data = null) {
    if (this.shouldLog('info')) {
      const formatted = this.formatMessage('success', message, data);
      console.log(`%c${formatted}`, `color: ${this.colors.success}`);
    }
  }

  /**
   * Determines if a log level should be output
   * @param {string} level - Log level to check
   * @returns {boolean} True if should log
   */
  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Logs discovery start
   * @param {Array} ports - Ports to check
   */
  logDiscoveryStart(ports) {
    this.info('Starting backend discovery', {
      ports: ports,
      baseURL: 'http://localhost',
      timeout: '2000ms per port'
    });
  }

  /**
   * Logs port check attempt
   * @param {number} port - Port being checked
   * @param {string} url - Full URL being checked
   */
  logPortCheck(port, url) {
    this.debug(`Checking port ${port}`, { url });
  }

  /**
   * Logs successful port discovery
   * @param {number} port - Port that responded
   * @param {string} url - Full URL that worked
   * @param {number} responseTime - Response time in ms
   */
  logPortSuccess(port, url, responseTime) {
    this.success(`Port ${port} is responding`, {
      url,
      responseTime: `${responseTime}ms`
    });
  }

  /**
   * Logs port check failure
   * @param {number} port - Port that failed
   * @param {string} error - Error message
   * @param {number} responseTime - Response time in ms
   */
  logPortFailure(port, error, responseTime) {
    this.debug(`Port ${port} failed`, {
      error: error.message || error,
      responseTime: `${responseTime}ms`
    });
  }

  /**
   * Logs discovery completion
   * @param {string} discoveredURL - URL that was discovered
   * @param {number} totalTime - Total discovery time in ms
   * @param {Array} failedPorts - Ports that failed
   */
  logDiscoveryComplete(discoveredURL, totalTime, failedPorts = []) {
    this.success('Backend discovery completed', {
      discoveredURL,
      totalTime: `${totalTime}ms`,
      failedPorts: failedPorts.length > 0 ? failedPorts : 'none'
    });
  }

  /**
   * Logs discovery failure
   * @param {Array} failedPorts - All ports that failed
   * @param {number} totalTime - Total discovery time in ms
   */
  logDiscoveryFailure(failedPorts, totalTime) {
    this.error('Backend discovery failed', {
      failedPorts,
      totalTime: `${totalTime}ms`,
      suggestion: 'Please ensure the backend server is running'
    });
  }

  /**
   * Logs cache hit
   * @param {string} url - Cached URL being used
   * @param {number} age - Age of cache in ms
   */
  logCacheHit(url, age) {
    this.debug('Using cached backend URL', {
      url,
      cacheAge: `${age}ms`
    });
  }

  /**
   * Logs cache miss
   * @param {string} reason - Reason for cache miss
   */
  logCacheMiss(reason) {
    this.debug('Cache miss, starting discovery', { reason });
  }

  /**
   * Logs API request
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {object} options - Request options
   */
  logApiRequest(method, url, options = {}) {
    this.debug('Making API request', {
      method,
      url,
      hasBody: !!options.body,
      headers: Object.keys(options.headers || {})
    });
  }

  /**
   * Logs API response
   * @param {string} url - Request URL
   * @param {number} status - Response status
   * @param {number} responseTime - Response time in ms
   */
  logApiResponse(url, status, responseTime) {
    const level = status >= 400 ? 'error' : 'success';
    this[level](`API response received`, {
      url,
      status,
      responseTime: `${responseTime}ms`
    });
  }

  /**
   * Logs API error
   * @param {string} url - Request URL
   * @param {Error} error - Error object
   * @param {number} responseTime - Response time in ms
   */
  logApiError(url, error, responseTime) {
    this.error('API request failed', {
      url,
      error: error.message,
      responseTime: `${responseTime}ms`,
      stack: error.stack
    });
  }

  /**
   * Logs retry attempt
   * @param {number} attempt - Current attempt number
   * @param {number} maxAttempts - Maximum attempts
   * @param {number} delay - Delay before retry in ms
   */
  logRetry(attempt, maxAttempts, delay) {
    this.warn(`Retrying request (${attempt}/${maxAttempts})`, {
      delay: `${delay}ms`
    });
  }

  /**
   * Logs service status
   * @param {object} status - Service status object
   */
  logServiceStatus(status) {
    this.info('Service status', {
      discoveredURL: status.discoveredURL,
      isDiscovering: status.isDiscovering,
      cacheValid: status.cacheValid,
      lastDiscovery: status.lastDiscoveryTime ? new Date(status.lastDiscoveryTime).toISOString() : 'never'
    });
  }

  /**
   * Logs configuration
   * @param {object} config - Configuration object
   */
  logConfiguration(config) {
    this.debug('Backend discovery configuration', {
      baseURL: config.BASE_URL,
      ports: config.PORTS,
      healthEndpoint: config.HEALTH_ENDPOINT,
      portTimeout: `${config.PORT_CHECK_TIMEOUT}ms`,
      discoveryTimeout: `${config.MAX_DETECTION_TIME}ms`,
      cacheTime: `${config.CACHE_TIME}ms`
    });
  }

  /**
   * Creates a performance timer
   * @param {string} operation - Operation name
   * @returns {object} Timer object with end() method
   */
  createTimer(operation) {
    const start = Date.now();
    
    return {
      end: (data = {}) => {
        const duration = Date.now() - start;
        this.debug(`Operation completed: ${operation}`, {
          ...data,
          duration: `${duration}ms`
        });
        return duration;
      }
    };
  }

  /**
   * Logs performance metrics
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in ms
   * @param {object} metrics - Additional metrics
   */
  logPerformance(operation, duration, metrics = {}) {
    this.debug(`Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...metrics
    });
  }
}

// Export singleton instance
const logger = new Logger();
export default logger;
