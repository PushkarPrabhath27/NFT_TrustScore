import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import NftDetails from './NftDetails';
import TrustScore from './TrustScore';
import PriceData from './PriceData';
import RiskData from './RiskData';
import FraudData from './FraudData';
import CollectionData from './CollectionData';
import PortfolioData from './PortfolioData';

const tabLabels = [
  'NFT Details',
  'Trust Score',
  'Price Data',
  'Risk Data',
  'Fraud Data',
  'Collection Data',
  'Portfolio Data',
];

const AnalysisTabs = ({ data }) => {
  const [tab, setTab] = useState(0);
  
  console.log('[AnalysisTabs] Component rendered with data:', {
    hasData: !!data,
    dataType: typeof data,
    dataKeys: data ? Object.keys(data) : [],
    nftData: data?.nftData ? 'Present' : 'Missing',
    trustScoreData: data?.trustScoreData ? 'Present' : 'Missing',
    priceData: data?.priceData ? 'Present' : 'Missing',
    riskData: data?.riskData ? 'Present' : 'Missing',
    fraudData: data?.fraudData ? 'Present' : 'Missing',
    collectionData: data?.collectionData ? 'Present' : 'Missing',
    portfolioData: data?.portfolioData ? 'Present' : 'Missing'
  });
  
  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        {tabLabels.map((label, idx) => (
          <Tab label={label} key={label} />
        ))}
      </Tabs>
      {tab === 0 && <NftDetails nftData={data.nftData} />}
      {tab === 1 && <TrustScore trustScoreData={data.trustScoreData} />}
      {tab === 2 && <PriceData priceData={data.priceData} />}
      {tab === 3 && <RiskData riskData={data.riskData} />}
      {tab === 4 && <FraudData fraudData={data.fraudData} />}
      {tab === 5 && <CollectionData collectionData={data.collectionData} />}
      {tab === 6 && <PortfolioData portfolioData={data.portfolioData} />}
    </Box>
  );
};

export default AnalysisTabs; 