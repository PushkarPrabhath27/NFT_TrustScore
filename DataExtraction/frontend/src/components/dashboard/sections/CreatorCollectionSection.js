/**
 * Creator & Collection Section Component
 * Displays creator information and collection metadata
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
  Link,
  Divider
} from '@mui/material';
import { FiUser, FiLayers, FiCheckCircle, FiLink, FiCalendar, FiGlobe } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const CreatorCollectionSection = ({ 
  creatorData, 
  collectionData, 
  title = "Creator & Collection" 
}) => {
  // Process creator data
  const creatorMetrics = useMemo(() => {
    if (!creatorData) return null;
    
    return {
      name: creatorData.name || 'Unknown Creator',
      address: creatorData.address || null,
      verified: creatorData.verified || false,
      reputation: creatorData.reputation || 0,
      socialLinks: creatorData.socialLinks || {},
      bio: creatorData.bio || null,
      website: creatorData.website || null,
      totalCollections: creatorData.totalCollections || 0,
      totalNFTs: creatorData.totalNFTs || 0
    };
  }, [creatorData]);

  // Process collection data
  const collectionMetrics = useMemo(() => {
    if (!collectionData) return null;
    
    return {
      name: collectionData.name || 'Unknown Collection',
      symbol: collectionData.symbol || null,
      description: collectionData.description || null,
      totalSupply: collectionData.totalSupply || 0,
      floorPrice: collectionData.floorPrice || 0,
      volume: collectionData.volume || 0,
      owners: collectionData.owners || 0,
      website: collectionData.website || null,
      twitter: collectionData.twitter || null,
      discord: collectionData.discord || null,
      traits: collectionData.traits || [],
      rarity: collectionData.rarity || null
    };
  }, [collectionData]);

  // Prepare trait distribution chart data
  const traitChartData = useMemo(() => {
    if (!collectionMetrics?.traits || !Array.isArray(collectionMetrics.traits)) {
      return [];
    }
    
    return collectionMetrics.traits.slice(0, 10).map(trait => ({
      name: trait.trait_type || 'Unknown',
      count: trait.count || 0,
      percentage: trait.percentage || 0
    }));
  }, [collectionMetrics]);

  // Check if we have any data to display
  const hasData = creatorData || collectionData;
  
  if (!hasData) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FiUser color="gray" style={{ marginRight: 8 }} />
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Alert severity="info">
            <Typography variant="body2">
              Creator and collection data is not available for this analysis.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (value) => {
    if (typeof value !== 'number') return 'N/A';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatPrice = (value, currency = 'ETH') => {
    if (typeof value !== 'number') return 'N/A';
    return `${value.toFixed(4)} ${currency}`;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <FiUser color="purple" style={{ marginRight: 8 }} />
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>

        {/* Creator Information */}
        {creatorMetrics && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Creator Information
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                {creatorMetrics.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="h6">
                    {creatorMetrics.name}
                  </Typography>
                  {creatorMetrics.verified && (
                    <FiCheckCircle color="blue" size={16} />
                  )}
                </Box>
                {creatorMetrics.address && (
                  <Typography variant="caption" color="text.secondary">
                    {creatorMetrics.address.slice(0, 6)}...{creatorMetrics.address.slice(-4)}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Creator Stats */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={6}>
                <Box textAlign="center" p={1}>
                  <Typography variant="h6" color="primary">
                    {formatNumber(creatorMetrics.totalCollections)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Collections
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" p={1}>
                  <Typography variant="h6" color="secondary.main">
                    {formatNumber(creatorMetrics.totalNFTs)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total NFTs
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Creator Bio */}
            {creatorMetrics.bio && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                {creatorMetrics.bio}
              </Typography>
            )}

            {/* Creator Links */}
            <Box display="flex" gap={1} flexWrap="wrap">
              {creatorMetrics.website && (
                <Chip
                  icon={<FiLink />}
                  label="Website"
                  size="small"
                  clickable
                  component="a"
                  href={creatorMetrics.website}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
              {Object.entries(creatorMetrics.socialLinks).map(([platform, url]) => (
                <Chip
                  key={platform}
                  label={platform}
                  size="small"
                  clickable
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Collection Information */}
        {collectionMetrics && (
          <Box mb={3}>
            {creatorMetrics && <Divider sx={{ mb: 2 }} />}
            <Typography variant="subtitle1" gutterBottom>
              Collection Information
            </Typography>
            
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>
                {collectionMetrics.name}
                {collectionMetrics.symbol && (
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({collectionMetrics.symbol})
                  </Typography>
                )}
              </Typography>
              
              {collectionMetrics.description && (
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {collectionMetrics.description}
                </Typography>
              )}
            </Box>

            {/* Collection Stats */}
            <Grid container spacing={2} mb={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={1}>
                  <Typography variant="h6" color="primary">
                    {formatNumber(collectionMetrics.totalSupply)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Supply
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={1}>
                  <Typography variant="h6" color="success.main">
                    {formatPrice(collectionMetrics.floorPrice)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Floor Price
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={1}>
                  <Typography variant="h6" color="info.main">
                    {formatNumber(collectionMetrics.volume)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Volume
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={1}>
                  <Typography variant="h6" color="warning.main">
                    {formatNumber(collectionMetrics.owners)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Owners
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Collection Links */}
            <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
              {collectionMetrics.website && (
                <Chip
                  icon={<FiGlobe />}
                  label="Website"
                  size="small"
                  clickable
                  component="a"
                  href={collectionMetrics.website}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
              {collectionMetrics.twitter && (
                <Chip
                  label="Twitter"
                  size="small"
                  clickable
                  component="a"
                  href={collectionMetrics.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
              {collectionMetrics.discord && (
                <Chip
                  label="Discord"
                  size="small"
                  clickable
                  component="a"
                  href={collectionMetrics.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Trait Distribution Chart */}
        {traitChartData.length > 0 && (
          <Box mb={3}>
            <Typography variant="subtitle1" gutterBottom>
              Top Traits Distribution
            </Typography>
            <Box height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={traitChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => [value, 'Count']}
                  />
                  <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}

        {/* Data Quality Indicators */}
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          {creatorData && (
            <Chip 
              label="Creator Data" 
              size="small" 
              color="success" 
              icon={<FiUser />}
            />
          )}
          {collectionData && (
            <Chip 
              label="Collection Data" 
              size="small" 
              color="success" 
              icon={<FiLayers />}
            />
          )}
          {!creatorData && (
            <Chip 
              label="No Creator Data" 
              size="small" 
              color="error" 
            />
          )}
          {!collectionData && (
            <Chip 
              label="No Collection Data" 
              size="small" 
              color="error" 
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatorCollectionSection;
