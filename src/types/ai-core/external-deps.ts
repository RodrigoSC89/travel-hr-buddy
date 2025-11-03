/**
 * PATCH 548 - External Dependencies Types
 * Type definitions for MQTT, WebRTC, ONNX and other external libraries
 */

// ==================== MQTT Types ====================

export interface MQTTConfig {
  host: string;
  port: number;
  protocol: "mqtt" | "mqtts" | "ws" | "wss";
  clientId?: string;
  username?: string;
  password?: string;
  keepalive?: number;
  reconnectPeriod?: number;
  connectTimeout?: number;
  clean?: boolean;
}

export interface MQTTMessage {
  topic: string;
  payload: Buffer | string;
  qos: 0 | 1 | 2;
  retain?: boolean;
  dup?: boolean;
  messageId?: number;
}

export interface MQTTSubscription {
  topic: string;
  qos: 0 | 1 | 2;
  callback: (message: MQTTMessage) => void;
}

export interface MQTTClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(topic: string, qos?: 0 | 1 | 2): Promise<void>;
  unsubscribe(topic: string): Promise<void>;
  publish(topic: string, payload: string | Buffer, qos?: 0 | 1 | 2): Promise<void>;
  on(event: string, callback: (...args: unknown[]) => void): void;
  isConnected(): boolean;
}

// ==================== WebRTC Types ====================

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
  bundlePolicy?: RTCBundlePolicy;
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
}

export interface WebRTCPeerConnection {
  localDescription: RTCSessionDescription | null;
  remoteDescription: RTCSessionDescription | null;
  signalingState: RTCSignalingState;
  iceConnectionState: RTCIceConnectionState;
  connectionState: RTCPeerConnectionState;
  createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
  createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit>;
  setLocalDescription(description: RTCSessionDescriptionInit): Promise<void>;
  setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
  addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender;
  removeTrack(sender: RTCRtpSender): void;
  close(): void;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

export interface WebRTCDataChannel {
  label: string;
  id: number | null;
  readyState: RTCDataChannelState;
  bufferedAmount: number;
  send(data: string | Blob | ArrayBuffer | ArrayBufferView): void;
  close(): void;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

// ==================== ONNX Runtime Types ====================

export interface ONNXConfig {
  executionProviders: ONNXExecutionProvider[];
  graphOptimizationLevel?: "disabled" | "basic" | "extended" | "all";
  enableCpuMemArena?: boolean;
  enableMemPattern?: boolean;
  executionMode?: "sequential" | "parallel";
  logSeverityLevel?: 0 | 1 | 2 | 3 | 4;
}

export type ONNXExecutionProvider = 
  | "cpu"
  | "cuda"
  | "webgl"
  | "webgpu"
  | "wasm";

export interface ONNXModel {
  inputNames: string[];
  outputNames: string[];
  run(inputs: ONNXInputs): Promise<ONNXOutputs>;
  release(): void;
}

export type ONNXInputs = Record<string, ONNXTensor>;
export type ONNXOutputs = Record<string, ONNXTensor>;

export interface ONNXTensor {
  data: Float32Array | Int32Array | Uint8Array | BigInt64Array;
  dims: number[];
  type: ONNXTensorType;
}

export type ONNXTensorType = 
  | "float32"
  | "int32"
  | "uint8"
  | "int64"
  | "string"
  | "bool";

export interface ONNXInferenceSession {
  loadModel(modelPath: string): Promise<ONNXModel>;
  run(inputs: ONNXInputs): Promise<ONNXOutputs>;
  release(): void;
}

// ==================== TensorFlow Types ====================

export interface TensorFlowConfig {
  backend: "cpu" | "webgl" | "wasm";
  flags?: Record<string, boolean | number | string>;
}

export interface TFModel {
  predict(input: TFTensor | TFTensor[]): TFTensor | TFTensor[];
  execute(inputs: Record<string, TFTensor>): Record<string, TFTensor>;
  dispose(): void;
}

export interface TFTensor {
  shape: number[];
  dtype: string;
  data(): Promise<Float32Array | Int32Array | Uint8Array>;
  array(): Promise<number[]>;
  dispose(): void;
}
