import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Mail, RefreshCw, Filter } from "lucide-react";

interface EmailLog {
  id: string;
  sent_at: string;
  status: string;
  message: string;
  recipient_email: string;
  error_details: string | null;
  report_type: string;
}

export default function EmailLogsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["email-logs", statusFilter, startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("report_email_logs")
        .select("*")
        .order("sent_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (startDate) {
        query = query.gte("sent_at", startDate);
      }

      if (endDate) {
        query = query.lte("sent_at", endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching email logs:", error);
        throw error;
      }

      return data as EmailLog[];
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
    case "success":
      return "default";
    case "error":
      return "destructive";
    default:
      return "secondary";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Report Logs</h1>
          <p className="text-muted-foreground mt-2">
            Audit trail of all email reports sent by the system
          </p>
        </div>
        <Button onClick={() => refetch()} size="sm" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Update
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter email logs by status and date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Logs</h2>
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading logs...</p>
            </CardContent>
          </Card>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Mail className="h-5 w-5 mt-1 text-muted-foreground" />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(log.status)}>
                            {log.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(log.sent_at), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                        <p className="font-medium">{log.message}</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            <strong>Recipient:</strong> {log.recipient_email}
                          </p>
                          <p>
                            <strong>Report Type:</strong> {log.report_type}
                          </p>
                          {log.error_details && (
                            <p className="text-destructive">
                              <strong>Error:</strong> {log.error_details}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No logs found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
