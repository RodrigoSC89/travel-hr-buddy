/**
 * PATCH 251 - API Gateway Management Dashboard
 * Enhanced dashboard for API key and quota management with real-time stats
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Key, TrendingUp, Activity, AlertCircle, CheckCircle2, 
  Copy, Trash2, Plus, RefreshCw, BarChart3, Clock,
  Shield, Zap, Globe, Server
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface APIKey {
  id: string;
  name: string;
  key: string;
  scope: string[];
  is_active: boolean;
  request_count: number;
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
}

interface RequestLog {
  id: string;
  endpoint: string;
  method: string;
  status_code?: number;
  response_time?: number;
  created_at: string;
}

interface QuotaStats {
  endpoint: string;
  requests_today: number;
  limit: number;
  percentage: number;
}

const APIGatewayDashboard = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
  const [quotaStats, setQuotaStats] = useState<QuotaStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Form state
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState<string[]>(["*"]);
  const [expiresInDays, setExpiresInDays] = useState("365");

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadAPIKeys(),
        loadRequestLogs(),
        loadQuotaStats()
      ]);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAPIKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error loading API keys:", error);
      return;
    }
    
    setApiKeys(data || []);
  };

  const loadRequestLogs = async () => {
    const { data, error } = await supabase
      .from('api_request_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error("Error loading request logs:", error);
      return;
    }
    
    setRequestLogs(data || []);
  };

  const loadQuotaStats = async () => {
    // Calculate quota usage for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('api_request_logs')
      .select('endpoint')
      .gte('created_at', today.toISOString());
    
    if (error) {
      console.error("Error loading quota stats:", error);
      return;
    }
    
    // Aggregate by endpoint
    const endpointCounts = (data || []).reduce((acc, log) => {
      acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Define limits per endpoint
    const limits: Record<string, number> = {
      '/documents': 1000,
      '/checklists': 500,
      '/weather': 200,
      '/analytics': 300,
      '/graphql': 500,
    };
    
    const stats = Object.entries(endpointCounts).map(([endpoint, count]) => ({
      endpoint,
      requests_today: count,
      limit: limits[endpoint] || 1000,
      percentage: Math.min(100, (count / (limits[endpoint] || 1000)) * 100)
    }));
    
    setQuotaStats(stats.sort((a, b) => b.percentage - a.percentage));
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a key name",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to create API keys",
          variant: "destructive"
        });
        return;
      }

      // Call edge function to create key
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-gateway/api-keys`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newKeyName,
          scope: newKeyScope,
          expires_in_days: parseInt(expiresInDays)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const newKey = await response.json();
      
      toast({
        title: "API Key Created",
        description: (
          <div className="space-y-2">
            <p>Key "{newKey.name}" has been created successfully</p>
            <div className="p-2 bg-muted rounded font-mono text-xs break-all">
              {newKey.key}
            </div>
            <p className="text-xs text-yellow-600">⚠️ Save this key now. It won't be shown again!</p>
          </div>
        ),
      });

      setNewKeyName("");
      setNewKeyScope(["*"]);
      setExpiresInDays("365");
      setShowCreateDialog(false);
      await loadAPIKeys();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create API key",
        variant: "destructive"
      });
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId);
      
      if (error) throw error;
      
      toast({
        title: "Key Revoked",
        description: "API key has been revoked successfully"
      });
      
      await loadAPIKeys();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive"
      });
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId);
      
      if (error) throw error;
      
      toast({
        title: "Key Deleted",
        description: "API key has been permanently deleted"
      });
      
      await loadAPIKeys();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      });
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied",
      description: "API key copied to clipboard"
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">API Gateway Dashboard</h1>
            <p className="text-muted-foreground">Manage API keys, monitor usage, and track quotas</p>
          </div>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys.filter(k => k.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              {apiKeys.length} total keys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Requests Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {quotaStats.reduce((sum, stat) => sum + stat.requests_today, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requestLogs.length > 0 
                ? Math.round(requestLogs.reduce((sum, log) => sum + (log.response_time || 0), 0) / requestLogs.length) 
                : 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Last 50 requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requestLogs.length > 0
                ? Math.round((requestLogs.filter(log => (log.status_code || 0) < 400).length / requestLogs.length) * 100)
                : 100}%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 50 requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="quotas">Quotas</TabsTrigger>
          <TabsTrigger value="logs">Request Logs</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your API Keys</h2>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key for accessing the Nautilus API Gateway
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key-name">Key Name</Label>
                    <Input
                      id="key-name"
                      placeholder="Production API Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scope">Scope</Label>
                    <Select value={newKeyScope[0]} onValueChange={(value) => setNewKeyScope([value])}>
                      <SelectTrigger id="scope">
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="*">Full Access (All endpoints)</SelectItem>
                        <SelectItem value="documents">Documents Only</SelectItem>
                        <SelectItem value="analytics">Analytics Only</SelectItem>
                        <SelectItem value="weather">Weather Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expires">Expires In</Label>
                    <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                      <SelectTrigger id="expires">
                        <SelectValue placeholder="Select expiration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="730">2 years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateKey}>Create Key</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {key.key}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleCopyKey(key.key)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {key.scope.includes('*') ? (
                          <Badge>Full Access</Badge>
                        ) : (
                          <Badge variant="outline">{key.scope.join(', ')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{key.request_count.toLocaleString()} requests</span>
                      </TableCell>
                      <TableCell>
                        {key.is_active ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Revoked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(key.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {key.is_active && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeKey(key.id)}
                            >
                              Revoke
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteKey(key.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {apiKeys.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No API keys yet. Create your first key to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotas Tab */}
        <TabsContent value="quotas" className="space-y-4">
          <h2 className="text-xl font-semibold">Quota Usage</h2>
          
          <div className="grid gap-4">
            {quotaStats.map((stat) => (
              <Card key={stat.endpoint}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{stat.endpoint}</CardTitle>
                    <span className={`text-sm font-semibold ${getStatusColor(stat.percentage)}`}>
                      {stat.requests_today} / {stat.limit}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={stat.percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{stat.percentage.toFixed(1)}% used today</span>
                      <span>{stat.limit - stat.requests_today} remaining</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {quotaStats.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No quota data available yet. Start making API requests to see usage stats.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Request Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Requests</h2>
          
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Response Time</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-sm">{log.endpoint}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.method}</Badge>
                        </TableCell>
                        <TableCell>
                          {log.status_code && (
                            <Badge variant={log.status_code < 400 ? "default" : "destructive"}>
                              {log.status_code}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.response_time ? `${log.response_time}ms` : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(log.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {requestLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No request logs available yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Get started with the Nautilus One API Gateway
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Base URL</h3>
                <code className="block p-3 bg-muted rounded text-sm">
                  {import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-gateway
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Include your API key in the request headers:
                </p>
                <code className="block p-3 bg-muted rounded text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Available Endpoints</h3>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="default">GET</Badge>
                    <code>/graphql</code>
                    <span className="text-muted-foreground">- GraphQL Playground</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">POST</Badge>
                    <code>/graphql</code>
                    <span className="text-muted-foreground">- GraphQL Queries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="default">GET</Badge>
                    <code>/documents</code>
                    <span className="text-muted-foreground">- List documents</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="default">GET</Badge>
                    <code>/weather</code>
                    <span className="text-muted-foreground">- Weather data</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="default">GET</Badge>
                    <code>/status</code>
                    <span className="text-muted-foreground">- API status</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Quick Links</h3>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href="/api-gateway-docs" target="_blank">
                      Full Documentation
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-gateway/graphql`} target="_blank">
                      GraphQL Playground
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIGatewayDashboard;
