/**
 * BridgeLink - Sistema de Comunicação entre Módulos
 * 
 * Barramento de eventos interno que conecta MMI, DP Intelligence, FMEA, ASOG e outros módulos
 * sem necessidade de backend. Opera 100% no browser com type-safety e telemetria automática.
 * 
 * @module BridgeLink
 * @version 1.0.0 (Core Alpha)
 */

// Tipos de eventos suportados
export type BridgeLinkEventType =
  | "mmi:forecast:update"
  | "mmi:job:created"
  | "dp:incident:reported"
  | "dp:intelligence:alert"
  | "fmea:risk:identified"
  | "asog:procedure:activated"
  | "wsog:checklist:completed"
  | "ai:analysis:complete"
  | "system:module:loaded"
  | "telemetry:log"
  | "mqtt:event";

// Estrutura de evento
export interface BridgeLinkEvent<T = unknown> {
  type: BridgeLinkEventType;
  source: string;
  data: T;
  timestamp: number;
  id: string;
}

// Tipo de callback para listeners
type EventListener<T = unknown> = (event: BridgeLinkEvent<T>) => void;

/**
 * BridgeLink - Classe singleton para gerenciamento de eventos
 */
class BridgeLinkManager {
  private listeners: Map<BridgeLinkEventType, Set<EventListener>> = new Map();
  private eventHistory: BridgeLinkEvent[] = [];
  private maxHistorySize = 500;

  /**
   * Registra um listener para um tipo de evento
   * @param eventType - Tipo de evento para ouvir
   * @param callback - Função a ser chamada quando o evento ocorrer
   * @returns Função para cancelar a inscrição
   */
  on<T = unknown>(
    eventType: BridgeLinkEventType,
    callback: EventListener<T>
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const listeners = this.listeners.get(eventType)!;
    listeners.add(callback as EventListener);

    // Retorna função de cleanup
    return () => {
      listeners.delete(callback as EventListener);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  /**
   * Emite um evento para todos os listeners registrados
   * @param eventType - Tipo de evento
   * @param source - Módulo que originou o evento
   * @param data - Dados do evento
   */
  emit<T = unknown>(
    eventType: BridgeLinkEventType,
    source: string,
    data: T
  ): void {
    const event: BridgeLinkEvent<T> = {
      type: eventType,
      source,
      data,
      timestamp: Date.now(),
      id: this.generateEventId(),
    };

    // Adiciona ao histórico
    this.addToHistory(event);

    // Notifica listeners
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error(`[BridgeLink] Error in listener for ${eventType}:`, error);
        }
      });
    }

    // Log de telemetria
    if (eventType !== "telemetry:log") {
      this.emit("telemetry:log", "BridgeLink", {
        event: eventType,
        source,
        timestamp: event.timestamp,
      });
    }
  }

  /**
   * Obtém o histórico de eventos
   * @param limit - Número máximo de eventos a retornar
   * @returns Array de eventos
   */
  getHistory(limit?: number): BridgeLinkEvent[] {
    const history = [...this.eventHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Limpa o histórico de eventos
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Obtém estatísticas do sistema
   */
  getStats() {
    const eventTypes = new Set(this.eventHistory.map((e) => e.type));
    const totalListeners = Array.from(this.listeners.values()).reduce(
      (sum, set) => sum + set.size,
      0
    );

    return {
      totalEvents: this.eventHistory.length,
      eventTypes: eventTypes.size,
      activeListeners: totalListeners,
      listenersByType: Array.from(this.listeners.entries()).map(([type, set]) => ({
        type,
        count: set.size,
      })),
    };
  }

  /**
   * Adiciona evento ao histórico
   */
  private addToHistory(event: BridgeLinkEvent): void {
    this.eventHistory.push(event);
    
    // Limita tamanho do histórico
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Gera ID único para evento
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Exporta instância singleton
export const BridgeLink = new BridgeLinkManager();

/**
 * React Hook para usar o BridgeLink
 * @param eventType - Tipo de evento para ouvir
 * @param callback - Função a ser chamada quando o evento ocorrer
 */
export function useBridgeLink<T = unknown>(
  eventType: BridgeLinkEventType,
  callback: EventListener<T>
): void {
  // Este hook será implementado no componente React que o utilizar
  // Por enquanto, apenas exportamos a interface
}
