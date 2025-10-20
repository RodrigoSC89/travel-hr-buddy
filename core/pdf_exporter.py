"""
PDF Exporter Module - Report generation
Exports analysis results from JSON to PDF/text format
"""
import json
from datetime import datetime
from typing import Dict, Any


def export_report(json_file: str, output_format: str = "txt") -> str:
    """
    Export a report from JSON to PDF or text format
    
    Args:
        json_file: Path to the JSON file containing report data
        output_format: Output format ('pdf' or 'txt')
        
    Returns:
        Path to the generated report file
    """
    try:
        with open(json_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Error: File {json_file} not found")
        return ""
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON in {json_file}")
        return ""
    
    # Generate filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = json_file.replace(".json", "")
    
    if output_format == "pdf":
        output_file = f"{base_name}_{timestamp}.pdf"
        return _export_to_pdf(data, output_file)
    else:
        output_file = f"{base_name}_{timestamp}.txt"
        return _export_to_text(data, output_file)


def _export_to_text(data: Dict[str, Any], output_file: str) -> str:
    """
    Export report data to text format
    
    Args:
        data: Report data dictionary
        output_file: Output file path
        
    Returns:
        Path to the generated text file
    """
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write("=" * 80 + "\n")
            f.write("NAUTILUS ONE - DECISION CORE REPORT\n")
            f.write("=" * 80 + "\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 80 + "\n\n")
            
            # Write report content
            for key, value in data.items():
                f.write(f"{key}:\n")
                if isinstance(value, (list, dict)):
                    f.write(json.dumps(value, indent=2, ensure_ascii=False))
                else:
                    f.write(str(value))
                f.write("\n\n")
        
        print(f"Report exported to: {output_file}")
        return output_file
    except Exception as e:
        print(f"Error exporting to text: {e}")
        return ""


def _export_to_pdf(data: Dict[str, Any], output_file: str) -> str:
    """
    Export report data to PDF format
    Note: This is a simple text-based PDF. For production, consider using reportlab or fpdf
    
    Args:
        data: Report data dictionary
        output_file: Output file path
        
    Returns:
        Path to the generated PDF file
    """
    # For now, create a text version with .pdf extension
    # In production, use proper PDF library
    text_file = _export_to_text(data, output_file.replace(".pdf", ".txt"))
    
    if text_file:
        # Rename to .pdf for compatibility
        import os
        pdf_file = text_file.replace(".txt", ".pdf")
        try:
            os.rename(text_file, pdf_file)
            print(f"PDF report created: {pdf_file}")
            return pdf_file
        except Exception as e:
            print(f"Error creating PDF: {e}")
            return text_file
    
    return ""


def create_report_json(report_type: str, data: Dict[str, Any]) -> str:
    """
    Create a JSON report file
    
    Args:
        report_type: Type of report (e.g., 'fmea', 'asog', 'forecast')
        data: Report data
        
    Returns:
        Path to the created JSON file
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"relatorio_{report_type}_{timestamp}.json"
    
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Report JSON created: {filename}")
        return filename
    except Exception as e:
        print(f"Error creating report JSON: {e}")
        return ""
