const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const apiProxy = createProxyMiddleware({
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
    secure: false,
    xfwd: true,
    // Increase proxy limits to handle large headers
    proxyTimeout: 60000,
    // Increase header size limits
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[Proxy] Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
      // Remove unnecessary headers to reduce size
      proxyReq.removeHeader('x-powered-by');
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[Proxy] Received response from API: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      console.error('[Proxy] Error:', err);
      res.writeHead(500, {
        'Content-Type': 'application/json'
      });
      res.end(JSON.stringify({
        success: false,
        error: 'Proxy error',
        message: err.message
      }));
    },
    logLevel: 'debug',
    // Add proxy options to increase header size limits
    headers: {
      'Connection': 'keep-alive'
    }
  });

  app.use('/api', apiProxy);
};