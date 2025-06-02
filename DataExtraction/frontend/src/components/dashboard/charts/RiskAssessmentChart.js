import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  useStore,
  useDarkMode,
  useAnimationsEnabled,
  useVisualizationType 
} from '../../../store/store';
import ReactApexChart from 'react-apexcharts';

const RiskAssessmentChart = () => {
  // Get data from store
  const riskData = useStore(state => state.riskData);
  const darkMode = useDarkMode();
  const animationsEnabled = useAnimationsEnabled();
  const visualizationType = useVisualizationType();
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!riskData || Object.keys(riskData).length === 0) return;

    // Format data for radar chart
    const categories = Object.keys(riskData).map(key => 
      key.replace(/([A-Z])/g, ' $1').trim() // Convert camelCase to spaces
    );
    
    const values = Object.values(riskData);

    // Configure chart options
    const options = {
      chart: {
        type: 'radar',
        toolbar: {
          show: false
        },
        animations: {
          enabled: animationsEnabled,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        background: 'transparent',
      },
      colors: ['#00FFFF'], // electric-blue
      fill: {
        opacity: 0.4,
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#3C00FF'], // neon-purple
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.7,
          opacityTo: 0.2,
        },
      },
      stroke: {
        width: 3,
        curve: 'smooth',
        colors: ['#00FFFF'], // electric-blue
        dashArray: visualizationType === 'Minimal' ? 5 : 0,
      },
      markers: {
        size: visualizationType === 'Minimal' ? 0 : 4,
        colors: ['#00FFFF'], // electric-blue
        strokeColors: '#00FFFF',
        strokeWidth: 2,
        hover: {
          size: 6,
        }
      },
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: Array(categories.length).fill(darkMode ? '#CCCCCC' : '#666666'),
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '12px',
          },
        }
      },
      yaxis: {
        show: false,
        min: 0,
        max: 100,
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        enabled: true,
        theme: darkMode ? 'dark' : 'light',
        style: {
          fontFamily: 'Rajdhani, sans-serif',
        },
        y: {
          formatter: function(value) {
            return value + '%';
          }
        }
      },
      plotOptions: {
        radar: {
          size: 140,
          polygons: {
            strokeColors: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            strokeWidth: 1,
            connectorColors: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            fill: {
              colors: [darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)']
            }
          }
        }
      },
      grid: {
        show: false,
      },
      legend: {
        show: false,
      },
    };

    const series = [
      {
        name: 'Risk Level',
        data: values
      }
    ];

    setChartOptions(options);
    setChartSeries(series);
    
    // Add a small delay to trigger the animation
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);

  }, [riskData, darkMode, animationsEnabled, visualizationType]);

  // If no data, show placeholder
  if (!riskData || Object.keys(riskData).length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No risk assessment data available</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chart Title */}
      <div className="text-center mb-2">
        <motion.h3 
          className="text-lg font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-neon-purple"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Risk Assessment Profile
        </motion.h3>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Animated glow effect behind chart */}
        {animationsEnabled && (
          <motion.div 
            className="absolute inset-0 rounded-full bg-electric-blue/5 z-0"
            animate={{
              boxShadow: [
                '0 0 0 rgba(0, 255, 255, 0)',
                '0 0 20px rgba(0, 255, 255, 0.3)',
                '0 0 0 rgba(0, 255, 255, 0)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          />
        )}
        
        <ReactApexChart 
          options={chartOptions} 
          series={chartSeries} 
          type="radar" 
          height={350} 
          className="z-10 relative"
        />
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-6">
        {Object.entries(riskData).map(([key, value], index) => (
          <motion.div 
            key={key}
            className="flex items-center space-x-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getRiskColor(value) }}
            />
            <span className="text-xs font-rajdhani">
              {key.replace(/([A-Z])/g, ' $1').trim()}: {value}%
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Helper function to get risk color
const getRiskColor = (value) => {
  if (value < 20) return '#39FF14'; // neon-green
  if (value < 40) return '#00FFFF'; // electric-blue
  if (value < 60) return '#FFFF00'; // yellow
  if (value < 80) return '#FF9500'; // orange
  return '#FF2D55'; // red
};

export default RiskAssessmentChart;