/**
 * Watchdog UI Component
 * PATCH 85.0 - AI Self-Correction Watchdog v2
 * 
 * Provides a UI to monitor and control the watchdog system
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  getWatchdog,
  startWatchdog,
  stopWatchdog,
  type ErrorPattern,
} from '@/lib/dev/watchdog';
import {
  AlertTriangle,
  CheckCircle,
  Play,
  Square,
  RefreshCw,
  FileText,
  XCircle,
} from 'lucide-react';

export function WatchdogUI() {
  const [isActive, setIsActive] = useState(false);
  const [autoFix, setAutoFix] = useState(true);
  const [errorPatterns, setErrorPatterns] = useState<ErrorPattern[]>([]);
  const [prSuggestions, setPRSuggestions] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalErrors: 0,
    errorsByType: {},
    activePatterns: 0,
    interventionCount: 0,
  });

  useEffect(() => {
    // Initial load
    refreshData();

    // Refresh data every 5 seconds when active
    const interval = setInterval(() => {
      if (isActive) {
        refreshData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive]);

  const refreshData = () => {
    const watchdog = getWatchdog();
    setErrorPatterns(watchdog.getErrorPatterns());
    setPRSuggestions(watchdog.getPRSuggestions());
    setLogs(watchdog.getLogs().slice(-20)); // Last 20 logs
    setStats(watchdog.getStats());
  };

  const handleStart = () => {
    startWatchdog({ autoFix });
    setIsActive(true);
    refreshData();
  };

  const handleStop = () => {
    stopWatchdog();
    setIsActive(false);
  };

  const clearPRSuggestions = () => {
    const watchdog = getWatchdog();
    watchdog.clearPRSuggestions();
    refreshData();
  };

  const clearLogs = () => {
    const watchdog = getWatchdog();
    watchdog.clearLogs();
    refreshData();
  };

  const getErrorTypeIcon = (type: ErrorPattern['type']) => {
    switch (type) {
      case 'missing_import':
        return '📦';
      case 'undefined_reference':
        return '❓';
      case 'blank_screen':
        return '⬜';
      case 'logic_failure':
        return '🔧';
      case 'repeated_error':
        return '🔁';
      default:
        return '⚠️';
    }
  };

  const getErrorTypeBadge = (type: ErrorPattern['type']) => {
    const colors: Record<string, string> = {
      missing_import: 'bg-blue-500',
      undefined_reference: 'bg-purple-500',
      blank_screen: 'bg-red-500',
      logic_failure: 'bg-orange-500',
      repeated_error: 'bg-yellow-500',
    };

    return (
      <Badge className={`${colors[type] || 'bg-gray-500'} text-white`}>
        {getErrorTypeIcon(type)} {type.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Watchdog v2</h1>
          <p className="text-muted-foreground">
            PATCH 85.0 - AI Self-Correction & Error Monitoring
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="auto-fix" checked={autoFix} onCheckedChange={setAutoFix} disabled={isActive} />
            <Label htmlFor="auto-fix">Auto-fix</Label>
          </div>
          <Button onClick={isActive ? handleStop : handleStart} variant={isActive ? 'destructive' : 'default'}>
            {isActive ? (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop Watchdog
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Start Watchdog
              </>
            )}
          </Button>
          <Button onClick={refreshData} variant="outline" disabled={!isActive}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isActive ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            Watchdog Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold">{isActive ? 'Active' : 'Inactive'}</div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalErrors}</div>
              <div className="text-sm text-muted-foreground">Total Errors</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.activePatterns}</div>
              <div className="text-sm text-muted-foreground">Active Patterns</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.interventionCount}</div>
              <div className="text-sm text-muted-foreground">Interventions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Active Error Patterns</CardTitle>
          <CardDescription>
            Errors that have been detected and are being monitored
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorPatterns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No active error patterns detected</p>
            </div>
          ) : (
            <div className="space-y-4">
              {errorPatterns.map((pattern, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getErrorTypeBadge(pattern.type)}
                        <Badge variant="outline">Count: {pattern.count}</Badge>
                      </div>
                      <p className="text-sm font-mono text-red-600">{pattern.message}</p>
                    </div>
                  </div>
                  {pattern.suggestedFix && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded">
                      <p className="text-sm font-semibold mb-1">💡 Suggested Fix:</p>
                      <p className="text-sm">{pattern.suggestedFix}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>First seen: {new Date(pattern.firstSeen).toLocaleString()}</span>
                    <span>Last seen: {new Date(pattern.lastSeen).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PR Suggestions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>PR Fix Suggestions</CardTitle>
            <CardDescription>
              Fixes that require manual intervention via Pull Request
            </CardDescription>
          </div>
          {prSuggestions.length > 0 && (
            <Button onClick={clearPRSuggestions} variant="outline" size="sm">
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {prSuggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>No PR suggestions at this time</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prSuggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    {getErrorTypeBadge(suggestion.errorType)}
                    <Badge variant="outline">
                      {suggestion.occurrences} occurrence{suggestion.occurrences > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className="text-sm font-mono text-red-600">{suggestion.message}</p>
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded">
                    <p className="text-sm font-semibold mb-1">🔧 Suggested Fix:</p>
                    <p className="text-sm">{suggestion.suggestedFix}</p>
                  </div>
                  {suggestion.stack && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">
                        Stack trace
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                        {suggestion.stack}
                      </pre>
                    </details>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {new Date(suggestion.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>Last 20 error logs captured by the watchdog</CardDescription>
          </div>
          {logs.length > 0 && (
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No logs yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-3 py-2 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    {getErrorTypeBadge(log.type)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-red-600">{log.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Distribution */}
      {Object.keys(stats.errorsByType).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Error Distribution</CardTitle>
            <CardDescription>Breakdown of errors by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.errorsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getErrorTypeBadge(type as ErrorPattern['type'])}
                  </div>
                  <div className="text-2xl font-bold">{count as number}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
