/**
 * Portfolio & Holdings Section Component
 * Displays portfolio composition and asset distribution
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { FiHome, FiTrendingUp, FiPieChart, FiDollarSign } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const PortfolioSection = ({ portfolioData, title = "Portfolio & Holdings" }) => {
  // Process portfolio data
  const portfolioMetrics = useMemo(() => {
    if (!portfolioData) return null;
    return {
      totalValue: portfolioData.totalValue || 0,
      totalAssets: portfolioData.totalAssets || 0,
      assets: portfolioData.assets || [],
      distribution: portfolioData.distribution || {},
      performance: portfolioData.performance || {},
      riskMetrics: portfolioData.riskMetrics || {},
      diversification: portfolioData.diversification || {}
    };
  }, [portfolioData]);

  // Prepare pie chart data for asset distribution
  const pieChartData = useMemo(() => {
    if (!portfolioMetrics?.distribution || Object.keys(portfolioMetrics.distribution).length === 0) {
      return [];
    }
    
    const colors = ['#1976d2', '#dc004e', '#9c27b0', '#00bcd4', '#4caf50', '#ff9800', '#f44336'];
    
    return Object.entries(portfolioMetrics.distribution).map(([key, value], index) => ({
      name: key,
      value: typeof value === 'number' ? value : 0,
      fill: colors[index % colors.length]
    }));
  }, [portfolioMetrics?.distribution]);

  // Prepare bar chart data for asset performance
  const barChartData = useMemo(() => {
    if (!portfolioMetrics?.assets || !Array.isArray(portfolioMetrics.assets)) {
      return [];
    }
    
    return portfolioMetrics.assets.slice(0, 10).map(asset => ({
      name: asset.name || 'Unknown',
      value: asset.value || 0,
      change: asset.change || 0
    }));
  }, [portfolioMetrics?.assets]);

  // Check if we have data to display
  if (!portfolioData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FiHome color="gray" style={{ marginRight: 8 }} />
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Alert severity="info">
            <Typography variant="body2">
              Portfolio data is not available for this analysis.
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

  const formatPercentage = (value) => {
    if (typeof value !== 'number') return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <FiHome color="blue" style={{ marginRight: 8 }} />
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>

        {/* Portfolio Overview */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            Portfolio Overview
          </Typography>
          
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={1}>
                <Typography variant="h6" color="primary">
                  {formatCurrency(portfolioMetrics.totalValue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Value
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={1}>
                <Typography variant="h6" color="secondary.main">
                  {portfolioMetrics.totalAssets}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Assets
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={1}>
                <Typography variant="h6" color="success.main">
                  {formatPercentage(portfolioMetrics.performance?.totalReturn || 0)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Return
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center" p={1}>
                <Typography variant="h6" color="warning.main">
                  {portfolioMetrics.riskMetrics?.volatility?.toFixed(1) || 'N/A'}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Volatility
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Asset Distribution Chart */}
        {pieChartData.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Asset Distribution
            </Typography>
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => [formatCurrency(value), 'Value']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}

        {/* Top Assets Performance */}
        {barChartData.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Top Assets Performance
            </Typography>
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => [formatCurrency(value), 'Value']}
                  />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}

        {/* Assets Table */}
        {portfolioMetrics.assets.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Asset Details
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Asset</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">Change</TableCell>
                    <TableCell align="right">% of Portfolio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolioMetrics.assets.slice(0, 10).map((asset, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body2">
                            {asset.name || 'Unknown Asset'}
                          </Typography>
                          {asset.trustScore && (
                            <Chip
                              label={asset.trustScore}
                              size="small"
                              color={asset.trustScore >= 80 ? 'success' : 
                                     asset.trustScore >= 60 ? 'warning' : 'error'}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(asset.value)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={formatPercentage(asset.change)}
                          size="small"
                          color={getChangeColor(asset.change)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        {asset.percentage ? `${asset.percentage.toFixed(1)}%` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Diversification Metrics */}
        {portfolioMetrics.diversification && Object.keys(portfolioMetrics.diversification).length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Diversification Metrics
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {Object.entries(portfolioMetrics.diversification).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key}: ${typeof value === 'number' ? value.toFixed(1) : value}`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Risk Metrics */}
        {portfolioMetrics.riskMetrics && Object.keys(portfolioMetrics.riskMetrics).length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Risk Metrics
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(portfolioMetrics.riskMetrics).map(([key, value]) => (
                <Grid item xs={6} sm={4} key={key}>
                  <Box textAlign="center" p={1}>
                    <Typography variant="h6" color="warning.main">
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {key}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Data Quality Indicators */}
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          <Chip 
            label="Portfolio Data" 
            size="small" 
            color="success" 
            icon={<FiHome />}
          />
          {portfolioMetrics.assets.length > 0 && (
            <Chip 
              label={`${portfolioMetrics.assets.length} Assets`} 
              size="small" 
              color="info" 
            />
          )}
          {pieChartData.length > 0 && (
            <Chip 
              label="Distribution Data" 
              size="small" 
              color="success" 
            />
          )}
          {portfolioMetrics.performance && (
            <Chip 
              label="Performance Data" 
              size="small" 
              color="success" 
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PortfolioSection;
