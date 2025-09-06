/**
 * Dashboard Theme Configuration
 * Provides consistent theming, animations, and UI/UX patterns
 */

import { createTheme } from '@mui/material/styles';

// Custom color palette for NFT analysis dashboard
const customColors = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#dc004e',
    light: '#ff5983',
    dark: '#9a0036',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  // Custom colors for NFT analysis
  nft: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
  },
  market: {
    main: '#00bcd4',
    light: '#26c6da',
    dark: '#0097a7',
  },
  risk: {
    main: '#ff5722',
    light: '#ff7043',
    dark: '#d84315',
  },
  trust: {
    main: '#4caf50',
    light: '#66bb6a',
    dark: '#388e3c',
  }
};

// Create the theme
const dashboardTheme = createTheme({
  palette: {
    ...customColors,
    mode: 'light',
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    // Card component customization
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    // Button component customization
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    // Chip component customization
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    // LinearProgress component customization
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
    // Typography component customization
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.gradient-text': {
            background: 'linear-gradient(45deg, #1976d2, #dc004e)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          },
        },
      },
    },
  },
  // Custom animations
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
});

// Animation variants for framer-motion
export const animationVariants = {
  // Fade in from bottom
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  // Fade in from left
  fadeInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  // Fade in from right
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  // Stagger children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  // Slide up for cards
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

// Custom styles for dashboard components
export const dashboardStyles = {
  // Section header styles
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 3,
    paddingBottom: 2,
    borderBottom: '2px solid',
    borderBottomColor: 'divider',
  },
  // Metric card styles
  metricCard: {
    textAlign: 'center',
    padding: 2,
    borderRadius: 2,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    },
  },
  // Chart container styles
  chartContainer: {
    height: 200,
    width: '100%',
    '& .recharts-wrapper': {
      width: '100% !important',
    },
  },
  // Status indicator styles
  statusIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 1,
    padding: '4px 8px',
    borderRadius: 16,
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  // Loading skeleton styles
  loadingSkeleton: {
    borderRadius: 2,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  // Error state styles
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    textAlign: 'center',
    minHeight: 200,
  },
  // Success state styles
  successState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    textAlign: 'center',
    minHeight: 200,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: 2,
  }
};

// Utility functions for consistent styling
export const styleUtils = {
  // Get color based on value range
  getValueColor: (value, thresholds = { low: 0.3, high: 0.7 }) => {
    if (value < thresholds.low) return 'error';
    if (value > thresholds.high) return 'success';
    return 'warning';
  },
  // Get status color
  getStatusColor: (status) => {
    const statusMap = {
      'success': 'success',
      'warning': 'warning',
      'error': 'error',
      'info': 'info',
      'low': 'success',
      'medium': 'warning',
      'high': 'error',
      'critical': 'error',
    };
    return statusMap[status?.toLowerCase()] || 'default';
  },
  // Format numbers with appropriate precision
  formatNumber: (value, precision = 2) => {
    if (typeof value !== 'number') return 'N/A';
    return value.toFixed(precision);
  },
  // Format currency
  formatCurrency: (value, currency = 'ETH') => {
    if (typeof value !== 'number') return 'N/A';
    return `${value.toFixed(4)} ${currency}`;
  },
  // Format percentage
  formatPercentage: (value, precision = 1) => {
    if (typeof value !== 'number') return 'N/A';
    return `${value.toFixed(precision)}%`;
  },
  // Format compact numbers
  formatCompact: (value) => {
    if (typeof value !== 'number') return 'N/A';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  }
};

export default dashboardTheme;

