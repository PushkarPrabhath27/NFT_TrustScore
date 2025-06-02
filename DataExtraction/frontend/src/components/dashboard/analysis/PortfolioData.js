import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableHead, TableRow, Box, Chip } from '@mui/material';

const getRiskColor = (level) => {
  switch (level) {
    case 'Low': return 'success';
    case 'Medium': return 'warning';
    case 'High': return 'error';
    default: return 'default';
  }
};

const PortfolioData = ({ portfolioData }) => {
  if (!portfolioData) return <Typography>No portfolio data available.</Typography>;
  const { assets = [], stats = {} } = portfolioData;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Portfolio Data</Typography>
        <Box mb={2}>
          <Typography variant="subtitle1">Stats Summary</Typography>
          <Typography variant="body2">Total Value: {stats.totalValue}</Typography>
          <Typography variant="body2">Average Trust Score: {stats.averageTrustScore}</Typography>
          <Typography variant="body2">Risk Distribution: Low: {stats.lowRisk}, Medium: {stats.mediumRisk}, High: {stats.highRisk}</Typography>
        </Box>
        <Typography variant="subtitle1">Assets</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Trust Score</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Risk Level</TableCell>
              <TableCell>Purchase Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset, idx) => (
              <TableRow key={idx}>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.trustScore}</TableCell>
                <TableCell>{asset.price}</TableCell>
                <TableCell><Chip label={asset.riskLevel} color={getRiskColor(asset.riskLevel)} size="small" /></TableCell>
                <TableCell>{asset.purchaseDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PortfolioData; 