/**
 * Recent Transactions Component
 * Displays recent blockchain transactions with detailed information
 * including transaction types, amounts, addresses, and timestamps
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Tooltip,
  IconButton,
  Button,
  Divider,
  useTheme,
  Collapse,
  Link,
  Paper
} from '@mui/material';
import {
  Receipt as TransactionIcon,
  SwapHoriz as TransferIcon,
  ShoppingCart as SaleIcon,
  Gavel as AuctionIcon,
  LocalOffer as OfferIcon,
  AccountBalance as MintIcon,
  Delete as BurnIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  OpenInNew as ExternalLinkIcon,
  ContentCopy as CopyIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  AttachMoney as PriceIcon
} from '@mui/icons-material';
import apiService from '../../services/ApiService';

const RecentTransactions = ({ transactions }) => {
  const theme = useTheme();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  /**
   * Transaction type configurations
   */
  const transactionTypes = {
    transfer: {
      icon: TransferIcon,
      color: theme.palette.info.main,
      label: 'Transfer',
      description: 'Token transferred between addresses'
    },
    sale: {
      icon: SaleIcon,
      color: theme.palette.success.main,
      label: 'Sale',
      description: 'Token sold on marketplace'
    },
    auction: {
      icon: AuctionIcon,
      color: theme.palette.warning.main,
      label: 'Auction',
      description: 'Auction bid or completion'
    },
    offer: {
      icon: OfferIcon,
      color: theme.palette.secondary.main,
      label: 'Offer',
      description: 'Offer made or accepted'
    },
    mint: {
      icon: MintIcon,
      color: theme.palette.primary.main,
      label: 'Mint',
      description: 'New token minted'
    },
    burn: {
      icon: BurnIcon,
      color: theme.palette.error.main,
      label: 'Burn',
      description: 'Token permanently destroyed'
    }
  };

  /**
   * Gets transaction type configuration
   * @param {string} type - Transaction type
   * @returns {Object} Type configuration
   */
  const getTransactionConfig = (type) => {
    return transactionTypes[type] || transactionTypes.transfer;
  };

  /**
   * Formats transaction hash for display
   * @param {string} hash - Transaction hash
   * @returns {string} Formatted hash
   */
  const formatHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  /**
   * Formats address for display
   * @param {string} address - Ethereum address
   * @returns {string} Formatted address
   */
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  /**
   * Copies text to clipboard
   * @param {string} text - Text to copy
   */
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  /**
   * Toggles row expansion
   * @param {string} txHash - Transaction hash
   */
  const toggleRowExpansion = (txHash) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(txHash)) {
      newExpanded.delete(txHash);
    } else {
      newExpanded.add(txHash);
    }
    setExpandedRows(newExpanded);
  };

  /**
   * Gets time ago string
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Time ago string
   */
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const txTime = new Date(timestamp);
    const diffMs = now - txTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  /**
   * Renders transaction row
   * @param {Object} tx - Transaction data
   * @returns {JSX.Element} Transaction row component
   */
  const renderTransactionRow = (tx) => {
    const config = getTransactionConfig(tx.type);
    const IconComponent = config.icon;
    const isExpanded = expandedRows.has(tx.hash);

    return (
      <React.Fragment key={tx.hash}>
        <TableRow
          hover
          sx={{
            cursor: 'pointer',
            '&:hover': {
              bgcolor: theme.palette.action.hover
            }
          }}
          onClick={() => toggleRowExpansion(tx.hash)}
        >
          {/* Transaction Type */}
          <TableCell>
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: `${config.color}20`,
                  color: config.color,
                  mr: 1
                }}
              >
                <IconComponent fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {config.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatHash(tx.hash)}
                </Typography>
              </Box>
            </Box>
          </TableCell>

          {/* From/To */}
          <TableCell>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {formatAddress(tx.from)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                → {formatAddress(tx.to)}
              </Typography>
            </Box>
          </TableCell>

          {/* Amount/Price */}
          <TableCell>
            {tx.amount && (
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {tx.amount} ETH
                </Typography>
                {tx.usdValue && (
                  <Typography variant="caption" color="text.secondary">
                    ${apiService.formatPrice(tx.usdValue)}
                  </Typography>
                )}
              </Box>
            )}
          </TableCell>

          {/* Time */}
          <TableCell>
            <Box display="flex" alignItems="center">
              <TimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2">
                  {getTimeAgo(tx.timestamp)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {apiService.formatDate(new Date(tx.timestamp))}
                </Typography>
              </Box>
            </Box>
          </TableCell>

          {/* Status */}
          <TableCell>
            <Chip
              size="small"
              label={tx.status || 'Success'}
              color={tx.status === 'Failed' ? 'error' : 'success'}
              variant="outlined"
            />
          </TableCell>

          {/* Expand */}
          <TableCell>
            <IconButton size="small">
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </TableCell>
        </TableRow>

        {/* Expanded Details */}
        <TableRow>
          <TableCell colSpan={6} sx={{ py: 0 }}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ py: 2 }}>
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Transaction Details
                  </Typography>
                  
                  <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
                    {/* Transaction Hash */}
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Transaction Hash
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" fontFamily="monospace">
                          {tx.hash}
                        </Typography>
                        <Tooltip title="Copy hash">
                          <IconButton size="small" onClick={() => copyToClipboard(tx.hash)}>
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View on Etherscan">
                          <IconButton 
                            size="small" 
                            component={Link}
                            href={`https://etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                          >
                            <ExternalLinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Block Number */}
                    {tx.blockNumber && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Block Number
                        </Typography>
                        <Typography variant="body2">
                          {tx.blockNumber.toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    {/* Gas Used */}
                    {tx.gasUsed && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Gas Used
                        </Typography>
                        <Typography variant="body2">
                          {tx.gasUsed.toLocaleString()}
                        </Typography>
                      </Box>
                    )}

                    {/* Gas Price */}
                    {tx.gasPrice && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Gas Price
                        </Typography>
                        <Typography variant="body2">
                          {tx.gasPrice} Gwei
                        </Typography>
                      </Box>
                    )}

                    {/* Token ID */}
                    {tx.tokenId && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Token ID
                        </Typography>
                        <Typography variant="body2">
                          #{tx.tokenId}
                        </Typography>
                      </Box>
                    )}

                    {/* Marketplace */}
                    {tx.marketplace && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Marketplace
                        </Typography>
                        <Typography variant="body2">
                          {tx.marketplace}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Transaction Description */}
                  {tx.description && (
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {tx.description}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  // Process transactions data
  const processedTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [transactions]);

  const displayedTransactions = showAll ? processedTransactions : processedTransactions.slice(0, 10);

  if (!transactions || transactions.length === 0) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <TransactionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Transactions Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No recent transaction data available for this contract
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: theme.palette.primary.main,
                  mr: 2
                }}
              >
                <TransactionIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Transactions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest blockchain activity and transaction history
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${processedTransactions.length} Total`}
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Transaction Statistics */}
          <Box mb={3}>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={2}>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {processedTransactions.filter(tx => tx.type === 'sale').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sales
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {processedTransactions.filter(tx => tx.type === 'transfer').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Transfers
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" color="info.main">
                  {processedTransactions.filter(tx => tx.type === 'mint').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mints
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {processedTransactions.filter(tx => tx.amount).reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Volume (ETH)
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Transactions Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>From/To</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell width={50}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedTransactions.map(renderTransactionRow)}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Show More Button */}
          {processedTransactions.length > 10 && (
            <Box textAlign="center" mt={3}>
              <Button
                variant="outlined"
                onClick={() => setShowAll(!showAll)}
                startIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {showAll ? 'Show Less' : `Show All ${processedTransactions.length} Transactions`}
              </Button>
            </Box>
          )}

          {/* Footer */}
          <Box mt={3} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              Transaction data sourced from blockchain explorers and updated in real-time
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecentTransactions;