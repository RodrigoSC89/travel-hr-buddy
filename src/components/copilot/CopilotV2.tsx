/**
 * PATCH 632 - Nautilus Copilot V2 UI Component
 * Interactive AI assistant sidebar with hotkey support
 */

import { useEffect, useState, useCallback } from "react";;;
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Mic,
  Send,
  Shield,
  FileText,
  TrendingUp,
  GraduationCap,
  Lightbulb
} from "lucide-react";
import {
  getAvailableCommands,
  executeCopilotCommand,
  getPredictiveSuggestions,
  processVoiceCommand,
  type CopilotCommand,
  type CopilotSuggestion
} from "@/lib/ai/copilot-v2";
import { logger } from "@/lib/logger";

export default function CopilotV2() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [commands, setCommands] = useState<CopilotCommand[]>([]);
  const [suggestions, setSuggestions] = useState<CopilotSuggestion[]>([]);
  const [response, setResponse] = useState<unknown>(null);
  const [isListening, setIsListening] = useState(false);

  // Load commands and suggestions
  useEffect(() => {
    setCommands(getAvailableCommands());
    loadSuggestions();
  }, []);

  // Hotkey support (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadSuggestions = async () => {
    try {
      const sug = await getPredictiveSuggestions("compliance", "auditor");
      setSuggestions(sug);
    } catch (error) {
      logger.error("Error loading suggestions", { error });
    }
  };

  const handleCommand = async (commandId: string, context?: unknown) => {
    try {
      const result = await executeCopilotCommand(commandId, context);
      setResponse(result);
    } catch (error) {
      logger.error("Error executing command", { error });
      setResponse({ error: "Failed to execute command" });
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Simplified voice input simulation
    if (!isListening) {
      setTimeout(async () => {
        const result = await processVoiceCommand("Check compliance status");
        setResponse({ voice: true, message: result.response });
        setIsListening(false);
      }, 2000);
    }
  };

  const handleTextInput = () => {
    if (input.trim()) {
      // Simple text processing
      const matchedCommand = commands.find(c => 
        c.command.toLowerCase().includes(input.toLowerCase())
      );

      if (matchedCommand) {
        handleCommand(matchedCommand.id);
      } else {
        setResponse({ message: "Command not recognized. Try one of the available commands." });
      }
      setInput("");
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, unknown> = {
      compliance: Shield,
      documentation: FileText,
      operations: Lightbulb,
      safety: GraduationCap
    };
    return icons[category] || Sparkles;
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={handleSetOpen}
        size="icon"
        aria-label="Open Nautilus Copilot AI Assistant"
        aria-expanded={open}
        role="button"
      >
        <Sparkles className="h-6 w-6" />
      </Button>

      {/* Copilot Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              Nautilus Copilot V2
              <Badge variant="secondary">AI Assistant</Badge>
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Press Cmd+K (Mac) or Ctrl+K (Windows) to toggle
            </p>
          </DialogHeader>

          <Tabs defaultValue="commands" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="commands">Commands</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="training">Training</TabsTrigger>
            </TabsList>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything or type a command..."
                value={input}
                onChange={handleChange}
                onKeyPress={(e) => e.key === "Enter" && handleTextInput()}
                className="flex-1"
              />
              <Button onClick={handleTextInput} size="icon">
                <Send className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleVoiceInput}
                size="icon"
                variant={isListening ? "destructive" : "outline"}
              >
                <Mic className={`h-4 w-4 ${isListening ? "animate-pulse" : ""}`} />
              </Button>
            </div>

            {/* Response Display */}
            {response && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  {response.title && <h4 className="font-semibold mb-2">{response.title}</h4>}
                  <p className="text-sm">
                    {response.content || response.message || response.explanation || "Command executed successfully"}
                  </p>
                  {response.actions && (
                    <div className="flex gap-2 mt-3">
                      {response.actions.map((action: unknown, idx: number) => (
                        <Button key={idx} size="sm" variant="outline">
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Commands Tab */}
            <TabsContent value="commands" className="space-y-2">
              {commands.map((cmd) => {
                const Icon = getCategoryIcon(cmd.category);
                return (
                  <Card
                    key={cmd.id}
                    className="hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handlehandleCommand}
                  >
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-blue-600" />
                          <div>
                            <CardTitle className="text-sm">{cmd.command}</CardTitle>
                            <CardDescription className="text-xs">
                              {cmd.description}
                            </CardDescription>
                          </div>
                        </div>
                        {cmd.shortcut && (
                          <Badge variant="outline" className="text-xs">
                            {cmd.shortcut}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Suggestions Tab */}
            <TabsContent value="suggestions" className="space-y-2">
              {suggestions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active suggestions. All systems operating normally.
                </p>
              ) : (
                suggestions.map((sug) => (
                  <Card key={sug.id}>
                    <CardHeader className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={sug.priority === "high" ? "destructive" : "default"}
                            >
                              {sug.priority}
                            </Badge>
                            <Badge variant="outline">{sug.type}</Badge>
                          </div>
                          <CardTitle className="text-sm">{sug.title}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {sug.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Training Tab */}
            <TabsContent value="training" className="space-y-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Training Modules
                  </CardTitle>
                  <CardDescription>
                    Interactive learning for crew, inspectors, and auditors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => handlehandleCommand} className="w-full">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Start Training Session
                  </Button>
                </CardContent>
              </Card>

              {response?.length > 0 && Array.isArray(response) && (
                <div className="space-y-2">
                  {response.map((module: unknown) => (
                    <Card key={module.id}>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">{module.title}</CardTitle>
                        <CardDescription className="text-xs">
                          {module.duration} minutes • {module.role}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
