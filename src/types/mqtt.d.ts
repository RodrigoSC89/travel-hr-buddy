/**
 * PATCH 612 - MQTT Protocol Type Definitions
 * Type definitions for MQTT protocol used in inter-vessel communication
 */

declare module 'mqtt' {
  export interface IClientOptions {
    keepalive?: number;
    clientId?: string;
    protocolId?: 'MQTT' | 'MQIsdp';
    protocolVersion?: 3 | 4 | 5;
    clean?: boolean;
    reconnectPeriod?: number;
    connectTimeout?: number;
    username?: string;
    password?: string | Buffer;
    will?: IClientPublishOptions & {
      topic: string;
      payload: string | Buffer;
    };
    transformWsUrl?: (url: string, options: IClientOptions, client: MqttClient) => string;
    properties?: {
      sessionExpiryInterval?: number;
      receiveMaximum?: number;
      maximumPacketSize?: number;
      topicAliasMaximum?: number;
      requestResponseInformation?: boolean;
      requestProblemInformation?: boolean;
      userProperties?: Record<string, string | string[]>;
      authenticationMethod?: string;
      authenticationData?: Buffer;
    };
  }

  export interface IClientPublishOptions {
    qos?: 0 | 1 | 2;
    retain?: boolean;
    dup?: boolean;
    properties?: {
      payloadFormatIndicator?: boolean;
      messageExpiryInterval?: number;
      topicAlias?: number;
      responseTopic?: string;
      correlationData?: Buffer;
      userProperties?: Record<string, string | string[]>;
      subscriptionIdentifier?: number;
      contentType?: string;
    };
  }

  export interface ISubscriptionGrant {
    topic: string;
    qos: 0 | 1 | 2;
  }

  export interface IClientSubscribeOptions {
    qos: 0 | 1 | 2;
    nl?: boolean;
    rap?: boolean;
    rh?: number;
    properties?: {
      subscriptionIdentifier?: number;
      userProperties?: Record<string, string | string[]>;
    };
  }

  export interface IClientReconnectOptions {
    incomingStore?: any;
    outgoingStore?: any;
  }

  export type OnMessageCallback = (topic: string, payload: Buffer, packet: Packet) => void;
  export type OnPacketCallback = (packet: Packet) => void;
  export type OnErrorCallback = (error: Error) => void;
  export type ClientSubscribeCallback = (err: Error | null, granted?: ISubscriptionGrant[]) => void;
  export type OnCloseCallback = () => void;
  export type OnConnectCallback = (connack: { sessionPresent: boolean; returnCode: number }) => void;

  export interface Packet {
    cmd: string;
    retain: boolean;
    qos: 0 | 1 | 2;
    dup: boolean;
    length: number;
    topic: string;
    payload: Buffer;
  }

  export interface MqttClient {
    connected: boolean;
    reconnecting: boolean;
    options: IClientOptions;

    on(event: 'connect', cb: OnConnectCallback): this;
    on(event: 'message', cb: OnMessageCallback): this;
    on(event: 'packetsend', cb: OnPacketCallback): this;
    on(event: 'packetreceive', cb: OnPacketCallback): this;
    on(event: 'error', cb: OnErrorCallback): this;
    on(event: 'close', cb: OnCloseCallback): this;
    on(event: 'offline', cb: () => void): this;
    on(event: 'reconnect', cb: () => void): this;
    on(event: 'end', cb: () => void): this;

    once(event: 'connect', cb: OnConnectCallback): this;
    once(event: 'message', cb: OnMessageCallback): this;
    once(event: 'packetsend', cb: OnPacketCallback): this;
    once(event: 'packetreceive', cb: OnPacketCallback): this;
    once(event: 'error', cb: OnErrorCallback): this;
    once(event: 'close', cb: OnCloseCallback): this;
    once(event: 'offline', cb: () => void): this;
    once(event: 'reconnect', cb: () => void): this;
    once(event: 'end', cb: () => void): this;

    removeListener(event: string, callback: Function): this;
    removeAllListeners(event?: string): this;

    publish(topic: string, message: string | Buffer, callback?: (error?: Error) => void): this;
    publish(topic: string, message: string | Buffer, options?: IClientPublishOptions, callback?: (error?: Error) => void): this;

    subscribe(topic: string | string[], callback?: ClientSubscribeCallback): this;
    subscribe(topic: string | string[], options?: IClientSubscribeOptions, callback?: ClientSubscribeCallback): this;

    unsubscribe(topic: string | string[], callback?: (error?: Error) => void): this;
    unsubscribe(topic: string | string[], options?: object, callback?: (error?: Error) => void): this;

    end(force?: boolean, callback?: () => void): this;
    end(force?: boolean, options?: object, callback?: () => void): this;

    reconnect(options?: IClientReconnectOptions): this;
    handleMessage(packet: Packet, callback: (error?: Error) => void): void;
    getLastMessageId(): number;
  }

  export function connect(brokerUrl: string, options?: IClientOptions): MqttClient;
  export function connect(options?: IClientOptions): MqttClient;
}

export { };
