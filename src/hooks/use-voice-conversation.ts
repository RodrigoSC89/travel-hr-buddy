import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
    } catch (error) {
      throw error;
    }
  }

  async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error("No media recorder"));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
          const base64Audio = await this.blobToBase64(audioBlob);

          // Cleanup
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
          }

          resolve(base64Audio);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1]; // Remove data:audio/webm;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === "recording";
  }
}

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recorderRef = useRef<VoiceRecorder | null>(null);

  const startRecording = async () => {
    try {
      if (!recorderRef.current) {
        recorderRef.current = new VoiceRecorder();
      }

      await recorderRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      throw error;
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      if (!recorderRef.current) {
        throw new Error("No recorder available");
      }

      setIsProcessing(true);
      const audioBase64 = await recorderRef.current.stopRecording();
      setIsRecording(false);

      // Send to Supabase Edge Function for transcription
      const { data, error } = await supabase.functions.invoke("voice-to-text", {
        body: {
          audio: audioBase64,
          language: "pt",
        },
      });

      if (error) {
        throw error;
      }

      return data?.text || null;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  };
};

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async (text: string, voice: string = "alloy"): Promise<void> => {
    try {
      setIsSpeaking(true);
      console.log("Generating speech for:", text.substring(0, 50) + "...");

      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: {
          text,
          voice,
          speed: 1.0,
        },
      });

      if (error) {
        throw error;
      }

      if (data?.audioContent) {
        // Create audio from base64
        const audioBlob = new Blob(
          [
            new Uint8Array(
              atob(data.audioContent)
                .split("")
                .map(c => c.charCodeAt(0))
            ),
          ],
          { type: "audio/mp3" }
        );

        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }

        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audioRef.current.play();
      }
    } catch (error) {
      setIsSpeaking(false);
      throw error;
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  return {
    isSpeaking,
    speak,
    stopSpeaking,
  };
};

export const useAIChat = () => {
  const [isThinking, setIsThinking] = useState(false);

  const sendMessage = async (message: string, context: string = ""): Promise<string> => {
    try {
      setIsThinking(true);

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message,
          context,
          language: "pt",
        },
      });

      if (error) {
        throw error;
      }

      return data?.reply || "Desculpe, não consegui processar sua solicitação.";
    } catch (error) {
      throw error;
    } finally {
      setIsThinking(false);
    }
  };

  return {
    isThinking,
    sendMessage,
  };
};
