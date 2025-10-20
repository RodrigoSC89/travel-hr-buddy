"""
PDF Exporter Module - Report generation from JSON to PDF/text format

This module provides functionality to export analysis results to PDF and text formats.
"""

import json
import datetime


class PDFExporter:
    """Export reports from JSON to PDF/text format"""
    
    def __init__(self):
        """Initialize the PDF exporter"""
        pass
    
    def export_to_text(self, data, output_file):
        """
        Export data to a text file.
        
        Args:
            data (dict): The data to export
            output_file (str): Path to the output file
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with open(output_file, "w", encoding="utf-8") as f:
                f.write("=" * 80 + "\n")
                f.write("NAUTILUS ONE - DECISION CORE REPORT\n")
                f.write("=" * 80 + "\n")
                f.write(f"Generated: {datetime.datetime.now().isoformat()}\n")
                f.write("=" * 80 + "\n\n")
                
                self._write_dict(f, data, indent=0)
            
            return True
        except Exception as e:
            print(f"Error exporting to text: {e}")
            return False
    
    def _write_dict(self, file, data, indent=0):
        """
        Recursively write a dictionary to a file.
        
        Args:
            file: File object
            data: Data to write
            indent (int): Current indentation level
        """
        indent_str = "  " * indent
        
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, (dict, list)):
                    file.write(f"{indent_str}{key}:\n")
                    self._write_dict(file, value, indent + 1)
                else:
                    file.write(f"{indent_str}{key}: {value}\n")
        elif isinstance(data, list):
            for i, item in enumerate(data):
                if isinstance(item, (dict, list)):
                    file.write(f"{indent_str}[{i}]:\n")
                    self._write_dict(file, item, indent + 1)
                else:
                    file.write(f"{indent_str}- {item}\n")
        else:
            file.write(f"{indent_str}{data}\n")
    
    def export_to_pdf(self, data, output_file):
        """
        Export data to a PDF file (simplified version - exports as text).
        
        Args:
            data (dict): The data to export
            output_file (str): Path to the output file
        
        Returns:
            bool: True if successful, False otherwise
        """
        # For simplicity, we'll export as text format
        # In a production environment, you would use a library like reportlab
        text_file = output_file.replace(".pdf", ".txt")
        return self.export_to_text(data, text_file)
    
    def export_to_json(self, data, output_file):
        """
        Export data to a JSON file.
        
        Args:
            data (dict): The data to export
            output_file (str): Path to the output file
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error exporting to JSON: {e}")
            return False


# Global exporter instance
exporter = PDFExporter()
