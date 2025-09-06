/**
 * Fraud Detection Component
 * Displays fraud analysis with security indicators,
 * threat assessments, and protective recommendations
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge,
  useTheme
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Shield as ShieldIcon,
  Gavel as FraudIcon,
  BugReport as VulnerabilityIcon,
  AccountBalance as FinancialIcon,
  Visibility as MonitoringIcon,
  Report as ReportIcon,
  VerifiedUser as TrustedIcon
} from '@mui/icons-material';
import apiService from '../../services/ApiService';

const FraudDetection = ({ fraudDetection }) => {
  const theme = useTheme();

  /**
   * Gets fraud risk level configuration based on score
   * @param {number} score - Fraud score (0-100)
   * @returns {Object} Fraud risk configuration
   */
  const getFraudConfig = useMemo(() => {
    const score = fraudDetection?.score || 0;
    
    if (score <= 20) {
      return {
        level: 'Very Low',
        color: theme.palette.success.main,
        bgColor: theme.palette.success.light,
        icon: TrustedIcon,
        description: 'Minimal fraud indicators detected',
        severity: 'success',
        trustLevel: 'High Trust'
      };
    } else if (score <= 40) {
      return {
        level: 'Low',
        color: theme.palette.info.main,
        bgColor: theme.palette.info.light,
        icon: CheckIcon,
        description: 'Low fraud risk with minor concerns',
        severity: 'info',
        trustLevel: 'Good Trust'
      };
    } else if (score <= 70) {
      return {
        level: 'Medium',
        color: theme.palette.warning.main,
        bgColor: theme.palette.warning.light,
        icon: WarningIcon,
        description: 'Moderate fraud indicators require attention',
        severity: 'warning',
        trustLevel: 'Caution'
      };
    } else {
      return {
        level: 'High',
        color: theme.palette.error.main,
        bgColor: theme.palette.error.light,
        icon: ErrorIcon,
        description: 'High fraud risk - exercise extreme caution',
        severity: 'error',
        trustLevel: 'High Risk'
      };
    }
  }, [fraudDetection?.score, theme]);

  /**
   * Fraud indicator configurations
   */
  const indicatorConfigs = useMemo(() => ({
    'Suspicious Transaction Patterns': {
      icon: MonitoringIcon,
      color: theme.palette.warning.main,
      severity: 'medium',
      category: 'Transaction'
    },
    'Unusual Trading Volume': {
      icon: FinancialIcon,
      color: theme.palette.info.main,
      severity: 'low',
      category: 'Market'
    },
    'Smart Contract Vulnerabilities': {
      icon: VulnerabilityIcon,
      color: theme.palette.error.main,
      severity: 'high',
      category: 'Security'
    },
    'Wash Trading': {
      icon: FraudIcon,
      color: theme.palette.error.main,
      severity: 'high',
      category: 'Fraud'
    },
    'Price Manipulation': {
      icon: ReportIcon,
      color: theme.palette.warning.main,
      severity: 'medium',
      category: 'Market'
    },
    'Fake Volume': {
      icon: MonitoringIcon,
      color: theme.palette.warning.main,
      severity: 'medium',
      category: 'Market'
    },
    'Rug Pull Indicators': {
      icon: ErrorIcon,
      color: theme.palette.error.main,
      severity: 'high',
      category: 'Security'
    }
  }), [theme]);

  /**
   * Gets severity badge color
   * @param {string} severity - Severity level
   * @returns {string} Badge color
   */
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  /**
   * Renders a fraud indicator item
   * @param {string} indicator - Fraud indicator name
   * @param {number} index - Index for animation delay
   * @returns {JSX.Element} Fraud indicator component
   */
  const renderFraudIndicator = (indicator, index) => {
    const config = indicatorConfigs[indicator] || {
      icon: ReportIcon,
      color: theme.palette.text.secondary,
      severity: 'low',
      category: 'Other'
    };
    
    const IconComponent = config.icon;

    return (
      <motion.div
        key={indicator}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <ListItem
          sx={{
            bgcolor: `${config.color}10`,
            borderRadius: 2,
            mb: 1,
            border: `1px solid ${config.color}30`
          }}
        >
          <ListItemIcon>
            <Badge
              badgeContent={config.severity}
              color={getSeverityColor(config.severity)}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.6rem',
                  height: 16,
                  minWidth: 16
                }
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: `${config.color}20`,
                  color: config.color
                }}
              >
                <IconComponent fontSize="small" />
              </Avatar>
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight="medium">
                  {indicator}
                </Typography>
                <Chip
                  label={config.category}
                  size="small"
                  variant="outlined"
                  sx={{ ml: 1, fontSize: '0.7rem' }}
                />
              </Box>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {config.severity} severity threat detected
              </Typography>
            }
          />
        </ListItem>
      </motion.div>
    );
  };

  /**
   * Renders a security recommendation
   * @param {string} recommendation - Recommendation text
   * @param {number} index - Index for animation delay
   * @returns {JSX.Element} Recommendation component
   */
  const renderRecommendation = (recommendation, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          mb: 1
        }}
      >
        <Box display="flex" alignItems="flex-start">
          <ShieldIcon
            sx={{
              color: theme.palette.primary.main,
              mr: 1,
              mt: 0.5,
              fontSize: 20
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {recommendation}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );

  if (!fraudDetection) {
    return null;
  }

  const FraudIcon = getFraudConfig.icon;
  const fraudScore = fraudDetection.score || 0;
  const indicators = fraudDetection.indicators || [];
  const recommendations = fraudDetection.recommendations || [];

  // Calculate threat distribution
  const threatCounts = indicators.reduce((acc, indicator) => {
    const config = indicatorConfigs[indicator];
    const severity = config?.severity || 'low';
    acc[severity] = (acc[severity] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: getFraudConfig.color,
                mr: 2
              }}
            >
              <SecurityIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Fraud Detection
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Advanced fraud analysis and security monitoring
              </Typography>
            </Box>
          </Box>

          {/* Fraud Score Overview */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Alert
              severity={getFraudConfig.severity}
              icon={<FraudIcon />}
              sx={{
                mb: 3,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {getFraudConfig.level} Fraud Risk
                  </Typography>
                  <Typography variant="body2">
                    {getFraudConfig.description}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h4" fontWeight="bold">
                    {fraudScore}
                  </Typography>
                  <Typography variant="caption">
                    Fraud Score
                  </Typography>
                </Box>
              </Box>
            </Alert>
          </motion.div>

          {/* Fraud Score Progress */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight="medium">
                Fraud Risk Level
              </Typography>
              <Typography variant="body2" color={getFraudConfig.color} fontWeight="bold">
                {fraudScore}/100
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={fraudScore}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: `${getFraudConfig.color}15`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: getFraudConfig.color,
                  borderRadius: 4
                }
              }}
            />
            <Box display="flex" justifyContent="space-between" mt={0.5}>
              <Typography variant="caption" color="text.secondary">
                Safe
              </Typography>
              <Typography variant="caption" color="text.secondary">
                High Risk
              </Typography>
            </Box>
          </Box>

          {/* Threat Summary */}
          {Object.keys(threatCounts).length > 0 && (
            <Box mb={3}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Threat Distribution
              </Typography>
              <Grid container spacing={1}>
                {Object.entries(threatCounts).map(([severity, count]) => (
                  <Grid item key={severity}>
                    <Chip
                      label={`${count} ${severity}`}
                      size="small"
                      color={getSeverityColor(severity)}
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Fraud Indicators */}
          {indicators.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Fraud Indicators
              </Typography>
              <List sx={{ p: 0 }}>
                {indicators.slice(0, 4).map((indicator, index) => 
                  renderFraudIndicator(indicator, index)
                )}
              </List>
              {indicators.length > 4 && (
                <Typography variant="caption" color="text.secondary">
                  +{indicators.length - 4} more indicators detected
                </Typography>
              )}
            </Box>
          )}

          {/* Security Recommendations */}
          {recommendations.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Security Recommendations
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Protective measures to mitigate fraud risks:
              </Typography>
              {recommendations.slice(0, 3).map((recommendation, index) => 
                renderRecommendation(recommendation, index)
              )}
              {recommendations.length > 3 && (
                <Tooltip title="View all security recommendations">
                  <Chip
                    label={`+${recommendations.length - 3} more recommendations`}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Tooltip>
              )}
            </Box>
          )}

          {/* Trust Level Badge */}
          <Box mt={3} textAlign="center">
            <Chip
              label={getFraudConfig.trustLevel}
              color={getFraudConfig.severity}
              variant="filled"
              sx={{ fontWeight: 'bold' }}
            />
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Based on transaction patterns, smart contract analysis, and market behavior
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FraudDetection;