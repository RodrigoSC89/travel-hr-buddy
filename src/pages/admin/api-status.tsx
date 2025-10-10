import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { CheckCircle, XCircle, Clock, Download, RefreshCw } from "lucide-react";
import { testOpenAIConnection } from "@/services/openai";
import { testMapboxConnection } from "@/services/mapbox";
import { testAmadeusConnection } from "@/services/amadeus";
import { testSupabaseConnection } from "@/services/supabase";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Status = "checking" | "valid" | "invalid" | "missing";

interface Service {
  name: string;
  envKey: string;
  endpoint: string;
  validate: () => Promise<{ success: boolean; message: string; responseTime?: number; error?: string }>;
}

interface HistorySnapshot {
  timestamp: string;
  [key: string]: string | Status | number;
}

const services: Service[] = [
  {
    name: "OpenAI",
    envKey: "VITE_OPENAI_API_KEY",
    endpoint: "https://api.openai.com/v1/chat/completions",
    validate: testOpenAIConnection,
  },
  {
    name: "Mapbox",
    envKey: "VITE_MAPBOX_ACCESS_TOKEN",
    endpoint: "https://api.mapbox.com/geocoding/v5",
    validate: testMapboxConnection,
  },
  {
    name: "Amadeus",
    envKey: "VITE_AMADEUS_API_KEY",
    endpoint: "https://test.api.amadeus.com/v1/security/oauth2/token",
    validate: testAmadeusConnection,
  },
  {
    name: "Supabase",
    envKey: "VITE_SUPABASE_URL",
    endpoint: "supabase.auth.getSession()",
    validate: testSupabaseConnection,
  },
];

export default function ApiStatusPage() {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [responseData, setResponseData] = useState<Record<string, { message?: string; responseTime?: number; error?: string }>>({});

  const checkAll = async () => {
    setLoading(true);
    const results: Record<string, Status> = {};
    const dataResults: Record<string, { message?: string; responseTime?: number; error?: string }> = {};
    
    for (const service of services) {
      results[service.name] = "checking";
      setStatus({ ...results });
      
      const result = await service.validate();
      results[service.name] = result.success ? "valid" : "invalid";
      dataResults[service.name] = {
        message: result.message,
        responseTime: result.responseTime,
        error: result.error,
      };
      setStatus({ ...results });
      setResponseData({ ...dataResults });
    }
    
    // Add to history
    const snapshot: HistorySnapshot = {
      timestamp: new Date().toISOString(),
      ...results,
    };
    setHistory((prev) => [...prev, snapshot]);
    
    setLoading(false);
  };

  useEffect(() => {
    checkAll();
  }, []);

  const downloadLog = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "api-status-log.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart data
  const labels = history.map((h) => new Date(h.timestamp).toLocaleTimeString());
  
  const chartData = {
    labels,
    datasets: services.map((s, i) => ({
      label: s.name,
      data: history.map((h) => (h[s.name] === "valid" ? 1 : 0)),
      borderColor: `hsl(${(i * 80) % 360}, 70%, 50%)`,
      backgroundColor: `hsla(${(i * 80) % 360}, 70%, 50%, 0.1)`,
      fill: false,
      tension: 0.1,
    })),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "API Availability Over Time",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 1,
          callback: function(value: number | string) {
            return value === 1 ? "✅ Valid" : "❌ Invalid";
          },
        },
      },
    },
  };

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="purple">
        <ModuleHeader
          icon={CheckCircle}
          title="🔍 API Status Dashboard"
          description="Monitor the health and connectivity of all external API integrations"
          gradient="purple"
          badges={[
            {
              icon: CheckCircle,
              label: `${Object.values(status).filter((s) => s === "valid").length} Valid`,
            },
            {
              icon: XCircle,
              label: `${Object.values(status).filter((s) => s === "invalid").length} Invalid`,
            },
            {
              icon: Clock,
              label: `${Object.values(status).filter((s) => s === "checking").length} Checking`,
            },
          ]}
        />

        <div className="space-y-6">
          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Button 
                  onClick={checkAll} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Checking..." : "🔁 Retest APIs"}
                </Button>
                <Button 
                  onClick={downloadLog}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={history.length === 0}
                >
                  <Download className="w-4 h-4" />
                  📁 Download Log
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Services Status</CardTitle>
              <CardDescription>
                Real-time validation of API keys and service connectivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {services.map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <strong className="text-lg">{s.name}</strong>
                        {renderStatus(status[s.name])}
                        {responseData[s.name]?.responseTime && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {responseData[s.name].responseTime}ms
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Environment: {s.envKey}</div>
                        <div>Endpoint: {s.endpoint}</div>
                        {responseData[s.name]?.message && (
                          <div className="mt-1 font-medium">
                            Status: {responseData[s.name].message}
                          </div>
                        )}
                        {responseData[s.name]?.error && (
                          <div className="mt-1 text-red-600">
                            Error: {responseData[s.name].error}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Chart */}
          {history.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>📊 Availability History</CardTitle>
                <CardDescription>
                  Visual representation of API status over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: "300px" }}>
                  <Line data={chartData} options={chartOptions} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Configuration Guide</CardTitle>
              <CardDescription>Required environment variables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">To configure all services, add to your .env.local:</p>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  {`VITE_OPENAI_API_KEY=sk-...
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
VITE_AMADEUS_API_KEY=your-client-id
VITE_AMADEUS_API_SECRET=your-client-secret
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}

function renderStatus(state: Status | undefined) {
  switch (state) {
  case "valid":
    return (
      <Badge variant="default" className="bg-green-600 text-white">
          ✅ Valid
      </Badge>
    );
  case "invalid":
    return (
      <Badge variant="destructive" className="bg-red-600 text-white">
          ❌ Invalid
      </Badge>
    );
  case "missing":
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          ⚠️ Missing Key
      </Badge>
    );
  case "checking":
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          ⏳ Checking...
      </Badge>
    );
  default:
    return <Badge variant="outline">-</Badge>;
  }
}
