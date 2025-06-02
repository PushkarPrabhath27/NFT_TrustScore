import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  useStore,
  useDarkMode,
  useAnimationsEnabled,
  useVisualizationType 
} from '../../../store/store';
import ReactApexChart from 'react-apexcharts';

const PriceHistoryChart = () => {
  // Get data from store
  const priceData = useStore(state => state.priceData);
  const darkMode = useDarkMode();
  const animationsEnabled = useAnimationsEnabled();
  const visualizationType = useVisualizationType();
  
  // Local state
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);
  const [timeRange, setTimeRange] = useState('1M'); // Default to 1 month
  const [isLoaded, setIsLoaded] = useState(false);

  // Time range options
  const timeRanges = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

  // Filter data based on time range
  const filterDataByTimeRange = useCallback((data, range) => {
    if (!data || !Array.isArray(data)) return [];
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (range) {
      case '1W':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.timestamp) >= cutoffDate);
  }, []);

  // Update chart when data or time range changes
  useEffect(() => {
    if (!priceData || !Array.isArray(priceData) || priceData.length === 0) {
      console.warn('No price data available');
      return;
    }

    // Filter data based on selected time range
    const filteredData = filterDataByTimeRange(priceData, timeRange);

    // Configure chart options
    const options = {
      chart: {
        type: 'area',
        height: 350,
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
        fontFamily: 'Rajdhani, sans-serif',
      },
      colors: ['#00FFFF'], // electric-blue
      fill: {
        type: 'gradient',
        gradient: {
          shade: darkMode ? 'dark' : 'light',
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#3C00FF'], // neon-purple
          inverseColors: false,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 100],
        },
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        colors: ['#00FFFF'], // electric-blue
        dashArray: visualizationType === 'Minimal' ? 5 : 0,
      },
      grid: {
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: darkMode ? '#CCCCCC' : '#666666',
            fontFamily: 'Rajdhani, sans-serif',
          },
          datetimeFormatter: {
            year: 'yyyy',
            month: "MMM 'yy",
            day: 'dd MMM',
            hour: 'HH:mm'
          }
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: darkMode ? '#CCCCCC' : '#666666',
            fontFamily: 'Rajdhani, sans-serif',
          },
          formatter: function(value) {
            return value.toFixed(4) + ' HTR';
          }
        }
      },
      tooltip: {
        theme: darkMode ? 'dark' : 'light',
        x: {
          format: 'dd MMM yyyy'
        },
        y: {
          formatter: function(value) {
            return value.toFixed(6) + ' HTR';
          }
        },
        style: {
          fontFamily: 'Rajdhani, sans-serif',
        },
        marker: {
          show: true,
        },
      },
      dataLabels: {
        enabled: false
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
    };

    const series = [
      {
        name: 'Price (HTR)',
        data: filteredData.map(item => ({
          x: new Date(item.timestamp).getTime(),
          y: item.price
        }))
      }
    ];

    setChartOptions(options);
    setChartSeries(series);
    
    // Add a small delay to trigger the animation
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);

  }, [priceData, timeRange, darkMode, animationsEnabled, visualizationType, filterDataByTimeRange]);

  // If no data, show placeholder
  if (!priceData || priceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No price history data available</p>
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
      {/* Time Range Selector */}
      <div className="flex justify-end mb-4 space-x-2">
        {timeRanges.map((range) => (
          <motion.button
            key={range}
            className={`px-2 py-1 text-xs font-orbitron rounded-md transition-all ${timeRange === range 
              ? 'bg-electric-blue text-black font-bold shadow-neon-glow' 
              : `${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'} hover:bg-electric-blue/20`}`}
            onClick={() => setTimeRange(range)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {range}
          </motion.button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Animated glow effect behind chart */}
        {animationsEnabled && (
          <motion.div 
            className="absolute inset-0 rounded-xl bg-electric-blue/5 z-0"
            animate={{
              boxShadow: [
                '0 0 0 rgba(0, 255, 255, 0)',
                '0 0 20px rgba(0, 255, 255, 0.2)',
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
          type="area" 
          height={300} 
          className="z-10 relative"
        />
      </div>

      {/* Price Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {getPriceStats(priceData, timeRange).map((stat, index) => (
          <motion.div 
            key={stat.label}
            className={`p-2 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'} text-center`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <p className="text-xs text-gray-500 font-rajdhani">{stat.label}</p>
            <p className={`text-sm font-bold font-orbitron ${stat.color}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Helper function to calculate price stats
const getPriceStats = (data, timeRange) => {
  if (!data || data.length === 0) return [];
  
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '1W':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case '1M':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case '3M':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case '6M':
      startDate = new Date(now.setMonth(now.getMonth() - 6));
      break;
    case '1Y':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(0); // Beginning of time for 'ALL'
  }
  
  const filteredData = timeRange === 'ALL' 
    ? data 
    : data.filter(item => new Date(item.timestamp) >= startDate);
  
  if (filteredData.length === 0) return [];
  
  const prices = filteredData.map(item => item.price);
  const currentPrice = prices[prices.length - 1];
  const oldestPrice = prices[0];
  
  const priceChange = currentPrice - oldestPrice;
  const percentChange = (priceChange / oldestPrice) * 100;
  
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  
  return [
    {
      label: 'Current Price',
      value: currentPrice.toFixed(6) + ' HTR',
      color: 'text-electric-blue'
    },
    {
      label: `${timeRange} Change`,
      value: `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%`,
      color: percentChange >= 0 ? 'text-neon-green' : 'text-red-500'
    },
    {
      label: `${timeRange} Range`,
      value: `${minPrice.toFixed(6)} - ${maxPrice.toFixed(6)} HTR`,
      color: 'text-neon-purple'
    }
  ];
};

export default PriceHistoryChart;