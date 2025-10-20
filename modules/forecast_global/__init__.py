"""
Forecast Global Module
=======================
Sistema de previsão baseado em aprendizado coletivo de frota.

Componentes:
- ForecastEngine: Motor de ML para previsão de riscos
- ForecastTrainer: Sistema de treinamento contínuo
- ForecastDashboard: Visualização e alertas

Exemplo de uso:
    from forecast_global import ForecastEngine, ForecastTrainer, ForecastDashboard
    
    # Criar engine
    engine = ForecastEngine()
    
    # Treinar modelo
    engine.treinar("dataset.csv")
    
    # Fazer previsão
    resultado = engine.prever([2400, 3, 1, 85])
    print(f"Risco: {resultado['risco_percentual']}%")
    
    # Dashboard
    dashboard = ForecastDashboard(engine)
    metricas = dashboard.get_metricas_frota()
"""

from .forecast_engine import ForecastEngine
from .forecast_trainer import ForecastTrainer
from .forecast_dashboard import ForecastDashboard

__version__ = "1.0.0"
__all__ = ['ForecastEngine', 'ForecastTrainer', 'ForecastDashboard']
