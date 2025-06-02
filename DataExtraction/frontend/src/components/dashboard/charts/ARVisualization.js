import React, { useEffect, useRef } from 'react';
import { useDarkMode } from '../../../store/store';

const ARVisualization = ({ data }) => {
  const canvasRef = useRef(null);
  const darkMode = useDarkMode();
  
  useEffect(() => {
    if (!data || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = darkMode ? '#111827' : '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw placeholder visualization
    ctx.fillStyle = darkMode ? '#3b82f6' : '#2563eb';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AR Visualization Placeholder', canvas.width / 2, canvas.height / 2);
    
    // Draw some decorative elements to simulate AR content
    ctx.strokeStyle = darkMode ? '#60a5fa' : '#3b82f6';
    ctx.lineWidth = 2;
    
    // Draw a cube wireframe
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = 80;
    
    // Front face
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY - size);
    ctx.lineTo(centerX + size, centerY - size);
    ctx.lineTo(centerX + size, centerY + size);
    ctx.lineTo(centerX - size, centerY + size);
    ctx.lineTo(centerX - size, centerY - size);
    ctx.stroke();
    
    // Back face
    ctx.beginPath();
    ctx.moveTo(centerX - size/2, centerY - size/2 - 50);
    ctx.lineTo(centerX + size/2 + 50, centerY - size/2 - 50);
    ctx.lineTo(centerX + size/2 + 50, centerY + size/2);
    ctx.lineTo(centerX - size/2, centerY + size/2);
    ctx.lineTo(centerX - size/2, centerY - size/2 - 50);
    ctx.stroke();
    
    // Connect front to back
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY - size);
    ctx.lineTo(centerX - size/2, centerY - size/2 - 50);
    ctx.moveTo(centerX + size, centerY - size);
    ctx.lineTo(centerX + size/2 + 50, centerY - size/2 - 50);
    ctx.moveTo(centerX + size, centerY + size);
    ctx.lineTo(centerX + size/2 + 50, centerY + size/2);
    ctx.moveTo(centerX - size, centerY + size);
    ctx.lineTo(centerX - size/2, centerY + size/2);
    ctx.stroke();
    
    // Add some text
    ctx.fillStyle = darkMode ? '#f3f4f6' : '#1f2937';
    ctx.font = '12px Arial';
    ctx.fillText('NFT 3D Model Preview', canvas.width / 2, canvas.height - 40);
    
  }, [data, darkMode]);
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold mb-1">AR NFT Visualization</h3>
        <p className="text-sm text-gray-500">
          {data && data.modelUrl ? 'Interactive 3D model available' : 'Placeholder visualization'}
        </p>
      </div>
      <canvas 
        ref={canvasRef} 
        width={500} 
        height={300}
        className="border border-gray-300 rounded-lg shadow-sm"
      />
      <div className="mt-4 text-sm text-center">
        <p>This is a placeholder for AR visualization. In a production environment, this would use Three.js or a similar library to render actual 3D models of the NFT.</p>
      </div>
    </div>
  );
};

export default ARVisualization;
