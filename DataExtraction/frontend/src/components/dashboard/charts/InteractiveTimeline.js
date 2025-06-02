import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, ReferenceLine, ReferenceArea, Brush
} from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';
import { FiZoomIn, FiZoomOut, FiRefreshCw } from 'react-icons/fi';

const InteractiveTimeline = ({ data, trustScoreData }) => {
  const [timeRange, setTimeRange] = useState('6m'); // default 6 months
  const [zoomDomain, setZoomDomain] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [mergedData, setMergedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef(null);
  
  // Merge price and trust score data by date
  useEffect(() => {
    if (data?.priceData?.history && trustScoreData?.history) {
      setIsLoading(true);
      
      // Create a map of dates to easily merge the data
      const priceMap = new Map();
      data.priceData.history.forEach(item => {
        priceMap.set(item.date.split('T')[0], item.price);
      });
      
      // Create merged data with both price and trust score
      const merged = trustScoreData.history.map(item => {
        const date = item.date.split('T')[0];
        return {
          date,
          formattedDate: format(parseISO(item.date), 'MMM dd, yyyy'),
          trustScore: item.score,
          price: priceMap.get(date) || null
        };
      });
      
      // Sort by date
      merged.sort((a, b) => new Date(a.date) - new Date(b.date));
      setMergedData(merged);
      setIsLoading(false);
    }
  }, [data, trustScoreData]);
  
  // Filter data based on selected time range
  const filteredData = React.useMemo(() => {
    if (!mergedData.length) return [];
    
    const now = new Date();
    let startDate;
    
    switch(timeRange) {
      case '1m':
        startDate = subMonths(now, 1);
        break;
      case '3m':
        startDate = subMonths(now, 3);
        break;
      case '6m':
        startDate = subMonths(now, 6);
        break;
      case '1y':
        startDate = subMonths(now, 12);
        break;
      case 'all':
      default:
        return mergedData;
    }
    
    return mergedData.filter(item => new Date(item.date) >= startDate);
  }, [mergedData, timeRange]);
  
  // Handle zoom reset
  const handleResetZoom = () => {
    setZoomDomain(null);
    setSelectedPoint(null);
  };
  
  // Custom tooltip to show both price and trust score
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="text-gray-300 font-medium">{payload[0]?.payload?.formattedDate}</p>
          <div className="mt-2">
            {payload[0]?.value !== undefined && (
              <p className="text-blue-400">
                Trust Score: <span className="font-semibold">{payload[0].value}</span>
              </p>
            )}
            {payload[1]?.value !== undefined && (
              <p className="text-green-400">
                Price: <span className="font-semibold">{payload[1].value} ETH</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Handle point click to show detailed info
  const handlePointClick = (data) => {
    setSelectedPoint(data);
  };
  
  // If loading or no data, show loading state
  if (isLoading || !filteredData.length) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-400">Loading timeline data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 rounded-xl p-6 shadow-lg w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Interactive Timeline</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeRange('1m')}
            className={`px-3 py-1 rounded-full text-sm ${timeRange === '1m' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            1M
          </button>
          <button 
            onClick={() => setTimeRange('3m')}
            className={`px-3 py-1 rounded-full text-sm ${timeRange === '3m' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            3M
          </button>
          <button 
            onClick={() => setTimeRange('6m')}
            className={`px-3 py-1 rounded-full text-sm ${timeRange === '6m' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            6M
          </button>
          <button 
            onClick={() => setTimeRange('1y')}
            className={`px-3 py-1 rounded-full text-sm ${timeRange === '1y' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            1Y
          </button>
          <button 
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1 rounded-full text-sm ${timeRange === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            All
          </button>
        </div>
        
        {zoomDomain && (
          <button 
            onClick={handleResetZoom}
            className="flex items-center px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-sm text-gray-400"
          >
            <FiRefreshCw className="mr-1" /> Reset Zoom
          </button>
        )}
      </div>
      
      <div className="h-80 w-full" ref={chartRef}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseDown={e => e && setZoomDomain({ startIndex: e.activeTooltipIndex })}
            onMouseMove={e => e && zoomDomain && e.activeTooltipIndex !== undefined && setZoomDomain({ ...zoomDomain, endIndex: e.activeTooltipIndex })}
            onMouseUp={() => {
              if (zoomDomain && zoomDomain.endIndex !== undefined && zoomDomain.startIndex !== zoomDomain.endIndex) {
                // Zoom functionality
                const { startIndex, endIndex } = zoomDomain;
                const start = Math.min(startIndex, endIndex);
                const end = Math.max(startIndex, endIndex);
                
                // You can implement your zoom logic here using filtered indexes
                console.log(`Zoom from index ${start} to ${end}`);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="formattedDate" 
              scale="point" 
              tick={{ fill: '#9CA3AF' }} 
              axisLine={{ stroke: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
            />
            <YAxis 
              yAxisId="left"
              domain={[0, 100]} 
              tick={{ fill: '#9CA3AF' }} 
              axisLine={{ stroke: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
              label={{ value: 'Trust Score', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={['auto', 'auto']}
              tick={{ fill: '#9CA3AF' }} 
              axisLine={{ stroke: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
              label={{ value: 'Price (ETH)', angle: 90, position: 'insideRight', fill: '#9CA3AF' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#E5E7EB' }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="trustScore"
              name="Trust Score"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: '#1E3A8A', onClick: handlePointClick }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#60A5FA' }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="price"
              name="Price"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, fill: '#065F46', onClick: handlePointClick }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#34D399' }}
            />
            <Brush 
              dataKey="formattedDate" 
              height={30} 
              stroke="#4B5563"
              fill="#1F2937"
              tickFormatter={(tick) => format(new Date(tick), 'MMM')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {selectedPoint && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700"
        >
          <h4 className="font-medium text-white mb-2">Details for {selectedPoint.payload.formattedDate}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Trust Score</p>
              <p className="text-blue-400 text-lg font-semibold">{selectedPoint.payload.trustScore}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Price</p>
              <p className="text-green-400 text-lg font-semibold">{selectedPoint.payload.price} ETH</p>
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Click on data points to view detailed information. Use the brush at the bottom to navigate through time.</p>
      </div>
    </motion.div>
  );
};

export default InteractiveTimeline;
