/**
 * PEOTRAM Audit Manager - Create, load, resume, and compare audit cycles
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Play, CheckCircle, Clock, FileText, BarChart3,
  Calendar, User, Ship, Loader2, Trash2
} from "lucide-react";
import type { PeotramAuditData } from "@/hooks/usePeotramAudit";
import { PEOTRAM_ELEMENTS } from "@/data/peotram-elements-data";

interface PeotramAuditManagerProps {
  audits: PeotramAuditData[];
  currentAuditId: string | null;
  isLoading: boolean;
  onCreateAudit: (params: { vesselName: string; auditorName: string; auditDate: string; cycle: string }) => void;
  onLoadAudit: (auditId: string) => void;
  isCreating: boolean;
}

export function PeotramAuditManager({
  audits, currentAuditId, isLoading, onCreateAudit, onLoadAudit, isCreating,
}: PeotramAuditManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [vesselName, setVesselName] = useState("");
  const [auditorName, setAuditorName] = useState("");
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split("T")[0]);
  const [cycle, setCycle] = useState("2025");

  const totalItems = PEOTRAM_ELEMENTS.reduce((acc, el) => acc + el.subelements.reduce((a, s) => a + s.items.length, 0), 0);

  const handleCreate = () => {
    if (!vesselName || !auditorName) return;
    onCreateAudit({ vesselName, auditorName, auditDate, cycle });
    setShowCreate(false);
    setVesselName("");
    setAuditorName("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-success text-success-foreground text-[10px]"><CheckCircle className="h-3 w-3 mr-1" />Concluída</Badge>;
      case "in_progress": return <Badge variant="outline" className="text-[10px] border-warning text-warning"><Clock className="h-3 w-3 mr-1" />Em Andamento</Badge>;
      default: return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-warning" /> Gestão de Auditorias PEOTRAM
            </CardTitle>
            <CardDescription>{audits.length} auditorias registradas • {totalItems} itens por auditoria</CardDescription>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="gap-1.5"><Plus className="h-4 w-4" /> Nova Auditoria</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Auditoria PEOTRAM</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Embarcação *</Label>
                  <Input value={vesselName} onChange={e => setVesselName(e.target.value)} placeholder="Ex: MV Atlantic Star" />
                </div>
                <div className="space-y-2">
                  <Label>Auditor Líder *</Label>
                  <Input value={auditorName} onChange={e => setAuditorName(e.target.value)} placeholder="Nome completo" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" value={auditDate} onChange={e => setAuditDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ciclo</Label>
                    <Input value={cycle} onChange={e => setCycle(e.target.value)} placeholder="2025" />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={!vesselName || !auditorName || isCreating} className="w-full gap-2">
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Criar Auditoria ({totalItems} itens)
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : audits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="font-medium">Nenhuma auditoria PEOTRAM</p>
            <p className="text-sm">Crie uma nova auditoria para começar</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2">
              {audits.map(audit => {
                const isActive = audit.id === currentAuditId;
                const progress = audit.total_items > 0 ? Math.round((audit.scored_items / audit.total_items) * 100) : 0;
                return (
                  <div
                    key={audit.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      isActive ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => onLoadAudit(audit.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Ship className="h-4 w-4 text-warning shrink-0" />
                          <span className="font-semibold text-sm truncate">{audit.vessel_name || "Sem nome"}</span>
                          {getStatusBadge(audit.status)}
                          {isActive && <Badge variant="default" className="text-[9px]">ATIVA</Badge>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{audit.auditor_name || "N/A"}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{audit.audit_date}</span>
                          <span>Ciclo {audit.cycle || audit.audit_date?.slice(0, 4)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-lg font-bold ${
                          (audit.final_score || 0) >= 90 ? "text-success" :
                          (audit.final_score || 0) >= 60 ? "text-warning" : "text-destructive"
                        }`}>
                          {audit.final_score || 0}%
                        </div>
                        <p className="text-[10px] text-muted-foreground">{audit.scored_items}/{audit.total_items} itens</p>
                      </div>
                    </div>
                    <Progress value={progress} className="mt-2 h-1.5" />
                    {audit.nc_count > 0 && (
                      <p className="text-[10px] text-destructive mt-1">{audit.nc_count} NCs identificadas</p>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
