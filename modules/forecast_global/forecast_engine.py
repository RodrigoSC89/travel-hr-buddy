"""
Forecast Global Engine - ML Risk Prediction System
===================================================

AI-powered risk prediction system that learns from all vessels in the fleet
using machine learning models.

Features:
- RandomForest and GradientBoosting models (200 estimators)
- Cross-validation training (5-fold)
- Risk prediction with 0-100% probability scores
- Risk classification (baixo/medio/alto/critico)
- Feature importance analysis
- Batch prediction support

Author: PEO-DP Inteligente System
Version: 1.0.0
License: MIT
"""

import pickle
import logging
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import cross_val_score
from sklearn.preprocessing import StandardScaler
import json


class ForecastEngine:
    """
    Machine Learning risk prediction engine for fleet-wide risk analysis.
    
    Uses ensemble methods (RandomForest or GradientBoosting) to predict
    operational risk based on historical data from entire fleet.
    """
    
    def __init__(self, model_type: str = "random_forest", n_estimators: int = 200):
        """
        Initialize ForecastEngine.
        
        Args:
            model_type: Model type ('random_forest' or 'gradient_boosting')
            n_estimators: Number of estimators for ensemble (default: 200)
        """
        self.model_type = model_type
        self.n_estimators = n_estimators
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = None
        self.trained = False
        
        # Configure logging
        self.logger = logging.getLogger('ForecastEngine')
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
        
        self.logger.info(f"ForecastEngine initialized: {model_type}, estimators={n_estimators}")
    
    def treinar(self, csv_path: str, feature_columns: List[str] = None,
               target_column: str = "risk_level") -> Dict[str, Any]:
        """
        Train the model on fleet data.
        
        Args:
            csv_path: Path to CSV file with training data
            feature_columns: List of feature column names (if None, uses all except target)
            target_column: Name of target column
            
        Returns:
            Dict with training results including accuracy and cross-validation scores
        """
        try:
            # Load data
            import pandas as pd
            df = pd.read_csv(csv_path)
            
            self.logger.info(f"Loaded training data: {len(df)} records from {csv_path}")
            
            # Prepare features and target
            if feature_columns is None:
                feature_columns = [col for col in df.columns if col != target_column]
            
            self.feature_names = feature_columns
            X = df[feature_columns].values
            y = df[target_column].values
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X)
            
            # Initialize model
            if self.model_type == "random_forest":
                self.model = RandomForestClassifier(
                    n_estimators=self.n_estimators,
                    max_depth=10,
                    min_samples_split=5,
                    min_samples_leaf=2,
                    random_state=42,
                    n_jobs=-1
                )
            elif self.model_type == "gradient_boosting":
                self.model = GradientBoostingClassifier(
                    n_estimators=self.n_estimators,
                    max_depth=5,
                    learning_rate=0.1,
                    random_state=42
                )
            else:
                raise ValueError(f"Unknown model type: {self.model_type}")
            
            # Train model
            self.logger.info("Training model...")
            start_time = datetime.now()
            self.model.fit(X_scaled, y)
            training_time = (datetime.now() - start_time).total_seconds()
            
            # Cross-validation
            self.logger.info("Performing cross-validation...")
            cv_scores = cross_val_score(self.model, X_scaled, y, cv=5)
            
            # Training accuracy
            train_score = self.model.score(X_scaled, y)
            
            self.trained = True
            
            result = {
                'success': True,
                'model_type': self.model_type,
                'training_samples': len(df),
                'features': self.feature_names,
                'training_accuracy': float(train_score),
                'cv_mean_accuracy': float(cv_scores.mean()),
                'cv_std_accuracy': float(cv_scores.std()),
                'training_time_seconds': round(training_time, 2),
                'timestamp': datetime.now().isoformat()
            }
            
            self.logger.info(f"Training complete: {train_score:.2%} accuracy, CV: {cv_scores.mean():.2%} ± {cv_scores.std():.2%}")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Training failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def prever(self, features: List[float]) -> Dict[str, Any]:
        """
        Predict risk for given features.
        
        Args:
            features: List of feature values (must match training features)
            
        Returns:
            Dict with prediction results:
            {
                'risk_probability': float (0-100),
                'risk_class': str ('baixo', 'medio', 'alto', 'critico'),
                'confidence': float (0-100),
                'timestamp': str
            }
        """
        if not self.trained:
            return {
                'success': False,
                'error': 'Model not trained yet',
                'timestamp': datetime.now().isoformat()
            }
        
        try:
            # Prepare features
            features_array = np.array(features).reshape(1, -1)
            features_scaled = self.scaler.transform(features_array)
            
            # Get prediction probabilities
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            # Get predicted class
            predicted_class = self.model.predict(features_scaled)[0]
            
            # Calculate risk probability (0-100)
            # Assuming classes are ordered: 0=baixo, 1=medio, 2=alto, 3=critico
            risk_prob = float(np.max(probabilities) * 100)
            
            # Map class to label
            class_labels = ['baixo', 'medio', 'alto', 'critico']
            risk_class = class_labels[int(predicted_class)] if predicted_class < len(class_labels) else 'unknown'
            
            result = {
                'success': True,
                'risk_probability': round(risk_prob, 2),
                'risk_class': risk_class,
                'confidence': round(float(np.max(probabilities)) * 100, 2),
                'probabilities': {
                    class_labels[i]: round(float(prob) * 100, 2)
                    for i, prob in enumerate(probabilities) if i < len(class_labels)
                },
                'timestamp': datetime.now().isoformat()
            }
            
            self.logger.info(f"Prediction: {risk_class} (prob: {risk_prob:.1f}%)")
            
            return result
            
        except Exception as e:
            self.logger.error(f"Prediction failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def prever_lote(self, features_list: List[List[float]]) -> List[Dict[str, Any]]:
        """
        Predict risk for multiple feature sets (batch prediction).
        
        Args:
            features_list: List of feature value lists
            
        Returns:
            List of prediction result dicts
        """
        return [self.prever(features) for features in features_list]
    
    def obter_importancia_features(self) -> Dict[str, float]:
        """
        Get feature importance scores.
        
        Returns:
            Dict mapping feature names to importance scores
        """
        if not self.trained or not hasattr(self.model, 'feature_importances_'):
            return {}
        
        importances = self.model.feature_importances_
        
        return {
            name: float(importance)
            for name, importance in zip(self.feature_names, importances)
        }
    
    def salvar_modelo(self, path: str):
        """
        Save trained model to file.
        
        Args:
            path: Path to save model file
        """
        if not self.trained:
            raise ValueError("Cannot save untrained model")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'model_type': self.model_type,
            'n_estimators': self.n_estimators,
            'timestamp': datetime.now().isoformat()
        }
        
        with open(path, 'wb') as f:
            pickle.dump(model_data, f)
        
        self.logger.info(f"Model saved to {path}")
    
    def carregar_modelo(self, path: str):
        """
        Load trained model from file.
        
        Args:
            path: Path to model file
        """
        with open(path, 'rb') as f:
            model_data = pickle.load(f)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.model_type = model_data['model_type']
        self.n_estimators = model_data['n_estimators']
        self.trained = True
        
        self.logger.info(f"Model loaded from {path}")


# Example usage
if __name__ == "__main__":
    # Initialize engine
    engine = ForecastEngine(model_type="random_forest", n_estimators=200)
    
    # Create sample training data
    import pandas as pd
    
    # Sample data: [horas_dp, falhas, eventos_criticos, score_conformidade] -> risk_level
    data = {
        'horas_dp': [2400, 1200, 3600, 800, 2000],
        'falhas': [1, 5, 2, 8, 3],
        'eventos_criticos': [0, 2, 1, 4, 1],
        'score_conformidade': [95, 70, 88, 60, 85],
        'risk_level': [0, 2, 1, 3, 1]  # 0=baixo, 1=medio, 2=alto, 3=critico
    }
    
    df = pd.DataFrame(data)
    df.to_csv('/tmp/sample_fleet_data.csv', index=False)
    
    # Train model
    print("Training model...")
    result = engine.treinar('/tmp/sample_fleet_data.csv')
    print(json.dumps(result, indent=2))
    
    # Make prediction
    print("\nMaking prediction...")
    prediction = engine.prever([2400, 3, 1, 85])
    print(json.dumps(prediction, indent=2))
    
    # Feature importance
    print("\nFeature importance:")
    importance = engine.obter_importancia_features()
    print(json.dumps(importance, indent=2))
