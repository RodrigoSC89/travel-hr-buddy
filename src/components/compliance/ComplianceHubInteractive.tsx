/**
 * Compliance Hub Interactive - Orchestrator
 * Refactored: dialogs extracted to compliance-hub/ComplianceDialogs
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, FileCheck, AlertTriangle, Calendar, Plus, Search, 
  CheckCircle2, Clock, XCircle, Eye, Download,
  ClipboardList, Award, TrendingUp
} from "lucide-react";
import { NewAuditDialog, NewCertDialog } from "./compliance-hub/ComplianceDialogs";

interface Audit {
  id: string; title: string; type: "ISM" | "ISPS" | "SOLAS" | "MARPOL" | "MLC" | "Internal";
  status: "scheduled" | "in_progress" | "completed" | "failed"; vesselName: string; auditorName: string;
  scheduledDate: string; completedDate?: string; score?: number; findings: number; criticalFindings: number;
}

interface Certificate {
  id: string; name: string; type: string; vesselName: string; issuedDate: string; expiryDate: string;
  status: "valid" | "expiring" | "expired" | "pending_renewal"; issuingAuthority: string;
}

export const ComplianceHubInteractive: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("audits");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [showCertDialog, setShowCertDialog] = useState(false);

  const [audits, setAudits] = useState<Audit[]>([
    { id: "AUD-001", title: "ISM Annual Audit", type: "ISM", status: "scheduled", vesselName: "MV Atlantic Pioneer", auditorName: "John Smith", scheduledDate: "2024-02-15", findings: 0, criticalFindings: 0 },
    { id: "AUD-002", title: "ISPS Verification", type: "ISPS", status: "completed", vesselName: "MV Pacific Voyager", auditorName: "Maria Santos", scheduledDate: "2024-01-20", completedDate: "2024-01-22", score: 92, findings: 3, criticalFindings: 0 },
    { id: "AUD-003", title: "SOLAS Safety Inspection", type: "SOLAS", status: "in_progress", vesselName: "MV Northern Star", auditorName: "Carlos Silva", scheduledDate: "2024-02-01", findings: 5, criticalFindings: 1 }
  ]);

  const [certificates, setCertificates] = useState<Certificate[]>([
    { id: "CERT-001", name: "Safety Management Certificate", type: "SMC", vesselName: "MV Atlantic Pioneer", issuedDate: "2023-03-15", expiryDate: "2024-03-15", status: "expiring", issuingAuthority: "Lloyd's Register" },
    { id: "CERT-002", name: "International Ship Security Certificate", type: "ISSC", vesselName: "MV Pacific Voyager", issuedDate: "2022-06-01", expiryDate: "2027-06-01", status: "valid", issuingAuthority: "DNV GL" },
    { id: "CERT-003", name: "Maritime Labour Certificate", type: "MLC", vesselName: "MV Northern Star", issuedDate: "2023-01-10", expiryDate: "2024-01-10", status: "expired", issuingAuthority: "Bureau Veritas" }
  ]);

  const [newAudit, setNewAudit] = useState({ title: "", type: "ISM" as Audit["type"], vesselName: "", auditorName: "", scheduledDate: "" });
  const [newCert, setNewCert] = useState({ name: "", type: "", vesselName: "", issuedDate: "", expiryDate: "", issuingAuthority: "" });

  const handleCreateAudit = () => {
    if (!newAudit.title || !newAudit.vesselName || !newAudit.scheduledDate) { toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" }); return; }
    const audit: Audit = { id: `AUD-${String(audits.length + 1).padStart(3, "0")}`, ...newAudit, status: "scheduled", findings: 0, criticalFindings: 0 };
    setAudits([audit, ...audits]); setShowAuditDialog(false);
    setNewAudit({ title: "", type: "ISM", vesselName: "", auditorName: "", scheduledDate: "" });
    toast({ title: "Auditoria Criada", description: `${audit.title} agendada com sucesso` });
  };

  const handleStartAudit = (audit: Audit) => { setAudits(audits.map(a => a.id === audit.id ? { ...a, status: "in_progress" as const } : a)); toast({ title: "Auditoria Iniciada", description: `${audit.title} está em andamento` }); };
  const handleCompleteAudit = (audit: Audit) => { const seed = audit.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0); const score = 80 + (seed % 20); setAudits(audits.map(a => a.id === audit.id ? { ...a, status: "completed" as const, completedDate: new Date().toISOString().split("T")[0], score } : a)); toast({ title: "Auditoria Concluída", description: `Score: ${score}%` }); };
  const handleDeleteAudit = (id: string) => { setAudits(audits.filter(a => a.id !== id)); toast({ title: "Auditoria Removida", description: "Registro deletado com sucesso" }); };

  const handleCreateCertificate = () => {
    if (!newCert.name || !newCert.vesselName || !newCert.expiryDate) { toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" }); return; }
    const cert: Certificate = { id: `CERT-${String(certificates.length + 1).padStart(3, "0")}`, ...newCert, status: "valid" };
    setCertificates([cert, ...certificates]); setShowCertDialog(false);
    setNewCert({ name: "", type: "", vesselName: "", issuedDate: "", expiryDate: "", issuingAuthority: "" });
    toast({ title: "Certificado Registrado", description: `${cert.name} adicionado com sucesso` });
  };

  const handleRenewCertificate = (cert: Certificate) => {
    const newExpiry = new Date(); newExpiry.setFullYear(newExpiry.getFullYear() + 5);
    setCertificates(certificates.map(c => c.id === cert.id ? { ...c, status: "valid" as const, issuedDate: new Date().toISOString().split("T")[0], expiryDate: newExpiry.toISOString().split("T")[0] } : c));
    toast({ title: "Certificado Renovado", description: `Válido até ${newExpiry.toLocaleDateString()}` });
  };

  const getStatusBadge = (status: Audit["status"]) => {
    const config = { scheduled: { color: "bg-info/20 text-info", icon: Calendar }, in_progress: { color: "bg-warning/20 text-warning", icon: Clock }, completed: { color: "bg-success/20 text-success", icon: CheckCircle2 }, failed: { color: "bg-destructive/20 text-destructive", icon: XCircle } };
    const { color, icon: Icon } = config[status];
    return <Badge className={`${color} flex items-center gap-1`}><Icon className="h-3 w-3" />{status.replace("_", " ").toUpperCase()}</Badge>;
  };

  const getCertStatusBadge = (status: Certificate["status"]) => {
    const config = { valid: { color: "bg-success/20 text-success", label: "Válido" }, expiring: { color: "bg-warning/20 text-warning", label: "Expirando" }, expired: { color: "bg-destructive/20 text-destructive", label: "Expirado" }, pending_renewal: { color: "bg-warning/20 text-warning", label: "Renovação Pendente" } };
    const { color, label } = config[status];
    return <Badge className={color}>{label}</Badge>;
  };

  const filteredAudits = audits.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.vesselName.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCerts = certificates.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.vesselName.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalAudits = audits.length;
  const completedAudits = audits.filter(a => a.status === "completed").length;
  const avgScore = audits.filter(a => a.score).reduce((sum, a) => sum + (a.score || 0), 0) / (completedAudits || 1);
  const expiringCerts = certificates.filter(c => c.status === "expiring" || c.status === "expired").length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div><h1 className="text-2xl font-bold">Compliance Hub</h1><p className="text-muted-foreground">Gestão de Auditorias e Certificações</p></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Auditorias</p><p className="text-2xl font-bold">{totalAudits}</p></div><ClipboardList className="h-8 w-8 text-info" /></div></CardContent></Card>
        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Score Médio</p><p className="text-2xl font-bold">{avgScore.toFixed(1)}%</p></div><TrendingUp className="h-8 w-8 text-success" /></div></CardContent></Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Certificados</p><p className="text-2xl font-bold">{certificates.length}</p></div><Award className="h-8 w-8 text-accent-foreground" /></div></CardContent></Card>
        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Expirando</p><p className="text-2xl font-bold">{expiringCerts}</p></div><AlertTriangle className="h-8 w-8 text-warning" /></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAuditDialog(true)}><Plus className="h-4 w-4 mr-2" />Nova Auditoria</Button>
            <Button variant="outline" onClick={() => setShowCertDialog(true)}><Plus className="h-4 w-4 mr-2" />Novo Certificado</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="audits"><ClipboardList className="h-4 w-4 mr-2" />Auditorias ({filteredAudits.length})</TabsTrigger>
              <TabsTrigger value="certificates"><Award className="h-4 w-4 mr-2" />Certificados ({filteredCerts.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="audits" className="mt-4">
              <div className="space-y-3">
                {filteredAudits.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg"><FileCheck className="h-5 w-5 text-primary" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{audit.title}</span>
                          <Badge variant="outline">{audit.type}</Badge>
                          {getStatusBadge(audit.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>🚢 {audit.vesselName}</span><span>👤 {audit.auditorName}</span><span>📅 {audit.scheduledDate}</span>
                          {audit.score && <span>📊 Score: {audit.score}%</span>}
                        </div>
                        {audit.findings > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{audit.findings} findings</Badge>
                            {audit.criticalFindings > 0 && <Badge variant="destructive">{audit.criticalFindings} críticos</Badge>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {audit.status === "scheduled" && <Button size="sm" onClick={() => handleStartAudit(audit)}>Iniciar</Button>}
                      {audit.status === "in_progress" && <Button size="sm" onClick={() => handleCompleteAudit(audit)}>Concluir</Button>}
                      <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteAudit(audit.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="certificates" className="mt-4">
              <div className="space-y-3">
                {filteredCerts.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg"><Award className="h-5 w-5 text-primary" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{cert.name}</span>
                          <Badge variant="outline">{cert.type}</Badge>
                          {getCertStatusBadge(cert.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>🚢 {cert.vesselName}</span><span>🏛️ {cert.issuingAuthority}</span><span>📅 Expira: {cert.expiryDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(cert.status === "expiring" || cert.status === "expired") && <Button size="sm" onClick={() => handleRenewCertificate(cert)}>Renovar</Button>}
                      <Button size="sm" variant="ghost"><Download className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <NewAuditDialog open={showAuditDialog} onOpenChange={setShowAuditDialog} newAudit={newAudit} setNewAudit={setNewAudit} onSubmit={handleCreateAudit} />
      <NewCertDialog open={showCertDialog} onOpenChange={setShowCertDialog} newCert={newCert} setNewCert={setNewCert} onSubmit={handleCreateCertificate} />
    </div>
  );
};

export default ComplianceHubInteractive;
