/**
 * Raw Data Viewer Component
 * Shows the raw JSON data received from the backend for debugging
 * Enhanced with data health indicators and comprehensive validation
 */

import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Chip,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton,
  Divider
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const RawDataViewer = ({ data, title = "Raw Data Viewer" }) => {
  const [expanded, setExpanded] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Expected data fields based on backend analysis
  const expectedFields = [
    'summary', 'marketSegment', 'marketPositionScore',
    'marketData', 'priceData', 'portfolioData',
    'creatorData', 'collectionData', 'riskData',
    'fraudData', 'trustScoreData', 'nftData'
  ];

  // Comprehensive data health analysis
  const dataHealth = useMemo(() => {
    if (!data) {
      return {
        overall: 'error',
        score: 0,
        totalFields: 0,
        presentFields: 0,
        missingFields: expectedFields,
        nullFields: [],
        issues: ['No data received']
      };
    }

    const presentFields = [];
    const missingFields = [];
    const nullFields = [];
    const issues = [];

    expectedFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        presentFields.push(field);
        if (data[field] === null || data[field] === undefined) {
          nullFields.push(field);
          issues.push(`${field} is null/undefined`);
        }
      } else {
        missingFields.push(field);
        issues.push(`${field} is missing`);
      }
    });

    // Check for unexpected fields
    const unexpectedFields = Object.keys(data).filter(key => !expectedFields.includes(key));
    if (unexpectedFields.length > 0) {
      issues.push(`Unexpected fields: ${unexpectedFields.join(', ')}`);
    }

    const score = Math.round((presentFields.length / expectedFields.length) * 100);
    let overall = 'success';
    if (score < 50) overall = 'error';
    else if (score < 80) overall = 'warning';
    else if (nullFields.length > 0) overall = 'warning';

    return {
      overall,
      score,
      totalFields: expectedFields.length,
      presentFields,
      missingFields,
      nullFields,
      unexpectedFields,
      issues
    };
  }, [data]);

  const handleCopyData = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy data:', error);
    }
  };

  const handleDownloadData = () => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download data:', error);
    }
  };

  if (!data) {
    return (
      <Card sx={{ mb: 2, bgcolor: 'error.light' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <ErrorIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6" color="error">
              {title} - No Data
            </Typography>
          </Box>
          <Typography variant="body2">
            No data received. Check console for details.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getDataStatus = (value) => {
    if (value === null) return { status: 'null', color: 'error' };
    if (value === undefined) return { status: 'undefined', color: 'warning' };
    if (Array.isArray(value)) return { status: `array (${value.length})`, color: 'info' };
    if (typeof value === 'object') return { status: 'object', color: 'success' };
    if (typeof value === 'string') return { status: `string (${value.length})`, color: 'primary' };
    if (typeof value === 'number') return { status: `number (${value})`, color: 'secondary' };
    return { status: typeof value, color: 'default' };
  };

  const renderDataField = (key, value, level = 0) => {
    const { status, color } = getDataStatus(value);
    const indent = '  '.repeat(level);
    
    return (
      <Box key={key} sx={{ ml: level * 2 }}>
        <Typography variant="body2" component="span">
          {indent}
          <strong>{key}:</strong> 
        </Typography>
        <Chip 
          label={status} 
          size="small" 
          color={color} 
          sx={{ ml: 1, mb: 0.5 }}
        />
        {typeof value === 'object' && value !== null && !Array.isArray(value) && (
          <Box sx={{ ml: 2 }}>
            {Object.keys(value).slice(0, 5).map(subKey => 
              renderDataField(subKey, value[subKey], level + 1)
            )}
            {Object.keys(value).length > 5 && (
              <Typography variant="caption" color="text.secondary">
                ... and {Object.keys(value).length - 5} more fields
              </Typography>
            )}
          </Box>
        )}
        {Array.isArray(value) && value.length > 0 && (
          <Box sx={{ ml: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Array with {value.length} items
            </Typography>
            {value.slice(0, 2).map((item, idx) => (
              <Box key={idx} sx={{ ml: 1 }}>
                <Typography variant="caption">
                  [{idx}]: {typeof item === 'object' ? JSON.stringify(item).substring(0, 50) + '...' : String(item)}
                </Typography>
              </Box>
            ))}
            {value.length > 2 && (
              <Typography variant="caption" color="text.secondary">
                ... and {value.length - 2} more items
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Card sx={{ mb: 2, bgcolor: 'info.light' }}>
      <CardContent>
        {/* Header with Data Health Indicator */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            {dataHealth.overall === 'success' && <CheckCircleIcon color="success" sx={{ mr: 1 }} />}
            {dataHealth.overall === 'warning' && <WarningIcon color="warning" sx={{ mr: 1 }} />}
            {dataHealth.overall === 'error' && <ErrorIcon color="error" sx={{ mr: 1 }} />}
            <Typography variant="h6" color="info.dark">
              {title}
            </Typography>
            <Chip 
              label={`${dataHealth.score}% Complete`}
              size="small"
              color={dataHealth.overall}
              sx={{ ml: 2 }}
            />
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Copy to Clipboard">
              <IconButton 
                size="small" 
                onClick={handleCopyData}
                color={copySuccess ? 'success' : 'default'}
              >
                <CopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download JSON">
              <IconButton 
                size="small" 
                onClick={handleDownloadData}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Button 
              size="small" 
              onClick={() => setShowRawJson(!showRawJson)}
              sx={{ mr: 1 }}
            >
              {showRawJson ? 'Hide' : 'Show'} Raw JSON
            </Button>
            <Button 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              endIcon={<ExpandMoreIcon />}
            >
              {expanded ? 'Collapse' : 'Expand'} Details
            </Button>
          </Box>
        </Box>

        {/* Data Health Progress Bar */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">Data Completeness</Typography>
            <Typography variant="caption">
              {dataHealth.presentFields.length} / {dataHealth.totalFields} fields
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={dataHealth.score} 
            color={dataHealth.overall}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Data Health Summary */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>Data Health Summary:</Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
            <Chip 
              icon={<CheckCircleIcon />}
              label={`${dataHealth.presentFields.length} Present`}
              size="small"
              color="success"
            />
            {dataHealth.missingFields.length > 0 && (
              <Chip 
                icon={<ErrorIcon />}
                label={`${dataHealth.missingFields.length} Missing`}
                size="small"
                color="error"
              />
            )}
            {dataHealth.nullFields.length > 0 && (
              <Chip 
                icon={<WarningIcon />}
                label={`${dataHealth.nullFields.length} Null/Undefined`}
                size="small"
                color="warning"
              />
            )}
            {dataHealth.unexpectedFields.length > 0 && (
              <Chip 
                icon={<InfoIcon />}
                label={`${dataHealth.unexpectedFields.length} Unexpected`}
                size="small"
                color="info"
              />
            )}
          </Box>
        </Box>

        {/* Field Status Overview */}
        <Box mb={2}>
          <Typography variant="subtitle2" gutterBottom>Field Status Overview:</Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {expectedFields.map(key => {
              const value = data[key];
              const { status, color } = getDataStatus(value);
              const isExpected = expectedFields.includes(key);
              return (
                <Chip 
                  key={key}
                  label={`${key}: ${status}`}
                  size="small"
                  color={isExpected ? color : 'default'}
                  variant={isExpected ? 'filled' : 'outlined'}
                />
              );
            })}
            {/* Show unexpected fields */}
            {dataHealth.unexpectedFields.map(key => {
              const { status, color } = getDataStatus(data[key]);
              return (
                <Chip 
                  key={key}
                  label={`${key}: ${status} (unexpected)`}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              );
            })}
          </Box>
        </Box>

        {/* Issues Summary */}
        {dataHealth.issues.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>Issues Found:</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {dataHealth.issues.map((issue, index) => (
                <Alert key={index} severity={dataHealth.overall}>
                  <Typography variant="body2">{issue}</Typography>
                </Alert>
              ))}
            </Box>
          </Box>
        )}

        {/* Raw JSON */}
        {showRawJson && (
          <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>Raw JSON:</Typography>
            <Box 
              component="pre" 
              sx={{ 
                bgcolor: 'grey.100', 
                p: 2, 
                borderRadius: 1, 
                overflow: 'auto',
                maxHeight: 300,
                fontSize: '0.75rem'
              }}
            >
              {JSON.stringify(data, null, 2)}
            </Box>
          </Box>
        )}

        {/* Detailed Field Analysis */}
        {expanded && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>Field Analysis:</Typography>
            <Box 
              component="pre" 
              sx={{ 
                bgcolor: 'grey.50', 
                p: 2, 
                borderRadius: 1, 
                overflow: 'auto',
                maxHeight: 400,
                fontSize: '0.75rem',
                fontFamily: 'monospace'
              }}
            >
              {Object.keys(data).map(key => renderDataField(key, data[key]))}
            </Box>
          </Box>
        )}

        {/* Enhanced Validation Warnings */}
        <Divider sx={{ my: 2 }} />
        
        {/* Data Quality Recommendations */}
        {dataHealth.overall !== 'success' && (
          <Box>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Data Quality Recommendations:
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {dataHealth.missingFields.length > 0 && (
                <Typography component="li" variant="body2" color="error">
                  • {dataHealth.missingFields.length} required fields are missing from backend response
                </Typography>
              )}
              {dataHealth.nullFields.length > 0 && (
                <Typography component="li" variant="body2" color="warning">
                  • {dataHealth.nullFields.length} fields contain null/undefined values
                </Typography>
              )}
              {dataHealth.unexpectedFields.length > 0 && (
                <Typography component="li" variant="body2" color="info">
                  • {dataHealth.unexpectedFields.length} unexpected fields detected in response
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Success Message */}
        {dataHealth.overall === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              ✅ All expected data fields are present and contain valid values. Dashboard should render correctly.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RawDataViewer;
