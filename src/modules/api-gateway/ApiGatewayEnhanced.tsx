/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 300: Enhanced API Gateway
 * Added documentation generation and Markdown export
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Server, 
  Shield, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  RefreshCw, 
  TrendingUp, 
  Clock,
  FileText,
  Download,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface APIRoute {
  id: string;
  route_path: string;
  route_name: string;
  method: string;
  description: string;
  schema_validation: unknown: unknown: unknown;
  requires_auth: boolean;
  is_public: boolean;
  status: string;
  version: string;
  tags: string[];
}

interface APIKey {
  id: string;
  key_name: string;
  api_key: string;
  tier: string;
  status: string;
  usage_count: number;
  last_used_at: string;
  created_at: string;
}

interface RateLimit {
  id: string;
  tier: string;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  current_minute_count: number;
  current_hour_count: number;
  current_day_count: number;
}

const ApiGatewayEnhanced = () => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<APIRoute[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKey, setShowNewKey] = useState(false);
  const [showNewRoute, setShowNewRoute] = useState(false);

  const [keyFormData, setKeyFormData] = useState({
    key_name: "",
    tier: "basic"
  };

  const [routeFormData, setRouteFormData] = useState({
    route_path: "",
    route_name: "",
    method: "GET",
    description: "",
    requires_auth: true,
    is_public: false
  });

  useEffect(() => {
    loadData();
    
    const routesChannel = supabase
      .channel("api_routes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "api_routes"
        },
        () => {
          loadRoutes();
        }
      )
      .subscribe();

    const keysChannel = supabase
      .channel("api_keys_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "api_keys"
        },
        () => {
          loadKeys();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(routesChannel);
      supabase.removeChannel(keysChannel);
    };
  }, []);

  const loadData = async () => {
    await Promise.all([loadRoutes(), loadKeys(), loadRateLimits()]);
    setLoading(false);
  };

  const loadRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from("api_routes")
        .select("*")
        .order("route_path", { ascending: true });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error: unknown) {
      console.error("Error loading routes:", error);
    }
  };

  const loadKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: unknown) {
      console.error("Error loading API keys:", error);
    }
  };

  const loadRateLimits = async () => {
    try {
      const { data, error } = await supabase
        .from("api_rate_limits")
        .select("*")
        .eq("route_path", "*")
        .order("tier", { ascending: true });

      if (error) throw error;
      setRateLimits(data || []);
    } catch (error: unknown) {
      console.error("Error loading rate limits:", error);
    }
  };

  const createApiKey = async () => {
    try {
      // Generate a cryptographically secure random API key
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const apiKey = "sk_" + Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");

      const { error } = await supabase
        .from("api_keys")
        .insert({
          key_name: keyFormData.key_name,
          api_key: apiKey,
          tier: keyFormData.tier,
          status: "active"
        };

      if (error) throw error;

      toast({
        title: "✅ API Key Created",
        description: `API key "${keyFormData.key_name}" has been created`,
      });

      setShowNewKey(false);
      setKeyFormData({ key_name: "", tier: "basic" });
      loadKeys();
    } catch (error: unknown) {
      toast({
        title: "Error creating API key",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const createRoute = async () => {
    try {
      const { error } = await supabase
        .from("api_routes")
        .insert({
          ...routeFormData,
          status: "active",
          version: "v1"
        };

      if (error) throw error;

      toast({
        title: "✅ Route Created",
        description: `API route "${routeFormData.route_name}" has been created`,
      };

      setShowNewRoute(false);
      setRouteFormData({
        route_path: "",
        route_name: "",
        method: "GET",
        description: "",
        requires_auth: true,
        is_public: false
      });
      loadRoutes();
    } catch (error: unknown) {
      toast({
        title: "Error creating route",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const revokeKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from("api_keys")
        .update({ status: "revoked" })
        .eq("id", keyId);

      if (error) throw error;

      toast({
        title: "API Key Revoked",
        description: "The API key has been revoked",
      });

      loadKeys();
    } catch (error: unknown) {
      toast({
        title: "Error revoking key",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const generateDocumentation = async () => {
    try {
      const { data, error } = await supabase.rpc("generate_api_documentation");

      if (error) throw error;

      // Generate Markdown documentation
      let markdown = "# API Documentation\n\n";
      markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
      markdown += "## Available Endpoints\n\n";

      interface RouteDoc {
        route_path: string;
        method: string;
        description: string;
        schema: unknown;
        version: string;
      }

      (data as RouteDoc[]).forEach((route) => {
        markdown += `### ${route.method} ${route.route_path}\n\n`;
        markdown += `**Description:** ${route.description || "No description"}\n\n`;
        markdown += `**Version:** ${route.version}\n\n`;
        
        if (route.schema) {
          markdown += "**Schema:**\n```json\n";
          markdown += JSON.stringify(route.schema, null, 2);
          markdown += "\n```\n\n";
        }
        
        markdown += "---\n\n";
      });

      // Download as markdown file
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `api-documentation-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "✅ Documentation Generated",
        description: "API documentation has been exported",
      });
    } catch (error: unknown) {
      toast({
        title: "Error generating documentation",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "active":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "revoked":
    case "disabled":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "suspended":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-blue-500",
      POST: "bg-green-500",
      PUT: "bg-yellow-500",
      PATCH: "bg-orange-500",
      DELETE: "bg-red-500",
      OPTIONS: "bg-gray-500"
    };
    return <Badge className={colors[method] || "bg-gray-500"}>{method}</Badge>;
  });

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      basic: "bg-gray-500",
      standard: "bg-blue-500",
      premium: "bg-purple-500",
      unlimited: "bg-green-500"
    };
    return <Badge className={colors[tier] || "bg-gray-500"}>{tier}</Badge>;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Server className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">API Gateway</h1>
          <p className="text-muted-foreground">
            API management platform with routing, rate limiting, and analytics
          </p>
        </div>
      </div>

      <Tabs defaultValue="routes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Routes
          </TabsTrigger>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Rate Limits
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    API Routes
                  </CardTitle>
                  <CardDescription>
                    Manage API endpoints and routing configuration
                  </CardDescription>
                </div>
                <Dialog open={showNewRoute} onOpenChange={setShowNewRoute}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Route
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create API Route</DialogTitle>
                      <DialogDescription>
                        Register a new API endpoint
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="route_name">Route Name</Label>
                        <Input
                          id="route_name"
                          value={routeFormData.route_name}
                          onChange={handleChange})}
                          placeholder="e.g., Get User Profile"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="method">Method</Label>
                          <Select
                            value={routeFormData.method}
                            onValueChange={(value) => setRouteFormData({ ...routeFormData, method: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GET">GET</SelectItem>
                              <SelectItem value="POST">POST</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                              <SelectItem value="PATCH">PATCH</SelectItem>
                              <SelectItem value="DELETE">DELETE</SelectItem>
                              <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="route_path">Path</Label>
                          <Input
                            id="route_path"
                            value={routeFormData.route_path}
                            onChange={handleChange})}
                            placeholder="/api/v1/users/:id"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={routeFormData.description}
                          onChange={handleChange})}
                          placeholder="Brief description of the endpoint"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleSetShowNewRoute}>
                        Cancel
                      </Button>
                      <Button onClick={createRoute}>
                        Create Route
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <p>Loading routes...</p>
                ) : routes.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No routes found. Create your first API route!
                  </p>
                ) : (
                  routes.filter(r => r.status === "active").map((route) => (
                    <Card key={route.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(route.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getMethodBadge(route.method)}
                                <span className="font-mono text-sm">{route.route_path}</span>
                                <Badge variant="outline">{route.version}</Badge>
                                {route.requires_auth && <Badge variant="secondary">🔒 Auth</Badge>}
                                {route.is_public && <Badge className="bg-green-500">Public</Badge>}
                              </div>
                              <p className="text-sm font-semibold">{route.route_name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {route.description || "No description"}
                              </p>
                              {route.tags && route.tags.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  {route.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Keys
                  </CardTitle>
                  <CardDescription>
                    Manage API keys for authentication
                  </CardDescription>
                </div>
                <Dialog open={showNewKey} onOpenChange={setShowNewKey}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create API Key</DialogTitle>
                      <DialogDescription>
                        Generate a new API key for authentication
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="key_name">Key Name</Label>
                        <Input
                          id="key_name"
                          value={keyFormData.key_name}
                          onChange={handleChange})}
                          placeholder="e.g., Production API Key"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tier">Tier</Label>
                        <Select
                          value={keyFormData.tier}
                          onValueChange={(value) => setKeyFormData({ ...keyFormData, tier: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic (100/min)</SelectItem>
                            <SelectItem value="standard">Standard (1000/min)</SelectItem>
                            <SelectItem value="premium">Premium (10000/min)</SelectItem>
                            <SelectItem value="unlimited">Unlimited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={handleSetShowNewKey}>
                        Cancel
                      </Button>
                      <Button onClick={createApiKey}>
                        Create Key
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiKeys.filter(k => k.status !== "revoked").map((key) => (
                  <Card key={key.id} className="border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Key className="h-5 w-5 text-green-500" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{key.key_name}</span>
                              {getTierBadge(key.tier)}
                              <Badge variant="secondary">
                                {key.usage_count} requests
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {key.api_key.substring(0, 20)}...
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlecopyToClipboard}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            {key.last_used_at && (
                              <p className="text-xs text-muted-foreground">
                                Last used: {new Date(key.last_used_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlerevokeKey}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Rate Limits
              </CardTitle>
              <CardDescription>
                Tiered rate limiting configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rateLimits.map((limit) => (
                  <Card key={limit.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Shield className="h-5 w-5 text-purple-500" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              {getTierBadge(limit.tier)}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Per Minute</p>
                                <p className="font-semibold">
                                  {limit.current_minute_count} / {limit.requests_per_minute}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Per Hour</p>
                                <p className="font-semibold">
                                  {limit.current_hour_count} / {limit.requests_per_hour}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Per Day</p>
                                <p className="font-semibold">
                                  {limit.current_day_count} / {limit.requests_per_day}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    API Documentation
                  </CardTitle>
                  <CardDescription>
                    Auto-generated API documentation
                  </CardDescription>
                </div>
                <Button onClick={generateDocumentation}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Markdown
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground mb-2">
                    Documentation will be generated from the active API routes with their schemas and descriptions.
                  </p>
                  <p className="text-sm font-semibold">
                    Total Routes: {routes.filter(r => r.status === "active").length}
                  </p>
                </div>
                
                <div className="space-y-2">
                  {routes.filter(r => r.status === "active").slice(0, 5).map((route) => (
                    <div key={route.id} className="p-3 border rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        {getMethodBadge(route.method)}
                        <code className="text-sm">{route.route_path}</code>
                      </div>
                      <p className="text-xs text-muted-foreground">{route.description}</p>
                    </div>
                  ))}
                  {routes.filter(r => r.status === "active").length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      And {routes.filter(r => r.status === "active").length - 5} more routes...
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
});

export default ApiGatewayEnhanced;
