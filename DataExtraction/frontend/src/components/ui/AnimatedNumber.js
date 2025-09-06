/**
 * Animated Number Component
 * Provides smooth number animations using react-spring
 */

import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Typography } from '@mui/material';

const AnimatedNumber = ({ 
  value, 
  duration = 1000, 
  format = 'number',
  precision = 2,
  variant = 'h6',
  color = 'primary',
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  // Convert value to number if it's a string
  const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
  
  const springProps = useSpring({
    from: { number: 0 },
    to: { number: numericValue },
    config: { duration },
    onFrame: ({ number }) => setDisplayValue(number)
  });

  // Format the number based on the format prop
  const formatNumber = (num) => {
    if (format === 'currency') {
      return `$${num.toFixed(precision)}`;
    } else if (format === 'percentage') {
      return `${num.toFixed(precision)}%`;
    } else if (format === 'eth') {
      return `${num.toFixed(precision)} ETH`;
    } else if (format === 'compact') {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toFixed(precision);
    } else {
      return num.toFixed(precision);
    }
  };

  return (
    <animated.div>
      <Typography variant={variant} color={color} {...props}>
        {formatNumber(displayValue)}
      </Typography>
    </animated.div>
  );
};

export default AnimatedNumber;
