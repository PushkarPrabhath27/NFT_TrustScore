import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, addDays, addMonths, parseISO } from 'date-fns';
import { FiInfo, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const PredictiveAnalytics = ({ priceData }) => {
  const [predictionRange, setPredictionRange] = useState(90); // Default 90 days
  const [marketSentiment, setMarketSentiment] = useState(0); // -50 to 50
  const [volatility, setVolatility] = useState(50); // 0 to 100
  const [predictedData, setPredictedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confidence, setConfidence] = useState('medium');
  
  useEffect(() => {
    if (priceData?.history) {
      generatePredictions();
    }
  }, [priceData, predictionRange, marketSentiment, volatility]);
  
  // Generate price predictions based on historical data and user parameters
  const generatePredictions = () => {
    setIsLoading(true);
    
    if (!priceData?.history || priceData.history.length === 0) {
      setIsLoading(false);
      return;
    }
    
    // Get historical data for analysis
    const history = [...priceData.history];
    
    // Sort by date ascending
    history.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get current price (last price in the history)
    const currentPrice = parseFloat(history[history.length - 1].price);
    
    // Calculate average daily change
    let totalChange = 0;
    for (let i = 1; i < history.length; i++) {
      const prevPrice = parseFloat(history[i-1].price);
      const currentPrice = parseFloat(history[i].price);
      const change = (currentPrice - prevPrice) / prevPrice;
      totalChange += change;
    }
    
    // Average daily price change
    const avgDailyChange = totalChange / (history.length - 1);
    
    // Use sentiment to adjust the trend direction
    const sentimentFactor = marketSentiment / 100; // Convert to -0.5 to 0.5
    
    // Use volatility to determine the range of possible values
    const volatilityFactor = volatility / 100; // 0 to 1
    
    // Generate prediction data
    const predictions = [];
    
    // First, add historical data (last 30 days)
    const recentHistory = history.slice(-30);
    recentHistory.forEach(item => {
      predictions.push({
        date: item.date,
        formattedDate: format(parseISO(item.date), 'MMM dd'),
        price: parseFloat(item.price),
        type: 'historical'
      });
    });
    
    // Get last date from history
    const lastDate = new Date(history[history.length - 1].date);
    
    // Generate future predictions
    for (let i = 1; i <= predictionRange; i++) {
      const date = addDays(lastDate, i);
      
      // Base price change with sentiment factor
      const baseChange = avgDailyChange * (1 + sentimentFactor);
      
      // Add random volatility based on volatility factor
      const randomFactor = (Math.random() - 0.5) * volatilityFactor * 0.1;
      
      // Cumulative effect (compounding)
      const predictedPrice = currentPrice * Math.pow(1 + baseChange + randomFactor, i);
      
      // Calculate upper and lower bounds for confidence interval
      const confidenceInterval = 0.05 * volatilityFactor * i; // Grows with time
      const upperBound = predictedPrice * (1 + confidenceInterval);
      const lowerBound = predictedPrice * (1 - confidenceInterval);
      
      predictions.push({
        date: date.toISOString(),
        formattedDate: format(date, 'MMM dd'),
        price: parseFloat(predictedPrice.toFixed(4)),
        upperBound: parseFloat(upperBound.toFixed(4)),
        lowerBound: parseFloat(lowerBound.toFixed(4)),
        type: 'predicted'
      });
    }
    
    // Set confidence level based on volatility
    let confidenceLevel;
    if (volatility < 30) {
      confidenceLevel = 'high';
    } else if (volatility < 70) {
      confidenceLevel = 'medium';
    } else {
      confidenceLevel = 'low';
    }
    
    setConfidence(confidenceLevel);
    setPredictedData(predictions);
    setIsLoading(false);
  };
  
  // Calculate 30-day and 90-day predictions
  const shortTermPrediction = predictedData.find(item => item.type === 'predicted' && 
    new Date(item.date) >= addDays(new Date(predictedData.find(x => x.type === 'historical')?.date || new Date()), 30));
  
  const longTermPrediction = predictedData.find(item => item.type === 'predicted' && 
    new Date(item.date) >= addDays(new Date(predictedData.find(x => x.type === 'historical')?.date || new Date()), 90));
  
  // Calculate percentage change for predictions
  const currentPrice = predictedData.find(item => item.type === 'historical')?.price || 0;
  const shortTermChange = shortTermPrediction ? ((shortTermPrediction.price - currentPrice) / currentPrice) * 100 : 0;
  const longTermChange = longTermPrediction ? ((longTermPrediction.price - currentPrice) / currentPrice) * 100 : 0;
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="text-gray-300 font-medium">{data.formattedDate}</p>
          <p className="text-green-400 mt-2">
            Price: <span className="font-semibold">{data.price.toFixed(4)} ETH</span>
          </p>
          {data.type === 'predicted' && (
            <>
              <p className="text-blue-400 text-xs mt-1">
                Upper bound: {data.upperBound.toFixed(4)} ETH
              </p>
              <p className="text-blue-400 text-xs">
                Lower bound: {data.lowerBound.toFixed(4)} ETH
              </p>
              <p className="text-gray-400 text-xs mt-2">
                {data.type === 'historical' ? 'Historical data' : 'AI prediction'}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };
  
  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Generating price predictions...</p>
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
        <h3 className="text-xl font-bold text-white">AI Price Predictions</h3>
        <div className="flex items-center">
          <span className="text-sm text-gray-400 mr-2">Confidence:</span>
          <span className={`text-sm font-medium px-2 py-1 rounded ${
            confidence === 'high' ? 'bg-green-900 text-green-300' :
            confidence === 'medium' ? 'bg-yellow-900 text-yellow-300' :
            'bg-red-900 text-red-300'
          }`}>
            {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Prediction Range</span>
            <span className="text-white text-sm font-medium">{predictionRange} days</span>
          </div>
          <input 
            type="range" 
            min="30" 
            max="365" 
            step="30"
            value={predictionRange}
            onChange={(e) => setPredictionRange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>30d</span>
            <span>180d</span>
            <span>365d</span>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Market Sentiment</span>
            <span className={`text-sm font-medium ${
              marketSentiment > 15 ? 'text-green-400' :
              marketSentiment < -15 ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {marketSentiment > 15 ? 'Bullish' :
               marketSentiment < -15 ? 'Bearish' :
               'Neutral'}
            </span>
          </div>
          <input 
            type="range" 
            min="-50" 
            max="50"
            value={marketSentiment}
            onChange={(e) => setMarketSentiment(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Bearish</span>
            <span>Neutral</span>
            <span>Bullish</span>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Market Volatility</span>
            <span className={`text-sm font-medium ${
              volatility < 30 ? 'text-green-400' :
              volatility > 70 ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {volatility < 30 ? 'Low' :
               volatility > 70 ? 'High' :
               'Medium'}
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100"
            value={volatility}
            onChange={(e) => setVolatility(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
      </div>
      
      <div className="h-80 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={predictedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fill: '#9CA3AF' }} 
              axisLine={{ stroke: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
            />
            <YAxis 
              domain={['auto', 'auto']}
              tick={{ fill: '#9CA3AF' }} 
              axisLine={{ stroke: '#4B5563' }}
              tickLine={{ stroke: '#4B5563' }}
              label={{ value: 'Price (ETH)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Historical price line */}
            <Line
              type="monotone"
              dataKey="price"
              name="Historical Price"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 0 }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#34D399' }}
              connectNulls
              isAnimationActive={true}
              animationDuration={1000}
            />
            
            {/* Predicted price line (dashed) */}
            <Line
              type="monotone"
              dataKey="price"
              name="Predicted Price"
              stroke="#8B5CF6"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 0 }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#A78BFA' }}
              connectNulls
              isAnimationActive={true}
              animationDuration={1000}
            />
            
            {/* Upper confidence bound */}
            <Line
              type="monotone"
              dataKey="upperBound"
              name="Upper Bound"
              stroke="#8B5CF6"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={true}
              animationDuration={1000}
            />
            
            {/* Lower confidence bound */}
            <Line
              type="monotone"
              dataKey="lowerBound"
              name="Lower Bound"
              stroke="#8B5CF6"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              activeDot={false}
              connectNulls
              isAnimationActive={true}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">30-Day Prediction</h4>
          {shortTermPrediction ? (
            <>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-green-400">{shortTermPrediction.price.toFixed(4)} ETH</span>
                <span className={`ml-2 flex items-center text-sm ${shortTermChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {shortTermChange >= 0 ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
                  {Math.abs(shortTermChange).toFixed(2)}%
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-400">Confidence Range</p>
                <p className="text-sm text-blue-400">
                  {shortTermPrediction.lowerBound.toFixed(4)} - {shortTermPrediction.upperBound.toFixed(4)} ETH
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-400">Insufficient data for prediction</p>
          )}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">90-Day Prediction</h4>
          {longTermPrediction ? (
            <>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-green-400">{longTermPrediction.price.toFixed(4)} ETH</span>
                <span className={`ml-2 flex items-center text-sm ${longTermChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {longTermChange >= 0 ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
                  {Math.abs(longTermChange).toFixed(2)}%
                </span>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-400">Confidence Range</p>
                <p className="text-sm text-blue-400">
                  {longTermPrediction.lowerBound.toFixed(4)} - {longTermPrediction.upperBound.toFixed(4)} ETH
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-400">Insufficient data for prediction</p>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <FiInfo className="mr-1" />
        <p>Predictions are based on historical data and should not be considered as financial advice. Adjust parameters to explore different scenarios.</p>
      </div>
    </motion.div>
  );
};

export default PredictiveAnalytics;
