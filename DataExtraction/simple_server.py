from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from datetime import datetime
import sys

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        self._set_headers(200)
    
    def do_GET(self):
        if self.path == '/api/health':
            self._set_headers(200)
            response = {
                'status': 'ok',
                'timestamp': datetime.utcnow().isoformat()
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not Found'}).encode('utf-8'))
    
    def do_POST(self):
        if self.path == '/api/analyze':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data)
                contract_address = data.get('contractAddress', '')
                
                print(f"[INFO] Received request to analyze: {contract_address}")
                
                response = {
                    'success': True,
                    'data': {
                        'contractAddress': contract_address,
                        'name': 'Test NFT Collection',
                        'symbol': 'TEST',
                        'totalSupply': '10000',
                        'analysis': {
                            'security': 85,
                            'activity': 72,
                            'community': 65,
                            'liquidity': 90
                        },
                        'priceData': {
                            'currentPrice': 0.5,
                            'priceChange24h': 2.5,
                            'volume24h': 2500
                        },
                        'lastUpdated': datetime.utcnow().isoformat()
                    }
                }
                
                self._set_headers(200)
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except json.JSONDecodeError:
                self._set_headers(400)
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': 'Invalid JSON'
                }).encode('utf-8'))
                
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': 'Internal Server Error',
                    'message': str(e)
                }).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'error': 'Not Found'}).encode('utf-8'))

def run(server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler, port=3001):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    print('Endpoints:')
    print(f'  GET  http://localhost:{port}/api/health')
    print(f'  POST http://localhost:{port}/api/analyze')
    print('\nPress Ctrl+C to stop the server...')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nShutting down server...')
        httpd.server_close()
        sys.exit(0)

if __name__ == '__main__':
    run()
