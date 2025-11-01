/**
 * PATCH-601: TypeScript type definitions for MQTT
 * Comprehensive types for MQTT client and message handling
 */

import type { IClientOptions, IClientPublishOptions, IClientSubscribeOptions, MqttClient } from "mqtt";

export type { MqttClient, IClientOptions, IClientPublishOptions, IClientSubscribeOptions };

export interface MqttConnectionOptions extends IClientOptions {
  clientId?: string;
  keepalive?: number;
  reconnectPeriod?: number;
  connectTimeout?: number;
  username?: string;
  password?: string;
  clean?: boolean;
}

export interface MqttMessage {
  topic: string;
  payload: Buffer | string;
  qos: 0 | 1 | 2;
  retain: boolean;
  dup: boolean;
  messageId?: number;
}

export interface MqttSubscription {
  topic: string;
  qos: 0 | 1 | 2;
  callback?: (message: MqttMessage) => void;
}

export interface MqttPublishOptions extends IClientPublishOptions {
  qos?: 0 | 1 | 2;
  retain?: boolean;
  dup?: boolean;
}

export interface MqttConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error?: Error;
  lastConnectedAt?: Date;
  lastDisconnectedAt?: Date;
}

export interface MqttTopicSubscription {
  topic: string;
  qos: 0 | 1 | 2;
  subscribedAt: Date;
  messageCount: number;
  lastMessageAt?: Date;
}

export interface MqttClientConfig {
  brokerUrl: string;
  options: MqttConnectionOptions;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface MqttPublishResult {
  success: boolean;
  messageId?: number;
  error?: Error;
  publishedAt: Date;
}

export interface MqttSubscribeResult {
  success: boolean;
  topic: string;
  qos: 0 | 1 | 2;
  error?: Error;
  subscribedAt: Date;
}

export interface MqttUnsubscribeResult {
  success: boolean;
  topic: string;
  error?: Error;
  unsubscribedAt: Date;
}

export interface MqttStats {
  messagesPublished: number;
  messagesReceived: number;
  subscriptionsCount: number;
  connectionUptime: number;
  lastError?: Error;
}

export type MqttErrorType = 
  | "connection_failed"
  | "disconnection"
  | "subscription_failed"
  | "publish_failed"
  | "message_parsing_failed"
  | "authentication_failed"
  | "timeout"
  | "unknown";

export interface MqttError {
  type: MqttErrorType;
  message: string;
  originalError?: Error;
  timestamp: Date;
  topic?: string;
}

export type MqttEventType = 
  | "connect"
  | "disconnect"
  | "reconnect"
  | "close"
  | "error"
  | "message"
  | "offline"
  | "end";

export interface MqttEvent {
  type: MqttEventType;
  timestamp: Date;
  data?: unknown;
}
