import { useEffect, useState } from "react";;

/**
 * PATCH 420: Satcom Communication History
 * Visualizes transmission history over time
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, ArrowUp, ArrowDown, Clock, Signal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TransmissionLog {
  id: string;
  type: "send" | "receive";
  provider: string;
  message: string;
  status: string;
  signalStrength: number;
  latency: number;
  timestamp: Date;
}

interface CommunicationHistoryProps {
  vesselId?: string;
  limit?: number;
}

export const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({
  vesselId = "vessel-001",
  limit = 50
}) => {
  const [logs, setLogs] = useState<TransmissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "send" | "receive">("all");

  useEffect(() => {
    loadHistory();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("satcom_logs_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "satcom_logs",
          filter: `vessel_id=eq.${vesselId}`
        },
        (payload) => {
          const newLog = payload.new;
          setLogs(prev => [
            {
              id: newLog.id,
              type: newLog.transmission_type,
              provider: newLog.provider,
              message: newLog.message_content || "",
              status: newLog.status,
              signalStrength: newLog.signal_strength,
              latency: newLog.latency_ms,
              timestamp: new Date(newLog.created_at)
            },
            ...prev
          ].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vesselId, limit]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("satcom_logs")
        .select("*")
        .eq("vessel_id", vesselId)
        .in("transmission_type", ["send", "receive"])
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      if (data) {
        const formattedLogs = data.map(log => ({
          id: log.id,
          type: log.transmission_type as "send" | "receive",
          provider: log.provider,
          message: log.message_content || "",
          status: log.status,
          signalStrength: log.signal_strength || 0,
          latency: log.latency_ms || 0,
          timestamp: new Date(log.created_at)
        }));
        setLogs(formattedLogs);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filter === "all" 
    ? logs 
    : logs.filter(log => log.type === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
    case "success": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "degraded": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "failed": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "timeout": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.type === "send").length,
    received: logs.filter(l => l.type === "receive").length,
    successRate: logs.length > 0 
      ? Math.round((logs.filter(l => l.status === "success").length / logs.length) * 100)
      : 0,
    avgLatency: logs.length > 0
      ? Math.round(logs.reduce((sum, l) => sum + l.latency, 0) / logs.length)
      : 0
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Communication History
          </CardTitle>
          <div className="flex gap-2">
            <Badge 
              variant={filter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("all")}
            >
              All ({stats.total})
            </Badge>
            <Badge 
              variant={filter === "send" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("send")}
            >
              <ArrowUp className="w-3 h-3 mr-1" />
              Sent ({stats.sent})
            </Badge>
            <Badge 
              variant={filter === "receive" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter("receive")}
            >
              <ArrowDown className="w-3 h-3 mr-1" />
              Received ({stats.received})
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-zinc-900/50 rounded-lg">
          <div>
            <div className="text-sm text-zinc-400">Success Rate</div>
            <div className="text-2xl font-bold text-green-400">{stats.successRate}%</div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">Avg Latency</div>
            <div className="text-2xl font-bold text-blue-400">{stats.avgLatency}ms</div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">Sent</div>
            <div className="text-2xl font-bold text-purple-400">{stats.sent}</div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">Received</div>
            <div className="text-2xl font-bold text-cyan-400">{stats.received}</div>
          </div>
        </div>

        {/* History Log */}
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-zinc-400">Loading history...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No transmission history yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id}
                  className={`
                    p-3 rounded-lg border
                    ${log.type === "send" 
                  ? "bg-blue-500/5 border-blue-500/20" 
                  : "bg-green-500/5 border-green-500/20"}
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {log.type === "send" ? (
                        <ArrowUp className="w-4 h-4 text-blue-400" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-green-400" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {log.provider}
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(log.status)}`}>
                        {log.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="text-sm text-zinc-300 mb-2">
                    {log.message || "(No message content)"}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Signal className="w-3 h-3" />
                      {log.signalStrength}%
                    </span>
                    <span>Latency: {log.latency}ms</span>
                    <span>{log.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
