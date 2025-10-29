import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, Clock, Zap, Activity } from 'lucide-react';
import { aiLogger } from '@/lib/ai/ai-logger';
import { toast } from 'sonner';

export default function AIAuditDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, [selectedService, selectedStatus]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch logs
      const logsData = await aiLogger.getLogs({
        service: selectedService || undefined,
        status: selectedStatus || undefined,
        limit: 100,
      });
      setLogs(logsData);

      // Fetch metrics
      const metricsData = await aiLogger.getMetrics(selectedService || undefined);
      setMetrics(metricsData);
    } catch (error: any) {
      console.error('Error fetching AI audit data:', error);
      toast.error('Failed to fetch AI audit data');
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Error</Badge>;
      case 'timeout':
        return <Badge className="bg-yellow-500">Timeout</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">AI Audit Dashboard</h1>
        <Button onClick={fetchData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalCalls || 0}</div>
            <p className="text-xs text-muted-foreground">AI interactions logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Successful responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgResponseTime || 0}ms</div>
            <p className="text-xs text-muted-foreground">Average latency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Tokens</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgTokens || 0}</div>
            <p className="text-xs text-muted-foreground">Tokens per request</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Services</SelectItem>
                <SelectItem value="copilot">Copilot</SelectItem>
                <SelectItem value="vault_ai">Vault AI</SelectItem>
                <SelectItem value="dp_intelligence">DP Intelligence</SelectItem>
                <SelectItem value="forecast_engine">Forecast Engine</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="timeout">Timeout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>AI Interaction Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Prompt Length</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No AI logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell className="capitalize">{log.service.replace('_', ' ')}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>{log.response_time_ms ? `${log.response_time_ms}ms` : 'N/A'}</TableCell>
                        <TableCell>{log.tokens_used || 'N/A'}</TableCell>
                        <TableCell className="text-xs">{log.model || 'N/A'}</TableCell>
                        <TableCell>{log.prompt_length || 0} chars</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <div className="font-medium">Copilot</div>
                <div className="text-sm text-gray-600">Main AI assistant</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{metrics?.successRate || 0}%</div>
                <div className="text-sm text-gray-600">success rate</div>
              </div>
            </div>
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <div className="font-medium">Forecast Engine</div>
                <div className="text-sm text-gray-600">Predictive analytics</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{metrics?.avgResponseTime || 0}ms</div>
                <div className="text-sm text-gray-600">avg response</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">DP Intelligence</div>
                <div className="text-sm text-gray-600">Dynamic positioning AI</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{metrics?.avgTokens || 0}</div>
                <div className="text-sm text-gray-600">avg tokens</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
