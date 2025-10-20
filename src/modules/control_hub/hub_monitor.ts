import { ModuleStatus } from './types';
import hubConfig from './hub_config.json';

export class HubMonitor {
  private modules: Record<string, ModuleStatus> = {};
  private startTime = Date.now();

  constructor() {
    this.initializeModules();
  }

  /**
   * Inicializa o monitoramento dos módulos
   */
  private initializeModules(): void {
    Object.entries(hubConfig.modules).forEach(([key, config]) => {
      if (config.enabled) {
        this.modules[key] = {
          name: config.name,
          status: 'OK',
          uptime: 0,
          errors: 0,
          lastCheck: new Date(),
          performance: this.randomPerformance(),
        };
      }
    });
  }

  /**
   * Exibe status de todos os módulos
   */
  exibirStatus(): Record<string, ModuleStatus> {
    // Atualiza status simulado
    this.updateModuleStatuses();
    
    console.log('\n📡 Status Operacional:');
    Object.entries(this.modules).forEach(([key, module]) => {
      console.log(`  - ${module.name}: ${module.status}`);
    });
    console.log(`Última verificação: ${new Date().toLocaleTimeString()}`);
    
    return this.modules;
  }

  /**
   * Atualiza status dos módulos
   */
  private updateModuleStatuses(): void {
    Object.keys(this.modules).forEach((key) => {
      const module = this.modules[key];
      
      // Simula diferentes estados
      if (key === 'mmi') {
        module.status = this.randomChoice(['OK', 'Em verificação']);
      } else if (key === 'peodp') {
        module.status = this.randomChoice(['Auditoria OK', 'Desvio detectado']);
      } else if (key === 'bridgeLink') {
        module.status = navigator.onLine ? 'Online' : 'Offline';
      } else if (key === 'dpIntelligence') {
        module.performance = this.randomPerformance();
        module.status = 'OK';
      } else {
        module.status = 'OK';
      }

      module.uptime = Math.floor((Date.now() - this.startTime) / 1000);
      module.lastCheck = new Date();
    });
  }

  /**
   * Obtém status de um módulo específico
   */
  getModuleStatus(moduleKey: string): ModuleStatus | undefined {
    return this.modules[moduleKey];
  }

  /**
   * Obtém todos os status
   */
  getAllStatuses(): Record<string, ModuleStatus> {
    this.updateModuleStatuses();
    return this.modules;
  }

  /**
   * Registra erro em um módulo
   */
  registerError(moduleKey: string, error: string): void {
    const module = this.modules[moduleKey];
    if (module) {
      module.errors = (module.errors || 0) + 1;
      module.status = 'Error';
      console.error(`❌ Erro em ${module.name}: ${error}`);
    }
  }

  /**
   * Verifica saúde geral do sistema
   */
  checkSystemHealth(): { status: 'healthy' | 'degraded' | 'critical'; issues: string[] } {
    const issues: string[] = [];
    let criticalCount = 0;
    let warningCount = 0;

    Object.entries(this.modules).forEach(([key, module]) => {
      if (module.status === 'Error' || module.status === 'Offline') {
        criticalCount++;
        issues.push(`${module.name} está ${module.status}`);
      } else if (module.status === 'Desvio detectado' || module.status === 'Em verificação') {
        warningCount++;
        issues.push(`${module.name} requer atenção`);
      }
    });

    let status: 'healthy' | 'degraded' | 'critical';
    if (criticalCount > 0) {
      status = 'critical';
    } else if (warningCount > 1) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    return { status, issues };
  }

  /**
   * Gera performance aleatória
   */
  private randomPerformance(): number {
    return Math.floor(Math.random() * (97 - 80 + 1)) + 80;
  }

  /**
   * Escolhe um item aleatório de um array
   */
  private randomChoice<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Reseta métricas de um módulo
   */
  resetModule(moduleKey: string): void {
    const module = this.modules[moduleKey];
    if (module) {
      module.errors = 0;
      module.status = 'OK';
      module.lastCheck = new Date();
    }
  }
}

export const hubMonitor = new HubMonitor();
