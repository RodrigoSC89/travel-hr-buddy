"""
Test script for Nautilus One Decision Core
Demonstrates functionality without requiring user input
"""
import sys
from modules.decision_core import DecisionCore
from modules.audit_fmea import FMEAAuditor
from modules.asog_review import ASOGModule
from modules.forecast_risk import RiskForecast
from core.sgso_connector import SGSOClient
from core.pdf_exporter import export_report
from core.logger import log_event


def test_logger():
    """Test logging functionality"""
    print("\n" + "=" * 80)
    print("TEST 1: Logger Module")
    print("=" * 80)
    log_event("Test: Logger initialized")
    print("✅ Logger test passed")


def test_fmea_auditor():
    """Test FMEA auditor"""
    print("\n" + "=" * 80)
    print("TEST 2: FMEA Auditor Module")
    print("=" * 80)
    auditor = FMEAAuditor()
    auditor.run()
    print("✅ FMEA Auditor test passed")


def test_asog_review():
    """Test ASOG review"""
    print("\n" + "=" * 80)
    print("TEST 3: ASOG Review Module")
    print("=" * 80)
    asog = ASOGModule()
    asog.start()
    print("✅ ASOG Review test passed")


def test_forecast():
    """Test risk forecast"""
    print("\n" + "=" * 80)
    print("TEST 4: Risk Forecast Module")
    print("=" * 80)
    forecast = RiskForecast()
    forecast.analyze()
    print("✅ Risk Forecast test passed")


def test_sgso_connector():
    """Test SGSO connector"""
    print("\n" + "=" * 80)
    print("TEST 5: SGSO Connector Module")
    print("=" * 80)
    sgso = SGSOClient()
    sgso.connect()
    sgso.disconnect()
    print("✅ SGSO Connector test passed")


def test_pdf_exporter():
    """Test PDF exporter"""
    print("\n" + "=" * 80)
    print("TEST 6: PDF Exporter Module")
    print("=" * 80)
    export_report("relatorio_fmea_atual.json")
    print("✅ PDF Exporter test passed")


def test_decision_core():
    """Test Decision Core initialization"""
    print("\n" + "=" * 80)
    print("TEST 7: Decision Core Module")
    print("=" * 80)
    core = DecisionCore()
    print(f"✅ Decision Core initialized")
    print(f"   State file: {core.state_file}")
    print(f"   Current state: {core.state}")
    print("✅ Decision Core test passed")


def main():
    """Run all tests"""
    print("""
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                                                                      ║
    ║                🧪 NAUTILUS ONE - Test Suite                         ║
    ║                   Decision Core System                              ║
    ║                                                                      ║
    ╚══════════════════════════════════════════════════════════════════════╝
    """)
    
    tests = [
        ("Logger", test_logger),
        ("FMEA Auditor", test_fmea_auditor),
        ("ASOG Review", test_asog_review),
        ("Risk Forecast", test_forecast),
        ("SGSO Connector", test_sgso_connector),
        ("PDF Exporter", test_pdf_exporter),
        ("Decision Core", test_decision_core),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            test_func()
            passed += 1
        except Exception as e:
            print(f"❌ {test_name} test failed: {str(e)}")
            failed += 1
    
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total tests: {len(tests)}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed successfully!")
        return 0
    else:
        print(f"\n⚠️ {failed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
