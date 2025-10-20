"""
Nautilus One - Sistema modular de operações marítimas.
Ponto de entrada principal para o módulo Decision Core.
"""

from modules.decision_core import DecisionCore

if __name__ == "__main__":
    nautilus = DecisionCore()
    nautilus.processar_decisao()
