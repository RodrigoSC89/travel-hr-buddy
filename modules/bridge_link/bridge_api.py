"""
BridgeLink - API Module
Flask-based REST API with JWT authentication for local bridge operations

Features:
- Token-based authentication endpoints
- Rate limiting (200 requests/day, 50/hour)
- Report and event upload endpoints
- Status checking and monitoring
- JWT token generation and validation
"""

import os
import jwt
import logging
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Any, Callable
from flask import Flask, request, jsonify, Response
from werkzeug.security import check_password_hash, generate_password_hash

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('BRIDGE_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_EXPIRATION_HOURS'] = 24

# Rate limiting storage (in production, use Redis)
rate_limits: Dict[str, Dict[str, Any]] = {}


def rate_limit(max_per_hour: int = 50, max_per_day: int = 200) -> Callable:
    """
    Rate limiting decorator.
    
    Args:
        max_per_hour: Maximum requests per hour
        max_per_day: Maximum requests per day
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get client identifier (IP or token)
            client_id = request.remote_addr
            if 'Authorization' in request.headers:
                client_id = request.headers['Authorization']
            
            now = datetime.now()
            
            # Initialize rate limit tracking
            if client_id not in rate_limits:
                rate_limits[client_id] = {
                    'hour_count': 0,
                    'hour_reset': now + timedelta(hours=1),
                    'day_count': 0,
                    'day_reset': now + timedelta(days=1)
                }
            
            client_limits = rate_limits[client_id]
            
            # Reset counters if needed
            if now > client_limits['hour_reset']:
                client_limits['hour_count'] = 0
                client_limits['hour_reset'] = now + timedelta(hours=1)
            
            if now > client_limits['day_reset']:
                client_limits['day_count'] = 0
                client_limits['day_reset'] = now + timedelta(days=1)
            
            # Check limits
            if client_limits['hour_count'] >= max_per_hour:
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'limit': 'hourly',
                    'retry_after': (client_limits['hour_reset'] - now).seconds
                }), 429
            
            if client_limits['day_count'] >= max_per_day:
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'limit': 'daily',
                    'retry_after': (client_limits['day_reset'] - now).seconds
                }), 429
            
            # Increment counters
            client_limits['hour_count'] += 1
            client_limits['day_count'] += 1
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def token_required(f: Callable) -> Callable:
    """JWT authentication decorator."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            # Decode JWT token
            data = jwt.decode(
                token,
                app.config['SECRET_KEY'],
                algorithms=['HS256']
            )
            request.current_user = data.get('user_id')
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    
    return decorated


@app.route('/auth/login', methods=['POST'])
def login() -> Response:
    """
    Authenticate and generate JWT token.
    
    Request body:
        {
            "username": "user",
            "password": "pass"
        }
    
    Returns:
        JWT token with 24h expiration
    """
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing credentials'}), 400
    
    # In production, validate against database
    # This is a simple example
    username = data.get('username')
    password = data.get('password')
    
    # TODO: Replace with actual user validation
    if username == 'bridge_user' and password == 'bridge_pass':
        # Generate JWT token
        token = jwt.encode(
            {
                'user_id': username,
                'exp': datetime.utcnow() + timedelta(hours=app.config['JWT_EXPIRATION_HOURS'])
            },
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
        logger.info(f"✅ Login successful for user: {username}")
        
        return jsonify({
            'token': token,
            'expires_in': app.config['JWT_EXPIRATION_HOURS'] * 3600,
            'user': username
        }), 200
    
    logger.warning(f"⚠️ Failed login attempt for user: {username}")
    return jsonify({'error': 'Invalid credentials'}), 401


@app.route('/upload/report', methods=['POST'])
@token_required
@rate_limit(max_per_hour=50, max_per_day=200)
def upload_report() -> Response:
    """
    Upload PEO-DP report.
    
    Requires:
        - JWT token in Authorization header
        - File in multipart/form-data
        - Optional metadata in form data
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files allowed'}), 400
    
    # Get metadata
    metadata = {}
    if 'metadata' in request.form:
        import json
        try:
            metadata = json.loads(request.form['metadata'])
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid metadata JSON'}), 400
    
    # TODO: Save file and process
    # For now, just log the upload
    logger.info(f"✅ Report uploaded: {file.filename}")
    logger.info(f"   User: {request.current_user}")
    if metadata:
        logger.info(f"   Metadata: {metadata}")
    
    return jsonify({
        'success': True,
        'filename': file.filename,
        'timestamp': datetime.now().isoformat(),
        'metadata': metadata
    }), 200


@app.route('/upload/event', methods=['POST'])
@token_required
@rate_limit(max_per_hour=50, max_per_day=200)
def upload_event() -> Response:
    """
    Upload critical event.
    
    Request body:
        {
            "tipo": "loss_dp",
            "descricao": "Event description",
            "severidade": "CRITICAL",
            "embarcacao": "FPSO-123",
            "dados_adicionais": {...}
        }
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate required fields
    required_fields = ['tipo', 'descricao', 'severidade']
    missing_fields = [f for f in required_fields if f not in data]
    
    if missing_fields:
        return jsonify({
            'error': 'Missing required fields',
            'missing': missing_fields
        }), 400
    
    # Add timestamp
    data['timestamp'] = datetime.now().isoformat()
    data['user'] = request.current_user
    
    # TODO: Process and store event
    logger.info(f"✅ Event received: {data['tipo']}")
    logger.info(f"   Severity: {data['severidade']}")
    logger.info(f"   User: {request.current_user}")
    
    return jsonify({
        'success': True,
        'event_id': f"evt_{datetime.now().timestamp()}",
        'timestamp': data['timestamp']
    }), 201


@app.route('/status', methods=['GET'])
@token_required
def get_status() -> Response:
    """
    Get API status and statistics.
    """
    return jsonify({
        'status': 'operational',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'user': request.current_user
    }), 200


@app.route('/health', methods=['GET'])
def health_check() -> Response:
    """
    Health check endpoint (no authentication required).
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    }), 200


@app.errorhandler(404)
def not_found(error) -> Response:
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error) -> Response:
    """Handle 500 errors."""
    logger.error(f"Internal error: {error}")
    return jsonify({'error': 'Internal server error'}), 500


def create_app(config: Dict[str, Any] = None) -> Flask:
    """
    Application factory.
    
    Args:
        config: Optional configuration dictionary
    
    Returns:
        Flask application instance
    """
    if config:
        app.config.update(config)
    
    return app


# Example usage
if __name__ == '__main__':
    # Development server
    logger.info("Starting BridgeLink API server...")
    logger.warning("⚠️ This is a development server. Use a production WSGI server in production.")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
