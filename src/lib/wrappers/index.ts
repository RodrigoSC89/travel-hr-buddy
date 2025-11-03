/**
 * PATCH 548 - Type-Safe Wrappers Index
 * Centralized exports for all external dependency wrappers
 */

export { createMQTTClient } from "./mqtt-wrapper";
export { createONNXSession, createTensor } from "./onnx-wrapper";
export { createWebRTCConnection } from "./webrtc-wrapper";

export type { MQTTClient } from "@/types/ai-core";
export type { ONNXInferenceSession, ONNXModel } from "@/types/ai-core";
export type { WebRTCPeerConnection, WebRTCDataChannel } from "@/types/ai-core";
