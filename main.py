"""
Nautilus One - Main Entry Point
Decision Core System for Maritime Operations
"""
from modules.decision_core import DecisionCore


if __name__ == "__main__":
    print("""
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                                                                      ║
    ║                      🧭 NAUTILUS ONE                                ║
    ║                   Decision Core System                              ║
    ║                                                                      ║
    ║          Sistema modular de decisão para operações                  ║
    ║          marítimas, offshore e industriais                          ║
    ║                                                                      ║
    ╚══════════════════════════════════════════════════════════════════════╝
    """)
    
    nautilus = DecisionCore()
    nautilus.processar_decisao()
