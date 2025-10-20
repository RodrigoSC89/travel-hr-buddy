"""
Forecast Global - Fleet Visualization and Alerting Dashboard
Real-time fleet monitoring and risk alerting system

Features:
- Aggregated fleet-wide metrics
- Per-vessel historical tracking
- Risk trend analysis (increasing/stable/decreasing)
- Vessel comparison tools
- Automatic alert generation when risk exceeds threshold
- CSV report export functionality
- Executive summary generation
"""

import logging
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from pathlib import Path
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ForecastDashboard:
    """
    Fleet monitoring dashboard with risk visualization and alerting.
    
    Provides comprehensive fleet-wide risk analysis and generates
    automatic alerts when vessels exceed risk thresholds.
    """
    
    def __init__(
        self,
        forecast_engine,
        alert_threshold: float = 60.0,
        history_file: str = "forecast_history.csv"
    ):
        """
        Initialize ForecastDashboard.
        
        Args:
            forecast_engine: ForecastEngine instance for predictions
            alert_threshold: Risk percentage threshold for alerts (default: 60%)
            history_file: CSV file for storing prediction history
        """
        self.engine = forecast_engine
        self.alert_threshold = alert_threshold
        self.history_file = Path(history_file)
        self.alerts: List[Dict[str, Any]] = []
        
        # Initialize history file if it doesn't exist
        if not self.history_file.exists():
            self._create_history_file()
        
        logger.info(f"ForecastDashboard initialized (alert threshold: {alert_threshold}%)")
    
    def _create_history_file(self):
        """Create empty history file with proper schema."""
        df = pd.DataFrame(columns=[
            "embarcacao",
            "timestamp",
            "horas_dp",
            "falhas_mensais",
            "eventos_asog",
            "score_peodp",
            "risco_percentual",
            "nivel_risco",
            "alerta_gerado"
        ])
        
        df.to_csv(self.history_file, index=False)
        logger.info(f"Created history file at {self.history_file}")
    
    def registrar_predicao(
        self,
        embarcacao: str,
        predicao: Dict[str, Any],
        auto_alert: bool = True
    ) -> Dict[str, Any]:
        """
        Register a prediction in history and check for alerts.
        
        Args:
            embarcacao: Vessel identifier
            predicao: Prediction dictionary from ForecastEngine
            auto_alert: Whether to automatically generate alerts
            
        Returns:
            Dictionary with registration results
        """
        # Load history
        df = pd.read_csv(self.history_file)
        
        # Create new record
        features = predicao['features']
        new_record = {
            "embarcacao": embarcacao,
            "timestamp": datetime.now().isoformat(),
            "horas_dp": features.get('horas_dp'),
            "falhas_mensais": features.get('falhas_mensais'),
            "eventos_asog": features.get('eventos_asog'),
            "score_peodp": features.get('score_peodp'),
            "risco_percentual": predicao['risco_percentual'],
            "nivel_risco": predicao['nivel_risco'],
            "alerta_gerado": False
        }
        
        # Check if alert should be generated
        alert_generated = False
        alert_details = None
        
        if auto_alert and predicao['risco_percentual'] > self.alert_threshold:
            alert_details = self._gerar_alerta(embarcacao, predicao)
            new_record['alerta_gerado'] = True
            alert_generated = True
        
        # Append to history
        df = pd.concat([df, pd.DataFrame([new_record])], ignore_index=True)
        df.to_csv(self.history_file, index=False)
        
        logger.info(f"Prediction registered for {embarcacao}: {predicao['risco_percentual']}% ({predicao['nivel_risco']})")
        
        if alert_generated:
            logger.warning(f"⚠️ Alert generated for {embarcacao} (risk: {predicao['risco_percentual']}%)")
        
        return {
            "registered": True,
            "embarcacao": embarcacao,
            "risco_percentual": predicao['risco_percentual'],
            "nivel_risco": predicao['nivel_risco'],
            "alert_generated": alert_generated,
            "alert_details": alert_details
        }
    
    def _gerar_alerta(self, embarcacao: str, predicao: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate alert for high-risk vessel.
        
        Args:
            embarcacao: Vessel identifier
            predicao: Prediction dictionary
            
        Returns:
            Alert details dictionary
        """
        alert = {
            "id": f"alert_{datetime.now().timestamp()}",
            "timestamp": datetime.now().isoformat(),
            "embarcacao": embarcacao,
            "risco_percentual": predicao['risco_percentual'],
            "nivel_risco": predicao['nivel_risco'],
            "recomendacao": predicao['recomendacao'],
            "features": predicao['features'],
            "tipo": "risk_threshold_exceeded",
            "severidade": self._get_alert_severity(predicao['risco_percentual'])
        }
        
        self.alerts.append(alert)
        
        return alert
    
    def _get_alert_severity(self, risco_percentual: float) -> str:
        """Determine alert severity based on risk percentage."""
        if risco_percentual >= 80:
            return "CRITICAL"
        elif risco_percentual >= 70:
            return "HIGH"
        else:
            return "MEDIUM"
    
    def obter_alertas_ativos(self) -> List[Dict[str, Any]]:
        """
        Get active alerts from recent history.
        
        Returns:
            List of active alert dictionaries
        """
        return self.alerts.copy()
    
    def obter_metricas_frota(self) -> Dict[str, Any]:
        """
        Get aggregated fleet-wide metrics.
        
        Returns:
            Dictionary with fleet metrics
        """
        df = pd.read_csv(self.history_file)
        
        if df.empty:
            return {
                "total_embarcacoes": 0,
                "predicoes_total": 0,
                "risco_medio": 0,
                "embarcacoes_alto_risco": 0
            }
        
        # Get unique vessels
        embarcacoes = df['embarcacao'].unique()
        
        # Calculate metrics
        metrics = {
            "total_embarcacoes": len(embarcacoes),
            "predicoes_total": len(df),
            "risco_medio": float(df['risco_percentual'].mean()),
            "risco_max": float(df['risco_percentual'].max()),
            "risco_min": float(df['risco_percentual'].min()),
            "embarcacoes_alto_risco": len(df[df['risco_percentual'] > self.alert_threshold]['embarcacao'].unique()),
            "alertas_gerados": int(df['alerta_gerado'].sum()),
            "timestamp": datetime.now().isoformat()
        }
        
        # Distribution by risk level
        risk_distribution = df['nivel_risco'].value_counts().to_dict()
        metrics['distribuicao_risco'] = risk_distribution
        
        return metrics
    
    def obter_historico_embarcacao(
        self,
        embarcacao: str,
        dias: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get historical predictions for a specific vessel.
        
        Args:
            embarcacao: Vessel identifier
            dias: Number of days of history to retrieve
            
        Returns:
            List of historical prediction dictionaries
        """
        df = pd.read_csv(self.history_file)
        
        # Filter by vessel
        df = df[df['embarcacao'] == embarcacao]
        
        # Filter by date
        cutoff_date = datetime.now() - timedelta(days=dias)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df[df['timestamp'] >= cutoff_date]
        
        # Sort by timestamp
        df = df.sort_values('timestamp', ascending=False)
        
        # Convert to list of dictionaries
        history = df.to_dict('records')
        
        # Convert timestamps back to strings
        for record in history:
            record['timestamp'] = record['timestamp'].isoformat()
        
        return history
    
    def analisar_tendencia(self, embarcacao: str, janela: int = 7) -> Dict[str, Any]:
        """
        Analyze risk trend for a vessel.
        
        Args:
            embarcacao: Vessel identifier
            janela: Number of recent predictions to analyze
            
        Returns:
            Dictionary with trend analysis
        """
        historico = self.obter_historico_embarcacao(embarcacao, dias=30)
        
        if len(historico) < 2:
            return {
                "embarcacao": embarcacao,
                "tendencia": "insufficient_data",
                "predicoes_analisadas": len(historico)
            }
        
        # Get recent predictions (limited by window)
        recent = historico[:min(janela, len(historico))]
        
        # Calculate trend
        riscos = [p['risco_percentual'] for p in recent]
        
        # Simple linear trend
        if len(riscos) >= 2:
            # Compare first and last values
            delta = riscos[0] - riscos[-1]  # Recent - oldest
            
            if delta > 5:
                tendencia = "increasing"
            elif delta < -5:
                tendencia = "decreasing"
            else:
                tendencia = "stable"
        else:
            tendencia = "unknown"
        
        analysis = {
            "embarcacao": embarcacao,
            "tendencia": tendencia,
            "predicoes_analisadas": len(recent),
            "risco_atual": riscos[0] if riscos else 0,
            "risco_medio_janela": sum(riscos) / len(riscos) if riscos else 0,
            "variacao_percentual": delta if len(riscos) >= 2 else 0,
            "timestamp": datetime.now().isoformat()
        }
        
        return analysis
    
    def comparar_embarcacoes(self, embarcacoes: List[str]) -> Dict[str, Any]:
        """
        Compare risk profiles across multiple vessels.
        
        Args:
            embarcacoes: List of vessel identifiers
            
        Returns:
            Dictionary with comparison results
        """
        df = pd.read_csv(self.history_file)
        
        comparisons = {}
        
        for embarcacao in embarcacoes:
            vessel_data = df[df['embarcacao'] == embarcacao]
            
            if vessel_data.empty:
                comparisons[embarcacao] = {
                    "risco_medio": 0,
                    "predicoes": 0,
                    "status": "no_data"
                }
            else:
                # Get latest prediction
                latest = vessel_data.iloc[-1]
                
                comparisons[embarcacao] = {
                    "risco_atual": float(latest['risco_percentual']),
                    "nivel_risco": latest['nivel_risco'],
                    "risco_medio": float(vessel_data['risco_percentual'].mean()),
                    "predicoes": len(vessel_data),
                    "status": "ok"
                }
        
        # Rank vessels by current risk
        ranked = sorted(
            [(k, v.get('risco_atual', 0)) for k, v in comparisons.items()],
            key=lambda x: x[1],
            reverse=True
        )
        
        return {
            "comparacoes": comparisons,
            "ranking": [{"embarcacao": k, "risco": v} for k, v in ranked],
            "timestamp": datetime.now().isoformat()
        }
    
    def exportar_relatorio_csv(self, output_path: str) -> str:
        """
        Export comprehensive report to CSV.
        
        Args:
            output_path: Path for output CSV file
            
        Returns:
            Path to generated file
        """
        df = pd.read_csv(self.history_file)
        
        # Add additional computed columns
        df['above_threshold'] = df['risco_percentual'] > self.alert_threshold
        
        # Export
        df.to_csv(output_path, index=False)
        
        logger.info(f"Report exported to {output_path}")
        
        return output_path
    
    def gerar_sumario_executivo(self) -> str:
        """
        Generate executive summary text.
        
        Returns:
            Formatted summary text
        """
        metrics = self.obter_metricas_frota()
        
        summary = f"""
╔══════════════════════════════════════════════════════════════╗
║          FORECAST GLOBAL - SUMÁRIO EXECUTIVO DA FROTA        ║
╚══════════════════════════════════════════════════════════════╝

Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

MÉTRICAS GERAIS:
• Total de Embarcações: {metrics['total_embarcacoes']}
• Total de Predições: {metrics['predicoes_total']}
• Risco Médio da Frota: {metrics['risco_medio']:.2f}%
• Risco Máximo Detectado: {metrics.get('risco_max', 0):.2f}%

ALERTAS E RISCOS ELEVADOS:
• Embarcações com Risco Alto (>{self.alert_threshold}%): {metrics['embarcacoes_alto_risco']}
• Alertas Gerados: {metrics['alertas_gerados']}
• Threshold de Alerta: {self.alert_threshold}%

DISTRIBUIÇÃO DE RISCO:
"""
        
        dist = metrics.get('distribuicao_risco', {})
        for nivel, count in dist.items():
            summary += f"• {nivel.upper()}: {count} registros\n"
        
        summary += "\n"
        
        # Recent alerts
        if self.alerts:
            summary += "ALERTAS RECENTES:\n"
            for alert in self.alerts[-5:]:  # Last 5 alerts
                summary += f"• {alert['embarcacao']}: {alert['risco_percentual']:.1f}% - {alert['severidade']}\n"
        else:
            summary += "ALERTAS RECENTES: Nenhum\n"
        
        summary += "\n" + "═" * 64 + "\n"
        
        return summary


# Example usage
if __name__ == "__main__":
    from forecast_engine import ForecastEngine
    
    # Initialize components
    engine = ForecastEngine(model_type="random_forest")
    dashboard = ForecastDashboard(
        forecast_engine=engine,
        alert_threshold=60.0
    )
    
    # Example: Register prediction
    # prediction = engine.prever([2400, 3, 1, 85])
    # result = dashboard.registrar_predicao("FPSO-123", prediction)
    
    # Get fleet metrics
    metrics = dashboard.obter_metricas_frota()
    print(f"Fleet metrics: {metrics}")
    
    # Generate executive summary
    summary = dashboard.gerar_sumario_executivo()
    print(summary)
