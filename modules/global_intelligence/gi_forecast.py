"""
Global Risk Forecaster Module

Generates risk predictions for each vessel in the fleet.
Provides probability scores and severity classifications.
"""

import joblib
import pandas as pd
import os


class GlobalForecaster:
    """Generates fleet-wide risk predictions using trained ML model"""

    def __init__(self):
        """Initialize forecaster with model path"""
        self.model_path = "modules/global_intelligence/global_model.pkl"

    def prever(self, dados):
        """
        Generate risk predictions for all vessels.

        Args:
            dados (list): Fleet data with vessel metrics

        Returns:
            list: Risk predictions with vessel name and risk percentage
        """
        if not os.path.exists(self.model_path):
            print("⚠️ Modelo global não encontrado. Execute treinamento primeiro.")
            return []

        # Load trained model
        model = joblib.load(self.model_path)

        # Convert to DataFrame
        df = pd.DataFrame(dados)

        # Validate required columns
        required_cols = ["score_peodp", "falhas_dp", "tempo_dp", "alertas_criticos"]
        if not all(col in df.columns for col in required_cols):
            print("⚠️ Dados não contêm todas as colunas necessárias para previsão.")
            return []

        # Generate predictions (probability of non-compliance)
        X = df[required_cols]
        risk_proba = model.predict_proba(X)[:, 0]  # Probability of class 0 (non-compliant)
        
        # Convert to percentage and round
        df["risco"] = (risk_proba * 100).round(2)

        # Return predictions with vessel names
        if "embarcacao" in df.columns:
            return df[["embarcacao", "risco"]].to_dict(orient="records")
        else:
            print("⚠️ Coluna 'embarcacao' não encontrada nos dados.")
            return []
