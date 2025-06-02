/**
 * Analysis Repository
 * Handles database operations for NFT contract analysis results
 */

import Analysis from './models/analysisModel.js';

/**
 * Save analysis results to database
 * @param {string} contractAddress - Ethereum contract address
 * @param {Object} analysisResult - Analysis results
 * @returns {Promise<Object>} Saved analysis document
 */
export const saveAnalysisToDatabase = async (contractAddress, analysisResult) => {
  try {
    if (!contractAddress) {
      throw new Error('Contract address is required');
    }

    // Ensure analysisResult is a valid object
    if (!analysisResult || typeof analysisResult !== 'object') {
      throw new Error('analysisResult must be an object');
    }

    // Validate required fields
    const requiredFields = ['marketSegment', 'marketPositionScore', 'summary'];
    const missingFields = requiredFields.filter(field => {
      const value = analysisResult[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check if analysis already exists
    const existingAnalysis = await Analysis.findOne({ contractAddress: contractAddress.toLowerCase() });
    
    if (existingAnalysis) {
      // Update existing analysis
      Object.assign(existingAnalysis, {
        ...analysisResult,
        contractAddress: contractAddress.toLowerCase(),
        timestamp: new Date()
      });
      
      await existingAnalysis.save();
      console.log(`Updated analysis for contract ${contractAddress}`);
      return existingAnalysis;
    } else {
      // Create new analysis
      const newAnalysis = new Analysis({
        ...analysisResult,
        contractAddress: contractAddress.toLowerCase(),
        timestamp: new Date()
      });
      
      await newAnalysis.save();
      console.log(`Saved new analysis for contract ${contractAddress}`);
      return newAnalysis;
    }
  } catch (error) {
    console.error(`Error saving analysis for ${contractAddress}:`, error);
    throw error;
  }
};

/**
 * Get latest analysis from database
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<Object|null>} Analysis document or null if not found
 */
export const getLatestAnalysisFromDatabase = async (contractAddress) => {
  try {
    const analysis = await Analysis.findOne({ 
      contractAddress: contractAddress.toLowerCase() 
    }).sort({ timestamp: -1 });
    
    return analysis;
  } catch (error) {
    console.error(`Error getting analysis for ${contractAddress}:`, error);
    throw error;
  }
};

/**
 * Get analysis history from database
 * @param {string} contractAddress - Ethereum contract address
 * @param {number} limit - Maximum number of results to retrieve
 * @returns {Promise<Array>} Analysis history
 */
export const getAnalysisHistory = async (contractAddress, limit = 10) => {
  try {
    const history = await Analysis.find({ 
      contractAddress: contractAddress.toLowerCase() 
    })
    .sort({ timestamp: -1 })
    .limit(limit);
    
    return history;
  } catch (error) {
    console.error(`Error getting analysis history for ${contractAddress}:`, error);
    throw error;
  }
};

/**
 * Delete analysis from database
 * @param {string} contractAddress - Ethereum contract address
 * @returns {Promise<boolean>} Whether the analysis was successfully deleted
 */
export const deleteAnalysis = async (contractAddress) => {
  try {
    const result = await Analysis.deleteMany({ 
      contractAddress: contractAddress.toLowerCase() 
    });
    
    console.log(`Deleted ${result.deletedCount} analysis records for ${contractAddress}`);
    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting analysis for ${contractAddress}:`, error);
    throw error;
  }
};

/**
 * Get analysis by market segment
 * @param {string} segment - Market segment
 * @param {number} limit - Maximum number of results to retrieve
 * @returns {Promise<Array>} Analysis results for the segment
 */
export const getAnalysisBySegment = async (segment, limit = 20) => {
  try {
    const results = await Analysis.find({ marketSegment: segment })
      .sort({ timestamp: -1 })
      .limit(limit);
    
    return results;
  } catch (error) {
    console.error(`Error getting analysis for segment ${segment}:`, error);
    throw error;
  }
};