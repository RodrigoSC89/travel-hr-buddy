"""
BridgeLink API - Flask REST API with JWT Authentication
========================================================

Provides a local REST API for BridgeLink with JWT authentication and rate limiting.

Features:
- Token-based authentication endpoints
- Rate limiting (200 requests/day, 50/hour)
- Report and event upload endpoints
- Status checking and monitoring

Author: PEO-DP Inteligente System
Version: 1.0.0
License: MIT
"""

from flask import Flask, request, jsonify
from functools import wraps
import jwt
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import os
import json


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, daily_limit: int = 200, hourly_limit: int = 50):
        self.daily_limit = daily_limit
        self.hourly_limit = hourly_limit
        self.requests = {}  # {ip: [(timestamp, count), ...]}
    
    def is_allowed(self, ip: str) -> tuple[bool, Optional[str]]:
        """
        Check if request is allowed based on rate limits.
        
        Returns:
            (allowed: bool, error_message: Optional[str])
        """
        now = datetime.now()
        
        if ip not in self.requests:
            self.requests[ip] = []
        
        # Clean old entries (older than 24 hours)
        self.requests[ip] = [
            (ts, count) for ts, count in self.requests[ip]
            if (now - ts).total_seconds() < 86400
        ]
        
        # Count requests
        daily_count = sum(count for ts, count in self.requests[ip])
        hourly_count = sum(
            count for ts, count in self.requests[ip]
            if (now - ts).total_seconds() < 3600
        )
        
        # Check limits
        if daily_count >= self.daily_limit:
            return False, f"Daily limit exceeded ({self.daily_limit} requests/day)"
        
        if hourly_count >= self.hourly_limit:
            return False, f"Hourly limit exceeded ({self.hourly_limit} requests/hour)"
        
        # Add new request
        self.requests[ip].append((now, 1))
        
        return True, None


class BridgeAPI:
    """
    Flask-based REST API for BridgeLink.
    
    Provides endpoints for authentication, report upload, event transmission,
    and status monitoring.
    """
    
    def __init__(self, secret_key: str, bridge_core=None):
        """
        Initialize BridgeAPI.
        
        Args:
            secret_key: JWT secret key
            bridge_core: BridgeCore instance for backend communication
        """
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = secret_key
        self.bridge_core = bridge_core
        self.rate_limiter = RateLimiter()
        
        # Configure logging
        self.logger = logging.getLogger('BridgeAPI')
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
        
        # Register routes
        self._register_routes()
    
    def _require_auth(self, f):
        """Decorator for requiring JWT authentication"""
        @wraps(f)
        def decorated(*args, **kwargs):
            token = request.headers.get('Authorization')
            
            if not token:
                return jsonify({'error': 'Token is missing'}), 401
            
            try:
                # Remove 'Bearer ' prefix if present
                if token.startswith('Bearer '):
                    token = token[7:]
                
                # Verify token
                data = jwt.decode(
                    token,
                    self.app.config['SECRET_KEY'],
                    algorithms=['HS256']
                )
                
                # Check expiration
                if datetime.fromtimestamp(data['exp']) < datetime.now():
                    return jsonify({'error': 'Token has expired'}), 401
                
            except jwt.InvalidTokenError:
                return jsonify({'error': 'Token is invalid'}), 401
            
            return f(*args, **kwargs)
        
        return decorated
    
    def _check_rate_limit(self):
        """Check rate limit for current request"""
        ip = request.remote_addr
        allowed, error = self.rate_limiter.is_allowed(ip)
        
        if not allowed:
            return jsonify({'error': error}), 429
        
        return None
    
    def _register_routes(self):
        """Register all API routes"""
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            """Health check endpoint"""
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'version': '1.0.0'
            }), 200
        
        @self.app.route('/auth/login', methods=['POST'])
        def login():
            """
            Authenticate and generate JWT token.
            
            Request body:
            {
                "username": "user",
                "password": "pass"
            }
            """
            rate_limit_response = self._check_rate_limit()
            if rate_limit_response:
                return rate_limit_response
            
            data = request.get_json()
            username = data.get('username')
            password = data.get('password')
            
            # In production, validate against database
            # This is a simplified example
            if username and password:
                # Generate token valid for 24 hours
                token = jwt.encode(
                    {
                        'user': username,
                        'exp': datetime.now() + timedelta(hours=24)
                    },
                    self.app.config['SECRET_KEY'],
                    algorithm='HS256'
                )
                
                self.logger.info(f"Token generated for user: {username}")
                
                return jsonify({
                    'token': token,
                    'expires_in': 86400,
                    'token_type': 'Bearer'
                }), 200
            
            return jsonify({'error': 'Invalid credentials'}), 401
        
        @self.app.route('/reports', methods=['POST'])
        @self._require_auth
        def upload_report():
            """
            Upload PDF report to SGSO.
            
            Requires:
            - Authorization header with JWT token
            - Multipart form data with 'report' file
            - 'metadata' field with JSON metadata
            """
            rate_limit_response = self._check_rate_limit()
            if rate_limit_response:
                return rate_limit_response
            
            if 'report' not in request.files:
                return jsonify({'error': 'No report file provided'}), 400
            
            file = request.files['report']
            metadata_str = request.form.get('metadata', '{}')
            
            try:
                metadata = json.loads(metadata_str)
            except json.JSONDecodeError:
                return jsonify({'error': 'Invalid metadata JSON'}), 400
            
            # Save file temporarily
            temp_path = f"/tmp/report_{datetime.now().timestamp()}.pdf"
            file.save(temp_path)
            
            # Send via BridgeCore if available
            if self.bridge_core:
                result = self.bridge_core.enviar_relatorio(temp_path, metadata)
                
                # Clean up temp file
                try:
                    os.remove(temp_path)
                except:
                    pass
                
                if result['success']:
                    return jsonify(result), 200
                else:
                    return jsonify(result), 500
            
            # Mock response if no bridge_core
            self.logger.info(f"Report received: {file.filename}")
            return jsonify({
                'success': True,
                'message_id': f"MSG-{datetime.now().timestamp()}",
                'timestamp': datetime.now().isoformat()
            }), 200
        
        @self.app.route('/events', methods=['POST'])
        @self._require_auth
        def send_event():
            """
            Send event to SGSO.
            
            Request body:
            {
                "event_type": "loss_dp",
                "data": {...},
                "priority": "HIGH"
            }
            """
            rate_limit_response = self._check_rate_limit()
            if rate_limit_response:
                return rate_limit_response
            
            data = request.get_json()
            
            if not data or 'event_type' not in data:
                return jsonify({'error': 'Missing event_type'}), 400
            
            event_type = data.get('event_type')
            event_data = data.get('data', {})
            priority = data.get('priority', 'MEDIUM')
            
            # Send via BridgeCore if available
            if self.bridge_core:
                result = self.bridge_core.enviar_evento(event_type, event_data, priority)
                
                if result['success']:
                    return jsonify(result), 200
                else:
                    return jsonify(result), 500
            
            # Mock response if no bridge_core
            self.logger.info(f"Event received: {event_type} (Priority: {priority})")
            return jsonify({
                'success': True,
                'message_id': f"MSG-{datetime.now().timestamp()}",
                'timestamp': datetime.now().isoformat()
            }), 200
        
        @self.app.route('/status', methods=['GET'])
        @self._require_auth
        def get_status():
            """Get system status"""
            rate_limit_response = self._check_rate_limit()
            if rate_limit_response:
                return rate_limit_response
            
            if self.bridge_core:
                result = self.bridge_core.obter_status()
                return jsonify(result), 200 if result['success'] else 500
            
            return jsonify({
                'status': 'operational',
                'timestamp': datetime.now().isoformat()
            }), 200
    
    def run(self, host: str = '0.0.0.0', port: int = 5000, debug: bool = False):
        """Start the API server"""
        self.logger.info(f"Starting BridgeAPI on {host}:{port}")
        self.app.run(host=host, port=port, debug=debug)


# Example usage
if __name__ == "__main__":
    # Initialize API
    SECRET_KEY = os.environ.get('BRIDGE_SECRET_KEY', 'dev_secret_key_change_in_production')
    api = BridgeAPI(secret_key=SECRET_KEY)
    
    # Start server
    api.run(debug=True)
