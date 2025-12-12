/**
 * WebSocket Optimizer
 * Optimizes real-time connections for low-bandwidth
 */

interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  messageThrottle?: number;
  batchMessages?: boolean;
  batchInterval?: number;
}

interface QueuedMessage {
  data: unknown;
  timestamp: number;
  priority: "high" | "normal" | "low";
}

type MessageHandler = (data: unknown) => void;
type StatusHandler = (status: "connecting" | "connected" | "disconnected" | "error") => void;

export class OptimizedWebSocket {
  private ws: WebSocket | null = null;
  private options: Required<WebSocketOptions>;
  private messageQueue: QueuedMessage[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempt = 0;
  private lastMessageTime = 0;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();
  private isIntentionallyClosed = false;

  constructor(options: WebSocketOptions) {
    this.options = {
      url: options.url,
      protocols: options.protocols || [],
      reconnectAttempts: options.reconnectAttempts ?? 5,
      reconnectDelay: options.reconnectDelay ?? 1000,
      heartbeatInterval: options.heartbeatInterval ?? 30000,
      messageThrottle: options.messageThrottle ?? 100,
      batchMessages: options.batchMessages ?? false,
      batchInterval: options.batchInterval ?? 500,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.isIntentionallyClosed = false;
      this.notifyStatus("connecting");

      try {
        this.ws = new WebSocket(this.options.url, this.options.protocols);

        this.ws.onopen = () => {
          this.reconnectAttempt = 0;
          this.notifyStatus("connected");
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          this.notifyStatus("error");
          reject(error);
        };

        this.ws.onclose = () => {
          this.stopHeartbeat();
          this.notifyStatus("disconnected");
          
          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleMessage(rawData: string | ArrayBuffer | Blob) {
    try {
      const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
      this.messageHandlers.forEach(handler => handler(data));
    } catch (error) {
      console.error("[WS] Failed to parse message:", error);
      console.error("[WS] Failed to parse message:", error);
    }
  }

  send(data: unknown, priority: "high" | "normal" | "low" = "normal") {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue message for when reconnected
      this.messageQueue.push({ data, timestamp: Date.now(), priority });
      return;
    }

    // High priority messages sent immediately
    if (priority === "high") {
      this.sendImmediate(data);
      return;
    }

    // Batch or throttle normal/low priority
    if (this.options.batchMessages) {
      this.queueForBatch(data, priority);
    } else {
      this.throttledSend(data);
    }
  }

  private sendImmediate(data: unknown) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      this.lastMessageTime = Date.now();
    }
  }

  private throttledSend(data: unknown) {
    const now = Date.now();
    const timeSinceLastMessage = now - this.lastMessageTime;

    if (timeSinceLastMessage >= this.options.messageThrottle) {
      this.sendImmediate(data);
    } else {
      // Delay the message
      setTimeout(() => {
        this.sendImmediate(data);
      }, this.options.messageThrottle - timeSinceLastMessage);
    }
  }

  private queueForBatch(data: unknown, priority: "high" | "normal" | "low") {
    this.messageQueue.push({ data, timestamp: Date.now(), priority });

    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.flushBatch();
      }, this.options.batchInterval);
    }
  }

  private flushBatch() {
    if (this.messageQueue.length === 0) return;

    // Sort by priority and timestamp
    const messages = this.messageQueue
      .sort((a, b) => {
        const priorityOrder = { high: 0, normal: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
      })
      .map(m => m.data);

    // Send as batch
    this.sendImmediate({ type: "batch", messages });
    
    this.messageQueue = [];
    this.batchTimeout = null;
  }

  private attemptReconnect() {
    if (this.reconnectAttempt >= this.options.reconnectAttempts) {
      return;
    }

    const delay = this.options.reconnectDelay * Math.pow(2, this.reconnectAttempt);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempt++;
      this.connect().catch(() => {
        // Will retry via onclose
      });
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatTimeout = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: "ping" }, "low");
      }
    }, this.options.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimeout) {
      clearInterval(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatus(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private notifyStatus(status: "connecting" | "connected" | "disconnected" | "error") {
    this.statusHandlers.forEach(handler => handler(status));
  }

  close() {
    this.isIntentionallyClosed = true;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.stopHeartbeat();
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.flushBatch(); // Send remaining messages
    }

    this.ws?.close();
    this.ws = null;
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get queueLength(): number {
    return this.messageQueue.length;
  }
}

/**
 * Create optimized WebSocket based on network quality
 */
export function createAdaptiveWebSocket(
  url: string,
  networkQuality: "fast" | "medium" | "slow" | "offline"
): OptimizedWebSocket {
  const configs: Record<string, Partial<WebSocketOptions>> = {
    fast: {
      messageThrottle: 50,
      batchMessages: false,
      heartbeatInterval: 30000,
    },
    medium: {
      messageThrottle: 200,
      batchMessages: true,
      batchInterval: 500,
      heartbeatInterval: 45000,
    },
    slow: {
      messageThrottle: 500,
      batchMessages: true,
      batchInterval: 1000,
      heartbeatInterval: 60000,
      reconnectDelay: 3000,
    },
    offline: {
      messageThrottle: 1000,
      batchMessages: true,
      batchInterval: 2000,
      heartbeatInterval: 120000,
      reconnectAttempts: 10,
      reconnectDelay: 5000,
    },
  };

  return new OptimizedWebSocket({
    url,
    ...configs[networkQuality],
  });
}
