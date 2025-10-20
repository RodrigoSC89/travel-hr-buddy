"""
Módulo BridgeLink – Sistema Nautilus One
Responsável por estabelecer comunicação segura com o SGSO,
enviando relatórios (FMEA, ASOG, Forecast e Auto-Report) para o servidor remoto.
"""

import json
import requests
from datetime import datetime
from core.logger import log_event


class BridgeLink:
    """
    Módulo BridgeLink – Sistema Nautilus One
    Responsável por estabelecer comunicação segura com o SGSO,
    enviando relatórios (FMEA, ASOG, Forecast e Auto-Report) para o servidor remoto.
    """

    def __init__(self):
        self.endpoint = "https://api.sgso.nautilus.one/upload"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": "Bearer TESTE-TOKEN-123456789"
        }
        self.files = {
            "FMEA": "relatorio_fmea_atual.json",
            "ASOG": "asog_report.json",
            "FORECAST": "forecast_risco.json",
            "AUTO_REPORT": "nautilus_full_report.json"
        }
        
        # Carregar configuração se existir
        self._load_config()

    def _load_config(self):
        """Carrega configuração do arquivo config.json se existir."""
        try:
            with open("config.json", "r", encoding="utf-8") as cfg:
                conf = json.load(cfg)
                self.endpoint = conf.get("endpoint", self.endpoint)
                if "auth_token" in conf:
                    self.headers["Authorization"] = conf["auth_token"]
                log_event("Configuração carregada de config.json")
        except FileNotFoundError:
            log_event("config.json não encontrado, usando configuração padrão")
        except json.JSONDecodeError as e:
            log_event(f"Erro ao ler config.json: {e}")

    def carregar_arquivo(self, path):
        """
        Carrega um arquivo JSON.
        
        Args:
            path: Caminho do arquivo JSON
            
        Returns:
            dict: Dados do arquivo ou None se falhar
        """
        try:
            with open(path, "r", encoding="utf-8") as file:
                return json.load(file)
        except FileNotFoundError:
            log_event(f"Arquivo não encontrado: {path}")
            return None
        except json.JSONDecodeError as e:
            log_event(f"Erro ao decodificar JSON de {path}: {e}")
            return None

    def enviar_relatorio(self, nome, dados):
        """
        Envia um relatório para o servidor SGSO.
        
        Args:
            nome: Nome do relatório
            dados: Dados do relatório (dict)
            
        Returns:
            bool: True se sucesso, False se falha
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
        Sincroniza todos os relatórios disponíveis com o servidor SGSO.
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
