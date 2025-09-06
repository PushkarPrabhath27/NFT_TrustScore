/**
 * NFT-Specific Section Component
 * Displays individual NFT details and metadata
 */

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Alert,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { FiImage, FiPalette, FiFileText, FiLink, FiCalendar, FiKey, FiStar } from 'react-icons/fi';

const NFTSpecificSection = ({ nftData, title = "NFT-Specific Data" }) => {
  // Process NFT data
  const nftMetrics = useMemo(() => {
    if (!nftData) return null;
    return {
      id: nftData.id || 'Unknown',
      name: nftData.name || 'Unnamed NFT',
      description: nftData.description || null,
      image: nftData.image || null,
      animationUrl: nftData.animationUrl || null,
      externalUrl: nftData.externalUrl || null,
      attributes: nftData.attributes || [],
      rarity: nftData.rarity || null,
      rarityRank: nftData.rarityRank || null,
      lastSale: nftData.lastSale || null,
      currentPrice: nftData.currentPrice || null,
      owner: nftData.owner || null,
      creator: nftData.creator || null,
      tokenStandard: nftData.tokenStandard || null,
      blockchain: nftData.blockchain || null,
      contractAddress: nftData.contractAddress || null,
      tokenId: nftData.tokenId || null,
      metadata: nftData.metadata || {}
    };
  }, [nftData]);

  // Check if we have data to display
  if (!nftData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FiImage color="gray" style={{ marginRight: 8 }} />
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Alert severity="info">
            <Typography variant="body2">
              NFT-specific data is not available for this analysis.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (value, currency = 'ETH') => {
    if (typeof value !== 'number') return 'N/A';
    return `${value.toFixed(4)} ${currency}`;
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRarityColor = (rarity) => {
    if (!rarity) return 'default';
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'error';
      case 'epic': return 'warning';
      case 'rare': return 'info';
      case 'uncommon': return 'success';
      case 'common': return 'default';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <FiImage color="red" style={{ marginRight: 8 }} />
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>

        {/* NFT Basic Info */}
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom>
            NFT Information
          </Typography>
          
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar 
              src={nftMetrics.image} 
              sx={{ width: 60, height: 60 }}
              variant="rounded"
            >
              <FiImage />
            </Avatar>
            <Box>
              <Typography variant="h6" gutterBottom>
                {nftMetrics.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Token ID: {nftMetrics.id}
              </Typography>
              {nftMetrics.rarity && (
                <Chip
                  label={nftMetrics.rarity}
                  size="small"
                  color={getRarityColor(nftMetrics.rarity)}
                  sx={{ mt: 1 }}
                />
              )}
            </Box>
          </Box>

          {/* NFT Description */}
          {nftMetrics.description && (
            <Typography variant="body2" color="text.secondary" mb={2}>
              {nftMetrics.description}
            </Typography>
          )}
        </Box>

        {/* NFT Details Grid */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={4}>
            <Box textAlign="center" p={1}>
              <Typography variant="h6" color="primary">
                {nftMetrics.tokenStandard || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Token Standard
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Box textAlign="center" p={1}>
              <Typography variant="h6" color="secondary.main">
                {nftMetrics.blockchain || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Blockchain
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Box textAlign="center" p={1}>
              <Typography variant="h6" color="info.main">
                {nftMetrics.rarityRank || 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Rarity Rank
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Pricing Information */}
        {(nftMetrics.currentPrice || nftMetrics.lastSale) && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Pricing Information
            </Typography>
            <Grid container spacing={2}>
              {nftMetrics.currentPrice && (
                <Grid item xs={6}>
                  <Box textAlign="center" p={1}>
                    <Typography variant="h6" color="success.main">
                      {formatPrice(nftMetrics.currentPrice)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Current Price
                    </Typography>
                  </Box>
                </Grid>
              )}
              {nftMetrics.lastSale && (
                <Grid item xs={6}>
                  <Box textAlign="center" p={1}>
                    <Typography variant="h6" color="warning.main">
                      {formatPrice(nftMetrics.lastSale)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last Sale
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {/* Ownership Information */}
        {(nftMetrics.owner || nftMetrics.creator) && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Ownership Information
            </Typography>
            <List dense>
              {nftMetrics.owner && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <FiKey color="blue" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Current Owner"
                    secondary={formatAddress(nftMetrics.owner)}
                  />
                </ListItem>
              )}
              {nftMetrics.creator && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <FiStar color="purple" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Creator"
                    secondary={formatAddress(nftMetrics.creator)}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        )}

        {/* Attributes */}
        {nftMetrics.attributes.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Attributes ({nftMetrics.attributes.length})
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {nftMetrics.attributes.slice(0, 10).map((attr, index) => (
                <Chip
                  key={index}
                  label={`${attr.trait_type || 'Unknown'}: ${attr.value || 'N/A'}`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              ))}
              {nftMetrics.attributes.length > 10 && (
                <Chip
                  label={`+${nftMetrics.attributes.length - 10} more`}
                  size="small"
                  color="default"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* External Links */}
        {(nftMetrics.externalUrl || nftMetrics.animationUrl) && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              External Links
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {nftMetrics.externalUrl && (
                <Chip
                  icon={<FiLink />}
                  label="External URL"
                  size="small"
                  clickable
                  component="a"
                  href={nftMetrics.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
              {nftMetrics.animationUrl && (
                <Chip
                  icon={<FiImage />}
                  label="Animation"
                  size="small"
                  clickable
                  component="a"
                  href={nftMetrics.animationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Contract Information */}
        {nftMetrics.contractAddress && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Contract Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contract: {formatAddress(nftMetrics.contractAddress)}
            </Typography>
            {nftMetrics.tokenId && (
              <Typography variant="body2" color="text.secondary">
                Token ID: {nftMetrics.tokenId}
              </Typography>
            )}
          </Box>
        )}

        {/* Data Quality Indicators */}
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          <Chip 
            label="NFT Data" 
            size="small" 
            color="success" 
            icon={<FiImage />}
          />
          {nftMetrics.image && (
            <Chip 
              label="Has Image" 
              size="small" 
              color="success" 
            />
          )}
          {nftMetrics.attributes.length > 0 && (
            <Chip 
              label={`${nftMetrics.attributes.length} Attributes`} 
              size="small" 
              color="info" 
            />
          )}
          {nftMetrics.rarity && (
            <Chip 
              label="Rarity Data" 
              size="small" 
              color="warning" 
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NFTSpecificSection;
