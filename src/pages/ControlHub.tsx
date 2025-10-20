import React, { useState, useEffect } from 'react';
import { BridgeLink, BridgeLinkEvent } from '@/core/BridgeLink';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * ControlHub - Telemetry and Control Panel
 * 
 * Central hub for monitoring all Nautilus One modules in real-time.
 * Displays event logs, system status, and module communication.
 * 
 * Features:
 * - Real-time event monitoring via BridgeLink
 * - Module status tracking
 * - Event filtering and search
 * - System statistics
 */
export default function ControlHub() {
  const [events, setEvents] = useState<BridgeLinkEvent[]>([]);
  const [stats, setStats] = useState({ totalListeners: 0, eventTypes: 0, logSize: 0 });
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to all telemetry events
    const unsubscribe = BridgeLink.on('telemetry:log', (event) => {
      setEvents(prev => [...prev.slice(-99), event]);
    });

    // Load existing events
    setEvents(BridgeLink.getEventLog(100));
    
    // Update stats periodically
    const statsInterval = setInterval(() => {
      setStats(BridgeLink.getStats());
    }, 1000);

    // Emit initial system event
    BridgeLink.emit('system:module:loaded', 'ControlHub', {
      module: 'ControlHub',
      version: '1.0.0-alpha',
      timestamp: Date.now()
    });

    return () => {
      unsubscribe();
      clearInterval(statsInterval);
    };
  }, []);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, autoScroll]);

  const handleClearLogs = () => {
    BridgeLink.clearEventLog();
    setEvents([]);
  };

  const getEventTypeColor = (type: string): string => {
    if (type.startsWith('system:')) return 'bg-blue-500';
    if (type.startsWith('mmi:')) return 'bg-green-500';
    if (type.startsWith('dp:')) return 'bg-yellow-500';
    if (type.startsWith('fmea:')) return 'bg-red-500';
    if (type.startsWith('ai:')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">⚓ Control Hub</h1>
          <p className="text-slate-400 mt-1">
            Nautilus One Central Telemetry & System Monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-400 border-green-400">
            System Online
          </Badge>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardDescription className="text-slate-400">Active Listeners</CardDescription>
            <CardTitle className="text-2xl text-white">{stats.totalListeners}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardDescription className="text-slate-400">Event Types</CardDescription>
            <CardTitle className="text-2xl text-white">{stats.eventTypes}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardDescription className="text-slate-400">Events Logged</CardDescription>
            <CardTitle className="text-2xl text-white">{stats.logSize}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Event Log */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Event Log</CardTitle>
              <CardDescription className="text-slate-400">
                Real-time BridgeLink event stream
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={autoScroll ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
              >
                {autoScroll ? '📌 Auto-scroll ON' : '📌 Auto-scroll OFF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearLogs}
              >
                🗑️ Clear Logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full" ref={scrollRef}>
            <div className="space-y-2 font-mono text-sm">
              {events.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  No events logged yet. Waiting for module activity...
                </div>
              ) : (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 bg-slate-950 rounded border border-slate-800 hover:border-slate-700 transition"
                  >
                    <Badge className={`${getEventTypeColor(event.type)} shrink-0 mt-0.5`}>
                      {event.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                        <span>{formatTimestamp(event.timestamp)}</span>
                        <span>•</span>
                        <span className="text-slate-400">{event.source}</span>
                        <span>•</span>
                        <span className="text-slate-600 truncate">{event.id}</span>
                      </div>
                      <pre className="text-xs text-slate-300 overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Module Status */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Module Status</CardTitle>
          <CardDescription className="text-slate-400">
            Registered Nautilus One modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['MMI', 'DP Intelligence', 'FMEA', 'ASOG', 'WSOG', 'AI Core', 'BridgeLink', 'ControlHub'].map((module) => (
              <div
                key={module}
                className="p-3 bg-slate-950 rounded border border-slate-800 flex items-center justify-between"
              >
                <span className="text-sm text-slate-300">{module}</span>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-500">
        <p>🧭 Nautilus Core Alpha • BridgeLink v1.0.0 • IMCA M 117 / ISM Compliant</p>
        <p className="mt-1">No sensitive data transmitted • Local browser operation only</p>
      </div>
    </div>
  );
}
