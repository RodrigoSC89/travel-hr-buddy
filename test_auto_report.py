#!/usr/bin/env python3
"""
Test script for Auto-Report module
Demonstrates the functionality of the Auto-Report system
"""

import sys
import os

# Ensure the modules are importable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from modules.auto_report import AutoReport


def test_auto_report():
    """Test the AutoReport module"""
    print("="*60)
    print("🧪 TESTE DO MÓDULO AUTO-REPORT")
    print("="*60)
    
    try:
        # Create an instance of AutoReport
        report = AutoReport()
        
        # Run the report generation
        report.run()
        
        print("\n" + "="*60)
        print("✅ TESTE CONCLUÍDO COM SUCESSO!")
        print("="*60)
        print("\nArquivos gerados:")
        print("  - nautilus_full_report.json (Relatório consolidado JSON)")
        print("  - Nautilus_Tech_Report.pdf (Relatório técnico PDF)")
        print("\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NO TESTE: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_auto_report()
    sys.exit(0 if success else 1)
