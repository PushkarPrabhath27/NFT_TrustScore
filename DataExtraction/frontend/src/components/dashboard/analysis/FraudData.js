import React from 'react';
import { Card, CardContent, Typography, Box, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const getFraudColor = (score) => {
  if (score < 30) return 'success';
  if (score < 70) return 'warning';
  return 'error';
};

const FraudData = ({ fraudData }) => {
  if (!fraudData) return <Typography>No fraud data available.</Typography>;
  const { fraudScore, indicators = [] } = fraudData;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Fraud Analysis</Typography>
        <Box mb={2} display="flex" alignItems="center" gap={2}>
          <Typography variant="body1">Fraud Score:</Typography>
          <Chip label={fraudScore} color={getFraudColor(fraudScore)} />
        </Box>
        <Typography variant="subtitle1">Fraud Indicators</Typography>
        <List dense>
          {indicators.map((indicator, idx) => (
            <ListItem key={idx}>
              <ListItemIcon>
                {indicator.isRisk ? <FiAlertTriangle color="red" /> : <FiCheckCircle color="green" />}
              </ListItemIcon>
              <ListItemText
                primary={indicator.name}
                secondary={indicator.description}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default FraudData; 