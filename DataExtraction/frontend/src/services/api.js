// API Service for NFT TrustScore Analyzer
// This service handles all API calls to the backend
// Now uses dynamic backend discovery for port flexibility

import dynamicApiService from './DynamicApiService.js';

const apiService = {
  /**
   * Fetches NFT data from the backend with optional section parameter
   * @param {string} contractAddress - The contract address to analyze
   * @returns {Promise} Promise that resolves with the NFT data
   */
  fetchNFTData: async (contractAddress) => {
    console.log('[API Service] Delegating to DynamicApiService for NFT data fetch');
    return await dynamicApiService.fetchNFTData(contractAddress);
  },
  
  /**
   * Checks the health of the API server
   * @returns {Promise} Promise that resolves with the health status
   */
  checkHealth: async () => {
    console.log('[API Service] Delegating to DynamicApiService for health check');
    return await dynamicApiService.checkHealth();
  },
  
  /**
   * Sets up a polling connection for real-time updates (WebSocket alternative)
   * @param {Function} onMessage - Callback function to handle incoming messages
   * @param {string} contractAddress - The contract address to analyze
   * @returns {Object} Connection object and cleanup function
   */
  setupPollingConnection: (onMessage, contractAddress) => {
    try {
      console.log(`[Polling] Setting up connection with dynamic backend discovery`);
      
      // State variables
      let isConnected = false;
      let sessionId = null;
      let pollInterval = null;
      let currentBackendURL = null;
      
      // Connect to the server
      const connect = async () => {
        try {
          // Get the current backend URL using dynamic discovery
          currentBackendURL = await dynamicApiService.ensureBackendURL();
          console.log(`[Polling] Connecting to ${currentBackendURL}`);
          
          const response = await fetch(`${currentBackendURL}/api/ws-connect`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Connection failed: ${response.status}`);
          }
          
          const data = await response.json();
          sessionId = data.sessionId;
          isConnected = true;
          
          console.log(`[Polling] Connection established with session ID: ${sessionId}`);
          
          // Send initial message with contract address
          sendMessage({ type: 'analyze', contractAddress });
          
          // Start polling for messages
          startPolling();
          
          if (onMessage) {
            onMessage({ type: 'connected' });
          }
        } catch (error) {
          console.error('[Polling] Connection error:', error);
          if (onMessage) {
            onMessage({ type: 'error', message: error.message });
          }
        }
      };
      
      // Send a message to the server
      const sendMessage = async (message) => {
        if (!isConnected || !sessionId || !currentBackendURL) {
          console.error('[Polling] Cannot send message - not connected');
          return;
        }
        
        try {
          const response = await fetch(`${currentBackendURL}/api/ws-send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sessionId,
              message
            })
          });
          
          if (!response.ok) {
            throw new Error(`Failed to send message: ${response.status}`);
          }
          
          console.log('[Polling] Message sent successfully');
        } catch (error) {
          console.error('[Polling] Error sending message:', error);
        }
      };
      
      // Poll for messages from the server
      const poll = async () => {
        if (!isConnected || !sessionId || !currentBackendURL) return;
        
        try {
          const response = await fetch(`${currentBackendURL}/api/ws-poll/${sessionId}`);
          
          if (!response.ok) {
            throw new Error(`Polling error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.messages && data.messages.length > 0) {
            data.messages.forEach(message => {
              if (onMessage) {
                onMessage(message);
              }
            });
          }
        } catch (error) {
          console.error('[Polling] Error polling for messages:', error);
          
          if (error.message.includes('404')) {
            // Session might have expired or been closed
            cleanup();
            if (onMessage) {
              onMessage({ type: 'disconnected', reason: 'Session expired' });
            }
          }
        }
      };
      
      // Start polling for messages at regular intervals
      const startPolling = () => {
        if (pollInterval) return;
        
        // Poll every second
        pollInterval = setInterval(poll, 1000);
      };
      
      // Stop polling for messages
      const stopPolling = () => {
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      };
      
      // Close the connection
      const close = async () => {
        if (!isConnected || !sessionId || !currentBackendURL) return;
        
        try {
          const response = await fetch(`${currentBackendURL}/api/ws-close`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
          });
          
          if (!response.ok) {
            console.warn(`[Polling] Error closing connection: ${response.status}`);
          }
          
          console.log('[Polling] Connection closed successfully');
        } catch (error) {
          console.error('[Polling] Error closing connection:', error);
        } finally {
          cleanup();
        }
      };
      
      // Cleanup function to stop polling and reset state
      const cleanup = () => {
        stopPolling();
        isConnected = false;
        sessionId = null;
      };
      
      // Start the connection process
      connect();
      
      // Return the connection object and cleanup function
      return {
        sendMessage,
        close,
        cleanup
      };
    } catch (error) {
      console.error('[Polling] Setup error:', error);
      return {
        cleanup: () => {}
      };
    }
  }
};

export default apiService;