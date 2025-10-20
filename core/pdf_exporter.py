"""
PDF Exporter Module - Sistema Nautilus One
Professional PDF generation using ReportLab library
"""
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
import json


def export_report(data, output_name="Nautilus_Report.pdf"):
    """
    Export data to a professional PDF report.
    
    Args:
        data: Data to export (can be dict, list, or str)
        output_name: Output filename for the PDF
    """
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(output_name, pagesize=letter)
    story = []
    
    # Add title
    story.append(Paragraph("Sistema Nautilus One – Relatório Técnico Consolidado", styles['Title']))
    story.append(Spacer(1, 20))
    
    # Process data based on type
    if isinstance(data, list):
        for bloco in data:
            if "titulo" in bloco:
                story.append(Paragraph(bloco["titulo"], styles['Heading1']))
                story.append(Spacer(1, 12))
            elif "seção" in bloco or "secao" in bloco:
                secao_name = bloco.get("seção") or bloco.get("secao")
                story.append(Paragraph(f"📘 {secao_name}", styles['Heading2']))
                story.append(Spacer(1, 8))
                
                # Format content
                conteudo = bloco.get("dados", bloco.get("data", ""))
                if isinstance(conteudo, (dict, list)):
                    conteudo = json.dumps(conteudo, indent=2, ensure_ascii=False)
                
                # Split content into lines and add as paragraphs
                for line in str(conteudo).split('\n'):
                    if line.strip():
                        story.append(Paragraph(line.replace("<", "&lt;").replace(">", "&gt;"), styles['Normal']))
                
                story.append(Spacer(1, 12))
    else:
        # Handle simple data
        if isinstance(data, (dict, list)):
            content = json.dumps(data, indent=2, ensure_ascii=False)
        else:
            content = str(data)
        
        for line in content.split('\n'):
            if line.strip():
                story.append(Paragraph(line.replace("<", "&lt;").replace(">", "&gt;"), styles['Normal']))
    
    # Build PDF
    doc.build(story)
    print(f"📄 PDF exportado: {output_name}")
