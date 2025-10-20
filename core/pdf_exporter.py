"""
PDF Exporter module for Nautilus One System
Generates technical PDF reports using ReportLab
"""
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import json


def export_report(data, output_name="Nautilus_Report.pdf"):
    """
    Exports data to a PDF report
    
    Args:
        data: List of blocks or dict to export
        output_name: Output PDF filename
    """
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(output_name)
    story = []

    story.append(Paragraph("Sistema Nautilus One – Relatório Técnico Consolidado", styles['Title']))
    story.append(Spacer(1, 20))

    if isinstance(data, list):
        for bloco in data:
            if "titulo" in bloco:
                story.append(Paragraph(bloco["titulo"], styles['Heading1']))
            elif "seção" in bloco:
                story.append(Paragraph(f"📘 {bloco['seção']}", styles['Heading2']))
                conteudo = json.dumps(bloco["dados"], indent=4, ensure_ascii=False)
                story.append(Paragraph(conteudo.replace("\n", "<br/>"), styles['Code']))
            story.append(Spacer(1, 12))
    else:
        story.append(Paragraph(json.dumps(data, indent=4), styles['Normal']))

    doc.build(story)
    print(f"📄 PDF exportado: {output_name}")
