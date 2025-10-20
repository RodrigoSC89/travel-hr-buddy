#!/usr/bin/env python3
"""
Nautilus Global Intelligence - Demonstration Script

Demonstrates complete workflow:
1. Load fleet data
2. Train global ML model
3. Generate risk predictions
4. Display corporate dashboard
5. Analyze patterns and send alerts

Run: python3 modules/global_intelligence/demo.py
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from modules.global_intelligence.gi_core import GlobalIntelligence


def main():
    """Execute Global Intelligence demonstration"""
    print("=" * 60)
    print("🌍 NAUTILUS GLOBAL INTELLIGENCE - DEMONSTRAÇÃO")
    print("=" * 60)
    print("\n\"Um sistema que não apenas opera — ele aprende com o mar.\"")
    print("(A system that not only operates — it learns from the sea.)\n")

    try:
        # Initialize and execute Global Intelligence
        print("📥 Carregando dados de exemplo...")
        gi = GlobalIntelligence()
        
        print("\n🚀 Executando ciclo completo de IA Global...\n")
        gi.executar()
        
        print("\n" + "=" * 60)
        print("✅ Demonstração concluída com sucesso!")
        print("=" * 60)
        print("\nPróximos passos:")
        print("  1. Integrar com BridgeLink API real")
        print("  2. Conectar alertas ao SGSO e BI Petrobras")
        print("  3. Implementar dashboard web em tempo real")
        print("  4. Adicionar previsões time-series com LSTM")
        
        return 0

    except Exception as e:
        print(f"\n❌ Erro durante demonstração: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
