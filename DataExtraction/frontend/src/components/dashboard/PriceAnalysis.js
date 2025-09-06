/**
 * Price Analysis Component
 * Displays comprehensive price data including current price,
 * historical trends, volume analysis, and market metrics
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
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  AttachMoney as PriceIcon,
  BarChart as VolumeIcon,
  Timeline as ChartIcon,
  ShowChart as AnalyticsIcon,
  AccountBalance as MarketIcon
} from '@mui/icons-material';
import apiService from '../../services/ApiService';

const PriceAnalysis = ({ priceData }) => {
  const theme = useTheme();

  /**
   * Gets trend configuration based on 24h change
   * @param {number} change - 24h price change percentage
   * @returns {Object} Trend configuration
   */
  const getTrendConfig = useMemo(() => {
    const change = priceData?.change24h || 0;
    
    if (change > 0) {
      return {
        icon: TrendingUpIcon,
        color: theme.palette.success.main,
        label: 'Bullish',
        direction: 'up'
      };
    } else if (change < 0) {
      return {
        icon: TrendingDownIcon,
        color: theme.palette.error.main,
        label: 'Bearish',
        direction: 'down'
      };
    } else {
      return {
        icon: TrendingFlatIcon,
        color: theme.palette.warning.main,
        label: 'Stable',
        direction: 'flat'
      };
    }
  }, [priceData?.change24h, theme]);

  /**
   * Calculates price performance metrics
   * @returns {Object} Performance metrics
   */
  const performanceMetrics = useMemo(() => {
    if (!priceData) return {};
    
    const current = priceData.currentPrice || 0;
    const ath = priceData.allTimeHigh || 0;
    const atl = priceData.allTimeLow || 0;
    
    return {
      athDistance: ath > 0 ? ((current - ath) / ath * 100) : 0,
      atlDistance: atl > 0 ? ((current - atl) / atl * 100) : 0,
      priceRange: ath > 0 && atl > 0 ? ((current - atl) / (ath - atl) * 100) : 0
    };
  }, [priceData]);

  /**
   * Renders a price metric card
   * @param {Object} config - Metric configuration
   * @returns {JSX.Element} Metric card component
   */
  const renderPriceMetric = ({ icon: IconComponent, label, value, subtitle, color, tooltip, trend }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
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
              <Box display="flex" alignItems="center">
                <Typography variant="h6" fontWeight="bold" color={color}>
                  {value}
                </Typography>
                {trend && (
                  <Chip
                    size="small"
                    label={trend}
                    sx={{
                      ml: 1,
                      height: 20,
                      fontSize: '0.7rem',
                      bgcolor: `${color}20`,
                      color: color
                    }}
                  />
                )}
              </Box>
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

  /**
   * Renders a simple price history chart using CSS
   * @param {Array} history - Price history data
   * @returns {JSX.Element} Chart component
   */
  const renderPriceChart = (history) => {
    if (!history || history.length === 0) return null;
    
    const maxPrice = Math.max(...history.map(h => h.price));
    const minPrice = Math.min(...history.map(h => h.price));
    const priceRange = maxPrice - minPrice;
    
    return (
      <Box sx={{ height: 100, position: 'relative', mt: 2 }}>
        <Typography variant="body2" fontWeight="medium" gutterBottom>
          Price Trend (Last 7 Days)
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'end',
            height: 60,
            gap: 1,
            px: 1
          }}
        >
          {history.slice(-7).map((point, index) => {
            const height = priceRange > 0 ? ((point.price - minPrice) / priceRange * 50) + 10 : 30;
            return (
              <Tooltip key={index} title={`${apiService.formatDate(new Date(point.date))}: ${point.price} ETH`}>
                <Box
                  sx={{
                    flex: 1,
                    height: `${height}px`,
                    bgcolor: getTrendConfig.color,
                    borderRadius: 1,
                    opacity: 0.7 + (index * 0.1),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      opacity: 1,
                      transform: 'scaleY(1.1)'
                    }
                  }}
                />
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    );
  };

  if (!priceData) {
    return null;
  }

  const TrendIcon = getTrendConfig.icon;
  const change24h = priceData.change24h || 0;
  const changeFormatted = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`;

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
              <AnalyticsIcon />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Price Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current pricing and market performance metrics
              </Typography>
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

          {/* Current Price Section */}
          <Box mb={3} textAlign="center">
            <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
              {priceData.currentPrice ? `${priceData.currentPrice} ETH` : 'N/A'}
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
              <TrendIcon sx={{ color: getTrendConfig.color }} />
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                color={getTrendConfig.color}
              >
                {changeFormatted}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (24h)
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Key Metrics Grid */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} sm={3}>
              {renderPriceMetric({
                icon: VolumeIcon,
                label: '24h Volume',
                value: priceData.volume24h ? 
                  `${apiService.formatLargeNumber(priceData.volume24h)} ETH` : 'N/A',
                color: theme.palette.info.main,
                tooltip: 'Trading volume in the last 24 hours'
              })}
            </Grid>
            <Grid item xs={6} sm={3}>
              {renderPriceMetric({
                icon: MarketIcon,
                label: 'Market Cap',
                value: priceData.marketCap ? 
                  `${apiService.formatLargeNumber(priceData.marketCap)} ETH` : 'N/A',
                color: theme.palette.secondary.main,
                tooltip: 'Total market capitalization'
              })}
            </Grid>
            <Grid item xs={6} sm={3}>
              {renderPriceMetric({
                icon: TrendingUpIcon,
                label: 'All Time High',
                value: priceData.allTimeHigh ? 
                  `${priceData.allTimeHigh} ETH` : 'N/A',
                subtitle: performanceMetrics.athDistance ? 
                  `${performanceMetrics.athDistance.toFixed(1)}% from ATH` : '',
                color: theme.palette.success.main,
                tooltip: 'Highest price ever recorded'
              })}
            </Grid>
            <Grid item xs={6} sm={3}>
              {renderPriceMetric({
                icon: TrendingDownIcon,
                label: 'All Time Low',
                value: priceData.allTimeLow ? 
                  `${priceData.allTimeLow} ETH` : 'N/A',
                subtitle: performanceMetrics.atlDistance ? 
                  `+${performanceMetrics.atlDistance.toFixed(0)}% from ATL` : '',
                color: theme.palette.error.main,
                tooltip: 'Lowest price ever recorded'
              })}
            </Grid>
          </Grid>

          {/* Price Range Indicator */}
          {performanceMetrics.priceRange > 0 && (
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="medium">
                  Price Position (ATL to ATH)
                </Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">
                  {performanceMetrics.priceRange.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, performanceMetrics.priceRange))}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: `${theme.palette.primary.main}15`,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: theme.palette.primary.main,
                    borderRadius: 4
                  }
                }}
              />
              <Box display="flex" justifyContent="space-between" mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  ATL: {priceData.allTimeLow} ETH
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ATH: {priceData.allTimeHigh} ETH
                </Typography>
              </Box>
            </Box>
          )}

          {/* Price History Chart */}
          {priceData.history && priceData.history.length > 0 && (
            <Box>
              {renderPriceChart(priceData.history)}
            </Box>
          )}

          {/* Additional Price Metrics */}
          {(priceData.averagePrice || priceData.volatility) && (
            <Box mt={3}>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {priceData.averagePrice && (
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary">
                        Average Price (30d)
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {priceData.averagePrice} ETH
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {priceData.volatility && (
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="body2" color="text.secondary">
                        Volatility
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {priceData.volatility}%
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Footer */}
          <Box mt={3} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Price data updated in real-time from multiple exchanges
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PriceAnalysis;