import { useEffect, useRef, useState, useCallback, useMemo } from "react";;

/**
 * PATCH 420: Satcom Interactive Terminal
 * Terminal interface for sending and receiving satellite communications
 */

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Terminal, Activity, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TerminalMessage {
  id: string;
  type: "send" | "receive" | "system";
  content: string;
  timestamp: Date;
  status: "success" | "failed" | "degraded" | "timeout";
  provider: string;
  signalStrength?: number;
  latency?: number;
}

interface SatcomTerminalProps {
  vesselId?: string;
  activeProvider: string;
  signalStrength: number;
  onTransmit?: (message: string) => void;
}

export const SatcomTerminal: React.FC<SatcomTerminalProps> = ({
  vesselId = "vessel-001",
  activeProvider,
  signalStrength,
  onTransmit
}) => {
  const [messages, setMessages] = useState<TerminalMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTransmitting, setIsTransmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load recent logs from database
    loadRecentLogs();

    // Simulate incoming messages
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        receiveMessage();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadRecentLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("satcom_logs")
        .select("*")
        .eq("vessel_id", vesselId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        const logs = data.reverse().map(log => ({
          id: log.id,
          type: log.transmission_type as "send" | "receive" | "system",
          content: log.message_content || "",
          timestamp: new Date(log.created_at),
          status: log.status as "success" | "failed" | "degraded" | "timeout",
          provider: log.provider,
          signalStrength: log.signal_strength,
          latency: log.latency_ms
        }));
        setMessages(logs);
      }
    } catch (error) {
      console.error("Error loading logs:", error);
    }
  };

  const simulateTransmission = () => {
    // Simulate signal loss, latency, degradation
    const random = Math.random();
    let status: "success" | "failed" | "degraded" | "timeout" = "success";
    let actualLatency = 600 + Math.random() * 400;

    if (signalStrength < 30) {
      status = random > 0.3 ? "failed" : "degraded";
    } else if (signalStrength < 60) {
      status = random > 0.7 ? "degraded" : "success";
      actualLatency *= 1.5;
    }

    if (random > 0.95) {
      status = "timeout";
      actualLatency = 3000;
    }

    return { status, latency: Math.round(actualLatency) };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isTransmitting) return;

    setIsTransmitting(true);
    const { status, latency } = simulateTransmission();

    const newMessage: TerminalMessage = {
      id: crypto.randomUUID(),
      type: "send",
      content: inputMessage,
      timestamp: new Date(),
      status,
      provider: activeProvider,
      signalStrength,
      latency
    };

    // Log to database
    try {
      await supabase.from("satcom_logs").insert({
        vessel_id: vesselId,
        transmission_type: "send",
        provider: activeProvider,
        message_content: inputMessage,
        signal_strength: signalStrength,
        latency_ms: latency,
        status,
        metadata: { simulated: true }
      });
    } catch (error) {
      console.error("Error logging transmission:", error);
    }

    setMessages(prev => [...prev, newMessage]);
    setInputMessage("");

    if (onTransmit) {
      onTransmit(inputMessage);
    }

    // Show toast based on status
    if (status === "success") {
      toast({
        title: "Message Sent",
        description: `Transmitted via ${activeProvider} (${latency}ms)`,
      });
    } else if (status === "failed") {
      toast({
        title: "Transmission Failed",
        description: "Signal too weak, message not sent",
        variant: "destructive"
      });
    } else if (status === "degraded") {
      toast({
        title: "Degraded Transmission",
        description: "Message sent with reduced quality",
        variant: "default"
      });
    } else {
      toast({
        title: "Timeout",
        description: "Transmission timeout, retrying...",
        variant: "destructive"
      });
    }

    setTimeout(() => setIsTransmitting(false), latency);
  };

  const receiveMessage = () => {
    const messages = [
      "Weather update: Clear skies ahead",
      "Navigation: Course correction advised",
      "System check: All systems nominal",
      "Cargo status: Secure",
      "Port ETA: 6 hours",
      "Fuel consumption: Within normal range"
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const { status, latency } = simulateTransmission();

    const newMessage: TerminalMessage = {
      id: crypto.randomUUID(),
      type: "receive",
      content: randomMessage,
      timestamp: new Date(),
      status,
      provider: activeProvider,
      signalStrength,
      latency
    };

    setMessages(prev => [...prev, newMessage]);

    // Log to database
    supabase.from("satcom_logs").insert({
      vessel_id: vesselId,
      transmission_type: "receive",
      provider: activeProvider,
      message_content: randomMessage,
      signal_strength: signalStrength,
      latency_ms: latency,
      status,
      metadata: { simulated: true, auto_generated: true }
    }).then(() => {}).catch(console.error);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "success": return "bg-green-500/20 text-green-500";
    case "degraded": return "bg-yellow-500/20 text-yellow-500";
    case "failed": return "bg-red-500/20 text-red-500";
    case "timeout": return "bg-orange-500/20 text-orange-500";
    default: return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          SATCOM Terminal
          <Badge variant="outline" className="ml-auto">
            {activeProvider}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 rounded-lg p-4 font-mono text-sm space-y-2">
          {messages.length === 0 && (
            <div className="text-zinc-500 text-center py-8">
              <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No transmissions yet. Send a message to begin.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`
              p-2 rounded border-l-2
              ${msg.type === "send" ? "border-blue-500 bg-blue-500/5" : ""}
              ${msg.type === "receive" ? "border-green-500 bg-green-500/5" : ""}
              ${msg.type === "system" ? "border-yellow-500 bg-yellow-500/5" : ""}
            `}>
              <div className="flex items-start gap-2 mb-1">
                <Badge variant="outline" className={`text-xs ${getStatusColor(msg.status)}`}>
                  {msg.status}
                </Badge>
                <span className="text-xs text-zinc-400">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
                {msg.latency && (
                  <span className="text-xs text-zinc-500">
                    {msg.latency}ms
                  </span>
                )}
                {msg.signalStrength && (
                  <span className="text-xs text-zinc-500">
                    <Activity className="inline w-3 h-3 mr-1" />
                    {msg.signalStrength}%
                  </span>
                )}
              </div>
              <div className={`
                ${msg.type === "send" ? "text-blue-200" : ""}
                ${msg.type === "receive" ? "text-green-200" : ""}
                ${msg.type === "system" ? "text-yellow-200" : ""}
              `}>
                {msg.type === "send" ? "→" : "←"} {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 flex gap-2">
          <Input
            value={inputMessage}
            onChange={handleChange}
            onKeyPress={(e) => e.key === "Enter" && sendMessage(}
            placeholder="Type message to transmit..."
            disabled={isTransmitting || signalStrength < 20}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTransmitting || signalStrength < 20}
            size="icon"
          >
            {isTransmitting ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {signalStrength < 20 && (
          <div className="flex-shrink-0 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            Signal too weak for transmission
          </div>
        )}
      </CardContent>
    </Card>
  );
};
