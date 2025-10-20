"""
gi_trainer.py - Global Model Training

Reforço de aprendizado contínuo com base em telemetria e eventos.
"""

import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
import joblib
import os
from typing import List, Dict, Any


class GlobalTrainer:
    """
    Treinador global de modelos de IA.
    Realiza aprendizado contínuo baseado em dados da frota.
    """

    def __init__(self):
        self.path = "modules/global_intelligence/global_model.pkl"

    def treinar(self, dados: List[Dict[str, Any]]) -> None:
        """
        Treina o modelo global com dados consolidados da frota.

        Args:
            dados: Lista de dicionários com métricas das embarcações
        """
        if not dados:
            print("⚠️ Nenhum dado disponível para treinamento.")
            return

        try:
            df = pd.DataFrame(dados)

            # Verifica se as colunas necessárias existem
            required_columns = ["score_peodp", "falhas_dp", "tempo_dp", "alertas_criticos"]
            if not all(col in df.columns for col in required_columns):
                print(f"⚠️ Colunas necessárias não encontradas nos dados: {required_columns}")
                return

            X = df[["score_peodp", "falhas_dp", "tempo_dp", "alertas_criticos"]]
            y = df["conformidade_ok"]

            model = GradientBoostingClassifier(n_estimators=200, random_state=42)
            model.fit(X, y)

            # Cria o diretório se não existir
            os.makedirs(os.path.dirname(self.path), exist_ok=True)
            joblib.dump(model, self.path)

            print("🤖 Modelo global treinado com dados consolidados.")
        except Exception as e:
            print(f"⚠️ Erro ao treinar modelo: {e}")
