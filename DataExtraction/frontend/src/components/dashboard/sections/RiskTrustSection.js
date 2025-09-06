/**
 * Risk & Trust Assessment Section Component
 * Displays risk analysis, fraud detection, and trust scoring
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
  Tooltip,
  CircularProgress
} from '@mui/material';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiX, FiGavel } from 'react-icons/fi';
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RiskTrustSection = ({ 
  riskData, 
  fraudData, 
  trustScoreData, 
  title = "Risk & Trust Assessment" 
}) => {
  // Process risk data
  const riskMetrics = useMemo(() => {
    if (!riskData) return null;
    
    return {
      overallRisk: riskData.overallRisk || 'Unknown',
      riskScore: riskData.riskScore || 0,
      factors: riskData.factors || [],
      volatility: riskData.volatility || 0,
      liquidity: riskData.liquidity || 0,
      marketCap: riskData.marketCap || 0
    };
  }, [riskData]);

  // Process fraud data
  const fraudMetrics = useMemo(() => {
    if (!fraudData) return null;
    
    return {
      fraudScore: fraudData.fraudScore || 0,
      alertLevel: fraudData.alertLevel || 'Unknown',
      indicators: fraudData.indicators || [],
      confidence: fraudData.confidence || 0
    };
  }, [fraudData]);

  // Process trust score data
  const trustMetrics = useMemo(() => {
    if (!trustScoreData) return null;
    
    return {
      score: trustScoreData.score || 0,
      confidence: trustScoreData.confidence || 'Unknown',
      factors: trustScoreData.factors || [],
      breakdown: trustScoreData.breakdown || {}
    };
  }, [trustScoreData]);

  // Prepare trust score chart data
  const trustChartData = useMemo(() => {
    if (!trustMetrics?.breakdown) return [];
    
    return Object.entries(trustMetrics.breakdown).map(([key, value]) => ({
      name: key,
      value: typeof value === 'number' ? value : 0,
      fill: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));
  }, [trustMetrics]);

  // Check if we have any data to display
  const hasData = riskData || fraudData || trustScoreData;
  
  if (!hasData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FiShield color="gray" style={{ marginRight: 8 }} />
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Alert severity="info">
            <Typography variant="body2">
              Risk, fraud, and trust assessment data is not available for this analysis.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Get risk level color
  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  // Get fraud alert color
  const getFraudColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <FiShield color="blue" style={{ marginRight: 8 }} />
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>

        {/* Trust Score Overview */}
        {trustMetrics && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Trust Score
            </Typography>
            <Box display="flex" alignItems="center" gap={3}>
              <Box position="relative" display="inline-flex">
                <CircularProgress
                  variant="determinate"
                  value={trustMetrics.score}
                  size={80}
                  thickness={4}
                  color={trustMetrics.score >= 80 ? 'success' : 
                         trustMetrics.score >= 60 ? 'warning' : 'error'}
                />
                <Box
                  top={0}
                  left={0}
                  bottom={0}
                  right={0}
                  position="absolute"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography variant="h6" component="div" color="text.secondary">
                    {trustMetrics.score}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="h6" color="primary">
                  {trustMetrics.score}/100
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Confidence: {trustMetrics.confidence}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Risk Assessment */}
        {riskMetrics && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Risk Assessment
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Chip
                icon={<FiAlertTriangle />}
                label={riskMetrics.overallRisk}
                color={getRiskColor(riskMetrics.overallRisk)}
                variant="filled"
              />
              <Typography variant="body2" color="text.secondary">
                Risk Score: {riskMetrics.riskScore}/100
              </Typography>
            </Box>
            
            {/* Risk Factors */}
            {riskMetrics.factors.length > 0 && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Risk Factors:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {riskMetrics.factors.slice(0, 5).map((factor, index) => (
                    <Chip
                      key={index}
                      label={typeof factor === 'string' ? factor : factor.name || 'Unknown'}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  ))}
                  {riskMetrics.factors.length > 5 && (
                    <Chip
                      label={`+${riskMetrics.factors.length - 5} more`}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Fraud Detection */}
        {fraudMetrics && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Fraud Detection
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Chip
                icon={<FiShield />}
                label={fraudMetrics.alertLevel}
                color={getFraudColor(fraudMetrics.alertLevel)}
                variant="filled"
              />
              <Typography variant="body2" color="text.secondary">
                Fraud Score: {fraudMetrics.fraudScore}/100
              </Typography>
            </Box>
            
            {/* Fraud Indicators */}
            {fraudMetrics.indicators.length > 0 && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Fraud Indicators:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {fraudMetrics.indicators.slice(0, 3).map((indicator, index) => (
                    <Chip
                      key={index}
                      label={typeof indicator === 'string' ? indicator : indicator.name || 'Unknown'}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  ))}
                  {fraudMetrics.indicators.length > 3 && (
                    <Chip
                      label={`+${fraudMetrics.indicators.length - 3} more`}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Trust Score Breakdown Chart */}
        {trustChartData.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Trust Score Breakdown
            </Typography>
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trustChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {trustChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}

        {/* Data Quality Indicators */}
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          {riskData && (
            <Chip 
              label="Risk Data" 
              size="small" 
              color="success" 
              icon={<FiAlertTriangle />}
            />
          )}
          {fraudData && (
            <Chip 
              label="Fraud Data" 
              size="small" 
              color="success" 
              icon={<FiShield />}
            />
          )}
          {trustScoreData && (
            <Chip 
              label="Trust Score" 
              size="small" 
              color="success" 
              icon={<FiCheckCircle />}
            />
          )}
          {!riskData && (
            <Chip 
              label="No Risk Data" 
              size="small" 
              color="error" 
            />
          )}
          {!fraudData && (
            <Chip 
              label="No Fraud Data" 
              size="small" 
              color="error" 
            />
          )}
          {!trustScoreData && (
            <Chip 
              label="No Trust Score" 
              size="small" 
              color="error" 
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RiskTrustSection;
