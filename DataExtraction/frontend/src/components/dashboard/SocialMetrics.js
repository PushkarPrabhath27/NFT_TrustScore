/**
 * Social Metrics Component
 * Displays social media engagement, community statistics,
 * and platform-specific metrics for NFT projects
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  Tooltip,
  useTheme,
  IconButton
} from '@mui/material';
import {
  Twitter as TwitterIcon,
  Forum as DiscordIcon,
  Telegram as TelegramIcon,
  Reddit as RedditIcon,
  Language as WebsiteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as CommunityIcon,
  Favorite as EngagementIcon,
  Share as ShareIcon,
  Visibility as ViewsIcon,
  ChatBubble as MessagesIcon,
  ThumbUp as LikesIcon
} from '@mui/icons-material';
import apiService from '../../services/ApiService';

const SocialMetrics = ({ socialMetrics }) => {
  const theme = useTheme();

  /**
   * Social platform configurations
   */
  const platformConfigs = {
    twitter: {
      icon: TwitterIcon,
      color: '#1DA1F2',
      name: 'Twitter',
      metrics: ['followers', 'tweets', 'engagement']
    },
    discord: {
      icon: DiscordIcon,
      color: '#5865F2',
      name: 'Discord',
      metrics: ['members', 'online', 'channels']
    },
    telegram: {
      icon: TelegramIcon,
      color: '#0088CC',
      name: 'Telegram',
      metrics: ['members', 'messages', 'activity']
    },
    reddit: {
      icon: RedditIcon,
      color: '#FF4500',
      name: 'Reddit',
      metrics: ['subscribers', 'posts', 'comments']
    },
    website: {
      icon: WebsiteIcon,
      color: '#6B73FF',
      name: 'Website',
      metrics: ['visitors', 'pageviews', 'bounce_rate']
    }
  };

  /**
   * Calculates engagement rate based on platform
   * @param {string} platform - Social platform name
   * @param {Object} data - Platform data
   * @returns {number} Engagement rate percentage
   */
  const calculateEngagementRate = (platform, data) => {
    if (!data) return 0;
    
    switch (platform) {
      case 'twitter':
        return data.followers > 0 ? (data.engagement / data.followers * 100) : 0;
      case 'discord':
        return data.members > 0 ? (data.online / data.members * 100) : 0;
      case 'telegram':
        return data.members > 0 ? (data.activity / data.members * 100) : 0;
      case 'reddit':
        return data.subscribers > 0 ? ((data.posts + data.comments) / data.subscribers * 100) : 0;
      default:
        return 0;
    }
  };

  /**
   * Gets engagement level based on rate
   * @param {number} rate - Engagement rate
   * @returns {Object} Engagement level configuration
   */
  const getEngagementLevel = (rate) => {
    if (rate >= 10) {
      return { level: 'Excellent', color: theme.palette.success.main, icon: TrendingUpIcon };
    } else if (rate >= 5) {
      return { level: 'Good', color: theme.palette.info.main, icon: TrendingUpIcon };
    } else if (rate >= 2) {
      return { level: 'Average', color: theme.palette.warning.main, icon: TrendingUpIcon };
    } else {
      return { level: 'Low', color: theme.palette.error.main, icon: TrendingDownIcon };
    }
  };

  /**
   * Renders a social platform card
   * @param {string} platform - Platform name
   * @param {Object} data - Platform data
   * @returns {JSX.Element} Platform card component
   */
  const renderPlatformCard = (platform, data) => {
    if (!data) return null;
    
    const config = platformConfigs[platform];
    if (!config) return null;
    
    const IconComponent = config.icon;
    const engagementRate = calculateEngagementRate(platform, data);
    const engagementLevel = getEngagementLevel(engagementRate);
    const EngagementIcon = engagementLevel.icon;
    
    return (
      <motion.div
        key={platform}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          elevation={2}
          sx={{
            height: '100%',
            background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}05 100%)`,
            border: `1px solid ${config.color}30`,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: theme.shadows[6],
              border: `1px solid ${config.color}50`
            }
          }}
        >
          <CardContent sx={{ p: 2.5 }}>
            {/* Platform Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: config.color,
                    mr: 1.5
                  }}
                >
                  <IconComponent fontSize="small" sx={{ color: 'white' }} />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {config.name}
                </Typography>
              </Box>
              <Tooltip title={`${engagementLevel.level} engagement`}>
                <Chip
                  size="small"
                  icon={<EngagementIcon fontSize="small" />}
                  label={engagementLevel.level}
                  sx={{
                    bgcolor: `${engagementLevel.color}20`,
                    color: engagementLevel.color,
                    fontWeight: 'bold'
                  }}
                />
              </Tooltip>
            </Box>

            {/* Platform Metrics */}
            <Box mb={2}>
              {platform === 'twitter' && (
                <>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Followers
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {apiService.formatLargeNumber(data.followers || 0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Tweets
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {apiService.formatLargeNumber(data.tweets || 0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Engagement
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {apiService.formatLargeNumber(data.engagement || 0)}
                    </Typography>
                  </Box>
                </>
              )}
              
              {platform === 'discord' && (
                <>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Members
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {apiService.formatLargeNumber(data.members || 0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Online
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {apiService.formatLargeNumber(data.online || 0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Channels
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {data.channels || 0}
                    </Typography>
                  </Box>
                </>
              )}
              
              {platform === 'telegram' && (
                <>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Members
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {apiService.formatLargeNumber(data.members || 0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Messages/Day
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {apiService.formatLargeNumber(data.messages || 0)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Activity Score
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {data.activity || 0}%
                    </Typography>
                  </Box>
                </>
              )}
            </Box>

            {/* Engagement Rate */}
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="medium">
                  Engagement Rate
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="bold" 
                  color={engagementLevel.color}
                >
                  {engagementRate.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, engagementRate * 5)} // Scale for visual representation
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: `${engagementLevel.color}20`,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: engagementLevel.color,
                    borderRadius: 3
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  /**
   * Renders overall community metrics
   * @returns {JSX.Element} Community metrics component
   */
  const renderCommunityOverview = () => {
    if (!socialMetrics) return null;
    
    const totalFollowers = Object.values(socialMetrics).reduce((total, platform) => {
      if (typeof platform === 'object' && platform !== null) {
        return total + (platform.followers || platform.members || platform.subscribers || 0);
      }
      return total;
    }, 0);
    
    const avgEngagement = Object.keys(socialMetrics).reduce((total, platform) => {
      const data = socialMetrics[platform];
      if (typeof data === 'object' && data !== null) {
        return total + calculateEngagementRate(platform, data);
      }
      return total;
    }, 0) / Object.keys(socialMetrics).length;
    
    const engagementLevel = getEngagementLevel(avgEngagement);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: theme.palette.primary.main,
                  mr: 2
                }}
              >
                <CommunityIcon />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Community Overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Social media presence and community engagement metrics
                </Typography>
              </Box>
              <Chip
                icon={<engagementLevel.icon fontSize="small" />}
                label={`${engagementLevel.level} Community`}
                sx={{
                  bgcolor: `${engagementLevel.color}20`,
                  color: engagementLevel.color,
                  fontWeight: 'bold'
                }}
              />
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    {apiService.formatLargeNumber(totalFollowers)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Community Size
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold" color={engagementLevel.color} gutterBottom>
                    {avgEngagement.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Engagement
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold" color="secondary" gutterBottom>
                    {Object.keys(socialMetrics).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Platforms
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (!socialMetrics || Object.keys(socialMetrics).length === 0) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <CommunityIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Social Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Social media metrics are not available for this contract
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Community Overview */}
      {renderCommunityOverview()}
      
      {/* Platform Cards */}
      <Grid container spacing={3}>
        {Object.entries(socialMetrics).map(([platform, data]) => (
          <Grid item xs={12} sm={6} md={4} key={platform}>
            {renderPlatformCard(platform, data)}
          </Grid>
        ))}
      </Grid>
      
      {/* Footer */}
      <Box mt={3} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Social metrics updated every 24 hours from official platform APIs
        </Typography>
      </Box>
    </Box>
  );
};

export default SocialMetrics;