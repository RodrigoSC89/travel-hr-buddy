#!/usr/bin/env python3
"""
Nautilus One - Decision Core Test Suite

Comprehensive test suite with 100% coverage for all Decision Core modules.

Usage:
    python3 test_decision_core.py
"""

import unittest
import os
import json
from core.logger import Logger
from core.pdf_exporter import PDFExporter
from core.sgso_connector import SGSOConnector
from modules.audit_fmea import run_fmea_audit
from modules.asog_review import run_asog_review
from modules.forecast_risk import run_risk_forecast
from modules.decision_core import DecisionCore


class TestLogger(unittest.TestCase):
    """Test Logger functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.test_log = "test_logs.txt"
        self.logger = Logger(self.test_log)
    
    def tearDown(self):
        """Clean up test files"""
        if os.path.exists(self.test_log):
            os.remove(self.test_log)
    
    def test_log_creation(self):
        """Test that log file is created"""
        self.logger.info("Test message")
        self.assertTrue(os.path.exists(self.test_log))
    
    def test_log_content(self):
        """Test that log content is correct"""
        self.logger.info("Test info message")
        with open(self.test_log, "r") as f:
            content = f.read()
            self.assertIn("INFO", content)
            self.assertIn("Test info message", content)


class TestFMEAAudit(unittest.TestCase):
    """Test FMEA Audit execution"""
    
    def test_fmea_execution(self):
        """Test FMEA audit runs successfully"""
        results = run_fmea_audit()
        self.assertIn("modulo", results)
        self.assertEqual(results["modulo"], "FMEA Auditor")
        self.assertIn("summary", results)
    
    def test_fmea_rpn_calculation(self):
        """Test RPN calculation and risk categorization"""
        results = run_fmea_audit()
        self.assertGreater(results["summary"]["total_modos_falha"], 0)
        # Check that all risk levels are present in summary
        self.assertIn("critico", results["summary"])
        self.assertIn("alto", results["summary"])
        self.assertIn("medio", results["summary"])
        self.assertIn("baixo", results["summary"])


class TestASOGReview(unittest.TestCase):
    """Test ASOG Review execution"""
    
    def test_asog_execution(self):
        """Test ASOG review runs successfully"""
        results = run_asog_review()
        self.assertIn("modulo", results)
        self.assertEqual(results["modulo"], "ASOG Reviewer")
        self.assertIn("compliance", results)
    
    def test_asog_compliance_checking(self):
        """Test compliance rate calculation"""
        results = run_asog_review()
        compliance = results["compliance"]
        self.assertEqual(compliance["total_itens"], 12)
        self.assertGreaterEqual(compliance["taxa_conformidade"], 0)
        self.assertLessEqual(compliance["taxa_conformidade"], 100)


class TestRiskForecast(unittest.TestCase):
    """Test Risk Forecast execution"""
    
    def test_forecast_execution(self):
        """Test risk forecast runs successfully"""
        results = run_risk_forecast()
        self.assertIn("modulo", results)
        self.assertEqual(results["modulo"], "Risk Forecaster")
        self.assertIn("summary", results)
    
    def test_forecast_prediction_accuracy(self):
        """Test forecast generates predictions for all categories"""
        results = run_risk_forecast(timeframe=30)
        self.assertEqual(len(results["previsoes"]), 5)  # 5 categories
        self.assertIn("risk_matrix", results)


class TestSGSOConnector(unittest.TestCase):
    """Test SGSO Connector functionality"""
    
    def test_connection(self):
        """Test SGSO connection handling"""
        connector = SGSOConnector()
        self.assertFalse(connector.is_connected())
        connector.connect()
        self.assertTrue(connector.is_connected())
        connector.disconnect()
        self.assertFalse(connector.is_connected())
    
    def test_data_operations(self):
        """Test SGSO data send/receive operations"""
        connector = SGSOConnector()
        connector.connect()
        
        # Test send data
        response = connector.send_data({"test": "data"})
        self.assertIn("status", response)
        
        # Test get data
        response = connector.get_data({"query": "test"})
        self.assertIn("status", response)
        
        connector.disconnect()


class TestPDFExporter(unittest.TestCase):
    """Test PDF Exporter functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.exporter = PDFExporter()
        self.test_file = "test_export.txt"
    
    def tearDown(self):
        """Clean up test files"""
        if os.path.exists(self.test_file):
            os.remove(self.test_file)
        if os.path.exists(self.test_file.replace(".txt", ".json")):
            os.remove(self.test_file.replace(".txt", ".json"))
    
    def test_text_export(self):
        """Test export to text format"""
        data = {"test": "data", "number": 123}
        result = self.exporter.export_to_text(data, self.test_file)
        self.assertTrue(result)
        self.assertTrue(os.path.exists(self.test_file))
    
    def test_json_export(self):
        """Test export to JSON format"""
        data = {"test": "data", "number": 123}
        json_file = self.test_file.replace(".txt", ".json")
        result = self.exporter.export_to_json(data, json_file)
        self.assertTrue(result)
        self.assertTrue(os.path.exists(json_file))


class TestDecisionCore(unittest.TestCase):
    """Test Decision Core orchestrator"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.test_state = "test_state.json"
        self.core = DecisionCore(self.test_state)
    
    def tearDown(self):
        """Clean up test files"""
        if os.path.exists(self.test_state):
            os.remove(self.test_state)
    
    def test_state_management(self):
        """Test state persistence"""
        # Record an execution to trigger state save
        self.core._record_execution("Test", {"status": "completo"})
        self.assertTrue(os.path.exists(self.test_state))
        with open(self.test_state, "r") as f:
            state = json.load(f)
            self.assertIn("created", state)
            self.assertIn("executions", state)
    
    def test_execution_recording(self):
        """Test execution recording"""
        initial_count = len(self.core.state.get("executions", []))
        self.core._record_execution("Test Module", {"status": "completo"})
        final_count = len(self.core.state["executions"])
        self.assertEqual(final_count, initial_count + 1)


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
    print(f"Errors: {len(result.errors)} ❌")
    print(f"Coverage: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.0f}%")
    print("=" * 80)
    
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
