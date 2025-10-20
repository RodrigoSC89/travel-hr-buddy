"""
Risk Forecast module for Nautilus One
Analyzes and forecasts potential risks
"""
from datetime import datetime, timedelta
from core.logger import log_event
import random


class RiskForecast:
    """
    Module for risk forecasting and prediction
    """
    
    def __init__(self):
        self.forecast_data = []
        self.start_time = None
        
    def analyze(self):
        """
        Performs risk forecast analysis
        """
        self.start_time = datetime.now()
        log_event("Iniciando Forecast de Risco")
        
        print("\n📈 Forecast de Risco - Análise Preditiva")
        print("=" * 80)
        
        self._analyze_historical_data()
        self._predict_future_risks()
        self._generate_risk_matrix()
        self._provide_recommendations()
        
        log_event("Forecast de Risco concluído")
        print("\n✅ Análise de Forecast concluída com sucesso")
        print(f"⏱️  Tempo de execução: {(datetime.now() - self.start_time).seconds}s")
    
    def _analyze_historical_data(self):
        """
        Analyzes historical risk data
        """
        print("\n📊 Analisando dados históricos...")
        
        # Simulate historical data analysis
        periods = ["Último mês", "Últimos 3 meses", "Últimos 6 meses", "Último ano"]
        
        for period in periods:
            incidents = random.randint(0, 10)
            severity = random.choice(["Baixa", "Média", "Alta"])
            print(f"  • {period}: {incidents} incidentes (Severidade: {severity})")
        
        log_event("Dados históricos analisados")
    
    def _predict_future_risks(self):
        """
        Predicts future risk scenarios
        """
        print("\n🔮 Previsão de riscos para os próximos períodos...")
        
        risk_categories = [
            "Operacional",
            "Ambiental",
            "Equipamento",
            "Humano",
            "Regulatório"
        ]
        
        current_date = datetime.now()
        
        for i, category in enumerate(risk_categories, 1):
            probability = random.randint(10, 90)
            impact = random.choice(["Baixo", "Médio", "Alto", "Crítico"])
            forecast_date = current_date + timedelta(days=random.randint(7, 90))
            
            risk_data = {
                "id": i,
                "category": category,
                "probability": probability,
                "impact": impact,
                "forecast_date": forecast_date.strftime("%d/%m/%Y")
            }
            
            self.forecast_data.append(risk_data)
            
            print(f"  {i}. {category}:")
            print(f"     Probabilidade: {probability}%")
            print(f"     Impacto: {impact}")
            print(f"     Data estimada: {risk_data['forecast_date']}")
        
        log_event(f"Previsão de {len(risk_categories)} categorias de risco")
    
    def _generate_risk_matrix(self):
        """
        Generates risk priority matrix
        """
        print("\n📋 Matriz de Prioridade de Risco:")
        print("-" * 80)
        
        # Sort by probability (descending)
        sorted_risks = sorted(self.forecast_data, 
                             key=lambda x: x["probability"], 
                             reverse=True)
        
        print(f"{'Categoria':<15} {'Probabilidade':<15} {'Impacto':<15} {'Prioridade'}")
        print("-" * 80)
        
        for risk in sorted_risks:
            priority = self._calculate_priority(risk)
            print(f"{risk['category']:<15} {risk['probability']}%{'':<10} "
                  f"{risk['impact']:<15} {priority}")
        
        log_event("Matriz de risco gerada")
    
    def _calculate_priority(self, risk):
        """
        Calculates priority level based on probability and impact
        """
        prob = risk["probability"]
        impact = risk["impact"]
        
        if prob > 70 and impact in ["Alto", "Crítico"]:
            return "🔴 Crítica"
        elif prob > 50 and impact in ["Médio", "Alto", "Crítico"]:
            return "🟡 Alta"
        elif prob > 30:
            return "🟢 Média"
        else:
            return "⚪ Baixa"
    
    def _provide_recommendations(self):
        """
        Provides recommendations based on forecast
        """
        print("\n💡 Recomendações Estratégicas:")
        print("-" * 80)
        
        high_risk_count = sum(1 for r in self.forecast_data 
                             if r["probability"] > 50)
        
        if high_risk_count > 0:
            print(f"  ⚠️ {high_risk_count} categoria(s) de risco com alta probabilidade")
            print("  📌 Ações recomendadas:")
            print("     1. Revisar e atualizar procedimentos de mitigação")
            print("     2. Intensificar treinamentos preventivos")
            print("     3. Aumentar frequência de inspeções")
            print("     4. Preparar planos de contingência")
        else:
            print("  ✅ Nível geral de risco dentro do aceitável")
            print("  📌 Manter monitoramento contínuo")
        
        log_event(f"Recomendações geradas para forecast de risco")
