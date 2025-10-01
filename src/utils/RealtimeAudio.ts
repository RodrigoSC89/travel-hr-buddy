import { supabase } from "@/integrations/supabase/client";

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export class RealtimeChat {
  private pc: RTCPeerConnection | null = null;
  public dc: RTCDataChannel | null = null; // Tornado público para acesso externo
  private audioEl: HTMLAudioElement;
  private recorder: AudioRecorder | null = null;
  private conversationId: string | null = null;
  private currentSessionId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000; // Start with 2 seconds
  private isReconnecting: boolean = false;
  private connectionCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private onMessage: (message: any) => void,
    private onNavigate?: (module: string) => void,
    private onConnectionStateChange?: (state: string) => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init() {
    try {
      console.log('Initializing realtime chat...');
      
      // Get ephemeral token from our Supabase Edge Function with retry
      let data, error;
      let retries = 0;
      const maxTokenRetries = 3;
      
      while (retries < maxTokenRetries) {
        const result = await supabase.functions.invoke("realtime-voice-session");
        data = result.data;
        error = result.error;
        
        if (!error && data?.client_secret?.value) {
          break;
        }
        
        retries++;
        if (retries < maxTokenRetries) {
          console.log(`Retrying token fetch (${retries}/${maxTokenRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        }
      }
      
      if (error || !data?.client_secret?.value) {
        console.error('Failed to get ephemeral token after retries:', error);
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;
      console.log('Got ephemeral token, setting up WebRTC...');

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Monitor connection state
      this.pc.onconnectionstatechange = () => {
        const state = this.pc?.connectionState;
        console.log('Connection state changed:', state);
        this.onConnectionStateChange?.(state || 'unknown');
        
        if (state === 'failed' || state === 'disconnected') {
          console.log('Connection lost, attempting to reconnect...');
          this.handleConnectionLoss();
        } else if (state === 'connected') {
          this.reconnectAttempts = 0;
          this.reconnectDelay = 2000;
          this.isReconnecting = false;
        }
      };

      this.pc.onicecandidateerror = (event) => {
        console.error('ICE candidate error:', event);
      };

      // Set up remote audio
      this.pc.ontrack = (e) => {
        console.log('Received remote audio track');
        this.audioEl.srcObject = e.streams[0];
      };

      // Add local audio track
      const ms = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      this.pc.addTrack(ms.getTracks()[0]);

      // Set up data channel
      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("Received event:", event.type, event);
        
        // Processo de navegação por comandos de voz
        if (event.type === 'conversation.item.input_audio_transcription.completed') {
          console.log("User said:", event.transcript);
          // Processar comando de navegação
          this.processVoiceNavigation(event.transcript);
        }
        
        this.onMessage(event);
      });

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Connect to OpenAI's Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect to OpenAI: ${sdpResponse.status}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log("WebRTC connection established");

      // Start recording
      this.recorder = new AudioRecorder((audioData) => {
        if (this.dc?.readyState === 'open') {
          this.dc.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: this.encodeAudioData(audioData)
          }));
        }
      });
      await this.recorder.start();

    } catch (error) {
      console.error("Error initializing chat:", error);
      throw error;
    }
  }

  private encodeAudioData(float32Array: Float32Array): string {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }

  async sendMessage(text: string) {
    if (!this.dc || this.dc.readyState !== 'open') {
      throw new Error('Data channel not ready');
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    this.dc.send(JSON.stringify(event));
    this.dc.send(JSON.stringify({type: 'response.create'}));
  }

  // Processar comandos de navegação por voz
  private processVoiceNavigation(transcript: string) {
    if (!transcript || !this.onNavigate) return;
    
    const text = transcript.toLowerCase().trim();
    console.log("Processing voice navigation for:", text);
    
    // Mapeamento de comandos para módulos
    const navigationMap: Record<string, string> = {
      'dashboard': 'dashboard',
      'painel': 'dashboard',
      'início': 'dashboard',
      'home': 'dashboard',
      
      'recursos humanos': 'hr',
      'rh': 'hr',
      'funcionários': 'hr',
      'tripulação': 'hr',
      
      'viagens': 'travel',
      'travel': 'travel',
      'voos': 'travel',
      'voo': 'travel',
      'hotéis': 'travel',
      'hotel': 'travel',
      'passagens': 'travel',
      'passagem': 'travel',
      
      'marítimo': 'maritime',
      'maritime': 'maritime',
      'frota': 'maritime',
      'navios': 'maritime',
      'navio': 'maritime',
      'embarcações': 'maritime',
      
      'alertas': 'price-alerts',
      'preços': 'price-alerts',
      'monitoramento': 'price-alerts',
      
      'analytics': 'analytics',
      'análises': 'analytics',
      'estatísticas': 'analytics',
      'métricas': 'analytics',
      
      'relatórios': 'reports',
      'reports': 'reports',
      'relatório': 'reports',
      
      'comunicação': 'communication',
      'communication': 'communication',
      'mensagens': 'communication',
      'chat': 'communication',
      
      'configurações': 'settings',
      'settings': 'settings',
      'preferências': 'settings',
      
      'inovação': 'innovation',
      'innovation': 'innovation',
      'automação': 'innovation',
      
      'inteligência': 'intelligence',
      'intelligence': 'intelligence',
      'documentos': 'intelligence',
      
      'otimização': 'optimization',
      'optimization': 'optimization',
      'performance': 'optimization',
      
      'estratégico': 'strategic',
      'strategic': 'strategic',
      'estratégia': 'strategic'
    };
    
    // Procurar correspondência
    for (const [command, module] of Object.entries(navigationMap)) {
      if (text.includes(command)) {
        console.log(`Voice navigation: ${command} -> ${module}`);
        this.onNavigate(module);
        return;
      }
    }
    
    // Verificar palavras-chave adicionais
    if (text.includes('buscar') && (text.includes('voo') || text.includes('passagem'))) {
      this.onNavigate('travel');
    } else if (text.includes('buscar') && text.includes('hotel')) {
      this.onNavigate('travel');
    } else if (text.includes('certificado')) {
      this.onNavigate('hr');
    }
  }

  private async handleConnectionLoss() {
    if (this.isReconnecting) {
      console.log('Already reconnecting, skipping...');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.onConnectionStateChange?.('failed');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    // Clean up existing connection
    this.cleanupConnection(false);

    // Wait with exponential backoff
    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay));
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds

    try {
      await this.init();
      console.log('Reconnection successful');
    } catch (error) {
      console.error('Reconnection failed:', error);
      this.isReconnecting = false;
      
      // Try again if we haven't exhausted attempts
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleConnectionLoss();
      }
    }
  }

  private cleanupConnection(clearReconnectState = true) {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }

    if (this.recorder) {
      try {
        this.recorder.stop();
      } catch (error) {
        console.error('Error stopping recorder:', error);
      }
      this.recorder = null;
    }

    if (this.dc) {
      try {
        this.dc.close();
      } catch (error) {
        console.error('Error closing data channel:', error);
      }
      this.dc = null;
    }

    if (this.pc) {
      try {
        this.pc.close();
      } catch (error) {
        console.error('Error closing peer connection:', error);
      }
      this.pc = null;
    }

    if (clearReconnectState) {
      this.reconnectAttempts = 0;
      this.reconnectDelay = 2000;
      this.isReconnecting = false;
    }
  }

  disconnect() {
    console.log('Disconnecting realtime chat...');
    this.cleanupConnection(true);
    this.onConnectionStateChange?.('closed');
  }
}