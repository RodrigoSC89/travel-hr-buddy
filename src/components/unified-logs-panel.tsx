import { memo, memo, useEffect, useMemo, useState } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, FileText, AlertCircle, Info, AlertTriangle, XCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { usePDFExport } from "@/hooks/use-pdf-export";

interface LogEntry {
  id: string;
  message: string;
  level: string;
  source: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export const UnifiedLogsPanel = memo(function() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getJsPDF, getAutoTable } = usePDFExport();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    if (!user) return;
    loadLogs();
  }, [user]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const allLogs: LogEntry[] = [];

      // Fetch access logs
      const { data: accessLogs, error: accessError } = await supabase
        .from("access_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (accessError) throw accessError;

      if (accessLogs) {
        allLogs.push(
          ...accessLogs.map((log) => ({
            id: log.id,
            message: `User ${log.user_id} accessed ${log.module_accessed}`,
            level: "info",
            source: "access",
            timestamp: log.created_at,
            metadata: log,
          }))
        );
      }

      // Fetch system logs only (assistant_logs table doesn't exist in current schema)
      // We'll skip assistant logs for now

      // Fetch system logs
      const { data: systemLogs, error: systemError } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (systemError) throw systemError;

      if (systemLogs) {
        allLogs.push(
          ...systemLogs.map((log) => ({
            id: log.id,
            message: log.message || "System event",
            level: log.level || "info",
            source: "system",
            timestamp: log.created_at,
            metadata: log,
          }))
        );
      }

      // Sort by timestamp
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setLogs(allLogs);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar os logs do sistema",
        variant: "destructive",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Source filter
      if (sourceFilter !== "all" && log.source !== sourceFilter) {
        return false;
      }

      // Severity filter
      if (severityFilter !== "all" && log.level !== severityFilter) {
        return false;
      }

      // Search term
      if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Date range filter
      const logDate = new Date(log.timestamp);
      if (startDate && logDate < startDate) {
        return false;
      }
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (logDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [logs, sourceFilter, severityFilter, searchTerm, startDate, endDate]);

  const statistics = useMemo(() => {
    const stats = {
      total: logs.length,
      bySource: {
        access: logs.filter((l) => l.source === "access").length,
        assistant: logs.filter((l) => l.source === "assistant").length,
        system: logs.filter((l) => l.source === "system").length,
      },
      bySeverity: {
        info: logs.filter((l) => l.level === "info").length,
        warning: logs.filter((l) => l.level === "warning").length,
        error: logs.filter((l) => l.level === "error").length,
        critical: logs.filter((l) => l.level === "critical").length,
      },
    };
    return stats;
  }, [logs]);

  const getSeverityIcon = (level: string) => {
    switch (level) {
    case "critical":
    case "error":
      return <XCircle className="w-4 h-4" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
    case "critical":
      return "destructive";
    case "error":
      return "destructive";
    case "warning":
      return "warning";
    default:
      return "secondary";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
    case "access":
      return "blue";
    case "assistant":
      return "purple";
    case "system":
      return "green";
    default:
      return "gray";
    }
  };

  const exportToCSV = () => {
    const csv = [
      ["Timestamp", "Source", "Level", "Message"],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString("pt-BR"),
        log.source,
        log.level,
        log.message.replace(/,/g, ";"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unified-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exportado",
      description: "O arquivo foi baixado com sucesso",
    };
  };

  const exportToPDF = async () => {
    const jsPDF = await getJsPDF();
    const autoTable = await getAutoTable();
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Unified System Logs", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString("pt-BR")}`, 14, 30);
    doc.text(`Total Logs: ${filteredLogs.length}`, 14, 36);

    // Statistics
    doc.setFontSize(14);
    doc.text("Statistics", 14, 50);
    autoTable(doc, {
      startY: 55,
      head: [["Category", "Count"]],
      body: [
        ["Access Logs", statistics.bySource.access.toString()],
        ["Assistant Logs", statistics.bySource.assistant.toString()],
        ["System Logs", statistics.bySource.system.toString()],
        ["Info", statistics.bySeverity.info.toString()],
        ["Warning", statistics.bySeverity.warning.toString()],
        ["Error", statistics.bySeverity.error.toString()],
        ["Critical", statistics.bySeverity.critical.toString()],
      ],
    });

    // Logs table
    const finalY = (doc as unknown).lastAutoTable?.finalY || 100;
    doc.setFontSize(14);
    doc.text("Log Entries", 14, finalY + 10);
    autoTable(doc, {
      startY: finalY + 15,
      head: [["Time", "Source", "Level", "Message"]],
      body: filteredLogs.slice(0, 50).map((log) => [
        new Date(log.timestamp).toLocaleString("pt-BR", { 
          month: "2-digit", 
          day: "2-digit", 
          hour: "2-digit", 
          minute: "2-digit" 
        }),
        log.source,
        log.level,
        log.message.substring(0, 100),
      ]),
      styles: { fontSize: 8 },
    });

    doc.save(`unified-logs-${Date.now()}.pdf`);

    toast({
      title: "PDF exportado",
      description: "O arquivo foi baixado com sucesso",
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Carregando logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{statistics.total}</div>
            <div className="text-xs text-muted-foreground">Total de Logs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{statistics.bySource.access}</div>
            <div className="text-xs text-muted-foreground">Access Logs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{statistics.bySource.assistant}</div>
            <div className="text-xs text-muted-foreground">Assistant Logs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{statistics.bySource.system}</div>
            <div className="text-xs text-muted-foreground">System Logs</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Logs Panel */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Unified Logs Panel
              </CardTitle>
              <CardDescription>
                Logs consolidados de access_logs, assistant_logs e logs do sistema
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nos logs..."
                value={searchTerm}
                onChange={handleChange}
                className="pl-8"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Fontes</SelectItem>
                <SelectItem value="access">Access Logs</SelectItem>
                <SelectItem value="assistant">Assistant Logs</SelectItem>
                <SelectItem value="system">System Logs</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Data início"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Data fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Logs List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getSeverityIcon(log.level)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityColor(log.level) as unknown}>
                            {log.level}
                          </Badge>
                          <Badge variant="outline" className={`text-${getSourceColor(log.source)}-600`}>
                            {log.source}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-sm break-words">{log.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Nenhum log encontrado com os filtros selecionados
              </div>
            )}
          </div>

          {filteredLogs.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Mostrando {filteredLogs.length} de {logs.length} logs
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
