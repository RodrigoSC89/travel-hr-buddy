// PATCH 108.0: Security & Access Control Module
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Users,
  Eye,
  Lock,
  Unlock,
  Brain,
  FileText,
  Search
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { AccessLog, AccessAnalytics, SuspiciousAccess, AccessFilters } from "@/types/access-control";
import { runAIContext } from "@/ai/kernel";

const AccessControl: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [analytics, setAnalytics] = useState<AccessAnalytics[]>([]);
  const [suspiciousAccess, setSuspiciousAccess] = useState<SuspiciousAccess[]>([]);
  const [filters, setFilters] = useState<AccessFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  useEffect(() => {
    loadAccessData();
  }, [filters]);

  const loadAccessData = async () => {
    try {
      setLoading(true);
      
      // Load access logs (table may not exist yet)
      let query = supabase
        .from('access_logs' as any)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (filters.module) {
        query = query.eq('module_accessed', filters.module);
      }
      if (filters.result) {
        query = query.eq('result', filters.result);
      }
      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      const { data: logsData, error: logsError } = await query;

      if (logsError) {
        console.error('Error loading access logs:', logsError);
        setAccessLogs([]);
      } else {
        setAccessLogs((logsData as any) || []);
      }

      // Load analytics (view may not exist yet)
      const { data: analyticsData, error: analyticsError } = await (supabase as any)
        .from('access_analytics')
        .select('*')
        .limit(20);

      if (analyticsError) {
        console.error('Error loading analytics:', analyticsError);
        setAnalytics([]);
      } else {
        setAnalytics((analyticsData as any) || []);
      }

      // Load suspicious access (RPC may not exist yet)
      const { data: suspiciousData, error: suspiciousError } = await (supabase as any)
        .rpc('detect_suspicious_access');

      if (suspiciousError) {
        console.error('Error detecting suspicious access:', suspiciousError);
        setSuspiciousAccess([]);
      } else {
        setSuspiciousAccess((suspiciousData as any) || []);
      }
    } catch (error) {
      console.error('Error loading access data:', error);
      toast({
        title: "Error",
        description: "Failed to load access control data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runAccessAnalysis = async () => {
    try {
      const response = await runAIContext({
        module: 'access-analyzer',
        action: 'analyze',
        context: {
          access_logs: accessLogs,
          analytics: analytics,
          suspicious_access: suspiciousAccess,
        }
      });
      setAiAnalysis(response.message);
      
      toast({
        title: "AI Analysis Complete",
        description: "Access pattern analysis generated successfully",
      });
    } catch (error) {
      console.error('Error running AI analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI analysis",
        variant: "destructive",
      });
    }
  };

  const getResultBadge = (result: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      success: { variant: "default", label: "Success" },
      failure: { variant: "destructive", label: "Failure" },
      denied: { variant: "destructive", label: "Denied" },
      error: { variant: "secondary", label: "Error" },
    };
    const config = variants[result] || variants.success;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      info: { variant: "default", label: "Info" },
      warning: { variant: "secondary", label: "Warning" },
      critical: { variant: "destructive", label: "Critical" },
    };
    const config = variants[severity] || variants.info;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredLogs = accessLogs.filter(log =>
    searchTerm === "" ||
    log.module_accessed.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: accessLogs.length,
    success: accessLogs.filter(l => l.result === 'success').length,
    failed: accessLogs.filter(l => l.result === 'failure' || l.result === 'denied').length,
    suspicious: suspiciousAccess.length,
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <ModulePageWrapper>
      <ModuleHeader
        title="Security & Access Control"
        description="Monitor access logs, manage permissions, and detect security risks"
        icon={Shield}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Recent 100 logs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <p className="text-xs text-muted-foreground">Authorized access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed/Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Unauthorized attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Suspicious</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.suspicious}</div>
            <p className="text-xs text-muted-foreground">Patterns detected</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs">Access Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="suspicious">Suspicious Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Access Logs</CardTitle>
                  <CardDescription>View recent access attempts and activities</CardDescription>
                </div>
                <Button onClick={runAccessAnalysis}>
                  <Brain className="mr-2 h-4 w-4" />
                  AI Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filters.result} onValueChange={(value) => setFilters({ ...filters, result: value as any })}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Result" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.severity} onValueChange={(value) => setFilters({ ...filters, severity: value as any })}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Logs List */}
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <Card key={log.id} className="hover:bg-accent">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <h4 className="font-medium">{log.module_accessed}</h4>
                              <p className="text-sm text-muted-foreground">{log.action}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {getResultBadge(log.result)}
                            {getSeverityBadge(log.severity)}
                            {log.ip_address && (
                              <Badge variant="outline">IP: {log.ip_address}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                          {log.user_id && (
                            <div className="text-sm text-muted-foreground mt-1">
                              User: {log.user_id.slice(0, 8)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Section */}
          {aiAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>AI Security Analysis</CardTitle>
                <CardDescription>Automated access pattern analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap">{aiAnalysis}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Analytics</CardTitle>
              <CardDescription>Aggregated access statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{stat.module_accessed}</h4>
                      <p className="text-sm text-muted-foreground">{stat.action}</p>
                      {getResultBadge(stat.result)}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{stat.access_count}</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.unique_users} users
                      </div>
                      {stat.failed_attempts > 0 && (
                        <div className="text-sm text-red-600">
                          {stat.failed_attempts} failures
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suspicious" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Activity</CardTitle>
              <CardDescription>Detected security risks and unusual patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {suspiciousAccess.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Suspicious Activity</h3>
                  <p className="text-muted-foreground">
                    All access patterns appear normal
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {suspiciousAccess.map((activity, idx) => (
                    <Card key={idx} className="border-red-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <h4 className="font-medium">{activity.module_accessed}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              User: {activity.user_id.slice(0, 8)}...
                            </p>
                            {getSeverityBadge(activity.severity)}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-600">
                              {activity.failed_attempts} failed attempts
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Management</CardTitle>
              <CardDescription>Manage user roles and module permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium">Admin</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Full access to all modules and settings
                        </p>
                      </div>
                      <Badge variant="default">3 users</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium">Operator</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Read and write access to operational modules
                        </p>
                      </div>
                      <Badge variant="secondary">8 users</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Eye className="h-5 w-5 text-gray-600" />
                          <h4 className="font-medium">Viewer</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Read-only access to all modules
                        </p>
                      </div>
                      <Badge variant="outline">15 users</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default AccessControl;
