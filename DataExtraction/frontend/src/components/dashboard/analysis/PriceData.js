import React from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import PriceHistoryChart from '../charts/PriceHistoryChart';

const PriceData = ({ priceData }) => {
  if (!priceData) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Price Data</Typography>
          <Typography color="text.secondary">No price data available.</Typography>
        </CardContent>
      </Card>
    );
  }
  
  const { 
    current = 0, 
    currency = 'ETH',
    history = [], 
    prediction = {}, 
    comparative = [] 
  } = priceData;
  
  // Handle null or invalid values
  const validCurrent = typeof current === 'number' && !isNaN(current) ? current : 0;
  const validHistory = Array.isArray(history) ? history : [];
  const validPrediction = typeof prediction === 'object' && prediction !== null ? prediction : {};
  const validComparative = Array.isArray(comparative) ? comparative : [];
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Price Data</Typography>
        <Typography variant="body1" mb={2}>Current Price: {validCurrent} {currency}</Typography>
        <Box mb={2}>
          <PriceHistoryChart data={validHistory} />
        </Box>
        <Typography variant="subtitle1">Price Prediction</Typography>
        <Typography variant="body2">Next Month: {validPrediction.nextMonth || 'N/A'}</Typography>
        <Typography variant="body2" mb={2}>Next 3 Months: {validPrediction.threeMonth || 'N/A'}</Typography>
        <Typography variant="subtitle1">Comparative Analysis</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Collection</TableCell>
              <TableCell>Current Price</TableCell>
              <TableCell>Floor Price</TableCell>
              <TableCell>Volume</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {validComparative.length > 0 ? (
              validComparative.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.collection || 'N/A'}</TableCell>
                  <TableCell>{item.currentPrice || item.avgPrice || 'N/A'}</TableCell>
                  <TableCell>{item.floorPrice || 'N/A'}</TableCell>
                  <TableCell>{item.volume || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">No comparative data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PriceData; 