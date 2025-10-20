#!/usr/bin/env python3
"""
Nautilus One - Decision Core Module
Main Entry Point

This is the main entry point for the Decision Core system.
Run this script to start the interactive CLI interface.

Usage:
    python3 main.py
"""

from modules.decision_core import DecisionCore


def main():
    """Main entry point"""
    print("""
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║            NAUTILUS ONE - DECISION CORE SYSTEM                ║
    ║                                                               ║
    ║    Python Backend for Intelligent Decision-Making             ║
    ║    Maritime, Offshore & Industrial Operations                 ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    """)
    
    try:
        core = DecisionCore()
        core.processar_decisao()
    except KeyboardInterrupt:
        print("\n\nSistema encerrado pelo usuário.")
    except Exception as e:
        print(f"\n\nErro inesperado: {e}")
        print("Por favor, verifique os logs em nautilus_logs.txt")


if __name__ == "__main__":
    main()
