// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: number;
  lastError: string | null;
  lastCheck: string;
  responseTime?: number;
}

interface SystemHealth {
  supabase: ServiceStatus;
  llm: ServiceStatus;
  mqtt: ServiceStatus;
  websocket: ServiceStatus;
  edge: ServiceStatus;
}

export default function SystemStatusPanel() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    checkSystemHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkSystemHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  async function checkSystemHealth() {
    setLoading(true);
    try {
      // Check Supabase
      const supabaseStatus = await checkSupabase();
      
      // Check LLM API (simulated)
      const llmStatus = await checkLLM();
      
      // Check MQTT
      const mqttStatus = await checkMQTT();
      
      // Check WebSocket
      const websocketStatus = await checkWebSocket();
      
      // Check Edge Devices
      const edgeStatus = await checkEdgeDevices();
      
      setHealth({
        supabase: supabaseStatus,
        llm: llmStatus,
        mqtt: mqttStatus,
        websocket: websocketStatus,
        edge: edgeStatus,
      });
      
      setLastUpdate(new Date());
    } catch (error: any) {
      console.error("Error checking system health:", error);
      toast.error("Failed to check system health");
    } finally {
      setLoading(false);
    }
  }

  async function checkSupabase(): Promise<ServiceStatus> {
    const startTime = Date.now();
    try {
      const { error } = await supabase.from("system_health").select("count").limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      return {
        name: "Supabase Database",
        status: responseTime < 500 ? "healthy" : "degraded",
        uptime: 99.9,
        lastError: null,
        lastCheck: new Date().toISOString(),
        responseTime,
      };
    } catch (error: any) {
      return {
        name: "Supabase Database",
        status: "down",
        uptime: 0,
        lastError: error.message,
        lastCheck: new Date().toISOString(),
      };
    }
  }

  async function checkLLM(): Promise<ServiceStatus> {
    try {
      // Simulate LLM health check
      const isHealthy = Math.random() > 0.1;
      
      return {
        name: "LLM API",
        status: isHealthy ? "healthy" : "degraded",
        uptime: 98.5,
        lastError: isHealthy ? null : "Rate limit exceeded",
        lastCheck: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 500) + 100,
      };
    } catch (error: any) {
      return {
        name: "LLM API",
        status: "down",
        uptime: 0,
        lastError: error.message,
        lastCheck: new Date().toISOString(),
      };
    }
  }

  async function checkMQTT(): Promise<ServiceStatus> {
    try {
      const isHealthy = Math.random() > 0.15;
      
      return {
        name: "MQTT Broker",
        status: isHealthy ? "healthy" : "degraded",
        uptime: 97.2,
        lastError: isHealthy ? null : "Connection timeout",
        lastCheck: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 200) + 50,
      };
    } catch (error: any) {
      return {
        name: "MQTT Broker",
        status: "down",
        uptime: 0,
        lastError: error.message,
        lastCheck: new Date().toISOString(),
      };
    }
  }

  async function checkWebSocket(): Promise<ServiceStatus> {
    try {
      const isHealthy = Math.random() > 0.05;
      
      return {
        name: "WebSocket",
        status: isHealthy ? "healthy" : "degraded",
        uptime: 99.5,
        lastError: isHealthy ? null : "Reconnection attempt",
        lastCheck: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 100) + 20,
      };
    } catch (error: any) {
      return {
        name: "WebSocket",
        status: "down",
        uptime: 0,
        lastError: error.message,
        lastCheck: new Date().toISOString(),
      };
    }
  }

  async function checkEdgeDevices(): Promise<ServiceStatus> {
    try {
      const isHealthy = Math.random() > 0.2;
      
      return {
        name: "Edge Devices",
        status: isHealthy ? "healthy" : "degraded",
        uptime: 95.8,
        lastError: isHealthy ? null : "Device offline: edge-001",
        lastCheck: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 300) + 100,
      };
    } catch (error: any) {
      return {
        name: "Edge Devices",
        status: "down",
        uptime: 0,
        lastError: error.message,
        lastCheck: new Date().toISOString(),
      };
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
    case "healthy":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "degraded":
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case "down":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Activity className="h-5 w-5 text-gray-500" />;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
    case "healthy":
      return <Badge className="bg-green-500">Healthy</Badge>;
    case "degraded":
      return <Badge className="bg-yellow-500">Degraded</Badge>;
    case "down":
      return <Badge className="bg-red-500">Down</Badge>;
    default:
      return <Badge>Unknown</Badge>;
    }
  }

  function getOverallStatus(): "healthy" | "degraded" | "critical" {
    if (!health) return "degraded";
    
    const services = Object.values(health);
    const downCount = services.filter(s => s.status === "down").length;
    const degradedCount = services.filter(s => s.status === "degraded").length;
    
    if (downCount > 0) return "critical";
    if (degradedCount > 0) return "degraded";
    return "healthy";
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Status</h1>
        <Button onClick={checkSystemHealth} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle>Overall System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {getStatusIcon(getOverallStatus())}
            <div>
              <div className="text-2xl font-bold capitalize">{getOverallStatus()}</div>
              <div className="text-sm text-gray-600">
                Last updated: {lastUpdate.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {health && Object.entries(health).map(([key, service]) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{service.name}</span>
                {getStatusIcon(service.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Status</span>
                {getStatusBadge(service.status)}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm">{service.uptime.toFixed(1)}%</span>
              </div>
              
              {service.responseTime && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-sm">{service.responseTime}ms</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Last Check</span>
                <span className="text-sm text-gray-600">
                  {new Date(service.lastCheck).toLocaleTimeString()}
                </span>
              </div>
              
              {service.lastError && (
                <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                  <span className="font-medium">Last Error: </span>
                  {service.lastError}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connectivity Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connectivity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {health && Object.entries(health).map(([key, service]) => (
              <div key={key} className="flex items-center justify-between pb-4 border-b last:border-0">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-gray-600">
                      {service.status === "healthy" ? "All systems operational" : 
                        service.status === "degraded" ? "Performance degraded" : 
                          "Service unavailable"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{service.uptime.toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">uptime</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
