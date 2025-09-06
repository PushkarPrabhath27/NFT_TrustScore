/**
 * Risk Assessment Component
 * Displays comprehensive risk analysis with visual indicators,
 * risk factors, and actionable recommendations
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
  useTheme
} from '@mui/material';
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Shield as ShieldIcon,
  TrendingDown as RiskIcon,
  Info as InfoIcon,
  Lightbulb as RecommendationIcon
} from '@mui/icons-material';
import apiService from '../../services/ApiService';

const RiskAssessment = ({ riskAssessment }) => {
  const theme = useTheme();

  /**
   * Gets risk level configuration based on score
   * @param {number} score - Risk score (0-100)
   * @returns {Object} Risk level configuration
   */
  const getRiskConfig = useMemo(() => {
    const score = riskAssessment?.score || 0;
    
    if (score <= 30) {
      return {
        level: 'Low Risk',
        color: theme.palette.success.main,
        bgColor: theme.palette.success.light,
        icon: CheckIcon,
        description: 'Low risk profile with minimal concerns',
        severity: 'success'
      };
    } else if (score <= 60) {
      return {
        level: 'Medium Risk',
        color: theme.palette.warning.main,
        bgColor: theme.palette.warning.light,
        icon: WarningIcon,
        description: 'Moderate risk with some areas of concern',
        severity: 'warning'
      };
    } else {
      return {
        level: 'High Risk',
        color: theme.palette.error.main,
        bgColor: theme.palette.error.light,
        icon: ErrorIcon,
        description: 'High risk profile requiring careful consideration',
        severity: 'error'
      };
    }
  }, [riskAssessment?.score, theme]);

  /**
   * Risk factor configurations
   */
  const riskFactorConfigs = useMemo(() => ({
    'Smart Contract Vulnerabilities': {
      icon: SecurityIcon,
      color: theme.palette.error.main,
      severity: 'high'
    },
    'Liquidity Risk': {
      icon: RiskIcon,
      color: theme.palette.warning.main,
      severity: 'medium'
    },
    'Market Volatility': {
      icon: RiskIcon,
      color: theme.palette.info.main,
      severity: 'medium'
    },
    'Regulatory Risk': {
      icon: ShieldIcon,
      color: theme.palette.secondary.main,
      severity: 'low'
    },
    'Counterparty Risk': {
      icon: WarningIcon,
      color: theme.palette.warning.main,
      severity: 'medium'
    }
  }), [theme]);

  /**
   * Gets severity color based on risk factor
   * @param {string} factor - Risk factor name
   * @returns {string} Color for the factor
   */
  const getFactorColor = (factor) => {
    const config = riskFactorConfigs[factor];
    return config ? config.color : theme.palette.text.secondary;
  };

  /**
   * Gets severity icon based on risk factor
   * @param {string} factor - Risk factor name
   * @returns {React.Component} Icon component
   */
  const getFactorIcon = (factor) => {
    const config = riskFactorConfigs[factor];
    return config ? config.icon : InfoIcon;
  };

  /**
   * Renders a risk factor item
   * @param {string} factor - Risk factor name
   * @param {number} index - Index for animation delay
   * @returns {JSX.Element} Risk factor component
   */
  const renderRiskFactor = (factor, index) => {
    const IconComponent = getFactorIcon(factor);
    const color = getFactorColor(factor);

    return (
      <motion.div
        key={factor}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <ListItem
          sx={{
            bgcolor: `${color}10`,
            borderRadius: 2,
            mb: 1,
            border: `1px solid ${color}30`
          }}
        >
          <ListItemIcon>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: `${color}20`,
                color: color
              }}
            >
              <IconComponent fontSize="small" />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="body2" fontWeight="medium">
                {factor}
              </Typography>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {riskFactorConfigs[factor]?.severity || 'medium'} severity
              </Typography>
            }
          />
        </ListItem>
      </motion.div>
    );
  };

  /**
   * Renders a recommendation item
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
          <RecommendationIcon
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

  if (!riskAssessment) {
    return null;
  }

  const RiskIcon = getRiskConfig.icon;
  const riskScore = riskAssessment.score || 0;
  const riskFactors = riskAssessment.factors || [];
  const recommendations = riskAssessment.recommendations || [];

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
                bgcolor: getRiskConfig.color,
                mr: 2
              }}
            >
              <SecurityIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Risk Assessment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive risk analysis and mitigation strategies
              </Typography>
            </Box>
          </Box>

          {/* Risk Score Overview */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Alert
              severity={getRiskConfig.severity}
              icon={<RiskIcon />}
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
                    {getRiskConfig.level}
                  </Typography>
                  <Typography variant="body2">
                    {getRiskConfig.description}
                  </Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="h4" fontWeight="bold">
                    {riskScore}
                  </Typography>
                  <Typography variant="caption">
                    Risk Score
                  </Typography>
                </Box>
              </Box>
            </Alert>
          </motion.div>

          {/* Risk Score Progress */}
          <Box mb={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight="medium">
                Risk Level
              </Typography>
              <Typography variant="body2" color={getRiskConfig.color} fontWeight="bold">
                {riskScore}/100
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={riskScore}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: `${getRiskConfig.color}15`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: getRiskConfig.color,
                  borderRadius: 4
                }
              }}
            />
            <Box display="flex" justifyContent="space-between" mt={0.5}>
              <Typography variant="caption" color="text.secondary">
                Low Risk
              </Typography>
              <Typography variant="caption" color="text.secondary">
                High Risk
              </Typography>
            </Box>
          </Box>

          {/* Risk Factors */}
          {riskFactors.length > 0 && (
            <Box mb={3}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Risk Factors
              </Typography>
              <List sx={{ p: 0 }}>
                {riskFactors.slice(0, 5).map((factor, index) => 
                  renderRiskFactor(factor, index)
                )}
              </List>
              {riskFactors.length > 5 && (
                <Typography variant="caption" color="text.secondary">
                  +{riskFactors.length - 5} more factors identified
                </Typography>
              )}
            </Box>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Risk Mitigation
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Recommended actions to reduce risk exposure:
              </Typography>
              {recommendations.slice(0, 3).map((recommendation, index) => 
                renderRecommendation(recommendation, index)
              )}
              {recommendations.length > 3 && (
                <Tooltip title="View all recommendations">
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

          {/* Risk Categories */}
          <Box mt={3}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Risk assessment based on smart contract security, market conditions, and regulatory factors
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RiskAssessment;