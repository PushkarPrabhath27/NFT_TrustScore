import React from 'react';
import { motion } from 'framer-motion';
import { FiInfo, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const NFTOverview = ({ nftData }) => {
  if (!nftData) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-neon-blue overflow-hidden relative"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="text-xl font-orbitron text-cyan-400 mb-4 flex items-center">
        <FiInfo className="mr-2" /> NFT Overview
      </h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* NFT Image */}
        <div className="w-full md:w-1/3 flex justify-center">
          <motion.div 
            className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-cyan-500 shadow-neon-blue"
            whileHover={{ scale: 1.05 }}
          >
            <img 
              src={nftData.image || '/placeholder-nft.jpg'} 
              alt={nftData.name || 'NFT'} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 text-center">
              <p className="text-cyan-400 font-orbitron text-sm truncate">{nftData.name}</p>
            </div>
          </motion.div>
        </div>
        
        {/* NFT Details */}
        <div className="w-full md:w-2/3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <DetailItem label="Token ID" value={nftData.tokenId} />
              <DetailItem label="Collection" value={nftData.collection} />
              <DetailItem label="Blockchain" value={nftData.blockchain} />
            </div>
            <div className="space-y-2">
              <DetailItem label="Creator" value={nftData.creator} />
              <DetailItem 
                label="Verified" 
                value={nftData.isVerified ? 'Yes' : 'No'}
                icon={nftData.isVerified ? 
                  <FiCheckCircle className="text-green-400" /> : 
                  <FiXCircle className="text-red-400" />}
              />
              <DetailItem label="Standard" value={nftData.standard || 'ERC-721'} />
            </div>
          </div>
          
          {nftData.description && (
            <div className="mt-4">
              <h3 className="text-sm text-gray-400 mb-1">Description</h3>
              <p className="text-gray-300 text-sm line-clamp-3">{nftData.description}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const DetailItem = ({ label, value, icon }) => (
  <div className="flex items-center">
    <span className="text-gray-400 text-sm w-24">{label}:</span>
    <span className="text-white text-sm font-medium flex items-center">
      {icon && <span className="mr-1">{icon}</span>}
      {value || 'N/A'}
    </span>
  </div>
);

export default NFTOverview;