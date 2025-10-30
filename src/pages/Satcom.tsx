/**
 * PATCH 429 - Satcom Module
 * Satellite communication interface with latency simulation
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Satellite, Send, Inbox, Clock, Signal } from "lucide-react";
import { toast } from "sonner";

interface SatcomMessage {
  id: string;
  type: "sent" | "received";
  content: string;
  timestamp: string;
  latency: number;
  status: "pending" | "delivered" | "failed";
}

const SatcomPage: React.FC = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<SatcomMessage[]>([]);
  const [signalStrength, setSignalStrength] = useState(85);
  const [latency, setLatency] = useState(450);

  useEffect(() => {
    // Simulate signal strength and latency changes
    const interval = setInterval(() => {
      setSignalStrength(Math.floor(Math.random() * 30) + 70); // 70-100%
      setLatency(Math.floor(Math.random() * 400) + 300); // 300-700ms
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: SatcomMessage = {
      id: Date.now().toString(),
      type: "sent",
      content: message,
      timestamp: new Date().toISOString(),
      latency: latency,
      status: "pending"
    };

    setMessages(prev => [newMessage, ...prev]);
    setMessage("");

    // Simulate delivery with latency
    setTimeout(() => {
      setMessages(prev =>
        prev.map(m =>
          m.id === newMessage.id ? { ...m, status: "delivered" } : m
        )
      );
      toast.success(`Message delivered (${latency}ms latency)`);
    }, latency);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Satellite className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Satcom</h1>
            <p className="text-sm text-muted-foreground">
              Satellite communication system
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Signal Strength</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{signalStrength}%</div>
            <p className="text-xs text-muted-foreground">
              {signalStrength > 80 ? "Excellent" : signalStrength > 60 ? "Good" : "Poor"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latency}ms</div>
            <p className="text-xs text-muted-foreground">
              {latency < 500 ? "Normal" : "High"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">Total messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Message Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Message */}
        <Card>
          <CardHeader>
            <CardTitle>Send Message</CardTitle>
            <CardDescription>Send satellite message with simulated latency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
            />
            <Button onClick={handleSend} className="w-full" disabled={!message.trim()}>
              <Send className="mr-2 h-4 w-4" />
              Send Message (Est. {latency}ms delay)
            </Button>
          </CardContent>
        </Card>

        {/* Message Log */}
        <Card>
          <CardHeader>
            <CardTitle>Message Log</CardTitle>
            <CardDescription>Recent satellite communications</CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No messages yet
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.id} className="p-3 border rounded space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant={msg.type === "sent" ? "default" : "secondary"}>
                        {msg.type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          msg.status === "delivered"
                            ? "bg-green-500/10 text-green-500"
                            : msg.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-red-500/10 text-red-500"
                        }
                      >
                        {msg.status}
                      </Badge>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                    <div className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString()} • Latency: {msg.latency}ms
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SatcomPage;
