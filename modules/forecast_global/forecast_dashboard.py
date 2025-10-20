"""
Forecast Global Dashboard
=========================
Interface de visualização e alertas para o sistema Forecast Global.
Fornece métricas, gráficos e alertas de risco por embarcação e frota.

Funcionalidades:
- Painel de métricas em tempo real
- Visualização de tendências de risco
- Alertas automáticos quando risco > 60%
- Comparação entre embarcações
- Exportação de relatórios
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
import json
from pathlib import Path
from forecast_engine import ForecastEngine

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ForecastDashboard:
    """
    Dashboard de visualização e alertas do Forecast Global.
    
    Attributes:
        engine (ForecastEngine): Engine de previsão
        alert_threshold (float): Threshold de risco para alertas (0-100)
        data_dir (str): Diretório para dados do dashboard
    """
    
    def __init__(
        self,
        engine: ForecastEngine,
        alert_threshold: float = 60.0,
        data_dir: str = "data/dashboard"
    ):
        """
        Inicializa o dashboard.
        
        Args:
            engine: Instância do ForecastEngine
            alert_threshold: Threshold de risco para alertas (%)
            data_dir: Diretório para dados do dashboard
        """
        self.engine = engine
        self.alert_threshold = alert_threshold
        self.data_dir = Path(data_dir)
        
        # Criar diretório se não existir
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Arquivo de histórico de previsões
        self.predictions_log_path = self.data_dir / "predictions_log.json"
        self.predictions_log = self._load_predictions_log()
        
        logger.info(f"ForecastDashboard inicializado: threshold={alert_threshold}%")
    
    def _load_predictions_log(self) -> List[Dict[str, Any]]:
        """Carrega histórico de previsões."""
        if self.predictions_log_path.exists():
            with open(self.predictions_log_path, 'r') as f:
                return json.load(f)
        return []
    
    def _save_predictions_log(self):
        """Salva histórico de previsões."""
        with open(self.predictions_log_path, 'w') as f:
            json.dump(self.predictions_log, f, indent=2)
    
    def registrar_predicao(
        self,
        embarcacao: str,
        predicao: Dict[str, Any]
    ):
        """
        Registra uma predição no histórico.
        
        Args:
            embarcacao: Identificação da embarcação
            predicao: Resultado da predição do engine
        """
        registro = {
            "embarcacao": embarcacao,
            "timestamp": datetime.now().isoformat(),
            "risco_percentual": predicao["risco_percentual"],
            "nivel_risco": predicao["nivel_risco"],
            "features": predicao["features"]
        }
        
        self.predictions_log.append(registro)
        self._save_predictions_log()
        
        # Verificar se precisa gerar alerta
        if predicao["risco_percentual"] > self.alert_threshold:
            self._gerar_alerta(embarcacao, predicao)
    
    def _gerar_alerta(
        self,
        embarcacao: str,
        predicao: Dict[str, Any]
    ):
        """
        Gera alerta quando risco excede threshold.
        
        Args:
            embarcacao: Identificação da embarcação
            predicao: Resultado da predição
        """
        alerta = {
            "tipo": "risco_elevado",
            "embarcacao": embarcacao,
            "timestamp": datetime.now().isoformat(),
            "risco_percentual": predicao["risco_percentual"],
            "nivel_risco": predicao["nivel_risco"],
            "features": predicao["features"],
            "recomendacao": "Criar ação corretiva via Smart Workflow"
        }
        
        # Salvar alerta
        alertas_path = self.data_dir / "alertas.json"
        alertas = []
        if alertas_path.exists():
            with open(alertas_path, 'r') as f:
                alertas = json.load(f)
        
        alertas.append(alerta)
        
        with open(alertas_path, 'w') as f:
            json.dump(alertas, f, indent=2)
        
        logger.warning(
            f"⚠️ ALERTA: {embarcacao} - Risco {predicao['risco_percentual']}% "
            f"(nivel: {predicao['nivel_risco']})"
        )
    
    def get_metricas_frota(self) -> Dict[str, Any]:
        """
        Calcula métricas agregadas de toda a frota.
        
        Returns:
            Dicionário com métricas da frota
        """
        if not self.predictions_log:
            return {
                "total_embarcacoes": 0,
                "risco_medio": 0,
                "embarcacoes_em_risco": 0
            }
        
        # Converter para DataFrame
        df = pd.DataFrame(self.predictions_log)
        
        # Pegar predições mais recentes de cada embarcação
        df_latest = df.sort_values('timestamp').groupby('embarcacao').last()
        
        # Calcular métricas
        total_embarcacoes = len(df_latest)
        risco_medio = df_latest['risco_percentual'].mean()
        embarcacoes_em_risco = len(df_latest[df_latest['risco_percentual'] > self.alert_threshold])
        
        # Distribuição por nível de risco
        distribuicao_risco = df_latest['nivel_risco'].value_counts().to_dict()
        
        # Top 5 embarcações com maior risco
        top_risco = df_latest.nlargest(5, 'risco_percentual')[['risco_percentual', 'nivel_risco']].to_dict('index')
        
        return {
            "total_embarcacoes": total_embarcacoes,
            "risco_medio": round(risco_medio, 2),
            "embarcacoes_em_risco": embarcacoes_em_risco,
            "percentual_em_risco": round((embarcacoes_em_risco / total_embarcacoes * 100), 2),
            "distribuicao_risco": distribuicao_risco,
            "top_risco": top_risco,
            "timestamp": datetime.now().isoformat()
        }
    
    def get_historico_embarcacao(
        self,
        embarcacao: str,
        dias: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Obtém histórico de previsões de uma embarcação.
        
        Args:
            embarcacao: Identificação da embarcação
            dias: Número de dias de histórico
        
        Returns:
            Lista com histórico de previsões
        """
        # Filtrar por embarcação
        historico = [
            p for p in self.predictions_log
            if p['embarcacao'] == embarcacao
        ]
        
        # Filtrar por período
        cutoff_date = datetime.now() - timedelta(days=dias)
        historico = [
            p for p in historico
            if datetime.fromisoformat(p['timestamp']) > cutoff_date
        ]
        
        # Ordenar por timestamp
        historico.sort(key=lambda x: x['timestamp'])
        
        return historico
    
    def get_tendencia_risco(
        self,
        embarcacao: Optional[str] = None,
        dias: int = 30
    ) -> Dict[str, Any]:
        """
        Calcula tendência de risco (aumentando, estável, diminuindo).
        
        Args:
            embarcacao: Identificação da embarcação (None para frota toda)
            dias: Período para análise de tendência
        
        Returns:
            Dicionário com análise de tendência
        """
        # Filtrar dados
        if embarcacao:
            dados = self.get_historico_embarcacao(embarcacao, dias)
        else:
            cutoff_date = datetime.now() - timedelta(days=dias)
            dados = [
                p for p in self.predictions_log
                if datetime.fromisoformat(p['timestamp']) > cutoff_date
            ]
        
        if len(dados) < 2:
            return {
                "tendencia": "indefinida",
                "razao": "Dados insuficientes"
            }
        
        # Converter para DataFrame
        df = pd.DataFrame(dados)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values('timestamp')
        
        # Calcular média móvel
        df['risco_ma7'] = df['risco_percentual'].rolling(window=min(7, len(df))).mean()
        
        # Comparar início e fim do período
        risco_inicial = df.iloc[:3]['risco_percentual'].mean()
        risco_final = df.iloc[-3:]['risco_percentual'].mean()
        
        diferenca = risco_final - risco_inicial
        percentual_mudanca = (diferenca / risco_inicial * 100) if risco_inicial > 0 else 0
        
        # Classificar tendência
        if abs(percentual_mudanca) < 10:
            tendencia = "estavel"
            emoji = "➡️"
        elif percentual_mudanca > 0:
            tendencia = "aumentando"
            emoji = "📈"
        else:
            tendencia = "diminuindo"
            emoji = "📉"
        
        return {
            "tendencia": tendencia,
            "emoji": emoji,
            "risco_inicial": round(risco_inicial, 2),
            "risco_final": round(risco_final, 2),
            "diferenca": round(diferenca, 2),
            "percentual_mudanca": round(percentual_mudanca, 2),
            "periodo_dias": dias
        }
    
    def comparar_embarcacoes(
        self,
        embarcacoes: List[str]
    ) -> Dict[str, Any]:
        """
        Compara métricas entre embarcações.
        
        Args:
            embarcacoes: Lista de identificações de embarcações
        
        Returns:
            Dicionário com comparação
        """
        comparacao = {}
        
        for embarcacao in embarcacoes:
            # Obter última predição
            historico = self.get_historico_embarcacao(embarcacao, dias=1)
            
            if historico:
                ultima = historico[-1]
                comparacao[embarcacao] = {
                    "risco_percentual": ultima['risco_percentual'],
                    "nivel_risco": ultima['nivel_risco'],
                    "features": ultima['features'],
                    "timestamp": ultima['timestamp']
                }
            else:
                comparacao[embarcacao] = {
                    "risco_percentual": None,
                    "nivel_risco": "sem_dados",
                    "features": {},
                    "timestamp": None
                }
        
        # Ranking por risco
        embarcacoes_com_dados = {
            k: v for k, v in comparacao.items()
            if v['risco_percentual'] is not None
        }
        
        ranking = sorted(
            embarcacoes_com_dados.items(),
            key=lambda x: x[1]['risco_percentual'],
            reverse=True
        )
        
        return {
            "comparacao": comparacao,
            "ranking": [{"embarcacao": k, **v} for k, v in ranking],
            "timestamp": datetime.now().isoformat()
        }
    
    def gerar_relatorio_resumo(self) -> Dict[str, Any]:
        """
        Gera relatório resumido do status da frota.
        
        Returns:
            Dicionário com relatório resumido
        """
        # Métricas gerais
        metricas = self.get_metricas_frota()
        
        # Alertas ativos
        alertas_path = self.data_dir / "alertas.json"
        alertas_recentes = []
        if alertas_path.exists():
            with open(alertas_path, 'r') as f:
                alertas = json.load(f)
                # Filtrar últimas 24 horas
                cutoff = (datetime.now() - timedelta(hours=24)).isoformat()
                alertas_recentes = [
                    a for a in alertas
                    if a['timestamp'] > cutoff
                ]
        
        # Tendência geral da frota
        tendencia = self.get_tendencia_risco(dias=7)
        
        # Status por nível de risco
        status = {
            "total_embarcacoes": metricas["total_embarcacoes"],
            "risco_medio_frota": metricas["risco_medio"],
            "distribuicao": metricas.get("distribuicao_risco", {}),
            "embarcacoes_criticas": metricas.get("distribuicao_risco", {}).get("critico", 0),
            "embarcacoes_alta_risco": metricas.get("distribuicao_risco", {}).get("alto", 0),
            "percentual_em_risco": metricas["percentual_em_risco"]
        }
        
        return {
            "timestamp": datetime.now().isoformat(),
            "status_frota": status,
            "tendencia_7_dias": tendencia,
            "alertas_24h": len(alertas_recentes),
            "top_embarcacoes_risco": metricas.get("top_risco", {}),
            "recomendacoes": self._gerar_recomendacoes(metricas, tendencia)
        }
    
    def _gerar_recomendacoes(
        self,
        metricas: Dict[str, Any],
        tendencia: Dict[str, Any]
    ) -> List[str]:
        """
        Gera recomendações baseadas nas métricas e tendências.
        
        Args:
            metricas: Métricas da frota
            tendencia: Análise de tendência
        
        Returns:
            Lista de recomendações
        """
        recomendacoes = []
        
        # Baseado no percentual em risco
        if metricas["percentual_em_risco"] > 30:
            recomendacoes.append(
                f"⚠️ {metricas['percentual_em_risco']:.1f}% da frota em risco elevado. "
                "Revisar procedimentos operacionais."
            )
        
        # Baseado na tendência
        if tendencia["tendencia"] == "aumentando":
            recomendacoes.append(
                f"📈 Risco aumentando ({tendencia['percentual_mudanca']:+.1f}% em {tendencia['periodo_dias']} dias). "
                "Implementar ações preventivas."
            )
        
        # Baseado no risco médio
        if metricas["risco_medio"] > 50:
            recomendacoes.append(
                f"🔴 Risco médio da frota em {metricas['risco_medio']:.1f}%. "
                "Priorizar auditorias e treinamentos."
            )
        
        # Caso positivo
        if not recomendacoes:
            recomendacoes.append(
                "✅ Frota operando dentro de parâmetros normais. Manter monitoramento contínuo."
            )
        
        return recomendacoes
    
    def exportar_relatorio_csv(
        self,
        output_path: str,
        dias: int = 30
    ) -> str:
        """
        Exporta relatório em formato CSV.
        
        Args:
            output_path: Caminho do arquivo de saída
            dias: Período de dados para incluir
        
        Returns:
            Caminho do arquivo gerado
        """
        # Filtrar dados do período
        cutoff_date = datetime.now() - timedelta(days=dias)
        dados = [
            p for p in self.predictions_log
            if datetime.fromisoformat(p['timestamp']) > cutoff_date
        ]
        
        if not dados:
            logger.warning("Nenhum dado disponível para exportação")
            return None
        
        # Converter para DataFrame
        df = pd.DataFrame(dados)
        
        # Expandir features
        features_df = pd.json_normalize(df['features'])
        df = pd.concat([df.drop('features', axis=1), features_df], axis=1)
        
        # Salvar CSV
        df.to_csv(output_path, index=False)
        logger.info(f"✅ Relatório exportado: {output_path} ({len(df)} registros)")
        
        return output_path


if __name__ == "__main__":
    # Exemplo de uso
    print("📊 Forecast Global Dashboard - Exemplo de Uso")
    print("=" * 60)
    
    # Criar engine e dashboard
    engine = ForecastEngine()
    dashboard = ForecastDashboard(
        engine=engine,
        alert_threshold=60.0
    )
    
    # Simular algumas predições
    print("\n1. Simulando predições de embarcações...")
    embarcacoes = ["FPSO-123", "FPSO-456", "FPSO-789"]
    
    for embarcacao in embarcacoes:
        # Simular features aleatórias
        features = {
            "horas_dp": np.random.randint(1500, 3000),
            "falhas_mensais": np.random.randint(0, 8),
            "eventos_asog": np.random.randint(0, 3),
            "score_peodp": np.random.randint(65, 95)
        }
        
        # Simular predição
        predicao = {
            "risco_percentual": round(np.random.uniform(20, 90), 2),
            "nivel_risco": np.random.choice(["baixo", "medio", "alto", "critico"]),
            "features": features
        }
        
        dashboard.registrar_predicao(embarcacao, predicao)
        print(f"   ✓ {embarcacao}: Risco {predicao['risco_percentual']}%")
    
    # Métricas da frota
    print("\n2. Métricas da frota:")
    metricas = dashboard.get_metricas_frota()
    print(f"   Total de embarcações: {metricas['total_embarcacoes']}")
    print(f"   Risco médio: {metricas['risco_medio']}%")
    print(f"   Embarcações em risco: {metricas['embarcacoes_em_risco']}")
    
    # Relatório resumo
    print("\n3. Relatório resumo:")
    relatorio = dashboard.gerar_relatorio_resumo()
    print(f"   Status: {relatorio['status_frota']}")
    print(f"   Tendência: {relatorio['tendencia_7_dias']['tendencia']}")
    print(f"   Alertas (24h): {relatorio['alertas_24h']}")
    print("\n   Recomendações:")
    for rec in relatorio['recomendacoes']:
        print(f"   {rec}")
    
    print("\n" + "=" * 60)
    print("✅ Dashboard demonstrado com sucesso!")
