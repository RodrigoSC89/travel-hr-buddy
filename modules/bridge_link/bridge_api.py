"""
BridgeLink API Module
=====================
Endpoints REST e sistema de autenticação para o BridgeLink.
Fornece uma API local para que o sistema PEO-DP possa enviar dados ao SGSO.

Funcionalidades:
- API REST local para receber requisições do PEO-DP
- Sistema de autenticação JWT
- Rate limiting e validação de dados
- Queue de envio para garantir entrega
"""

from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps
import jwt
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import logging
from bridge_core import BridgeCore

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Inicializar Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('BRIDGE_SECRET_KEY', 'dev-secret-key-change-in-production')

# Configurar rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Inicializar BridgeCore
bridge_core = None


def init_bridge_core():
    """Inicializa o BridgeCore com configurações do ambiente."""
    global bridge_core
    endpoint = os.getenv('BRIDGE_ENDPOINT', 'https://sgso.petrobras.com.br/api')
    token = os.getenv('BRIDGE_TOKEN', '')
    
    if not token:
        logger.warning("⚠️ BRIDGE_TOKEN não configurado. Use variável de ambiente.")
    
    bridge_core = BridgeCore(endpoint=endpoint, token=token)
    logger.info("✅ BridgeCore inicializado")


def token_required(f):
    """
    Decorator para proteger endpoints com autenticação JWT.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # JWT é passado no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Format: "Bearer <token>"
            except IndexError:
                return jsonify({'message': 'Token mal formatado!'}), 401
        
        if not token:
            return jsonify({'message': 'Token não encontrado!'}), 401
        
        try:
            # Decodificar token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            request.current_user = data['user']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido!'}), 401
        
        return f(*args, **kwargs)
    
    return decorated


@app.route('/health', methods=['GET'])
def health_check():
    """
    Endpoint de health check para verificar status da API.
    
    Returns:
        JSON com status do serviço
    """
    return jsonify({
        'status': 'online',
        'service': 'BridgeLink API',
        'timestamp': datetime.now().isoformat(),
        'bridge_core': 'connected' if bridge_core and bridge_core.verificar_conexao() else 'disconnected'
    }), 200


@app.route('/auth/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """
    Endpoint de autenticação. Gera token JWT para acesso aos endpoints protegidos.
    
    Body:
        {
            "username": "string",
            "password": "string"
        }
    
    Returns:
        JSON com token JWT
    """
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Credenciais incompletas!'}), 400
    
    # Em produção, validar contra banco de dados
    # Aqui é apenas exemplo
    username = data.get('username')
    password = data.get('password')
    
    # Validação simplificada (SUBSTITUIR EM PRODUÇÃO)
    if username == os.getenv('BRIDGE_API_USER', 'admin') and \
       password == os.getenv('BRIDGE_API_PASSWORD', 'change-me'):
        
        # Gerar token JWT
        token = jwt.encode({
            'user': username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        logger.info(f"✅ Login bem-sucedido para usuário: {username}")
        
        return jsonify({
            'token': token,
            'expires_in': 24 * 3600  # 24 horas em segundos
        }), 200
    
    logger.warning(f"⚠️ Tentativa de login falhou para usuário: {username}")
    return jsonify({'message': 'Credenciais inválidas!'}), 401


@app.route('/api/relatorio', methods=['POST'])
@token_required
@limiter.limit("10 per minute")
def enviar_relatorio():
    """
    Endpoint para enviar relatório PEO-DP ao SGSO.
    
    Form Data:
        file: arquivo PDF do relatório
        metadata: JSON string com metadados (opcional)
    
    Returns:
        JSON com status do envio
    """
    try:
        # Verificar se arquivo foi enviado
        if 'file' not in request.files:
            return jsonify({'message': 'Arquivo não encontrado!'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'message': 'Nome do arquivo vazio!'}), 400
        
        # Validar tipo de arquivo
        if not file.filename.endswith('.pdf'):
            return jsonify({'message': 'Apenas arquivos PDF são aceitos!'}), 400
        
        # Salvar arquivo temporariamente
        temp_path = f"/tmp/{file.filename}"
        file.save(temp_path)
        
        # Obter metadados se fornecidos
        metadata = request.form.get('metadata')
        metadata_dict = None
        if metadata:
            import json
            metadata_dict = json.loads(metadata)
        
        # Enviar via BridgeCore
        if not bridge_core:
            init_bridge_core()
        
        resultado = bridge_core.enviar_relatorio(temp_path, metadata_dict)
        
        # Limpar arquivo temporário
        os.remove(temp_path)
        
        status_code = 200 if resultado['status'] == 'success' else 500
        return jsonify(resultado), status_code
        
    except Exception as e:
        logger.error(f"❌ Erro ao processar relatório: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/api/evento', methods=['POST'])
@token_required
@limiter.limit("20 per minute")
def enviar_evento():
    """
    Endpoint para enviar evento crítico ao SGSO.
    
    Body:
        {
            "tipo": "loss_dp | falha | alerta_asog | nao_conformidade",
            "embarcacao": "string",
            "severidade": "baixa | media | alta | critica",
            "descricao": "string",
            "dados_adicionais": {...}
        }
    
    Returns:
        JSON com status do envio
    """
    try:
        evento = request.get_json()
        
        if not evento:
            return jsonify({'message': 'Dados do evento não fornecidos!'}), 400
        
        # Validar campos obrigatórios
        campos_obrigatorios = ['tipo', 'embarcacao', 'severidade', 'descricao']
        for campo in campos_obrigatorios:
            if campo not in evento:
                return jsonify({'message': f'Campo obrigatório ausente: {campo}'}), 400
        
        # Enviar via BridgeCore
        if not bridge_core:
            init_bridge_core()
        
        resultado = bridge_core.enviar_evento(evento)
        
        status_code = 200 if resultado['status'] == 'success' else 500
        return jsonify(resultado), status_code
        
    except Exception as e:
        logger.error(f"❌ Erro ao processar evento: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/api/status', methods=['GET'])
@token_required
def verificar_status():
    """
    Endpoint para verificar status da conexão com SGSO.
    
    Returns:
        JSON com status da conexão
    """
    if not bridge_core:
        init_bridge_core()
    
    is_connected = bridge_core.verificar_conexao()
    
    return jsonify({
        'connected': is_connected,
        'endpoint': os.getenv('BRIDGE_ENDPOINT', 'não configurado'),
        'timestamp': datetime.now().isoformat()
    }), 200


if __name__ == '__main__':
    # Inicializar BridgeCore
    init_bridge_core()
    
    # Rodar servidor
    port = int(os.getenv('BRIDGE_API_PORT', 5000))
    debug = os.getenv('BRIDGE_API_DEBUG', 'False').lower() == 'true'
    
    print("=" * 60)
    print("🌉 BridgeLink API Server")
    print("=" * 60)
    print(f"Port: {port}")
    print(f"Debug: {debug}")
    print(f"Endpoint: {os.getenv('BRIDGE_ENDPOINT', 'https://sgso.petrobras.com.br/api')}")
    print("=" * 60)
    print("\nVariáveis de ambiente necessárias:")
    print("- BRIDGE_ENDPOINT: URL do endpoint SGSO")
    print("- BRIDGE_TOKEN: Token de autenticação SGSO")
    print("- BRIDGE_SECRET_KEY: Chave secreta para JWT")
    print("- BRIDGE_API_USER: Usuário da API (padrão: admin)")
    print("- BRIDGE_API_PASSWORD: Senha da API")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=port, debug=debug)
