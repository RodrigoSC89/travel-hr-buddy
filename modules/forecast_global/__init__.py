"""
Forecast Global Module - AI-Powered Fleet Risk Prediction

This module provides comprehensive risk prediction and monitoring for entire
vessel fleets using machine learning models trained on historical data.

Main Components:
- ForecastEngine: ML prediction engine (RandomForest/GradientBoosting)
- ForecastTrainer: Continuous learning and automatic retraining
- ForecastDashboard: Fleet monitoring, visualization, and alerting

Usage:
    from forecast_global import ForecastEngine, ForecastTrainer, ForecastDashboard
    
    # Initialize AI prediction
    engine = ForecastEngine(model_type="random_forest")
    engine.treinar("fleet_data.csv")
    
    # Setup continuous learning
    trainer = ForecastTrainer(forecast_engine=engine)
    
    # Initialize dashboard
    dashboard = ForecastDashboard(engine, alert_threshold=60.0)
    
    # Make prediction
    prediction = engine.prever([2400, 3, 1, 85])  # horas_dp, falhas, eventos, score
    dashboard.registrar_predicao("FPSO-123", prediction)
    
    # Automatic alert if risk > 60% triggers Smart Workflow action
"""

from .forecast_engine import ForecastEngine
from .forecast_trainer import ForecastTrainer
from .forecast_dashboard import ForecastDashboard

__version__ = "1.0.0"
__all__ = ["ForecastEngine", "ForecastTrainer", "ForecastDashboard"]
