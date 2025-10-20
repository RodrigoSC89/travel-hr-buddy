"""
gi_sync.py - Fleet Data Synchronization

Coleta dados de todas as embarcações via BridgeLink.
"""

import requests
from typing import List, Dict, Any


class FleetCollector:
    """
    Coletor de dados da frota via BridgeLink API.
    Consolida telemetria e eventos de todas as embarcações.
    """

    def __init__(self):
        self.endpoint = "https://bridge.nautilus/api/fleet_data"

    def coletar_dados(self) -> List[Dict[str, Any]]:
        """
        Coleta dados de toda a frota através do BridgeLink.

        Returns:
            Lista de dicionários com dados das embarcações
        """
        try:
            response = requests.get(self.endpoint)
            if response.status_code == 200:
                print("✅ Dados de frota coletados com sucesso.")
                return response.json()
            else:
                print(f"⚠️ Falha ao coletar dados. Status: {response.status_code}")
                return []
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Erro de conexão ao coletar dados: {e}")
            return []
