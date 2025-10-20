#!/usr/bin/env python3
"""
Test Suite for Decision Core System
Provides comprehensive testing for all modules
"""
import unittest
import os
import json
from pathlib import Path

# Import modules to test
from core.logger import log_event, get_logs
from core.pdf_exporter import export_report, create_report_json
from core.sgso_connector import SGSOClient
from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import run_risk_forecast
from modules.decision_core import DecisionCore


class TestLogger(unittest.TestCase):
    """Test Logger functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_log = "test_logs.txt"
        if Path(self.test_log).exists():
            os.remove(self.test_log)
    
    def tearDown(self):
        """Clean up test files"""
        if Path(self.test_log).exists():
            os.remove(self.test_log)
    
    def test_log_event(self):
        """Test logging events"""
        log_event("Test message", self.test_log)
        
        # Verify log file was created
        self.assertTrue(Path(self.test_log).exists())
        
        # Verify content
        with open(self.test_log, "r") as f:
            content = f.read()
            self.assertIn("Test message", content)
    
    def test_get_logs(self):
        """Test retrieving logs"""
        # Create some log entries
        for i in range(10):
            log_event(f"Message {i}", self.test_log)
        
        # Get logs
        logs = get_logs(self.test_log, lines=5)
        
        # Verify we got 5 logs
        self.assertEqual(len(logs), 5)
        
        # Verify they're the last 5
        self.assertIn("Message 9", logs[-1])


class TestFMEAAudit(unittest.TestCase):
    """Test FMEA Audit functionality"""
    
    def test_fmea_audit_execution(self):
        """Test FMEA audit runs successfully"""
        results = run_fmea_audit()
        
        # Verify results structure
        self.assertIn("timestamp", results)
        self.assertIn("audit_type", results)
        self.assertIn("failure_modes", results)
        self.assertIn("recommendations", results)
        self.assertIn("summary", results)
        
        # Verify audit type
        self.assertEqual(results["audit_type"], "FMEA")
        
        # Verify we have failure modes
        self.assertGreater(len(results["failure_modes"]), 0)
    
    def test_fmea_rpn_calculation(self):
        """Test RPN calculation in FMEA audit"""
        results = run_fmea_audit()
        
        # Verify all failure modes have RPN
        for mode in results["failure_modes"]:
            self.assertIn("rpn", mode)
            self.assertIn("priority", mode)
            
            # Verify RPN is calculated correctly
            expected_rpn = mode["severity"] * mode["occurrence"] * mode["detection"]
            self.assertEqual(mode["rpn"], expected_rpn)


class TestASOGReview(unittest.TestCase):
    """Test ASOG Review functionality"""
    
    def test_asog_review_execution(self):
        """Test ASOG review runs successfully"""
        results = run_asog_review()
        
        # Verify results structure
        self.assertIn("timestamp", results)
        self.assertIn("review_type", results)
        self.assertIn("items_status", results)
        self.assertIn("compliance", results)
        self.assertIn("recommendations", results)
        
        # Verify review type
        self.assertEqual(results["review_type"], "ASOG")
        
        # Verify we have items
        self.assertGreater(len(results["items_status"]), 0)
    
    def test_asog_compliance_checking(self):
        """Test compliance status checking"""
        results = run_asog_review()
        
        compliance = results["compliance"]
        
        # Verify compliance metrics
        self.assertIn("total_items", compliance)
        self.assertIn("conformes", compliance)
        self.assertIn("requer_atencao", compliance)
        self.assertIn("taxa_conformidade", compliance)
        
        # Verify total matches
        total = compliance["total_items"]
        self.assertEqual(
            total,
            compliance["conformes"] + compliance["requer_atencao"]
        )


class TestRiskForecast(unittest.TestCase):
    """Test Risk Forecast functionality"""
    
    def test_risk_forecast_execution(self):
        """Test risk forecast runs successfully"""
        results = run_risk_forecast(30)
        
        # Verify results structure
        self.assertIn("timestamp", results)
        self.assertIn("forecast_type", results)
        self.assertIn("predictions", results)
        self.assertIn("risk_matrix", results)
        self.assertIn("recommendations", results)
        
        # Verify timeframe
        self.assertEqual(results["timeframe_days"], 30)
    
    def test_risk_prediction_accuracy(self):
        """Test risk prediction calculations"""
        results = run_risk_forecast(30)
        
        # Verify we have predictions
        self.assertGreater(len(results["predictions"]), 0)
        
        # Verify each prediction has required fields
        for pred in results["predictions"]:
            self.assertIn("category", pred)
            self.assertIn("probability", pred)
            self.assertIn("impact", pred)
            self.assertIn("risk_score", pred)
            self.assertIn("risk_level", pred)
            
            # Verify probability is in valid range
            self.assertGreaterEqual(pred["probability"], 0)
            self.assertLessEqual(pred["probability"], 100)


class TestSGSOConnector(unittest.TestCase):
    """Test SGSO Connector functionality"""
    
    def test_sgso_connection(self):
        """Test SGSO connection"""
        client = SGSOClient()
        
        # Test connection
        connected = client.connect()
        self.assertTrue(connected)
        self.assertTrue(client.connected)
        self.assertIsNotNone(client.session_id)
        
        # Test disconnection
        disconnected = client.disconnect()
        self.assertTrue(disconnected)
        self.assertFalse(client.connected)
    
    def test_sgso_data_operations(self):
        """Test SGSO data send/fetch operations"""
        client = SGSOClient()
        client.connect()
        
        # Test send data
        test_data = {"type": "test", "value": 123}
        sent = client.send_data(test_data)
        self.assertTrue(sent)
        
        # Test fetch data
        query = {"filter": "test"}
        fetched = client.fetch_data(query)
        self.assertIsNotNone(fetched)
        self.assertIn("results", fetched)


class TestPDFExporter(unittest.TestCase):
    """Test PDF Exporter functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.test_json = "test_report.json"
        self.test_data = {
            "test_field": "test_value",
            "number": 123
        }
        
        # Create test JSON file
        with open(self.test_json, "w") as f:
            json.dump(self.test_data, f)
    
    def tearDown(self):
        """Clean up test files"""
        # Remove test files
        for pattern in ["test_report*", "relatorio_test*"]:
            for file in Path(".").glob(pattern):
                try:
                    os.remove(file)
                except:
                    pass
    
    def test_export_to_text(self):
        """Test exporting report to text"""
        output = export_report(self.test_json, "txt")
        
        # Verify output file was created
        self.assertTrue(output)
        self.assertTrue(Path(output).exists())
    
    def test_create_report_json(self):
        """Test creating report JSON"""
        data = {"test": "data"}
        filename = create_report_json("test", data)
        
        # Verify file was created
        self.assertTrue(filename)
        self.assertTrue(Path(filename).exists())
        
        # Verify content
        with open(filename, "r") as f:
            loaded = json.load(f)
            self.assertEqual(loaded["test"], "data")


class TestDecisionCore(unittest.TestCase):
    """Test Decision Core functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.state_file = "test_state.json"
        # Temporarily replace state file
        DecisionCore.STATE_FILE = self.state_file
    
    def tearDown(self):
        """Clean up test files"""
        DecisionCore.STATE_FILE = "nautilus_state.json"
        if Path(self.state_file).exists():
            os.remove(self.state_file)
    
    def test_decision_core_initialization(self):
        """Test Decision Core initialization"""
        dc = DecisionCore()
        
        # Verify state was initialized
        self.assertIsNotNone(dc.state)
        self.assertIn("ultima_acao", dc.state)
        self.assertIn("timestamp", dc.state)
    
    def test_state_management(self):
        """Test state save/load"""
        dc = DecisionCore()
        
        # Update state
        dc._update_state("Test action")
        
        # Verify state was updated
        self.assertEqual(dc.state["ultima_acao"], "Test action")
        
        # Verify state was saved
        self.assertTrue(Path(self.state_file).exists())
        
        # Load state in new instance
        dc2 = DecisionCore()
        self.assertEqual(dc2.state["ultima_acao"], "Test action")


def run_tests():
    """Run all tests and display results"""
    print("=" * 80)
    print("NAUTILUS ONE - DECISION CORE TEST SUITE")
    print("=" * 80)
    print()
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(TestLogger))
    suite.addTests(loader.loadTestsFromTestCase(TestFMEAAudit))
    suite.addTests(loader.loadTestsFromTestCase(TestASOGReview))
    suite.addTests(loader.loadTestsFromTestCase(TestRiskForecast))
    suite.addTests(loader.loadTestsFromTestCase(TestSGSOConnector))
    suite.addTests(loader.loadTestsFromTestCase(TestPDFExporter))
    suite.addTests(loader.loadTestsFromTestCase(TestDecisionCore))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Display summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total tests: {result.testsRun}")
    print(f"Passed: {result.testsRun - len(result.failures) - len(result.errors)} ✅")
    print(f"Failed: {len(result.failures)} ❌")
    print(f"Errors: {len(result.errors)} ⚠️")
    print("=" * 80)
    
    return result.wasSuccessful()


if __name__ == "__main__":
    import sys
    success = run_tests()
    sys.exit(0 if success else 1)
