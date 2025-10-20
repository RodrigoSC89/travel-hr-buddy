"""
Módulo de Forecast de Risco Preditivo
Análise de tendência de RPN baseada em dados FMEA e ASOG

Versão: 1.0.0
Compatibilidade: Python 3.6+
Dependências: Somente bibliotecas padrão do Python
"""

import json
import statistics
import sys
import os
from datetime import datetime

# Add parent directory to path for standalone execution
if __name__ == "__main__":
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.logger import log


class RiskForecast:
    """
    Classe para análise preditiva de risco operacional baseada em:
    - FMEA (Failure Mode and Effects Analysis)
    - ASOG (Assurance of Operational Compliance)
    
    Calcula RPN médio, variabilidade e classifica o nível de risco.
    """
    
    def __init__(self, fmea_file="relatorio_fmea_atual.json", asog_file="asog_report.json"):
        """
        Inicializa o módulo de forecast de risco
        
        Args:
            fmea_file (str): Caminho para o arquivo JSON com dados FMEA
            asog_file (str): Caminho para o arquivo JSON com dados ASOG
        """
        self.fmea_file = fmea_file
        self.asog_file = asog_file
        self.dados_fmea = None
        self.dados_asog = None
        
    def carregar_dados(self):
        """
        Carrega dados históricos FMEA e ASOG dos arquivos JSON
        
        Returns:
            bool: True se carregamento bem-sucedido, False caso contrário
        """
        try:
            # Carregar FMEA
            with open(self.fmea_file, 'r', encoding='utf-8') as f:
                self.dados_fmea = json.load(f)
            
            # Carregar ASOG
            with open(self.asog_file, 'r', encoding='utf-8') as f:
                self.dados_asog = json.load(f)
                
            return True
        except FileNotFoundError as e:
            log(f"Erro: Arquivo não encontrado - {e}")
            return False
        except json.JSONDecodeError as e:
            log(f"Erro: JSON inválido - {e}")
            return False
            
    def calcular_rpn_medio(self):
        """
        Calcula o RPN médio de todos os sistemas analisados
        
        Returns:
            float: RPN médio ou 0 se não houver dados
        """
        if not self.dados_fmea or 'sistemas_analisados' not in self.dados_fmea:
            return 0
            
        rpns = [sistema['rpn'] for sistema in self.dados_fmea['sistemas_analisados']]
        
        if not rpns:
            return 0
            
        return statistics.mean(rpns)
        
    def calcular_variabilidade(self):
        """
        Calcula o desvio padrão dos valores RPN
        
        Returns:
            float: Desvio padrão ou 0 se não houver dados suficientes
        """
        if not self.dados_fmea or 'sistemas_analisados' not in self.dados_fmea:
            return 0
            
        rpns = [sistema['rpn'] for sistema in self.dados_fmea['sistemas_analisados']]
        
        if len(rpns) < 2:
            return 0
            
        return statistics.stdev(rpns)
        
    def classificar_risco(self, rpn_medio):
        """
        Classifica o nível de risco com base no RPN médio
        
        Critérios:
        - ALTA: RPN > 200 (requer ação imediata)
        - MODERADA: 150 < RPN <= 200 (intensificar monitoramento)
        - BAIXA: RPN <= 150 (operação normal)
        
        Args:
            rpn_medio (float): Valor do RPN médio
            
        Returns:
            str: Nível de risco (ALTA, MODERADA ou BAIXA)
        """
        if rpn_medio > 200:
            return "ALTA"
        elif rpn_medio > 150:
            return "MODERADA"
        else:
            return "BAIXA"
            
    def verificar_status_asog(self):
        """
        Verifica o status de conformidade operacional ASOG
        
        Returns:
            str: Status de conformidade (conforme, fora dos limites, sem dados)
        """
        if not self.dados_asog or 'parametros_operacionais' not in self.dados_asog:
            return "sem dados"
            
        parametros = self.dados_asog['parametros_operacionais']
        
        # Verifica se todos os parâmetros estão conformes
        todos_conformes = all(p.get('status') == 'conforme' for p in parametros)
        
        return "conforme" if todos_conformes else "fora dos limites"
        
    def gerar_recomendacao(self, risco, status_asog):
        """
        Gera recomendação automática baseada no risco e status ASOG
        
        Args:
            risco (str): Nível de risco (ALTA, MODERADA, BAIXA)
            status_asog (str): Status ASOG
            
        Returns:
            str: Recomendação contextual
        """
        if status_asog == "fora dos limites":
            return "🔴 ATENÇÃO: Não conformidade ASOG detectada. Verificar parâmetros operacionais imediatamente."
        
        if risco == "ALTA":
            return "🔴 Risco ALTO detectado. Ação imediata necessária. Revisar sistemas críticos e implementar planos de mitigação."
        elif risco == "MODERADA":
            return "🟡 Risco MODERADO. Intensificar monitoramento e agendar manutenções preventivas."
        else:
            return "🟢 Operação dentro dos padrões. Manter rotina de monitoramento."
            
    def gerar_previsao(self):
        """
        Gera forecast completo de risco com todas as métricas
        
        Returns:
            dict: Relatório completo com timestamp, métricas e recomendações
        """
        log("Carregando dados históricos FMEA/ASOG...")
        
        if not self.carregar_dados():
            return {
                "timestamp": datetime.now().isoformat(),
                "erro": "Falha ao carregar dados",
                "risco_previsto": "DESCONHECIDO",
                "rpn_medio": 0,
                "variabilidade": 0,
                "status_operacional": "sem dados",
                "recomendacao": "Verificar arquivos de dados FMEA e ASOG"
            }
        
        log("Calculando tendência de RPN...")
        rpn_medio = self.calcular_rpn_medio()
        variabilidade = self.calcular_variabilidade()
        
        log("Gerando relatório preditivo...")
        risco = self.classificar_risco(rpn_medio)
        status_asog = self.verificar_status_asog()
        recomendacao = self.gerar_recomendacao(risco, status_asog)
        
        return {
            "timestamp": datetime.now().isoformat(),
            "risco_previsto": risco,
            "rpn_medio": round(rpn_medio, 2),
            "variabilidade": round(variabilidade, 2),
            "status_operacional": status_asog,
            "recomendacao": recomendacao
        }
        
    def salvar_relatorio(self, relatorio, arquivo_saida="forecast_risco.json"):
        """
        Salva o relatório de forecast em arquivo JSON
        
        Args:
            relatorio (dict): Dados do relatório
            arquivo_saida (str): Nome do arquivo de saída
            
        Returns:
            bool: True se salvamento bem-sucedido
        """
        try:
            with open(arquivo_saida, 'w', encoding='utf-8') as f:
                json.dump(relatorio, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            log(f"Erro ao salvar relatório: {e}")
            return False
            
    def analyze(self):
        """
        Executa análise completa e exibe resultados
        Método de conveniência para execução standalone
        """
        print("🔮 Iniciando análise preditiva de risco...")
        
        resultado = self.gerar_previsao()
        
        if self.salvar_relatorio(resultado):
            log("Forecast de risco gerado com sucesso.")
            print(f"\n📊 Forecast de Risco salvo como: forecast_risco.json")
        
        print(f"\n📈 Tendência de risco: {resultado['risco_previsto']}")
        print(f"RPN médio: {resultado['rpn_medio']} | Variabilidade: {resultado['variabilidade']}")
        print(f"Status ASOG: {resultado['status_operacional']}")
        print(f"Recomendação: {resultado['recomendacao']}")


if __name__ == "__main__":
    # Execução standalone
    forecast = RiskForecast()
    forecast.analyze()
