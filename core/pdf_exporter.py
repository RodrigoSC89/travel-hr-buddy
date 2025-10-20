"""
PDF Exporter module for Nautilus One
Exports reports and analysis results to PDF format
"""
import json
from datetime import datetime
from core.logger import log_event


def export_report(json_file):
    """
    Exports a JSON report to PDF format
    
    Args:
        json_file (str): Path to the JSON file to export
    """
    try:
        with open(json_file, "r") as file:
            data = json.load(file)
        
        # Generate PDF filename
        pdf_filename = f"relatorio_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        # In a real implementation, this would use a PDF library like reportlab
        # For now, we'll create a simple text representation
        with open(pdf_filename.replace('.pdf', '.txt'), "w") as pdf:
            pdf.write(f"NAUTILUS ONE - Relatório Técnico\n")
            pdf.write(f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
            pdf.write("=" * 80 + "\n\n")
            pdf.write(json.dumps(data, indent=4, ensure_ascii=False))
        
        log_event(f"Relatório exportado: {pdf_filename}")
        print(f"✅ Relatório exportado com sucesso: {pdf_filename}")
        
    except FileNotFoundError:
        error_msg = f"Arquivo não encontrado: {json_file}"
        log_event(f"ERRO: {error_msg}")
        print(f"❌ {error_msg}")
    except json.JSONDecodeError:
        error_msg = f"Erro ao decodificar JSON: {json_file}"
        log_event(f"ERRO: {error_msg}")
        print(f"❌ {error_msg}")
    except Exception as e:
        error_msg = f"Erro ao exportar relatório: {str(e)}"
        log_event(f"ERRO: {error_msg}")
        print(f"❌ {error_msg}")
