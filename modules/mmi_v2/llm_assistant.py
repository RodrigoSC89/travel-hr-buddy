"""
LLM Assistant - MMI v2
Embedded LLM for technical queries and automatic report generation
"""
from typing import Optional
from core.logger import log_event


class NautilusLLM:
    """
    AI Technical Assistant for MMI
    - Technical queries
    - Historical analysis
    - Cost analysis
    - Automatic recommendations
    """
    
    def __init__(self):
        """Initialize the LLM assistant"""
        log_event("Assistente LLM inicializado")
        self.knowledge_base = self._load_knowledge_base()
    
    def _load_knowledge_base(self) -> dict:
        """
        Load technical knowledge base
        In production, this would connect to a real LLM API
        """
        return {
            "thruster": {
                "patterns": ["thruster", "propulsor", "propulsor lateral"],
                "response": (
                    "O thruster STBD FWD apresenta tendência de desgaste no selo mecânico. "
                    "Recomenda-se inspeção a cada 180h de operação. "
                    "Histórico indica falhas recorrentes após 2.000h de uso contínuo."
                )
            },
            "custo": {
                "patterns": ["custo", "gasto", "orçamento", "financeiro"],
                "response": (
                    "O custo médio de manutenção mensal é R$ 82.400, "
                    "com pico no sistema hidráulico (R$ 28.600). "
                    "Principais componentes de custo: peças (45%), mão de obra (35%), outros (20%)."
                )
            },
            "motor": {
                "patterns": ["motor", "engine", "propulsão"],
                "response": (
                    "Motor principal requer manutenção preventiva a cada 500h. "
                    "Verificar filtros de óleo, sistema de refrigeração e injeção. "
                    "Temperatura operacional: 85-95°C. Alertar se ultrapassar 95°C."
                )
            },
            "dp": {
                "patterns": ["dp", "dynamic positioning", "posicionamento dinâmico"],
                "response": (
                    "Sistema DP requer calibração trimestral e teste de redundância mensal. "
                    "Verificar sensores DGPS, gyro e wind sensor. "
                    "DP Class 2 exige no mínimo 2 sistemas independentes ativos."
                )
            },
            "hidraulico": {
                "patterns": ["hidráulico", "hydraulic", "óleo hidráulico"],
                "response": (
                    "Sistema hidráulico: verificar pressão (150-180 bar), "
                    "temperatura do óleo (<60°C) e nível do reservatório. "
                    "Trocar óleo a cada 2.000h ou anualmente."
                )
            }
        }
    
    def responder(self, pergunta: str) -> str:
        """
        Generate response to technical query
        
        Args:
            pergunta: User question
            
        Returns:
            AI-generated response
        """
        log_event(f"Consulta IA: {pergunta}")
        
        # Convert to lowercase for matching
        q_lower = pergunta.lower()
        
        # Search in knowledge base
        for topic, data in self.knowledge_base.items():
            for pattern in data["patterns"]:
                if pattern in q_lower:
                    return data["response"]
        
        # Default response if no match
        return (
            "Análise em andamento... Posso correlacionar histórico técnico e custo "
            "quando a base estiver completa. Tópicos disponíveis: "
            "thruster, motor, DP, hidráulico, custos."
        )
    
    def gerar_relatorio(self, tipo: str = "mensal") -> str:
        """
        Generate automatic technical report
        
        Args:
            tipo: Report type (mensal, semanal, anual)
            
        Returns:
            Generated report
        """
        log_event(f"Gerando relatório {tipo}")
        
        if tipo == "mensal":
            return """
📊 RELATÓRIO MENSAL DE MANUTENÇÃO - MMI v2

═══════════════════════════════════════════════════

📈 ESTATÍSTICAS GERAIS:
  • Total de ativos monitorados: 45
  • Planos preventivos ativos: 23
  • Ordens de serviço emitidas: 12
  • Taxa de conclusão: 85%

💰 ANÁLISE DE CUSTOS:
  • Custo total: R$ 82.400,00
  • Material: R$ 37.080,00 (45%)
  • Mão de obra: R$ 28.840,00 (35%)
  • Outros: R$ 16.480,00 (20%)

⚠️  ALERTAS CRÍTICOS:
  • Thruster STBD FWD: Inspeção de selo mecânico necessária
  • Motor Principal: Filtros próximos do limite (450h)
  • Sistema DP: Calibração trimestral pendente

✅ RECOMENDAÇÕES:
  1. Antecipar manutenção do thruster (próximas 48h)
  2. Solicitar peças para motor principal
  3. Agendar calibração DP com técnico certificado

═══════════════════════════════════════════════════
Gerado por: Nautilus LLM - MMI v2
            """
        elif tipo == "semanal":
            return """
📊 RELATÓRIO SEMANAL - MMI v2

Período: Última semana
Trabalhos concluídos: 3
Custos: R$ 18.450,00
Alertas novos: 2

Próximas manutenções (7 dias):
  • Motor STBD - Troca de filtros
  • DP System - Teste de redundância
            """
        else:
            return "Tipo de relatório não suportado. Use: mensal ou semanal."
    
    def chat(self) -> None:
        """Interactive chat interface"""
        print("\n🧠 Assistente Técnico MMI IA")
        print("Digite uma pergunta sobre manutenção, histórico ou custo.")
        print("Comandos especiais:")
        print("  • 'relatorio' - Gerar relatório mensal")
        print("  • 'sair' - Sair do assistente\n")
        
        while True:
            try:
                q = input("💬 Pergunta: ").strip()
                
                if not q:
                    continue
                
                if q.lower() == "sair":
                    print("👋 Até logo!")
                    break
                
                if q.lower() == "relatorio":
                    resposta = self.gerar_relatorio("mensal")
                elif q.lower() == "ajuda":
                    resposta = (
                        "Tópicos disponíveis:\n"
                        "  • Thruster e propulsores\n"
                        "  • Motor principal\n"
                        "  • Sistema DP\n"
                        "  • Sistema hidráulico\n"
                        "  • Análise de custos\n"
                        "Digite 'relatorio' para relatório mensal."
                    )
                else:
                    resposta = self.responder(q)
                
                print(f"\n🤖 {resposta}\n")
                
            except KeyboardInterrupt:
                print("\n👋 Chat encerrado.")
                break
            except Exception as e:
                log_event(f"Erro no chat: {str(e)}", "ERROR")
                print(f"❌ Erro: {str(e)}")
