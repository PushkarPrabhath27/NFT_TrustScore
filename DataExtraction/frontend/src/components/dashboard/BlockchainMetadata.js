/**
 * Blockchain Metadata Component
 * Displays blockchain-specific information including
 * block details, gas usage, and technical metadata
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
  Tooltip,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  AccountTree as BlockchainIcon,
  Speed as GasIcon,
  Receipt as TransactionIcon,
  Timeline as BlockIcon,
  LocalGasStation as FeeIcon,
  Storage as DataIcon,
  Lan as NetworkIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import apiService from '../../services/ApiService';

const BlockchainMetadata = ({ blockchainMetadata, blockchain }) => {
  const theme = useTheme();

  /**
   * Blockchain network configurations
   */
  const networkConfigs = useMemo(() => ({
    ethereum: {
      name: 'Ethereum',
      color: '#627EEA',
      icon: '⟠',
      explorer: 'etherscan.io'
    },
    polygon: {
      name: 'Polygon',
      color: '#8247E5',
      icon: '⬟',
      explorer: 'polygonscan.com'
    },
    bsc: {
      name: 'Binance Smart Chain',
      color: '#F3BA2F',
      icon: '🔶',
      explorer: 'bscscan.com'
    },
    arbitrum: {
      name: 'Arbitrum',
      color: '#28A0F0',
      icon: '🔷',
      explorer: 'arbiscan.io'
    },
    optimism: {
      name: 'Optimism',
      color: '#FF0420',
      icon: '🔴',
      explorer: 'optimistic.etherscan.io'
    }
  }), []);

  /**
   * Gets network configuration
   * @param {string} network - Network name
   * @returns {Object} Network configuration
   */
  const getNetworkConfig = (network) => {
    const networkKey = network?.toLowerCase() || 'ethereum';
    return networkConfigs[networkKey] || networkConfigs.ethereum;
  };

  /**
   * Calculates gas efficiency percentage
   * @param {number} gasUsed - Gas used
   * @param {number} gasLimit - Gas limit
   * @returns {number} Efficiency percentage
   */
  const calculateGasEfficiency = (gasUsed, gasLimit) => {
    if (!gasUsed || !gasLimit) return 0;
    return Math.min(100, (gasUsed / gasLimit) * 100);
  };

  /**
   * Renders a metadata metric card
   * @param {Object} config - Metric configuration
   * @returns {JSX.Element} Metric card component
   */
  const renderMetricCard = ({ icon: IconComponent, label, value, subtitle, color, tooltip }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        elevation={1}
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}20`,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4]
          }
        }}
      >
        <CardContent sx={{ p: 2, textAlign: 'center' }}>
          <Tooltip title={tooltip}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: `${color}20`,
                color: color,
                mx: 'auto',
                mb: 1
              }}
            >
              <IconComponent />
            </Avatar>
          </Tooltip>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="h6" fontWeight="bold" color={color}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (!blockchainMetadata) {
    return null;
  }

  const networkConfig = getNetworkConfig(blockchain);
  const gasEfficiency = calculateGasEfficiency(
    blockchainMetadata.gasUsed,
    blockchainMetadata.gasLimit
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: networkConfig.color,
                mr: 2,
                fontSize: '1.5rem'
              }}
            >
              {networkConfig.icon}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Blockchain Metadata
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Technical details and network information
              </Typography>
            </Box>
            <Chip
              label={networkConfig.name}
              sx={{
                bgcolor: `${networkConfig.color}20`,
                color: networkConfig.color,
                fontWeight: 'bold'
              }}
            />
          </Box>

          {/* Network Information */}
          <Box mb={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Network Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center">
                  <NetworkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Network
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {networkConfig.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box display="flex" alignItems="center">
                  <VerifiedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Explorer
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {networkConfig.explorer}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Key Metrics Grid */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={6} sm={3}>
              {renderMetricCard({
                icon: BlockIcon,
                label: 'Block Number',
                value: blockchainMetadata.blockNumber ? 
                  apiService.formatLargeNumber(blockchainMetadata.blockNumber) : 'N/A',
                color: theme.palette.primary.main,
                tooltip: 'Block number where the contract was deployed or last updated'
              })}
            </Grid>
            <Grid item xs={6} sm={3}>
              {renderMetricCard({
                icon: TransactionIcon,
                label: 'Transactions',
                value: blockchainMetadata.transactionCount ? 
                  apiService.formatLargeNumber(blockchainMetadata.transactionCount) : 'N/A',
                color: theme.palette.secondary.main,
                tooltip: 'Total number of transactions involving this contract'
              })}
            </Grid>
            <Grid item xs={6} sm={3}>
              {renderMetricCard({
                icon: GasIcon,
                label: 'Gas Used',
                value: blockchainMetadata.gasUsed ? 
                  apiService.formatLargeNumber(blockchainMetadata.gasUsed) : 'N/A',
                subtitle: blockchainMetadata.gasLimit ? 
                  `of ${apiService.formatLargeNumber(blockchainMetadata.gasLimit)}` : '',
                color: theme.palette.warning.main,
                tooltip: 'Gas consumed by contract transactions'
              })}
            </Grid>
            <Grid item xs={6} sm={3}>
              {renderMetricCard({
                icon: FeeIcon,
                label: 'Avg Gas Price',
                value: blockchainMetadata.averageGasPrice ? 
                  `${blockchainMetadata.averageGasPrice} Gwei` : 'N/A',
                color: theme.palette.info.main,
                tooltip: 'Average gas price for contract transactions'
              })}
            </Grid>
          </Grid>

          {/* Gas Efficiency */}
          {blockchainMetadata.gasUsed && blockchainMetadata.gasLimit && (
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="medium">
                  Gas Efficiency
                </Typography>
                <Typography variant="body2" color={theme.palette.warning.main} fontWeight="bold">
                  {gasEfficiency.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={gasEfficiency}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: `${theme.palette.warning.main}15`,
                  '& .MuiLinearProgress-bar': {
                    bgcolor: theme.palette.warning.main,
                    borderRadius: 4
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Gas utilization efficiency for contract operations
              </Typography>
            </Box>
          )}

          {/* Additional Technical Details */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Technical Information
            </Typography>
            <Grid container spacing={2}>
              {blockchainMetadata.contractSize && (
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <DataIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Contract Size
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {apiService.formatLargeNumber(blockchainMetadata.contractSize)} bytes
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {blockchainMetadata.deploymentDate && (
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <BlockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Deployed
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {apiService.formatDate(new Date(blockchainMetadata.deploymentDate))}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {blockchainMetadata.lastActivity && (
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <TransactionIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Last Activity
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {apiService.formatDate(new Date(blockchainMetadata.lastActivity))}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
              
              {blockchainMetadata.version && (
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <VerifiedIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Version
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {blockchainMetadata.version}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>

          {/* Footer */}
          <Box mt={3} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Blockchain data sourced from {networkConfig.explorer}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BlockchainMetadata;