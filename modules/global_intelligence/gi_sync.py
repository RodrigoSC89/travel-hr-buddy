"""
Fleet Data Collector Module

Collects telemetry data from all Nautilus vessels via BridgeLink API.
Aggregates PEO-DP scores, DP failures, operation time, and critical alerts.
"""

import requests
import json
import os


class FleetCollector:
    """Collects operational data from entire Nautilus fleet"""

    def __init__(self):
        """Initialize fleet collector with BridgeLink endpoint"""
        self.endpoint = "https://bridge.nautilus/api/fleet_data"
        self.config_file = "modules/global_intelligence/fleet_profiles.json"

    def coletar_dados(self):
        """
        Collect data from all vessels via BridgeLink API.
        Falls back to local fleet_profiles.json if API is unavailable.

        Returns:
            list: Fleet telemetry data with vessel metrics
        """
        try:
            # Try to fetch from BridgeLink API
            response = requests.get(self.endpoint, timeout=10)
            if response.status_code == 200:
                print("✅ Dados de frota coletados via BridgeLink API.")
                return response.json()
            else:
                print(f"⚠️ BridgeLink API retornou status {response.status_code}.")
                return self._load_local_data()
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Erro ao conectar com BridgeLink: {e}")
            return self._load_local_data()

    def _load_local_data(self):
        """
        Load fleet data from local JSON file as fallback.

        Returns:
            list: Local fleet configuration data
        """
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    print(f"✅ {len(data)} embarcações carregadas do arquivo local.")
                    return data
            except Exception as e:
                print(f"❌ Erro ao carregar dados locais: {e}")
                return []
        else:
            print(f"❌ Arquivo {self.config_file} não encontrado.")
            return []
