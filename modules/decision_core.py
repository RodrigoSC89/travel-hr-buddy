"""
Decision Core Module – Sistema Nautilus One
Responsável por coordenar e gerenciar os diferentes módulos do sistema.
"""
from modules.asog_review import ASOGModule


class DecisionCore:
    """
    Núcleo de decisão do Sistema Nautilus One.
    Gerencia a navegação entre diferentes módulos operacionais.
    """

    def __init__(self):
        self.modules = {
            "asog_review": ASOGModule,
        }

    def run_module(self, module_name: str):
        """
        Executa um módulo específico.
        
        Args:
            module_name: Nome do módulo a ser executado
        """
        if module_name in self.modules:
            module_class = self.modules[module_name]
            module_instance = module_class()
            module_instance.start()
        else:
            print(f"⚠️ Módulo '{module_name}' não encontrado.")
            print(f"Módulos disponíveis: {', '.join(self.modules.keys())}")

    def list_modules(self):
        """Lista todos os módulos disponíveis."""
        print("\n📋 Módulos disponíveis:")
        for idx, module_name in enumerate(self.modules.keys(), 1):
            print(f"  {idx}. {module_name}")


if __name__ == "__main__":
    core = DecisionCore()
    core.list_modules()
    print("\n🧭 Para executar o ASOG Review:")
    print(">>> from modules.decision_core import DecisionCore")
    print(">>> core = DecisionCore()")
    print(">>> core.run_module('asog_review')")
