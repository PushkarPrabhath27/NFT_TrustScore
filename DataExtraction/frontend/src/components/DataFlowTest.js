/**
 * Data Flow Test Component
 * Simple component to test and display analysis data
 */

import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';

const DataFlowTest = ({ data, title = "Data Flow Test" }) => {
  console.log(`[DataFlowTest] ${title} - Data received:`, {
    hasData: !!data,
    dataType: typeof data,
    dataKeys: data ? Object.keys(data) : [],
    data: data
  });

  if (!data) {
    return (
      <Card sx={{ mb: 2, bgcolor: 'error.light' }}>
        <CardContent>
          <Typography variant="h6" color="error">
            {title} - No Data
          </Typography>
          <Typography variant="body2">
            No data received. Check console for details.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2, bgcolor: 'success.light' }}>
      <CardContent>
        <Typography variant="h6" color="success.dark">
          {title} - Data Received
        </Typography>
        <Box mt={2}>
          <Typography variant="body2" gutterBottom>
            <strong>Data Type:</strong> {typeof data}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Data Keys:</strong> {Object.keys(data).join(', ')}
          </Typography>
          
          {/* Show specific analysis data if present */}
          {data.nftData && (
            <Box mt={2}>
              <Typography variant="subtitle2">NFT Data:</Typography>
              <Typography variant="body2">
                Name: {data.nftData.name || 'N/A'}, 
                Trust Score: {data.nftData.trustScore || 'N/A'},
                Type: {typeof data.nftData}
              </Typography>
            </Box>
          )}
          
          {data.trustScoreData && (
            <Box mt={2}>
              <Typography variant="subtitle2">Trust Score Data:</Typography>
              <Typography variant="body2">
                Score: {data.trustScoreData.score || 'N/A'} (type: {typeof data.trustScoreData.score}), 
                Confidence: {data.trustScoreData.confidence || 'N/A'} (type: {typeof data.trustScoreData.confidence}),
                Factors: {Array.isArray(data.trustScoreData.factors) ? data.trustScoreData.factors.length : 'N/A'}
              </Typography>
            </Box>
          )}
          
          {data.priceData && (
            <Box mt={2}>
              <Typography variant="subtitle2">Price Data:</Typography>
              <Typography variant="body2">
                Current: {data.priceData.current || 'N/A'} (type: {typeof data.priceData.current}) {data.priceData.currency || 'ETH'},
                History: {Array.isArray(data.priceData.history) ? data.priceData.history.length : 'N/A'} items
              </Typography>
            </Box>
          )}
          
          {data.riskData && (
            <Box mt={2}>
              <Typography variant="subtitle2">Risk Data:</Typography>
              <Typography variant="body2">
                Overall Risk: {data.riskData.overallRisk || 'N/A'},
                Factors: {Array.isArray(data.riskData.factors) ? data.riskData.factors.length : 'N/A'}
              </Typography>
            </Box>
          )}
          
          {data.fraudData && (
            <Box mt={2}>
              <Typography variant="subtitle2">Fraud Data:</Typography>
              <Typography variant="body2">
                Fraud Score: {data.fraudData.fraudScore || 'N/A'},
                Alert Level: {data.fraudData.alertLevel || 'N/A'}
              </Typography>
            </Box>
          )}
          
          {/* Show first few keys as chips */}
          <Box mt={2}>
            <Typography variant="subtitle2">Available Data Sections:</Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
              {Object.keys(data).slice(0, 10).map((key) => (
                <Chip 
                  key={key} 
                  label={key} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              ))}
              {Object.keys(data).length > 10 && (
                <Chip 
                  label={`+${Object.keys(data).length - 10} more`} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataFlowTest;
