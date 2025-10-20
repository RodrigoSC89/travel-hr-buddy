"""
Decision Core module for Nautilus One.
Main decision engine that manages state, routing, and execution flow.
"""
import json
from datetime import datetime
from core.logger import log_event
from modules.audit_fmea import FMEAAuditor
from core.pdf_exporter import export_report
from core.sgso_connector import SGSOClient


class DecisionCore:
    """
    Módulo central de decisão do Nautilus One.
    Responsável por interpretar o contexto e executar o próximo passo lógico.
    """
    
    def __init__(self):
        """Initialize Decision Core."""
        self.state_file = "nautilus_state.json"
        self.carregar_estado()
        log_event("DecisionCore inicializado")
    
    def carregar_estado(self) -> None:
        """Load state from persistent storage."""
        try:
            with open(self.state_file, "r", encoding="utf-8") as file:
                self.state = json.load(file)
            log_event(f"Estado carregado: {self.state.get('ultima_acao', 'Nenhum')}")
        except FileNotFoundError:
            self.state = {"ultima_acao": None, "timestamp": None}
            log_event("Novo estado do Nautilus inicializado.")
    
    def salvar_estado(self, acao: str) -> None:
        """
        Save current state to persistent storage.
        
        Args:
            acao: Description of the action performed
        """
        self.state["ultima_acao"] = acao
        self.state["timestamp"] = datetime.now().isoformat()
        with open(self.state_file, "w", encoding="utf-8") as file:
            json.dump(self.state, file, indent=4, ensure_ascii=False)
        log_event(f"Estado atualizado: {acao}")
    
    def processar_decisao(self) -> None:
        """Process decision and present interactive menu."""
        print("\n" + "=" * 60)
        print("🧭 NAUTILUS ONE - DECISION CORE")
        print("=" * 60)
        
        # Show last action if available
        if self.state.get("ultima_acao"):
            print(f"\n📌 Última ação: {self.state['ultima_acao']}")
            print(f"   Timestamp: {self.state['timestamp']}")
        
        print("\n🔧 Deseja seguir com:")
        print("1. 📄 Exportar parecer da IA como PDF")
        print("2. 🧠 Iniciar módulo Auditoria Técnica FMEA")
        print("3. 🔗 Conectar com SGSO/Logs")
        print("4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)")
        print("5. 🚪 Sair")
        
        escolha = input("\n👉 Sua escolha: ").strip()
        
        if escolha == "1":
            self._exportar_pdf()
        elif escolha == "2":
            self._executar_fmea()
        elif escolha == "3":
            self._conectar_sgso()
        elif escolha == "4":
            self.menu_modulos()
        elif escolha == "5":
            print("\n👋 Encerrando Nautilus One...")
            log_event("Sistema encerrado pelo usuário")
        else:
            print("❌ Opção inválida. Tente novamente.")
            self.processar_decisao()
    
    def _exportar_pdf(self) -> None:
        """Export report as PDF."""
        print("\n📄 Exportando relatório...")
        export_report("relatorio_fmea_atual.json")
        self.salvar_estado("Exportar PDF")
    
    def _executar_fmea(self) -> None:
        """Execute FMEA audit."""
        auditor = FMEAAuditor()
        auditor.run()
        self.salvar_estado("Rodar Auditoria FMEA")
    
    def _conectar_sgso(self) -> None:
        """Connect to SGSO system."""
        client = SGSOClient()
        client.connect()
        self.salvar_estado("Conexão SGSO")
    
    def menu_modulos(self) -> None:
        """Display module selection menu."""
        print("\n🧩 Módulos Disponíveis:")
        print("1. ASOG Review")
        print("2. Forecast de Risco")
        print("3. Voltar")
        
        sub = input("\n👉 Escolha o módulo: ").strip()
        
        if sub == "1":
            self._executar_asog()
        elif sub == "2":
            self._executar_forecast()
        elif sub == "3":
            self.processar_decisao()
        else:
            print("❌ Módulo inválido.")
            self.menu_modulos()
    
    def _executar_asog(self) -> None:
        """Execute ASOG review."""
        from modules.asog_review import ASOGModule
        asog = ASOGModule()
        asog.start()
        self.salvar_estado("ASOG Review")
    
    def _executar_forecast(self) -> None:
        """Execute risk forecast."""
        from modules.forecast_risk import RiskForecast
        forecast = RiskForecast()
        forecast.analyze()
        self.salvar_estado("Forecast de Risco")
