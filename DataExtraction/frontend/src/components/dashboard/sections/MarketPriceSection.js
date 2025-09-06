/**
 * Market & Price Analysis Section Component
 * Displays market data and price analysis with professional visualizations
 */

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Alert,
  LinearProgress,
  Tooltip
} from '@mui/material';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AnimatedNumber from '../../ui/AnimatedNumber';
import { DataValidation, FallbackComponents } from '../../../utils/fallbackHandling';

const MarketPriceSection = ({ marketData, priceData, title = "Market & Price Analysis" }) => {
  // Process market data for visualization with safe accessors
  const marketMetrics = useMemo(() => {
    if (!marketData) return null;
    
    return {
      marketCap: DataValidation.safeNumber(marketData.marketCap, 0),
      volume24h: DataValidation.safeNumber(marketData.volume24h, 0),
      totalSupply: DataValidation.safeNumber(marketData.totalSupply, 0),
      holders: DataValidation.safeNumber(marketData.holders, 0),
      liquidity: DataValidation.safeNumber(marketData.liquidity, 0),
      volatility: DataValidation.safeNumber(marketData.volatility, 0)
    };
  }, [marketData]);

  // Process price data for visualization with safe accessors
  const priceMetrics = useMemo(() => {
    if (!priceData) return null;
    
    const current = DataValidation.safeNumber(priceData.current, 0);
    const previous = DataValidation.safeNumber(priceData.previous, current);
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;
    
    return {
      current,
      previous,
      change,
      changePercent,
      currency: DataValidation.safeString(priceData.currency, 'ETH'),
      history: DataValidation.safeArray(priceData.history, []),
      prediction: DataValidation.safeObject(priceData.prediction, null)
    };
  }, [priceData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!priceMetrics?.history || !Array.isArray(priceMetrics.history)) {
      return [];
    }
    
    return priceMetrics.history.slice(-30).map((item, index) => ({
      time: index,
      price: typeof item === 'object' ? item.price : item,
      volume: typeof item === 'object' ? item.volume : null
    }));
  }, [priceMetrics]);

  // Check if we have any data to display
  const hasData = marketData || priceData;
  
  if (!hasData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FiTrendingUp color="gray" style={{ marginRight: 8 }} />
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Alert severity="info">
            <Typography variant="body2">
              Market and price data is not available for this analysis.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value, currency = 'ETH') => {
    if (typeof value !== 'number') return 'N/A';
    return `${value.toFixed(4)} ${currency}`;
  };

  const formatNumber = (value) => {
    if (typeof value !== 'number') return 'N/A';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <FiTrendingUp color="green" style={{ marginRight: 8 }} />
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>

        {/* Price Overview */}
        {priceMetrics && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Current Price
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <AnimatedNumber 
                value={priceMetrics.current}
                format="eth"
                precision={4}
                variant="h4"
                color="primary"
              />
              {priceMetrics.change !== 0 && (
                <Chip
                  icon={priceMetrics.change > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  label={`${priceMetrics.change > 0 ? '+' : ''}${priceMetrics.changePercent.toFixed(2)}%`}
                  color={priceMetrics.change > 0 ? 'success' : 'error'}
                  variant="filled"
                />
              )}
            </Box>
            
            {/* Price Change Details */}
            <Box display="flex" gap={2} flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                Previous: {formatCurrency(priceMetrics.previous, priceMetrics.currency)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Change: {formatCurrency(priceMetrics.change, priceMetrics.currency)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Market Metrics */}
        {marketMetrics && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Market Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={1}>
                  <AnimatedNumber 
                    value={marketMetrics.marketCap}
                    format="compact"
                    precision={1}
                    variant="h6"
                    color="primary"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Market Cap
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={1}>
                  <AnimatedNumber 
                    value={marketMetrics.volume24h}
                    format="compact"
                    precision={1}
                    variant="h6"
                    color="info.main"
                  />
                  <Typography variant="caption" color="text.secondary">
                    24h Volume
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={1}>
                  <AnimatedNumber 
                    value={marketMetrics.holders}
                    format="compact"
                    precision={0}
                    variant="h6"
                    color="secondary.main"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Holders
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={1}>
                  <AnimatedNumber 
                    value={marketMetrics.volatility}
                    format="percentage"
                    precision={1}
                    variant="h6"
                    color="warning.main"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Volatility
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Price Chart */}
        {chartData.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Price History (Last 30 periods)
            </Typography>
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => [formatCurrency(value), 'Price']}
                    labelFormatter={(label) => `Period ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#1976d2" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}

        {/* Prediction */}
        {priceMetrics?.prediction && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Price Prediction
            </Typography>
            <Alert severity="info">
              <Typography variant="body2">
                Predicted price: {formatCurrency(priceMetrics.prediction.price, priceMetrics.currency)}
                {priceMetrics.prediction.confidence && (
                  <span> (Confidence: {priceMetrics.prediction.confidence}%)</span>
                )}
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Data Quality Indicators */}
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          {marketData && (
            <Chip 
              label="Market Data" 
              size="small" 
              color="success" 
              icon={<FiBarChart2 />}
            />
          )}
          {priceData && (
            <Chip 
              label="Price Data" 
              size="small" 
              color="success" 
              icon={<FiDollarSign />}
            />
          )}
          {!marketData && (
            <Chip 
              label="No Market Data" 
              size="small" 
              color="error" 
            />
          )}
          {!priceData && (
            <Chip 
              label="No Price Data" 
              size="small" 
              color="error" 
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MarketPriceSection;
