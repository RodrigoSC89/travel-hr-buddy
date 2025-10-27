import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, CheckCircle, XCircle, Clock } from "lucide-react";

interface StatusLog {
  id: string;
  channel_id: string;
  status: "online" | "offline" | "error";
  message: string;
  timestamp: string;
}

interface ChannelStatusLogProps {
  channelId: string;
}

export function ChannelStatusLog({ channelId }: ChannelStatusLogProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["channel-status-logs", channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_status_log")
        .select("*")
        .eq("channel_id", channelId)
        .order("timestamp", { ascending: false })
        .limit(50) as any;

      if (error) throw error;
      return (data || []) as StatusLog[];
    },
    enabled: !!channelId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "offline":
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge variant="default">Online</Badge>;
      case "offline":
        return <Badge variant="secondary">Offline</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5" />
        <h3 className="font-semibold">Status Log</h3>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Carregando logs...
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {logs?.map((log) => (
              <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                {getStatusIcon(log.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{log.message}</p>
                    {getStatusBadge(log.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {logs?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum log encontrado
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
