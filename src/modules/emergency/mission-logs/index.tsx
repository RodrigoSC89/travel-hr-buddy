import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Filter, 
  Calendar,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface MissionLog {
  id: string;
  log_type: 'info' | 'warning' | 'error' | 'critical' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  category: string;
  source_module: string;
  event_timestamp: string;
}

const MissionLogs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('logs');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const logs: MissionLog[] = [
    {
      id: '1',
      log_type: 'info',
      severity: 'low',
      title: 'Navigation system update',
      message: 'GPS coordinates updated successfully',
      category: 'Navigation',
      source_module: 'Navigation Copilot',
      event_timestamp: '2025-10-27T10:30:00Z'
    },
    {
      id: '2',
      log_type: 'warning',
      severity: 'medium',
      title: 'Weather alert received',
      message: 'Approaching storm system detected 50nm ahead',
      category: 'Weather',
      source_module: 'Weather Dashboard',
      event_timestamp: '2025-10-27T10:15:00Z'
    },
    {
      id: '3',
      log_type: 'error',
      severity: 'high',
      title: 'Communication interruption',
      message: 'Satellite communication lost for 2 minutes',
      category: 'Communications',
      source_module: 'Satellite Tracking',
      event_timestamp: '2025-10-27T10:00:00Z'
    },
    {
      id: '4',
      log_type: 'success',
      severity: 'low',
      title: 'Route optimization complete',
      message: 'New route calculated, ETA improved by 3 hours',
      category: 'Navigation',
      source_module: 'Route Planner',
      event_timestamp: '2025-10-27T09:45:00Z'
    },
    {
      id: '5',
      log_type: 'critical',
      severity: 'critical',
      title: 'Emergency beacon activated',
      message: 'Vessel distress signal detected in sector B-12',
      category: 'Emergency',
      source_module: 'Emergency Response',
      event_timestamp: '2025-10-27T09:30:00Z'
    }
  ];

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-700" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const exportLogs = (format: 'csv' | 'json' | 'pdf') => {
    console.log(`Exporting logs as ${format}`);
    // TODO: Implement actual export logic
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = selectedType === 'all' || log.log_type === selectedType;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
    const matchesSearch = searchTerm === '' || 
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSeverity && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mission Logs</h1>
            <p className="text-muted-foreground">Detailed operational log viewer</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportLogs('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportLogs('json')}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => exportLogs('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Info</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.filter(l => l.log_type === 'info').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.filter(l => l.log_type === 'warning').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.filter(l => l.log_type === 'error').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.filter(l => l.log_type === 'critical').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Last 24 hours
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Display */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="logs">Log List</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mission Logs ({filteredLogs.length})</CardTitle>
              <CardDescription>Real-time operational events and system messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No logs found matching your filters
                  </div>
                ) : (
                  filteredLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`w-1 h-full rounded ${getSeverityColor(log.severity)}`} />
                      <div className="flex-shrink-0 mt-1">
                        {getLogIcon(log.log_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-medium">{log.title}</div>
                            <div className="text-sm text-muted-foreground mt-1">{log.message}</div>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline">{log.category}</Badge>
                              <span className="text-xs text-muted-foreground">{log.source_module}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                            <Clock className="h-3 w-3" />
                            {new Date(log.event_timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline View</CardTitle>
              <CardDescription>Visual chronological representation of events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-8 space-y-6">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
                
                {filteredLogs.map((log, index) => (
                  <div key={log.id} className="relative">
                    <div className={`absolute left-[-1.75rem] w-6 h-6 rounded-full ${getSeverityColor(log.severity)} flex items-center justify-center`}>
                      {getLogIcon(log.log_type)}
                    </div>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-medium">{log.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.event_timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">{log.message}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{log.category}</Badge>
                          <Badge variant="outline" className="text-xs">{log.severity}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MissionLogs;
