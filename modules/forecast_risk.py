"""
Módulo de Análise Preditiva de Risco Operacional
Sistema Nautilus One - Operações Marítimas e Offshore

Realiza análise de tendências de RPN (Risk Priority Number) baseado em:
- Dados históricos FMEA (Failure Mode and Effects Analysis)
- Relatórios ASOG (Assurance of Operational Compliance)
"""

import json
import statistics
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

from core.logger import log_info, log_error, log_warning


class RiskForecast:
    """
    Classe principal para análise preditiva de risco operacional.
    
    Processa dados FMEA e ASOG para gerar previsões de risco e 
    recomendações operacionais baseadas em análise estatística.
    """
    
    def __init__(self, fmea_file: str = "relatorio_fmea_atual.json", 
                 asog_file: str = "asog_report.json"):
        """
        Inicializa o sistema de forecast de risco.
        
        Args:
            fmea_file: Caminho para o arquivo JSON com dados FMEA
            asog_file: Caminho para o arquivo JSON com dados ASOG
        """
        self.fmea_file = fmea_file
        self.asog_file = asog_file
        self.fmea_data: List[Dict[str, Any]] = []
        self.asog_data: Dict[str, Any] = {}
        
    def carregar_dados_fmea(self) -> bool:
        """
        Carrega dados históricos de análise FMEA.
        
        Returns:
            True se carregado com sucesso, False caso contrário
        """
        try:
            if not Path(self.fmea_file).exists():
                log_warning(f"Arquivo FMEA não encontrado: {self.fmea_file}")
                return False
                
            with open(self.fmea_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.fmea_data = data.get('sistemas', [])
                
            log_info(f"Dados FMEA carregados: {len(self.fmea_data)} sistemas")
            return True
            
        except json.JSONDecodeError as e:
            log_error(f"Erro ao decodificar JSON FMEA: {e}")
            return False
        except Exception as e:
            log_error(f"Erro ao carregar dados FMEA: {e}")
            return False
    
    def carregar_dados_asog(self) -> bool:
        """
        Carrega dados do relatório ASOG.
        
        Returns:
            True se carregado com sucesso, False caso contrário
        """
        try:
            if not Path(self.asog_file).exists():
                log_warning(f"Arquivo ASOG não encontrado: {self.asog_file}")
                return False
                
            with open(self.asog_file, 'r', encoding='utf-8') as f:
                self.asog_data = json.load(f)
                
            log_info("Dados ASOG carregados com sucesso")
            return True
            
        except json.JSONDecodeError as e:
            log_error(f"Erro ao decodificar JSON ASOG: {e}")
            return False
        except Exception as e:
            log_error(f"Erro ao carregar dados ASOG: {e}")
            return False
    
    def calcular_rpn(self, sistema: Dict[str, Any]) -> int:
        """
        Calcula o RPN (Risk Priority Number) de um sistema.
        RPN = Severidade × Ocorrência × Detecção
        
        Args:
            sistema: Dicionário com dados do sistema
            
        Returns:
            Valor do RPN calculado
        """
        severidade = sistema.get('severidade', 1)
        ocorrencia = sistema.get('ocorrencia', 1)
        deteccao = sistema.get('deteccao', 1)
        return severidade * ocorrencia * deteccao
    
    def calcular_tendencia_rpn(self) -> Dict[str, float]:
        """
        Calcula métricas estatísticas de RPN para todos os sistemas.
        
        Returns:
            Dicionário com rpn_medio e variabilidade
        """
        if not self.fmea_data:
            return {'rpn_medio': 0, 'variabilidade': 0}
        
        rpns = [self.calcular_rpn(sistema) for sistema in self.fmea_data]
        
        rpn_medio = statistics.mean(rpns)
        variabilidade = statistics.stdev(rpns) if len(rpns) > 1 else 0
        
        return {
            'rpn_medio': round(rpn_medio, 2),
            'variabilidade': round(variabilidade, 2)
        }
    
    def classificar_risco(self, rpn_medio: float) -> str:
        """
        Classifica o nível de risco baseado no RPN médio.
        
        Args:
            rpn_medio: Valor do RPN médio calculado
            
        Returns:
            Classificação: 'ALTA', 'MODERADA' ou 'BAIXA'
        """
        if rpn_medio > 200:
            return "ALTA"
        elif rpn_medio > 150:
            return "MODERADA"
        else:
            return "BAIXA"
    
    def avaliar_status_asog(self) -> str:
        """
        Avalia o status de conformidade operacional ASOG.
        
        Returns:
            Status: 'conforme', 'fora dos limites' ou 'sem dados'
        """
        if not self.asog_data:
            return "sem dados"
        
        parametros = self.asog_data.get('parametros', [])
        
        # Verifica se todos os parâmetros estão conformes
        todos_conformes = all(
            param.get('status') == 'conforme' 
            for param in parametros
        )
        
        return "conforme" if todos_conformes else "fora dos limites"
    
    def gerar_recomendacao(self, risco: str, status_asog: str) -> str:
        """
        Gera recomendação operacional baseada no risco e status ASOG.
        
        Args:
            risco: Nível de risco classificado
            status_asog: Status de conformidade ASOG
            
        Returns:
            Mensagem de recomendação
        """
        if risco == "ALTA":
            return "🔴 Risco elevado detectado. Requer ação imediata e revisão de procedimentos operacionais."
        elif risco == "MODERADA":
            return "🟡 Risco moderado. Intensificar monitoramento e considerar ações preventivas."
        elif status_asog != "conforme":
            return "🟡 Operação fora dos padrões ASOG. Verificar conformidade operacional."
        else:
            return "🟢 Operação dentro dos padrões. Manter rotina de monitoramento."
    
    def gerar_previsao(self) -> Dict[str, Any]:
        """
        Gera previsão completa de risco operacional.
        
        Returns:
            Dicionário com timestamp, risco previsto, métricas e recomendação
        """
        log_info("Carregando dados históricos FMEA/ASOG...")
        self.carregar_dados_fmea()
        self.carregar_dados_asog()
        
        log_info("Calculando tendência de RPN...")
        tendencia = self.calcular_tendencia_rpn()
        
        risco = self.classificar_risco(tendencia['rpn_medio'])
        status_asog = self.avaliar_status_asog()
        recomendacao = self.gerar_recomendacao(risco, status_asog)
        
        resultado = {
            'timestamp': datetime.now().isoformat(),
            'risco_previsto': risco,
            'rpn_medio': tendencia['rpn_medio'],
            'variabilidade': tendencia['variabilidade'],
            'status_operacional': status_asog,
            'recomendacao': recomendacao
        }
        
        log_info("Gerando relatório preditivo...")
        
        return resultado
    
    def salvar_relatorio(self, resultado: Dict[str, Any], 
                        arquivo_saida: str = "forecast_risco.json") -> bool:
        """
        Salva o relatório de forecast em arquivo JSON.
        
        Args:
            resultado: Dicionário com os dados do forecast
            arquivo_saida: Nome do arquivo de saída
            
        Returns:
            True se salvo com sucesso, False caso contrário
        """
        try:
            with open(arquivo_saida, 'w', encoding='utf-8') as f:
                json.dump(resultado, f, indent=4, ensure_ascii=False)
            
            log_info(f"Forecast de risco gerado com sucesso.")
            return True
            
        except Exception as e:
            log_error(f"Erro ao salvar relatório: {e}")
            return False
    
    def analyze(self) -> None:
        """
        Executa análise completa e exibe resultados no console.
        Método de conveniência para uso interativo.
        """
        print("\n🔮 Iniciando análise preditiva de risco...")
        
        resultado = self.gerar_previsao()
        
        arquivo_saida = "forecast_risco.json"
        self.salvar_relatorio(resultado, arquivo_saida)
        
        print(f"📊 Forecast de Risco salvo como: {arquivo_saida}\n")
        print(f"📈 Tendência de risco: {resultado['risco_previsto']}")
        print(f"RPN médio: {resultado['rpn_medio']} | Variabilidade: {resultado['variabilidade']}")
        print(f"Status ASOG: {resultado['status_operacional']}")
        print(f"Recomendação: {resultado['recomendacao']}\n")


# Execução direta
if __name__ == "__main__":
    forecast = RiskForecast()
    forecast.analyze()
