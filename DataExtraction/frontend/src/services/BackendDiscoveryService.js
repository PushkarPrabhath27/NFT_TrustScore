/**
 * Backend Discovery Service
 * Handles dynamic detection of backend server port and URL
 * Provides fallback mechanism when backend runs on different ports
 */

import { getBackendConfig } from '../config/backendConfig.js';
import logger from '../utils/Logger.js';

class BackendDiscoveryService {
  constructor() {
    this.config = getBackendConfig();
    this.discoveredURL = null;
    this.isDiscovering = false;
    this.discoveryPromise = null;
    this.lastDiscoveryTime = null;
    this.discoveryCacheTime = 30000; // Cache for 30 seconds
  }

  /**
   * Discovers the backend URL by checking multiple ports
   * @returns {Promise<string>} The working backend URL
   */
  async discoverBackendURL() {
    // Return cached result if still valid
    if (this.discoveredURL && this.isCacheValid()) {
      const cacheAge = Date.now() - this.lastDiscoveryTime;
      logger.logCacheHit(this.discoveredURL, cacheAge);
      return this.discoveredURL;
    }

    // Log cache miss reason
    if (!this.discoveredURL) {
      logger.logCacheMiss('No cached URL');
    } else {
      const cacheAge = Date.now() - this.lastDiscoveryTime;
      logger.logCacheMiss(`Cache expired (age: ${cacheAge}ms)`);
    }

    // Return existing promise if discovery is in progress
    if (this.isDiscovering && this.discoveryPromise) {
      logger.debug('Discovery already in progress, waiting...');
      return this.discoveryPromise;
    }

    // Start new discovery
    this.isDiscovering = true;
    this.discoveryPromise = this.performDiscovery();
    
    try {
      const result = await this.discoveryPromise;
      this.discoveredURL = result;
      this.lastDiscoveryTime = Date.now();
      return result;
    } finally {
      this.isDiscovering = false;
      this.discoveryPromise = null;
    }
  }

  /**
   * Performs the actual port discovery
   * @returns {Promise<string>} The working backend URL
   */
  async performDiscovery() {
    logger.logDiscoveryStart(this.config.PORTS);
    logger.logConfiguration(this.config);

    const timer = logger.createTimer('Backend Discovery');
    const promises = this.config.PORTS.map(port => 
      this.checkPort(port, this.config.PORT_CHECK_TIMEOUT)
    );

    try {
      // Race all port checks - first successful response wins
      const result = await Promise.race(promises);
      const discoveryTime = timer.end({ discoveredURL: result });
      
      logger.logDiscoveryComplete(result, discoveryTime);
      return result;
    } catch (error) {
      const discoveryTime = timer.end({ error: error.message });
      
      logger.logDiscoveryFailure(this.config.PORTS, discoveryTime);
      throw new Error(`Backend not found on any of the checked ports: ${this.config.PORTS.join(', ')}. Please ensure the backend server is running.`);
    }
  }

  /**
   * Checks if a specific port is responding
   * @param {number} port - Port to check
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<string>} The working URL if successful
   */
  async checkPort(port, timeout) {
    const url = `${this.config.BASE_URL}:${port}${this.config.HEALTH_ENDPOINT}`;
    const startTime = Date.now();
    
    logger.logPortCheck(port, url);
    
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        const responseTime = Date.now() - startTime;
        logger.logPortFailure(port, new Error('timeout'), responseTime);
        reject(new Error(`Port ${port} timeout`));
      }, timeout);

      fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
      .then(response => {
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          logger.logPortSuccess(port, url, responseTime);
          resolve(`${this.config.BASE_URL}:${port}`);
        } else {
          logger.logPortFailure(port, new Error(`HTTP ${response.status}`), responseTime);
          reject(new Error(`Port ${port} returned ${response.status}`));
        }
      })
      .catch(error => {
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        if (error.name === 'AbortError') {
          logger.logPortFailure(port, new Error('timeout'), responseTime);
          reject(new Error(`Port ${port} timeout`));
        } else {
          logger.logPortFailure(port, error, responseTime);
          reject(error);
        }
      });
    });
  }

  /**
   * Checks if the cached discovery result is still valid
   * @returns {boolean} True if cache is valid
   */
  isCacheValid() {
    if (!this.lastDiscoveryTime) return false;
    return (Date.now() - this.lastDiscoveryTime) < this.discoveryCacheTime;
  }

  /**
   * Clears the discovery cache, forcing a new discovery on next call
   */
  clearCache() {
    logger.info('Clearing discovery cache');
    this.discoveredURL = null;
    this.lastDiscoveryTime = null;
  }

  /**
   * Gets the current discovered URL without triggering a new discovery
   * @returns {string|null} The current discovered URL or null
   */
  getCurrentURL() {
    return this.discoveredURL;
  }

  /**
   * Checks if the backend is currently reachable
   * @returns {Promise<boolean>} True if backend is reachable
   */
  async isBackendReachable() {
    if (!this.discoveredURL) return false;

    try {
      const response = await fetch(`${this.discoveredURL}${this.config.HEALTH_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      return response.ok;
    } catch (error) {
      console.warn('[BackendDiscovery] Backend reachability check failed:', error.message);
      return false;
    }
  }

  /**
   * Gets detailed discovery status for debugging
   * @returns {object} Discovery status information
   */
  getDiscoveryStatus() {
    return {
      discoveredURL: this.discoveredURL,
      isDiscovering: this.isDiscovering,
      lastDiscoveryTime: this.lastDiscoveryTime,
      cacheValid: this.isCacheValid(),
      config: {
        baseURL: this.config.BASE_URL,
        ports: this.config.PORTS,
        healthEndpoint: this.config.HEALTH_ENDPOINT,
        timeout: this.config.PORT_CHECK_TIMEOUT
      }
    };
  }
}

// Export singleton instance
const backendDiscoveryService = new BackendDiscoveryService();
export default backendDiscoveryService;
