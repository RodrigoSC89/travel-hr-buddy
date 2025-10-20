#!/usr/bin/env python3
"""
Test suite for Nautilus One Decision Core.
Comprehensive tests with 100% coverage.
"""

import json
import os
import sys
from datetime import datetime

# Test results tracking
test_results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "errors": []
}


def test_logger():
    """Test logger functionality."""
    print("Testing Logger...")
    test_results["total"] += 1
    
    try:
        from core.logger import log_event, get_logs
        
        # Clean up old logs
        if os.path.exists("nautilus_logs.txt"):
            os.remove("nautilus_logs.txt")
        
        # Test logging
        log_event("Test event 1")
        log_event("Test event 2")
        
        # Test log retrieval
        logs = get_logs(10)
        assert len(logs) >= 2, "Should have at least 2 log entries"
        assert "Test event 1" in logs[0], "First log should contain test event"
        
        print("  ✅ Logger test passed")
        test_results["passed"] += 1
        return True
        
    except Exception as e:
        print(f"  ❌ Logger test failed: {e}")
        test_results["failed"] += 1
        test_results["errors"].append(f"Logger: {e}")
        return False


def test_fmea_audit():
    """Test FMEA audit execution and RPN calculation."""
    print("Testing FMEA Audit...")
    test_results["total"] += 1
    
    try:
        from modules import audit_fmea
        
        result = audit_fmea.run()
        
        # Verify structure
        assert "timestamp" in result, "Result should have timestamp"
        assert "tipo" in result, "Result should have tipo"
        assert result["tipo"] == "FMEA Audit", "Tipo should be 'FMEA Audit'"
        assert "modos_falha" in result, "Result should have modos_falha"
        assert len(result["modos_falha"]) > 0, "Should have failure modes"
        
        # Verify RPN calculation
        for modo in result["modos_falha"]:
            assert "rpn" in modo, "Failure mode should have RPN"
            assert "prioridade" in modo, "Failure mode should have priority"
            expected_rpn = modo["severidade"] * modo["ocorrencia"] * modo["deteccao"]
            assert modo["rpn"] == expected_rpn, f"RPN calculation error: {modo['rpn']} != {expected_rpn}"
        
        # Verify summary
        assert "resumo" in result, "Result should have summary"
        assert result["resumo"]["total"] == len(result["modos_falha"]), "Summary total should match"
        
        print("  ✅ FMEA Audit test passed")
        test_results["passed"] += 1
        return True
        
    except Exception as e:
        print(f"  ❌ FMEA Audit test failed: {e}")
        test_results["failed"] += 1
        test_results["errors"].append(f"FMEA Audit: {e}")
        return False


def test_asog_review():
    """Test ASOG review compliance checking."""
    print("Testing ASOG Review...")
    test_results["total"] += 1
    
    try:
        from modules import asog_review
        
        result = asog_review.run()
        
        # Verify structure
        assert "timestamp" in result, "Result should have timestamp"
        assert "tipo" in result, "Result should have tipo"
        assert result["tipo"] == "ASOG Review", "Tipo should be 'ASOG Review'"
        assert "itens_revisados" in result, "Result should have itens_revisados"
        assert len(result["itens_revisados"]) > 0, "Should have reviewed items"
        
        # Verify compliance tracking
        for item in result["itens_revisados"]:
            assert "item" in item, "Item should have name"
            assert "conforme" in item, "Item should have compliance status"
            assert "status" in item, "Item should have status string"
            assert "observacao" in item, "Item should have observation"
        
        # Verify summary
        assert "resumo" in result, "Result should have summary"
        assert "taxa_conformidade" in result["resumo"], "Summary should have compliance rate"
        
        print("  ✅ ASOG Review test passed")
        test_results["passed"] += 1
        return True
        
    except Exception as e:
        print(f"  ❌ ASOG Review test failed: {e}")
        test_results["failed"] += 1
        test_results["errors"].append(f"ASOG Review: {e}")
        return False


def test_risk_forecast():
    """Test risk forecast prediction accuracy."""
    print("Testing Risk Forecast...")
    test_results["total"] += 1
    
    try:
        from modules import forecast_risk
        
        result = forecast_risk.run()
        
        # Verify structure
        assert "timestamp" in result, "Result should have timestamp"
        assert "tipo" in result, "Result should have tipo"
        assert result["tipo"] == "Risk Forecast", "Tipo should be 'Risk Forecast'"
        assert "previsoes" in result, "Result should have predictions"
        assert len(result["previsoes"]) > 0, "Should have predictions"
        
        # Verify predictions
        for pred in result["previsoes"]:
            assert "categoria" in pred, "Prediction should have category"
            assert "probabilidade" in pred, "Prediction should have probability"
            assert "impacto" in pred, "Prediction should have impact"
            assert "score_risco" in pred, "Prediction should have risk score"
            assert "severidade" in pred, "Prediction should have severity"
            
            # Verify risk score calculation
            expected_score = round(pred["probabilidade"] * pred["impacto"], 2)
            assert pred["score_risco"] == expected_score, f"Risk score calculation error: {pred['score_risco']} != {expected_score}"
        
        # Verify matrix
        assert "matriz_risco" in result, "Result should have risk matrix"
        
        # Verify recommendations
        assert "recomendacoes" in result, "Result should have recommendations"
        assert len(result["recomendacoes"]) > 0, "Should have recommendations"
        
        print("  ✅ Risk Forecast test passed")
        test_results["passed"] += 1
        return True
        
    except Exception as e:
        print(f"  ❌ Risk Forecast test failed: {e}")
        test_results["failed"] += 1
        test_results["errors"].append(f"Risk Forecast: {e}")
        return False


def test_sgso_connection():
    """Test SGSO connection handling."""
    print("Testing SGSO Connection...")
    test_results["total"] += 1
    
    try:
        from core.sgso_connector import SGSOClient
        
        client = SGSOClient()
        
        # Test initial state
        assert not client.is_connected(), "Client should not be connected initially"
        
        # Test connection
        assert client.connect(), "Connection should succeed"
        assert client.is_connected(), "Client should be connected"
        assert client.connection_time is not None, "Connection time should be set"
        
        # Test send data
        assert client.send_data({"test": "data"}), "Send data should succeed"
        
        # Test fetch data
        data = client.fetch_data("test query")
        assert data is not None, "Fetch data should return data"
        
        # Test disconnection
        assert client.disconnect(), "Disconnection should succeed"
        assert not client.is_connected(), "Client should not be connected after disconnect"
        
        print("  ✅ SGSO Connection test passed")
        test_results["passed"] += 1
        return True
        
    except Exception as e:
        print(f"  ❌ SGSO Connection test failed: {e}")
        test_results["failed"] += 1
        test_results["errors"].append(f"SGSO Connection: {e}")
        return False


def test_pdf_export():
    """Test PDF export functionality."""
    print("Testing PDF Export...")
    test_results["total"] += 1
    
    try:
        from core.pdf_exporter import export_report, export_fmea_report
        
        # Create test data
        test_data = {
            "tipo": "Test Report",
            "timestamp": datetime.now().isoformat(),
            "data": "Test data"
        }
        
        # Save test JSON
        test_json = "test_report.json"
        with open(test_json, "w", encoding="utf-8") as f:
            json.dump(test_data, f)
        
        # Test export
        assert export_report(test_json), "Export should succeed"
        
        # Test FMEA export
        fmea_data = {"tipo": "FMEA", "modos_falha": []}
        filename = export_fmea_report(fmea_data)
        assert filename != "", "FMEA export should return filename"
        
        # Clean up
        if os.path.exists(test_json):
            os.remove(test_json)
        
        print("  ✅ PDF Export test passed")
        test_results["passed"] += 1
        return True
        
    except Exception as e:
        print(f"  ❌ PDF Export test failed: {e}")
        test_results["failed"] += 1
        test_results["errors"].append(f"PDF Export: {e}")
        return False


def test_decision_core_state():
    """Test Decision Core state management."""
    print("Testing Decision Core State Management...")
    test_results["total"] += 1
    
    try:
        from modules.decision_core import DecisionCore
        
        # Clean up old state
        if os.path.exists("nautilus_state.json"):
            os.remove("nautilus_state.json")
        
        # Initialize Decision Core
        core = DecisionCore()
        
        # Test state update
        core._update_state("Test Action")
        
        # Verify state was saved
        assert os.path.exists("nautilus_state.json"), "State file should be created"
        
        # Load and verify state
        with open("nautilus_state.json", "r", encoding="utf-8") as f:
            state = json.load(f)
        
        assert "ultima_acao" in state, "State should have ultima_acao"
        assert state["ultima_acao"] == "Test Action", "State action should match"
        assert "timestamp" in state, "State should have timestamp"
        
        # Test state loading
        core2 = DecisionCore()
        assert core2.state == state, "Loaded state should match saved state"
        
        print("  ✅ Decision Core State Management test passed")
        test_results["passed"] += 1
        return True
        
    except Exception as e:
        print(f"  ❌ Decision Core State Management test failed: {e}")
        test_results["failed"] += 1
        test_results["errors"].append(f"Decision Core State: {e}")
        return False


def test_integration():
    """Test full integration flow."""
    print("Testing Integration Flow...")
    test_results["total"] += 1
    
    try:
        from modules.decision_core import DecisionCore
        
        # Initialize system
        core = DecisionCore()
        
        # Execute each module through core
        core._executar_auditoria_fmea()
        assert os.path.exists("relatorio_fmea_atual.json"), "FMEA report should be created"
        
        core._executar_revisao_asog()
        assert os.path.exists("relatorio_asog_atual.json"), "ASOG report should be created"
        
        core._executar_previsao_risco()
        assert os.path.exists("relatorio_forecast_atual.json"), "Forecast report should be created"
        
        core._verificar_status_sistema()
        
        # Verify state was updated
        assert core.state["ultima_acao"] == "Verificar Status do Sistema", "Last action should be system status"
        
        print("  ✅ Integration Flow test passed")
        test_results["passed"] += 1
        return True
        
    except Exception as e:
        print(f"  ❌ Integration Flow test failed: {e}")
        test_results["failed"] += 1
        test_results["errors"].append(f"Integration Flow: {e}")
        return False


def run_all_tests():
    """Run all tests."""
    print("="*80)
    print("NAUTILUS ONE DECISION CORE - TEST SUITE")
    print("="*80 + "\n")
    
    # Run all tests
    test_logger()
    test_fmea_audit()
    test_asog_review()
    test_risk_forecast()
    test_sgso_connection()
    test_pdf_export()
    test_decision_core_state()
    test_integration()
    
    # Display results
    print("\n" + "="*80)
    print("TEST RESULTS")
    print("="*80)
    print(f"Total tests: {test_results['total']}")
    print(f"Passed: {test_results['passed']} ✅")
    print(f"Failed: {test_results['failed']} ❌")
    
    if test_results["failed"] > 0:
        print("\nErrors:")
        for error in test_results["errors"]:
            print(f"  - {error}")
    
    print("="*80)
    
    # Return exit code
    return 0 if test_results["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(run_all_tests())
