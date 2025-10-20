import { BridgeLinkConnection } from './types';
import hubConfig from './hub_config.json';

export class HubBridge {
  private config = hubConfig;
  private connection: BridgeLinkConnection = {
    isConnected: false,
    quality: 'offline',
  };

  /**
   * Verifica conectividade com BridgeLink
   */
  async checkConnection(): Promise<BridgeLinkConnection> {
    try {
      const startTime = Date.now();
      
      // Simula verificação de conexão
      // Em produção, isso faria uma chamada real à API BridgeLink
      const isOnline = navigator.onLine;
      
      if (isOnline) {
        const latency = Date.now() - startTime;
        this.connection = {
          isConnected: true,
          quality: this.determineQuality(latency),
          lastPing: new Date(),
          latency,
        };
      } else {
        this.connection = {
          isConnected: false,
          quality: 'offline',
        };
      }

      return this.connection;
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      this.connection = {
        isConnected: false,
        quality: 'offline',
      };
      return this.connection;
    }
  }

  /**
   * Determina qualidade da conexão baseado na latência
   */
  private determineQuality(latency: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (latency < 100) return 'excellent';
    if (latency < 250) return 'good';
    if (latency < 500) return 'fair';
    return 'poor';
  }

  /**
   * Envia dados para BridgeLink
   */
  async sendData(data: any): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.connection.isConnected) {
        return { success: false, error: 'Sem conexão com BridgeLink' };
      }

      // Em produção, isso enviaria os dados para a API BridgeLink
      // Por enquanto, simula o envio
      await this.simulateDelay(1000);

      console.log('📤 Dados enviados para BridgeLink:', data);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao enviar dados:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Envia dados com retry
   */
  async sendWithRetry(data: any): Promise<{ success: boolean; error?: string; attempts: number }> {
    let lastError = '';
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      const result = await this.sendData(data);
      
      if (result.success) {
        return { success: true, attempts: attempt };
      }

      lastError = result.error || 'Erro desconhecido';
      
      if (attempt < this.config.retryAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`🔄 Tentativa ${attempt} falhou. Aguardando ${delay}ms...`);
        await this.simulateDelay(delay);
      }
    }

    return { 
      success: false, 
      error: lastError,
      attempts: this.config.retryAttempts 
    };
  }

  /**
   * Obtém status da conexão atual
   */
  getStatus(): BridgeLinkConnection {
    return this.connection;
  }

  /**
   * Simula delay
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const hubBridge = new HubBridge();
