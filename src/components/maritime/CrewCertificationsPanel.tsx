/**
 * Crew Certifications Panel - Full CRUD for maritime certifications
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Award, Plus, Search, Calendar, AlertTriangle, CheckCircle2, Edit, Trash2, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays } from "date-fns";

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
}

interface Certification {
  id: string;
  crewId: string;
  crewName: string;
  type: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
  issuer: string;
  number: string;
}

interface CrewCertificationsPanelProps {
  crewMembers: CrewMember[];
}

const certificationTypes = [
  "STCW",
  "GMDSS",
  "Basic Safety Training",
  "Advanced Fire Fighting",
  "Medical First Aid",
  "Survival Craft",
  "Security Awareness",
  "Ship Security Officer",
  "ECDIS",
  "Bridge Resource Management"
];

export const CrewCertificationsPanel: React.FC<CrewCertificationsPanelProps> = ({ crewMembers }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  const [newCert, setNewCert] = useState({
    crewId: "",
    type: "",
    issueDate: "",
    expiryDate: "",
    issuer: "",
    number: ""
  });

  // Mock data - in production would come from Supabase
  const [certifications, setCertifications] = useState<Certification[]>(() => 
    crewMembers.slice(0, 5).flatMap(crew => [
      {
        id: `${crew.id}-1`,
        crewId: crew.id,
        crewName: crew.full_name,
        type: "STCW",
        issueDate: "2022-01-15",
        expiryDate: "2027-01-15",
        status: "valid" as const,
        issuer: "ANTAQ",
        number: `STCW-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      },
      {
        id: `${crew.id}-2`,
        crewId: crew.id,
        crewName: crew.full_name,
        type: "Basic Safety Training",
        issueDate: "2023-06-01",
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: "expiring" as const,
        issuer: "Maritime Academy",
        number: `BST-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      }
    ])
  );

  const filteredCerts = certifications.filter(cert => {
    const matchesSearch = cert.crewName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    if (!newCert.crewId || !newCert.type || !newCert.expiryDate) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const crew = crewMembers.find(c => c.id === newCert.crewId);
    const daysUntilExpiry = differenceInDays(new Date(newCert.expiryDate), new Date());
    
    const certification: Certification = {
      id: `cert-${Date.now()}`,
      crewId: newCert.crewId,
      crewName: crew?.full_name || "Unknown",
      type: newCert.type,
      issueDate: newCert.issueDate,
      expiryDate: newCert.expiryDate,
      status: daysUntilExpiry < 0 ? "expired" : daysUntilExpiry < 60 ? "expiring" : "valid",
      issuer: newCert.issuer,
      number: newCert.number
    };

    setCertifications(prev => [...prev, certification]);
    setShowNewDialog(false);
    setNewCert({ crewId: "", type: "", issueDate: "", expiryDate: "", issuer: "", number: "" });
    setIsLoading(false);
    toast({ title: "✅ Certificação adicionada", description: `${certification.type} para ${certification.crewName}` });
  };

  const handleDelete = (id: string) => {
    setCertifications(prev => prev.filter(c => c.id !== id));
    toast({ title: "Certificação removida" });
  };

  const handleRenew = (cert: Certification) => {
    const newExpiryDate = new Date();
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 5);
    
    setCertifications(prev => prev.map(c => 
      c.id === cert.id 
        ? { ...c, expiryDate: newExpiryDate.toISOString().split('T')[0], status: "valid" as const }
        : c
    ));
    toast({ title: "✅ Certificação renovada", description: `${cert.type} válido até ${newExpiryDate.toLocaleDateString()}` });
  };

  const exportCSV = () => {
    const headers = ["Tripulante", "Certificação", "Número", "Emissor", "Validade", "Status"];
    const rows = filteredCerts.map(c => [c.crewName, c.type, c.number, c.issuer, c.expiryDate, c.status]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificacoes-tripulacao-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast({ title: "Exportação concluída" });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Gestão de Certificações
          </CardTitle>
          <CardDescription>Controle de certificações marítimas STCW e outros</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setShowNewDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Certificação
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input 
              placeholder="Buscar por tripulante ou certificação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="valid">Válidas</SelectItem>
              <SelectItem value="expiring">Vencendo</SelectItem>
              <SelectItem value="expired">Vencidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 border rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{certifications.filter(c => c.status === "valid").length}</div>
            <div className="text-sm text-muted-foreground">Válidas</div>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <div className="text-2xl font-bold text-amber-600">{certifications.filter(c => c.status === "expiring").length}</div>
            <div className="text-sm text-muted-foreground">Vencendo</div>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{certifications.filter(c => c.status === "expired").length}</div>
            <div className="text-sm text-muted-foreground">Vencidas</div>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tripulante</TableHead>
              <TableHead>Certificação</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCerts.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-medium">{cert.crewName}</TableCell>
                <TableCell>{cert.type}</TableCell>
                <TableCell className="font-mono text-sm">{cert.number}</TableCell>
                <TableCell>{new Date(cert.expiryDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge className={
                    cert.status === "valid" ? "bg-green-500/10 text-green-600" :
                    cert.status === "expiring" ? "bg-amber-500/10 text-amber-600" :
                    "bg-red-500/10 text-red-600"
                  }>
                    {cert.status === "valid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {cert.status === "expiring" && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {cert.status === "valid" ? "Válida" : cert.status === "expiring" ? "Vencendo" : "Vencida"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {cert.status !== "valid" && (
                      <Button size="sm" variant="outline" onClick={() => handleRenew(cert)}>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Renovar
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(cert.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredCerts.length === 0 && (
          <div className="text-center py-8">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma certificação encontrada</p>
            <Button variant="link" onClick={() => setShowNewDialog(true)}>Adicionar certificação</Button>
          </div>
        )}
      </CardContent>

      {/* New Certification Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Certificação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Tripulante</Label>
              <Select value={newCert.crewId} onValueChange={(v) => setNewCert(prev => ({ ...prev, crewId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tripulante" />
                </SelectTrigger>
                <SelectContent>
                  {crewMembers.map(crew => (
                    <SelectItem key={crew.id} value={crew.id}>{crew.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Certificação</Label>
              <Select value={newCert.type} onValueChange={(v) => setNewCert(prev => ({ ...prev, type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {certificationTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Emissão</Label>
                <Input type="date" value={newCert.issueDate} onChange={(e) => setNewCert(prev => ({ ...prev, issueDate: e.target.value }))} />
              </div>
              <div>
                <Label>Data Validade</Label>
                <Input type="date" value={newCert.expiryDate} onChange={(e) => setNewCert(prev => ({ ...prev, expiryDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Emissor</Label>
              <Input placeholder="ANTAQ, DPC, etc." value={newCert.issuer} onChange={(e) => setNewCert(prev => ({ ...prev, issuer: e.target.value }))} />
            </div>
            <div>
              <Label>Número do Certificado</Label>
              <Input placeholder="Número de registro" value={newCert.number} onChange={(e) => setNewCert(prev => ({ ...prev, number: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
