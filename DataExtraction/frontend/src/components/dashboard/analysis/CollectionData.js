import React from 'react';
import { Card, CardContent, Typography, Table, TableBody, TableCell, TableRow, Chip } from '@mui/material';

const getRiskColor = (level) => {
  switch (level) {
    case 'Low': return 'success';
    case 'Medium': return 'warning';
    case 'High': return 'error';
    default: return 'default';
  }
};

const CollectionData = ({ collectionData }) => {
  if (!collectionData) return <Typography>No collection data available.</Typography>;
  const { name, address, overallTrustScore, overallRiskLevel, verifiedMetadata } = collectionData;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">Collection Data</Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>{name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Address</TableCell>
              <TableCell>{address}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Overall Trust Score</TableCell>
              <TableCell>{overallTrustScore}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Overall Risk Level</TableCell>
              <TableCell><Chip label={overallRiskLevel} color={getRiskColor(overallRiskLevel)} /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Verified Metadata</TableCell>
              <TableCell>{verifiedMetadata ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CollectionData; 