import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  useTrustScore,
  useDarkMode,
  useAnimationsEnabled 
} from '../../../store/store';

const TrustScoreGauge = () => {
  // Get data from store using the safe selector
  const trustScore = useTrustScore(); // This already handles null/undefined values
  const darkMode = useDarkMode();
  const animationsEnabled = useAnimationsEnabled();
  
  // Log the trust score for debugging
  console.log('[TrustScoreGauge] Rendering with trust score:', trustScore);
  const canvasRef = useRef(null);
  
  // Calculate colors based on score
  const getScoreColor = (score) => {
    if (score >= 80) return '#39FF14'; // neon-green
    if (score >= 60) return '#00FFFF'; // electric-blue
    if (score >= 40) return '#FFFF00'; // yellow
    if (score >= 20) return '#FF9500'; // orange
    return '#FF2D55'; // red
  };

  const scoreColor = getScoreColor(trustScore);
  
  // Draw the gauge on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background track
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI, false);
    ctx.lineWidth = 15;
    ctx.strokeStyle = darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    ctx.stroke();
    
    // Draw score arc
    const scoreRatio = trustScore / 100;
    const endAngle = Math.PI + scoreRatio * Math.PI;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, endAngle, false);
    ctx.lineWidth = 15;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(
      centerX - radius, centerY, centerX + radius, centerY
    );
    gradient.addColorStop(0, '#3C00FF'); // neon-purple
    gradient.addColorStop(1, scoreColor);
    
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Add glow effect
    if (animationsEnabled) {
      ctx.shadowColor = scoreColor;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI, endAngle, false);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Draw center text
    ctx.fillStyle = darkMode ? '#FFFFFF' : '#000000';
    ctx.font = 'bold 24px Orbitron';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(trustScore, centerX, centerY - 15);
    
    ctx.font = '16px Rajdhani';
    ctx.fillText('TRUST SCORE', centerX, centerY + 15);
    
  }, [trustScore, darkMode, animationsEnabled, scoreColor]);
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={200} 
        className="max-w-full"
      />
      
      {/* Animated markers */}
      {animationsEnabled && (
        <>
          <motion.div 
            className="absolute w-2 h-2 rounded-full bg-electric-blue"
            style={{ 
              left: '10%', 
              top: '40%',
              boxShadow: '0 0 10px 2px #00FFFF'
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
          <motion.div 
            className="absolute w-2 h-2 rounded-full bg-neon-purple"
            style={{ 
              right: '10%', 
              top: '40%',
              boxShadow: '0 0 10px 2px #3C00FF'
            }}
            animate={{
              opacity: [0.4, 1, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: 0.5
            }}
          />
        </>
      )}
      
      {/* Score label with animation */}
      <motion.div 
        className="absolute bottom-0 w-full text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-sm font-rajdhani text-gray-400">
          {getScoreLabel(trustScore)}
        </div>
      </motion.div>
    </div>
  );
};

// Helper function to get score label
const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Average';
  if (score >= 20) return 'Poor';
  return 'Very Poor';
};

export default TrustScoreGauge;