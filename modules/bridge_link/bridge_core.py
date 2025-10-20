"""
BridgeLink Core Module
======================
Controla comunicação segura entre bordo e costa para transmissão de relatórios
e eventos críticos do sistema PEO-DP Inteligente ao SGSO Petrobras.

Funcionalidades:
- Envio seguro de relatórios técnicos (PDF)
- Transmissão de eventos críticos em tempo real
- Autenticação via token Bearer
- Log detalhado de todas as operações
"""

import requests
import json
from datetime import datetime
from typing import Dict, Optional, Any
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class BridgeCore:
    """
    Classe principal para comunicação segura entre bordo e costa.
    
    Attributes:
        endpoint (str): URL base do endpoint SGSO Petrobras
        token (str): Token de autenticação Bearer
        timeout (int): Timeout para requisições HTTP (segundos)
    """
    
    def __init__(self, endpoint: str, token: str, timeout: int = 30):
        """
        Inicializa o módulo BridgeCore.
        
        Args:
            endpoint: URL base do endpoint SGSO Petrobras
            token: Token de autenticação Bearer
            timeout: Timeout para requisições HTTP em segundos (padrão: 30)
        """
        self.endpoint = endpoint.rstrip('/')
        self.token = token
        self.timeout = timeout
        logger.info(f"BridgeCore inicializado com endpoint: {endpoint}")
    
    def enviar_relatorio(self, arquivo_pdf: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Envia relatório técnico PEO-DP ao SGSO Petrobras.
        
        Args:
            arquivo_pdf: Caminho do arquivo PDF a ser enviado
            metadata: Metadados opcionais do relatório (embarcação, data, tipo, etc.)
        
        Returns:
            Dict contendo status do envio e resposta do servidor
            
        Raises:
            FileNotFoundError: Se o arquivo PDF não for encontrado
            requests.RequestException: Se houver erro na comunicação HTTP
        """
        try:
            logger.info(f"Iniciando envio de relatório: {arquivo_pdf}")
            
            # Validar existência do arquivo
            with open(arquivo_pdf, "rb") as f:
                file_content = f.read()
            
            # Preparar headers
            headers = {
                "Authorization": f"Bearer {self.token}"
            }
            
            # Preparar dados do formulário
            files = {"file": (arquivo_pdf.split('/')[-1], file_content, "application/pdf")}
            data = metadata if metadata else {}
            
            # Enviar requisição
            response = requests.post(
                f"{self.endpoint}/upload",
                headers=headers,
                files=files,
                data=data,
                timeout=self.timeout
            )
            
            # Processar resposta
            if response.status_code == 200:
                logger.info(f"✅ Relatório enviado com sucesso às {datetime.now()}")
                return {
                    "status": "success",
                    "timestamp": datetime.now().isoformat(),
                    "response": response.json() if response.content else {}
                }
            else:
                logger.error(f"⚠️ Falha no envio: {response.status_code} - {response.text}")
                return {
                    "status": "error",
                    "timestamp": datetime.now().isoformat(),
                    "status_code": response.status_code,
                    "error": response.text
                }
                
        except FileNotFoundError as e:
            logger.error(f"❌ Arquivo não encontrado: {arquivo_pdf}")
            return {
                "status": "error",
                "timestamp": datetime.now().isoformat(),
                "error": f"Arquivo não encontrado: {str(e)}"
            }
        except requests.RequestException as e:
            logger.error(f"❌ Erro de comunicação: {str(e)}")
            return {
                "status": "error",
                "timestamp": datetime.now().isoformat(),
                "error": f"Erro de comunicação: {str(e)}"
            }
    
    def enviar_evento(self, evento: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transmite evento crítico ao SGSO Petrobras.
        
        Eventos críticos incluem:
        - Loss of DP (perda de posicionamento dinâmico)
        - Falhas de sistema
        - Alertas ASOG (Annual Summary of Geostationary)
        - Não-conformidades NORMAM-101 / IMCA M 117
        
        Args:
            evento: Dicionário contendo dados do evento crítico
                Campos esperados:
                - tipo: tipo do evento (loss_dp, falha, alerta_asog, etc.)
                - embarcacao: identificação da embarcação
                - timestamp: data/hora do evento
                - descricao: descrição detalhada
                - severidade: nivel de severidade (baixa, media, alta, critica)
        
        Returns:
            Dict contendo status do envio e resposta do servidor
            
        Raises:
            requests.RequestException: Se houver erro na comunicação HTTP
        """
        try:
            logger.info(f"Transmitindo evento crítico: {evento.get('tipo', 'desconhecido')}")
            
            # Adicionar timestamp se não existir
            if 'timestamp' not in evento:
                evento['timestamp'] = datetime.now().isoformat()
            
            # Preparar dados
            data = json.dumps(evento)
            headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
            
            # Enviar requisição
            response = requests.post(
                f"{self.endpoint}/event",
                headers=headers,
                data=data,
                timeout=self.timeout
            )
            
            # Processar resposta
            if response.status_code in [200, 201]:
                logger.info(f"✅ Evento transmitido com sucesso")
                return {
                    "status": "success",
                    "timestamp": datetime.now().isoformat(),
                    "event_id": response.json().get('id') if response.content else None
                }
            else:
                logger.error(f"⚠️ Falha na transmissão: {response.status_code}")
                return {
                    "status": "error",
                    "timestamp": datetime.now().isoformat(),
                    "status_code": response.status_code,
                    "error": response.text
                }
                
        except requests.RequestException as e:
            logger.error(f"❌ Erro de comunicação: {str(e)}")
            return {
                "status": "error",
                "timestamp": datetime.now().isoformat(),
                "error": f"Erro de comunicação: {str(e)}"
            }
    
    def verificar_conexao(self) -> bool:
        """
        Verifica se a conexão com o endpoint SGSO está disponível.
        
        Returns:
            True se a conexão está OK, False caso contrário
        """
        try:
            response = requests.get(
                f"{self.endpoint}/health",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            is_connected = response.status_code == 200
            if is_connected:
                logger.info("✅ Conexão com SGSO verificada com sucesso")
            else:
                logger.warning(f"⚠️ Conexão com SGSO retornou status: {response.status_code}")
            return is_connected
        except requests.RequestException as e:
            logger.error(f"❌ Falha na verificação de conexão: {str(e)}")
            return False


if __name__ == "__main__":
    # Exemplo de uso
    print("🌉 BridgeLink Core - Exemplo de Uso")
    print("=" * 50)
    
    # Configurar BridgeCore (usar variáveis de ambiente em produção)
    bridge = BridgeCore(
        endpoint="https://sgso.petrobras.com.br/api",
        token="seu_token_aqui"
    )
    
    # Verificar conexão
    print("\n1. Verificando conexão com SGSO...")
    if bridge.verificar_conexao():
        print("   ✅ Conexão estabelecida")
    else:
        print("   ❌ Falha na conexão")
    
    # Exemplo de envio de evento crítico
    print("\n2. Exemplo de envio de evento crítico...")
    evento = {
        "tipo": "loss_dp",
        "embarcacao": "FPSO-123",
        "severidade": "critica",
        "descricao": "Perda de posicionamento dinâmico detectada no setor 3",
        "latitude": -23.5505,
        "longitude": -46.6333
    }
    resultado = bridge.enviar_evento(evento)
    print(f"   Status: {resultado['status']}")
    
    print("\n" + "=" * 50)
    print("Para uso em produção, configure as variáveis de ambiente:")
    print("- BRIDGE_ENDPOINT: URL do endpoint SGSO")
    print("- BRIDGE_TOKEN: Token de autenticação")
