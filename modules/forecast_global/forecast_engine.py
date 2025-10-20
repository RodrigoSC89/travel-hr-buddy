"""
Forecast Global - Machine Learning Prediction Engine
AI-powered risk prediction system that learns from all vessels in the fleet

Features:
- RandomForest and GradientBoosting models (200 estimators)
- Cross-validation training (5-fold)
- Risk prediction with 0-100% probability scores
- Risk classification (baixo/medio/alto/critico)
- Feature importance analysis for explainability
- Batch prediction support

Compliance:
- NORMAM-101 - Normas da Autoridade Marítima
- IMCA M 117 - Guidelines for Design and Operation of DP Vessels
"""

import os
import logging
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ForecastEngine:
    """
    Machine Learning engine for fleet-wide risk prediction.
    
    Predicts compliance risk based on operational metrics from all vessels,
    enabling proactive risk management and corrective actions.
    """
    
    # Feature names for model
    FEATURES = ["horas_dp", "falhas_mensais", "eventos_asog", "score_peodp"]
    
    def __init__(
        self,
        model_type: str = "random_forest",
        model_path: str = "forecast_model.pkl",
        scaler_path: str = "forecast_scaler.pkl"
    ):
        """
        Initialize ForecastEngine.
        
        Args:
            model_type: Type of model ('random_forest' or 'gradient_boosting')
            model_path: Path to save/load model
            scaler_path: Path to save/load feature scaler
        """
        self.model_type = model_type
        self.model_path = Path(model_path)
        self.scaler_path = Path(scaler_path)
        self.model: Optional[Any] = None
        self.scaler: Optional[StandardScaler] = None
        self.feature_importance: Optional[Dict[str, float]] = None
        self.training_metrics: Optional[Dict[str, float]] = None
        
        logger.info(f"ForecastEngine initialized (model_type: {model_type})")
        
        # Try to load existing model
        if self.model_path.exists():
            self._load_model()
    
    def _create_model(self) -> Any:
        """Create ML model based on type."""
        if self.model_type == "random_forest":
            return RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == "gradient_boosting":
            return GradientBoostingClassifier(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
        else:
            raise ValueError(f"Unknown model type: {self.model_type}")
    
    def treinar(self, dataset_csv: str, validate: bool = True) -> Dict[str, Any]:
        """
        Train the model on fleet data.
        
        Args:
            dataset_csv: Path to CSV file with training data
            validate: Whether to perform cross-validation
            
        Returns:
            Dictionary with training metrics
        """
        logger.info(f"Training model on dataset: {dataset_csv}")
        
        # Load data
        data = pd.read_csv(dataset_csv)
        
        # Validate columns
        required_cols = self.FEATURES + ["risco_conformidade"]
        missing_cols = [col for col in required_cols if col not in data.columns]
        
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")
        
        # Prepare features and target
        X = data[self.FEATURES].values
        y = data["risco_conformidade"].values
        
        # Create and fit scaler
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Create and train model
        self.model = self._create_model()
        
        logger.info(f"Training {self.model_type} model...")
        self.model.fit(X_scaled, y)
        
        # Calculate feature importance
        if hasattr(self.model, 'feature_importances_'):
            self.feature_importance = dict(zip(
                self.FEATURES,
                self.model.feature_importances_
            ))
            
            logger.info("Feature importance:")
            for feature, importance in sorted(
                self.feature_importance.items(),
                key=lambda x: x[1],
                reverse=True
            ):
                logger.info(f"  {feature}: {importance:.4f}")
        
        # Cross-validation
        metrics = {}
        if validate:
            logger.info("Performing 5-fold cross-validation...")
            cv_scores = cross_val_score(
                self.model, X_scaled, y,
                cv=5,
                scoring='accuracy'
            )
            
            metrics = {
                'cv_mean_accuracy': float(cv_scores.mean()),
                'cv_std_accuracy': float(cv_scores.std()),
                'cv_scores': cv_scores.tolist()
            }
            
            logger.info(f"CV Accuracy: {metrics['cv_mean_accuracy']:.4f} (+/- {metrics['cv_std_accuracy']:.4f})")
        
        # Training set accuracy
        train_score = self.model.score(X_scaled, y)
        metrics['train_accuracy'] = float(train_score)
        metrics['n_samples'] = len(data)
        metrics['n_features'] = len(self.FEATURES)
        
        logger.info(f"Training accuracy: {train_score:.4f}")
        logger.info(f"Samples: {len(data)}")
        
        self.training_metrics = metrics
        
        # Save model and scaler
        self._save_model()
        
        logger.info("✅ Modelo Forecast Global treinado.")
        
        return metrics
    
    def prever(self, entrada: List[float]) -> Dict[str, Any]:
        """
        Predict risk for a single input.
        
        Args:
            entrada: List of feature values [horas_dp, falhas_mensais, eventos_asog, score_peodp]
            
        Returns:
            Dictionary with prediction results
        """
        if self.model is None:
            raise RuntimeError("Model not trained. Call treinar() first.")
        
        if len(entrada) != len(self.FEATURES):
            raise ValueError(f"Expected {len(self.FEATURES)} features, got {len(entrada)}")
        
        # Scale features
        entrada_array = np.array(entrada).reshape(1, -1)
        entrada_scaled = self.scaler.transform(entrada_array)
        
        # Predict probability
        if hasattr(self.model, 'predict_proba'):
            proba = self.model.predict_proba(entrada_scaled)[0]
            # Get probability of positive class (risk=1)
            risco_prob = float(proba[1] if len(proba) > 1 else proba[0])
        else:
            # For models without predict_proba
            pred = self.model.predict(entrada_scaled)[0]
            risco_prob = float(pred)
        
        # Convert to percentage
        risco_percentual = round(risco_prob * 100, 2)
        
        # Classify risk level
        if risco_percentual < 30:
            nivel_risco = "baixo"
        elif risco_percentual < 60:
            nivel_risco = "medio"
        elif risco_percentual < 80:
            nivel_risco = "alto"
        else:
            nivel_risco = "critico"
        
        result = {
            "risco_percentual": risco_percentual,
            "nivel_risco": nivel_risco,
            "features": dict(zip(self.FEATURES, entrada)),
            "recomendacao": self._get_recommendation(risco_percentual)
        }
        
        logger.info(f"Prediction: {risco_percentual}% ({nivel_risco})")
        
        return result
    
    def prever_lote(self, entradas: List[List[float]]) -> List[Dict[str, Any]]:
        """
        Predict risk for multiple inputs (batch processing).
        
        Args:
            entradas: List of feature value lists
            
        Returns:
            List of prediction dictionaries
        """
        if self.model is None:
            raise RuntimeError("Model not trained. Call treinar() first.")
        
        logger.info(f"Batch prediction for {len(entradas)} samples")
        
        # Scale all features
        entradas_array = np.array(entradas)
        entradas_scaled = self.scaler.transform(entradas_array)
        
        # Predict probabilities
        if hasattr(self.model, 'predict_proba'):
            probas = self.model.predict_proba(entradas_scaled)
            riscos_prob = probas[:, 1] if probas.shape[1] > 1 else probas[:, 0]
        else:
            riscos_prob = self.model.predict(entradas_scaled)
        
        # Build results
        results = []
        for entrada, risco_prob in zip(entradas, riscos_prob):
            risco_percentual = round(float(risco_prob) * 100, 2)
            
            # Classify risk level
            if risco_percentual < 30:
                nivel_risco = "baixo"
            elif risco_percentual < 60:
                nivel_risco = "medio"
            elif risco_percentual < 80:
                nivel_risco = "alto"
            else:
                nivel_risco = "critico"
            
            results.append({
                "risco_percentual": risco_percentual,
                "nivel_risco": nivel_risco,
                "features": dict(zip(self.FEATURES, entrada)),
                "recomendacao": self._get_recommendation(risco_percentual)
            })
        
        return results
    
    def _get_recommendation(self, risco_percentual: float) -> str:
        """Get risk-based recommendation."""
        if risco_percentual < 30:
            return "Manter monitoramento de rotina"
        elif risco_percentual < 60:
            return "Aumentar frequência de inspeções"
        elif risco_percentual < 80:
            return "Ação corretiva recomendada"
        else:
            return "Ação corretiva urgente necessária"
    
    def _save_model(self):
        """Save model and scaler to disk."""
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        
        logger.info(f"Model saved to {self.model_path}")
        logger.info(f"Scaler saved to {self.scaler_path}")
    
    def _load_model(self):
        """Load model and scaler from disk."""
        try:
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            
            logger.info(f"Model loaded from {self.model_path}")
            logger.info(f"Scaler loaded from {self.scaler_path}")
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            self.model = None
            self.scaler = None
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the trained model.
        
        Returns:
            Dictionary with model information
        """
        if self.model is None:
            return {"status": "not_trained"}
        
        info = {
            "status": "trained",
            "model_type": self.model_type,
            "features": self.FEATURES,
            "feature_importance": self.feature_importance,
            "training_metrics": self.training_metrics,
            "model_path": str(self.model_path),
            "scaler_path": str(self.scaler_path)
        }
        
        return info


# Example usage
if __name__ == "__main__":
    # Initialize engine
    engine = ForecastEngine(model_type="random_forest")
    
    # Example: Train on dataset
    # engine.treinar("fleet_data.csv")
    
    # Example: Make prediction
    # prediction = engine.prever([2400, 3, 1, 85])
    # print(f"Risk: {prediction['risco_percentual']}% - {prediction['nivel_risco']}")
    # print(f"Recommendation: {prediction['recomendacao']}")
    
    # Get model info
    info = engine.get_model_info()
    print(f"Model info: {info}")
