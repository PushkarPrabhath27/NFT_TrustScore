import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const getRiskColor = (level) => {
  switch (level) {
    case 'Low': return 'success';
    case 'Medium': return 'warning';
    case 'High': return 'error';
    default: return 'default';
  }
};

const RiskData = ({ riskData }) => {
  if (!riskData) return <Typography>No risk data available.</Typography>;
  const { overallRisk, factors = [] } = riskData;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Risk Data</Typography>
        <Box mb={2}>
          <Typography variant="body1">
            Overall Risk: <Chip label={overallRisk} color={getRiskColor(overallRisk)} />
          </Typography>
        </Box>
        <Typography variant="subtitle1">Risk Factors</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Factor</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Trend</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {factors.map((factor, idx) => (
              <TableRow key={idx}>
                <TableCell>{factor.name}</TableCell>
                <TableCell>{factor.score}</TableCell>
                <TableCell>
                  <Chip label={factor.level} color={getRiskColor(factor.level)} size="small" />
                </TableCell>
                <TableCell>{factor.trend}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RiskData; 