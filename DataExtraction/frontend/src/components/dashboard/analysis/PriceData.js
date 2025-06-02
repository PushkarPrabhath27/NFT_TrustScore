import React from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import PriceHistoryChart from '../charts/PriceHistoryChart';

const PriceData = ({ priceData }) => {
  if (!priceData) return <Typography>No price data available.</Typography>;
  const { current, history = [], prediction = {}, comparative = [] } = priceData;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Price Data</Typography>
        <Typography variant="body1" mb={2}>Current Price: {current}</Typography>
        <Box mb={2}>
          <PriceHistoryChart data={history} />
        </Box>
        <Typography variant="subtitle1">Price Prediction</Typography>
        <Typography variant="body2">Next Month: {prediction.nextMonth}</Typography>
        <Typography variant="body2" mb={2}>Next 3 Months: {prediction.nextThreeMonths}</Typography>
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
            {comparative.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.collection}</TableCell>
                <TableCell>{item.currentPrice}</TableCell>
                <TableCell>{item.floorPrice}</TableCell>
                <TableCell>{item.volume}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PriceData; 