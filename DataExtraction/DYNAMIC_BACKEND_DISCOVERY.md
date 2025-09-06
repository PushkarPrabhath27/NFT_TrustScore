# Dynamic Backend Discovery System

This document explains how the frontend automatically detects and connects to the backend server, even when it runs on different ports due to conflicts or dynamic allocation.

## Overview

The NFT Smart Contract Analysis System now includes a robust dynamic backend discovery mechanism that eliminates hardcoded port dependencies. The frontend can automatically find and connect to the backend server regardless of which port it's running on.

## How It Works

### 1. Port Discovery Process

When the frontend starts or needs to make an API call, it:

1. **Checks cached URL first** - If a working backend URL was recently discovered, it uses that
2. **Scans multiple ports** - If no cache or cache is invalid, it checks a predefined list of ports
3. **Tests each port** - Sends a health check request to each port with a timeout
4. **Uses first successful response** - The first port that responds successfully becomes the active backend URL
5. **Caches the result** - Stores the working URL for future use (30 seconds by default)

### 2. Port Priority List

The system checks ports in this order of preference:

```
3001 → 3000 → 3002 → 3003 → 5000 → 8000 → 8080 → 4000 → 5001 → 3004 → 3005
```

- **3001**: Default port for this project
- **3000**: Common React development server port
- **3002-3005**: Sequential fallbacks if 3001 is taken
- **5000**: Common Express.js port
- **8000**: Common alternative port
- **8080**: Common web server port
- **4000**: Common GraphQL server port

### 3. Health Check Endpoints

The backend must expose one of these endpoints for discovery to work:

- `/api/health` - Returns `{ status: 'ok', timestamp: '...', service: '...' }`
- `/api/ping` - Returns `{ status: 'pong', timestamp: '...' }`

## Configuration

### Environment Variables

You can customize the discovery behavior using these environment variables:

```bash
# Backend base URL (without port)
REACT_APP_BACKEND_BASE_URL=http://localhost

# Comma-separated list of ports to check
REACT_APP_BACKEND_PORTS=[3001,3000,3002,3003,5000,8000,8080,4000,5001,3004,3005]

# Health check endpoint path
REACT_APP_BACKEND_HEALTH_ENDPOINT=/api/health

# Discovery timeout (milliseconds)
REACT_APP_BACKEND_DISCOVERY_TIMEOUT=10000

# Port check timeout (milliseconds)
REACT_APP_BACKEND_PORT_TIMEOUT=2000

# Cache time for discovered URL (milliseconds)
REACT_APP_BACKEND_CACHE_TIME=30000

# Enable debug logging
REACT_APP_DEBUG_MODE=false

# Show backend status indicator
REACT_APP_SHOW_BACKEND_STATUS=true
```

### Configuration Files

- `frontend/src/config/backendConfig.js` - Main configuration
- `frontend/src/config/environment.example.js` - Environment configuration template

## Usage

### Basic Usage

The system works automatically. No code changes are needed in your components:

```javascript
import apiService from './services/ApiService.js';

// This will automatically discover the backend and make the request
const result = await apiService.analyzeContract('0x...');
```

### Advanced Usage

For more control, you can use the dynamic API service directly:

```javascript
import dynamicApiService from './services/DynamicApiService.js';

// Get current backend URL
const backendURL = dynamicApiService.getCurrentBackendURL();

// Clear cache and force re-discovery
dynamicApiService.clearAllCaches();

// Get detailed service status
const status = dynamicApiService.getServiceStatus();
```

### Error Handling

The system includes comprehensive error handling:

```javascript
import BackendErrorBoundary from './components/BackendErrorBoundary.js';

// Wrap your app with the error boundary
<BackendErrorBoundary>
  <YourApp />
</BackendErrorBoundary>
```

### Status Monitoring

Add a status indicator to your UI:

```javascript
import BackendStatusIndicator from './components/BackendStatusIndicator.js';

// Show basic status
<BackendStatusIndicator />

// Show detailed status with error information
<BackendStatusIndicator showDetails={true} />
```

## Troubleshooting

### Backend Not Found

If the frontend can't find the backend:

1. **Check if backend is running**: Ensure the backend server is started
2. **Verify health endpoint**: Make sure `/api/health` or `/api/ping` is accessible
3. **Check port list**: Verify the backend port is in the discovery list
4. **Check network**: Ensure no firewall is blocking the connection
5. **Check logs**: Look for discovery messages in the browser console

### Common Issues

#### Port Already in Use
```
Error: Port 3001 is already in use
```
**Solution**: The backend will automatically try the next port in the list. No action needed.

#### Connection Refused
```
Error: Backend not found on any of the checked ports
```
**Solution**: 
1. Start the backend server
2. Check if it's running on a port in the discovery list
3. Verify the health endpoint is working

#### Timeout Errors
```
Error: Connection timeout
```
**Solution**:
1. Increase `REACT_APP_BACKEND_PORT_TIMEOUT`
2. Check if the backend is responding slowly
3. Verify network connectivity

### Debug Mode

Enable debug logging to see detailed discovery information:

```bash
REACT_APP_DEBUG_MODE=true npm start
```

This will show:
- Which ports are being checked
- Response times for each port
- Cache hits/misses
- Error details

## Development Workflow

### Adding New Ports

To add a new port to the discovery list:

1. **Via environment variable**:
   ```bash
   REACT_APP_BACKEND_PORTS=[3001,3000,3002,3003,5000,8000,8080,4000,5001,3004,3005,9000]
   ```

2. **Via configuration file**:
   Edit `frontend/src/config/backendConfig.js` and add the port to the `PORTS` array.

### Custom Backend URLs

For non-localhost backends:

```bash
REACT_APP_BACKEND_BASE_URL=http://192.168.1.100
REACT_APP_BACKEND_PORTS=[3001,3002,3003]
```

### Production Deployment

In production, you typically don't need dynamic discovery because:

1. **Same domain**: Frontend and backend are served from the same domain
2. **Known URL**: The backend URL is known and stable
3. **Load balancer**: A load balancer handles routing

To disable discovery in production:

```javascript
// Set a fixed backend URL
REACT_APP_API_URL=https://api.yourdomain.com
```

## Architecture

### Components

- **BackendDiscoveryService**: Core discovery logic
- **DynamicApiService**: API service with dynamic URL support
- **BackendStatusIndicator**: UI component for status display
- **BackendErrorBoundary**: Error handling component

### Flow Diagram

```
Frontend Start
     ↓
Check Cache
     ↓
Cache Valid? → Yes → Use Cached URL
     ↓ No
Start Discovery
     ↓
Check Port 3001
     ↓
Success? → Yes → Cache & Use URL
     ↓ No
Check Port 3000
     ↓
Success? → Yes → Cache & Use URL
     ↓ No
... (continue for all ports)
     ↓
All Failed → Show Error
```

## Performance Considerations

- **Caching**: Discovered URLs are cached for 30 seconds to avoid repeated discovery
- **Parallel Checks**: All ports are checked simultaneously for faster discovery
- **Timeouts**: Each port check has a 2-second timeout to prevent hanging
- **Retry Logic**: Failed requests are retried with exponential backoff

## Security Considerations

- **Health Endpoints**: Only health check endpoints are used for discovery
- **No Authentication**: Discovery doesn't require authentication
- **Local Network**: By default, only localhost is checked
- **CORS**: Backend must allow CORS for health check requests

## Testing

### Manual Testing

1. **Start backend on default port (3001)**:
   ```bash
   npm start
   # Backend should be found immediately
   ```

2. **Start backend on different port**:
   ```bash
   node src/index.js --port=3002
   # Frontend should discover and connect to port 3002
   ```

3. **Stop backend**:
   ```bash
   # Frontend should show error and retry options
   ```

### Automated Testing

The system includes comprehensive error scenarios:
- Backend not running
- Backend on unexpected port
- Network timeouts
- Health endpoint unavailable
- Multiple port conflicts

## Migration Guide

### From Hardcoded Ports

If you're migrating from hardcoded ports:

1. **Remove hardcoded URLs**:
   ```javascript
   // Old
   const API_URL = 'http://localhost:3001';
   
   // New (automatic)
   // No hardcoded URLs needed
   ```

2. **Update API calls**:
   ```javascript
   // Old
   fetch(`${API_URL}/api/analyze`, ...)
   
   // New
   apiService.analyzeContract(contractAddress)
   ```

3. **Add error handling**:
   ```javascript
   // Wrap your app
   <BackendErrorBoundary>
     <YourApp />
   </BackendErrorBoundary>
   ```

## Support

For issues or questions:

1. Check the browser console for discovery logs
2. Enable debug mode for detailed information
3. Verify backend health endpoints are working
4. Check the troubleshooting section above

## Changelog

- **v1.0.0**: Initial implementation of dynamic backend discovery
- Added support for multiple port fallbacks
- Implemented caching and retry logic
- Added comprehensive error handling and user feedback
- Created configuration system for easy customization
