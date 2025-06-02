import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { FiPlus, FiTrash2, FiDollarSign, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiInfo } from 'react-icons/fi';

const PortfolioTracker = ({ currentNft, apiService }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [portfolioChangePercent, setPortfolioChangePercent] = useState(0);
  const [portfolioHistory, setPortfolioHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [error, setError] = useState('');
  
  // Load portfolio data from localStorage on component mount
  useEffect(() => {
    const savedPortfolio = localStorage.getItem('nftPortfolio');
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
    
    // Initialize with current date for purchase date
    setPurchaseDate(format(new Date(), 'yyyy-MM-dd'));
    
    // If currentNft has a price, pre-fill the purchase price
    if (currentNft?.priceData?.currentPrice) {
      setPurchasePrice(currentNft.priceData.currentPrice.toString());
    }
    
    generatePortfolioHistory();
  }, [currentNft]);
  
  // Calculate portfolio value whenever portfolio changes
  useEffect(() => {
    calculatePortfolioValue();
    
    // Save to localStorage whenever portfolio changes
    localStorage.setItem('nftPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);
  
  // Generate simulated portfolio history data
  const generatePortfolioHistory = () => {
    setIsLoading(true);
    
    // Create 30 days of simulated portfolio history
    const history = [];
    const today = new Date();
    let cumulativeValue = 0;
    
    for (let i = 30; i >= 0; i--) {
      const date = subDays(today, i);
      
      // Simulate some random price movements for demo purposes
      // In a real implementation, this would use actual historical price data
      const randomChange = (Math.random() - 0.4) * 0.03; // Slightly biased toward positive returns
      
      if (i === 30) {
        // Start with a base value
        cumulativeValue = 5 + Math.random() * 2;
      } else {
        // Apply random change
        cumulativeValue = cumulativeValue * (1 + randomChange);
      }
      
      history.push({
        date: format(date, 'yyyy-MM-dd'),
        formattedDate: format(date, 'MMM dd'),
        value: parseFloat(cumulativeValue.toFixed(4))
      });
    }
    
    setPortfolioHistory(history);
    
    // Calculate portfolio change
    if (history.length >= 2) {
      const currentValue = history[history.length - 1].value;
      const previousValue = history[history.length - 2].value;
      const change = currentValue - previousValue;
      const changePercent = (change / previousValue) * 100;
      
      setPortfolioValue(currentValue);
      setPortfolioChange(change);
      setPortfolioChangePercent(changePercent);
    }
    
    setIsLoading(false);
  };
  
  // Calculate current portfolio value
  const calculatePortfolioValue = () => {
    if (portfolio.length === 0) return;
    
    // In a real implementation, we would fetch current prices for all NFTs
    // For demo purposes, we'll use the purchase prices and add some random variation
    let totalValue = 0;
    
    portfolio.forEach(item => {
      // Simulate current price with random variation from purchase price
      const currentPrice = parseFloat(item.purchasePrice) * (1 + (Math.random() - 0.3) * 0.2);
      totalValue += currentPrice * item.quantity;
    });
    
    setPortfolioValue(totalValue);
  };
  
  // Add current NFT to portfolio
  const addToPortfolio = (e) => {
    e.preventDefault();
    
    if (!currentNft) {
      setError('No NFT selected');
      return;
    }
    
    if (!purchasePrice || isNaN(parseFloat(purchasePrice)) || parseFloat(purchasePrice) <= 0) {
      setError('Please enter a valid purchase price');
      return;
    }
    
    if (!purchaseDate) {
      setError('Please enter a purchase date');
      return;
    }
    
    // Check if this NFT is already in portfolio
    const existingIndex = portfolio.findIndex(item => 
      item.contractAddress === currentNft.contractAddress);
    
    if (existingIndex >= 0) {
      // Update existing entry
      const updatedPortfolio = [...portfolio];
      updatedPortfolio[existingIndex] = {
        ...updatedPortfolio[existingIndex],
        quantity: updatedPortfolio[existingIndex].quantity + parseInt(quantity),
        purchasePrice: parseFloat(purchasePrice),
        purchaseDate
      };
      
      setPortfolio(updatedPortfolio);
    } else {
      // Add new entry
      const newItem = {
        id: Date.now().toString(),
        name: currentNft.name || 'Unknown NFT',
        contractAddress: currentNft.contractAddress,
        image: currentNft.image || '',
        quantity: parseInt(quantity),
        purchasePrice: parseFloat(purchasePrice),
        purchaseDate
      };
      
      setPortfolio([...portfolio, newItem]);
    }
    
    // Reset form
    setQuantity(1);
    setPurchasePrice('');
    setShowAddForm(false);
    setError('');
  };
  
  // Remove NFT from portfolio
  const removeFromPortfolio = (id) => {
    setPortfolio(portfolio.filter(item => item.id !== id));
  };
  
  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="text-gray-300 font-medium">{payload[0].payload.formattedDate}</p>
          <p className="text-green-400 mt-2">
            Value: <span className="font-semibold">{payload[0].value.toFixed(4)} ETH</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Generate data for portfolio composition pie chart
  const getPortfolioComposition = () => {
    if (portfolio.length === 0) return [];
    
    return portfolio.map(item => ({
      name: item.name,
      value: item.quantity * parseFloat(item.purchasePrice)
    }));
  };
  
  // Colors for pie chart
  const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#0EA5E9'];
  
  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-400">Loading portfolio data...</p>
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
        <h3 className="text-xl font-bold text-white">NFT Portfolio Tracker</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm flex items-center"
        >
          <FiPlus className="mr-1" /> {showAddForm ? 'Cancel' : 'Add to Portfolio'}
        </button>
      </div>
      
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 bg-gray-800 p-4 rounded-lg"
        >
          <h4 className="text-white font-medium mb-3">Add {currentNft?.name || 'Current NFT'} to Portfolio</h4>
          
          {error && (
            <div className="mb-4 p-2 bg-red-900/30 border border-red-800 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={addToPortfolio}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Purchase Price (ETH)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded"
              >
                Add to Portfolio
              </button>
            </div>
          </form>
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Portfolio Value</p>
          <p className="text-2xl font-bold text-white mt-1">{portfolioValue.toFixed(4)} ETH</p>
          <div className="mt-1 flex items-center">
            <span className={`flex items-center text-sm ${portfolioChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioChange >= 0 ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
              {Math.abs(portfolioChange).toFixed(4)} ETH ({Math.abs(portfolioChangePercent).toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">NFTs in Portfolio</p>
          <p className="text-2xl font-bold text-white mt-1">{portfolio.length}</p>
          <p className="text-sm text-gray-400 mt-1">
            Total Quantity: {portfolio.reduce((acc, item) => acc + item.quantity, 0)}
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Estimated Profit/Loss</p>
          <p className="text-2xl font-bold text-white mt-1">
            {(portfolioValue - portfolio.reduce((acc, item) => acc + (item.purchasePrice * item.quantity), 0)).toFixed(4)} ETH
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Based on current market prices
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Portfolio Performance</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={portfolioHistory}
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
                    tick={{ fill: '#9CA3AF' }} 
                    axisLine={{ stroke: '#4B5563' }}
                    tickLine={{ stroke: '#4B5563' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#34D399' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4 h-full">
            <h4 className="text-white font-medium mb-3">Portfolio Composition</h4>
            {portfolio.length > 0 ? (
              <div className="h-64 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getPortfolioComposition()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getPortfolioComposition().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <FiInfo className="mx-auto text-3xl text-gray-600 mb-2" />
                  <p className="text-gray-400">No NFTs in your portfolio</p>
                  <p className="text-xs text-gray-500 mt-1">Add NFTs to see composition</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h4 className="text-white font-medium">Portfolio Items</h4>
        </div>
        
        {portfolio.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-left text-sm font-medium text-gray-300">NFT</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-300">Quantity</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-300">Purchase Price</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-300">Purchase Date</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-300">Current Value</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-300">P/L</th>
                  <th className="p-3 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((item) => {
                  // Calculate current value (in real app, this would use actual price data)
                  const currentPrice = parseFloat(item.purchasePrice) * (1 + (Math.random() - 0.3) * 0.2);
                  const currentValue = currentPrice * item.quantity;
                  const profitLoss = currentValue - (item.purchasePrice * item.quantity);
                  const profitLossPercent = (profitLoss / (item.purchasePrice * item.quantity)) * 100;
                  
                  return (
                    <tr key={item.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-750">
                      <td className="p-3">
                        <div className="flex items-center">
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-8 h-8 rounded mr-2 object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/40?text=NFT';
                              }}
                            />
                          )}
                          <span className="text-white">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-300">{item.quantity}</td>
                      <td className="p-3 text-gray-300">{item.purchasePrice.toFixed(4)} ETH</td>
                      <td className="p-3 text-gray-300">{item.purchaseDate}</td>
                      <td className="p-3 text-gray-300">{currentValue.toFixed(4)} ETH</td>
                      <td className="p-3">
                        <span className={profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {profitLoss.toFixed(4)} ETH ({profitLossPercent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => removeFromPortfolio(item.id)}
                          className="p-1 text-gray-400 hover:text-red-400"
                          title="Remove from portfolio"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <FiAlertCircle className="mx-auto text-3xl text-gray-600 mb-2" />
            <p className="text-gray-400">Your portfolio is empty</p>
            <p className="text-xs text-gray-500 mt-1">Add NFTs to your portfolio to track their performance</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <FiInfo className="mr-1" />
        <p>Portfolio data is stored locally in your browser. For demonstration purposes, current prices are simulated.</p>
      </div>
    </motion.div>
  );
};

export default PortfolioTracker;
