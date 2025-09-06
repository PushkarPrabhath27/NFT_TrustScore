import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, List, ListItem, ListItemText } from '@mui/material';

const TrustScore = ({ trustScoreData }) => {
  console.log('[TrustScore] Component rendered with data:', {
    hasData: !!trustScoreData,
    dataType: typeof trustScoreData,
    dataKeys: trustScoreData ? Object.keys(trustScoreData) : [],
    score: trustScoreData?.score,
    confidence: trustScoreData?.confidence
  });
  
  if (!trustScoreData) {
    console.log('[TrustScore] No trust score data available');
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Trust Score</Typography>
          <Typography color="text.secondary">No trust score data available.</Typography>
        </CardContent>
      </Card>
    );
  }
  
  const { score = 0, confidence = 'Unknown', factors = [] } = trustScoreData;
  console.log('[TrustScore] Extracted values:', { score, confidence, factorsCount: factors.length });
  
  // Handle null or invalid score
  const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  const validConfidence = typeof confidence === 'string' ? confidence : 'Unknown';
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Trust Score</Typography>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h4">{validScore}</Typography>
          <Box width={120}>
            <LinearProgress variant="determinate" value={validScore} sx={{ height: 10, borderRadius: 5 }} />
          </Box>
          <Typography variant="body2">Confidence: {validConfidence}</Typography>
        </Box>
        <Typography variant="subtitle1">Contributing Factors</Typography>
        <List dense>
          {factors.map((factor, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={factor.name}
                secondary={`Score: ${factor.score !== undefined ? factor.score : (factor.impact !== undefined ? factor.impact : factor.value)}${factor.description ? ` (${factor.description})` : ''}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TrustScore; 