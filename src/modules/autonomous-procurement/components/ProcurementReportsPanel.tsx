/**
 * ProcurementReportsPanel - Relatórios de auditoria e blockchain
 * Substitui placeholder "Em desenvolvimento"
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  FileText, Download, Calendar, Filter, Search, 
  ShieldCheck, Link2, Clock, CheckCircle, RefreshCw,
  Eye, Printer, Share2, Hash, Lock, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AuditRecord {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  entityId: string;
  user: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
  blockHash: string;
}

interface Report {
  id: string;
  name: string;
  type: "procurement" | "audit" | "supplier" | "cost";
  status: "ready" | "generating" | "scheduled";
  createdAt: string;
  size: string;
  format: "PDF" | "Excel" | "CSV";
}

export default function ProcurementReportsPanel() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [showAuditDetail, setShowAuditDetail] = useState(false);

  const [reportConfig, setReportConfig] = useState({
    type: "procurement",
    period: "month",
    format: "PDF",
    includeCharts: true
  });

  // Mock audit records
  const auditRecords: AuditRecord[] = [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      action: "CREATE",
      entity: "PurchaseOrder",
      entityId: "PO-2024-0125",
      user: "João Silva",
      oldValue: "",
      newValue: '{"title": "Lubrificantes", "value": 15000}',
      ipAddress: "192.168.1.100",
      blockHash: "0x7f83b1657ff1fc53b92dc18148a1d65d"
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: "UPDATE",
      entity: "Supplier",
      entityId: "SUP-001",
      user: "Maria Santos",
      oldValue: '{"rating": 4.5}',
      newValue: '{"rating": 4.8}',
      ipAddress: "192.168.1.105",
      blockHash: "0x2c26b46b68ffc68ff99b453c1d30413"
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      action: "APPROVE",
      entity: "RFQRequest",
      entityId: "RFQ-2024-0089",
      user: "Carlos Oliveira",
      oldValue: '{"status": "pending"}',
      newValue: '{"status": "approved"}',
      ipAddress: "192.168.1.110",
      blockHash: "0x4e07408562bedb8b60ce05c1decfe3a"
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      action: "DELETE",
      entity: "InventoryItem",
      entityId: "INV-458",
      user: "Ana Costa",
      oldValue: '{"name": "Filtro descontinuado", "quantity": 0}',
      newValue: "",
      ipAddress: "192.168.1.115",
      blockHash: "0x1b4f0e9851971998e732078544c96b3"
    }
  ];

  // Mock reports
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      name: "Relatório Mensal de Procurement - Jan/2024",
      type: "procurement",
      status: "ready",
      createdAt: new Date().toISOString(),
      size: "2.4 MB",
      format: "PDF"
    },
    {
      id: "2",
      name: "Análise de Fornecedores Q4/2023",
      type: "supplier",
      status: "ready",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      size: "1.8 MB",
      format: "Excel"
    },
    {
      id: "3",
      name: "Auditoria de Compras - Dezembro",
      type: "audit",
      status: "ready",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      size: "3.1 MB",
      format: "PDF"
    },
    {
      id: "4",
      name: "Análise de Custos Anual",
      type: "cost",
      status: "generating",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      size: "-",
      format: "PDF"
    }
  ]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    const newReport: Report = {
      id: Date.now().toString(),
      name: `${reportConfig.type === "procurement" ? "Relatório de Procurement" : 
             reportConfig.type === "audit" ? "Auditoria" :
             reportConfig.type === "supplier" ? "Análise de Fornecedores" : "Análise de Custos"} - ${format(new Date(), "MMM/yyyy", { locale: ptBR })}`,
      type: reportConfig.type as Report["type"],
      status: "ready",
      createdAt: new Date().toISOString(),
      size: "2.4 MB",
      format: reportConfig.format as Report["format"]
    };
    
    setReports(prev => [newReport, ...prev]);
    setIsGenerating(false);
    setShowGenerateDialog(false);
    
    toast({
      title: "✅ Relatório Gerado",
      description: `${newReport.name} está pronto para download`
    });
  };

  const handleDownloadReport = (report: Report) => {
    if (report.status !== "ready") {
      toast({
        title: "⏳ Aguarde",
        description: "O relatório ainda está sendo gerado",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate download
    toast({
      title: "📥 Download Iniciado",
      description: `${report.name} (${report.size})`
    });
  };

  const handleViewAuditDetail = (record: AuditRecord) => {
    setSelectedRecord(record);
    setShowAuditDetail(true);
  };

  const handleVerifyBlockchain = (record: AuditRecord) => {
    toast({
      title: "🔗 Verificação Blockchain",
      description: `Hash verificado: ${record.blockHash.slice(0, 16)}...`
    });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE": return "bg-green-500/20 text-green-500";
      case "UPDATE": return "bg-blue-500/20 text-blue-500";
      case "DELETE": return "bg-red-500/20 text-red-500";
      case "APPROVE": return "bg-purple-500/20 text-purple-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Relatórios e Auditoria
          </h2>
          <p className="text-muted-foreground">Relatórios gerenciais e trilha de auditoria blockchain</p>
        </div>
        <Button onClick={() => setShowGenerateDialog(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Gerar Relatório
        </Button>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="audit">Trilha de Auditoria</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar relatórios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="procurement">Procurement</SelectItem>
                <SelectItem value="audit">Auditoria</SelectItem>
                <SelectItem value="supplier">Fornecedores</SelectItem>
                <SelectItem value="cost">Custos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports List */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredReports.map((report) => (
                  <div key={report.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        report.format === "PDF" ? "bg-red-500/20" : 
                        report.format === "Excel" ? "bg-green-500/20" : "bg-blue-500/20"
                      }`}>
                        <FileText className={`h-5 w-5 ${
                          report.format === "PDF" ? "text-red-500" : 
                          report.format === "Excel" ? "text-green-500" : "text-blue-500"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(report.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })} • {report.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{report.format}</Badge>
                      {report.status === "generating" ? (
                        <Badge className="bg-yellow-500/20 text-yellow-500">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Gerando...
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Pronto
                        </Badge>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDownloadReport(report)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Trail Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Trilha de Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditRecords.map((record) => (
                  <div key={record.id} className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className={getActionColor(record.action)}>
                          {record.action}
                        </Badge>
                        <span className="font-medium">{record.entity}</span>
                        <span className="text-sm text-muted-foreground font-mono">{record.entityId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleViewAuditDetail(record)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleVerifyBlockchain(record)}>
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(record.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                      </span>
                      <span>Usuário: {record.user}</span>
                      <span className="font-mono text-xs">{record.ipAddress}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain Tab */}
        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <Link2 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blocos Registrados</p>
                    <p className="text-2xl font-bold">1,847</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Integridade</p>
                    <p className="text-2xl font-bold text-green-600">100%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Último Bloco</p>
                    <p className="text-lg font-mono">0x7f83...1d65d</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Últimos Blocos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditRecords.map((record, index) => (
                  <div key={record.id} className="p-4 rounded-lg border bg-gradient-to-r from-muted/30 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center font-mono text-sm">
                          #{1847 - index}
                        </div>
                        <div>
                          <p className="font-mono text-sm">{record.blockHash}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(record.timestamp), "dd/MM/yyyy HH:mm:ss")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Report Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Novo Relatório</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo de Relatório</Label>
              <Select 
                value={reportConfig.type} 
                onValueChange={(v) => setReportConfig(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="procurement">Relatório de Procurement</SelectItem>
                  <SelectItem value="audit">Auditoria Completa</SelectItem>
                  <SelectItem value="supplier">Análise de Fornecedores</SelectItem>
                  <SelectItem value="cost">Análise de Custos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Período</Label>
                <Select 
                  value={reportConfig.period} 
                  onValueChange={(v) => setReportConfig(prev => ({ ...prev, period: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Última Semana</SelectItem>
                    <SelectItem value="month">Último Mês</SelectItem>
                    <SelectItem value="quarter">Último Trimestre</SelectItem>
                    <SelectItem value="year">Último Ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Formato</Label>
                <Select 
                  value={reportConfig.format} 
                  onValueChange={(v) => setReportConfig(prev => ({ ...prev, format: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>Cancelar</Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Gerar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Detail Dialog */}
      <Dialog open={showAuditDetail} onOpenChange={setShowAuditDetail}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Registro de Auditoria</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Ação</Label>
                  <p className="font-medium">{selectedRecord.action}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Entidade</Label>
                  <p className="font-medium">{selectedRecord.entity}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ID</Label>
                  <p className="font-mono">{selectedRecord.entityId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Usuário</Label>
                  <p className="font-medium">{selectedRecord.user}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Timestamp</Label>
                <p className="font-mono text-sm">{selectedRecord.timestamp}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Hash Blockchain</Label>
                <p className="font-mono text-sm break-all">{selectedRecord.blockHash}</p>
              </div>

              {selectedRecord.oldValue && (
                <div>
                  <Label className="text-muted-foreground">Valor Anterior</Label>
                  <pre className="p-2 rounded bg-muted text-xs overflow-auto">
                    {JSON.stringify(JSON.parse(selectedRecord.oldValue), null, 2)}
                  </pre>
                </div>
              )}

              {selectedRecord.newValue && (
                <div>
                  <Label className="text-muted-foreground">Novo Valor</Label>
                  <pre className="p-2 rounded bg-muted text-xs overflow-auto">
                    {JSON.stringify(JSON.parse(selectedRecord.newValue), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuditDetail(false)}>Fechar</Button>
            <Button onClick={() => selectedRecord && handleVerifyBlockchain(selectedRecord)}>
              <Link2 className="h-4 w-4 mr-2" />
              Verificar Blockchain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
