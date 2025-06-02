import React from 'react';
import { Card, CardContent, Typography, Avatar, Box } from '@mui/material';

const NftDetails = ({ nftData }) => {
  if (!nftData) return <Typography>No NFT data available.</Typography>;
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={nftData.image} alt={nftData.name} sx={{ width: 80, height: 80 }} />
          <Box>
            <Typography variant="h5">{nftData.name}</Typography>
            <Typography variant="body2">Token ID: {nftData.tokenId}</Typography>
            <Typography variant="body2">Collection: {nftData.collection}</Typography>
            <Typography variant="body2">Blockchain: {nftData.blockchain}</Typography>
            <Typography variant="body2">Creator: {nftData.creator}</Typography>
            <Typography variant="body2">Verified: {nftData.isVerified ? 'Yes' : 'No'}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NftDetails; 