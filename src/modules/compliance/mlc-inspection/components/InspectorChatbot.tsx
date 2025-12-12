import { useState } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MLC_KNOWLEDGE_BASE: Record<string, string> = {
  "minimum age": "According to MLC 2006, Title 1, Regulation 1.1, the minimum age for work on a ship is 16 years. However, for work that is likely to jeopardize health or safety, the minimum age is 18 years.",
  "medical certificate": "Title 1, Regulation 1.2 requires all seafarers to hold a valid medical certificate attesting that they are medically fit to perform their duties at sea. Certificates must be issued by a qualified medical practitioner.",
  "hours of work": "Title 2, Regulation 2.3 establishes that hours of work shall not exceed 14 hours in any 24-hour period and 72 hours in any seven-day period, or a minimum of 10 hours of rest in any 24-hour period and 77 hours in any seven-day period.",
  "accommodation": "Title 3, Regulation 3.1 requires that accommodation be safe, decent, and of an adequate standard. This includes proper ventilation, heating, lighting, and sanitary facilities.",
  "food": "Title 3, Regulation 3.2 requires that food and drinking water be of appropriate quality, nutritional value, and quantity. Ships must have qualified cooks and proper galley facilities.",
  "medical care": "Title 4, Regulation 4.1 requires ships to carry medical supplies, have a qualified medical doctor or personnel trained in medical care, and provide access to shore-based medical facilities.",
  "renewal": "The Maritime Labour Certificate (MLC) must be renewed every 5 years. Intermediate inspections are required between the second and third anniversary dates of the certificate.",
};

export function InspectorChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your MLC Compliance Assistant. Ask me anything about Maritime Labour Convention 2006 regulations, inspection procedures, or compliance requirements."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response based on knowledge base
    setTimeout(() => {
      const response = findRelevantResponse(input);
      const assistantMessage: Message = {
        role: "assistant",
        content: response
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  const findRelevantResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    for (const [key, value] of Object.entries(MLC_KNOWLEDGE_BASE)) {
      if (lowerQuery.includes(key)) {
        return value;
      }
    }

    // Default response if no match found
    return "I can help you with questions about MLC 2006 regulations. Try asking about minimum age, medical certificates, hours of work, accommodation, food and catering, medical care, or certificate renewal.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>MLC Compliance AI Assistant</CardTitle>
            <CardDescription>
              Ask questions about MLC 2006 regulations and requirements
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.role === "assistant" && (
                      <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === "user" && (
                      <MessageCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 animate-pulse" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about MLC regulations..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
