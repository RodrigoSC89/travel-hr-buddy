import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WatchdogLog {
  id: string;
  error_id: string;
  error_type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  stack_trace?: string;
  context?: any;
  ai_analysis?: any;
  auto_fix_attempted: boolean;
  auto_fix_success?: boolean;
  module_name?: string;
  user_id?: string;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export const useWatchdogLogs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["watchdog-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("watchdog_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as WatchdogLog[];
    },
  });

  const resolveLog = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from("watchdog_logs")
        .update({
          resolved_at: new Date().toISOString(),
          resolution_notes: notes,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchdog-logs"] });
      toast({
        title: "Log resolvido",
        description: "O erro foi marcado como resolvido",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível resolver o log",
        variant: "destructive",
      });
    },
  });

  const stats = {
    total: logs?.length || 0,
    critical: logs?.filter(l => l.severity === "critical" && !l.resolved_at).length || 0,
    high: logs?.filter(l => l.severity === "high" && !l.resolved_at).length || 0,
    resolved: logs?.filter(l => l.resolved_at).length || 0,
    autoFixed: logs?.filter(l => l.auto_fix_success).length || 0,
  };

  return {
    logs,
    isLoading,
    resolveLog: resolveLog.mutate,
    stats,
  };
};
