/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 100.0 - API Gateway Functional
 * Enhanced API Gateway with routing, rate limiting, and analytics
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Server, Shield, Zap, AlertCircle, CheckCircle2, Key, Webhook as WebhookIcon, Plus, Trash2, Copy, RefreshCw, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiProxyRouter } from "./services/api-proxy-router";
import { rateLimiter } from "./services/rate-limiter";
import { apiKeyManager } from "./services/api-key-manager";
import { webhookManager } from "./services/webhook-manager";

const ApiGateway = () => {
  const { toast } = useToast();
  const [routes, setRoutes] = useState(apiProxyRouter.getAllRoutes());
  const [rateLimits, setRateLimits] = useState(rateLimiter.getAllLimits());
  const [apiKeys, setApiKeys] = useState(apiKeyManager.getAllKeys());
  const [webhooks, setWebhooks] = useState(webhookManager.getAllWebhooks());
  const [stats, setStats] = useState(apiProxyRouter.getStats());
  const [newKeyName, setNewKeyName] = useState("");
  const [newWebhookName, setNewWebhookName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [selectedWebhook, setSelectedWebhook] = useState<string | null>(null);
  const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false);
  const [showCreateWebhookDialog, setShowCreateWebhookDialog] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoutes(apiProxyRouter.getAllRoutes());
      setStats(apiProxyRouter.getStats());
      setRateLimits(rateLimiter.getAllLimits());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "active":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMethodBadge = (method: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      GET: "default",
      POST: "secondary",
      PUT: "outline",
      DELETE: "destructive"
    };
    return <Badge variant={variants[method] || "default"}>{method}</Badge>;
  };

  const handleTestEndpoint = async (route: unknown: unknown: unknown) => {
    toast({
      title: "Testing Endpoint",
      description: `Testing ${route.service}...`
    });

    try {
      await apiProxyRouter.proxyRequest(route.service, "/test");
      toast({
        title: "Success",
        description: `Endpoint ${route.service} is working correctly`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  });

  const handleCheckStatus = async (route: unknown: unknown: unknown) => {
    const status = await apiProxyRouter.checkEndpointStatus(route.path);
    toast({
      title: "Endpoint Status",
      description: `Status: ${status.status}, Latency: ${status.latency}ms`
    });
  });

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a key name",
        variant: "destructive"
      });
      return;
    }

    const key = apiKeyManager.createKey(newKeyName, ["*"], 365);
    setApiKeys(apiKeyManager.getAllKeys());
    setNewKeyName("");
    setShowCreateKeyDialog(false);
    
    toast({
      title: "API Key Created",
      description: `Key "${key.name}" has been created successfully`
    });
  });

  const handleRevokeKey = (keyId: string) => {
    apiKeyManager.revokeKey(keyId);
    setApiKeys(apiKeyManager.getAllKeys());
    toast({
      title: "Key Revoked",
      description: "API key has been revoked"
    });
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key copied to clipboard"
    });
  });

  const handleCreateWebhook = () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    webhookManager.createWebhook(newWebhookName, newWebhookUrl, ["*"]);
    setWebhooks(webhookManager.getAllWebhooks());
    setNewWebhookName("");
    setNewWebhookUrl("");
    setShowCreateWebhookDialog(false);
    
    toast({
      title: "Webhook Created",
      description: `Webhook "${newWebhookName}" has been created`
    });
  });

  const handleDeleteWebhook = (webhookId: string) => {
    webhookManager.deleteWebhook(webhookId);
    setWebhooks(webhookManager.getAllWebhooks());
    toast({
      title: "Webhook Deleted",
      description: "Webhook has been removed"
    });
  });

  const handleTestWebhook = async (webhookId: string) => {
    toast({
      title: "Testing Webhook",
      description: "Sending test event..."
    });

    await webhookManager.triggerWebhook("test.event", { test: true });
    
    toast({
      title: "Test Complete",
      description: "Check webhook logs for details"
    });
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Server className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">API Gateway</h1>
          <p className="text-muted-foreground">Manage and monitor all API endpoints with routing and rate limiting</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routes.length}</div>
            <p className="text-xs text-muted-foreground">Active endpoints</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgLatency}ms</div>
            <p className="text-xs text-muted-foreground">Response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errorRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">System health</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="routes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Routes</CardTitle>
              <CardDescription>Internal routing for /api/proxy/[service] and /api/status/[endpoint]</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {routes.map((route) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(route.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{route.service}</h3>
                          {getMethodBadge(route.method)}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{route.path}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{route.requestCount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">requests</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{route.avgLatency}ms</div>
                        <div className="text-xs text-muted-foreground">latency</div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlehandleTestEndpoint}
                      >
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlehandleCheckStatus}
                      >
                        Status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Monitoring</CardTitle>
              <CardDescription>Requests per endpoint, latency metrics, and recent errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Active Connections</span>
                    </div>
                    <div className="text-2xl font-bold">{stats.activeConnections}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Request Rate</span>
                    </div>
                    <div className="text-2xl font-bold">{Math.round(stats.totalRequests / 60)}/s</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Updated</span>
                    </div>
                    <div className="text-sm">{stats.timestamp.toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Recent Errors</h3>
                  <div className="space-y-2">
                    {routes.filter(r => r.lastError).map(route => (
                      <div key={route.id} className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{route.service}</p>
                          <p className="text-sm text-muted-foreground">{route.lastError}</p>
                          {route.lastErrorTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {route.lastErrorTime.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {routes.filter(r => r.lastError).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No recent errors</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limits Tab */}
        <TabsContent value="rate-limits">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>Configure request limits per endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rateLimits.map((limit) => (
                  <div key={limit.endpoint} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold font-mono text-sm">{limit.endpoint}</h3>
                      <Badge>{limit.maxRequests} req/{Math.round(limit.windowMs / 1000)}s</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current: {limit.currentCount}</span>
                        <span className="text-muted-foreground">
                          Resets: {new Date(limit.resetAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${(limit.currentCount / limit.maxRequests) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>Create, revoke, and manage API keys</CardDescription>
              </div>
              <Dialog open={showCreateKeyDialog} onOpenChange={setShowCreateKeyDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Generate a new API key for accessing the gateway
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        placeholder="Production API Key"
                        value={newKeyName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateKey}>Create Key</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{key.name}</h3>
                          <Badge variant={key.isActive ? "default" : "secondary"}>
                            {key.isActive ? "Active" : "Revoked"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">
                          {key.key.substring(0, 20)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlehandleCopyKey}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlehandleRevokeKey}
                          disabled={!key.isActive}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Created: {key.createdAt.toLocaleDateString()}</span>
                      <span>Requests: {key.requestCount}</span>
                      {key.expiresAt && (
                        <span>Expires: {key.expiresAt.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Webhook Manager</CardTitle>
                <CardDescription>Send events to external endpoints with logs</CardDescription>
              </div>
              <Dialog open={showCreateWebhookDialog} onOpenChange={setShowCreateWebhookDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Webhook
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Webhook</DialogTitle>
                    <DialogDescription>
                      Add a webhook endpoint to receive events
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhookName">Name</Label>
                      <Input
                        id="webhookName"
                        placeholder="My Webhook"
                        value={newWebhookName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">URL</Label>
                      <Input
                        id="webhookUrl"
                        placeholder="https://example.com/webhook"
                        value={newWebhookUrl}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateWebhook}>Create Webhook</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <WebhookIcon className="h-4 w-4" />
                          <h3 className="font-semibold">{webhook.name}</h3>
                          <Badge variant={webhook.isActive ? "default" : "secondary"}>
                            {webhook.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{webhook.url}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlehandleTestWebhook}
                        >
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlehandleDeleteWebhook}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Success: </span>
                        <span className="font-semibold text-green-600">{webhook.successCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failures: </span>
                        <span className="font-semibold text-red-600">{webhook.failureCount}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last triggered: </span>
                        <span className="font-semibold">
                          {webhook.lastTriggered ? webhook.lastTriggered.toLocaleTimeString() : "Never"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedWebhook && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-semibold mb-3">Recent Webhook Logs</h3>
                  <div className="space-y-2">
                    {webhookManager.getLogs(selectedWebhook, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded text-sm">
                        <div className="flex items-center gap-3">
                          {log.status === "success" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">{log.event}</span>
                          {log.statusCode && (
                            <Badge variant="outline">{log.statusCode}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>{log.responseTime}ms</span>
                          <span>{log.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiGateway;
