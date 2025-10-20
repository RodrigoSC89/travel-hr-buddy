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
        try:
            with open(self.state_file, "r") as file:
                self.state = json.load(file)
        except FileNotFoundError:
            self.state = {"ultima_acao": None, "timestamp": None}
            log_event("Novo estado do Nautilus inicializado.")

    def salvar_estado(self, acao):
        self.state["ultima_acao"] = acao
        self.state["timestamp"] = datetime.now().isoformat()
        with open(self.state_file, "w") as file:
            json.dump(self.state, file, indent=4)
        log_event(f"Estado atualizado: {acao}")

    def processar_decisao(self):
        print("\n🔧 Deseja seguir com:")
        print("1. 📄 Exportar parecer da IA como PDF")
        print("2. 🧠 Iniciar módulo Auditoria Técnica FMEA")
        print("3. 🔗 Conectar com SGSO/Logs")
        print("4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)")
        escolha = input("\nSua escolha: ")

        if escolha == "1":
            export_report("relatorio_fmea_atual.json")
            self.salvar_estado("Exportar PDF")
        elif escolha == "2":
            auditor = FMEAAuditor()
            auditor.run()
            self.salvar_estado("Rodar Auditoria FMEA")
        elif escolha == "3":
            SGSOClient().connect()
            self.salvar_estado("Conexão SGSO")
        elif escolha == "4":
            self.menu_modulos()
        else:
            print("❌ Opção inválida. Tente novamente.")

    def menu_modulos(self):
        print("\n🧩 Módulos Disponíveis:")
        print("1. ASOG Review")
        print("2. Forecast de Risco")
        sub = input("Escolha o módulo: ")
        if sub == "1":
            from modules.asog_review import ASOGModule
            ASOGModule().start()
            self.salvar_estado("ASOG Review")
        elif sub == "2":
            from modules.forecast_risk import RiskForecast
            RiskForecast().analyze()
            self.salvar_estado("Forecast de Risco")
        else:
            print("❌ Módulo inválido.")
