"""
Decision Core Module for Nautilus One
Central decision engine responsible for interpreting context and executing the next logical step
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
        self.state_file = "nautilus_state.json"
        self.carregar_estado()

    def carregar_estado(self):
        """
        Loads the system state from file
        """
        try:
            with open(self.state_file, "r") as file:
                self.state = json.load(file)
            log_event("Estado do Nautilus carregado")
        except FileNotFoundError:
            self.state = {"ultima_acao": None, "timestamp": None}
            log_event("Novo estado do Nautilus inicializado.")

    def salvar_estado(self, acao):
        """
        Saves the current system state
        
        Args:
            acao (str): Action being performed
        """
        self.state["ultima_acao"] = acao
        self.state["timestamp"] = datetime.now().isoformat()
        with open(self.state_file, "w") as file:
            json.dump(self.state, file, indent=4)
        log_event(f"Estado atualizado: {acao}")

    def processar_decisao(self):
        """
        Main decision processing menu
        Presents options and executes selected action
        """
        print("\n" + "=" * 80)
        print("🧭 NAUTILUS ONE - Decision Core")
        print("=" * 80)
        
        # Show last action if available
        if self.state.get("ultima_acao"):
            print(f"\n📝 Última ação: {self.state['ultima_acao']}")
            if self.state.get("timestamp"):
                print(f"🕒 Timestamp: {self.state['timestamp']}")
        
        print("\n🔧 Deseja seguir com:")
        print("1. 📄 Exportar parecer da IA como PDF")
        print("2. 🧠 Iniciar módulo Auditoria Técnica FMEA")
        print("3. 🔗 Conectar com SGSO/Logs")
        print("4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)")
        print("5. 🚪 Sair")
        
        escolha = input("\nSua escolha: ").strip()

        if escolha == "1":
            self._exportar_pdf()
        elif escolha == "2":
            self._executar_fmea()
        elif escolha == "3":
            self._conectar_sgso()
        elif escolha == "4":
            self.menu_modulos()
        elif escolha == "5":
            self._sair()
        else:
            print("❌ Opção inválida. Tente novamente.")
            self.processar_decisao()

    def _exportar_pdf(self):
        """
        Exports AI analysis to PDF
        """
        print("\n📄 Exportando parecer...")
        export_report("relatorio_fmea_atual.json")
        self.salvar_estado("Exportar PDF")
        
        self._continuar()

    def _executar_fmea(self):
        """
        Executes FMEA audit
        """
        print("\n🧠 Iniciando Auditoria FMEA...")
        auditor = FMEAAuditor()
        auditor.run()
        self.salvar_estado("Rodar Auditoria FMEA")
        
        self._continuar()

    def _conectar_sgso(self):
        """
        Connects to SGSO system
        """
        print("\n🔗 Conectando ao SGSO...")
        SGSOClient().connect()
        self.salvar_estado("Conexão SGSO")
        
        self._continuar()

    def _sair(self):
        """
        Exits the system
        """
        print("\n👋 Encerrando Nautilus One...")
        log_event("Sistema encerrado pelo usuário")
        print("✅ Sistema encerrado com sucesso.")

    def _continuar(self):
        """
        Prompts user to continue or exit
        """
        print("\n" + "-" * 80)
        continuar = input("Deseja realizar outra ação? (s/n): ").strip().lower()
        
        if continuar == "s":
            self.processar_decisao()
        else:
            self._sair()

    def menu_modulos(self):
        """
        Displays available modules menu
        """
        print("\n🧩 Módulos Disponíveis:")
        print("1. ASOG Review")
        print("2. Forecast de Risco")
        print("3. Voltar ao menu principal")
        
        sub = input("Escolha o módulo: ").strip()
        
        if sub == "1":
            self._executar_asog()
        elif sub == "2":
            self._executar_forecast()
        elif sub == "3":
            self.processar_decisao()
        else:
            print("❌ Módulo inválido.")
            self.menu_modulos()

    def _executar_asog(self):
        """
        Executes ASOG Review module
        """
        from modules.asog_review import ASOGModule
        print("\n📑 Iniciando ASOG Review...")
        ASOGModule().start()
        self.salvar_estado("ASOG Review")
        
        self._continuar()

    def _executar_forecast(self):
        """
        Executes Risk Forecast module
        """
        from modules.forecast_risk import RiskForecast
        print("\n📈 Iniciando Forecast de Risco...")
        RiskForecast().analyze()
        self.salvar_estado("Forecast de Risco")
        
        self._continuar()
