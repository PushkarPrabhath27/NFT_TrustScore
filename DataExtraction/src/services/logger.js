import winston from 'winston';
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json, errors } = format;
import config from '../config/apiConfig.js';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for different log levels
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;
  
  // Add metadata if present
  if (Object.keys(meta).length > 0) {
    log += `\n${JSON.stringify(meta, null, 2)}`;
  }
  
  return log;
});

// Create logs directory if it doesn't exist
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logDir = 'logs';
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

// Create the logger instance
const logger = createLogger({
  level: config.logging.level,
  levels,
  format: combine(
    timestamp({
      format: config.logging.timestampFormat || 'YYYY-MM-DD HH:mm:ss'
    }),
    errors({ stack: true }), // Include stack traces in errors
    json()
  ),
  defaultMeta: { service: 'nft-analysis' },
  transports: [
    // Console transport with colors and simple format
    new transports.Console({
      format: combine(
        colorize({ all: true }),
        printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? `\n${info.stack}` : ''}`
        )
      )
    }),
    // Error logs file
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: combine(
        timestamp(),
        json()
      )
    }),
    // Combined logs file
    new transports.File({ 
      filename: 'logs/combined.log',
      format: combine(
        timestamp(),
        json()
      )
    })
  ]
});

// Add stream for morgan HTTP request logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default logger;
