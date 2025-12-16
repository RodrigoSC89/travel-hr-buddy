import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Sparkles } from "lucide-react";

export const AICommander: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCommand = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setResponse("");

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock AI responses based on query
    const mockResponses: Record<string, string> = {
      "status": "All systems operational. 4 modules active. Fleet: 12 vessels tracked. No critical alerts.",
      "fleet": "12 vessels currently tracked. All vessels report normal status. Latest update: 2 minutes ago.",
      "weather": "Current conditions: Moderate seas, 15kt winds from NW. Forecast: Conditions improving over next 6 hours.",
      "emergency": "No active emergency incidents. All response teams on standby. Last drill: 3 days ago.",
      "alert": "3 active alerts: 1 weather advisory, 2 maintenance reminders. No critical issues.",
      "satellite": "Satellite communications nominal. Signal strength: 95%. Last check: 30 seconds ago."
    };

    const lowercaseQuery = query.toLowerCase();
    let aiResponse = "I understand your query. ";
    
    for (const [key, value] of Object.entries(mockResponses)) {
      if (lowercaseQuery.includes(key)) {
        aiResponse = value;
        break;
      }
    }

    if (aiResponse === "I understand your query. ") {
      aiResponse = `Analyzing: "${query}". All tactical modules are operational and ready. How can I assist with mission coordination?`;
    }

    setResponse(aiResponse);
    setIsProcessing(false);
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
          <Brain className="w-6 h-6 text-blue-400 animate-pulse" />
          AI Commander
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </CardTitle>
        <p className="text-sm text-zinc-400">
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
            className="flex-1 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500"
            disabled={isProcessing}
          />
          <Button 
            onClick={handleCommand}
            disabled={!query.trim() || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isProcessing ? (
              <div className="animate-spin">⟳</div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {response && (
          <div className="p-4 bg-zinc-900/50 rounded-lg border border-blue-500/20">
            <div className="flex items-start gap-2">
              <Brain className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <div className="text-xs text-zinc-400 mb-1">AI Commander Response:</div>
                <p className="text-sm text-white">{response}</p>
              </div>
            </div>
          </div>
        )}

        {!response && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-zinc-500">Try:</span>
            {suggestedCommands.map((cmd) => (
              <Button
                key={cmd}
                variant="outline"
                size="sm"
                onClick={() => setQuery(cmd)}
                className="text-xs bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700"
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
