/**
 * PATCH 612 - WebRTC Type Definitions
 * Type definitions for WebRTC protocol used in real-time vessel communication
 */

declare global {
  interface RTCConfiguration {
    iceServers?: RTCIceServer[];
    iceTransportPolicy?: RTCIceTransportPolicy;
    bundlePolicy?: RTCBundlePolicy;
    rtcpMuxPolicy?: RTCRtcpMuxPolicy;
    peerIdentity?: string;
    certificates?: RTCCertificate[];
    iceCandidatePoolSize?: number;
  }

  interface RTCIceServer {
    urls: string | string[];
    username?: string;
    credential?: string;
    credentialType?: RTCIceCredentialType;
  }

  type RTCIceTransportPolicy = 'all' | 'relay';
  type RTCBundlePolicy = 'balanced' | 'max-compat' | 'max-bundle';
  type RTCRtcpMuxPolicy = 'require';
  type RTCIceCredentialType = 'password' | 'oauth';

  interface RTCPeerConnectionIceEvent extends Event {
    candidate: RTCIceCandidate | null;
  }

  interface RTCPeerConnectionIceErrorEvent extends Event {
    address: string | null;
    port: number | null;
    url: string;
    errorCode: number;
    errorText: string;
  }

  interface RTCTrackEvent extends Event {
    receiver: RTCRtpReceiver;
    track: MediaStreamTrack;
    streams: ReadonlyArray<MediaStream>;
    transceiver: RTCRtpTransceiver;
  }

  interface RTCDataChannelEvent extends Event {
    channel: RTCDataChannel;
  }

  interface RTCIceCandidate {
    candidate: string;
    sdpMid: string | null;
    sdpMLineIndex: number | null;
    foundation: string;
    component: RTCIceComponent;
    priority: number;
    address: string;
    protocol: RTCIceProtocol;
    port: number;
    type: RTCIceCandidateType;
    tcpType: RTCIceTcpCandidateType | null;
    relatedAddress: string | null;
    relatedPort: number | null;
    usernameFragment: string | null;
    toJSON(): RTCIceCandidateInit;
  }

  interface RTCIceCandidateInit {
    candidate?: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string;
  }

  type RTCIceComponent = 'rtp' | 'rtcp';
  type RTCIceProtocol = 'udp' | 'tcp';
  type RTCIceCandidateType = 'host' | 'srflx' | 'prflx' | 'relay';
  type RTCIceTcpCandidateType = 'active' | 'passive' | 'so';

  interface RTCSessionDescription {
    type: RTCSdpType;
    sdp: string;
    toJSON(): RTCSessionDescriptionInit;
  }

  interface RTCSessionDescriptionInit {
    type: RTCSdpType;
    sdp?: string;
  }

  type RTCSdpType = 'offer' | 'pranswer' | 'answer' | 'rollback';

  interface RTCOfferOptions {
    voiceActivityDetection?: boolean;
    iceRestart?: boolean;
    offerToReceiveAudio?: boolean;
    offerToReceiveVideo?: boolean;
  }

  interface RTCAnswerOptions {
    voiceActivityDetection?: boolean;
  }

  interface RTCDataChannel extends EventTarget {
    label: string;
    ordered: boolean;
    maxPacketLifeTime: number | null;
    maxRetransmits: number | null;
    protocol: string;
    negotiated: boolean;
    id: number | null;
    readyState: RTCDataChannelState;
    bufferedAmount: number;
    bufferedAmountLowThreshold: number;
    binaryType: BinaryType;

    onopen: ((this: RTCDataChannel, ev: Event) => unknown) | null;
    onbufferedamountlow: ((this: RTCDataChannel, ev: Event) => unknown) | null;
    onerror: ((this: RTCDataChannel, ev: Event) => unknown) | null;
    onclosing: ((this: RTCDataChannel, ev: Event) => unknown) | null;
    onclose: ((this: RTCDataChannel, ev: Event) => unknown) | null;
    onmessage: ((this: RTCDataChannel, ev: MessageEvent) => unknown) | null;

    close(): void;
    send(data: string): void;
    send(data: Blob): void;
    send(data: ArrayBuffer): void;
    send(data: ArrayBufferView): void;
  }

  type RTCDataChannelState = 'connecting' | 'open' | 'closing' | 'closed';
  type BinaryType = 'blob' | 'arraybuffer';

  interface RTCDataChannelInit {
    ordered?: boolean;
    maxPacketLifeTime?: number;
    maxRetransmits?: number;
    protocol?: string;
    negotiated?: boolean;
    id?: number;
  }

  interface RTCRtpTransceiver {
    mid: string | null;
    sender: RTCRtpSender;
    receiver: RTCRtpReceiver;
    direction: RTCRtpTransceiverDirection;
    currentDirection: RTCRtpTransceiverDirection | null;
    stop(): void;
    setCodecPreferences(codecs: RTCRtpCodecCapability[]): void;
  }

  type RTCRtpTransceiverDirection = 'sendrecv' | 'sendonly' | 'recvonly' | 'inactive';

  interface RTCRtpSender {
    track: MediaStreamTrack | null;
    transport: RTCDtlsTransport | null;
    getParameters(): RTCRtpSendParameters;
    setParameters(parameters: RTCRtpSendParameters): Promise<void>;
    replaceTrack(withTrack: MediaStreamTrack | null): Promise<void>;
    getStats(): Promise<RTCStatsReport>;
  }

  interface RTCRtpReceiver {
    track: MediaStreamTrack;
    transport: RTCDtlsTransport | null;
    getParameters(): RTCRtpReceiveParameters;
    getContributingSources(): RTCRtpContributingSource[];
    getSynchronizationSources(): RTCRtpSynchronizationSource[];
    getStats(): Promise<RTCStatsReport>;
  }

  interface RTCRtpSendParameters extends RTCRtpParameters {
    transactionId: string;
    encodings: RTCRtpEncodingParameters[];
  }

  interface RTCRtpReceiveParameters extends RTCRtpParameters {
  }

  interface RTCRtpParameters {
    headerExtensions: RTCRtpHeaderExtensionParameters[];
    rtcp: RTCRtcpParameters;
    codecs: RTCRtpCodecParameters[];
  }

  interface RTCRtpEncodingParameters {
    ssrc?: number;
    rtx?: { ssrc: number };
    fec?: { ssrc: number; mechanism?: string };
    dtx?: RTCDtxStatus;
    active?: boolean;
    priority?: RTCPriorityType;
    maxBitrate?: number;
    maxFramerate?: number;
    rid?: string;
    scaleResolutionDownBy?: number;
  }

  type RTCDtxStatus = 'disabled' | 'enabled';
  type RTCPriorityType = 'very-low' | 'low' | 'medium' | 'high';

  interface RTCRtpHeaderExtensionParameters {
    uri: string;
    id: number;
    encrypted?: boolean;
  }

  interface RTCRtcpParameters {
    cname?: string;
    reducedSize?: boolean;
  }

  interface RTCRtpCodecParameters {
    payloadType: number;
    mimeType: string;
    clockRate: number;
    channels?: number;
    sdpFmtpLine?: string;
  }

  interface RTCRtpCodecCapability {
    mimeType: string;
    clockRate: number;
    channels?: number;
    sdpFmtpLine?: string;
  }

  interface RTCRtpContributingSource {
    timestamp: number;
    source: number;
    audioLevel?: number;
    rtpTimestamp: number;
  }

  interface RTCRtpSynchronizationSource extends RTCRtpContributingSource {
  }

  interface RTCDtlsTransport extends EventTarget {
    iceTransport: RTCIceTransport;
    state: RTCDtlsTransportState;
    getRemoteCertificates(): ArrayBuffer[];
    onstatechange: ((this: RTCDtlsTransport, ev: Event) => unknown) | null;
    onerror: ((this: RTCDtlsTransport, ev: Event) => unknown) | null;
  }

  type RTCDtlsTransportState = 'new' | 'connecting' | 'connected' | 'closed' | 'failed';

  interface RTCIceTransport extends EventTarget {
    role: RTCIceRole;
    component: RTCIceComponent;
    state: RTCIceTransportState;
    gatheringState: RTCIceGathererState;
    getLocalCandidates(): RTCIceCandidate[];
    getRemoteCandidates(): RTCIceCandidate[];
    getSelectedCandidatePair(): RTCIceCandidatePair | null;
    getLocalParameters(): RTCIceParameters | null;
    getRemoteParameters(): RTCIceParameters | null;
    onstatechange: ((this: RTCIceTransport, ev: Event) => unknown) | null;
    ongatheringstatechange: ((this: RTCIceTransport, ev: Event) => unknown) | null;
    onselectedcandidatepairchange: ((this: RTCIceTransport, ev: Event) => unknown) | null;
  }

  type RTCIceRole = 'controlling' | 'controlled';
  type RTCIceTransportState = 'new' | 'checking' | 'connected' | 'completed' | 'disconnected' | 'failed' | 'closed';
  type RTCIceGathererState = 'new' | 'gathering' | 'complete';

  interface RTCIceCandidatePair {
    local: RTCIceCandidate;
    remote: RTCIceCandidate;
  }

  interface RTCIceParameters {
    usernameFragment: string;
    password: string;
  }

  interface RTCCertificate {
    expires: number;
    getFingerprints(): RTCDtlsFingerprint[];
  }

  interface RTCDtlsFingerprint {
    algorithm: string;
    value: string;
  }

  interface RTCStatsReport extends Map<string, any> {
  }
}

export { };
