// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface HistoryEvent {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  status: "success" | "pending" | "error";
  metadata?: any;
}

export function EmployeeHistory() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["employee-history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get employee requests as history events
      const { data: requests, error } = await supabase
        .from("employee_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20) as any;

      if (error) throw error;

      // Transform to history events
      const events: HistoryEvent[] = requests.map((req) => ({
        id: req.id,
        action: `Solicitação de ${req.request_type}`,
        description: req.title,
        timestamp: req.created_at,
        status: req.status === "approved" ? "success" : req.status === "rejected" ? "error" : "pending",
        metadata: req.metadata,
      }));

      return events;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "error":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "success":
      return <Badge variant="default">Concluído</Badge>;
    case "error":
      return <Badge variant="destructive">Erro</Badge>;
    default:
      return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Histórico de Ações</h2>

      {isLoading ? (
        <div className="text-center py-12">Carregando histórico...</div>
      ) : (
        <div className="space-y-4">
          {history?.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="flex items-start gap-4">
                {getStatusIcon(event.status)}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{event.action}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.description}
                      </p>
                    </div>
                    {getStatusBadge(event.status)}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
