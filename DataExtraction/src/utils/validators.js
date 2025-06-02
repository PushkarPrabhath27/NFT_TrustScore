/**
 * Utility functions for validation
 */

/**
 * Validates an Ethereum contract address.
 * @param {string} contractAddress - The contract address to validate.
 * @returns {boolean} - True if the address is valid, false otherwise.
 */
export const validateContractAddress = (contractAddress) => {
  // Check if address is defined and is a string
  if (!contractAddress || typeof contractAddress !== 'string') {
    return false;
  }

  // Check if address matches Ethereum address format (0x followed by 40 hex characters)
  const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  if (!ethereumAddressRegex.test(contractAddress)) {
    return false;
  }

  // Validate checksum if address contains both uppercase and lowercase letters
  if (/[a-f]/.test(contractAddress) && /[A-F]/.test(contractAddress)) {
    return validateChecksumAddress(contractAddress);
  }

  return true;
};

/**
 * Determines if an address is a contract (as opposed to a regular wallet address).
 * Note: This is an async function that requires blockchain access.
 * For simple format validation, use validateContractAddress instead.
 * 
 * @param {string} address - The address to check.
 * @param {ethers.providers.Provider} provider - Ethereum provider.
 * @returns {Promise<boolean>} - True if the address is a contract, false otherwise.
 */
export const isContract = async (address, provider) => {
  try {
    if (!validateContractAddress(address)) {
      return false;
    }
    
    const code = await provider.getCode(address);
    return code !== '0x';
  } catch (error) {
    console.error(`Error checking if address is a contract: ${error.message}`);
    return false;
  }
};

/**
 * Validates the checksum of an Ethereum address according to EIP-55.
 * @param {string} address - The address to validate.
 * @returns {boolean} - True if the checksum is valid, false otherwise.
 */
function validateChecksumAddress(address) {
  try {
    // Remove '0x' prefix for processing
    const addr = address.slice(2);
    const addrLower = addr.toLowerCase();
    
    // Create a hash of the lowercase address
    const hash = createKeccakHash(addrLower);
    
    // Check each character against the hash to validate the checksum
    for (let i = 0; i < 40; i++) {
      // If the ith bit of the hash is 1, the ith letter should be uppercase
      const hashBit = parseInt(hash[i], 16) >= 8;
      const charIsUpper = addr[i] !== addrLower[i];
      
      if (hashBit && !charIsUpper || !hashBit && charIsUpper) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error validating checksum address:', error);
    return false;
  }
}

/**
 * Creates a Keccak hash of the input string.
 * This is a simplified implementation for demonstration.
 * In a real application, use a proper Keccak/SHA3 library.
 * @param {string} input - The input string to hash.
 * @returns {string} - The hash as a hex string.
 */
function createKeccakHash(input) {
  // In a real implementation, use a proper Keccak library like keccak256
  // For demonstration, we're returning a mock hash
  // This should be replaced with actual Keccak hashing in production
  
  // Mock implementation - in production use:
  // const keccak256 = require('keccak256');
  // return keccak256(input).toString('hex');
  
  let hash = '';
  for (let i = 0; i < 40; i++) {
    // Generate a deterministic hash-like value based on the input
    const charCode = input.charCodeAt(i % input.length);
    hash += (charCode % 16).toString(16);
  }
  return hash;
}