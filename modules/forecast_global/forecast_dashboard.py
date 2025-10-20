"""
Forecast Global Dashboard - Fleet Visualization and Alerting
=============================================================

Provides fleet-wide visualization, trend analysis, and automatic alerting
for risk management.

Features:
- Aggregated fleet-wide metrics
- Per-vessel historical tracking
- Risk trend analysis (increasing/stable/decreasing)
- Vessel comparison tools
- Automatic alert generation when risk exceeds threshold
- CSV report export
- Executive summary generation

Author: PEO-DP Inteligente System
Version: 1.0.0
License: MIT
"""

import logging
import pandas as pd
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import json


class ForecastDashboard:
    """
    Fleet visualization and alerting dashboard.
    
    Tracks predictions across all vessels, analyzes trends, and generates
    alerts when risk thresholds are exceeded.
    """
    
    def __init__(self, engine=None, alert_threshold: float = 60.0,
                 history_path: str = "forecast_history.csv"):
        """
        Initialize ForecastDashboard.
        
        Args:
            engine: ForecastEngine instance
            alert_threshold: Risk threshold for automatic alerts (0-100)
            history_path: Path to CSV file for storing prediction history
        """
        self.engine = engine
        self.alert_threshold = alert_threshold
        self.history_path = history_path
        
        # Configure logging
        self.logger = logging.getLogger('ForecastDashboard')
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
        
        self.logger.info(f"ForecastDashboard initialized: alert threshold={alert_threshold}%")
    
    def registrar_predicao(self, vessel_id: str, prediction: Dict[str, Any],
                          metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Register a prediction in the history.
        
        Args:
            vessel_id: Vessel identifier
            prediction: Prediction result from ForecastEngine
            metadata: Additional metadata (crew, location, etc.)
            
        Returns:
            Dict with registration result and alert status
        """
        try:
            # Prepare history record
            record = {
                'timestamp': datetime.now().isoformat(),
                'vessel_id': vessel_id,
                'risk_probability': prediction.get('risk_probability', 0),
                'risk_class': prediction.get('risk_class', 'unknown'),
                'confidence': prediction.get('confidence', 0)
            }
            
            # Add metadata if provided
            if metadata:
                record.update(metadata)
            
            # Append to history file
            df_new = pd.DataFrame([record])
            
            if os.path.exists(self.history_path):
                df = pd.read_csv(self.history_path)
                df = pd.concat([df, df_new], ignore_index=True)
            else:
                df = df_new
            
            df.to_csv(self.history_path, index=False)
            
            # Check if alert should be generated
            alert_generated = False
            alert_message = None
            
            if prediction.get('risk_probability', 0) > self.alert_threshold:
                alert_generated = True
                alert_message = self._gerar_alerta(vessel_id, prediction)
                self.logger.warning(f"ALERT: {vessel_id} - Risk {prediction['risk_probability']:.1f}% exceeds threshold {self.alert_threshold}%")
            
            self.logger.info(f"Prediction registered for {vessel_id}: {prediction.get('risk_class')} ({prediction.get('risk_probability')}%)")
            
            return {
                'success': True,
                'alert_generated': alert_generated,
                'alert_message': alert_message,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to register prediction: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _gerar_alerta(self, vessel_id: str, prediction: Dict[str, Any]) -> str:
        """Generate alert message for high risk"""
        risk_prob = prediction.get('risk_probability', 0)
        risk_class = prediction.get('risk_class', 'unknown')
        
        return (
            f"⚠️ ALERTA DE RISCO ELEVADO ⚠️\n"
            f"Embarcação: {vessel_id}\n"
            f"Nível de Risco: {risk_class.upper()}\n"
            f"Probabilidade: {risk_prob:.1f}%\n"
            f"Ação: Iniciar procedimento de ação corretiva via Smart Workflow\n"
            f"Timestamp: {datetime.now().isoformat()}"
        )
    
    def obter_metricas_frota(self, days: int = 30) -> Dict[str, Any]:
        """
        Get aggregated fleet-wide metrics.
        
        Args:
            days: Number of days to analyze
            
        Returns:
            Dict with fleet metrics
        """
        if not os.path.exists(self.history_path):
            return {
                'success': False,
                'error': 'No history data available',
                'timestamp': datetime.now().isoformat()
            }
        
        try:
            df = pd.read_csv(self.history_path)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Filter by date range
            cutoff_date = datetime.now() - timedelta(days=days)
            df_recent = df[df['timestamp'] >= cutoff_date]
            
            if len(df_recent) == 0:
                return {
                    'success': False,
                    'error': 'No data in specified time range',
                    'timestamp': datetime.now().isoformat()
                }
            
            # Calculate metrics
            metrics = {
                'total_predictions': len(df_recent),
                'unique_vessels': df_recent['vessel_id'].nunique(),
                'avg_risk_probability': float(df_recent['risk_probability'].mean()),
                'max_risk_probability': float(df_recent['risk_probability'].max()),
                'min_risk_probability': float(df_recent['risk_probability'].min()),
                'alerts_generated': len(df_recent[df_recent['risk_probability'] > self.alert_threshold]),
                'risk_distribution': df_recent['risk_class'].value_counts().to_dict(),
                'period_days': days,
                'timestamp': datetime.now().isoformat()
            }
            
            self.logger.info(f"Fleet metrics calculated: {metrics['total_predictions']} predictions, {metrics['unique_vessels']} vessels")
            
            return {
                'success': True,
                'metrics': metrics,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to calculate fleet metrics: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def obter_historico_embarcacao(self, vessel_id: str, days: int = 30) -> Dict[str, Any]:
        """
        Get historical predictions for a specific vessel.
        
        Args:
            vessel_id: Vessel identifier
            days: Number of days to retrieve
            
        Returns:
            Dict with vessel history
        """
        if not os.path.exists(self.history_path):
            return {
                'success': False,
                'error': 'No history data available',
                'timestamp': datetime.now().isoformat()
            }
        
        try:
            df = pd.read_csv(self.history_path)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Filter by vessel and date
            cutoff_date = datetime.now() - timedelta(days=days)
            df_vessel = df[(df['vessel_id'] == vessel_id) & (df['timestamp'] >= cutoff_date)]
            
            if len(df_vessel) == 0:
                return {
                    'success': False,
                    'error': f'No data found for vessel {vessel_id}',
                    'timestamp': datetime.now().isoformat()
                }
            
            # Sort by timestamp
            df_vessel = df_vessel.sort_values('timestamp')
            
            # Convert to list of dicts
            history = df_vessel.to_dict('records')
            
            # Convert timestamps to strings
            for record in history:
                record['timestamp'] = record['timestamp'].isoformat()
            
            self.logger.info(f"Retrieved {len(history)} predictions for {vessel_id}")
            
            return {
                'success': True,
                'vessel_id': vessel_id,
                'predictions': history,
                'count': len(history),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to retrieve vessel history: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def analisar_tendencia(self, vessel_id: str, days: int = 30) -> Dict[str, Any]:
        """
        Analyze risk trend for a vessel.
        
        Args:
            vessel_id: Vessel identifier
            days: Number of days to analyze
            
        Returns:
            Dict with trend analysis (increasing/stable/decreasing)
        """
        history_result = self.obter_historico_embarcacao(vessel_id, days)
        
        if not history_result.get('success'):
            return history_result
        
        predictions = history_result['predictions']
        
        if len(predictions) < 2:
            return {
                'success': False,
                'error': 'Insufficient data for trend analysis (need at least 2 predictions)',
                'timestamp': datetime.now().isoformat()
            }
        
        # Calculate trend
        risk_values = [p['risk_probability'] for p in predictions]
        
        # Simple linear regression
        n = len(risk_values)
        x = list(range(n))
        x_mean = sum(x) / n
        y_mean = sum(risk_values) / n
        
        numerator = sum((x[i] - x_mean) * (risk_values[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        
        if denominator == 0:
            slope = 0
        else:
            slope = numerator / denominator
        
        # Classify trend
        if abs(slope) < 0.5:
            trend = "stable"
        elif slope > 0:
            trend = "increasing"
        else:
            trend = "decreasing"
        
        return {
            'success': True,
            'vessel_id': vessel_id,
            'trend': trend,
            'slope': round(slope, 3),
            'predictions_analyzed': n,
            'current_risk': risk_values[-1],
            'avg_risk': round(sum(risk_values) / n, 2),
            'timestamp': datetime.now().isoformat()
        }
    
    def comparar_embarcacoes(self, vessel_ids: List[str], days: int = 30) -> Dict[str, Any]:
        """
        Compare risk metrics across multiple vessels.
        
        Args:
            vessel_ids: List of vessel identifiers
            days: Number of days to compare
            
        Returns:
            Dict with comparison data
        """
        comparisons = {}
        
        for vessel_id in vessel_ids:
            history = self.obter_historico_embarcacao(vessel_id, days)
            
            if history.get('success'):
                predictions = history['predictions']
                risk_values = [p['risk_probability'] for p in predictions]
                
                comparisons[vessel_id] = {
                    'count': len(predictions),
                    'avg_risk': round(sum(risk_values) / len(risk_values), 2) if risk_values else 0,
                    'max_risk': max(risk_values) if risk_values else 0,
                    'min_risk': min(risk_values) if risk_values else 0,
                    'latest_risk': risk_values[-1] if risk_values else 0
                }
        
        return {
            'success': True,
            'comparisons': comparisons,
            'vessels_compared': len(comparisons),
            'timestamp': datetime.now().isoformat()
        }
    
    def exportar_relatorio_csv(self, output_path: str, days: int = 30) -> Dict[str, Any]:
        """
        Export fleet report to CSV.
        
        Args:
            output_path: Path for output CSV file
            days: Number of days to include
            
        Returns:
            Dict with export result
        """
        try:
            df = pd.read_csv(self.history_path)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Filter by date
            cutoff_date = datetime.now() - timedelta(days=days)
            df_export = df[df['timestamp'] >= cutoff_date]
            
            # Save to CSV
            df_export.to_csv(output_path, index=False)
            
            self.logger.info(f"Report exported to {output_path}: {len(df_export)} records")
            
            return {
                'success': True,
                'records_exported': len(df_export),
                'output_path': output_path,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Export failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def gerar_resumo_executivo(self, days: int = 7) -> str:
        """
        Generate executive summary report.
        
        Args:
            days: Number of days to summarize
            
        Returns:
            Formatted executive summary string
        """
        metrics_result = self.obter_metricas_frota(days)
        
        if not metrics_result.get('success'):
            return f"Unable to generate summary: {metrics_result.get('error')}"
        
        metrics = metrics_result['metrics']
        
        summary = f"""
╔════════════════════════════════════════════════════════════════╗
║           FORECAST GLOBAL - RESUMO EXECUTIVO                   ║
╟────────────────────────────────────────────────────────────────╢
║ Período: Últimos {days} dias                                      
║ Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}
╟────────────────────────────────────────────────────────────────╢
║ MÉTRICAS DA FROTA:
║ • Total de Previsões: {metrics['total_predictions']}
║ • Embarcações Monitoradas: {metrics['unique_vessels']}
║ • Risco Médio da Frota: {metrics['avg_risk_probability']:.1f}%
║ • Risco Máximo Detectado: {metrics['max_risk_probability']:.1f}%
║ • Alertas Gerados: {metrics['alerts_generated']}
╟────────────────────────────────────────────────────────────────╢
║ DISTRIBUIÇÃO DE RISCO:
"""
        
        for risk_class, count in metrics.get('risk_distribution', {}).items():
            summary += f"║ • {risk_class.capitalize()}: {count} ({count/metrics['total_predictions']*100:.1f}%)\n"
        
        summary += """╚════════════════════════════════════════════════════════════════╝
"""
        
        return summary


# Example usage
if __name__ == "__main__":
    import os
    from forecast_engine import ForecastEngine
    
    # Initialize components
    engine = ForecastEngine(model_type="random_forest")
    dashboard = ForecastDashboard(engine=engine, alert_threshold=60.0)
    
    # Register some test predictions
    print("Registering test predictions...")
    
    test_vessels = ["FPSO-123", "FPSO-456", "FPSO-789"]
    
    for vessel in test_vessels:
        prediction = {
            'risk_probability': 55.0 + (hash(vessel) % 30),
            'risk_class': 'medio',
            'confidence': 85.0
        }
        
        result = dashboard.registrar_predicao(vessel, prediction)
        print(f"{vessel}: Alert={result.get('alert_generated')}")
    
    # Get fleet metrics
    print("\nFleet Metrics:")
    metrics = dashboard.obter_metricas_frota(days=30)
    print(json.dumps(metrics, indent=2))
    
    # Generate executive summary
    print("\nExecutive Summary:")
    print(dashboard.gerar_resumo_executivo(days=7))
