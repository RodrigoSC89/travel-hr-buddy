// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface IntegrationLog {
  id: string;
  integration_id: string;
  event_type: string;
  status: string;
  error_message?: string;
  created_at: string;
  integrations_registry?: {
    name: string;
    provider: string;
  };
}

export const IntegrationLogs: React.FC = () => {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('integration_logs_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'integration_logs',
        },
        (payload) => {
          setLogs((current) => [payload.new as IntegrationLog, ...current].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('integration_logs')
        .select(`
          *,
          integrations_registry (
            name,
            provider
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      pending: 'bg-yellow-500',
    };

    return (
      <Badge className={variants[status] || 'bg-gray-500'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No logs yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Integration</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(log.status)}
                  {getStatusBadge(log.status)}
                </div>
              </TableCell>
              <TableCell className="font-medium">
                {log.integrations_registry?.name || 'Unknown'}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {log.event_type.replace(/_/g, ' ')}
                </Badge>
              </TableCell>
              <TableCell className="capitalize">
                {log.integrations_registry?.provider || '-'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                {log.error_message || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
