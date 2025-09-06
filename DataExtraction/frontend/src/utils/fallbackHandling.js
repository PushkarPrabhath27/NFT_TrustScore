/**
 * Fallback Handling Utilities
 * Provides comprehensive null/undefined data handling with informative placeholders
 */

import React from 'react';
import {
  Alert,
  Typography,
  Box,
  Skeleton,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { FiX, FiAlertTriangle, FiInfo, FiHelpCircle } from 'react-icons/fi';

/**
 * Data validation and fallback utilities
 */
export const DataValidation = {
  /**
   * Checks if a value is valid (not null, undefined, or empty)
   * @param {any} value - Value to check
   * @returns {boolean} Whether the value is valid
   */
  isValid: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
    return true;
  },

  /**
   * Gets a safe value with fallback
   * @param {any} value - Value to check
   * @param {any} fallback - Fallback value
   * @returns {any} Safe value or fallback
   */
  safeValue: (value, fallback = 'N/A') => {
    return DataValidation.isValid(value) ? value : fallback;
  },

  /**
   * Gets a safe number with fallback
   * @param {any} value - Value to check
   * @param {number} fallback - Fallback number
   * @returns {number} Safe number or fallback
   */
  safeNumber: (value, fallback = 0) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return !isNaN(num) ? num : fallback;
  },

  /**
   * Gets a safe string with fallback
   * @param {any} value - Value to check
   * @param {string} fallback - Fallback string
   * @returns {string} Safe string or fallback
   */
  safeString: (value, fallback = 'N/A') => {
    return typeof value === 'string' && value.trim() !== '' ? value : fallback;
  },

  /**
   * Gets a safe array with fallback
   * @param {any} value - Value to check
   * @param {Array} fallback - Fallback array
   * @returns {Array} Safe array or fallback
   */
  safeArray: (value, fallback = []) => {
    return Array.isArray(value) ? value : fallback;
  },

  /**
   * Gets a safe object with fallback
   * @param {any} value - Value to check
   * @param {Object} fallback - Fallback object
   * @returns {Object} Safe object or fallback
   */
  safeObject: (value, fallback = {}) => {
    return typeof value === 'object' && value !== null ? value : fallback;
  }
};

/**
 * Fallback UI Components
 */
export const FallbackComponents = {
  /**
   * No Data Available component
   */
  NoData: ({ title = "No Data Available", message = "Data is not available for this section.", icon: Icon = FiInfo, severity = "info" }) => (
    <Card sx={{ height: '100%', bgcolor: 'grey.50' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Icon color="gray" style={{ marginRight: 8 }} />
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Alert severity={severity}>
          <Typography variant="body2">
            {message}
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  ),

  /**
   * Loading Skeleton component
   */
  LoadingSkeleton: ({ height = 200, variant = "rectangular" }) => (
    <Skeleton
      variant={variant}
      height={height}
      sx={{ borderRadius: 2 }}
      animation="wave"
    />
  ),

  /**
   * Error State component
   */
  ErrorState: ({ title = "Error Loading Data", message = "An error occurred while loading data.", onRetry }) => (
    <Card sx={{ height: '100%', bgcolor: 'error.light' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <FiX color="red" style={{ marginRight: 8 }} />
          <Typography variant="h6" color="error">
            {title}
          </Typography>
        </Box>
        <Alert severity="error" action={onRetry}>
          <Typography variant="body2">
            {message}
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  ),

  /**
   * Partial Data Warning component
   */
  PartialDataWarning: ({ missingFields = [], availableFields = [] }) => (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <Typography variant="body2">
        <strong>Partial Data Available:</strong> Some fields are missing from the backend response.
      </Typography>
      {missingFields.length > 0 && (
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Missing: {missingFields.join(', ')}
          </Typography>
        </Box>
      )}
      {availableFields.length > 0 && (
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Available: {availableFields.join(', ')}
          </Typography>
        </Box>
      )}
    </Alert>
  ),

  /**
   * Data Quality Indicator component
   */
  DataQualityIndicator: ({ quality, totalFields, presentFields, issues = [] }) => {
    const getQualityColor = (quality) => {
      if (quality >= 80) return 'success';
      if (quality >= 50) return 'warning';
      return 'error';
    };

    const getQualityIcon = (quality) => {
      if (quality >= 80) return '✅';
      if (quality >= 50) return '⚠️';
      return '❌';
    };

    return (
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Chip
          icon={<span>{getQualityIcon(quality)}</span>}
          label={`${quality}% Complete`}
          size="small"
          color={getQualityColor(quality)}
        />
        <Typography variant="caption" color="text.secondary">
          {presentFields}/{totalFields} fields
        </Typography>
        {issues.length > 0 && (
          <Chip
            label={`${issues.length} issues`}
            size="small"
            color="warning"
            variant="outlined"
          />
        )}
      </Box>
    );
  }
};

/**
 * Higher-order component for data validation
 */
export const withDataValidation = (WrappedComponent, options = {}) => {
  const {
    requiredFields = [],
    fallbackComponent = FallbackComponents.NoData,
    showPartialDataWarning = true,
    minDataQuality = 0
  } = options;

  return (props) => {
    const { data, ...otherProps } = props;
    
    // Check if data exists
    if (!data) {
      return <fallbackComponent title="No Data" message="No data provided to component." />;
    }

    // Check required fields
    const missingFields = requiredFields.filter(field => !DataValidation.isValid(data[field]));
    const presentFields = requiredFields.filter(field => DataValidation.isValid(data[field]));
    
    // Calculate data quality
    const dataQuality = requiredFields.length > 0 ? 
      Math.round((presentFields.length / requiredFields.length) * 100) : 100;

    // Check if data quality meets minimum threshold
    if (dataQuality < minDataQuality) {
      return <fallbackComponent 
        title="Insufficient Data" 
        message={`Data quality (${dataQuality}%) is below minimum threshold (${minDataQuality}%).`}
        severity="warning"
      />;
    }

    // Show partial data warning if needed
    const showWarning = showPartialDataWarning && missingFields.length > 0 && presentFields.length > 0;

    return (
      <Box>
        {showWarning && (
          <FallbackComponents.PartialDataWarning 
            missingFields={missingFields}
            availableFields={presentFields}
          />
        )}
        <WrappedComponent 
          {...otherProps} 
          data={data}
          dataQuality={dataQuality}
          missingFields={missingFields}
          presentFields={presentFields}
        />
      </Box>
    );
  };
};

/**
 * Utility function to create safe data accessors
 */
export const createSafeAccessor = (data, path, fallback = null) => {
  if (!data) return fallback;
  
  const keys = path.split('.');
  let current = data;
  
  for (const key of keys) {
    if (current === null || current === undefined || !current.hasOwnProperty(key)) {
      return fallback;
    }
    current = current[key];
  }
  
  return DataValidation.isValid(current) ? current : fallback;
};

/**
 * Utility function to format data with fallbacks
 */
export const formatWithFallback = (value, formatter, fallback = 'N/A') => {
  if (!DataValidation.isValid(value)) return fallback;
  
  try {
    return formatter(value);
  } catch (error) {
    console.warn('Error formatting value:', error);
    return fallback;
  }
};

export default {
  DataValidation,
  FallbackComponents,
  withDataValidation,
  createSafeAccessor,
  formatWithFallback
};
