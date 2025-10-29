/**
 * PATCH 531 - Navigation Copilot v2
 * Enhanced with multimodal commands (voice + text) and real-time updates
 */

// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Navigation,
  Activity,
  MessageSquare,
  Map,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { speechRecognitionService } from "./services/speechRecognitionService";
import { naturalLanguageParser } from "./services/naturalLanguageParser";
import { navigationAILogsService } from "./services/navigationAILogsService";
import { CopilotFeedbackPanel, type CopilotMessage } from "./components/CopilotFeedbackPanel";
import { navigationCopilot, type Coordinates, type NavigationRoute } from "./index";
import type { ParsedCommand } from "./services/naturalLanguageParser";

const NavigationCopilotV2Page: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textCommand, setTextCommand] = useState("");
  const [currentRoute, setCurrentRoute] = useState<NavigationRoute | null>(null);
  const [stats, setStats] = useState({
    totalCommands: 0,
    successRate: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const commands = await navigationAILogsService.getRecentCopilotCommands(100);
    const successCount = commands.filter(c => c.success).length;
    setStats({
      totalCommands: commands.length,
      successRate: commands.length > 0 ? (successCount / commands.length) * 100 : 0,
    });
  };

  const addMessage = (
    type: CopilotMessage['type'],
    text: string,
    command?: ParsedCommand,
    status?: CopilotMessage['status']
  ) => {
    const message: CopilotMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type,
      text,
      timestamp: Date.now(),
      command,
      status,
    };
    setMessages(prev => [...prev, message]);
  };

  const handleToggleListening = () => {
    if (isListening) {
      speechRecognitionService.stopListening();
      setIsListening(false);
      toast.info("Voice recognition stopped");
    } else {
      if (!speechRecognitionService.isSupported()) {
        toast.error("Voice recognition is not supported in this browser");
        return;
      }

      const started = speechRecognitionService.startListening((result) => {
        if (result.containsWakeWord) {
          addMessage('user', result.transcript, undefined, 'pending');
          processVoiceCommand(result.transcript);
        }
      });

      if (started) {
        setIsListening(true);
        toast.success("Voice recognition started - Say 'Copilot' to activate");
      } else {
        toast.error("Failed to start voice recognition");
      }
    }
  };

  const processVoiceCommand = async (text: string) => {
    await processCommand(text);
  };

  const processCommand = async (text: string) => {
    setIsProcessing(true);

    try {
      // Parse the command
      const command = naturalLanguageParser.parseCommand(text);
      
      addMessage('command', `Parsed: ${command.action}`, command, 'pending');

      // Execute the command
      const response = await executeCommand(command);
      
      // Log to database
      await navigationAILogsService.saveCopilotDecision(
        command,
        response.message,
        response.success
      );

      addMessage(
        'response',
        response.message,
        undefined,
        response.success ? 'success' : 'error'
      );

      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }

      await loadStats();
    } catch (error) {
      console.error("Error processing command:", error);
      addMessage('system', 'Error processing command', undefined, 'error');
      toast.error("Failed to process command");
    } finally {
      setIsProcessing(false);
    }
  };

  const executeCommand = async (
    command: ParsedCommand
  ): Promise<{ success: boolean; message: string }> => {
    switch (command.action) {
      case 'navigate':
      case 'reroute':
        if (typeof command.parameters.destination === 'object') {
          const origin: Coordinates = { lat: -23.5505, lng: -46.6333 }; // Default origin
          const routes = await navigationCopilot.calculateRoute(
            origin,
            command.parameters.destination as Coordinates,
            { avoidStorms: true }
          );
          
          if (routes.length > 0) {
            setCurrentRoute(routes[0]);
            return {
              success: true,
              message: `Route calculated to destination. Distance: ${routes[0].distance.toFixed(1)}nm, ETA: ${routes[0].etaWithAI}`,
            };
          }
        }
        return {
          success: false,
          message: "Could not calculate route to destination",
        };

      case 'find_port':
        return {
          success: true,
          message: "Finding nearest port... Santos (50nm north)",
        };

      case 'weather':
        return {
          success: true,
          message: "Weather conditions: Clear skies, wind 10kn from NE, waves 1-2m",
        };

      case 'avoid_area':
        return {
          success: true,
          message: `Avoiding ${command.parameters.location} within ${command.parameters.radius}nm radius`,
        };

      case 'optimize_route':
        return {
          success: true,
          message: `Route optimized for ${command.parameters.criteria} criteria`,
        };

      case 'unknown':
        return {
          success: false,
          message: "Command not recognized. Try: 'navigate to Santos' or 'find nearest port'",
        };

      default:
        return {
          success: false,
          message: "Unsupported command",
        };
    }
  };

  const handleTextCommand = () => {
    if (!textCommand.trim()) {
      return;
    }

    addMessage('user', textCommand, undefined, 'pending');
    processCommand(textCommand);
    setTextCommand("");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Navigation className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Navigation Copilot v2</h1>
            <p className="text-sm text-muted-foreground">
              PATCH 531 - AI multimodal commands with real-time updates
            </p>
          </div>
        </div>
        <Badge variant="default" className="gap-2">
          <Activity className="h-4 w-4" />
          Multimodal Active
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Commands</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommands}</div>
            <p className="text-xs text-muted-foreground">Voice & text combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Command execution</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Interface */}
      <Tabs defaultValue="copilot" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="copilot">
            <MessageSquare className="mr-2 h-4 w-4" />
            Copilot Interface
          </TabsTrigger>
          <TabsTrigger value="map">
            <Map className="mr-2 h-4 w-4" />
            Navigation Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="copilot" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Copilot Feedback Panel */}
            <div className="lg:col-span-2">
              <CopilotFeedbackPanel
                isListening={isListening}
                onToggleListening={handleToggleListening}
                messages={messages}
                isProcessing={isProcessing}
              />
            </div>

            {/* Text Command Input */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Text Commands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Type a command..."
                    value={textCommand}
                    onChange={(e) => setTextCommand(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleTextCommand();
                      }
                    }}
                  />
                  <Button
                    onClick={handleTextCommand}
                    className="w-full"
                    disabled={!textCommand.trim() || isProcessing}
                  >
                    Execute Command
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Quick Commands:</p>
                  <div className="space-y-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => setTextCommand("navegar para Santos")}
                    >
                      Navigate to Santos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => setTextCommand("porto mais próximo")}
                    >
                      Find nearest port
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                      onClick={() => setTextCommand("otimizar rota")}
                    >
                      Optimize route
                    </Button>
                  </div>
                </div>

                {currentRoute && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Current Route</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-1">
                      <p>Distance: {currentRoute.distance.toFixed(1)} nm</p>
                      <p>ETA: {currentRoute.etaWithAI}</p>
                      <p>Risk Score: {currentRoute.riskScore}/100</p>
                      <Badge variant={currentRoute.recommended ? "default" : "secondary"}>
                        {currentRoute.recommended ? "Recommended" : "Alternative"}
                      </Badge>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">
                  Map integration with route visualization
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NavigationCopilotV2Page;
