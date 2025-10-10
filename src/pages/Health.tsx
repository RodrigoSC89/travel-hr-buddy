import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Info } from "lucide-react";

const Health = () => {
  // Check environment variables
  const envChecks = [
    {
      name: "Supabase URL",
      key: "VITE_SUPABASE_URL",
      value: import.meta.env.VITE_SUPABASE_URL,
      required: true,
    },
    {
      name: "Supabase Publishable Key",
      key: "VITE_SUPABASE_PUBLISHABLE_KEY",
      value: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      required: true,
    },
    {
      name: "Mapbox Token",
      key: "VITE_MAPBOX_TOKEN",
      value: import.meta.env.VITE_MAPBOX_TOKEN,
      required: false,
    },
    {
      name: "Mapbox Access Token",
      key: "VITE_MAPBOX_ACCESS_TOKEN",
      value: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
      required: false,
    },
    {
      name: "OpenAI API Key",
      key: "VITE_OPENAI_API_KEY",
      value: import.meta.env.VITE_OPENAI_API_KEY,
      required: false,
    },
    {
      name: "OpenWeather API Key",
      key: "VITE_OPENWEATHER_API_KEY",
      value: import.meta.env.VITE_OPENWEATHER_API_KEY,
      required: false,
    },
  ];

  const requiredChecks = envChecks.filter(check => check.required);
  const optionalChecks = envChecks.filter(check => !check.required);

  const allRequiredLoaded = requiredChecks.every(check => check.value);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚢 Nautilus One Health Check</h1>
          <p className="text-gray-600">System Status and Environment Diagnostics</p>
        </div>

        {/* Overall Status */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {allRequiredLoaded ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <span className="text-green-600">System is Running</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <span className="text-red-600">System has Issues</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Build Time:</p>
                <p className="font-semibold">{new Date().toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Environment:</p>
                <p className="font-semibold">{import.meta.env.MODE || "development"}</p>
              </div>
              <div>
                <p className="text-gray-600">Vite Version:</p>
                <p className="font-semibold">5.4.19</p>
              </div>
              <div>
                <p className="text-gray-600">React Version:</p>
                <p className="font-semibold">18.3.1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Environment Variables */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Required Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requiredChecks.map(check => (
                <div
                  key={check.key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{check.name}</p>
                    <p className="text-xs text-gray-500">{check.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {check.value ? (
                      <>
                        <Badge variant="default" className="bg-green-600">
                          ✅ Loaded
                        </Badge>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </>
                    ) : (
                      <>
                        <Badge variant="destructive">❌ Missing</Badge>
                        <XCircle className="h-5 w-5 text-red-600" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Optional Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Optional Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optionalChecks.map(check => (
                <div
                  key={check.key}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{check.name}</p>
                    <p className="text-xs text-gray-500">{check.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {check.value ? (
                      <>
                        <Badge variant="default" className="bg-green-600">
                          ✅ Loaded
                        </Badge>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary">Not Set</Badge>
                        <Info className="h-5 w-5 text-gray-400" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">📝 Configuration Instructions</h3>
          <p className="text-sm text-blue-800 mb-2">If you see missing required variables:</p>
          <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
            <li>
              Copy <code className="bg-blue-100 px-1 rounded">.env.example</code> to{" "}
              <code className="bg-blue-100 px-1 rounded">.env</code>
            </li>
            <li>
              Add your API keys to the <code className="bg-blue-100 px-1 rounded">.env</code> file
            </li>
            <li>Restart the development server</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Health;
