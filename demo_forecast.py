#!/usr/bin/env python3
"""
Nautilus One - Risk Forecast Interactive Demo

This script provides an interactive demonstration of the Risk Forecast module,
showcasing FMEA/ASOG analysis capabilities with visual output and explanations.

Usage:
    python3 demo_forecast.py
"""

import json
from modules.forecast_risk import RiskForecast


def print_header():
    """Print demo header"""
    print("\n" + "=" * 80)
    print("NAUTILUS ONE - RISK FORECAST MODULE DEMO")
    print("FMEA/ASOG Predictive Risk Analysis")
    print("=" * 80)


def print_section(title):
    """Print section header"""
    print("\n" + "-" * 80)
    print(f"  {title}")
    print("-" * 80)


def demonstrate_fmea_loading(forecaster):
    """Demonstrate FMEA data loading"""
    print_section("1. FMEA DATA LOADING")
    print("\nLoading historical FMEA data from 8 critical maritime systems...")
    
    fmea_data = forecaster.carregar_dados_fmea()
    
    if fmea_data:
        print(f"\n✅ Successfully loaded FMEA data")
        print(f"   • Period: {fmea_data.get('periodo_analise', 'N/A')}")
        print(f"   • Systems analyzed: {len(fmea_data.get('sistemas_criticos', []))}")
        
        print("\n   Critical Systems:")
        for sistema in fmea_data.get('sistemas_criticos', []):
            num_falhas = len(sistema.get('modos_falha', []))
            print(f"   • {sistema['nome']} ({sistema['categoria']}): {num_falhas} failure modes")
    else:
        print("\n❌ Failed to load FMEA data")


def demonstrate_asog_loading(forecaster):
    """Demonstrate ASOG data loading"""
    print_section("2. ASOG COMPLIANCE DATA LOADING")
    print("\nLoading ASOG operational compliance parameters...")
    
    asog_data = forecaster.carregar_dados_asog()
    
    if asog_data:
        print(f"\n✅ Successfully loaded ASOG data")
        print(f"   • Vessel: {asog_data.get('vessel', 'N/A')}")
        print(f"   • Parameters monitored: {len(asog_data.get('parametros_operacionais', []))}")
        
        compliance = asog_data.get('compliance_summary', {})
        print(f"\n   Compliance Summary:")
        print(f"   • Total parameters: {compliance.get('total_parametros', 0)}")
        print(f"   • Compliant: {compliance.get('conformes', 0)}")
        print(f"   • Out of limits: {compliance.get('fora_limites', 0)}")
        print(f"   • Compliance rate: {compliance.get('taxa_conformidade', 0)}%")
        print(f"   • Overall status: {compliance.get('status_geral', 'N/A')}")
    else:
        print("\n❌ Failed to load ASOG data")


def demonstrate_rpn_calculation(forecaster):
    """Demonstrate RPN calculations"""
    print_section("3. RPN CALCULATION & STATISTICAL ANALYSIS")
    print("\nCalculating Risk Priority Numbers (RPN = Severity × Occurrence × Detection)...")
    
    rpn_medio = forecaster.calcular_rpn_medio()
    variabilidade = forecaster.calcular_variabilidade()
    
    print(f"\n   Statistical Results:")
    print(f"   • Average RPN: {rpn_medio:.2f}")
    print(f"   • Standard Deviation: {variabilidade:.2f}")
    print(f"   • Variability: {'Low' if variabilidade < 30 else 'Moderate' if variabilidade < 50 else 'High'}")
    
    # Show some sample RPNs
    if forecaster.fmea_data:
        print(f"\n   Sample RPN Values from Critical Systems:")
        count = 0
        for sistema in forecaster.fmea_data.get('sistemas_criticos', []):
            for modo in sistema.get('modos_falha', [])[:1]:  # Just first failure mode per system
                count += 1
                if count <= 5:
                    s = modo['severidade']
                    o = modo['ocorrencia']
                    d = modo['deteccao']
                    rpn = modo['rpn']
                    print(f"   • {sistema['categoria']}: S={s} × O={o} × D={d} = RPN {rpn}")


def demonstrate_risk_classification(forecaster):
    """Demonstrate risk classification"""
    print_section("4. RISK CLASSIFICATION")
    print("\nClassifying overall risk based on average RPN...")
    
    rpn_medio = forecaster.calcular_rpn_medio()
    nivel, emoji, desc = forecaster.classificar_risco(rpn_medio)
    
    print(f"\n   Classification Thresholds:")
    print(f"   • 🔴 HIGH: RPN > 200 (Immediate action required)")
    print(f"   • 🟡 MODERATE: RPN 150-200 (Intensify monitoring)")
    print(f"   • 🟢 LOW: RPN ≤ 150 (Normal operation)")
    
    print(f"\n   Current Risk Level:")
    print(f"   • Level: {nivel} {emoji}")
    print(f"   • Description: {desc}")


def demonstrate_asog_compliance(forecaster):
    """Demonstrate ASOG compliance verification"""
    print_section("5. ASOG COMPLIANCE VERIFICATION")
    print("\nVerifying operational compliance status...")
    
    status, desc = forecaster.verificar_conformidade_asog()
    
    print(f"\n   Compliance Status:")
    print(f"   • Status: {status.upper()}")
    print(f"   • Description: {desc}")
    
    if status == "conforme":
        print(f"   • ✅ All parameters within operational limits")
    elif status == "atencao":
        print(f"   • ⚠️ Some parameters require attention")
    elif status == "fora_limites":
        print(f"   • ❌ Critical parameters out of limits")


def demonstrate_forecast_generation(forecaster):
    """Demonstrate complete forecast generation"""
    print_section("6. COMPLETE FORECAST GENERATION")
    print("\nGenerating comprehensive risk forecast report...\n")
    
    forecast = forecaster.gerar_previsao()
    
    print("\n   Generated Forecast Report:")
    print(f"   • Timestamp: {forecast.get('timestamp')}")
    print(f"   • Risk Level: {forecast.get('risco_previsto')}")
    print(f"   • Average RPN: {forecast.get('rpn_medio')}")
    print(f"   • Variability: {forecast.get('variabilidade')}")
    print(f"   • ASOG Status: {forecast.get('status_operacional')}")
    print(f"\n   Recommendation:")
    print(f"   {forecast.get('recomendacao')}")
    
    return forecast


def demonstrate_report_saving(forecaster, forecast):
    """Demonstrate report saving"""
    print_section("7. REPORT PERSISTENCE")
    print("\nSaving forecast report to JSON file...")
    
    filename = "demo_forecast_report.json"
    success = forecaster.salvar_relatorio(forecast, filename)
    
    if success:
        print(f"\n   ✅ Report saved successfully: {filename}")
        print(f"\n   Report Structure:")
        with open(filename, 'r') as f:
            report = json.load(f)
            for key in report.keys():
                print(f"   • {key}: {type(report[key]).__name__}")


def show_integration_info():
    """Show integration information"""
    print_section("8. INTEGRATION & USAGE")
    
    print("\n   This module can be integrated via:")
    print("\n   1. Standalone Execution:")
    print("      python3 modules/forecast_risk.py")
    
    print("\n   2. Programmatic API:")
    print("      from modules.forecast_risk import RiskForecast")
    print("      forecaster = RiskForecast()")
    print("      result = forecaster.analyze()")
    
    print("\n   3. Interactive CLI:")
    print("      python3 main.py")
    print("      # Select option 3: Execute Risk Forecast")
    
    print("\n   4. Decision Core Integration:")
    print("      from modules.forecast_risk import run_risk_forecast")
    print("      result = run_risk_forecast(timeframe=30)")


def main():
    """Main demo function"""
    print_header()
    
    print("\nThis demo showcases the Risk Forecast module capabilities:")
    print("• FMEA data loading from 8 critical maritime systems")
    print("• ASOG compliance data integration")
    print("• RPN calculation and statistical analysis")
    print("• Risk classification (HIGH/MODERATE/LOW)")
    print("• Automated recommendations")
    print("• JSON report generation")
    
    input("\nPress ENTER to start the demonstration...")
    
    # Initialize forecaster
    forecaster = RiskForecast()
    
    # Run demonstrations
    demonstrate_fmea_loading(forecaster)
    input("\nPress ENTER to continue...")
    
    demonstrate_asog_loading(forecaster)
    input("\nPress ENTER to continue...")
    
    demonstrate_rpn_calculation(forecaster)
    input("\nPress ENTER to continue...")
    
    demonstrate_risk_classification(forecaster)
    input("\nPress ENTER to continue...")
    
    demonstrate_asog_compliance(forecaster)
    input("\nPress ENTER to continue...")
    
    forecast = demonstrate_forecast_generation(forecaster)
    input("\nPress ENTER to continue...")
    
    demonstrate_report_saving(forecaster, forecast)
    input("\nPress ENTER to continue...")
    
    show_integration_info()
    
    print("\n" + "=" * 80)
    print("DEMO COMPLETED")
    print("=" * 80)
    print("\nThe Risk Forecast module is now ready for integration!")
    print("Check the generated 'demo_forecast_report.json' file for output example.")
    print("\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nDemo interrupted by user.")
    except Exception as e:
        print(f"\n\nError during demo: {e}")
