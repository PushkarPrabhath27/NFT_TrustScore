/**
 * Audit Log Model
 * Defines the schema and model for audit logs in the system
 */

import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * Audit Log Schema
 * Stores detailed information about system actions for auditing purposes
 */
const auditLogSchema = new Schema({
  // The action that was performed
  action: {
    type: String,
    required: true,
    index: true
  },
  
  // The contract address related to the action (if applicable)
  contractAddress: {
    type: String,
    index: true
  },
  
  // The user who performed the action (if applicable)
  userId: {
    type: String,
    index: true
  },
  
  // Timestamp when the action occurred
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // IP address of the request (for security auditing)
  ipAddress: String,
  
  // User agent of the request (for security auditing)
  userAgent: String,
  
  // Additional data related to the action
  details: mongoose.Schema.Types.Mixed,
  
  // Status of the action (success, failure, etc.)
  status: {
    type: String,
    enum: ['success', 'failure', 'warning', 'info'],
    default: 'success'
  },
  
  // If the action failed, the error message
  errorMessage: String
}, {
  // Add timestamps for when the log was created and updated
  timestamps: true,
  
  // Add collection name
  collection: 'auditLogs'
});

// Create indexes for common queries
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ contractAddress: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });

// Create the model
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export { AuditLog, auditLogSchema };
export default AuditLog;