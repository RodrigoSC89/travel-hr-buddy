#!/usr/bin/env python3
"""
Nautilus One - Risk Forecast Module Test Suite

Comprehensive test suite for the FMEA/ASOG Risk Forecast module.
Tests data loading, RPN calculations, risk classification, ASOG compliance,
and report generation.

Usage:
    python3 test_forecast_module.py
"""

import unittest
import os
import json
from modules.forecast_risk import RiskForecast, run_risk_forecast


class TestRiskForecastModule(unittest.TestCase):
    """Test Risk Forecast Module functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.forecaster = RiskForecast()
        self.test_report = "test_forecast.json"
    
    def tearDown(self):
        """Clean up test files"""
        if os.path.exists(self.test_report):
            os.remove(self.test_report)
    
    def test_module_initialization(self):
        """Test module initializes correctly"""
        self.assertIsNotNone(self.forecaster)
        self.assertEqual(self.forecaster.fmea_file, "relatorio_fmea_atual.json")
        self.assertEqual(self.forecaster.asog_file, "asog_report.json")
    
    def test_load_fmea_data(self):
        """Test FMEA data loading"""
        data = self.forecaster.carregar_dados_fmea()
        self.assertIsNotNone(data)
        self.assertIn("sistemas_criticos", data)
        self.assertEqual(len(data["sistemas_criticos"]), 8)
    
    def test_load_asog_data(self):
        """Test ASOG data loading"""
        data = self.forecaster.carregar_dados_asog()
        self.assertIsNotNone(data)
        self.assertIn("parametros_operacionais", data)
        self.assertEqual(len(data["parametros_operacionais"]), 12)
    
    def test_calculate_average_rpn(self):
        """Test RPN average calculation"""
        self.forecaster.carregar_dados_fmea()
        rpn_medio = self.forecaster.calcular_rpn_medio()
        self.assertGreater(rpn_medio, 0)
        self.assertIsInstance(rpn_medio, float)
        # Based on sample data, should be around 73.5
        self.assertGreater(rpn_medio, 50)
        self.assertLess(rpn_medio, 150)
    
    def test_calculate_variability(self):
        """Test RPN variability (standard deviation) calculation"""
        self.forecaster.carregar_dados_fmea()
        variabilidade = self.forecaster.calcular_variabilidade()
        self.assertGreater(variabilidade, 0)
        self.assertIsInstance(variabilidade, float)
    
    def test_risk_classification_low(self):
        """Test risk classification for LOW risk"""
        nivel, emoji, desc = self.forecaster.classificar_risco(100)
        self.assertEqual(nivel, "BAIXA")
        self.assertEqual(emoji, "🟢")
        self.assertIn("normal", desc.lower())
    
    def test_risk_classification_moderate(self):
        """Test risk classification for MODERATE risk"""
        nivel, emoji, desc = self.forecaster.classificar_risco(175)
        self.assertEqual(nivel, "MODERADA")
        self.assertEqual(emoji, "🟡")
        self.assertIn("monitoramento", desc.lower())
    
    def test_risk_classification_high(self):
        """Test risk classification for HIGH risk"""
        nivel, emoji, desc = self.forecaster.classificar_risco(250)
        self.assertEqual(nivel, "ALTA")
        self.assertEqual(emoji, "🔴")
        self.assertIn("imediata", desc.lower())
    
    def test_asog_compliance_verification(self):
        """Test ASOG compliance status verification"""
        self.forecaster.carregar_dados_asog()
        status, desc = self.forecaster.verificar_conformidade_asog()
        self.assertIn(status, ["conforme", "atencao", "fora_limites", "sem_dados"])
        self.assertIsInstance(desc, str)
        # Based on sample data, should be compliant
        self.assertEqual(status, "conforme")
    
    def test_recommendation_generation(self):
        """Test recommendation generation"""
        rec_low = self.forecaster.gerar_recomendacao("BAIXA", "conforme")
        self.assertIn("🟢", rec_low)
        
        rec_moderate = self.forecaster.gerar_recomendacao("MODERADA", "conforme")
        self.assertIn("🟡", rec_moderate)
        
        rec_high = self.forecaster.gerar_recomendacao("ALTA", "conforme")
        self.assertIn("🔴", rec_high)
    
    def test_generate_forecast(self):
        """Test complete forecast generation"""
        forecast = self.forecaster.gerar_previsao()
        self.assertIsNotNone(forecast)
        self.assertIn("timestamp", forecast)
        self.assertIn("risco_previsto", forecast)
        self.assertIn("rpn_medio", forecast)
        self.assertIn("variabilidade", forecast)
        self.assertIn("status_operacional", forecast)
        self.assertIn("recomendacao", forecast)
    
    def test_save_report(self):
        """Test forecast report saving"""
        forecast = self.forecaster.gerar_previsao()
        result = self.forecaster.salvar_relatorio(forecast, self.test_report)
        self.assertTrue(result)
        self.assertTrue(os.path.exists(self.test_report))
        
        # Verify saved content
        with open(self.test_report, "r", encoding="utf-8") as f:
            saved_data = json.load(f)
        self.assertEqual(saved_data["risco_previsto"], forecast["risco_previsto"])
    
    def test_analyze_method(self):
        """Test complete analyze workflow"""
        result = self.forecaster.analyze()
        self.assertIsNotNone(result)
        self.assertIn("risco_previsto", result)
        # Check that default forecast file was created
        self.assertTrue(os.path.exists("forecast_risco.json"))
        # Clean up
        if os.path.exists("forecast_risco.json"):
            os.remove("forecast_risco.json")
    
    def test_legacy_function_compatibility(self):
        """Test backward compatibility with old run_risk_forecast function"""
        result = run_risk_forecast(30)
        self.assertIsNotNone(result)
        self.assertEqual(result["modulo"], "Risk Forecaster")
        self.assertIn("summary", result)
        self.assertEqual(result["status"], "completo")
    
    def test_missing_fmea_file(self):
        """Test handling of missing FMEA file"""
        forecaster = RiskForecast(fmea_file="nonexistent.json")
        data = forecaster.carregar_dados_fmea()
        self.assertIsNone(data)
    
    def test_missing_asog_file(self):
        """Test handling of missing ASOG file"""
        forecaster = RiskForecast(asog_file="nonexistent.json")
        data = forecaster.carregar_dados_asog()
        self.assertIsNone(data)
    
    def test_forecast_without_data(self):
        """Test forecast generation without data files"""
        forecaster = RiskForecast(fmea_file="nonexistent.json")
        forecast = forecaster.gerar_previsao()
        self.assertIn("erro", forecast)
    
    def test_data_structure_validation(self):
        """Test that loaded data has correct structure"""
        self.forecaster.carregar_dados_fmea()
        self.forecaster.carregar_dados_asog()
        
        # Validate FMEA structure
        self.assertIsNotNone(self.forecaster.fmea_data)
        self.assertIn("timestamp", self.forecaster.fmea_data)
        self.assertIn("sistemas_criticos", self.forecaster.fmea_data)
        
        # Validate ASOG structure
        self.assertIsNotNone(self.forecaster.asog_data)
        self.assertIn("timestamp", self.forecaster.asog_data)
        self.assertIn("compliance_summary", self.forecaster.asog_data)
    
    def test_rpn_calculation_accuracy(self):
        """Test RPN calculation accuracy with sample data"""
        self.forecaster.carregar_dados_fmea()
        rpn_medio = self.forecaster.calcular_rpn_medio()
        
        # Manually calculate expected average from sample data
        # Sum of all RPNs: 108+48+40+108+48+60+56+96+54+36+63+32+20+105+96+54+40 = 1064
        # Count: 17 failure modes
        # Average: 1064 / 17 = 62.59
        expected_avg = 62.59
        # Allow 5% tolerance
        self.assertAlmostEqual(rpn_medio, expected_avg, delta=expected_avg * 0.05)


def run_tests():
    """Run all tests and display results"""
    print("=" * 80)
    print("NAUTILUS ONE - RISK FORECAST MODULE TEST SUITE")
    print("=" * 80)
    print()
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestRiskForecastModule)
    
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
    if result.testsRun > 0:
        success_rate = ((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100)
        print(f"Success rate: {success_rate:.0f}%")
    print("=" * 80)
    
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
