# 🔐 Auditoria de Segurança - Ambiente Offline

## Escopo da Auditoria

Esta auditoria cobre os aspectos de segurança do sistema Nautilus One quando operando em modo offline ou com conectividade limitada.

---

## 1. Armazenamento Local de Dados Sensíveis

### 1.1 Dados Armazenados Localmente

| Tipo de Dado | Sensibilidade | Armazenamento | Criptografia |
|--------------|---------------|---------------|--------------|
| Credenciais de usuário | Alta | Não armazenado | N/A |
| Token de sessão | Alta | Memory only | N/A |
| Dados de tripulação | Alta | IndexedDB | AES-256 |
| Documentos | Média | IndexedDB + Cache | AES-256 |
| Configurações | Baixa | localStorage | Não |
| Cache de IA | Média | IndexedDB | Não |
| Logs de operação | Média | IndexedDB | Sim |

### 1.2 Implementação de Criptografia Local

```typescript
// src/lib/security/local-crypto.ts
export class LocalCrypto {
  private static instance: LocalCrypto;
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_LENGTH = 256;
  private readonly ITERATIONS = 100000;

  /**
   * Deriva uma chave criptográfica a partir de senha
   */
  private async deriveKey(
    password: string, 
    salt: ArrayBuffer
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Criptografa dados sensíveis
   */
  async encrypt(data: string, password: string): Promise<EncryptedData> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(password, salt.buffer as ArrayBuffer);

    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv: iv.buffer as ArrayBuffer },
      key,
      encoder.encode(data)
    );

    return {
      data: this.bufferToBase64(encrypted),
      salt: this.bufferToBase64(salt),
      iv: this.bufferToBase64(iv),
      algorithm: this.ALGORITHM
    };
  }

  /**
   * Descriptografa dados
   */
  async decrypt(encrypted: EncryptedData, password: string): Promise<string> {
    const salt = this.base64ToBuffer(encrypted.salt);
    const iv = this.base64ToBuffer(encrypted.iv);
    const data = this.base64ToBuffer(encrypted.data);
    const key = await this.deriveKey(password, salt.buffer as ArrayBuffer);

    const decrypted = await crypto.subtle.decrypt(
      { name: this.ALGORITHM, iv: iv.buffer as ArrayBuffer },
      key,
      data.buffer as ArrayBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}
```

### 1.3 Riscos Identificados

| ID | Risco | Severidade | Mitigação |
|----|-------|------------|-----------|
| SEC-001 | Dados em IndexedDB acessíveis via DevTools | Média | Criptografia AES-256 |
| SEC-002 | Chave derivada de senha fraca | Alta | Política de senha forte |
| SEC-003 | Salt/IV armazenados junto com dados | Baixa | Aceitável (padrão) |
| SEC-004 | Backup local não criptografado | Média | Criptografar exports |

### 1.4 Recomendações

```typescript
// Boas práticas implementadas
const securityConfig = {
  // 1. Nunca armazenar senhas
  storePassword: false,
  
  // 2. Limpar dados sensíveis após uso
  clearSensitiveData: true,
  clearTimeout: 30 * 60 * 1000, // 30 minutos de inatividade
  
  // 3. Validar integridade dos dados
  useChecksums: true,
  
  // 4. Limitar tamanho do cache
  maxCacheSize: 100 * 1024 * 1024, // 100MB
  
  // 5. Rotacionar dados antigos
  dataRetentionDays: 30
};
```

---

## 2. Autenticação e Controle de Acesso Local

### 2.1 Estratégia de Autenticação Offline

```typescript
// src/lib/auth/offline-auth.ts
export class OfflineAuthManager {
  private tokenStore: SecureTokenStore;
  private sessionTimeout = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Valida sessão offline
   */
  async validateOfflineSession(): Promise<boolean> {
    const session = await this.tokenStore.getSession();
    
    if (!session) return false;
    
    // Verificar expiração
    if (Date.now() > session.expiresAt) {
      await this.clearSession();
      return false;
    }
    
    // Verificar integridade do token
    const isValid = await this.verifyTokenIntegrity(session.token);
    if (!isValid) {
      await this.clearSession();
      return false;
    }
    
    return true;
  }

  /**
   * Autenticação offline com PIN
   */
  async authenticateWithPIN(pin: string): Promise<AuthResult> {
    const storedHash = await this.tokenStore.getPINHash();
    
    if (!storedHash) {
      return { success: false, error: 'PIN não configurado' };
    }
    
    const inputHash = await this.hashPIN(pin);
    
    if (inputHash !== storedHash) {
      await this.logFailedAttempt();
      return { success: false, error: 'PIN incorreto' };
    }
    
    // Verificar bloqueio por tentativas
    const attempts = await this.getFailedAttempts();
    if (attempts >= 5) {
      return { 
        success: false, 
        error: 'Conta bloqueada. Reconecte à internet.',
        locked: true
      };
    }
    
    return { success: true };
  }

  /**
   * Verifica permissões offline (cache de roles)
   */
  async checkPermission(permission: string): Promise<boolean> {
    const cachedPermissions = await this.tokenStore.getCachedPermissions();
    return cachedPermissions.includes(permission);
  }
}
```

### 2.2 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                  Fluxo de Auth Offline                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Usuário abre app]                                          │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────┐    Não    ┌─────────────┐                  │
│  │ Tem sessão  │──────────▶│ Mostrar     │                  │
│  │ válida?     │           │ login       │                  │
│  └──────┬──────┘           └──────┬──────┘                  │
│         │ Sim                     │                          │
│         ▼                         ▼                          │
│  ┌─────────────┐           ┌─────────────┐                  │
│  │ Online?     │    Não    │ Tentar      │                  │
│  │             │◀──────────│ online auth │                  │
│  └──────┬──────┘           └─────────────┘                  │
│         │                                                    │
│    Sim  │  Não                                              │
│         ▼    ▼                                              │
│  ┌───────┐ ┌───────────┐                                    │
│  │Refresh│ │ PIN local │                                    │
│  │token  │ │ auth      │                                    │
│  └───────┘ └───────────┘                                    │
│         │         │                                          │
│         ▼         ▼                                          │
│  ┌─────────────────────┐                                    │
│  │  Acesso concedido   │                                    │
│  │  (modo offline)     │                                    │
│  └─────────────────────┘                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Controle de Acesso Offline

```typescript
// Permissões cacheadas localmente
interface CachedPermissions {
  userId: string;
  roles: string[];
  permissions: string[];
  cachedAt: number;
  expiresAt: number;
  signature: string; // Para verificar integridade
}

// Verificação de permissão
async function canAccessModule(module: string): Promise<boolean> {
  const cached = await getCachedPermissions();
  
  // Verificar assinatura
  if (!await verifySignature(cached)) {
    throw new SecurityError('Permissões corrompidas');
  }
  
  return cached.permissions.includes(`${module}.read`);
}
```

---

## 3. Logs de Atividade Offline

### 3.1 Estrutura de Logs

```typescript
// src/lib/logging/offline-logger.ts
interface OfflineLog {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  module: string;
  details: Record<string, any>;
  deviceId: string;
  sessionId: string;
  syncStatus: 'pending' | 'synced' | 'failed';
  checksum: string;
}

export class OfflineLogger {
  private readonly MAX_LOGS = 10000;
  private readonly LOG_RETENTION_DAYS = 90;

  async log(entry: Omit<OfflineLog, 'id' | 'checksum'>): Promise<void> {
    const log: OfflineLog = {
      ...entry,
      id: crypto.randomUUID(),
      checksum: await this.calculateChecksum(entry)
    };

    await this.store(log);
    await this.enforceRetention();
  }

  async getAuditTrail(
    filters: LogFilters
  ): Promise<OfflineLog[]> {
    const logs = await this.getAllLogs();
    
    return logs
      .filter(log => this.matchesFilters(log, filters))
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  async syncLogs(): Promise<SyncResult> {
    const pending = await this.getPendingLogs();
    const results: SyncResult = { synced: 0, failed: 0 };

    for (const batch of chunk(pending, 100)) {
      try {
        await supabase.from('audit_logs').insert(
          batch.map(log => ({
            ...log,
            synced_at: new Date().toISOString()
          }))
        );
        
        await this.markAsSynced(batch.map(l => l.id));
        results.synced += batch.length;
      } catch (error) {
        results.failed += batch.length;
        await this.markAsFailed(batch.map(l => l.id));
      }
    }

    return results;
  }
}
```

### 3.2 Eventos Auditados

| Categoria | Eventos | Dados Capturados |
|-----------|---------|------------------|
| Autenticação | Login, Logout, PIN | Timestamp, IP, Device |
| Dados | Create, Read, Update, Delete | Tabela, ID, Campos alterados |
| Documentos | View, Download, Upload | Doc ID, Tipo, Tamanho |
| Sistema | Error, Sync, Mode change | Detalhes do erro/evento |
| Segurança | Failed auth, Permission denied | Contexto completo |

---

## 4. Proteção Contra Corrupção e Perda de Energia

### 4.1 Estratégia de Persistência Segura

```typescript
// src/lib/storage/safe-storage.ts
export class SafeStorage {
  /**
   * Escrita atômica com verificação
   */
  async safeWrite<T>(key: string, data: T): Promise<void> {
    const serialized = JSON.stringify(data);
    const checksum = await this.calculateChecksum(serialized);
    
    // 1. Escrever em arquivo temporário
    const tempKey = `${key}_temp_${Date.now()}`;
    await this.write(tempKey, { data: serialized, checksum });
    
    // 2. Verificar escrita
    const verification = await this.read(tempKey);
    if (verification.checksum !== checksum) {
      await this.delete(tempKey);
      throw new Error('Falha na verificação de escrita');
    }
    
    // 3. Backup do arquivo atual (se existir)
    const existing = await this.read(key);
    if (existing) {
      await this.write(`${key}_backup`, existing);
    }
    
    // 4. Substituir arquivo principal
    await this.write(key, { data: serialized, checksum });
    
    // 5. Limpar temporário
    await this.delete(tempKey);
  }

  /**
   * Leitura com verificação de integridade
   */
  async safeRead<T>(key: string): Promise<T | null> {
    const stored = await this.read(key);
    
    if (!stored) return null;
    
    // Verificar checksum
    const calculatedChecksum = await this.calculateChecksum(stored.data);
    
    if (calculatedChecksum !== stored.checksum) {
      // Tentar restaurar do backup
      console.warn(`Dados corrompidos detectados para ${key}, tentando backup`);
      return this.restoreFromBackup(key);
    }
    
    return JSON.parse(stored.data);
  }

  /**
   * Restauração de backup
   */
  private async restoreFromBackup<T>(key: string): Promise<T | null> {
    const backup = await this.read(`${key}_backup`);
    
    if (!backup) {
      throw new Error(`Não foi possível restaurar ${key}: sem backup`);
    }
    
    const calculatedChecksum = await this.calculateChecksum(backup.data);
    
    if (calculatedChecksum !== backup.checksum) {
      throw new Error(`Backup também está corrompido para ${key}`);
    }
    
    // Restaurar backup como principal
    await this.write(key, backup);
    
    return JSON.parse(backup.data);
  }
}
```

### 4.2 Recuperação de Falha de Energia

```typescript
// src/lib/recovery/power-failure-recovery.ts
export class PowerFailureRecovery {
  private readonly RECOVERY_FLAG = 'nautilus_recovery_needed';

  /**
   * Executado no início da aplicação
   */
  async checkAndRecover(): Promise<RecoveryResult> {
    const needsRecovery = localStorage.getItem(this.RECOVERY_FLAG);
    
    if (!needsRecovery) {
      // Marcar início de sessão
      localStorage.setItem(this.RECOVERY_FLAG, Date.now().toString());
      return { recovered: false };
    }

    console.log('Detectada falha anterior, iniciando recuperação...');
    
    const result: RecoveryResult = {
      recovered: true,
      issues: [],
      fixed: []
    };

    // 1. Verificar transações pendentes
    const pendingTx = await this.findPendingTransactions();
    for (const tx of pendingTx) {
      if (tx.status === 'writing') {
        // Reverter transação incompleta
        await this.rollbackTransaction(tx);
        result.issues.push(`Transação ${tx.id} revertida`);
      }
    }

    // 2. Verificar integridade do IndexedDB
    const dbCheck = await this.verifyDatabaseIntegrity();
    if (!dbCheck.ok) {
      for (const table of dbCheck.corrupted) {
        await this.rebuildTableFromBackup(table);
        result.issues.push(`Tabela ${table} restaurada do backup`);
      }
    }

    // 3. Verificar fila de sincronização
    const syncQueue = await this.verifySyncQueue();
    if (syncQueue.hasOrphans) {
      await this.cleanupOrphanedSyncItems();
      result.issues.push('Itens órfãos da fila de sync removidos');
    }

    // 4. Limpar flag de recuperação
    localStorage.removeItem(this.RECOVERY_FLAG);

    return result;
  }

  /**
   * Marca saída limpa da aplicação
   */
  markCleanExit(): void {
    localStorage.removeItem(this.RECOVERY_FLAG);
  }
}

// Uso no App.tsx
useEffect(() => {
  const recovery = new PowerFailureRecovery();
  
  recovery.checkAndRecover().then(result => {
    if (result.recovered) {
      toast.info('Sistema recuperado após falha', {
        description: result.issues.join(', ')
      });
    }
  });

  // Registrar saída limpa
  const handleUnload = () => recovery.markCleanExit();
  window.addEventListener('beforeunload', handleUnload);
  
  return () => window.removeEventListener('beforeunload', handleUnload);
}, []);
```

---

## 5. Boas Práticas e Recomendações

### 5.1 Checklist de Segurança Offline

```
□ Dados sensíveis criptografados com AES-256
□ Chaves derivadas com PBKDF2 (100k+ iterações)
□ Sessões expiram após período de inatividade
□ PIN/senha forte requerida para acesso offline
□ Logs de auditoria assinados e verificáveis
□ Backups automáticos de dados críticos
□ Verificação de integridade em toda leitura
□ Recuperação automática de falhas de energia
□ Limpeza de dados temporários após uso
□ Rotação de dados antigos (90 dias)
```

### 5.2 Recomendações Adicionais

1. **Hardware Security Module (HSM)** - Para dispositivos enterprise, considerar integração com HSM para armazenamento de chaves.

2. **Biometria** - Implementar autenticação biométrica onde disponível (fingerprint, face ID).

3. **Tamper Detection** - Detectar tentativas de manipulação do armazenamento local.

4. **Encrypted Exports** - Todos os exports/downloads devem ser criptografados.

5. **Remote Wipe** - Capacidade de limpar dados remotamente em caso de perda/roubo do dispositivo.

---

*Auditoria de segurança realizada em: 2025-12-05*
*Próxima revisão recomendada: 2026-03-05*
