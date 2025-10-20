"""
Módulo central de decisão do Nautilus One.
Responsável por interpretar o contexto e executar o próximo passo lógico.
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
        """Inicializa o Decision Core."""
        self.state_file = "nautilus_state.json"
        self.carregar_estado()
    
    def carregar_estado(self) -> None:
        """Carrega o estado persistente do sistema."""
        try:
            with open(self.state_file, "r", encoding="utf-8") as file:
                self.state = json.load(file)
            log_event("Estado do Nautilus carregado com sucesso")
        except FileNotFoundError:
            self.state = {"ultima_acao": None, "timestamp": None}
            log_event("Novo estado do Nautilus inicializado.")
    
    def salvar_estado(self, acao: str) -> None:
        """
        Salva o estado atual do sistema.
        
        Args:
            acao: Descrição da última ação executada
        """
        self.state["ultima_acao"] = acao
        self.state["timestamp"] = datetime.now().isoformat()
        with open(self.state_file, "w", encoding="utf-8") as file:
            json.dump(self.state, file, indent=4, ensure_ascii=False)
        log_event(f"Estado atualizado: {acao}")
    
    def processar_decisao(self) -> None:
        """
        Processa a decisão do operador e executa o módulo apropriado.
        Apresenta menu interativo e executa a ação selecionada.
        """
        print("\n" + "=" * 60)
        print("🔱 NAUTILUS ONE - DECISION CORE")
        print("=" * 60)
        
        # Exibe estado anterior se existir
        if self.state.get("ultima_acao"):
            timestamp = self.state.get("timestamp", "N/A")
            if timestamp != "N/A":
                try:
                    dt = datetime.fromisoformat(timestamp)
                    timestamp = dt.strftime("%Y-%m-%d %H:%M:%S")
                except:
                    pass
            print(f"\n📊 Última ação: {self.state['ultima_acao']}")
            print(f"   Executada em: {timestamp}")
        
        print("\n🔧 Deseja seguir com:")
        print("1. 📄 Exportar parecer da IA como PDF")
        print("2. 🧠 Iniciar módulo Auditoria Técnica FMEA")
        print("3. 🔗 Conectar com SGSO/Logs")
        print("4. 🧾 Migrar para outro módulo (Forecast/ASOG Review)")
        print("0. 🚪 Sair")
        
        escolha = input("\n➤ Sua escolha: ")
        
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
        elif escolha == "0":
            print("\n👋 Encerrando Nautilus One Decision Core...")
            log_event("Sistema encerrado pelo usuário")
        else:
            print("❌ Opção inválida. Tente novamente.")
            log_event("Opção inválida selecionada")
    
    def menu_modulos(self) -> None:
        """
        Apresenta menu de submódulos disponíveis.
        Permite seleção de módulos especializados.
        """
        print("\n" + "=" * 60)
        print("🧩 Módulos Disponíveis:")
        print("=" * 60)
        print("1. 📋 ASOG Review")
        print("2. 📊 Forecast de Risco")
        print("0. ⬅️  Voltar")
        
        sub = input("\n➤ Escolha o módulo: ")
        
        if sub == "1":
            from modules.asog_review import ASOGModule
            ASOGModule().start()
            self.salvar_estado("ASOG Review")
        elif sub == "2":
            from modules.forecast_risk import RiskForecast
            RiskForecast().analyze()
            self.salvar_estado("Forecast de Risco")
        elif sub == "0":
            print("\n⬅️  Retornando ao menu principal...")
        else:
            print("❌ Módulo inválido.")
            log_event("Módulo inválido selecionado")
