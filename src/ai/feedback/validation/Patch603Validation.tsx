/**
 * PATCH 603 - Multimodal Feedback Analyzer Validation
 * Tests feedback processing from voice, text, and click channels
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mic, MessageSquare, MousePointer, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface FeedbackEvent {
  id: string;
  channel: "voice" | "text" | "click";
  content: string;
  impact: number;
  timestamp: string;
}

export function Patch603Validation() {
  const [feedback, setFeedback] = useState<FeedbackEvent[]>([]);
  const [textInput, setTextInput] = useState("");
  const [behaviorScore, setBehaviorScore] = useState(0.5);
  const { toast } = useToast();

  const addFeedback = (channel: "voice" | "text" | "click", content: string) => {
    const event: FeedbackEvent = {
      id: `fb-${Date.now()}`,
      channel,
      content,
      impact: Math.random() * 0.3 + 0.1,
      timestamp: new Date().toISOString()
    };
    
    setFeedback(prev => [...prev, event]);
    
    // Simulate behavior adjustment
    const newScore = Math.min(1, behaviorScore + event.impact);
    setBehaviorScore(newScore);
    
    logger.info("PATCH 603: Feedback processed", { 
      channel, 
      event,
      newScore,
      behaviorAdjustment: event.impact 
    });
    
    toast({
      title: `${channel.charAt(0).toUpperCase() + channel.slice(1)} Feedback Recorded`,
      description: `Behavior score adjusted: ${(newScore * 100).toFixed(0)}%`,
    });
  };

  const simulateVoice = () => {
    addFeedback("voice", "Voice command: Increase priority of mission alpha");
  };

  const submitText = () => {
    if (textInput.trim()) {
      addFeedback("text", textInput);
      setTextInput("");
    }
  };

  const simulateClick = () => {
    addFeedback("click", "User clicked: Optimize route for vessel-3");
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
    case "voice": return <Mic className="h-4 w-4" />;
    case "text": return <MessageSquare className="h-4 w-4" />;
    case "click": return <MousePointer className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
    case "voice": return "text-blue-500";
    case "text": return "text-green-500";
    case "click": return "text-purple-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              PATCH 603 - Multimodal Feedback Analyzer
            </CardTitle>
            <CardDescription>
              Processes feedback from voice, text, and click channels
            </CardDescription>
          </div>
          <Badge variant={feedback.length > 0 ? "default" : "secondary"}>
            {feedback.length} Events
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">AI Behavior Score</div>
              <div className="text-3xl font-bold">{(behaviorScore * 100).toFixed(0)}%</div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${behaviorScore * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <Button onClick={simulateVoice} variant="outline" size="sm">
            <Mic className="h-4 w-4 mr-1" />
            Voice
          </Button>
          <Button onClick={simulateClick} variant="outline" size="sm">
            <MousePointer className="h-4 w-4 mr-1" />
            Click
          </Button>
          <Badge variant="outline" className="flex items-center justify-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Text
          </Badge>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Enter text feedback..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && submitText()}
          />
          <Button onClick={submitText}>Send</Button>
        </div>

        {feedback.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Feedback Log:</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {feedback.reverse().map(event => (
                <Card key={event.id} className="text-sm">
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <div className={getChannelColor(event.channel)}>
                          {getChannelIcon(event.channel)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{event.content}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Impact: +{(event.impact * 100).toFixed(1)}% • {new Date(event.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{event.channel}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
