import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Status = "checking" | "valid" | "invalid" | "missing";

interface Service {
  name: string;
  envKey: string;
  endpoint: string;
  validate: () => Promise<boolean>;
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
];

export default function ApiStatusPage() {
  const [status, setStatus] = useState<Record<string, Status>>({});

  useEffect(() => {
    (async () => {
      const results: Record<string, Status> = {};
      for (const service of services) {
        results[service.name] = "checking";
        setStatus({ ...results });
        
        const ok = await service.validate();
        results[service.name] = ok ? "valid" : "invalid";
        setStatus({ ...results });
      }
    })();
  }, []);

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
