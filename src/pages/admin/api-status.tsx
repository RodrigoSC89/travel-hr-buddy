import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Activity,
  RefreshCw,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Status = "valid" | "invalid" | "missing" | "checking" | undefined;

const LOGGING = true; // Enable logging

interface Service {
  name: string;
  validate: () => Promise<boolean>;
}

const services: Service[] = [
  {
    name: "Supabase Connection",
    validate: async () => {
      try {
        const { error } = await supabase.from("profiles").select("count").limit(1);
        return !error;
      } catch {
        return false;
      }
    },
  },
  {
    name: "Authentication System",
    validate: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        return session !== null;
      } catch {
        return false;
      }
    },
  },
  {
    name: "Check Session API",
    validate: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        const res = await fetch(`${supabase.supabaseUrl}/functions/v1/check-session`, {
          headers: {
            Authorization: `Bearer ${token || supabase.supabaseKey}`,
          },
        });
        const json = await res.json();
        return json?.session?.user ? true : false;
      } catch {
        return false;
      }
    },
  },
  {
    name: "Mapbox API",
    validate: async () => {
      try {
        const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        if (!token) return false;
        const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${token}`);
        return res.ok;
      } catch {
        return false;
      }
    },
  },
  {
    name: "OpenAI API",
    validate: async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        const res = await fetch(`${supabase.supabaseUrl}/functions/v1/ai-chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || supabase.supabaseKey}`,
          },
          body: JSON.stringify({ message: "test", context: "" }),
        });
        return res.ok;
      } catch {
        return false;
      }
    },
  },
];

export default function ApiStatusPage() {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(false);

  async function checkAll() {
    setLoading(true);
    const results: Record<string, Status> = {};
    
    for (const service of services) {
      results[service.name] = "checking";
      setStatus({ ...results }); // Update UI in real-time
      
      const ok = await service.validate();
      results[service.name] = ok ? "valid" : "invalid";
      setStatus({ ...results }); // Update UI after each check
    }
    
    setLoading(false);

    if (LOGGING) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        await fetch(`${supabase.supabaseUrl}/functions/v1/log-api-status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || supabase.supabaseKey}`,
          },
          body: JSON.stringify(results),
        });
      } catch (e) {
        console.error("Failed to log status:", e);
      }
    }
  }

  useEffect(() => {
    checkAll();
  }, []);

  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={Activity}
          title="API Status Dashboard"
          description="Monitor and test all API integrations in real-time"
          gradient="blue"
          badges={[
            { icon: Activity, label: `${services.length} Services` },
          ]}
        />

        <div className="space-y-6">
          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Test Controls
              </CardTitle>
              <CardDescription>
                Retest all APIs and check their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={checkAll}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    🔁 Retest APIs
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Services Status List */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Current status of all integrated services</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {services.map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {renderStatusIcon(status[s.name])}
                      <div>
                        <strong className="text-sm font-medium">{s.name}</strong>
                        <div className="text-xs text-muted-foreground mt-1">
                          {renderStatusText(status[s.name])}
                        </div>
                      </div>
                    </div>
                    {renderStatusBadge(status[s.name])}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{services.length}</div>
                <p className="text-xs text-muted-foreground">API integrations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Valid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(status).filter((s) => s === "valid").length}
                </div>
                <p className="text-xs text-muted-foreground">Working correctly</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Invalid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(status).filter((s) => s === "invalid").length}
                </div>
                <p className="text-xs text-muted-foreground">Needs attention</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}

function renderStatusIcon(state: Status) {
  switch (state) {
    case "valid":
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    case "invalid":
      return <XCircle className="h-5 w-5 text-red-600" />;
    case "missing":
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    case "checking":
      return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
    default:
      return <Clock className="h-5 w-5 text-gray-400" />;
  }
}

function renderStatusText(state: Status) {
  switch (state) {
    case "valid":
      return "✅ Valid - Service is responding correctly";
    case "invalid":
      return "❌ Invalid - Service is not responding or has errors";
    case "missing":
      return "⚠️ Missing Key - API key not configured";
    case "checking":
      return "⏳ Checking... - Testing connection";
    default:
      return "- Not tested yet";
  }
}

function renderStatusBadge(state: Status) {
  switch (state) {
    case "valid":
      return (
        <Badge className="bg-green-600 text-white">
          ✅ Valid
        </Badge>
      );
    case "invalid":
      return (
        <Badge variant="destructive">
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
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-600">
          - Not Tested
        </Badge>
      );
  }
}
