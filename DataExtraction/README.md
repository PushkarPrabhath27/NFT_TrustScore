# NFT Smart Contract Analysis System with Hathor Blockchain Integration

This system analyzes NFT smart contracts from platforms like OpenSea using Hathor blockchain technology. When provided with a smart contract address, it analyzes various metrics and generates a comprehensive report in JSON format.

## System Architecture

### 1. Smart Contract Input Processing
- Accepts Ethereum-based smart contract addresses
- Verifies contract address validity
- Connects to both Ethereum and Hathor blockchains

### 2. Hathor Blockchain Integration
- Bridge/middleware solution connecting Ethereum contract data with Hathor blockchain
- Utilizes Hathor's DAG structure for processing
- Implements Hathor's token capabilities for cross-blockchain analysis

### 3. Analysis Modules
- Market Segment Analysis
- Collection Analysis
- Trust Score Analysis
- Price Intelligence
- Risk Assessment
- Fraud Detection

### 4. Individual NFT Item Analysis
- Generates unique identifiers
- Extracts metadata
- Calculates trust scores and risk levels

### 5. Data Export System
- Formats analyzed data into structured JSON
- Implements outlier identification
- Allows parameter filtering

## Implementation Details

### Project Structure
```
/
├── src/
│   ├── api/                  # REST API endpoints
│   ├── blockchain/           # Blockchain connections
│   │   ├── ethereum/         # Ethereum integration
│   │   └── hathor/           # Hathor integration
│   ├── analysis/             # Analysis modules
│   │   ├── market/           # Market segment analysis
│   │   ├── collection/       # Collection analysis
│   │   ├── trust/            # Trust score analysis
│   │   ├── price/            # Price intelligence
│   │   ├── risk/             # Risk assessment
│   │   └── fraud/            # Fraud detection
│   ├── models/               # Data models
│   ├── services/             # Core services
│   └── utils/                # Utility functions
├── config/                   # Configuration files
└── tests/                    # Test files
```

### Technologies Used
- Node.js/Express for API endpoints
- Web3.js/ethers.js for Ethereum blockchain connection
- Hathor's headless wallet API for Hathor network connection
- MongoDB for data storage and historical analysis

### API Endpoints
- `POST /api/analyze` - Analyze an NFT smart contract
- `GET /api/analysis/:contractAddress` - Get analysis results
- `GET /api/history/:contractAddress` - Get historical analysis

### Hathor Integration
- Uses Hathor's headless wallet API
- Implements custom token creation for analyzed NFT contracts
- Utilizes Hathor's nanopayments for efficient data processing
- Leverages Hathor's dual blockchain architecture
- Stores trust score and risk assessment data on Hathor tokens as metadata

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- Ethereum node access (Infura or similar)
- Hathor node access

### Installation
```bash
npm install
```

### Configuration
1. Create a `.env` file with the following variables:
```
ETHEREUM_NODE_URL=your_ethereum_node_url
HATHOR_NODE_URL=your_hathor_node_url
MONGODB_URI=your_mongodb_uri
API_PORT=3000
```

### Running the Application

#### Backend
```bash
cd DataExtraction
npm start
```

#### Frontend
```bash
cd DataExtraction/frontend
npm start
```

## Dynamic Backend Discovery

The frontend now includes **automatic backend discovery** that eliminates port conflicts and hardcoded dependencies. The system automatically:

- ✅ **Finds the backend** regardless of which port it's running on
- ✅ **Handles port conflicts** by trying multiple ports automatically
- ✅ **Provides user feedback** with connection status and error messages
- ✅ **Caches results** for better performance
- ✅ **Retries on failure** with intelligent backoff

### How It Works

1. **Port Scanning**: Checks common ports (3001, 3000, 3002, 3003, 5000, 8000, 8080, 4000, 5001, 3004, 3005)
2. **Health Checks**: Uses `/api/health` endpoint to verify backend availability
3. **Automatic Fallback**: If port 3001 is taken, automatically tries the next available port
4. **Smart Caching**: Remembers working URLs to avoid repeated discovery
5. **Error Recovery**: Provides retry options and clear error messages

### Configuration

Customize the discovery behavior with environment variables:

```bash
# Backend base URL (default: http://localhost)
REACT_APP_BACKEND_BASE_URL=http://localhost

# Ports to check (default: 3001,3000,3002,3003,5000,8000,8080,4000,5001,3004,3005)
REACT_APP_BACKEND_PORTS=[3001,3000,3002,3003,5000,8000,8080,4000,5001,3004,3005]

# Health check endpoint (default: /api/health)
REACT_APP_BACKEND_HEALTH_ENDPOINT=/api/health

# Discovery timeout in milliseconds (default: 10000)
REACT_APP_BACKEND_DISCOVERY_TIMEOUT=10000

# Port check timeout in milliseconds (default: 2000)
REACT_APP_BACKEND_PORT_TIMEOUT=2000

# Cache time in milliseconds (default: 30000)
REACT_APP_BACKEND_CACHE_TIME=30000

# Enable debug logging (default: false)
REACT_APP_DEBUG_MODE=false

# Show backend status indicator (default: true)
REACT_APP_SHOW_BACKEND_STATUS=true
```

### Troubleshooting

If the frontend can't find the backend:

1. **Check backend status**: Ensure the backend server is running
2. **Verify health endpoint**: Make sure `/api/health` is accessible
3. **Check port list**: Verify the backend port is in the discovery list
4. **Enable debug mode**: Set `REACT_APP_DEBUG_MODE=true` for detailed logs
5. **Check browser console**: Look for discovery messages and errors

For detailed information, see [DYNAMIC_BACKEND_DISCOVERY.md](./DYNAMIC_BACKEND_DISCOVERY.md).

## Testing
The system includes comprehensive tests for all components:
```bash
npm test
```

## Security Considerations
- Rate limiting to prevent abuse
- Proper handling of private keys for Hathor wallet integration
- Input data validation to prevent injection attacks
- Audit logs for all analysis requests