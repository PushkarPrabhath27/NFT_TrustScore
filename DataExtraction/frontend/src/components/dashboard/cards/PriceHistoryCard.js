import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiDollarSign, FiCalendar } from 'react-icons/fi';
import ReactApexChart from 'react-apexcharts';

const PriceHistoryCard = ({ priceData }) => {
  const [timeRange, setTimeRange] = useState('1M'); // Default to 1 month
  
  if (!priceData || !priceData.history) return null;
  
  // Filter data based on selected time range
  const filterDataByTimeRange = (data, range) => {
    const now = new Date();
    let filterDate = new Date();
    
    switch(range) {
      case '1W':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.date) >= filterDate);
  };
  
  const filteredData = filterDataByTimeRange(priceData.history, timeRange);
  
  // Prepare data for chart
  const chartData = {
    series: [{
      name: 'Price',
      data: filteredData.map(item => [new Date(item.date).getTime(), item.price])
    }],
    options: {
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: false
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
        background: 'transparent',
        fontFamily: 'Rajdhani, sans-serif',
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 2,
        colors: ['#0ff']
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100],
          colorStops: [
            {
              offset: 0,
              color: '#0ff',
              opacity: 0.4
            },
            {
              offset: 100,
              color: '#0ff',
              opacity: 0
            },
          ]
        }
      },
      grid: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        strokeDashArray: 3,
        position: 'back',
      },
      tooltip: {
        theme: 'dark',
        x: {
          format: 'dd MMM yyyy'
        },
        y: {
          formatter: function(val) {
            return `${priceData.currency || '$'}${val.toFixed(2)}`;
          }
        },
        style: {
          fontFamily: 'Rajdhani, sans-serif'
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          style: {
            colors: '#718096',
            fontFamily: 'Rajdhani, sans-serif'
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
            colors: '#718096',
            fontFamily: 'Rajdhani, sans-serif'
          },
          formatter: function(val) {
            return `${priceData.currency || '$'}${val.toFixed(2)}`;
          }
        }
      },
      theme: {
        mode: 'dark'
      }
    },
  };
  
  // Calculate price change
  const calculatePriceChange = () => {
    if (filteredData.length < 2) return { value: 0, percentage: 0 };
    
    const oldestPrice = filteredData[0].price;
    const latestPrice = filteredData[filteredData.length - 1].price;
    
    const change = latestPrice - oldestPrice;
    const percentage = (change / oldestPrice) * 100;
    
    return {
      value: change,
      percentage: percentage
    };
  };
  
  const priceChange = calculatePriceChange();
  const isPositiveChange = priceChange.value >= 0;
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  const timeRangeOptions = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-neon-blue overflow-hidden relative"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-orbitron text-cyan-400 flex items-center">
          <FiTrendingUp className="mr-2" /> Price History
        </h2>
        
        {/* Current Price */}
        <div className="flex items-center">
          <FiDollarSign className="text-gray-400 mr-1" />
          <span className="text-xl font-bold text-white">
            {priceData.currency || '$'}{priceData.currentPrice?.toFixed(2) || '0.00'}
          </span>
          
          {/* Price Change */}
          {priceChange.value !== 0 && (
            <div className={`ml-2 text-sm ${isPositiveChange ? 'text-green-400' : 'text-red-400'} flex items-center`}>
              <span>{isPositiveChange ? '▲' : '▼'}</span>
              <span className="ml-1">
                {Math.abs(priceChange.percentage).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Time Range Selector */}
      <div className="flex justify-end mb-4">
        <div className="flex bg-gray-800 rounded-lg p-1">
          {timeRangeOptions.map(range => (
            <button
              key={range}
              className={`px-2 py-1 text-xs rounded-md transition-all ${timeRange === range ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      
      {/* Chart */}
      <div className="h-64 w-full">
        <ReactApexChart 
          options={chartData.options} 
          series={chartData.series} 
          type="area" 
          height="100%" 
          width="100%" 
        />
      </div>
      
      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <StatItem 
          label="24h Change" 
          value={`${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h?.toFixed(2)}%`} 
          isPositive={priceData.change24h >= 0}
        />
        <StatItem 
          label="7d Change" 
          value={`${priceData.change7d >= 0 ? '+' : ''}${priceData.change7d?.toFixed(2)}%`} 
          isPositive={priceData.change7d >= 0}
        />
        <StatItem 
          label="All-Time High" 
          value={`${priceData.currency || '$'}${priceData.allTimeHigh?.toFixed(2) || 'N/A'}`} 
          icon={<FiCalendar className="text-gray-400 text-xs ml-1" />}
          subValue={priceData.allTimeHighDate ? new Date(priceData.allTimeHighDate).toLocaleDateString() : null}
        />
        <StatItem 
          label="All-Time Low" 
          value={`${priceData.currency || '$'}${priceData.allTimeLow?.toFixed(2) || 'N/A'}`} 
          icon={<FiCalendar className="text-gray-400 text-xs ml-1" />}
          subValue={priceData.allTimeLowDate ? new Date(priceData.allTimeLowDate).toLocaleDateString() : null}
        />
      </div>
    </motion.div>
  );
};

const StatItem = ({ label, value, isPositive, icon, subValue }) => {
  const valueColor = isPositive !== undefined 
    ? (isPositive ? 'text-green-400' : 'text-red-400')
    : 'text-white';
    
  return (
    <div className="bg-gray-800 bg-opacity-50 p-3 rounded">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="flex items-center">
        <span className={`text-sm font-medium ${valueColor}`}>{value}</span>
        {icon && icon}
      </div>
      {subValue && <div className="text-xs text-gray-500 mt-1">{subValue}</div>}
    </div>
  );
};

export default PriceHistoryCard;