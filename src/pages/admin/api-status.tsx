import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { CheckCircle, XCircle, Clock, Download, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type Status = "checking" | "valid" | "invalid" | "missing";

interface Service {
  name: string;
  envKey: string;
  endpoint: string;
  validate: () => Promise<boolean>;
}

interface LogEntry {
  timestamp: string;
  services: Record<string, boolean>;
}

interface HistoricalData {
  timestamp: string;
  [serviceName: string]: string | number;
}

const services: Service[] = [
  {
    name: "OpenAI",
    envKey: "VITE_OPENAI_API_KEY",
    endpoint: "https://api.openai.com/v1/chat/completions",
    validate: async () => {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) return false;
      try {
        const res = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  },
  {
    name: "Mapbox",
    envKey: "VITE_MAPBOX_ACCESS_TOKEN",
    endpoint: "https://api.mapbox.com/geocoding/v5",
    validate: async () => {
      const apiKey = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN;
      if (!apiKey) return false;
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${apiKey}&limit=1`
        );
        return res.ok;
      } catch {
        return false;
      }
    },
  },
  {
    name: "Amadeus",
    envKey: "VITE_AMADEUS_API_KEY",
    endpoint: "https://test.api.amadeus.com/v1/security/oauth2/token",
    validate: async () => {
      const clientId = import.meta.env.VITE_AMADEUS_API_KEY;
      const clientSecret = import.meta.env.VITE_AMADEUS_API_SECRET;
      if (!clientId || !clientSecret) return false;
      try {
        const res = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
          }),
        });
        const json = await res.json();
        return !!json.access_token;
      } catch {
        return false;
      }
    },
  },
  {
    name: "Supabase",
    envKey: "VITE_SUPABASE_URL",
    endpoint: "supabase.auth.getSession()",
    validate: async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) return false;
        return !!data.session;
      } catch {
        return false;
      }
    },
  },
  {
    name: "Windy",
    envKey: "VITE_WINDY_API_KEY",
    endpoint: "https://api.windy.com/api/point-forecast/v2",
    validate: async () => {
      const apiKey = import.meta.env.VITE_WINDY_API_KEY;
      if (!apiKey) return false;
      try {
        const res = await fetch("https://api.windy.com/api/point-forecast/v2", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            lat: 50.4, 
            lon: 14.3, 
            model: "gfs", 
            parameters: ["wind", "temp"], 
            levels: ["surface"], 
            key: apiKey 
          }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  },
  {
    name: "MarineTraffic",
    envKey: "VITE_MARINE_TRAFFIC_API_KEY",
    endpoint: "https://services.marinetraffic.com/api/exportvessel/v:2",
    validate: async () => {
      const apiKey = import.meta.env.VITE_MARINE_TRAFFIC_API_KEY;
      if (!apiKey) return false;
      try {
        const res = await fetch(
          `https://services.marinetraffic.com/api/exportvessel/v:2/${apiKey}/protocol:jsono`
        );
        return res.ok;
      } catch {
        return false;
      }
    },
  },
  {
    name: "Skyscanner",
    envKey: "VITE_SKYSCANNER_API_KEY",
    endpoint: "https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create",
    validate: async () => {
      const apiKey = import.meta.env.VITE_SKYSCANNER_API_KEY;
      if (!apiKey) return false;
      try {
        const res = await fetch("https://partners.api.skyscanner.net/apiservices/v3/flights/live/search/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": apiKey,
          },
          body: JSON.stringify({ 
            market: "US", 
            locale: "en-US", 
            currency: "USD", 
            queryLegs: [] 
          }),
        });
        return res.status !== 403; // 403 = auth failed
      } catch {
        return false;
      }
    },
  },
];

export default function ApiStatusPage() {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [history, setHistory] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load historical data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("api-status-history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const runValidation = async () => {
    setIsRefreshing(true);
    const results: Record<string, Status> = {};
    const serviceResults: Record<string, boolean> = {};
    
    for (const service of services) {
      results[service.name] = "checking";
      setStatus({ ...results });
      
      const ok = await service.validate();
      results[service.name] = ok ? "valid" : "invalid";
      serviceResults[service.name] = ok;
      setStatus({ ...results });
    }

    // Save to history
    const newEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      services: serviceResults,
    };
    
    const updatedHistory = [...history, newEntry].slice(-50); // Keep last 50 entries
    setHistory(updatedHistory);
    localStorage.setItem("api-status-history", JSON.stringify(updatedHistory));
    setIsRefreshing(false);
  };

  useEffect(() => {
    runValidation();
  }, []);

  const downloadLog = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = "api-status-log.json";
    
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Prepare chart data
  const chartData: HistoricalData[] = history.slice(-10).map((entry) => {
    const data: HistoricalData = {
      timestamp: new Date(entry.timestamp).toLocaleTimeString(),
    };
    services.forEach((service) => {
      data[service.name] = entry.services[service.name] ? 100 : 0;
    });
    return data;
  });

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
          <div className="flex gap-3">
            <Button onClick={runValidation} disabled={isRefreshing} variant="default">
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Retest APIs"}
            </Button>
            <Button onClick={downloadLog} disabled={history.length === 0} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Log
            </Button>
          </div>

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
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div>Environment: {s.envKey}</div>
                        <div>Endpoint: {s.endpoint}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historical Availability</CardTitle>
                <CardDescription>
                  Last 10 API status checks (100% = valid, 0% = invalid)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    {services.map((service, idx) => (
                      <Line
                        key={service.name}
                        type="monotone"
                        dataKey={service.name}
                        stroke={`hsl(${(idx * 360) / services.length}, 70%, 50%)`}
                        strokeWidth={2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
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
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_WINDY_API_KEY=your-windy-key
VITE_MARINE_TRAFFIC_API_KEY=your-marine-traffic-key
VITE_SKYSCANNER_API_KEY=your-skyscanner-key`}
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
