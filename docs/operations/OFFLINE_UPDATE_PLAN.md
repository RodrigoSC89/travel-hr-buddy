# 🔄 Sistema de Atualizações Offline

## Visão Geral

Este documento descreve o sistema de atualização do Nautilus One para ambientes offline ou com conectividade limitada, como embarcações em alto mar.

---

## Arquitetura de Atualização

```
┌─────────────────────────────────────────────────────────────┐
│                  Sistema de Atualizações                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Servidor  │───▶│  Pacote de  │───▶│ Dispositivo │     │
│  │   Central   │    │ Atualização │    │   Cliente   │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                            │                   │            │
│                            ▼                   ▼            │
│                     ┌─────────────┐    ┌─────────────┐     │
│                     │ - Via Rede  │    │ - Verificar │     │
│                     │ - Via USB   │    │ - Aplicar   │     │
│                     │ - Via Local │    │ - Rollback  │     │
│                     └─────────────┘    └─────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Mecanismos de Distribuição

### 1.1 Atualização via Rede (Quando Disponível)

```typescript
// src/lib/updates/network-updater.ts
export class NetworkUpdater {
  private updateServer = 'https://updates.nautilus.app';

  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const response = await fetch(`${this.updateServer}/api/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentVersion: await this.getCurrentVersion(),
          platform: this.getPlatform(),
          deviceId: this.getDeviceId()
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      
      if (data.updateAvailable) {
        return {
          version: data.version,
          size: data.size,
          releaseNotes: data.releaseNotes,
          critical: data.critical,
          downloadUrl: data.downloadUrl,
          checksum: data.checksum
        };
      }

      return null;
    } catch (error) {
      console.log('Verificação de atualização falhou (esperado offline)');
      return null;
    }
  }

  async downloadUpdate(updateInfo: UpdateInfo): Promise<Blob> {
    const response = await fetch(updateInfo.downloadUrl);
    const blob = await response.blob();
    
    // Verificar integridade
    const checksum = await this.calculateChecksum(blob);
    if (checksum !== updateInfo.checksum) {
      throw new Error('Falha na verificação de integridade');
    }

    return blob;
  }
}
```

### 1.2 Atualização via USB/Pendrive

```typescript
// src/lib/updates/usb-updater.ts
export class USBUpdater {
  private readonly UPDATE_FILE_PATTERN = /nautilus-update-v[\d.]+\.nup$/;

  /**
   * Processa arquivo de atualização do pendrive
   */
  async processUpdateFile(file: File): Promise<UpdateResult> {
    // 1. Validar formato do arquivo
    if (!this.UPDATE_FILE_PATTERN.test(file.name)) {
      throw new Error('Arquivo de atualização inválido');
    }

    // 2. Ler e descompactar
    const updatePackage = await this.extractPackage(file);

    // 3. Verificar assinatura digital
    const isValid = await this.verifySignature(updatePackage);
    if (!isValid) {
      throw new Error('Assinatura digital inválida');
    }

    // 4. Verificar compatibilidade
    const compatible = await this.checkCompatibility(updatePackage);
    if (!compatible.ok) {
      throw new Error(`Incompatível: ${compatible.reason}`);
    }

    // 5. Aplicar atualização
    return await this.applyUpdate(updatePackage);
  }

  /**
   * Estrutura do pacote de atualização
   */
  private async extractPackage(file: File): Promise<UpdatePackage> {
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    return {
      manifest: JSON.parse(await zip.file('manifest.json')!.async('string')),
      files: await this.extractFiles(zip),
      migrations: await this.extractMigrations(zip),
      signature: await zip.file('signature.sig')!.async('arraybuffer')
    };
  }
}
```

### 1.3 Atualização via Rede Local

```typescript
// src/lib/updates/local-network-updater.ts
export class LocalNetworkUpdater {
  private readonly DISCOVERY_PORT = 54321;
  private readonly UPDATE_SERVER_NAME = 'nautilus-update-server';

  /**
   * Descobre servidor de atualização na rede local
   */
  async discoverLocalServer(): Promise<string | null> {
    try {
      // Tentar mDNS/Bonjour
      const services = await this.mdnsDiscover(this.UPDATE_SERVER_NAME);
      
      if (services.length > 0) {
        return `http://${services[0].address}:${services[0].port}`;
      }

      // Fallback: broadcast UDP
      const response = await this.broadcastDiscover();
      return response?.address || null;
      
    } catch (error) {
      return null;
    }
  }

  /**
   * Baixa atualização do servidor local (navio com servidor próprio)
   */
  async downloadFromLocalServer(serverUrl: string): Promise<Blob> {
    const updateInfo = await fetch(`${serverUrl}/api/latest`).then(r => r.json());
    
    // Download com retry
    return await this.downloadWithRetry(
      `${serverUrl}/download/${updateInfo.filename}`,
      3
    );
  }
}
```

---

## 2. Verificação de Integridade

### 2.1 Sistema de Checksums

```typescript
// src/lib/updates/integrity-checker.ts
export class IntegrityChecker {
  /**
   * Calcula SHA-256 do arquivo
   */
  async calculateChecksum(data: ArrayBuffer | Blob): Promise<string> {
    const buffer = data instanceof Blob 
      ? await data.arrayBuffer() 
      : data;
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verifica assinatura digital do pacote
   */
  async verifySignature(
    data: ArrayBuffer, 
    signature: ArrayBuffer, 
    publicKey: CryptoKey
  ): Promise<boolean> {
    return await crypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5' },
      publicKey,
      signature,
      data
    );
  }

  /**
   * Verifica integridade de todos os arquivos do pacote
   */
  async verifyPackageIntegrity(
    updatePackage: UpdatePackage
  ): Promise<IntegrityResult> {
    const result: IntegrityResult = {
      valid: true,
      files: []
    };

    for (const file of updatePackage.files) {
      const actualChecksum = await this.calculateChecksum(file.content);
      const expectedChecksum = updatePackage.manifest.files[file.path];
      
      const fileResult = {
        path: file.path,
        expected: expectedChecksum,
        actual: actualChecksum,
        valid: actualChecksum === expectedChecksum
      };
      
      result.files.push(fileResult);
      
      if (!fileResult.valid) {
        result.valid = false;
      }
    }

    return result;
  }
}
```

### 2.2 Verificação Pré-Atualização

```typescript
// src/lib/updates/pre-update-checker.ts
export class PreUpdateChecker {
  async runPreChecks(): Promise<PreCheckResult> {
    const checks: PreCheckResult = {
      passed: true,
      checks: []
    };

    // 1. Espaço em disco
    const storageCheck = await this.checkStorage();
    checks.checks.push(storageCheck);

    // 2. Bateria (se aplicável)
    const batteryCheck = await this.checkBattery();
    checks.checks.push(batteryCheck);

    // 3. Versão atual
    const versionCheck = await this.checkCurrentVersion();
    checks.checks.push(versionCheck);

    // 4. Dados pendentes de sync
    const syncCheck = await this.checkPendingSync();
    checks.checks.push(syncCheck);

    // 5. Estado do sistema
    const systemCheck = await this.checkSystemHealth();
    checks.checks.push(systemCheck);

    checks.passed = checks.checks.every(c => c.passed);
    
    return checks;
  }

  private async checkStorage(): Promise<CheckItem> {
    const estimate = await navigator.storage.estimate();
    const freeSpace = (estimate.quota || 0) - (estimate.usage || 0);
    const requiredSpace = 100 * 1024 * 1024; // 100MB mínimo

    return {
      name: 'Espaço em disco',
      passed: freeSpace > requiredSpace,
      message: freeSpace > requiredSpace 
        ? `${(freeSpace / 1024 / 1024).toFixed(0)}MB disponível`
        : 'Espaço insuficiente'
    };
  }

  private async checkBattery(): Promise<CheckItem> {
    if (!('getBattery' in navigator)) {
      return { name: 'Bateria', passed: true, message: 'N/A' };
    }

    const battery = await (navigator as any).getBattery();
    const minLevel = 0.3; // 30%

    return {
      name: 'Bateria',
      passed: battery.charging || battery.level > minLevel,
      message: battery.charging 
        ? 'Carregando'
        : `${(battery.level * 100).toFixed(0)}% - ${battery.level > minLevel ? 'OK' : 'Baixa'}`
    };
  }

  private async checkPendingSync(): Promise<CheckItem> {
    const pendingCount = await this.getPendingSyncCount();
    
    return {
      name: 'Dados pendentes',
      passed: pendingCount < 100, // Limite aceitável
      message: pendingCount === 0 
        ? 'Tudo sincronizado'
        : `${pendingCount} itens pendentes`,
      warning: pendingCount > 0
    };
  }
}
```

---

## 3. Estratégia de Rollback

### 3.1 Sistema de Backup Automático

```typescript
// src/lib/updates/backup-manager.ts
export class BackupManager {
  private readonly BACKUP_PREFIX = 'nautilus_backup_';

  /**
   * Cria backup completo antes da atualização
   */
  async createPreUpdateBackup(): Promise<BackupInfo> {
    const timestamp = Date.now();
    const backupId = `${this.BACKUP_PREFIX}${timestamp}`;

    // 1. Backup dos dados do IndexedDB
    const dbBackup = await this.backupIndexedDB();

    // 2. Backup do localStorage
    const localStorageBackup = this.backupLocalStorage();

    // 3. Backup das configurações
    const configBackup = await this.backupConfigurations();

    // 4. Versão atual do sistema
    const versionInfo = await this.getCurrentVersionInfo();

    const backup: Backup = {
      id: backupId,
      timestamp,
      version: versionInfo,
      data: {
        indexedDB: dbBackup,
        localStorage: localStorageBackup,
        config: configBackup
      }
    };

    // Salvar backup
    await this.saveBackup(backup);

    // Limpar backups antigos (manter últimos 3)
    await this.cleanOldBackups(3);

    return {
      id: backupId,
      timestamp,
      size: this.calculateBackupSize(backup)
    };
  }

  /**
   * Restaura backup em caso de falha
   */
  async restoreBackup(backupId: string): Promise<RestoreResult> {
    const backup = await this.loadBackup(backupId);
    
    if (!backup) {
      throw new Error('Backup não encontrado');
    }

    // 1. Verificar integridade do backup
    const integrityOk = await this.verifyBackupIntegrity(backup);
    if (!integrityOk) {
      throw new Error('Backup corrompido');
    }

    // 2. Restaurar IndexedDB
    await this.restoreIndexedDB(backup.data.indexedDB);

    // 3. Restaurar localStorage
    this.restoreLocalStorage(backup.data.localStorage);

    // 4. Restaurar configurações
    await this.restoreConfigurations(backup.data.config);

    return {
      success: true,
      restoredVersion: backup.version,
      timestamp: backup.timestamp
    };
  }
}
```

### 3.2 Rollback Automático

```typescript
// src/lib/updates/auto-rollback.ts
export class AutoRollback {
  private readonly HEALTH_CHECK_INTERVAL = 5000; // 5 segundos
  private readonly MAX_FAILURES = 3;
  private failureCount = 0;

  /**
   * Inicia monitoramento pós-atualização
   */
  async startPostUpdateMonitoring(): Promise<void> {
    const backupId = localStorage.getItem('last_backup_id');
    
    if (!backupId) {
      console.warn('Nenhum backup disponível para rollback');
      return;
    }

    // Monitorar saúde do sistema
    const interval = setInterval(async () => {
      const healthy = await this.checkSystemHealth();
      
      if (!healthy) {
        this.failureCount++;
        console.warn(`Falha de saúde detectada (${this.failureCount}/${this.MAX_FAILURES})`);
        
        if (this.failureCount >= this.MAX_FAILURES) {
          clearInterval(interval);
          await this.triggerAutoRollback(backupId);
        }
      } else {
        this.failureCount = 0;
      }
    }, this.HEALTH_CHECK_INTERVAL);

    // Parar monitoramento após 5 minutos se tudo OK
    setTimeout(() => {
      if (this.failureCount === 0) {
        clearInterval(interval);
        this.markUpdateSuccessful();
      }
    }, 5 * 60 * 1000);
  }

  private async checkSystemHealth(): Promise<boolean> {
    try {
      // Verificar componentes críticos
      const checks = await Promise.all([
        this.checkDatabaseAccess(),
        this.checkUIRendering(),
        this.checkCriticalFunctions()
      ]);
      
      return checks.every(c => c);
    } catch {
      return false;
    }
  }

  private async triggerAutoRollback(backupId: string): Promise<void> {
    console.error('Iniciando rollback automático...');
    
    const backupManager = new BackupManager();
    
    try {
      await backupManager.restoreBackup(backupId);
      
      // Recarregar aplicação
      window.location.reload();
    } catch (error) {
      console.error('Falha no rollback automático:', error);
      // Mostrar UI de emergência
      this.showEmergencyUI();
    }
  }
}
```

---

## 4. Log de Atualizações

### 4.1 Registro de Histórico

```typescript
// src/lib/updates/update-logger.ts
export class UpdateLogger {
  private readonly LOG_KEY = 'update_history';

  async logUpdate(update: UpdateRecord): Promise<void> {
    const history = await this.getHistory();
    
    history.push({
      ...update,
      timestamp: Date.now(),
      deviceId: this.getDeviceId()
    });

    // Manter últimos 50 registros
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    await this.saveHistory(history);
  }

  async getHistory(): Promise<UpdateRecord[]> {
    const stored = localStorage.getItem(this.LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  async generateReport(): Promise<UpdateReport> {
    const history = await this.getHistory();
    
    return {
      totalUpdates: history.length,
      successfulUpdates: history.filter(u => u.status === 'success').length,
      failedUpdates: history.filter(u => u.status === 'failed').length,
      rolledBack: history.filter(u => u.status === 'rolledback').length,
      lastUpdate: history[history.length - 1],
      currentVersion: await this.getCurrentVersion(),
      history: history.slice(-10) // Últimas 10
    };
  }
}

interface UpdateRecord {
  version: string;
  previousVersion: string;
  timestamp: number;
  method: 'network' | 'usb' | 'local';
  status: 'success' | 'failed' | 'rolledback';
  duration: number;
  error?: string;
  deviceId: string;
}
```

---

## 5. Interface de Atualização

### 5.1 Componente de UI

```typescript
// src/components/updates/UpdateManager.tsx
export function UpdateManager() {
  const { 
    checkingForUpdates,
    updateAvailable,
    updateInfo,
    downloadProgress,
    installing,
    checkForUpdates,
    downloadAndInstall,
    installFromFile
  } = useUpdates();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Atualizações do Sistema
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Versão Atual */}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Versão Atual</span>
          <Badge variant="outline">v{currentVersion}</Badge>
        </div>

        {/* Status de Atualização */}
        {updateAvailable && updateInfo && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Nova versão disponível</AlertTitle>
            <AlertDescription>
              Versão {updateInfo.version} ({formatBytes(updateInfo.size)})
              {updateInfo.critical && (
                <Badge variant="destructive" className="ml-2">Crítica</Badge>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Progresso de Download */}
        {downloadProgress > 0 && downloadProgress < 100 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Baixando atualização...</span>
              <span>{downloadProgress}%</span>
            </div>
            <Progress value={downloadProgress} />
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2">
          <Button 
            onClick={checkForUpdates}
            disabled={checkingForUpdates || installing}
            variant="outline"
          >
            {checkingForUpdates ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Verificar Atualizações
          </Button>

          {updateAvailable && (
            <Button 
              onClick={downloadAndInstall}
              disabled={installing}
            >
              <Download className="h-4 w-4 mr-2" />
              Instalar Atualização
            </Button>
          )}
        </div>

        {/* Upload Manual */}
        <Separator />
        
        <div className="space-y-2">
          <Label>Atualização via USB</Label>
          <p className="text-sm text-muted-foreground">
            Selecione um arquivo de atualização (.nup) do pendrive
          </p>
          <Input
            type="file"
            accept=".nup"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) installFromFile(file);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 6. Procedimento para Equipe Técnica

### 6.1 Preparando Pacote de Atualização

```bash
# 1. Build do sistema
npm run build

# 2. Gerar pacote de atualização
npm run generate-update-package

# O script gera:
# - nautilus-update-v2.1.0.nup (pacote compactado)
# - nautilus-update-v2.1.0.nup.sha256 (checksum)
# - release-notes-v2.1.0.md (notas de versão)
```

### 6.2 Distribuição via Pendrive

```markdown
# Instruções para Atualização via Pendrive

## Preparação (Equipe de TI)
1. Baixe o pacote de atualização do servidor
2. Copie para o pendrive (FAT32 ou exFAT)
3. Verifique o checksum SHA-256
4. Inclua as instruções impressas

## Aplicação (Equipe Embarcada)
1. Conecte o pendrive no computador/tablet
2. Abra o Nautilus One
3. Vá em Configurações > Atualizações
4. Clique em "Atualização via USB"
5. Selecione o arquivo .nup
6. Aguarde a verificação de integridade
7. Confirme a instalação
8. Aguarde a conclusão (não desligue!)
9. Verifique se o sistema está funcionando

## Em caso de problemas
- Contate suporte: suporte@nautilus.app
- WhatsApp: +55 XX XXXXX-XXXX
- O sistema possui rollback automático
```

---

## 7. Checklist de Atualização

```markdown
# Checklist Pré-Atualização
□ Versão atual verificada
□ Backup automático realizado
□ Espaço em disco suficiente (>100MB)
□ Bateria >30% ou conectado na tomada
□ Dados pendentes sincronizados (se possível)

# Durante Atualização
□ Integridade do pacote verificada
□ Assinatura digital validada
□ Compatibilidade confirmada
□ Backup pré-atualização criado

# Pós-Atualização
□ Sistema inicia normalmente
□ Login funciona
□ Dados estão acessíveis
□ Funcionalidades críticas OK
□ Versão nova confirmada

# Em Caso de Falha
□ Rollback automático ativado
□ Se manual: Configurações > Restaurar Backup
□ Documentar erro e reportar
```

---

*Sistema de atualizações offline - Documentação gerada em: 2025-12-05*
