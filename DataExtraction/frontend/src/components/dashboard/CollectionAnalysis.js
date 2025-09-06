/**
 * Collection Analysis Component
 * Displays comprehensive collection data including stats,
 * creator information, and market metrics
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
  Divider,
  LinearProgress,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Collections as CollectionIcon,
  Person as CreatorIcon,
  Inventory as ItemsIcon,
  People as OwnersIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import apiService from '../../services/ApiService';

const CollectionAnalysis = ({ collectionData, contractInfo }) => {
  const theme = useTheme();

  /**
   * Gets trend icon and color based on market trend
   * @param {string} trend - Market trend (up, down, stable)
   * @returns {Object} Icon component and color
   */
  const getTrendConfig = useMemo(() => {
    const trend = collectionData?.marketTrend?.toLowerCase();
    
    switch (trend) {
      case 'up':
      case 'bullish':
      case 'rising':
        return {
          icon: TrendingUpIcon,
          color: theme.palette.success.main,
          label: 'Bullish'
        };
      case 'down':
      case 'bearish':
      case 'falling':
        return {
          icon: TrendingDownIcon,
          color: theme.palette.error.main,
          label: 'Bearish'
        };
      default:
        return {
          icon: TrendingFlatIcon,
          color: theme.palette.warning.main,
          label: 'Stable'
        };
    }
  }, [collectionData?.marketTrend, theme]);

  /**
   * Calculates ownership distribution percentage
   * @returns {number} Percentage of unique owners
   */
  const ownershipDistribution = useMemo(() => {
    if (!collectionData?.totalItems || !collectionData?.uniqueOwners) {
      return 0;
    }
    return Math.min(100, (collectionData.uniqueOwners / collectionData.totalItems) * 100);
  }, [collectionData?.totalItems, collectionData?.uniqueOwners]);

  /**
   * Renders a metric card
   * @param {Object} config - Metric configuration
   * @returns {JSX.Element} Metric card component
   */
  const renderMetricCard = ({ icon: IconComponent, label, value, subtitle, color, tooltip }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        elevation={1}
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}20`,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <Tooltip title={tooltip}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: `${color}20`,
                  color: color,
                  mr: 1.5
                }}
              >
                <IconComponent fontSize="small" />
              </Avatar>
            </Tooltip>
            <Box flex={1}>
              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                {label}
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={color}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (!collectionData) {
    return null;
  }

  const TrendIcon = getTrendConfig.icon;

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
                bgcolor: theme.palette.primary.main,
                mr: 2
              }}
            >
              <CollectionIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Collection Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comprehensive collection metrics and market data
              </Typography>
            </Box>
          </Box>

          {/* Collection Info */}
          <Box mb={3}>
            <Box display="flex" alignItems="center" mb={2}>
              {collectionData.image && (
                <Avatar
                  src={collectionData.image}
                  alt={collectionData.name}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
              )}
              <Box flex={1}>
                <Typography variant="h6" fontWeight="bold">
                  {collectionData.name || contractInfo?.name || 'Unknown Collection'}
                </Typography>
                {collectionData.creator && (
                  <Box display="flex" alignItems="center" mt={0.5}>
                    <CreatorIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {apiService.formatAddress(collectionData.creator)}
                    </Typography>
                  </Box>
                )}
              </Box>
              <Box display="flex" alignItems="center">
                <TrendIcon sx={{ color: getTrendConfig.color, mr: 0.5 }} />
                <Chip
                  label={getTrendConfig.label}
                  size="small"
                  sx={{
                    bgcolor: `${getTrendConfig.color}20`,
                    color: getTrendConfig.color,
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>

            {/* Contract Info Chips */}
            <Box display="flex" flexWrap="wrap" gap={1}>
              {contractInfo?.symbol && (
                <Chip
                  label={contractInfo.symbol}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {contractInfo?.isVerified && (
                <Chip
                  icon={<VerifiedIcon />}
                  label="Verified"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
              {contractInfo?.totalSupply && (
                <Chip
                  label={`Supply: ${apiService.formatLargeNumber(contractInfo.totalSupply)}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Key Metrics Grid */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} sm={3}>
              {renderMetricCard({
                icon: ItemsIcon,
                label: 'Total Items',
                value: apiService.formatLargeNumber(collectionData.totalItems || 0),
                color: theme.palette.primary.main,
                tooltip: 'Total number of NFTs in the collection'
              })}
            </Grid>
            <Grid item xs={6} sm={3}>
              {renderMetricCard({
                icon: OwnersIcon,
                label: 'Unique Owners',
                value: apiService.formatLargeNumber(collectionData.uniqueOwners || 0),
                subtitle: `${ownershipDistribution.toFixed(1)}% distribution`,
                color: theme.palette.secondary.main,
                tooltip: 'Number of unique wallet addresses holding NFTs'
              })}
            </Grid>
            <Grid item xs={6} sm={3}>
              {renderMetricCard({
                icon: TrendingUpIcon,
                label: 'Floor Price',
                value: collectionData.floorPrice ? `${collectionData.floorPrice} ETH` : 'N/A',
                color: theme.palette.success.main,
                tooltip: 'Lowest listed price in the collection'
              })}
            </Grid>
            <Grid item xs={6} sm={3}>
              {renderMetricCard({
                icon: CollectionIcon,
                label: 'Volume Traded',
                value: collectionData.volumeTraded ? `${apiService.formatLargeNumber(collectionData.volumeTraded)} ETH` : 'N/A',
                color: theme.palette.info.main,
                tooltip: 'Total trading volume in ETH'
              })}
            </Grid>
          </Grid>

          {/* Ownership Distribution */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" fontWeight="medium">
                Ownership Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ownershipDistribution.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={ownershipDistribution}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: `${theme.palette.secondary.main}15`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: theme.palette.secondary.main,
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Higher percentage indicates better distribution among holders
            </Typography>
          </Box>

          {/* Additional Stats */}
          {(collectionData.averagePrice || collectionData.marketCap) && (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {collectionData.averagePrice && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Average Price
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {collectionData.averagePrice} ETH
                    </Typography>
                  </Grid>
                )}
                {collectionData.marketCap && (
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Market Cap
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {apiService.formatLargeNumber(collectionData.marketCap)} ETH
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CollectionAnalysis;