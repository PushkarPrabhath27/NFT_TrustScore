/**
 * Trust Score Overview Component
 * Displays the overall trust score with visual indicators,
 * key factors, and recommendations
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AccountBalance as LiquidityIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import apiService from '../../services/ApiService';

const TrustScoreOverview = ({ trustScore, contractInfo }) => {
  const theme = useTheme();

  /**
   * Gets the color and icon based on trust score
   * @param {number} score - Trust score (0-100)
   * @returns {Object} Color and icon configuration
   */
  const getScoreConfig = useMemo(() => {
    const score = trustScore?.overall || 0;
    
    if (score >= 80) {
      return {
        color: theme.palette.success.main,
        bgColor: theme.palette.success.light,
        icon: CheckIcon,
        label: 'Excellent',
        description: 'High trust score with strong fundamentals'
      };
    } else if (score >= 60) {
      return {
        color: theme.palette.warning.main,
        bgColor: theme.palette.warning.light,
        icon: WarningIcon,
        label: 'Good',
        description: 'Moderate trust score with some areas for improvement'
      };
    } else {
      return {
        color: theme.palette.error.main,
        bgColor: theme.palette.error.light,
        icon: ErrorIcon,
        label: 'Poor',
        description: 'Low trust score with significant risks'
      };
    }
  }, [trustScore?.overall, theme]);

  /**
   * Factor configurations for display
   */
  const factorConfigs = useMemo(() => ({
    security: {
      icon: SecurityIcon,
      label: 'Security',
      color: theme.palette.primary.main,
      description: 'Smart contract security and audit status'
    },
    activity: {
      icon: TrendingUpIcon,
      label: 'Activity',
      color: theme.palette.info.main,
      description: 'Trading volume and transaction activity'
    },
    community: {
      icon: PeopleIcon,
      label: 'Community',
      color: theme.palette.secondary.main,
      description: 'Community engagement and social presence'
    },
    liquidity: {
      icon: LiquidityIcon,
      label: 'Liquidity',
      color: theme.palette.success.main,
      description: 'Market liquidity and trading depth'
    }
  }), [theme]);

  /**
   * Renders a factor score with progress bar
   * @param {string} factorKey - Factor key
   * @param {number} score - Factor score
   * @returns {JSX.Element} Factor component
   */
  const renderFactor = (factorKey, score) => {
    const config = factorConfigs[factorKey];
    if (!config) return null;

    const IconComponent = config.icon;
    const normalizedScore = Math.max(0, Math.min(100, score || 0));

    return (
      <motion.div
        key={factorKey}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Box sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Tooltip title={config.description}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: `${config.color}20`,
                  color: config.color,
                  mr: 1.5
                }}
              >
                <IconComponent fontSize="small" />
              </Avatar>
            </Tooltip>
            <Box flex={1}>
              <Typography variant="body2" fontWeight="medium">
                {config.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {normalizedScore}/100
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="bold" color={config.color}>
              {normalizedScore}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={normalizedScore}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: `${config.color}15`,
              '& .MuiLinearProgress-bar': {
                bgcolor: config.color,
                borderRadius: 3
              }
            }}
          />
        </Box>
      </motion.div>
    );
  };

  /**
   * Renders contract verification status
   */
  const renderVerificationStatus = () => {
    if (!contractInfo) return null;

    return (
      <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
        {contractInfo.isVerified && (
          <Chip
            icon={<VerifiedIcon />}
            label="Verified Contract"
            color="success"
            variant="outlined"
            size="small"
          />
        )}
        {contractInfo.standard && (
          <Chip
            label={contractInfo.standard}
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
        {contractInfo.symbol && (
          <Chip
            label={contractInfo.symbol}
            color="default"
            variant="outlined"
            size="small"
          />
        )}
      </Box>
    );
  };

  if (!trustScore) {
    return null;
  }

  const ScoreIcon = getScoreConfig.icon;
  const overallScore = trustScore.overall || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        elevation={3}
        sx={{
          background: `linear-gradient(135deg, ${getScoreConfig.bgColor}20 0%, ${getScoreConfig.bgColor}10 100%)`,
          border: `1px solid ${getScoreConfig.color}30`,
          borderRadius: 3
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Overall Trust Score */}
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: getScoreConfig.color,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <ScoreIcon sx={{ fontSize: 40 }} />
                  </Avatar>
                </motion.div>
                
                <Typography variant="h3" fontWeight="bold" color={getScoreConfig.color}>
                  {overallScore}
                </Typography>
                <Typography variant="h6" color={getScoreConfig.color} gutterBottom>
                  {getScoreConfig.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {getScoreConfig.description}
                </Typography>
                
                {renderVerificationStatus()}
              </Box>
            </Grid>

            {/* Factor Breakdown */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Trust Factors
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  {renderFactor('security', trustScore.factors?.security)}
                  {renderFactor('community', trustScore.factors?.community)}
                </Grid>
                <Grid item xs={12} sm={6}>
                  {renderFactor('activity', trustScore.factors?.activity)}
                  {renderFactor('liquidity', trustScore.factors?.liquidity)}
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Recommendations */}
          {trustScore.recommendations && trustScore.recommendations.length > 0 && (
            <Box mt={3}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Recommendations
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                {trustScore.recommendations.slice(0, 3).map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        • {recommendation}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Box>
          )}

          {/* Last Updated */}
          <Box mt={2} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Trust score calculated based on security, activity, community engagement, and market liquidity
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TrustScoreOverview;