import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Helper functions for derived data
const calculateVolatility = (priceData) => {
  if (!priceData || !Array.isArray(priceData) || priceData.length < 2) return 0;
  
  try {
    const prices = priceData.map(item => item.price || 0);
    const returns = [];
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i-1] === 0) continue;
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    if (returns.length === 0) return 0;
    
    const mean = returns.reduce((acc, val) => acc + val, 0) / returns.length;
    const variance = returns.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / returns.length;
    return Math.sqrt(variance) * 100; // Return as percentage
  } catch (error) {
    console.error('Error calculating volatility:', error);
    return 0;
  }
};

const extractTradingVolume = (nftData) => {
  if (!nftData) return 0;
  return nftData.priceStats?.volume24h || nftData.volume24h || 0;
};

const determineMarketTrend = (priceData) => {
  if (!priceData || !Array.isArray(priceData) || priceData.length < 2) {
    return { direction: 'stable', strength: 0, description: 'No trend data available' };
  }
  
  try {
    const recentPrices = priceData.slice(-7); // Last 7 data points
    const oldPrice = recentPrices[0].price;
    const newPrice = recentPrices[recentPrices.length - 1].price;
    
    if (oldPrice === 0) return { direction: 'stable', strength: 0, description: 'Insufficient data' };
    
    const percentChange = ((newPrice - oldPrice) / oldPrice) * 100;
    const direction = percentChange > 1 ? 'bullish' : percentChange < -1 ? 'bearish' : 'stable';
    const strength = Math.abs(percentChange);
    
    let description;
    if (direction === 'bullish') {
      description = strength > 10 ? 'Strong upward trend' : 'Slight upward trend';
    } else if (direction === 'bearish') {
      description = strength > 10 ? 'Strong downward trend' : 'Slight downward trend';
    } else {
      description = 'Stable market conditions';
    }
    
    return { direction, strength, description };
  } catch (error) {
    console.error('Error determining market trend:', error);
    return { direction: 'stable', strength: 0, description: 'Error calculating trend' };
  }
};

const calculateLiquidityScore = (nftData, analyticsData) => {
  if (!nftData) return 0;
  
  try {
    // Combine factors that indicate liquidity
    const volume = nftData.priceStats?.volume24h || 0;
    const activeListings = analyticsData?.activeListings || 0;
    const uniqueHolders = analyticsData?.uniqueHolders || 0;
    const totalSupply = nftData.totalSupply || 1;
    
    // Simple formula - can be refined with more data
    const score = (volume * 0.4) + (activeListings / totalSupply * 100 * 0.3) + (uniqueHolders / totalSupply * 100 * 0.3);
    return Math.min(Math.max(score, 0), 100); // Clamp between 0-100
  } catch (error) {
    console.error('Error calculating liquidity score:', error);
    return 0;
  }
};

const calculateSocialScore = (nftData) => {
  if (!nftData) return 0;
  
  try {
    // Combine social factors if available
    const twitterFollowers = nftData.social?.twitter?.followers || 0;
    const discordMembers = nftData.social?.discord?.members || 0;
    const mentions = nftData.social?.mentions || 0;
    
    // Simplistic formula - can be refined
    return Math.min((twitterFollowers / 1000) + (discordMembers / 500) + (mentions / 10), 100);
  } catch (error) {
    console.error('Error calculating social score:', error);
    return 0;
  }
};

const calculateGrowthRate = (nftData) => {
  if (!nftData || !nftData.growthStats) return 0;
  
  try {
    const { previousPeriod, currentPeriod } = nftData.growthStats || {};
    if (!previousPeriod || !currentPeriod || previousPeriod === 0) return 0;
    
    return ((currentPeriod - previousPeriod) / previousPeriod) * 100;
  } catch (error) {
    console.error('Error calculating growth rate:', error);
    return 0;
  }
};

export const useStore = create(
  persist(
    (set, get) => ({
      // UI State
      darkMode: true,
      animationsEnabled: true,
      visualizationType: 'default',
      sidebarCollapsed: false,
      
      // Data State
      nftData: null,
      trustScore: 0, 
      trustScoreData: null, 
      priceData: null,
      riskData: null,
      analyticsData: null,
      marketInsights: null, 
      socialMetrics: null, 
      marketTrends: null, 
      contractActivity: null, 
      loading: false,
      error: null,
      lastUpdated: null,
      
      // Settings
      toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
      toggleAnimations: () => set(state => ({ animationsEnabled: !state.animationsEnabled })),
      setVisualizationType: (type) => set({ visualizationType: type }),
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      // Data Actions
      setLoading: (status) => set({ loading: status }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Update data with new values from API
      updateData: (data) => {
        if (!data) return;
        
        console.log('[Store] Updating data:', data);
        
        // Validate and process trustScore specifically to fix the 0 value issue
        let processedTrustScore = get().trustScore;
        if (data.trustScore !== undefined && data.trustScore !== null) {
          // Ensure it's a number and valid
          processedTrustScore = Number(data.trustScore);
          if (isNaN(processedTrustScore)) {
            processedTrustScore = 0;
          }
        } else if (data.trustScoreData !== undefined && data.trustScoreData !== null) {
          // Try to use the legacy trustScoreData field if available
          processedTrustScore = Number(data.trustScoreData);
          if (isNaN(processedTrustScore)) {
            processedTrustScore = 0;
          }
        }
        
        // Generate derived data for market insights
        const marketInsights = data.nftData ? {
          volatility: calculateVolatility(data.priceData),
          tradingVolume: extractTradingVolume(data.nftData),
          marketTrend: determineMarketTrend(data.priceData),
          liquidityScore: calculateLiquidityScore(data.nftData, data.analyticsData),
          // Add more derived metrics as needed
        } : get().marketInsights;
        
        // Generate social metrics data if available in nftData
        const socialMetrics = data.nftData ? {
          communitySize: data.nftData.communitySize || data.nftData.holderCount || 0,
          socialScore: calculateSocialScore(data.nftData),
          engagement: data.nftData.engagement || 0,
          growth: calculateGrowthRate(data.nftData),
          // Add more social metrics as needed
        } : get().socialMetrics;
        
        // Generate market trends data
        const marketTrends = data.priceData ? {
          direction: data.marketTrends?.direction || determineMarketTrend(data.priceData).direction || 'stable',
          strength: data.marketTrends?.strength || determineMarketTrend(data.priceData).strength || 'moderate',
          support: data.marketTrends?.support || '0.42',
          resistance: data.marketTrends?.resistance || '0.58',
          prediction: data.marketTrends?.prediction || 'The collection is expected to maintain steady growth over the next 30 days.'
        } : get().marketTrends;
        
        // Generate contract activity data
        const contractActivity = data.nftData ? {
          recentTransactions: data.recentTransactions || [],
          transactionVolume: data.txVolume || data.nftData.volume24h || 0,
          uniqueHolders: data.uniqueHolders || data.nftData.holderCount || 0,
          averageHoldingTime: data.avgHoldTime || '45 days'
        } : get().contractActivity;
        
        set({
          nftData: data.nftData !== undefined ? data.nftData : get().nftData,
          trustScore: processedTrustScore, // Use processed trust score
          trustScoreData: processedTrustScore, // Keep both fields in sync
          priceData: data.priceData !== undefined ? data.priceData : get().priceData,
          riskData: data.riskData !== undefined ? data.riskData : get().riskData,
          analyticsData: data.analyticsData !== undefined ? data.analyticsData : get().analyticsData,
          marketInsights,
          socialMetrics,
          marketTrends,
          contractActivity,
          lastUpdated: new Date().toISOString(),
        });
      },
      
      // Reset all data
      resetData: () => set({
        nftData: null,
        trustScore: 0, // Default to 0 instead of null
        trustScoreData: null,
        priceData: null,
        riskData: null,
        analyticsData: null,
        marketInsights: null,
        socialMetrics: null,
        marketTrends: null,
        contractActivity: null,
        lastUpdated: null,
      }),
      
      // New helper functions for data validation and enhancement
      validateTrustScore: () => {
        const currentScore = get().trustScore;
        if (currentScore === null || currentScore === undefined || isNaN(currentScore)) {
          set({ trustScore: 0, trustScoreData: 0 });
          return 0;
        }
        return currentScore;
      },
    }),
    {
      name: 'nft-analyzer-storage',
      partialize: (state) => ({
        darkMode: state.darkMode,
        animationsEnabled: state.animationsEnabled,
        visualizationType: state.visualizationType,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Export the store hook as default only
export default useStore;

// Export selectors for better code organization
export const useDarkMode = () => useStore(state => state.darkMode);
export const useAnimationsEnabled = () => useStore(state => state.animationsEnabled);
export const useVisualizationType = () => useStore(state => state.visualizationType);
export const useLoading = () => useStore(state => state.loading);
export const useError = () => useStore(state => state.error);

// Data selectors with safety checks
export const useAnalyticsData = () => useStore(state => state.analyticsData || {});
export const useTrustScore = () => {
  const score = useStore(state => state.trustScore);
  return score === null || score === undefined || isNaN(score) ? 0 : Number(score);
};
export const useRiskData = () => useStore(state => state.riskData || {});
export const usePriceData = () => useStore(state => state.priceData || []);
export const useMarketInsights = () => useStore(state => state.marketInsights || {});
export const useSocialMetrics = () => useStore(state => state.socialMetrics || {});
export const useMarketTrends = () => useStore(state => state.marketTrends || {});
export const useContractActivity = () => useStore(state => state.contractActivity || {});

// Export actions
export const useStoreActions = () => {
  return useStore(state => ({
    toggleDarkMode: state.toggleDarkMode,
    toggleAnimations: state.toggleAnimations,
    setVisualizationType: state.setVisualizationType,
    toggleSidebar: state.toggleSidebar,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    updateData: state.updateData,
    resetData: state.resetData,
    validateTrustScore: state.validateTrustScore,
  }));
};

// Export actions for direct state updates
export const actions = {
  setNFTData: (data) => useStore.setState({ nftData: data }),
  setTrustScore: (data) => useStore.setState({ trustScore: data, trustScoreData: data }),
  setRiskData: (data) => useStore.setState({ riskData: data }),
  setPriceData: (data) => useStore.setState({ priceData: data }),
  setAnalyticsData: (data) => useStore.setState({ analyticsData: data }),
  setMarketInsights: (data) => useStore.setState({ marketInsights: data }),
  setSocialMetrics: (data) => useStore.setState({ socialMetrics: data }),
  setMarketTrends: (data) => useStore.setState({ marketTrends: data }),
  setContractActivity: (data) => useStore.setState({ contractActivity: data }),
  setError: (error) => useStore.setState({ error }),
  setLoading: (loading) => useStore.setState({ loading }),
  setLastUpdated: (timestamp) => useStore.setState({ lastUpdated: timestamp }),
};