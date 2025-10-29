/**
 * PATCH 531 - Copilot Feedback Panel Component
 * Visual feedback for voice commands and AI responses
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mic,
  MicOff,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Loader2,
  Activity,
} from "lucide-react";
import type { SpeechRecognitionResult } from "../services/speechRecognitionService";
import type { ParsedCommand } from "../services/naturalLanguageParser";

export interface CopilotMessage {
  id: string;
  type: 'user' | 'system' | 'command' | 'response';
  text: string;
  timestamp: number;
  status?: 'pending' | 'success' | 'error';
  command?: ParsedCommand;
}

interface CopilotFeedbackPanelProps {
  isListening: boolean;
  onToggleListening: () => void;
  messages: CopilotMessage[];
  isProcessing?: boolean;
}

export const CopilotFeedbackPanel: React.FC<CopilotFeedbackPanelProps> = ({
  isListening,
  onToggleListening,
  messages,
  isProcessing = false,
}) => {
  const [pulseAnimation, setPulseAnimation] = useState(false);

  useEffect(() => {
    if (isListening) {
      setPulseAnimation(true);
    } else {
      setPulseAnimation(false);
    }
  }, [isListening]);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
      case 'command':
        return 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800';
      case 'response':
        return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Navigation Copilot</CardTitle>
          </div>
          <Button
            onClick={onToggleListening}
            variant={isListening ? "destructive" : "default"}
            size="sm"
            className={pulseAnimation ? "animate-pulse" : ""}
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Listening
              </>
            )}
          </Button>
        </div>
        
        {isListening && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="animate-pulse">
              ● Listening for "Copilot"
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm mt-1">
                  Say "Copilot" followed by your command
                </p>
                <div className="mt-4 text-xs space-y-1">
                  <p className="font-semibold">Example commands:</p>
                  <p>• "Copilot, redirecionar para porto mais próximo"</p>
                  <p>• "Copilot, evitar área de tempestade"</p>
                  <p>• "Copilot, otimizar rota"</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border ${getMessageStyle(message.type)}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {message.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.text}</p>
                      
                      {message.command && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <p>Action: <span className="font-mono">{message.command.action}</span></p>
                          {message.command.parameters.destination && (
                            <p>Destination: {JSON.stringify(message.command.parameters.destination)}</p>
                          )}
                          <p>Confidence: {(message.command.confidence * 100).toFixed(0)}%</p>
                        </div>
                      )}
                    </div>
                    {getStatusIcon(message.status)}
                  </div>
                </div>
              ))
            )}
            
            {isProcessing && (
              <div className="flex items-center justify-center py-4 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Processing command...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
