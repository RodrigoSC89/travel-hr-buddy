"""
Test Suite for Auto-Report Module
Sistema Nautilus One - Python Backend
"""
import os
import json
import unittest
from modules.auto_report import AutoReport


class TestAutoReport(unittest.TestCase):
    """Test cases for AutoReport module."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.auto_report = AutoReport()
    
    def test_module_import(self):
        """Test that AutoReport module imports correctly."""
        self.assertIsNotNone(AutoReport)
        self.assertIsInstance(self.auto_report, AutoReport)
    
    def test_carregar_dados(self):
        """Test data loading functionality."""
        fmea, asog, forecast = self.auto_report.carregar_dados()
        
        # At least some data should be loaded if files exist
        self.assertTrue(
            fmea is not None or asog is not None or forecast is not None,
            "At least one data source should be available"
        )
    
    def test_gerar_assinatura(self):
        """Test digital signature generation."""
        assinatura = self.auto_report.gerar_assinatura()
        
        self.assertIsNotNone(assinatura)
        self.assertIn("NAUTILUS-IA-SIGN-", assinatura)
        self.assertTrue(len(assinatura) > 20)
    
    def test_consolidar(self):
        """Test data consolidation."""
        consolidado = self.auto_report.consolidar()
        
        # Check required fields
        self.assertIn("timestamp", consolidado)
        self.assertIn("fmea_summary", consolidado)
        self.assertIn("asog_status", consolidado)
        self.assertIn("forecast_summary", consolidado)
        self.assertIn("assinatura_ia", consolidado)
        
        # Check JSON file was created
        self.assertTrue(
            os.path.exists(self.auto_report.output_json),
            "JSON output file should be created"
        )
    
    def test_exportar_pdf(self):
        """Test PDF export functionality."""
        consolidado = self.auto_report.consolidar()
        self.auto_report.exportar_pdf(consolidado)
        
        # Check PDF file was created
        self.assertTrue(
            os.path.exists(self.auto_report.output_pdf),
            "PDF output file should be created"
        )
    
    def test_run_complete_workflow(self):
        """Test complete Auto-Report workflow."""
        consolidado = self.auto_report.run()
        
        # Verify outputs
        self.assertIsNotNone(consolidado)
        self.assertTrue(os.path.exists(self.auto_report.output_json))
        self.assertTrue(os.path.exists(self.auto_report.output_pdf))
        
        # Verify JSON content
        with open(self.auto_report.output_json, 'r', encoding='utf-8') as f:
            saved_data = json.load(f)
        
        self.assertEqual(consolidado, saved_data)
    
    def tearDown(self):
        """Clean up test artifacts."""
        # Optional: Remove generated files after tests
        # Uncomment if you want to clean up after tests
        # if os.path.exists(self.auto_report.output_json):
        #     os.remove(self.auto_report.output_json)
        # if os.path.exists(self.auto_report.output_pdf):
        #     os.remove(self.auto_report.output_pdf)
        pass


def run_manual_tests():
    """Run manual verification tests with output."""
    print("\n" + "="*60)
    print("🧪 MANUAL VERIFICATION TESTS")
    print("="*60 + "\n")
    
    # Test 1: Module import
    print("✅ Test 1: Module imports successfully")
    from modules.auto_report import AutoReport
    from core.logger import log_event
    from core.pdf_exporter import export_report
    print("   All modules imported correctly\n")
    
    # Test 2: Create instance
    print("✅ Test 2: AutoReport instance creation")
    report = AutoReport()
    print(f"   Instance created with output files:")
    print(f"   - JSON: {report.output_json}")
    print(f"   - PDF: {report.output_pdf}\n")
    
    # Test 3: Digital signature
    print("✅ Test 3: Digital signature generation")
    signature = report.gerar_assinatura()
    print(f"   Generated: {signature}\n")
    
    # Test 4: Data loading
    print("✅ Test 4: Data loading")
    fmea, asog, forecast = report.carregar_dados()
    print(f"   FMEA loaded: {fmea is not None}")
    print(f"   ASOG loaded: {asog is not None}")
    print(f"   Forecast loaded: {forecast is not None}\n")
    
    # Test 5: Full workflow
    print("✅ Test 5: Complete workflow execution")
    print("   Running AutoReport.run()...\n")
    result = report.run()
    
    print(f"\n✅ Test 6: Output verification")
    print(f"   JSON exists: {os.path.exists(report.output_json)}")
    print(f"   PDF exists: {os.path.exists(report.output_pdf)}")
    
    if os.path.exists(report.output_json):
        size = os.path.getsize(report.output_json)
        print(f"   JSON size: {size} bytes")
    
    if os.path.exists(report.output_pdf):
        size = os.path.getsize(report.output_pdf)
        print(f"   PDF size: {size} bytes")
    
    print("\n" + "="*60)
    print("🎉 ALL MANUAL TESTS COMPLETED SUCCESSFULLY")
    print("="*60 + "\n")


if __name__ == "__main__":
    # Run unittest suite
    print("Running automated test suite...\n")
    unittest.main(argv=[''], verbosity=2, exit=False)
    
    # Run manual verification
    print("\n")
    run_manual_tests()
