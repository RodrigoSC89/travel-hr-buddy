/**
 * PATCH 300: Enhanced API Gateway
 * API management platform with routing, rate limiting, and documentation
 * PATCH 863: Removed @ts-nocheck, aligned with supabase-aliases types
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
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Clock,
  Download,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import type { ApiRoute, ApiKey, ApiRateLimit } from "@/types/supabase-aliases";
import { apiRoutesTable } from "@/lib/supabase/dynamic-tables";

// Extended interface for display purposes
// The real schema uses key_hash/key_prefix, but we display a masked key
interface DisplayApiKey {
  id: string;
  key_name: string;
  key_prefix: string;
  key_hash: string;
  tier: string | null;
  is_active: boolean | null;
  last_used_at: string | null;
  created_at: string | null;
  // Display computed fields
  display_key: string;
  usage_count: number;
}

interface DisplayRateLimit {
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
  const [routes, setRoutes] = useState<ApiRoute[]>([]);
  const [apiKeys, setApiKeys] = useState<DisplayApiKey[]>([]);
  const [rateLimits, setRateLimits] = useState<DisplayRateLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKey, setShowNewKey] = useState(false);
  const [showNewRoute, setShowNewRoute] = useState(false);

  const [keyFormData, setKeyFormData] = useState({
    key_name: "",
    tier: "basic"
  });

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
      const { data, error } = await apiRoutesTable.select("*");
      if (error) throw error;
      // Sort routes by path
      const sortedRoutes = (data || []).sort((a, b) => 
        a.route_path.localeCompare(b.route_path)
      );
      setRoutes(sortedRoutes);
    } catch (error: unknown) {
      logger.error("Error loading routes:", error);
    }
  };

  const loadKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transform to display format
      const displayKeys: DisplayApiKey[] = (data || []).map(k => ({
        ...k,
        display_key: `${k.key_prefix}...`,
        usage_count: 0, // Would come from a join or separate query
      }));
      setApiKeys(displayKeys);
    } catch (error: unknown) {
      logger.error("Error loading API keys:", error);
    }
  };

  const loadRateLimits = async () => {
    try {
      const { data, error } = await supabase
        .from("api_rate_limits")
        .select("*")
        .order("window_start", { ascending: false })
        .limit(50);

      if (error) throw error;
      // Transform to display format (real schema differs)
      setRateLimits((data || []).map(r => ({
        id: r.id,
        tier: r.window_type || "default",
        requests_per_minute: 100,
        requests_per_hour: 1000,
        requests_per_day: 10000,
        current_minute_count: r.request_count || 0,
        current_hour_count: 0,
        current_day_count: 0,
      })));
    } catch (error: unknown) {
      logger.error("Error loading rate limits:", error);
    }
  };

  const createApiKey = async () => {
    try {
      // Generate a cryptographically secure random API key
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      const fullKey = "sk_" + Array.from(array, byte => byte.toString(16).padStart(2, "0")).join("");
      const keyPrefix = fullKey.substring(0, 10);
      
      // Hash the key for storage (in real implementation, use proper hashing)
      const keyHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fullKey));
      const hashHex = Array.from(new Uint8Array(keyHash), b => b.toString(16).padStart(2, "0")).join("");

      const { error } = await supabase
        .from("api_keys")
        .insert({
          key_name: keyFormData.key_name,
          key_prefix: keyPrefix,
          key_hash: hashHex,
          tier: keyFormData.tier,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "✅ API Key Created",
        description: `API key "${keyFormData.key_name}" has been created. Key: ${fullKey}`,
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
      const { error } = await apiRoutesTable.insert({
        route_path: routeFormData.route_path,
        route_name: routeFormData.route_name,
        method: routeFormData.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS",
        description: routeFormData.description || null,
        requires_auth: routeFormData.requires_auth,
        is_public: routeFormData.is_public,
      });

      if (error) throw error;

      toast({
        title: "✅ Route Created",
        description: `API route "${routeFormData.route_name}" has been created`,
      });

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
        .update({ is_active: false })
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
      // Generate documentation from routes directly instead of RPC
      let markdown = "# API Documentation\n\n";
      markdown += `Generated: ${new Date().toLocaleString()}\n\n`;
      markdown += "## Available Endpoints\n\n";

      routes.forEach((route) => {
        markdown += `### ${route.method} ${route.route_path}\n\n`;
        markdown += `**Name:** ${route.route_name}\n\n`;
        markdown += `**Description:** ${route.description || "No description"}\n\n`;
        markdown += `**Version:** ${route.version}\n\n`;
        markdown += `**Requires Auth:** ${route.requires_auth ? "Yes" : "No"}\n\n`;
        markdown += `**Public:** ${route.is_public ? "Yes" : "No"}\n\n`;
        
        if (route.schema_validation) {
          markdown += "**Schema:**\n```json\n";
          markdown += JSON.stringify(route.schema_validation, null, 2);
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
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "active":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "revoked":
    case "disabled":
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    case "suspended":
      return <Clock className="h-4 w-4 text-warning" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-primary",
      POST: "bg-success",
      PUT: "bg-warning",
      PATCH: "bg-accent",
      DELETE: "bg-destructive",
      OPTIONS: "bg-muted"
    };
    return <Badge className={colors[method] || "bg-muted"}>{method}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      basic: "bg-muted",
      standard: "bg-primary",
      premium: "bg-accent",
      unlimited: "bg-success"
    };
    return <Badge className={colors[tier] || "bg-muted"}>{tier}</Badge>;
  };

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
                          onChange={(e) => setRouteFormData({ ...routeFormData, route_name: e.target.value })}
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
                            onChange={(e) => setRouteFormData({ ...routeFormData, route_path: e.target.value })}
                            placeholder="/api/v1/users/:id"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={routeFormData.description}
                          onChange={(e) => setRouteFormData({ ...routeFormData, description: e.target.value })}
                          placeholder="Brief description of the endpoint"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewRoute(false)}>
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
                                {route.is_public && <Badge className="bg-success">Public</Badge>}
                              </div>
                              <p className="text-sm font-semibold">{route.route_name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {route.description || "No description"}
                              </p>
                              {route.tags && route.tags.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                  {route.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
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
                          onChange={(e) => setKeyFormData({ ...keyFormData, key_name: e.target.value })}
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
                      <Button variant="outline" onClick={() => setShowNewKey(false)}>
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
                {apiKeys.filter(k => k.is_active !== false).map((key) => (
                  <Card key={key.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Key className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{key.key_name}</span>
                              {getTierBadge(key.tier || "basic")}
                              <Badge variant="secondary">
                                {key.usage_count} requests
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {key.display_key}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(key.display_key)}
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
                          onClick={() => revokeKey(key.id)}
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
                  <Card key={limit.id} className="border-l-4 border-l-accent">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Shield className="h-5 w-5 text-accent-foreground" />
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
};

export default ApiGatewayEnhanced;
