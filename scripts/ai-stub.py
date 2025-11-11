#!/usr/bin/env python3
"""
Minimal AI service stub for local testing.
Returns deterministic responses for recommendation endpoints.
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sys

class AIStubHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        sys.stderr.write(f"[AI-STUB] {format % args}\n")
    
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "service": "ai-stub"}).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        if '/recommend' in self.path:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8') if content_length else '{}'
            
            # Return deterministic recommendations
            response = {
                "recommendations": [
                    {"poi_id": "stub-1", "name": "Gateway of India", "score": 0.95, "reason": "Iconic heritage landmark"},
                    {"poi_id": "stub-2", "name": "Marine Drive", "score": 0.90, "reason": "Scenic coastal promenade"},
                    {"poi_id": "stub-3", "name": "Hanging Gardens", "score": 0.85, "reason": "Relaxing green space"}
                ]
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    port = 8001
    server = HTTPServer(('127.0.0.1', port), AIStubHandler)
    print(f"AI Stub Service running on http://127.0.0.1:{port}")
    print(f"Health check: http://127.0.0.1:{port}/health")
    server.serve_forever()
