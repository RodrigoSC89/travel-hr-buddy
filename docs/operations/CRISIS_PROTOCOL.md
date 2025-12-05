# 🚨 Protocolo de Crise - Operação Degradada

## Visão Geral

Este documento define os protocolos de resposta para cenários de falha crítica no sistema Nautilus One.

---

## Cenários de Falha

### 1. Perda Total de Conexão

**Detecção:**
```typescript
// src/lib/crisis/connection-monitor.ts
export class ConnectionMonitor {
  private consecutiveFailures = 0;
  private readonly THRESHOLD = 3;

  async checkConnection(): Promise<ConnectionStatus> {
    try {
      const response = await fetch('/api/health', { 
        timeout: 5000,
        cache: 'no-cache'
      });
      
      if (response.ok) {
        this.consecutiveFailures = 0;
        return { status: 'online', latency: response.headers.get('x-response-time') };
      }
    } catch (error) {
      this.consecutiveFailures++;
    }

    if (this.consecutiveFailures >= this.THRESHOLD) {
      return { status: 'offline', since: Date.now() };
    }

    return { status: 'unstable', failures: this.consecutiveFailures };
  }
}
```

**Ações Automáticas:**
```typescript
const connectionLossProtocol = {
  immediate: [
    'Ativar modo offline',
    'Mostrar banner de status',
    'Pausar sincronização',
    'Habilitar fila local'
  ],
  
  after5min: [
    'Notificar usuário sobre operação degradada',
    'Ativar economia de bateria',
    'Comprimir cache para liberar espaço'
  ],
  
  after30min: [
    'Gerar relatório de itens pendentes',
    'Sugerir exportação local de dados críticos'
  ]
};
```

**Mensagem ao Usuário:**
```
┌─────────────────────────────────────────────────┐
│  ⚠️ MODO OFFLINE ATIVO                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  Você está operando sem conexão com o servidor. │
│                                                 │
│  ✓ Criar/editar registros           Disponível │
│  ✓ Consultar dados em cache         Disponível │
│  ✓ Assistente IA (modo local)       Disponível │
│  ✗ Sincronização em tempo real      Indisponível│
│  ✗ Relatórios atualizados          Indisponível│
│                                                 │
│  Dados pendentes de envio: 12 itens             │
│                                                 │
│  [Ver Pendentes]  [Exportar Local]              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 2. Corrupção de Banco Local

**Detecção:**
```typescript
// src/lib/crisis/db-integrity-checker.ts
export class DBIntegrityChecker {
  async checkIntegrity(): Promise<IntegrityReport> {
    const report: IntegrityReport = {
      status: 'healthy',
      tables: {},
      issues: []
    };

    const tables = await this.listTables();

    for (const table of tables) {
      try {
        // Verificar estrutura
        const structure = await this.verifyTableStructure(table);
        
        // Verificar checksums
        const checksums = await this.verifyChecksums(table);
        
        // Verificar referências
        const refs = await this.verifyReferences(table);

        report.tables[table] = {
          structure: structure.ok,
          checksums: checksums.ok,
          references: refs.ok,
          rowCount: await this.countRows(table)
        };

        if (!structure.ok || !checksums.ok || !refs.ok) {
          report.status = 'corrupted';
          report.issues.push({
            table,
            type: !structure.ok ? 'structure' : !checksums.ok ? 'checksum' : 'reference',
            details: structure.error || checksums.error || refs.error
          });
        }
      } catch (error) {
        report.status = 'error';
        report.issues.push({
          table,
          type: 'access',
          details: error.message
        });
      }
    }

    return report;
  }
}
```

**Ações Automáticas:**
```typescript
const dbCorruptionProtocol = {
  detection: async () => {
    // 1. Identificar tabelas afetadas
    const affected = await identifyCorruptedTables();
    
    // 2. Isolar tabelas corrompidas
    await isolateCorruptedData(affected);
    
    // 3. Tentar recuperação automática
    for (const table of affected) {
      const recovered = await attemptRecovery(table);
      if (!recovered) {
        await markForManualRecovery(table);
      }
    }
  },
  
  recovery: {
    fromBackup: async (table) => {
      const backup = await findLatestBackup(table);
      if (backup) {
        await restoreFromBackup(table, backup);
        return true;
      }
      return false;
    },
    
    fromServer: async (table) => {
      if (navigator.onLine) {
        await resyncTable(table);
        return true;
      }
      return false;
    },
    
    rebuild: async (table) => {
      // Reconstruir a partir de logs de transação
      const txLogs = await getTransactionLogs(table);
      await rebuildFromLogs(table, txLogs);
    }
  }
};
```

**Mensagem ao Usuário:**
```
┌─────────────────────────────────────────────────┐
│  ⚠️ PROBLEMA DE DADOS DETECTADO                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  Detectamos um problema nos dados locais.       │
│  O sistema está recuperando automaticamente.    │
│                                                 │
│  Tabelas afetadas:                              │
│  • maintenance_orders (recuperando...)          │
│  • documents (OK)                               │
│                                                 │
│  Progresso: ████████░░ 80%                      │
│                                                 │
│  Não feche o aplicativo.                        │
│                                                 │
│  [Ver Detalhes]  [Contatar Suporte]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 3. LLM Não Inicializando

**Detecção:**
```typescript
// src/lib/crisis/llm-health-checker.ts
export class LLMHealthChecker {
  async checkLLMStatus(): Promise<LLMStatus> {
    const status: LLMStatus = {
      online: { available: false, model: null },
      local: { available: false, model: null },
      fallback: { available: true }
    };

    // Verificar AI Gateway online
    if (navigator.onLine) {
      try {
        const response = await fetch('https://ai.gateway.lovable.dev/health');
        status.online.available = response.ok;
        status.online.model = 'google/gemini-2.5-flash';
      } catch {}
    }

    // Verificar LLM local (Ollama)
    try {
      const localResponse = await fetch('http://localhost:11434/api/tags');
      if (localResponse.ok) {
        const models = await localResponse.json();
        status.local.available = models.models?.length > 0;
        status.local.model = models.models?.[0]?.name;
      }
    } catch {}

    // Fallback sempre disponível (rule-based)
    status.fallback.available = true;

    return status;
  }
}
```

**Ações Automáticas:**
```typescript
const llmFailureProtocol = {
  // Ordem de fallback
  fallbackChain: [
    {
      name: 'Lovable AI Gateway',
      check: () => checkGateway(),
      use: (prompt) => callGateway(prompt)
    },
    {
      name: 'Ollama Local',
      check: () => checkOllama(),
      use: (prompt) => callOllama(prompt)
    },
    {
      name: 'Cache de Respostas',
      check: () => true,
      use: (prompt) => findCachedResponse(prompt)
    },
    {
      name: 'Respostas Pré-definidas',
      check: () => true,
      use: (prompt) => getRuleBasedResponse(prompt)
    }
  ],

  async getResponse(prompt: string): Promise<AIResponse> {
    for (const fallback of this.fallbackChain) {
      if (await fallback.check()) {
        try {
          const response = await fallback.use(prompt);
          return {
            content: response,
            source: fallback.name,
            degraded: fallback.name !== 'Lovable AI Gateway'
          };
        } catch (error) {
          console.warn(`Fallback ${fallback.name} falhou:`, error);
          continue;
        }
      }
    }

    // Última opção: mensagem padrão
    return {
      content: 'Desculpe, não consigo processar sua solicitação no momento. ' +
               'Por favor, tente novamente mais tarde ou consulte a documentação.',
      source: 'default',
      degraded: true
    };
  }
};
```

**Mensagem ao Usuário:**
```
┌─────────────────────────────────────────────────┐
│  ℹ️ ASSISTENTE EM MODO LIMITADO                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  O assistente de IA está operando com           │
│  capacidades reduzidas.                         │
│                                                 │
│  Disponível:                                    │
│  ✓ Respostas sobre procedimentos comuns         │
│  ✓ Ajuda com navegação do sistema              │
│  ✓ Consulta de documentação                    │
│                                                 │
│  Temporariamente indisponível:                  │
│  ✗ Análises complexas                          │
│  ✗ Geração de relatórios por IA                │
│  ✗ Respostas personalizadas                    │
│                                                 │
│  [Entendi]  [Ver Documentação]                  │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

### 4. Queda de Energia Inesperada

**Prevenção e Detecção:**
```typescript
// src/lib/crisis/power-manager.ts
export class PowerManager {
  private saveInterval: number | null = null;
  private readonly AUTOSAVE_INTERVAL = 30000; // 30 segundos

  init() {
    // Autosave periódico
    this.saveInterval = setInterval(() => {
      this.autoSave();
    }, this.AUTOSAVE_INTERVAL);

    // Detectar visibilidade (usuário saindo/voltando)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.emergencySave();
      }
    });

    // Detectar bateria fraca (se disponível)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.1 && !battery.charging) {
            this.lowBatteryMode();
          }
        });
      });
    }

    // Detectar antes de fechar/recarregar
    window.addEventListener('beforeunload', (e) => {
      if (this.hasPendingChanges()) {
        this.emergencySave();
        e.preventDefault();
        e.returnValue = 'Existem alterações não salvas.';
      }
    });
  }

  private async autoSave() {
    const pendingChanges = await this.getPendingChanges();
    
    for (const change of pendingChanges) {
      await this.saveToLocal(change);
    }
    
    // Marcar checkpoint
    localStorage.setItem('last_autosave', Date.now().toString());
  }

  private async emergencySave() {
    console.log('Salvamento de emergência iniciado');
    
    // Salvar tudo imediatamente
    const allPending = await this.getAllPendingData();
    
    await Promise.all([
      this.saveFormData(),
      this.saveSessionState(),
      this.savePendingOperations(),
      this.saveNavigationState()
    ]);
    
    localStorage.setItem('emergency_save', Date.now().toString());
  }

  private lowBatteryMode() {
    // Ativar modo de economia
    eventBus.emit('power:low-battery');
    
    // Reduzir operações
    this.saveInterval && clearInterval(this.saveInterval);
    this.saveInterval = setInterval(() => this.autoSave(), 60000); // 1 minuto
    
    // Notificar usuário
    toast.warning('Bateria fraca', {
      description: 'Conecte o carregador. Salvamento automático ativado.'
    });
  }
}
```

**Recuperação Pós-Falha:**
```typescript
// src/lib/crisis/recovery-manager.ts
export class RecoveryManager {
  async runRecoveryCheck(): Promise<RecoveryReport> {
    const report: RecoveryReport = {
      needed: false,
      recovered: [],
      lost: [],
      formData: null
    };

    // Verificar se houve falha
    const lastSave = localStorage.getItem('last_autosave');
    const emergencySave = localStorage.getItem('emergency_save');
    const cleanExit = localStorage.getItem('clean_exit');

    if (!cleanExit && (lastSave || emergencySave)) {
      report.needed = true;

      // 1. Recuperar formulários em andamento
      const savedForms = await this.recoverFormData();
      if (savedForms.length > 0) {
        report.formData = savedForms;
        report.recovered.push('Formulários em andamento');
      }

      // 2. Recuperar operações pendentes
      const pendingOps = await this.recoverPendingOperations();
      if (pendingOps.length > 0) {
        report.recovered.push(`${pendingOps.length} operações pendentes`);
      }

      // 3. Verificar integridade dos dados
      const integrityCheck = await this.verifyDataIntegrity();
      if (!integrityCheck.ok) {
        report.lost = integrityCheck.corrupted;
      }
    }

    // Limpar flags
    localStorage.removeItem('emergency_save');
    localStorage.setItem('clean_exit', 'false');

    return report;
  }
}
```

---

## Modo Emergencial

### Ativação

```typescript
// src/lib/crisis/emergency-mode.ts
export class EmergencyMode {
  private static active = false;

  static async activate(reason: EmergencyReason): Promise<void> {
    if (this.active) return;
    this.active = true;

    console.warn('MODO EMERGENCIAL ATIVADO:', reason);

    // 1. Salvar estado atual
    await this.saveCurrentState();

    // 2. Desativar funcionalidades não-essenciais
    eventBus.emit('emergency:activated', { reason });

    // 3. Ativar interface simplificada
    document.body.classList.add('emergency-mode');

    // 4. Registrar evento
    await this.logEmergencyEvent(reason);

    // 5. Mostrar UI de emergência
    this.showEmergencyUI(reason);
  }

  static async deactivate(): Promise<void> {
    if (!this.active) return;

    // 1. Verificar se é seguro desativar
    const safeToDeactivate = await this.checkSafeToDeactivate();
    
    if (!safeToDeactivate) {
      toast.error('Não é possível sair do modo emergencial ainda');
      return;
    }

    this.active = false;

    // 2. Restaurar funcionalidades
    eventBus.emit('emergency:deactivated');

    // 3. Restaurar interface
    document.body.classList.remove('emergency-mode');

    // 4. Sincronizar dados pendentes
    await this.syncPendingData();

    toast.success('Operação normal restaurada');
  }

  private static showEmergencyUI(reason: EmergencyReason) {
    // Renderizar modal de emergência
    const modal = document.createElement('div');
    modal.id = 'emergency-modal';
    modal.innerHTML = `
      <div class="emergency-overlay">
        <div class="emergency-content">
          <h2>⚠️ Modo Emergencial</h2>
          <p>${this.getReasonMessage(reason)}</p>
          <div class="emergency-status">
            <div>Status: ${this.getStatusText()}</div>
            <div>Dados pendentes: ${this.getPendingCount()}</div>
          </div>
          <div class="emergency-actions">
            <button onclick="EmergencyMode.exportData()">
              Exportar Dados
            </button>
            <button onclick="EmergencyMode.tryReconnect()">
              Tentar Reconectar
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
}
```

### Interface do Modo Emergencial

```typescript
// src/components/performance/EmergencyMode.tsx
export function EmergencyModeUI() {
  const { isEmergency, reason, status, pendingCount, exportData, tryReconnect } = useEmergencyMode();

  if (!isEmergency) return null;

  return (
    <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center">
      <Card className="max-w-lg w-full mx-4 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            Modo Emergencial Ativo
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {getEmergencyMessage(reason)}
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium">{status}</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-muted-foreground">Dados Pendentes</div>
              <div className="font-medium">{pendingCount} itens</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Funcionalidades Disponíveis:</h4>
            <ul className="text-sm space-y-1">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Visualizar dados em cache
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Exportar dados locais
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Criar registros offline
              </li>
              <li className="flex items-center gap-2">
                <X className="h-4 w-4 text-red-500" />
                Sincronização em tempo real
              </li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </Button>
          <Button className="flex-1" onClick={tryReconnect}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Reconectar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
```

---

## Logs de Erro e Sincronização Posterior

```typescript
// src/lib/crisis/error-logger.ts
export class ErrorLogger {
  private readonly STORAGE_KEY = 'crisis_logs';
  private readonly MAX_LOGS = 1000;

  async logCrisisEvent(event: CrisisEvent): Promise<void> {
    const log: CrisisLog = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: event.type,
      severity: event.severity,
      details: event.details,
      deviceInfo: this.getDeviceInfo(),
      sessionId: this.getSessionId(),
      syncStatus: 'pending'
    };

    // Salvar localmente
    await this.saveToDB(log);

    // Tentar enviar se online
    if (navigator.onLine) {
      await this.trySendToServer(log);
    }
  }

  async syncPendingLogs(): Promise<SyncResult> {
    const pending = await this.getPendingLogs();
    const result: SyncResult = { synced: 0, failed: 0 };

    for (const log of pending) {
      try {
        await this.sendToServer(log);
        await this.markAsSynced(log.id);
        result.synced++;
      } catch {
        result.failed++;
      }
    }

    return result;
  }

  private async sendToServer(log: CrisisLog): Promise<void> {
    await supabase.from('crisis_logs').insert({
      ...log,
      synced_at: new Date().toISOString()
    });
  }
}
```

---

## Checklist de Preparação para Crise

```
□ Modo offline implementado e testado
□ Backups automáticos configurados
□ Fallback de IA funcionando
□ Logs de erro persistentes
□ UI de emergência acessível
□ Exportação de dados disponível
□ Recuperação de falha de energia testada
□ Documentação de procedimentos atualizada
□ Equipe treinada nos protocolos
□ Contatos de emergência configurados
```

---

*Protocolo de crise documentado em: 2025-12-05*
