import { AuditLog } from '../database/models/auditLogModel.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fallback log file path
const LOG_FILE_PATH = path.join(__dirname, '../../logs/audit-logs.json');

// Ensure logs directory exists
async function ensureLogsDirectory() {
  try {
    await fs.mkdir(path.dirname(LOG_FILE_PATH), { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error('Error creating logs directory:', error);
    }
  }
}

/**
 * Audit Logger Utility
 * Provides functions to generate and retrieve audit logs for actions in the system.
 */

/**
 * Generates an audit log entry and stores it in the database.
 * @param {Object} logData - The data to log (action, contractAddress, userId, timestamp, etc.)
 * @returns {Promise<Object>} The created log entry
 */
export const generateAuditLog = async (logData) => {
  try {
    // Ensure required fields are present
    if (!logData.action) {
      throw new Error('Audit log must include an action');
    }
    
    // Ensure timestamp is present or add it
    if (!logData.timestamp) {
      logData.timestamp = new Date().toISOString();
    }
    
    // Handle contractAddress if it's an object
    if (logData.contractAddress && typeof logData.contractAddress === 'object') {
      // Extract the address string from the object
      if (logData.contractAddress.address) {
        logData.contractAddress = logData.contractAddress.address;
      } else {
        // If no address property, convert to string or use a placeholder
        logData.contractAddress = String(logData.contractAddress).substring(0, 100) || 'unknown';
      }
    }
    
    // Log to console for development/debugging
    console.log('Audit Log:', logData);
    
    // In production, store in database
    // Using the database connection from our database module
    const { default: db } = await import('../database/connection.js');
    
    try {
      // Create a new audit log entry in the database
      const logEntry = await AuditLog.create(logData);
      return logEntry;
    } catch (dbError) {
      // If database storage fails, fallback to file logging
      console.error('Database error, falling back to file logging:', dbError);
      await writeLogToFile(logData);
      return logData;
    }
  } catch (error) {
    console.error('Error generating audit log:', error);
    // Even if there's an error, try to log it to a file as a fallback
    await writeLogToFile({
      ...logData,
      error: error.message,
      errorTimestamp: new Date().toISOString()
    });
    throw error;
  }
};

/**
 * Writes a log entry to a file as a fallback mechanism.
 * @param {Object} logData - The log data to write
 * @returns {Promise<void>}
 */
async function writeLogToFile(logData) {
  try {
    await ensureLogsDirectory();
    
    // Read existing logs
    let logs = [];
    try {
      const data = await fs.readFile(LOG_FILE_PATH, 'utf8');
      logs = JSON.parse(data);
    } catch (readError) {
      if (readError.code !== 'ENOENT') {
        throw readError;
      }
    }
    
    // Add new log
    logs.push({
      ...logData,
      _id: Date.now().toString(),
      createdAt: new Date(),
      source: 'file'
    });
    
    // Write back to file
    await fs.writeFile(LOG_FILE_PATH, JSON.stringify(logs, null, 2));
  } catch (error) {
    console.error('Error writing to audit log file:', error);
    // Last resort: log to console
    console.error('Audit Log (console fallback):', JSON.stringify(logData, null, 2));
  }
}

/**
 * Retrieves audit logs for a specific contract address.
 * @param {string} contractAddress - The contract address to get logs for
 * @param {Object} options - Query options (limit, offset, startDate, endDate)
 * @returns {Promise<Array>} Array of audit log entries
 */
export const getAuditLogs = async (contractAddress, options = {}) => {
  try {
    // Build query
    const query = { contractAddress };
    
    // Add date filters if provided
    if (options.startDate || options.endDate) {
      query.timestamp = {};
      if (options.startDate) {
        query.timestamp.$gte = options.startDate;
      }
      if (options.endDate) {
        query.timestamp.$lte = options.endDate;
      }
    }
    
    // Execute query with pagination
    const logs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(options.offset || 0)
      .limit(options.limit || 100);
    
    return logs;
  } catch (error) {
    console.error('Error retrieving audit logs:', error);
    
    // Fallback to file-based logs if database query fails
    return await getLogsFromFile(contractAddress, options);
  }
};

/**
 * Fallback function to get logs from file storage.
 * @param {string} contractAddress - The contract address to filter by
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of matching log entries
 */
async function getLogsFromFile(contractAddress, options = {}) {
  try {
    // Ensure file exists
    try {
      await fs.access(LOG_FILE_PATH);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
    
    // Read and parse logs
    const data = await fs.readFile(LOG_FILE_PATH, 'utf8');
    let logs = JSON.parse(data);
    
    // Filter by contract address if provided
    if (contractAddress) {
      logs = logs.filter(log => log.contractAddress === contractAddress);
    }
    
    // Apply date filters
    if (options.startDate) {
      const start = new Date(options.startDate);
      logs = logs.filter(log => new Date(log.timestamp) >= start);
    }
    if (options.endDate) {
      const end = new Date(options.endDate);
      logs = logs.filter(log => new Date(log.timestamp) <= end);
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 100;
    return logs.slice(offset, offset + limit);
    
    // This code is no longer needed as we fixed the logic above
  } catch (error) {
    console.error('Error retrieving logs from file:', error);
    return [];
  }
}