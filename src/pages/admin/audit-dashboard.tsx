import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Download, Filter, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface AccessLog {
  id: string;
  user_id: string | null;
  module_accessed: string;
  timestamp: string;
  action: string;
  result: string;
  ip_address: string | null;
  user_agent: string | null;
  severity: string;
  details: Json;
}

export default function AuditDashboard() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    user_id: "",
    ip_address: "",
    module_accessed: "",
    result: "",
    severity: "",
  });

  const pageSize = 50;

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  async function fetchLogs() {
    setLoading(true);
    try {
      let query = supabase
        .from("access_logs")
        .select("*", { count: "exact" })
        .order("timestamp", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (filters.user_id) query = query.eq("user_id", filters.user_id);
      if (filters.ip_address) query = query.eq("ip_address", filters.ip_address);
      if (filters.module_accessed) query = query.ilike("module_accessed", `%${filters.module_accessed}%`);
      if (filters.result) query = query.eq("result", filters.result);
      if (filters.severity) query = query.eq("severity", filters.severity);

      const { data, error, count } = await query;

      if (error) throw error;

      setLogs((data || []) as AccessLog[]);
      if (count) {
        setTotalPages(Math.ceil(count / pageSize));
      }
    } catch (error: unknown) {
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  }

  async function exportToCSV() {
    try {
      let query = supabase
        .from("access_logs")
        .select("*")
        .order("timestamp", { ascending: false });

      if (filters.user_id) query = query.eq("user_id", filters.user_id);
      if (filters.ip_address) query = query.eq("ip_address", filters.ip_address);
      if (filters.module_accessed) query = query.ilike("module_accessed", `%${filters.module_accessed}%`);
      if (filters.result) query = query.eq("result", filters.result);
      if (filters.severity) query = query.eq("severity", filters.severity);

      const { data, error } = await query;
      if (error) throw error;

      const csvContent = [
        ["ID", "User ID", "Module", "Timestamp", "Action", "Result", "IP Address", "Severity"].join(","),
        ...(data || []).map(log =>
          [
            log.id,
            log.user_id || "N/A",
            log.module_accessed,
            new Date(log.timestamp).toISOString(),
            log.action,
            log.result,
            log.ip_address || "N/A",
            log.severity,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Logs exported successfully");
    } catch (error: unknown) {
      toast.error("Failed to export logs");
    }
  }

  function handleFilterChange(key: string, value: string) {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters({
      user_id: "",
      ip_address: "",
      module_accessed: "",
      result: "",
      severity: "",
    });
    setPage(1);
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
    case "critical":
      return "text-destructive bg-destructive/10";
    case "warning":
      return "text-warning bg-warning/10";
    default:
      return "text-primary bg-primary/10";
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
    case "success":
      return "text-success bg-success/10";
    case "failure":
    case "error":
      return "text-destructive bg-destructive/10";
    case "denied":
      return "text-warning bg-warning/10";
    default:
      return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={fetchLogs} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input placeholder="User ID" value={filters.user_id} onChange={(e) => handleFilterChange("user_id", e.target.value)} />
            <Input placeholder="IP Address" value={filters.ip_address} onChange={(e) => handleFilterChange("ip_address", e.target.value)} />
            <Input placeholder="Module/Route" value={filters.module_accessed} onChange={(e) => handleFilterChange("module_accessed", e.target.value)} />
            <Select value={filters.result || "all"} onValueChange={(value) => handleFilterChange("result", value === "all" ? "" : value)}>
              <SelectTrigger><SelectValue placeholder="Result" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.severity || "all"} onValueChange={(value) => handleFilterChange("severity", value === "all" ? "" : value)}>
              <SelectTrigger><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={clearFilters} variant="outline" className="mt-4">Clear Filters</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.user_id ? log.user_id.slice(0, 8) : "N/A"}
                          </TableCell>
                          <TableCell>{log.module_accessed}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getResultColor(log.result)}`}>
                              {log.result}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{log.ip_address || "N/A"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(log.severity)}`}>
                              {log.severity}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline">Previous</Button>
                  <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} variant="outline">Next</Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-start gap-4 border-l-2 border-border pl-4 py-2">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${getResultColor(log.result)}`} />
                </div>
                <div className="flex-grow">
                  <div className="font-medium">{log.module_accessed}</div>
                  <div className="text-sm text-muted-foreground">{log.action}</div>
                  <div className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(log.severity)}`}>
                    {log.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}