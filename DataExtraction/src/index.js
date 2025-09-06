/**
 * NFT Smart Contract Analysis System
 * Main application entry point
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import routes from './api/routes.js';
import { connectToDatabase } from './database/connection.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
// Determine port: priority 1) --port CLI arg, 2) PORT env var, 3) default 3001
const argv = process.argv.slice(2);
let cliPort;
argv.forEach(arg => {
  if (arg.startsWith('--port=')) {
    const [, value] = arg.split('=');
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      cliPort = parsed;
    }
  }
});

const PORT = cliPort || process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('public')); // Serve static files from public directory

// API Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    console.log('Connecting to MongoDB database...');
    // Connect to MongoDB database
    await connectToDatabase();
    console.log('Successfully connected to MongoDB database');
    
    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`NFT Smart Contract Analysis System running on port ${PORT}`);
      console.log(`Using real blockchain data for NFT analysis`);
      
      // Open browser automatically
      const url = `http://localhost:${PORT}`;
      console.log(`Opening browser at ${url}`);
      
      // Use dynamic import for ESM compatibility
      import('child_process')
        .then(({ exec }) => {
          try {
            exec(`start ${url}`, (error) => {
              if (error) {
                console.error('Failed to open browser:', error.message);
              }
            });
          } catch (error) {
            console.error('Error opening browser:', error.message);
          }
        })
        .catch(error => {
          console.error('Error importing child_process:', error.message);
        });
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please use a different port.`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();