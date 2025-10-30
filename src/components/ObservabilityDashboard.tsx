/**
 * Observability Dashboard Component
 * Real-time system health monitoring with metrics visualization
 * Uses React + Recharts + Zustand
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Cpu, 
  Database, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Radio
} from 'lucide-react';

// Mock data generator (to be replaced with real data)
const generateMockMemoryData = () => {
  const now = Date.now();
  return Array.from({ length: 20 }, (_, i) => ({
    time: new Date(now - (19 - i) * 30000).toLocaleTimeString(),
    usage: Math.random() * 40 + 30, // 30-70%
  }));
};

const generateMockMQTTData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${i}:00`,
    connections: Math.floor(Math.random() * 50) + 10,
  }));
};

interface ModuleStatus {
  name: string;
  status: 'ok' | 'warning' | 'error';
  uptime: string;
  lastCheck: string;
}

const mockModules: ModuleStatus[] = [
  { name: 'Mission Engine', status: 'ok', uptime: '99.8%', lastCheck: '2s ago' },
  { name: 'Drone Commander', status: 'ok', uptime: '99.5%', lastCheck: '5s ago' },
  { name: 'Supabase DB', status: 'ok', uptime: '100%', lastCheck: '1s ago' },
  { name: 'WebSocket Server', status: 'warning', uptime: '98.2%', lastCheck: '10s ago' },
  { name: 'MQTT Broker', status: 'ok', uptime: '99.9%', lastCheck: '3s ago' },
  { name: 'Analytics Engine', status: 'ok', uptime: '99.7%', lastCheck: '4s ago' },
];

const ObservabilityDashboard: React.FC = () => {
  const [memoryData, setMemoryData] = useState(generateMockMemoryData());
  const [mqttData, setMqttData] = useState(generateMockMQTTData());
  const [cpuUsage, setCpuUsage] = useState(45);
  const [wsStatus, setWsStatus] = useState<'online' | 'offline'>('online');
  const [modules, setModules] = useState<ModuleStatus[]>(mockModules);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update memory data
      setMemoryData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: new Date().toLocaleTimeString(),
          usage: Math.random() * 40 + 30,
        });
        return newData;
      });

      // Update CPU usage
      setCpuUsage(Math.random() * 60 + 20);

      // Simulate WebSocket status changes
      if (Math.random() > 0.95) {
        setWsStatus(prev => prev === 'online' ? 'offline' : 'online');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: ModuleStatus['status']) => {
    switch (status) {
      case 'ok': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: ModuleStatus['status']) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
    }
  };

  const getCPUColor = (usage: number) => {
    if (usage < 50) return '#22c55e'; // green
    if (usage < 75) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Observability Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time system health monitoring</p>
        </div>
        <Badge variant={wsStatus === 'online' ? 'default' : 'destructive'} className="text-sm">
          {wsStatus === 'online' ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
          WebSocket {wsStatus}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Memory Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Memory Usage
            </CardTitle>
            <CardDescription>Heap memory usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={memoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={false}
                  name="Memory (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* CPU Usage Gauge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              CPU Usage
            </CardTitle>
            <CardDescription>Backend CPU utilization</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center" style={{ height: 250 }}>
            <div className="relative">
              {/* Simple gauge representation */}
              <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center relative overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 right-0 transition-all duration-1000"
                  style={{ 
                    height: `${cpuUsage}%`, 
                    backgroundColor: getCPUColor(cpuUsage),
                    opacity: 0.7
                  }}
                />
                <div className="relative z-10 text-center">
                  <div className="text-4xl font-bold">{Math.round(cpuUsage)}%</div>
                  <div className="text-sm text-gray-600">CPU</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WebSocket Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              WebSocket Status
            </CardTitle>
            <CardDescription>Real-time connection monitoring</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center" style={{ height: 250 }}>
            <div className="text-center">
              <div className={`w-32 h-32 rounded-full ${wsStatus === 'online' ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center mb-4`}>
                {wsStatus === 'online' ? (
                  <Wifi className="w-16 h-16 text-green-600" />
                ) : (
                  <WifiOff className="w-16 h-16 text-red-600" />
                )}
              </div>
              <Badge variant={wsStatus === 'online' ? 'default' : 'destructive'} className="text-lg px-4 py-2">
                {wsStatus.toUpperCase()}
              </Badge>
              {wsStatus === 'online' && (
                <p className="text-sm text-gray-600 mt-2">Latency: ~45ms</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* MQTT Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5" />
              MQTT Connections
            </CardTitle>
            <CardDescription>Messages per second by time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mqttData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="connections" fill="#3b82f6" name="Connections">
                  {mqttData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Module Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Module Health Status
          </CardTitle>
          <CardDescription>Status of all system modules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <div
                key={module.name}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{module.name}</h3>
                  <Badge 
                    variant={module.status === 'ok' ? 'default' : module.status === 'warning' ? 'secondary' : 'destructive'}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(module.status)}
                    {module.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Uptime:</span>
                    <span className="font-medium">{module.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Check:</span>
                    <span className="font-medium">{module.lastCheck}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {modules.filter(m => m.status === 'ok').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Modules OK</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {modules.filter(m => m.status === 'warning').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Warnings</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {modules.filter(m => m.status === 'error').length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Errors</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Math.round((modules.filter(m => m.status === 'ok').length / modules.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">Health Score</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ObservabilityDashboard;
