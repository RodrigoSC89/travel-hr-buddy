/**
 * Crew Certifications Panel - REAL DATA from Supabase: maritime_certificates
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
import { Award, Plus, Search, Calendar, AlertTriangle, CheckCircle2, Edit, Trash2, Download, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateCrewCertification, useDeleteCrewCertification } from "@/hooks/useModuleHooks";
import { differenceInDays } from "date-fns";

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
}

interface CrewCertificationsPanelProps {
  crewMembers: CrewMember[];
}

const certificationTypes = [
  "STCW", "GMDSS", "Basic Safety Training", "Advanced Fire Fighting",
  "Medical First Aid", "Survival Craft", "Security Awareness",
  "Ship Security Officer", "ECDIS", "Bridge Resource Management"
];

export const CrewCertificationsPanel: React.FC<CrewCertificationsPanelProps> = ({ crewMembers }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newCert, setNewCert] = useState({
    crewId: "", type: "", issueDate: "", expiryDate: "", issuer: "", number: ""
  });

  const { data: certifications = [], isLoading } = useQuery({
    queryKey: ["crew-certifications-panel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maritime_certificates")
        .select("*, crew_members(full_name)")
        .order("expiry_date", { ascending: true })
        .limit(100);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Supabase dynamic join response
      return (data || []).map((c: any) => {
        const daysLeft = c.expiry_date ? differenceInDays(new Date(c.expiry_date), new Date()) : 999;
        return {
          id: c.id,
          crewId: c.crew_member_id,
          crewName: c.crew_members?.full_name || "N/A",
          type: c.certificate_type || "N/A",
          issueDate: c.issue_date || "",
          expiryDate: c.expiry_date || "",
          status: daysLeft < 0 ? "expired" as const : daysLeft < 60 ? "expiring" as const : "valid" as const,
          issuer: c.issuing_authority || "",
          number: c.certificate_number || "",
        };
      });
    },
  });

  const createCertMutation = useCreateCrewCertification();
  const deleteCertMutation = useDeleteCrewCertification();

  const handleCreate = () => {
    createCertMutation.mutate({
      crew_member_id: newCert.crewId,
      certificate_type: newCert.type,
      issue_date: newCert.issueDate || new Date().toISOString().split("T")[0],
      expiry_date: newCert.expiryDate || new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
      issuing_authority: newCert.issuer,
      certificate_number: newCert.number,
      status: "active",
    }, {
      onSuccess: () => {
        setShowNewDialog(false);
        setNewCert({ crewId: "", type: "", issueDate: "", expiryDate: "", issuer: "", number: "" });
      },
    });
  };

  const filteredCerts = certifications.filter(cert => {
    const matchesSearch = cert.crewName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" />Gestão de Certificações</CardTitle>
          <CardDescription>Controle de certificações marítimas STCW e outros</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />Exportar</Button>
          <Button size="sm" onClick={() => setShowNewDialog(true)}><Plus className="h-4 w-4 mr-1" />Nova Certificação</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input placeholder="Buscar por tripulante ou certificação..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="valid">Válidas</SelectItem>
              <SelectItem value="expiring">Vencendo</SelectItem>
              <SelectItem value="expired">Vencidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 border rounded-lg text-center">
            <div className="text-2xl font-bold text-success">{certifications.filter(c => c.status === "valid").length}</div>
            <div className="text-sm text-muted-foreground">Válidas</div>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <div className="text-2xl font-bold text-warning">{certifications.filter(c => c.status === "expiring").length}</div>
            <div className="text-sm text-muted-foreground">Vencendo</div>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <div className="text-2xl font-bold text-destructive">{certifications.filter(c => c.status === "expired").length}</div>
            <div className="text-sm text-muted-foreground">Vencidas</div>
          </div>
        </div>

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
                <TableCell>{cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : "N/A"}</TableCell>
                <TableCell>
                  <Badge className={
                    cert.status === "valid" ? "bg-success/10 text-success" :
                    cert.status === "expiring" ? "bg-warning/10 text-warning" :
                    "bg-destructive/10 text-destructive"
                  }>
                    {cert.status === "valid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {cert.status === "expiring" && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {cert.status === "valid" ? "Válida" : cert.status === "expiring" ? "Vencendo" : "Vencida"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => deleteCertMutation.mutate(cert.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Certificação</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Tripulante</Label>
              <Select value={newCert.crewId} onValueChange={(v) => setNewCert(prev => ({ ...prev, crewId: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o tripulante" /></SelectTrigger>
                <SelectContent>{crewMembers.map(crew => (<SelectItem key={crew.id} value={crew.id}>{crew.full_name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo de Certificação</Label>
              <Select value={newCert.type} onValueChange={(v) => setNewCert(prev => ({ ...prev, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>{certificationTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Data Emissão</Label><Input type="date" value={newCert.issueDate} onChange={(e) => setNewCert(prev => ({ ...prev, issueDate: e.target.value }))} /></div>
              <div><Label>Data Validade</Label><Input type="date" value={newCert.expiryDate} onChange={(e) => setNewCert(prev => ({ ...prev, expiryDate: e.target.value }))} /></div>
            </div>
            <div><Label>Emissor</Label><Input placeholder="ANTAQ, DPC, etc." value={newCert.issuer} onChange={(e) => setNewCert(prev => ({ ...prev, issuer: e.target.value }))} /></div>
            <div><Label>Número do Certificado</Label><Input placeholder="Número de registro" value={newCert.number} onChange={(e) => setNewCert(prev => ({ ...prev, number: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancelar</Button>
            <Button onClick={() => handleCreate()} disabled={createCertMutation.isPending}>{createCertMutation.isPending ? "Salvando..." : "Adicionar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
