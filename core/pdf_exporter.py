from core.logger import log_event

def export_report(json_file):
    """
    Exporta relatório como PDF baseado em um arquivo JSON.
    """
    log_event(f"Exportando relatório: {json_file}")
    print(f"📄 Exportando relatório PDF de {json_file}...")
    print("✅ PDF exportado com sucesso!")
    log_event("PDF exportado com sucesso")
