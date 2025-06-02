import React from 'react';
import { motion } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { useDarkMode, useAnimationsEnabled } from '../../../store/store';

const MarketTrendChart = ({ data }) => {
  const darkMode = useDarkMode();
  const animationsEnabled = useAnimationsEnabled();

  if (!data || data.length === 0) return null;

  const chartData = {
    options: {
      chart: {
        type: 'area',
        height: 350,
        toolbar: {
          show: false
        },
        animations: {
          enabled: animationsEnabled,
          easing: 'easeinout',
          speed: 800
        },
        background: 'transparent'
      },
      colors: ['#00FFFF'],
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
              color: '#00FFFF',
              opacity: 0.7
            },
            {
              offset: 100,
              color: '#3C00FF',
              opacity: 0.2
            }
          ]
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      xaxis: {
        type: 'datetime',
        categories: data.map(item => item.timestamp),
        labels: {
          style: {
            colors: darkMode ? '#CCCCCC' : '#666666',
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
            colors: darkMode ? '#CCCCCC' : '#666666',
            fontFamily: 'Rajdhani, sans-serif'
          },
          formatter: (value) => value.toFixed(4)
        }
      },
      grid: {
        borderColor: darkMode ? '#333333' : '#E5E5E5',
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      tooltip: {
        theme: darkMode ? 'dark' : 'light',
        x: {
          format: 'dd MMM yyyy'
        },
        y: {
          formatter: (value) => value.toFixed(4)
        }
      },
      dataLabels: {
        enabled: false
      }
    },
    series: [{
      name: 'Price',
      data: data.map(item => item.price)
    }]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[350px] bg-gray-800 rounded-lg p-4 shadow-lg"
    >
      <h3 className="text-xl font-semibold mb-4 text-electric-blue">Market Trends</h3>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="area"
        height={300}
      />
    </motion.div>
  );
};

export default MarketTrendChart;