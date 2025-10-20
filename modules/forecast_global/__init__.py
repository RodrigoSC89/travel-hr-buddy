"""
Forecast Global Module - AI-Powered Fleet Risk Prediction
==========================================================

Forecast Global is an AI-powered risk prediction system that learns from
all vessels in the fleet using machine learning models.

Components:
- forecast_engine: Machine Learning prediction engine
- forecast_trainer: Continuous learning system
- forecast_dashboard: Fleet visualization and alerting

Author: PEO-DP Inteligente System
Version: 1.0.0
License: MIT
"""

# Optional imports (require scikit-learn, pandas)
try:
    from .forecast_engine import ForecastEngine
    from .forecast_trainer import ForecastTrainer
    from .forecast_dashboard import ForecastDashboard
    
    __all__ = [
        'ForecastEngine',
        'ForecastTrainer',
        'ForecastDashboard'
    ]
except ImportError as e:
    # Allow module to be imported even if dependencies aren't installed
    __all__ = []
    import warnings
    warnings.warn(f"Forecast Global requires additional dependencies: {e}")

__version__ = "1.0.0"
