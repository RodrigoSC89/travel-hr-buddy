/**
 * Voice Command Button - PATCH 837
 * Floating voice command activation button
 */

import React, { useState } from "react";
import { Mic, MicOff, X, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVoiceCommands } from "@/lib/voice/advanced-voice-commands";
import { useHapticFeedback } from "@/lib/ux/haptic-feedback";

interface VoiceCommandButtonProps {
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  className?: string;
}

const positionClasses = {
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
};

export function VoiceCommandButton({
  position = "bottom-right",
  className,
}: VoiceCommandButtonProps) {
  const {
    isListening,
    isProcessing,
    transcript,
    isSupported,
    startListening,
    stopListening,
  } = useVoiceCommands();
  
  const { trigger } = useHapticFeedback();
  const [showPanel, setShowPanel] = useState(false);
  
  if (!isSupported) {
    return null;
  }
  
  const handleToggle = () => {
    trigger("medium");
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setShowPanel(true);
    }
  };
  
  const handleClose = () => {
    stopListening();
    setShowPanel(false);
  };
  
  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      {/* Voice panel */}
      {showPanel && (
        <div className="absolute bottom-16 right-0 w-80 bg-card border rounded-xl shadow-xl overflow-hidden animate-slide-in-bottom">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              <span className="font-medium">Comando de Voz</span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-4">
            {/* Listening indicator */}
            <div className="flex justify-center mb-4">
              <div
                className={cn(
                  "relative w-20 h-20 rounded-full flex items-center justify-center",
                  isListening ? "bg-primary/10" : "bg-muted"
                )}
              >
                {isListening && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                    <span className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
                  </>
                )}
                {isProcessing ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : (
                  <Mic
                    className={cn(
                      "h-8 w-8",
                      isListening ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                )}
              </div>
            </div>
            
            {/* Transcript */}
            <div className="min-h-[60px] p-3 bg-muted rounded-lg text-center">
              {isListening ? (
                <p className="text-sm">
                  {transcript || "Diga um comando..."}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Clique no microfone para começar
                </p>
              )}
            </div>
            
            {/* Quick commands */}
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Comandos rápidos:</p>
              <div className="flex flex-wrap gap-1.5">
                {["Dashboard", "Viagens", "RH", "Buscar", "Ajuda"].map((cmd) => (
                  <span
                    key={cmd}
                    className="px-2 py-1 bg-muted rounded text-xs"
                  >
                    "{cmd}"
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main button */}
      <Button
        size="lg"
        className={cn(
          "rounded-full h-14 w-14 shadow-lg transition-all",
          isListening && "bg-destructive hover:bg-destructive/90 animate-glow"
        )}
        onClick={handleToggle}
      >
        {isListening ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}

export default VoiceCommandButton;
