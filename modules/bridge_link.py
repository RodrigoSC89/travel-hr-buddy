"""
BridgeLink Module - Nautilus One System
Responsible for establishing secure communication with SGSO,
sending reports (FMEA, ASOG, Forecast, and Auto-Report) to the remote server.
"""

import json
import requests
from datetime import datetime
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.logger import log_event


class BridgeLink:
    """
    BridgeLink Module - Nautilus One System
    Responsible for establishing secure communication with SGSO,
    sending reports (FMEA, ASOG, Forecast and Auto-Report) to the remote server.
    """

    def __init__(self):
        """Initialize BridgeLink with configuration from config.json"""
        self.load_config()
        self.files = {
            "FMEA": "relatorio_fmea_atual.json",
            "ASOG": "asog_report.json",
            "FORECAST": "forecast_risco.json",
            "AUTO_REPORT": "nautilus_full_report.json"
        }

    def load_config(self):
        """Load configuration from config.json file"""
        try:
            config_path = "config.json"
            if os.path.exists(config_path):
                with open(config_path, "r", encoding="utf-8") as cfg:
                    conf = json.load(cfg)
                    self.endpoint = conf.get("endpoint", "https://api.sgso.nautilus.one/upload")
                    auth_token = conf.get("auth_token", "Bearer TESTE-TOKEN-123456789")
                    self.headers = {
                        "Content-Type": "application/json",
                        "Authorization": auth_token
                    }
            else:
                # Default configuration if config.json doesn't exist
                self.endpoint = "https://api.sgso.nautilus.one/upload"
                self.headers = {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer TESTE-TOKEN-123456789"
                }
                log_event("Config file not found, using default configuration")
        except Exception as e:
            log_event(f"Error loading config: {e}. Using default configuration.")
            self.endpoint = "https://api.sgso.nautilus.one/upload"
            self.headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer TESTE-TOKEN-123456789"
            }

    def carregar_arquivo(self, path):
        """
        Load a JSON file
        
        Args:
            path (str): Path to the JSON file
            
        Returns:
            dict or None: Loaded JSON data or None if file not found
        """
        try:
            with open(path, "r", encoding="utf-8") as file:
                return json.load(file)
        except FileNotFoundError:
            log_event(f"Arquivo não encontrado: {path}")
            return None
        except json.JSONDecodeError as e:
            log_event(f"Erro ao decodificar JSON em {path}: {e}")
            return None

    def enviar_relatorio(self, nome, dados):
        """
        Send a report to the SGSO server
        
        Args:
            nome (str): Report name
            dados (dict): Report data
            
        Returns:
            bool: True if successful, False otherwise
        """
        payload = {
            "report_name": nome,
            "timestamp": datetime.utcnow().isoformat(),
            "data": dados
        }
        try:
            response = requests.post(
                self.endpoint, 
                headers=self.headers, 
                json=payload, 
                timeout=15
            )
            if response.status_code == 200:
                log_event(f"Relatório {nome} enviado com sucesso.")
                print(f"✅ {nome} transmitido para o SGSO.")
                return True
            else:
                log_event(f"Falha ao enviar {nome}: {response.status_code}")
                print(f"❌ Erro ao enviar {nome}: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            log_event(f"Erro de conexão ao enviar {nome}: {e}")
            print(f"⚠️ Falha de comunicação com o servidor SGSO.")
            return False

    def sincronizar(self):
        """
        Synchronize all available reports with SGSO server
        """
        print("\n🌐 Iniciando BridgeLink – Transmissão Segura...")
        log_event("BridgeLink iniciado.")

        for nome, arquivo in self.files.items():
            dados = self.carregar_arquivo(arquivo)
            if dados:
                self.enviar_relatorio(nome, dados)
            else:
                print(f"⚠️ {nome}: Nenhum dado disponível para enviar.")

        log_event("Transmissão concluída.")
        print("\n📡 Todos os relatórios disponíveis foram processados.")
