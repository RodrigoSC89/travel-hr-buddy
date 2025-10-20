#!/usr/bin/env python3
"""
Nautilus One Decision Core - Main Entry Point
Interactive system for maritime, offshore, and industrial decision-making.
"""

from modules.decision_core import DecisionCore
from core.logger import log_event


def main():
    """Main entry point for Nautilus One Decision Core."""
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                          NAUTILUS ONE DECISION CORE                          ║
║                                                                              ║
║              Sistema de Decisões para Operações Marítimas e Offshore        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    """)
    
    log_event("Sistema Nautilus One iniciado")
    
    try:
        nautilus = DecisionCore()
        nautilus.processar_decisao()
    except KeyboardInterrupt:
        print("\n\n⚠️ Sistema interrompido pelo usuário.")
        log_event("Sistema interrompido pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro fatal: {e}")
        log_event(f"Erro fatal: {e}")
    finally:
        print("\n👋 Obrigado por usar Nautilus One Decision Core!")
        log_event("Sistema Nautilus One encerrado")


if __name__ == "__main__":
    main()
