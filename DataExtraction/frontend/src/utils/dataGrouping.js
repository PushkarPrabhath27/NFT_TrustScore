/**
 * Data Grouping Utility
 * Organizes backend analysis data into logical sections for dashboard display
 */

// Removed icon imports as they're not needed in utility functions

/**
 * Defines the logical grouping of backend data fields
 */
export const DATA_SECTIONS = {
  SUMMARY: {
    id: 'summary',
    title: 'Summary & Segmentation',
    description: 'Overall analysis summary and market positioning',
    fields: ['summary', 'marketSegment', 'marketPositionScore'],
    color: 'primary'
  },
  MARKET: {
    id: 'market',
    title: 'Market & Price Analysis',
    description: 'Market trends, pricing data, and financial metrics',
    fields: ['marketData', 'priceData'],
    color: 'success'
  },
  PORTFOLIO: {
    id: 'portfolio',
    title: 'Portfolio & Holdings',
    description: 'Portfolio composition and asset distribution',
    fields: ['portfolioData'],
    color: 'info'
  },
  CREATOR: {
    id: 'creator',
    title: 'Creator & Collection',
    description: 'Creator information and collection metadata',
    fields: ['creatorData', 'collectionData'],
    color: 'secondary'
  },
  RISK: {
    id: 'risk',
    title: 'Risk & Trust Assessment',
    description: 'Risk analysis, fraud detection, and trust scoring',
    fields: ['riskData', 'fraudData', 'trustScoreData'],
    color: 'warning'
  },
  NFT: {
    id: 'nft',
    title: 'NFT-Specific Data',
    description: 'Individual NFT details and metadata',
    fields: ['nftData'],
    color: 'error'
  },
  ANALYTICS: {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'Predictive analytics and advanced metrics',
    fields: ['analyticsData', 'predictiveData', 'socialMetrics'],
    color: 'default'
  }
};

/**
 * Groups analysis data by logical sections
 * @param {Object} analysisData - The complete analysis data from backend
 * @returns {Object} Grouped data organized by sections
 */
    export const groupAnalysisData = (analysisData) => {
  if (!analysisData || typeof analysisData !== 'object') {
    return {};
  }

  const groupedData = {};

  Object.values(DATA_SECTIONS).forEach(section => {
    groupedData[section.id] = {
      ...section,
      data: {},
      hasData: false,
      completeness: 0,
      issues: []
    };

    // Extract relevant fields for this section
    section.fields.forEach(field => {
      if (analysisData.hasOwnProperty(field)) {
        groupedData[section.id].data[field] = analysisData[field];
        groupedData[section.id].hasData = true;
      } else {
        groupedData[section.id].issues.push(`Missing field: ${field}`);
      }
    });

    // Calculate completeness percentage
    const presentFields = section.fields.filter(field => 
      analysisData.hasOwnProperty(field) && 
      analysisData[field] !== null && 
      analysisData[field] !== undefined
    );
    groupedData[section.id].completeness = Math.round(
      (presentFields.length / section.fields.length) * 100
    );

    // Check for null/undefined values
    section.fields.forEach(field => {
      if (analysisData.hasOwnProperty(field)) {
        if (analysisData[field] === null) {
          groupedData[section.id].issues.push(`${field} is null`);
        } else if (analysisData[field] === undefined) {
          groupedData[section.id].issues.push(`${field} is undefined`);
        }
      }
    });
  });

  return groupedData;
};

/**
 * Gets the overall data health score across all sections
 * @param {Object} groupedData - The grouped analysis data
 * @returns {Object} Overall health metrics
 */
export const getOverallDataHealth = (groupedData) => {
  const sections = Object.values(groupedData);
  const totalSections = sections.length;
  const sectionsWithData = sections.filter(section => section.hasData).length;
  const averageCompleteness = sections.reduce((sum, section) => 
    sum + section.completeness, 0) / totalSections;
  
  const totalIssues = sections.reduce((sum, section) => 
    sum + section.issues.length, 0);

  let healthStatus = 'success';
  if (averageCompleteness < 50) healthStatus = 'error';
  else if (averageCompleteness < 80 || totalIssues > 0) healthStatus = 'warning';

  return {
    overallScore: Math.round(averageCompleteness),
    sectionsWithData,
    totalSections,
    totalIssues,
    healthStatus,
    sections
  };
};

/**
 * Validates if a section has sufficient data for rendering
 * @param {Object} sectionData - The section data object
 * @param {number} minCompleteness - Minimum completeness percentage (default: 50)
 * @returns {boolean} Whether the section should be rendered
 */
export const shouldRenderSection = (sectionData, minCompleteness = 50) => {
  return sectionData && 
         sectionData.hasData && 
         sectionData.completeness >= minCompleteness;
};

/**
 * Gets a human-readable status for a data field
 * @param {any} value - The field value
 * @returns {Object} Status information
 */
export const getFieldStatus = (value) => {
  if (value === null) return { status: 'null', color: 'error', icon: '❌' };
  if (value === undefined) return { status: 'undefined', color: 'warning', icon: '⚠️' };
  if (Array.isArray(value)) return { 
    status: `array (${value.length})`, 
    color: 'info', 
    icon: '📋' 
  };
  if (typeof value === 'object') return { 
    status: 'object', 
    color: 'success', 
    icon: '📦' 
  };
  if (typeof value === 'string') return { 
    status: `string (${value.length})`, 
    color: 'primary', 
    icon: '📝' 
  };
  if (typeof value === 'number') return { 
    status: `number (${value})`, 
    color: 'secondary', 
    icon: '🔢' 
  };
  if (typeof value === 'boolean') return { 
    status: `boolean (${value})`, 
    color: 'default', 
    icon: '✅' 
  };
  return { status: typeof value, color: 'default', icon: '❓' };
};

/**
 * Creates a debug summary for development
 * @param {Object} analysisData - The complete analysis data
 * @returns {Object} Debug information
 */
export const createDebugSummary = (analysisData) => {
  const groupedData = groupAnalysisData(analysisData);
  const health = getOverallDataHealth(groupedData);
  
  return {
    timestamp: new Date().toISOString(),
    totalFields: Object.keys(analysisData || {}).length,
    expectedFields: Object.values(DATA_SECTIONS).reduce((acc, section) => 
      acc.concat(section.fields), []),
    groupedData,
    health,
    rawDataKeys: Object.keys(analysisData || {}),
    missingFields: Object.values(DATA_SECTIONS).reduce((acc, section) => 
      acc.concat(section.fields.filter(field => !analysisData?.hasOwnProperty(field))), [])
  };
};

export default {
  DATA_SECTIONS,
  groupAnalysisData,
  getOverallDataHealth,
  shouldRenderSection,
  getFieldStatus,
  createDebugSummary
};
