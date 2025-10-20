"""
Global Model Trainer Module

Trains ML models using fleet-wide telemetry data.
Implements continuous learning from operational events and compliance data.
"""

import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
import joblib
import os


class GlobalTrainer:
    """Trains global ML models for fleet-wide risk prediction"""

    def __init__(self):
        """Initialize trainer with model storage path"""
        self.model_path = "modules/global_intelligence/global_model.pkl"
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)

    def treinar(self, dados):
        """
        Train global risk prediction model using fleet telemetry.

        Args:
            dados (list): Fleet data with metrics from all vessels
        """
        if not dados:
            print("⚠️ Nenhum dado disponível para treinamento.")
            return

        # Convert to DataFrame
        df = pd.DataFrame(dados)

        # Validate required columns
        required_cols = ["score_peodp", "falhas_dp", "tempo_dp", "alertas_criticos"]
        if not all(col in df.columns for col in required_cols):
            print("⚠️ Dados não contêm todas as colunas necessárias.")
            return

        # Prepare features and labels
        X = df[required_cols]
        
        # Generate conformity label if not present
        if "conformidade_ok" not in df.columns:
            # Consider non-compliant if score < 70 or critical alerts > 0
            df["conformidade_ok"] = ((df["score_peodp"] >= 70) & 
                                      (df["alertas_criticos"] == 0)).astype(int)
        
        y = df["conformidade_ok"]

        # Train Gradient Boosting model
        model = GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=4,
            random_state=42
        )
        model.fit(X, y)

        # Save model to disk
        joblib.dump(model, self.model_path)
        print("🤖 Modelo global treinado com dados consolidados.")
