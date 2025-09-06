/**
 * Summary & Segmentation Section Component
 * Displays overall analysis summary and market positioning
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
  Divider
} from '@mui/material';
import { FiZap, FiTrendingUp, FiBarChart2, FiStar } from 'react-icons/fi';
import { RadialBarChart, RadialBar, ResponsiveContainer, Cell } from 'recharts';

const SummarySegmentationSection = ({ 
  summary, 
  marketSegment, 
  marketPositionScore, 
  title = "Summary & Segmentation" 
}) => {
  // Process summary data
  const summaryMetrics = useMemo(() => {
    if (!summary) return null;
    
    return {
      overall: summary.overall || 'No summary available',
      keyPoints: summary.keyPoints || [],
      recommendations: summary.recommendations || [],
      riskLevel: summary.riskLevel || 'Unknown',
      investmentGrade: summary.investmentGrade || 'Unknown',
      confidence: summary.confidence || 0
    };
  }, [summary]);

  // Process market segment data
  const segmentMetrics = useMemo(() => {
    if (!marketSegment) return null;
    
    return {
      category: marketSegment.category || 'Unknown',
      subcategory: marketSegment.subcategory || null,
      characteristics: marketSegment.characteristics || [],
      trends: marketSegment.trends || [],
      competitors: marketSegment.competitors || [],
      marketSize: marketSegment.marketSize || null,
      growthRate: marketSegment.growthRate || null
    };
  }, [marketSegment]);

  // Process market position score
  const positionMetrics = useMemo(() => {
    if (!marketPositionScore) return null;
    
    return {
      score: marketPositionScore.score || 0,
      rank: marketPositionScore.rank || null,
      percentile: marketPositionScore.percentile || null,
      factors: marketPositionScore.factors || [],
      strengths: marketPositionScore.strengths || [],
      weaknesses: marketPositionScore.weaknesses || []
    };
  }, [marketPositionScore]);

  // Prepare radial chart data for market position
  const radialChartData = useMemo(() => {
    if (!positionMetrics) return [];
    
    return [
      {
        name: 'Market Position',
        value: positionMetrics.score,
        fill: positionMetrics.score >= 80 ? '#4caf50' : 
              positionMetrics.score >= 60 ? '#ff9800' : '#f44336'
      }
    ];
  }, [positionMetrics]);

  // Check if we have any data to display
  const hasData = summary || marketSegment || marketPositionScore;
  
  if (!hasData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FiZap color="gray" style={{ marginRight: 8 }} />
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Alert severity="info">
            <Typography variant="body2">
              Summary and segmentation data is not available for this analysis.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const getInvestmentGradeColor = (grade) => {
    switch (grade?.toLowerCase()) {
      case 'a': return 'success';
      case 'b': return 'info';
      case 'c': return 'warning';
      case 'd': return 'error';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <FiZap color="blue" style={{ marginRight: 8 }} />
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>

        {/* Overall Summary */}
        {summaryMetrics && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Analysis Summary
            </Typography>
            
            <Typography variant="body1" color="text.primary" mb={2}>
              {summaryMetrics.overall}
            </Typography>

            {/* Summary Metrics */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={6} sm={4}>
                <Box textAlign="center" p={1}>
                  <Chip
                    label={summaryMetrics.riskLevel}
                    color={getRiskColor(summaryMetrics.riskLevel)}
                    variant="filled"
                  />
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Risk Level
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box textAlign="center" p={1}>
                  <Chip
                    label={summaryMetrics.investmentGrade}
                    color={getInvestmentGradeColor(summaryMetrics.investmentGrade)}
                    variant="filled"
                  />
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Investment Grade
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Box textAlign="center" p={1}>
                  <Typography variant="h6" color="primary">
                    {summaryMetrics.confidence}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Confidence
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Key Points */}
            {summaryMetrics.keyPoints.length > 0 && (
              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Key Points:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {summaryMetrics.keyPoints.slice(0, 5).map((point, index) => (
                    <Chip
                      key={index}
                      label={point}
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  ))}
                  {summaryMetrics.keyPoints.length > 5 && (
                    <Chip
                      label={`+${summaryMetrics.keyPoints.length - 5} more`}
                      size="small"
                      color="default"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            )}

            {/* Recommendations */}
            {summaryMetrics.recommendations.length > 0 && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Recommendations:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {summaryMetrics.recommendations.slice(0, 3).map((rec, index) => (
                    <Chip
                      key={index}
                      label={rec}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  ))}
                  {summaryMetrics.recommendations.length > 3 && (
                    <Chip
                      label={`+${summaryMetrics.recommendations.length - 3} more`}
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

        {/* Market Segment */}
        {segmentMetrics && (
          <Box mb={3}>
            {summaryMetrics && <Divider sx={{ mb: 2 }} />}
            <Typography variant="subtitle1" gutterBottom>
              Market Segmentation
            </Typography>
            
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>
                {segmentMetrics.category}
                {segmentMetrics.subcategory && (
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    - {segmentMetrics.subcategory}
                  </Typography>
                )}
              </Typography>
            </Box>

            {/* Market Metrics */}
            <Grid container spacing={2} mb={2}>
              {segmentMetrics.marketSize && (
                <Grid item xs={6}>
                  <Box textAlign="center" p={1}>
                    <Typography variant="h6" color="primary">
                      {segmentMetrics.marketSize}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Market Size
                    </Typography>
                  </Box>
                </Grid>
              )}
              {segmentMetrics.growthRate && (
                <Grid item xs={6}>
                  <Box textAlign="center" p={1}>
                    <Typography variant="h6" color="success.main">
                      {segmentMetrics.growthRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Growth Rate
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Characteristics */}
            {segmentMetrics.characteristics.length > 0 && (
              <Box mb={2}>
                <Typography variant="body2" gutterBottom>
                  Characteristics:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {segmentMetrics.characteristics.slice(0, 4).map((char, index) => (
                    <Chip
                      key={index}
                      label={char}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                  {segmentMetrics.characteristics.length > 4 && (
                    <Chip
                      label={`+${segmentMetrics.characteristics.length - 4} more`}
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

        {/* Market Position Score */}
        {positionMetrics && (
          <Box mb={3}>
            {(summaryMetrics || segmentMetrics) && <Divider sx={{ mb: 2 }} />}
            <Typography variant="subtitle1" gutterBottom>
              Market Position Score
            </Typography>
            
            <Box display="flex" alignItems="center" gap={3} mb={2}>
              <Box position="relative" display="inline-flex">
                <ResponsiveContainer width={100} height={100}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialChartData}>
                    <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                  </RadialBarChart>
                </ResponsiveContainer>
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                >
                  <Typography variant="h6" color="text.secondary">
                    {positionMetrics.score}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="h6" color="primary">
                  {positionMetrics.score}/100
                </Typography>
                {positionMetrics.rank && (
                  <Typography variant="body2" color="text.secondary">
                    Rank: #{positionMetrics.rank}
                  </Typography>
                )}
                {positionMetrics.percentile && (
                  <Typography variant="body2" color="text.secondary">
                    Percentile: {positionMetrics.percentile}%
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Strengths and Weaknesses */}
            <Grid container spacing={2}>
              {positionMetrics.strengths.length > 0 && (
                <Grid item xs={6}>
                  <Typography variant="body2" gutterBottom color="success.main">
                    Strengths:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {positionMetrics.strengths.slice(0, 3).map((strength, index) => (
                      <Chip
                        key={index}
                        label={strength}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
              {positionMetrics.weaknesses.length > 0 && (
                <Grid item xs={6}>
                  <Typography variant="body2" gutterBottom color="error.main">
                    Weaknesses:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5}>
                    {positionMetrics.weaknesses.slice(0, 3).map((weakness, index) => (
                      <Chip
                        key={index}
                        label={weakness}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Data Quality Indicators */}
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          {summary && (
            <Chip 
              label="Summary" 
              size="small" 
              color="success" 
              icon={<FiBarChart2 />}
            />
          )}
          {marketSegment && (
            <Chip 
              label="Market Segment" 
              size="small" 
              color="success" 
              icon={<FiTrendingUp />}
            />
          )}
          {marketPositionScore && (
            <Chip 
              label="Position Score" 
              size="small" 
              color="success" 
              icon={<FiStar />}
            />
          )}
          {!summary && (
            <Chip 
              label="No Summary" 
              size="small" 
              color="error" 
            />
          )}
          {!marketSegment && (
            <Chip 
              label="No Market Segment" 
              size="small" 
              color="error" 
            />
          )}
          {!marketPositionScore && (
            <Chip 
              label="No Position Score" 
              size="small" 
              color="error" 
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SummarySegmentationSection;
