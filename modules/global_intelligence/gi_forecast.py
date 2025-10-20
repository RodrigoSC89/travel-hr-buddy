"""
gi_forecast.py - Global Risk Forecasting

Previsões de risco e falha global por embarcação.
"""

import joblib
import pandas as pd
import os
from typing import List, Dict, Any


class GlobalForecaster:
    """
    Gerador de previsões globais de risco.
    Utiliza modelo treinado para prever riscos por embarcação.
    """

    def __init__(self):
        self.path = "modules/global_intelligence/global_model.pkl"

    def prever(self, dados: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Gera previsões de risco para cada embarcação.

        Args:
            dados: Lista de dicionários com métricas das embarcações

        Returns:
            Lista de previsões com nome da embarcação e nível de risco
        """
        if not dados:
            print("⚠️ Nenhum dado disponível para previsão.")
            return []

        if not os.path.exists(self.path):
            print("⚠️ Modelo não encontrado. Execute o treinamento primeiro.")
            return []

        try:
            model = joblib.load(self.path)
            df = pd.DataFrame(dados)

            # Verifica se as colunas necessárias existem
            required_columns = ["score_peodp", "falhas_dp", "tempo_dp", "alertas_criticos"]
            if not all(col in df.columns for col in required_columns):
                print(f"⚠️ Colunas necessárias não encontradas nos dados: {required_columns}")
                return []

            # Calcula probabilidades de risco
            df["risco"] = model.predict_proba(
                df[["score_peodp", "falhas_dp", "tempo_dp", "alertas_criticos"]]
            )[:, 1]
            df["risco"] = (df["risco"] * 100).round(2)

            return df[["embarcacao", "risco"]].to_dict(orient="records")
        except Exception as e:
            print(f"⚠️ Erro ao gerar previsões: {e}")
            return []
