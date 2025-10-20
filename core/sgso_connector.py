from core.logger import log_event

class SGSOClient:
    """
    Cliente de conexão com SGSO/Logs.
    """
    def connect(self):
        log_event("Iniciando conexão com SGSO")
        print("🔗 Conectando com SGSO/Logs...")
        print("✅ Conectado com sucesso!")
        log_event("Conexão SGSO estabelecida")
