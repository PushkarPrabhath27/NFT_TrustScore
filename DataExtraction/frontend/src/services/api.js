// API Service for NFT TrustScore Analyzer
// This service handles all API calls to the backend

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const apiService = {
  /**
   * Fetches NFT data from the backend with optional section parameter
   * @param {string} contractAddress - The contract address to analyze
   * @returns {Promise} Promise that resolves with the NFT data
   */
  fetchNFTData: async (contractAddress) => {
    try {
      console.log(`[API Service] Analyzing contract: ${contractAddress}`);
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractAddress }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[API Service] Received data:', data);
      
      if (!data.success || !data.data) {
        throw new Error('Invalid response format from API');
      }
      
      // Return the data directly as it should already be in the correct format
      return data;
    } catch (error) {
      console.error('Error fetching NFT data:', error);
      throw error;
    }
  },
  
  /**
   * Checks the health of the API server
   * @returns {Promise} Promise that resolves with the health status
   */
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  },
  
  /**
   * Sets up a polling connection for real-time updates (WebSocket alternative)
   * @param {Function} onMessage - Callback function to handle incoming messages
   * @param {string} contractAddress - The contract address to analyze
   * @returns {Object} Connection object and cleanup function
   */
  setupPollingConnection: (onMessage, contractAddress) => {
    try {
      console.log(`[Polling] Connecting to ${API_URL}`);
      
      // State variables
      let isConnected = false;
      let sessionId = null;
      let pollInterval = null;
      
      // Connect to the server
      const connect = async () => {
        try {
          const response = await fetch(`${API_URL}/api/ws-connect`, {
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
        if (!isConnected || !sessionId) {
          console.error('[Polling] Cannot send message - not connected');
          return;
        }
        
        try {
          const response = await fetch(`${API_URL}/api/ws-send`, {
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
        if (!isConnected || !sessionId) return;
        
        try {
          const response = await fetch(`${API_URL}/api/ws-poll/${sessionId}`);
          
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
        if (!isConnected || !sessionId) return;
        
        try {
          const response = await fetch(`${API_URL}/api/ws-close`, {
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