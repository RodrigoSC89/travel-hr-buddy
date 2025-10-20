"""
Unit tests for BridgeLink module
"""

import unittest
import json
import os
import sys
from unittest.mock import patch, mock_open, MagicMock

# Add current directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from modules.bridge_link import BridgeLink
from core.logger import log_event


class TestLogger(unittest.TestCase):
    """Test cases for the logger module"""
    
    @patch('builtins.open', new_callable=mock_open)
    @patch('builtins.print')
    def test_log_event_success(self, mock_print, mock_file):
        """Test that log_event writes to file and prints to console"""
        log_event("Test message")
        
        # Check that print was called
        mock_print.assert_called()
        call_args = str(mock_print.call_args)
        self.assertIn("Test message", call_args)
        
        # Check that file was opened for writing
        mock_file.assert_called_with("nautilus_system.log", "a", encoding="utf-8")


class TestBridgeLink(unittest.TestCase):
    """Test cases for the BridgeLink module"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.bridge = BridgeLink()
    
    def test_init_with_config_file(self):
        """Test initialization with config file"""
        config_data = {
            "endpoint": "https://test.api.com/upload",
            "auth_token": "Bearer TEST-TOKEN"
        }
        
        with patch('os.path.exists', return_value=True):
            with patch('builtins.open', mock_open(read_data=json.dumps(config_data))):
                bridge = BridgeLink()
                
                self.assertEqual(bridge.endpoint, "https://test.api.com/upload")
                self.assertEqual(bridge.headers["Authorization"], "Bearer TEST-TOKEN")
    
    def test_init_without_config_file(self):
        """Test initialization without config file"""
        with patch('os.path.exists', return_value=False):
            bridge = BridgeLink()
            
            self.assertEqual(bridge.endpoint, "https://api.sgso.nautilus.one/upload")
            self.assertIn("Authorization", bridge.headers)
    
    def test_carregar_arquivo_success(self):
        """Test loading a valid JSON file"""
        test_data = {"test": "data", "value": 123}
        
        with patch('builtins.open', mock_open(read_data=json.dumps(test_data))):
            result = self.bridge.carregar_arquivo("test.json")
            
            self.assertEqual(result, test_data)
    
    def test_carregar_arquivo_not_found(self):
        """Test loading a non-existent file"""
        with patch('builtins.open', side_effect=FileNotFoundError):
            result = self.bridge.carregar_arquivo("nonexistent.json")
            
            self.assertIsNone(result)
    
    def test_carregar_arquivo_invalid_json(self):
        """Test loading an invalid JSON file"""
        with patch('builtins.open', mock_open(read_data="invalid json")):
            result = self.bridge.carregar_arquivo("invalid.json")
            
            self.assertIsNone(result)
    
    @patch('modules.bridge_link.requests.post')
    def test_enviar_relatorio_success(self, mock_post):
        """Test successful report transmission"""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response
        
        test_data = {"test": "data"}
        result = self.bridge.enviar_relatorio("TEST_REPORT", test_data)
        
        self.assertTrue(result)
        mock_post.assert_called_once()
        
        # Verify payload structure
        call_kwargs = mock_post.call_args[1]
        payload = call_kwargs['json']
        self.assertEqual(payload['report_name'], "TEST_REPORT")
        self.assertEqual(payload['data'], test_data)
        self.assertIn('timestamp', payload)
    
    @patch('modules.bridge_link.requests.post')
    def test_enviar_relatorio_http_error(self, mock_post):
        """Test report transmission with HTTP error"""
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_post.return_value = mock_response
        
        test_data = {"test": "data"}
        result = self.bridge.enviar_relatorio("TEST_REPORT", test_data)
        
        self.assertFalse(result)
    
    @patch('modules.bridge_link.requests.post')
    def test_enviar_relatorio_connection_error(self, mock_post):
        """Test report transmission with connection error"""
        from requests.exceptions import RequestException
        mock_post.side_effect = RequestException("Connection error")
        
        test_data = {"test": "data"}
        result = self.bridge.enviar_relatorio("TEST_REPORT", test_data)
        
        self.assertFalse(result)
    
    @patch.object(BridgeLink, 'carregar_arquivo')
    @patch.object(BridgeLink, 'enviar_relatorio')
    def test_sincronizar_all_files(self, mock_enviar, mock_carregar):
        """Test synchronization of all report files"""
        mock_carregar.return_value = {"test": "data"}
        mock_enviar.return_value = True
        
        self.bridge.sincronizar()
        
        # Should attempt to load and send all 4 reports
        self.assertEqual(mock_carregar.call_count, 4)
        self.assertEqual(mock_enviar.call_count, 4)
    
    @patch.object(BridgeLink, 'carregar_arquivo')
    @patch.object(BridgeLink, 'enviar_relatorio')
    def test_sincronizar_missing_files(self, mock_enviar, mock_carregar):
        """Test synchronization with some missing files"""
        # Simulate some files not found
        mock_carregar.side_effect = [{"data": "1"}, None, {"data": "3"}, None]
        mock_enviar.return_value = True
        
        self.bridge.sincronizar()
        
        # Should attempt to load all 4 files
        self.assertEqual(mock_carregar.call_count, 4)
        # Should only send the 2 files that were loaded successfully
        self.assertEqual(mock_enviar.call_count, 2)
    
    def test_files_dictionary_structure(self):
        """Test that the files dictionary has the expected structure"""
        expected_keys = ["FMEA", "ASOG", "FORECAST", "AUTO_REPORT"]
        
        for key in expected_keys:
            self.assertIn(key, self.bridge.files)
            self.assertTrue(self.bridge.files[key].endswith('.json'))


class TestIntegration(unittest.TestCase):
    """Integration tests for BridgeLink module"""
    
    def test_sample_files_exist(self):
        """Test that all sample report files exist"""
        expected_files = [
            "relatorio_fmea_atual.json",
            "asog_report.json",
            "forecast_risco.json",
            "nautilus_full_report.json"
        ]
        
        for filename in expected_files:
            self.assertTrue(
                os.path.exists(filename),
                f"Sample file {filename} should exist"
            )
    
    def test_sample_files_valid_json(self):
        """Test that all sample report files contain valid JSON"""
        expected_files = [
            "relatorio_fmea_atual.json",
            "asog_report.json",
            "forecast_risco.json",
            "nautilus_full_report.json"
        ]
        
        for filename in expected_files:
            if os.path.exists(filename):
                with open(filename, 'r', encoding='utf-8') as f:
                    try:
                        data = json.load(f)
                        self.assertIsInstance(data, dict)
                        self.assertIn('report_type', data)
                    except json.JSONDecodeError:
                        self.fail(f"File {filename} contains invalid JSON")
    
    def test_config_file_valid_json(self):
        """Test that config.json is valid"""
        if os.path.exists("config.json"):
            with open("config.json", 'r', encoding='utf-8') as f:
                config = json.load(f)
                self.assertIn('endpoint', config)
                self.assertIn('auth_token', config)


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)
