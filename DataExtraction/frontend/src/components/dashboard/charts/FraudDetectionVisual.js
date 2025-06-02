import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { FiAlertTriangle, FiShield, FiActivity, FiUsers, FiDollarSign, FiClock, FiCode, FiInfo } from 'react-icons/fi';

const FraudDetectionVisual = ({ fraudData, riskScore }) => {
  const [radarData, setRadarData] = useState([]);
  const [highlightedMetric, setHighlightedMetric] = useState(null);
  const [riskLevel, setRiskLevel] = useState('low');
  const [loading, setLoading] = useState(true);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  
  useEffect(() => {
    if (fraudData) {
      setLoading(true);
      
      // Process fraud data into radar chart format
      const metrics = [
        { name: 'Contract Security', key: 'contractSecurity', icon: <FiCode /> },
        { name: 'Transaction Pattern', key: 'transactionPattern', icon: <FiActivity /> },
        { name: 'Creator History', key: 'creatorHistory', icon: <FiUsers /> },
        { name: 'Price Manipulation', key: 'priceManipulation', icon: <FiDollarSign /> },
        { name: 'Age & Activity', key: 'ageAndActivity', icon: <FiClock /> },
        { name: 'Ownership Distribution', key: 'ownershipDistribution', icon: <FiUsers /> }
      ];
      
      // Format data for radar chart
      const formattedData = metrics.map(metric => ({
        metric: metric.name,
        value: 100 - (fraudData[metric.key]?.score || 0), // Invert so higher is better
        fullMark: 100,
        key: metric.key,
        icon: metric.icon,
        alert: fraudData[metric.key]?.alert || false,
        description: fraudData[metric.key]?.description || ''
      }));
      
      setRadarData(formattedData);
      
      // Extract alerts
      const alerts = formattedData
        .filter(item => item.alert)
        .map(item => ({
          metric: item.metric,
          key: item.key,
          description: item.description,
          severity: getSeverity(100 - item.value)
        }));
      
      setFraudAlerts(alerts);
      
      // Set risk level based on risk score
      if (riskScore < 30) {
        setRiskLevel('low');
      } else if (riskScore < 70) {
        setRiskLevel('medium');
      } else {
        setRiskLevel('high');
      }
      
      setLoading(false);
    }
  }, [fraudData, riskScore]);
  
  // Helper function to get severity level based on score
  const getSeverity = (score) => {
    if (score < 30) return 'critical';
    if (score < 50) return 'high';
    if (score < 70) return 'medium';
    return 'low';
  };
  
  // Helper function to get color based on score
  const getColorForScore = (score) => {
    if (score < 30) return '#EF4444'; // red
    if (score < 50) return '#F59E0B'; // amber
    if (score < 70) return '#10B981'; // green
    return '#059669'; // emerald
  };
  
  // Get color for risk level
  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'high': return 'text-red-500 bg-red-900/30';
      case 'medium': return 'text-amber-500 bg-amber-900/30';
      case 'low': return 'text-green-500 bg-green-900/30';
      default: return 'text-blue-500 bg-blue-900/30';
    }
  };
  
  // Custom tooltip for radar chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
          <p className="text-gray-300 font-medium">{data.metric}</p>
          <p className="text-blue-400 mt-2">
            Score: <span className="font-semibold">{data.value}</span>
          </p>
          {data.description && (
            <p className="text-gray-400 text-xs mt-2">{data.description}</p>
          )}
          {data.alert && (
            <div className="mt-2 flex items-center text-red-400">
              <FiAlertTriangle className="mr-1" />
              <span className="text-xs">Potential risk detected</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };
  
  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 shadow-lg w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mb-4"></div>
          <p className="text-gray-400">Analyzing fraud indicators...</p>
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
        <h3 className="text-xl font-bold text-white flex items-center">
          <FiShield className="mr-2" /> Fraud Detection Analysis
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(riskLevel)}`}>
          {riskLevel === 'high' ? 'High Risk' : riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#4B5563" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#9CA3AF' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9CA3AF' }} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#F472B6"
                  fill="#F472B6"
                  fillOpacity={0.3}
                  onMouseOver={(data) => setHighlightedMetric(data.key)}
                  onMouseOut={() => setHighlightedMetric(null)}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4 h-full">
            <h4 className="text-white font-medium mb-4 flex items-center">
              <FiAlertTriangle className="mr-2 text-red-500" /> Fraud Alerts
            </h4>
            
            {fraudAlerts.length > 0 ? (
              <div className="space-y-4">
                {fraudAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      alert.severity === 'critical' ? 'border-red-800 bg-red-900/20' :
                      alert.severity === 'high' ? 'border-orange-800 bg-orange-900/20' :
                      alert.severity === 'medium' ? 'border-yellow-800 bg-yellow-900/20' :
                      'border-blue-800 bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <FiAlertTriangle className={`mr-2 ${
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'high' ? 'text-orange-500' :
                        alert.severity === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <h5 className="text-white text-sm font-medium">{alert.metric}</h5>
                    </div>
                    <p className="text-gray-400 text-xs">{alert.description}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-56 text-center">
                <FiShield className="text-4xl text-green-500 mb-3" />
                <p className="text-gray-400">No fraud indicators detected</p>
                <p className="text-xs text-gray-500 mt-2">This NFT contract appears to be legitimate based on our analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {radarData.map((item) => (
          <motion.div
            key={item.key}
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-lg border border-gray-800 bg-gray-800/50 ${
              highlightedMetric === item.key ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="mr-2 text-gray-400">{item.icon}</span>
                <h5 className="text-white text-sm font-medium">{item.metric}</h5>
              </div>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${getColorForScore(item.value)}20` }}
              >
                <span 
                  className="text-sm font-bold"
                  style={{ color: getColorForScore(item.value) }}
                >
                  {item.value}
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-xs">{item.description || 'No issues detected.'}</p>
            {item.alert && (
              <div className="mt-2 text-xs flex items-center text-red-400">
                <FiAlertTriangle className="mr-1" />
                <span>Potential risk detected</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <FiInfo className="mr-1" />
        <p>Our fraud detection system analyzes multiple factors to identify potential risks. Hover over each metric to see details.</p>
      </div>
    </motion.div>
  );
};

export default FraudDetectionVisual;
