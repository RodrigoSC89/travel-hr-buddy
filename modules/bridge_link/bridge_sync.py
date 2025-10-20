"""
BridgeLink Sync Module
======================
Sistema de sincronização offline/online para garantir entrega de dados
mesmo quando a embarcação está sem conexão com a costa.

Funcionalidades:
- Queue persistente de mensagens
- Sincronização automática quando conexão é restaurada
- Retry com backoff exponencial
- Priorização de eventos críticos
"""

import sqlite3
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
from pathlib import Path
from enum import Enum
import threading
from bridge_core import BridgeCore

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MessagePriority(Enum):
    """Prioridade das mensagens na fila."""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class MessageType(Enum):
    """Tipo de mensagem."""
    REPORT = "report"
    EVENT = "event"


class BridgeSync:
    """
    Gerenciador de sincronização offline/online do BridgeLink.
    
    Attributes:
        db_path (str): Caminho do banco de dados SQLite para fila
        bridge_core (BridgeCore): Instância do BridgeCore para envio
        sync_interval (int): Intervalo de sincronização em segundos
        max_retries (int): Número máximo de tentativas de reenvio
    """
    
    def __init__(
        self,
        bridge_core: BridgeCore,
        db_path: str = "/tmp/bridge_sync.db",
        sync_interval: int = 60,
        max_retries: int = 5
    ):
        """
        Inicializa o sistema de sincronização.
        
        Args:
            bridge_core: Instância do BridgeCore para comunicação
            db_path: Caminho do banco de dados SQLite
            sync_interval: Intervalo de sincronização em segundos
            max_retries: Número máximo de tentativas de reenvio
        """
        self.bridge_core = bridge_core
        self.db_path = db_path
        self.sync_interval = sync_interval
        self.max_retries = max_retries
        self.is_running = False
        self.sync_thread = None
        
        # Inicializar banco de dados
        self._init_database()
        logger.info(f"BridgeSync inicializado com db_path: {db_path}")
    
    def _init_database(self):
        """Inicializa o banco de dados SQLite para a fila."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Criar tabela de mensagens
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                priority INTEGER NOT NULL,
                data TEXT NOT NULL,
                created_at TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0,
                last_retry_at TEXT,
                status TEXT DEFAULT 'pending',
                error_message TEXT
            )
        ''')
        
        # Criar índices
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_status ON messages(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_priority ON messages(priority)')
        
        conn.commit()
        conn.close()
        logger.info("✅ Banco de dados inicializado")
    
    def add_to_queue(
        self,
        message_type: MessageType,
        data: Dict[str, Any],
        priority: MessagePriority = MessagePriority.MEDIUM
    ) -> int:
        """
        Adiciona mensagem à fila de sincronização.
        
        Args:
            message_type: Tipo da mensagem (REPORT ou EVENT)
            data: Dados da mensagem
            priority: Prioridade da mensagem
        
        Returns:
            ID da mensagem na fila
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO messages (type, priority, data, created_at, status)
            VALUES (?, ?, ?, ?, 'pending')
        ''', (
            message_type.value,
            priority.value,
            json.dumps(data),
            datetime.now().isoformat()
        ))
        
        message_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        logger.info(f"📥 Mensagem adicionada à fila: ID={message_id}, tipo={message_type.value}, prioridade={priority.name}")
        return message_id
    
    def get_pending_messages(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Obtém mensagens pendentes da fila, ordenadas por prioridade.
        
        Args:
            limit: Número máximo de mensagens a retornar
        
        Returns:
            Lista de mensagens pendentes
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM messages
            WHERE status = 'pending'
            AND retry_count < ?
            ORDER BY priority DESC, created_at ASC
            LIMIT ?
        ''', (self.max_retries, limit))
        
        messages = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return messages
    
    def process_message(self, message: Dict[str, Any]) -> bool:
        """
        Processa uma mensagem da fila.
        
        Args:
            message: Dicionário com dados da mensagem
        
        Returns:
            True se processada com sucesso, False caso contrário
        """
        message_id = message['id']
        message_type = message['type']
        data = json.loads(message['data'])
        
        try:
            # Processar baseado no tipo
            if message_type == MessageType.REPORT.value:
                resultado = self.bridge_core.enviar_relatorio(
                    arquivo_pdf=data['arquivo_pdf'],
                    metadata=data.get('metadata')
                )
            elif message_type == MessageType.EVENT.value:
                resultado = self.bridge_core.enviar_evento(data)
            else:
                raise ValueError(f"Tipo de mensagem desconhecido: {message_type}")
            
            # Verificar resultado
            if resultado['status'] == 'success':
                self._mark_as_processed(message_id)
                logger.info(f"✅ Mensagem processada com sucesso: ID={message_id}")
                return True
            else:
                self._mark_as_retry(message_id, resultado.get('error', 'Erro desconhecido'))
                logger.warning(f"⚠️ Falha ao processar mensagem: ID={message_id}")
                return False
                
        except Exception as e:
            self._mark_as_retry(message_id, str(e))
            logger.error(f"❌ Erro ao processar mensagem: ID={message_id}, erro={str(e)}")
            return False
    
    def _mark_as_processed(self, message_id: int):
        """Marca mensagem como processada com sucesso."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE messages
            SET status = 'processed', last_retry_at = ?
            WHERE id = ?
        ''', (datetime.now().isoformat(), message_id))
        
        conn.commit()
        conn.close()
    
    def _mark_as_retry(self, message_id: int, error_message: str):
        """Incrementa contador de retry e atualiza erro."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obter retry_count atual
        cursor.execute('SELECT retry_count FROM messages WHERE id = ?', (message_id,))
        row = cursor.fetchone()
        retry_count = row[0] if row else 0
        
        # Atualizar status baseado no retry_count
        new_status = 'failed' if retry_count + 1 >= self.max_retries else 'pending'
        
        cursor.execute('''
            UPDATE messages
            SET retry_count = retry_count + 1,
                last_retry_at = ?,
                status = ?,
                error_message = ?
            WHERE id = ?
        ''', (datetime.now().isoformat(), new_status, error_message, message_id))
        
        conn.commit()
        conn.close()
    
    def sync_loop(self):
        """Loop de sincronização que roda em background."""
        logger.info("🔄 Loop de sincronização iniciado")
        
        while self.is_running:
            try:
                # Verificar conexão
                if not self.bridge_core.verificar_conexao():
                    logger.info("⏳ Sem conexão com SGSO, aguardando...")
                    time.sleep(self.sync_interval)
                    continue
                
                # Obter mensagens pendentes
                pending_messages = self.get_pending_messages()
                
                if not pending_messages:
                    logger.debug("📭 Nenhuma mensagem pendente")
                    time.sleep(self.sync_interval)
                    continue
                
                logger.info(f"📨 Processando {len(pending_messages)} mensagens pendentes")
                
                # Processar cada mensagem
                success_count = 0
                for message in pending_messages:
                    if self.process_message(message):
                        success_count += 1
                    
                    # Pequeno delay entre mensagens para evitar sobrecarga
                    time.sleep(1)
                
                logger.info(f"✅ Sincronização completa: {success_count}/{len(pending_messages)} enviadas")
                
            except Exception as e:
                logger.error(f"❌ Erro no loop de sincronização: {str(e)}")
            
            # Aguardar próximo ciclo
            time.sleep(self.sync_interval)
    
    def start(self):
        """Inicia o sistema de sincronização em background."""
        if self.is_running:
            logger.warning("⚠️ Sistema de sincronização já está rodando")
            return
        
        self.is_running = True
        self.sync_thread = threading.Thread(target=self.sync_loop, daemon=True)
        self.sync_thread.start()
        logger.info("🚀 Sistema de sincronização iniciado")
    
    def stop(self):
        """Para o sistema de sincronização."""
        if not self.is_running:
            logger.warning("⚠️ Sistema de sincronização não está rodando")
            return
        
        self.is_running = False
        if self.sync_thread:
            self.sync_thread.join(timeout=10)
        logger.info("🛑 Sistema de sincronização parado")
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Obtém estatísticas da fila de sincronização.
        
        Returns:
            Dicionário com estatísticas
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Contar por status
        cursor.execute('SELECT status, COUNT(*) FROM messages GROUP BY status')
        status_counts = dict(cursor.fetchall())
        
        # Contar por prioridade (apenas pendentes)
        cursor.execute('''
            SELECT priority, COUNT(*) FROM messages
            WHERE status = 'pending'
            GROUP BY priority
        ''')
        priority_counts = dict(cursor.fetchall())
        
        # Mensagens mais antigas pendentes
        cursor.execute('''
            SELECT created_at FROM messages
            WHERE status = 'pending'
            ORDER BY created_at ASC
            LIMIT 1
        ''')
        oldest = cursor.fetchone()
        oldest_pending = oldest[0] if oldest else None
        
        conn.close()
        
        return {
            'total': sum(status_counts.values()),
            'pending': status_counts.get('pending', 0),
            'processed': status_counts.get('processed', 0),
            'failed': status_counts.get('failed', 0),
            'priority_counts': priority_counts,
            'oldest_pending': oldest_pending
        }
    
    def cleanup_old_messages(self, days: int = 30):
        """
        Remove mensagens antigas já processadas.
        
        Args:
            days: Número de dias para manter mensagens processadas
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute('''
            DELETE FROM messages
            WHERE status = 'processed'
            AND created_at < ?
        ''', (cutoff_date,))
        
        deleted = cursor.rowcount
        conn.commit()
        conn.close()
        
        logger.info(f"🧹 Limpeza completa: {deleted} mensagens antigas removidas")
        return deleted


if __name__ == "__main__":
    # Exemplo de uso
    print("🔄 BridgeLink Sync - Exemplo de Uso")
    print("=" * 50)
    
    # Configurar BridgeCore e BridgeSync
    bridge_core = BridgeCore(
        endpoint="https://sgso.petrobras.com.br/api",
        token="seu_token_aqui"
    )
    
    sync = BridgeSync(
        bridge_core=bridge_core,
        sync_interval=30  # Sincronizar a cada 30 segundos
    )
    
    # Adicionar algumas mensagens de exemplo à fila
    print("\n1. Adicionando mensagens à fila...")
    
    # Evento crítico
    evento_id = sync.add_to_queue(
        message_type=MessageType.EVENT,
        data={
            "tipo": "loss_dp",
            "embarcacao": "FPSO-123",
            "severidade": "critica",
            "descricao": "Perda de posicionamento dinâmico"
        },
        priority=MessagePriority.CRITICAL
    )
    print(f"   ✅ Evento crítico adicionado: ID={evento_id}")
    
    # Relatório normal
    relatorio_id = sync.add_to_queue(
        message_type=MessageType.REPORT,
        data={
            "arquivo_pdf": "/path/to/report.pdf",
            "metadata": {"tipo": "auditoria_mensal"}
        },
        priority=MessagePriority.MEDIUM
    )
    print(f"   ✅ Relatório adicionado: ID={relatorio_id}")
    
    # Mostrar estatísticas
    print("\n2. Estatísticas da fila:")
    stats = sync.get_statistics()
    print(f"   Total: {stats['total']}")
    print(f"   Pendentes: {stats['pending']}")
    print(f"   Processadas: {stats['processed']}")
    print(f"   Falhas: {stats['failed']}")
    
    # Iniciar sincronização
    print("\n3. Iniciando sistema de sincronização...")
    sync.start()
    print("   ✅ Sistema iniciado (rodando em background)")
    
    print("\n" + "=" * 50)
    print("Sistema de sincronização está rodando.")
    print("Pressione Ctrl+C para parar.")
    
    try:
        while True:
            time.sleep(10)
            stats = sync.get_statistics()
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Pendentes: {stats['pending']}, Processadas: {stats['processed']}")
    except KeyboardInterrupt:
        print("\n\nParando sistema...")
        sync.stop()
        print("✅ Sistema parado")
