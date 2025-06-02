import React from 'react';
import { motion } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import { useDarkMode, useAnimationsEnabled } from '../../../store/store';

const ContractActivityChart = ({ data }) => {
  const darkMode = useDarkMode();
  const animationsEnabled = useAnimationsEnabled();

  if (!data || !data.activities || data.activities.length === 0) return null;

  const processData = () => {
    const activities = data.activities.reduce((acc, activity) => {
      const date = new Date(activity.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return {
      dates: Object.keys(activities),
      counts: Object.values(activities)
    };
  };

  const { dates, counts } = processData();

  const chartData = {
    options: {
      chart: {
        type: 'bar',
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
        background: 'transparent'
      },
      colors: ['#00FFFF'],
      plotOptions: {
        bar: {
          borderRadius: 4,
          columnWidth: '70%',
          distributed: true,
          dataLabels: {
            position: 'top'
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val;
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: [darkMode ? '#CCCCCC' : '#666666']
        }
      },
      xaxis: {
        categories: dates,
        labels: {
          style: {
            colors: darkMode ? '#CCCCCC' : '#666666',
            fontFamily: 'Rajdhani, sans-serif'
          },
          rotate: -45,
          rotateAlways: false
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
          }
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
        y: {
          title: {
            formatter: () => 'Activities'
          }
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: 'vertical',
          gradientToColors: ['#3C00FF'],
          stops: [0, 100]
        }
      }
    },
    series: [{
      name: 'Activities',
      data: counts
    }]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gray-800 rounded-lg p-4 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-electric-blue">Contract Activity</h3>
        <div className="text-sm text-gray-400">
          Total Activities: {counts.reduce((a, b) => a + b, 0)}
        </div>
      </div>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
      />
    </motion.div>
  );
};

export default ContractActivityChart;