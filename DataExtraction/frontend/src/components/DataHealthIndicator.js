/**
 * Data Health Indicator Component
 * Shows the overall health and completeness of analysis data
 */

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugReportIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getOverallDataHealth, DATA_SECTIONS, groupAnalysisData } from '../utils/dataGrouping';

const DataHealthIndicator = ({ 
  analysisData, 
  onDebugClick, 
  onRefreshClick,
  showDetails = false 
}) => {
  const [expanded, setExpanded] = useState(showDetails);

  if (!analysisData) {
    return (
      <Card sx={{ mb: 2, bgcolor: 'error.light' }}>
        <CardContent>
          <Box display="flex" alignItems="center">
            <ErrorIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="h6" color="error">
              No Analysis Data Available
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Analysis data is required to display health indicators.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Group the analysis data
  const groupedData = groupAnalysisData(analysisData);
  const health = getOverallDataHealth(groupedData);

  const getHealthIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon color="success" />;
      case 'warning': return <WarningIcon color="warning" />;
      case 'error': return <ErrorIcon color="error" />;
      default: return <InfoIcon color="info" />;
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  return (
    <Card sx={{ mb: 2, bgcolor: 'background.paper' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center">
            {getHealthIcon(health.healthStatus)}
            <Typography variant="h6" sx={{ ml: 1 }}>
              Data Health Overview
            </Typography>
            <Chip 
              label={`${health.overallScore}% Complete`}
              size="small"
              color={getHealthColor(health.healthStatus)}
              sx={{ ml: 2 }}
            />
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Debug Data">
              <IconButton 
                size="small" 
                onClick={onDebugClick}
                color="primary"
              >
                <BugReportIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Analysis">
              <IconButton 
                size="small" 
                onClick={onRefreshClick}
                color="primary"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={<ExpandMoreIcon />}
            >
              {expanded ? 'Hide' : 'Show'} Details
            </Button>
          </Box>
        </Box>

        {/* Overall Progress */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">Overall Data Completeness</Typography>
            <Typography variant="caption">
              {health.sectionsWithData} / {health.totalSections} sections
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={health.overallScore} 
            color={getHealthColor(health.healthStatus)}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Quick Stats */}
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          <Chip 
            icon={<CheckCircleIcon />}
            label={`${health.sectionsWithData} Sections Active`}
            size="small"
            color="success"
          />
          {health.totalIssues > 0 && (
            <Chip 
              icon={<WarningIcon />}
              label={`${health.totalIssues} Issues Found`}
              size="small"
              color="warning"
            />
          )}
          <Chip 
            icon={<InfoIcon />}
            label={`${Object.keys(analysisData).length} Total Fields`}
            size="small"
            color="info"
          />
        </Box>

        {/* Detailed Section Breakdown */}
        <Collapse in={expanded}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Section Breakdown:
            </Typography>
            <List dense>
              {Object.values(DATA_SECTIONS).map(section => {
                const sectionData = groupedData[section.id];
                
                return (
                  <ListItem key={section.id} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <InfoIcon color={section.color} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {section.title}
                          </Typography>
                          <Chip 
                            label={`${sectionData.completeness}%`}
                            size="small"
                            color={sectionData.completeness >= 80 ? 'success' : 
                                   sectionData.completeness >= 50 ? 'warning' : 'error'}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {section.description}
                          </Typography>
                          {sectionData.issues.length > 0 && (
                            <Box mt={0.5}>
                              {sectionData.issues.slice(0, 2).map((issue, index) => (
                                <Typography 
                                  key={index}
                                  variant="caption" 
                                  color="error"
                                  display="block"
                                >
                                  • {issue}
                                </Typography>
                              ))}
                              {sectionData.issues.length > 2 && (
                                <Typography variant="caption" color="error">
                                  • ... and {sectionData.issues.length - 2} more issues
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Collapse>

        {/* Health Status Alert */}
        {health.healthStatus !== 'success' && (
          <Alert 
            severity={health.healthStatus} 
            sx={{ mt: 2 }}
            action={
              <Button 
                size="small" 
                onClick={() => setExpanded(true)}
                color="inherit"
              >
                View Details
              </Button>
            }
          >
            <Typography variant="body2">
              {health.healthStatus === 'error' && 
                'Critical data issues detected. Some dashboard sections may not render properly.'}
              {health.healthStatus === 'warning' && 
                'Some data fields are missing or incomplete. Dashboard functionality may be limited.'}
            </Typography>
          </Alert>
        )}

        {/* Success Message */}
        {health.healthStatus === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              ✅ All data sections are complete and healthy. Dashboard should render optimally.
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DataHealthIndicator;
