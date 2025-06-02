import React from 'react';
import { useDarkMode } from '../../../store/store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PortfolioTracker = ({ userId, portfolioData, contractAddress }) => {
  const darkMode = useDarkMode();
  
  if (!portfolioData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No portfolio data available</p>
      </div>
    );
  }
  
  // Format the data for the chart
  const chartData = portfolioData.history?.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    value: item.value
  })) || [];
  
  // Calculate portfolio metrics
  const totalValue = portfolioData.totalValue || 0;
  const totalChange = portfolioData.totalChange || 0;
  const isPositiveChange = totalChange >= 0;
  
  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <h3 className="text-sm text-gray-500 mb-1">Total Value</h3>
          <p className="text-xl font-semibold">{totalValue.toFixed(2)} ETH</p>
        </div>
        
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <h3 className="text-sm text-gray-500 mb-1">24h Change</h3>
          <p className={`text-xl font-semibold ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveChange ? '+' : ''}{totalChange.toFixed(2)}%
          </p>
        </div>
        
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          <h3 className="text-sm text-gray-500 mb-1">Holdings</h3>
          <p className="text-xl font-semibold">{portfolioData.holdings?.length || 0} NFTs</p>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Portfolio Value History</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: darkMode ? '#9ca3af' : '#4b5563' }}
                axisLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
              />
              <YAxis 
                tick={{ fill: darkMode ? '#9ca3af' : '#4b5563' }}
                axisLine={{ stroke: darkMode ? '#4b5563' : '#d1d5db' }}
                tickFormatter={(value) => `${value} ETH`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  borderColor: darkMode ? '#374151' : '#e5e7eb',
                  color: darkMode ? '#f3f4f6' : '#1f2937'
                }}
                formatter={(value) => [`${value.toFixed(2)} ETH`, 'Value']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#portfolioGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Your NFT Holdings</h3>
        {portfolioData.holdings && portfolioData.holdings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className={`min-w-full ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <thead>
                <tr className={darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-right">Value (ETH)</th>
                  <th className="px-4 py-2 text-right">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.holdings.map((item, index) => (
                  <tr 
                    key={item.id || index}
                    className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}
                  >
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2 text-right">{item.value.toFixed(2)}</td>
                    <td className={`px-4 py-2 text-right ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No holdings data available</p>
        )}
      </div>
    </div>
  );
};

export default PortfolioTracker;
