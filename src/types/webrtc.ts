/**
 * PATCH-601: TypeScript type definitions for WebRTC
 * Comprehensive types for WebRTC peer connections and media streams
 */

export interface WebRTCConfiguration extends RTCConfiguration {
  iceServers: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
  bundlePolicy?: RTCBundlePolicy;
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
  iceCandidatePoolSize?: number;
}

export interface WebRTCPeerConnection {
  connection: RTCPeerConnection;
  id: string;
  remoteId?: string;
  state: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  createdAt: Date;
  connectedAt?: Date;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}

export interface WebRTCMediaConstraints extends MediaStreamConstraints {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
}

export interface WebRTCStreamConfig {
  audio: boolean;
  video: boolean;
  screen?: boolean;
  audioConstraints?: MediaTrackConstraints;
  videoConstraints?: MediaTrackConstraints;
}

export interface WebRTCOffer {
  type: "offer";
  sdp: string;
  sessionId: string;
  peerId: string;
  timestamp: Date;
}

export interface WebRTCAnswer {
  type: "answer";
  sdp: string;
  sessionId: string;
  peerId: string;
  timestamp: Date;
}

export interface WebRTCIceCandidate {
  candidate: string;
  sdpMLineIndex: number | null;
  sdpMid: string | null;
  sessionId: string;
  peerId: string;
  timestamp: Date;
}

export interface WebRTCSignalingMessage {
  type: "offer" | "answer" | "ice-candidate" | "hangup" | "error";
  data: WebRTCOffer | WebRTCAnswer | WebRTCIceCandidate | WebRTCError | null;
  from: string;
  to: string;
  timestamp: Date;
}

export interface WebRTCConnectionState {
  connected: boolean;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  iceGatheringState: RTCIceGatheringState;
  signalingState: RTCSignalingState;
}

export interface WebRTCMediaStats {
  audioLevel?: number;
  videoWidth?: number;
  videoHeight?: number;
  frameRate?: number;
  bitrate?: number;
  packetsLost?: number;
  jitter?: number;
  roundTripTime?: number;
}

export interface WebRTCDataChannelConfig extends RTCDataChannelInit {
  ordered?: boolean;
  maxPacketLifeTime?: number;
  maxRetransmits?: number;
  protocol?: string;
  negotiated?: boolean;
  id?: number;
}

export interface WebRTCDataChannel {
  channel: RTCDataChannel;
  id: string;
  label: string;
  readyState: RTCDataChannelState;
  createdAt: Date;
  messagesSent: number;
  messagesReceived: number;
  bytesSent: number;
  bytesReceived: number;
}

export interface WebRTCScreenShareConfig {
  video: DisplayMediaStreamOptions["video"];
  audio?: boolean | MediaTrackConstraints;
  systemAudio?: boolean;
}

export interface WebRTCRecordingConfig {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
  bitsPerSecond?: number;
}

export interface WebRTCRecordingState {
  recording: boolean;
  startedAt?: Date;
  duration: number;
  dataSize: number;
  chunks: Blob[];
}

export type WebRTCErrorType = 
  | "connection_failed"
  | "ice_gathering_failed"
  | "signaling_failed"
  | "media_access_denied"
  | "peer_connection_closed"
  | "data_channel_failed"
  | "sdp_parse_failed"
  | "network_error"
  | "unknown";

export interface WebRTCError {
  type: WebRTCErrorType;
  message: string;
  originalError?: Error;
  timestamp: Date;
  peerId?: string;
}

export interface WebRTCEvent {
  type: WebRTCEventType;
  timestamp: Date;
  peerId?: string;
  data?: unknown;
}

export type WebRTCEventType = 
  | "connection_state_change"
  | "ice_connection_state_change"
  | "ice_gathering_state_change"
  | "signaling_state_change"
  | "ice_candidate"
  | "track"
  | "data_channel"
  | "negotiation_needed"
  | "connection_established"
  | "connection_closed"
  | "error";

export interface WebRTCQualityMetrics {
  videoQuality: "low" | "medium" | "high" | "hd" | "unknown";
  audioQuality: "low" | "medium" | "high" | "unknown";
  connectionQuality: "poor" | "fair" | "good" | "excellent";
  latency: number;
  packetLoss: number;
  jitter: number;
  bandwidth: number;
}

export interface WebRTCSessionInfo {
  sessionId: string;
  localPeerId: string;
  remotePeerId?: string;
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  mediaType: "audio" | "video" | "audio_video" | "screen_share" | "data";
  quality?: WebRTCQualityMetrics;
}
