/**
 * PATCH 548 - WebRTC Wrapper
 * Type-safe wrapper for WebRTC operations
 */

import type {
  WebRTCConfig,
  WebRTCPeerConnection,
  WebRTCDataChannel
} from "@/types/ai-core";
import { logger } from "@/lib/logger";

export class WebRTCConnectionWrapper implements WebRTCPeerConnection {
  private pc: RTCPeerConnection;

  constructor(config: WebRTCConfig) {
    this.pc = new RTCPeerConnection({
      iceServers: config.iceServers,
      iceTransportPolicy: config.iceTransportPolicy,
      bundlePolicy: config.bundlePolicy,
      rtcpMuxPolicy: config.rtcpMuxPolicy,
    });

    // Setup event listeners
    this.setupEventListeners();
    logger.info("[WebRTC] Peer connection created");
  }

  private setupEventListeners(): void {
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        logger.debug("[WebRTC] ICE candidate generated");
      } else {
        logger.debug("[WebRTC] ICE gathering complete");
      }
    };

    this.pc.oniceconnectionstatechange = () => {
      logger.info(`[WebRTC] ICE connection state: ${this.pc.iceConnectionState}`);
    };

    this.pc.onconnectionstatechange = () => {
      logger.info(`[WebRTC] Connection state: ${this.pc.connectionState}`);
    };

    this.pc.onsignalingstatechange = () => {
      logger.debug(`[WebRTC] Signaling state: ${this.pc.signalingState}`);
    };
  }

  get localDescription(): RTCSessionDescription | null {
    return this.pc.localDescription;
  }

  get remoteDescription(): RTCSessionDescription | null {
    return this.pc.remoteDescription;
  }

  get signalingState(): RTCSignalingState {
    return this.pc.signalingState;
  }

  get iceConnectionState(): RTCIceConnectionState {
    return this.pc.iceConnectionState;
  }

  get connectionState(): RTCPeerConnectionState {
    return this.pc.connectionState;
  }

  async createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit> {
    try {
      const offer = await this.pc.createOffer(options);
      logger.info("[WebRTC] Offer created");
      return offer;
    } catch (error) {
      logger.error("[WebRTC] Failed to create offer:", error);
      throw error;
    }
  }

  async createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit> {
    try {
      const answer = await this.pc.createAnswer(options);
      logger.info("[WebRTC] Answer created");
      return answer;
    } catch (error) {
      logger.error("[WebRTC] Failed to create answer:", error);
      throw error;
    }
  }

  async setLocalDescription(description: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.pc.setLocalDescription(description);
      logger.info("[WebRTC] Local description set");
    } catch (error) {
      logger.error("[WebRTC] Failed to set local description:", error);
      throw error;
    }
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    try {
      await this.pc.setRemoteDescription(description);
      logger.info("[WebRTC] Remote description set");
    } catch (error) {
      logger.error("[WebRTC] Failed to set remote description:", error);
      throw error;
    }
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    try {
      await this.pc.addIceCandidate(candidate);
      logger.debug("[WebRTC] ICE candidate added");
    } catch (error) {
      logger.error("[WebRTC] Failed to add ICE candidate:", error);
      throw error;
    }
  }

  addTrack(track: MediaStreamTrack, ...streams: MediaStream[]): RTCRtpSender {
    const sender = this.pc.addTrack(track, ...streams);
    logger.info(`[WebRTC] Track added: ${track.kind}`);
    return sender;
  }

  removeTrack(sender: RTCRtpSender): void {
    this.pc.removeTrack(sender);
    logger.info("[WebRTC] Track removed");
  }

  close(): void {
    this.pc.close();
    logger.info("[WebRTC] Connection closed");
  }

  addEventListener(type: string, listener: EventListener): void {
    this.pc.addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: EventListener): void {
    this.pc.removeEventListener(type, listener);
  }

  /**
   * Create a data channel
   */
  createDataChannel(label: string, options?: RTCDataChannelInit): WebRTCDataChannel {
    const channel = this.pc.createDataChannel(label, options);
    logger.info(`[WebRTC] Data channel created: ${label}`);
    return new WebRTCDataChannelWrapper(channel);
  }
}

class WebRTCDataChannelWrapper implements WebRTCDataChannel {
  constructor(private channel: RTCDataChannel) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.channel.onopen = () => {
      logger.info(`[WebRTC DataChannel] Opened: ${this.channel.label}`);
    };

    this.channel.onclose = () => {
      logger.info(`[WebRTC DataChannel] Closed: ${this.channel.label}`);
    };

    this.channel.onerror = (error) => {
      logger.error(`[WebRTC DataChannel] Error on ${this.channel.label}:`, error);
    };
  }

  get label(): string {
    return this.channel.label;
  }

  get id(): number | null {
    return this.channel.id;
  }

  get readyState(): RTCDataChannelState {
    return this.channel.readyState;
  }

  get bufferedAmount(): number {
    return this.channel.bufferedAmount;
  }

  send(data: string | Blob | ArrayBuffer | ArrayBufferView): void {
    if (this.channel.readyState !== "open") {
      logger.warn(`[WebRTC DataChannel] Attempted to send data on non-open channel: ${this.channel.label}`);
      return;
    }
    
    try {
      this.channel.send(data as any);
      logger.debug(`[WebRTC DataChannel] Sent data on ${this.channel.label}`);
    } catch (error) {
      logger.error("[WebRTC DataChannel] Failed to send data:", error);
      throw error;
    }
  }

  close(): void {
    this.channel.close();
  }

  addEventListener(type: string, listener: EventListener): void {
    this.channel.addEventListener(type, listener);
  }

  removeEventListener(type: string, listener: EventListener): void {
    this.channel.removeEventListener(type, listener);
  }
}

/**
 * Factory function to create WebRTC peer connection
 */
export function createWebRTCConnection(config: WebRTCConfig): WebRTCPeerConnection {
  return new WebRTCConnectionWrapper(config);
}
