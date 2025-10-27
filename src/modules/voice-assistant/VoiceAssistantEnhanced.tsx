// @ts-nocheck
// PATCH 285: Voice Assistant with Real Voice Processing
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceCommand {
  transcript: string;
  intent: string;
  confidence: number;
  response: string;
  timestamp: string;
}

export const VoiceAssistantEnhanced: React.FC = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API for browser-based recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        processVoiceCommand(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Recognition Error",
          description: event.error,
          variant: "destructive",
        });
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Use Web Speech API if available
      if (recognitionRef.current) {
        setIsRecording(true);
        setTranscript("");
        recognitionRef.current.start();
        toast({
          title: "Listening",
          description: "Speak your command now...",
        });
      } else {
        toast({
          title: "Not Supported",
          description: "Voice recognition is not supported in this browser",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start voice recording",
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceCommand = async (transcript: string) => {
    if (!transcript || transcript.trim().length === 0) {
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc('process_voice_command', {
        p_transcript: transcript,
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_session_id: sessionId,
      });

      if (error) throw error;

      const command: VoiceCommand = {
        transcript,
        intent: data.intent,
        confidence: data.confidence,
        response: data.response,
        timestamp: new Date().toISOString(),
      };

      setCommandHistory(prev => [command, ...prev]);

      // Speak the response
      speakResponse(data.response);

      toast({
        title: "Command Processed",
        description: `Intent: ${data.intent} (${(data.confidence * 100).toFixed(0)}% confidence)`,
      });
    } catch (error) {
      console.error('Command processing error:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process voice command",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = async (text: string) => {
    try {
      // Try Web Speech Synthesis API first (browser-based)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback to edge function for TTS
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-respond`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: text.substring(0, 4000), // Limit to 4000 chars
              voice: 'nova',
              speed: 1.0,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const audio = new Audio(data.audio_data);
          audio.play();
        }
      }
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-600";
    if (confidence >= 0.6) return "bg-yellow-600";
    return "bg-orange-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Voice Assistant</h2>
          <p className="text-sm text-muted-foreground">Voice command processing with AI</p>
        </div>
      </div>

      {/* Voice Control */}
      <Card>
        <CardHeader>
          <CardTitle>Voice Control</CardTitle>
          <CardDescription>Click to start speaking, click again to stop</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className="w-32 h-32 rounded-full"
            >
              {isProcessing ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-12 w-12" />
              ) : (
                <Mic className="h-12 w-12" />
              )}
            </Button>

            <div className="text-center">
              {isRecording && (
                <Badge className="bg-red-600 animate-pulse">Recording...</Badge>
              )}
              {isProcessing && (
                <Badge className="bg-blue-600">Processing...</Badge>
              )}
              {!isRecording && !isProcessing && (
                <Badge variant="outline">Ready</Badge>
              )}
            </div>
          </div>

          {/* Live Transcript */}
          {transcript && (
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <p className="text-sm font-semibold mb-1">You said:</p>
                <p className="text-lg">{transcript}</p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Command History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Command History
          </CardTitle>
          <CardDescription>Recent voice commands and responses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commandHistory.map((cmd, idx) => (
              <Card key={idx} className="border-l-4 border-blue-600">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-muted-foreground mb-1">
                          You said:
                        </p>
                        <p className="text-sm mb-2">{cmd.transcript}</p>
                      </div>
                      <Badge className={getConfidenceColor(cmd.confidence)}>
                        {(cmd.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {cmd.intent}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(cmd.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-start gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground mb-1">
                            Assistant:
                          </p>
                          <p className="text-sm">{cmd.response}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {commandHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No commands yet. Start by clicking the microphone.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Commands */}
      <Card>
        <CardHeader>
          <CardTitle>Example Commands</CardTitle>
          <CardDescription>Try saying one of these commands</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Open dashboard",
              "Show system status",
              "Generate report",
              "List vessels",
              "Show alerts",
              "Start mission",
              "Help",
            ].map((cmd, idx) => (
              <Badge key={idx} variant="secondary" className="justify-start p-2">
                {cmd}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceAssistantEnhanced;
