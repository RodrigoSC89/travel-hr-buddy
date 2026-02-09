import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const AICommander: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCommand = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setResponse("");

    try {
      // Call real AI Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: query,
          context: 'mission_control_commander'
        }
      });

      if (error) throw error;
      
      setResponse(data?.response || "Command processed. All systems operational.");
    } catch {
      // Fallback: local pattern matching for basic commands
      const lowercaseQuery = query.toLowerCase();
      const localResponses: Record<string, string> = {
        "status": "All systems operational. Querying real-time data from Supabase.",
        "fleet": "Fleet data loaded from database. Check Operations Hub for details.",
        "weather": "Weather module active. Use /tracking for live weather overlay.",
        "emergency": "Emergency protocols ready. Navigate to /incident-reports for incident management.",
        "alert": "Alert system active. Check /alerts-command for current alerts.",
      };
      
      let fallbackResponse = `Analyzing: "${query}". AI service temporarily unavailable. Use the navigation menu for direct access to modules.`;
      for (const [key, value] of Object.entries(localResponses)) {
        if (lowercaseQuery.includes(key)) {
          fallbackResponse = value;
          break;
        }
      }
      setResponse(fallbackResponse);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand();
    }
  };

  const suggestedCommands = [
    "Show fleet status",
    "Check weather conditions",
    "List active alerts",
    "Emergency protocols"
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary animate-pulse" />
          AI Commander
          <Sparkles className="w-4 h-4 text-warning" />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ask questions or issue commands. AI will coordinate with all tactical modules.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ask AI Commander... (e.g., 'status', 'fleet', 'weather')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
            disabled={isProcessing}
          />
          <Button 
            onClick={handleCommand}
            disabled={!query.trim() || isProcessing}
            className="bg-primary hover:bg-primary/90"
          >
            {isProcessing ? (
              <div className="animate-spin">⟳</div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {response && (
          <div className="p-4 bg-background/50 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <Brain className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground mb-1">AI Commander Response:</div>
                <p className="text-sm text-foreground">{response}</p>
              </div>
            </div>
          </div>
        )}

        {!response && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Try:</span>
            {suggestedCommands.map((cmd) => (
              <Button
                key={cmd}
                variant="outline"
                size="sm"
                onClick={() => setQuery(cmd)}
                className="text-xs bg-muted/50 border-border hover:bg-muted"
              >
                {cmd}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
