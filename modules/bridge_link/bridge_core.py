"""
BridgeLink - Bridge Core Module
Secure communication bridge between vessels and shore operations

Features:
- Secure HTTP communication with Bearer token authentication
- Automatic PDF report transmission to SGSO Petrobras
- Critical event transmission (loss DP, failures, ASOG alerts)
- Connection verification and health checks
- Comprehensive error handling and logging

Compliance:
- NORMAM-101 - Normas da Autoridade Marítima
- IMCA M 117 - Guidelines for Design and Operation of DP Vessels
"""

import json
import logging
import requests
from datetime import datetime
from typing import Dict, Optional, Any
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BridgeCore:
    """
    Core communication module for ship-to-shore data transmission.
    
    Handles secure communication with SGSO Petrobras API using Bearer token
    authentication for report uploads and event notifications.
    """
    
    def __init__(self, endpoint: str, token: str, timeout: int = 30):
        """
        Initialize BridgeCore with endpoint and authentication.
        
        Args:
            endpoint: Base URL for SGSO Petrobras API
            token: Bearer authentication token
            timeout: Request timeout in seconds (default: 30)
        """
        self.endpoint = endpoint.rstrip('/')
        self.token = token
        self.timeout = timeout
        self.headers = {
            "Authorization": f"Bearer {token}",
            "User-Agent": "BridgeLink/1.0.0"
        }
        logger.info(f"BridgeCore initialized for endpoint: {endpoint}")
    
    def verificar_conexao(self) -> bool:
        """
        Verify connection to SGSO endpoint.
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            response = requests.get(
                f"{self.endpoint}/health",
                headers=self.headers,
                timeout=self.timeout
            )
            if response.status_code == 200:
                logger.info("✅ Conexão com SGSO verificada com sucesso")
                return True
            else:
                logger.warning(f"⚠️ Conexão retornou status {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            logger.error(f"❌ Erro ao verificar conexão: {e}")
            return False
    
    def enviar_relatorio(self, arquivo_pdf: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Send PEO-DP technical report to SGSO Petrobras.
        
        Args:
            arquivo_pdf: Path to PDF report file
            metadata: Optional metadata dictionary (vessel, date, audit type, etc.)
            
        Returns:
            Dictionary with status and response information
        """
        pdf_path = Path(arquivo_pdf)
        
        if not pdf_path.exists():
            error_msg = f"Arquivo não encontrado: {arquivo_pdf}"
            logger.error(f"❌ {error_msg}")
            return {"success": False, "error": error_msg}
        
        try:
            with open(arquivo_pdf, "rb") as f:
                files = {"file": (pdf_path.name, f, "application/pdf")}
                
                # Add metadata as form data if provided
                data = {}
                if metadata:
                    data = {
                        "metadata": json.dumps(metadata),
                        "timestamp": datetime.now().isoformat(),
                        "source": "PEO-DP Inteligente"
                    }
                
                response = requests.post(
                    f"{self.endpoint}/upload",
                    headers=self.headers,
                    files=files,
                    data=data,
                    timeout=self.timeout
                )
            
            if response.status_code == 200:
                logger.info(f"✅ Relatório enviado com sucesso às {datetime.now()}")
                logger.info(f"   Arquivo: {pdf_path.name}")
                if metadata:
                    logger.info(f"   Embarcação: {metadata.get('vessel', 'N/A')}")
                
                return {
                    "success": True,
                    "timestamp": datetime.now().isoformat(),
                    "file": pdf_path.name,
                    "response": response.json() if response.content else {}
                }
            else:
                error_msg = f"Falha no envio: HTTP {response.status_code}"
                logger.error(f"⚠️ {error_msg}")
                logger.error(f"   Response: {response.text[:200]}")
                return {
                    "success": False,
                    "error": error_msg,
                    "status_code": response.status_code,
                    "response": response.text[:200]
                }
                
        except requests.exceptions.Timeout:
            error_msg = f"Timeout ao enviar relatório (>{self.timeout}s)"
            logger.error(f"⏱️ {error_msg}")
            return {"success": False, "error": error_msg}
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Erro de rede ao enviar relatório: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {"success": False, "error": error_msg}
            
        except Exception as e:
            error_msg = f"Erro inesperado: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {"success": False, "error": error_msg}
    
    def enviar_evento(self, evento: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transmit critical event to SGSO (loss DP, failures, ASOG alerts).
        
        Args:
            evento: Dictionary containing event information
                Required fields: tipo, descricao, severidade
                Optional fields: embarcacao, timestamp, dados_adicionais
                
        Returns:
            Dictionary with status and response information
        """
        # Validate required fields
        required_fields = ["tipo", "descricao", "severidade"]
        missing_fields = [f for f in required_fields if f not in evento]
        
        if missing_fields:
            error_msg = f"Campos obrigatórios ausentes: {', '.join(missing_fields)}"
            logger.error(f"❌ {error_msg}")
            return {"success": False, "error": error_msg}
        
        # Add timestamp if not provided
        if "timestamp" not in evento:
            evento["timestamp"] = datetime.now().isoformat()
        
        # Add source identifier
        evento["source"] = "PEO-DP Inteligente"
        
        try:
            response = requests.post(
                f"{self.endpoint}/event",
                headers={
                    **self.headers,
                    "Content-Type": "application/json"
                },
                data=json.dumps(evento),
                timeout=self.timeout
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"✅ Evento transmitido com sucesso")
                logger.info(f"   Tipo: {evento['tipo']}")
                logger.info(f"   Severidade: {evento['severidade']}")
                if "embarcacao" in evento:
                    logger.info(f"   Embarcação: {evento['embarcacao']}")
                
                return {
                    "success": True,
                    "timestamp": evento["timestamp"],
                    "event_type": evento["tipo"],
                    "response": response.json() if response.content else {}
                }
            else:
                error_msg = f"Falha ao transmitir evento: HTTP {response.status_code}"
                logger.error(f"⚠️ {error_msg}")
                return {
                    "success": False,
                    "error": error_msg,
                    "status_code": response.status_code
                }
                
        except requests.exceptions.RequestException as e:
            error_msg = f"Erro ao transmitir evento: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {"success": False, "error": error_msg}
            
        except Exception as e:
            error_msg = f"Erro inesperado ao transmitir evento: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {"success": False, "error": error_msg}
    
    def obter_status(self) -> Dict[str, Any]:
        """
        Get current status of BridgeCore connection.
        
        Returns:
            Dictionary with connection status and statistics
        """
        is_connected = self.verificar_conexao()
        
        return {
            "endpoint": self.endpoint,
            "connected": is_connected,
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }


# Example usage
if __name__ == "__main__":
    # Example configuration
    SGSO_ENDPOINT = "https://sgso.petrobras.com.br/api"
    AUTH_TOKEN = "your-bearer-token-here"
    
    # Initialize bridge
    bridge = BridgeCore(endpoint=SGSO_ENDPOINT, token=AUTH_TOKEN)
    
    # Verify connection
    status = bridge.obter_status()
    print(f"Status: {status}")
    
    # Send report example
    # result = bridge.enviar_relatorio(
    #     "relatorio_peodp_fpso123_2024.pdf",
    #     metadata={
    #         "vessel": "FPSO-123",
    #         "audit_type": "PEO-DP",
    #         "date": "2024-01-15"
    #     }
    # )
    
    # Send event example
    # result = bridge.enviar_evento({
    #     "tipo": "loss_dp",
    #     "descricao": "Perda de posicionamento dinâmico",
    #     "severidade": "CRITICAL",
    #     "embarcacao": "FPSO-123",
    #     "dados_adicionais": {
    #         "duracao_segundos": 45,
    #         "posicao": {"lat": -23.5505, "lon": -46.6333}
    #     }
    # })
