/**
 * PATCH 165.0 - Voice Interface Component
 * Speech recognition and synthesis for mobile AI assistant
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { intentParser, Intent } from "../ai/intentParser";
import { localMemory } from "../ai/localMemory";
import { toast } from "sonner";

// Type declarations for Web Speech API - using any to avoid conflicts with browser types
interface VoiceSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
}

interface VoiceInterfaceProps {
  onIntentDetected?: (intent: Intent) => void;
  onTranscript?: (text: string) => void;
  isOnline?: boolean;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onIntentDetected,
  onTranscript,
  isOnline = true
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState<Intent | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<VoiceSpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  /**
   * Initialize speech recognition
   */
  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognitionClass = (window as any).SpeechRecognition || 
                                   (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      setIsSupported(false);
      console.warn("Speech recognition not supported in this browser");
      return;
    }

    const recognition: VoiceSpeechRecognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Voice recognition started");
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcriptResult = event.results[current][0].transcript;
      
      setTranscript(transcriptResult);
      onTranscript?.(transcriptResult);

      // If final result, process intent
      if (event.results[current].isFinal) {
        processTranscript(transcriptResult);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      
      if (event.error === "no-speech") {
        toast.error("No speech detected. Please try again.");
      } else if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please enable it in settings.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log("Voice recognition ended");
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  /**
   * Process transcript and detect intent
   */
  const processTranscript = useCallback(async (text: string) => {
    // Parse intent
    const intent = intentParser.parse(text);
    setDetectedIntent(intent);
    
    // Store in local memory
    await localMemory.storeMessage({
      role: "user",
      content: text,
      context: { intent }
    });

    // Notify parent
    onIntentDetected?.(intent);

    // Generate response based on intent
    await generateResponse(intent, text);
  }, [onIntentDetected]);

  /**
   * Generate and speak response
   */
  const generateResponse = useCallback(async (intent: Intent, userInput: string) => {
    let response = "";

    // Get context for better responses
    const context = await localMemory.getContext();

    // Generate contextual response
    switch (intent.action) {
    case "get_mission_status":
      response = `Current mission status: ${context.missionStatus || "No active mission"}. `;
      if (context.missionId) {
        response += `Mission ID: ${context.missionId}. `;
      }
      break;

    case "get_route_info":
      if (context.currentLocation) {
        response = `Current location: latitude ${context.currentLocation.lat.toFixed(2)}, longitude ${context.currentLocation.lng.toFixed(2)}. `;
      } else {
        response = "Location information not available. ";
      }
      break;

    case "get_weather":
      if (context.weatherConditions) {
        response = `Current weather: ${context.weatherConditions.conditions}. Temperature: ${context.weatherConditions.temperature} degrees. `;
      } else {
        response = "Weather information not available offline. ";
      }
      break;

    case "show_checklist":
      if (context.activeChecklists && context.activeChecklists.length > 0) {
        response = `You have ${context.activeChecklists.length} active checklists. `;
      } else {
        response = "No active checklists at the moment. ";
      }
      break;

    default:
      response = "I can help you with mission status, route information, weather updates, and checklists. What would you like to know?";
    }

    // Store assistant response
    await localMemory.storeMessage({
      role: "assistant",
      content: response
    });

    // Speak response
    await speak(response);
  }, []);

  /**
   * Speak text using speech synthesis
   */
  const speak = useCallback(async (text: string) => {
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  /**
   * Start listening
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      setTranscript("");
      setDetectedIntent(null);
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      toast.error("Failed to start voice recognition");
    }
  }, []);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error("Error stopping recognition:", error);
    }
  }, []);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  if (!isSupported) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Voice interface is not supported in this browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        {/* Status badges */}
        <div className="flex gap-2">
          <Badge variant={isListening ? "default" : "outline"}>
            {isListening ? "Listening..." : "Ready"}
          </Badge>
          {!isOnline && (
            <Badge variant="secondary">Offline Mode</Badge>
          )}
          {detectedIntent && (
            <Badge variant="outline">
              Intent: {detectedIntent.type} ({Math.round(detectedIntent.confidence * 100)}%)
            </Badge>
          )}
        </div>

        {/* Transcript display */}
        {transcript && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">You said:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {/* Voice controls */}
        <div className="flex gap-2">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            className="flex-1"
            size="lg"
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-5 w-5" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="mr-2 h-5 w-5" />
                Start Listening
              </>
            )}
          </Button>

          <Button
            onClick={isSpeaking ? stopSpeaking : () => {}}
            variant={isSpeaking ? "destructive" : "outline"}
            disabled={!isSpeaking}
            size="lg"
          >
            {isSpeaking ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Suggested actions */}
        {detectedIntent && detectedIntent.type !== "unknown" && (
          <div>
            <p className="text-sm font-medium mb-2">Suggested actions:</p>
            <div className="flex flex-wrap gap-2">
              {intentParser.getSuggestedActions(detectedIntent).map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info(`Action: ${action}`)}
                >
                  {action}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="text-xs text-muted-foreground">
          <p>Try saying:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>"What's the mission status?"</li>
            <li>"Show me the weather"</li>
            <li>"Where are we?"</li>
            <li>"Display checklist"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
