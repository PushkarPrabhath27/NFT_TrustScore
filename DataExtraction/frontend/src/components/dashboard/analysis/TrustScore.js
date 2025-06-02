import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, List, ListItem, ListItemText } from '@mui/material';

const TrustScore = ({ trustScoreData }) => {
  if (!trustScoreData) return <Typography>No trust score data available.</Typography>;
  const { score, confidence, factors = [] } = trustScoreData;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Trust Score</Typography>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h4">{score}</Typography>
          <Box width={120}>
            <LinearProgress variant="determinate" value={score} sx={{ height: 10, borderRadius: 5 }} />
          </Box>
          <Typography variant="body2">Confidence: {confidence}</Typography>
        </Box>
        <Typography variant="subtitle1">Contributing Factors</Typography>
        <List dense>
          {factors.map((factor, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={factor.name}
                secondary={`Score: ${factor.value} (${factor.description || ''})`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default TrustScore; 