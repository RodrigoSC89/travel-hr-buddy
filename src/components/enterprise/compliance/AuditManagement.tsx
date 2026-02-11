/**
 * Audit Management Component
 * Gestão completa de auditorias com checklists e relatórios
 */

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  ClipboardCheck,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Camera,
  FileText,
  Clock,
  User,
  Ship,
  Calendar,
  MessageSquare
} from "lucide-react";

interface AuditItem {
  id: string;
  code: string;
  description: string;
  category: string;
  status: "pending" | "ok" | "nc" | "observation";
  notes?: string;
  evidence?: string[];
}

interface Audit {
  id: string;
  vesselName: string;
  auditType: string;
  auditor: string;
  startDate: string;
  status: "scheduled" | "in-progress" | "completed";
  progress: number;
  items: AuditItem[];
}

const fallbackAudit: Audit = {
  id: "1",
  vesselName: "MV Atlantic Pioneer",
  auditType: "ISM Internal Audit",
  auditor: "Carlos Silva",
  startDate: "2025-02-05",
  status: "in-progress",
  progress: 45,
  items: [
    {
      id: "1",
      code: "ISM-1.1",
      description: "A empresa deve estabelecer uma política de segurança e proteção ambiental",
      category: "Política de Segurança",
      status: "ok"
    },
    {
      id: "2",
      code: "ISM-1.2",
      description: "A política deve ser comunicada a todos os níveis da organização",
      category: "Política de Segurança",
      status: "ok"
    },
    {
      id: "3",
      code: "ISM-2.1",
      description: "Responsabilidades da Pessoa Designada devem estar documentadas",
      category: "Responsabilidades",
      status: "nc",
      notes: "Documentação desatualizada desde 2024"
    },
    {
      id: "4",
      code: "ISM-3.1",
      description: "Procedimentos de emergência devem estar disponíveis a bordo",
      category: "Procedimentos",
      status: "pending"
    },
    {
      id: "5",
      code: "ISM-3.2",
      description: "Exercícios de emergência devem ser realizados periodicamente",
      category: "Procedimentos",
      status: "pending"
    },
    {
      id: "6",
      code: "ISM-4.1",
      description: "Comandante deve ter autoridade para tomar decisões de segurança",
      category: "Autoridade do Comandante",
      status: "observation",
      notes: "Recomenda-se atualizar matriz de autoridade"
    }
  ]
};

export function AuditManagement() {
  const [audit, setAudit] = useState<Audit>(fallbackAudit);
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);

  const getStatusBadge = (status: AuditItem["status"]) => {
    switch (status) {
      case "ok":
        return <Badge className="bg-success/10 text-success">Conforme</Badge>;
      case "nc":
        return <Badge variant="destructive">Não Conforme</Badge>;
      case "observation":
        return <Badge className="bg-warning/10 text-warning">Observação</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const updateItemStatus = (itemId: string, status: AuditItem["status"]) => {
    setAudit(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, status } : item
      ),
      progress: Math.round(
        (prev.items.filter(i => i.id === itemId ? status !== "pending" : i.status !== "pending").length / prev.items.length) * 100
      )
    }));
  };

  const categorizedItems = audit.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, AuditItem[]>);

  const stats = {
    total: audit.items.length,
    ok: audit.items.filter(i => i.status === "ok").length,
    nc: audit.items.filter(i => i.status === "nc").length,
    observation: audit.items.filter(i => i.status === "observation").length,
    pending: audit.items.filter(i => i.status === "pending").length
  };

  return (
    <div className="space-y-6">
      {/* Audit Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <ClipboardCheck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{audit.auditType}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Ship className="h-4 w-4" />
                    {audit.vesselName}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {audit.auditor}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(audit.startDate).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-2xl font-bold">{audit.progress}%</p>
                <p className="text-sm text-muted-foreground">Concluído</p>
              </div>
              <Badge variant={audit.status === "in-progress" ? "default" : "secondary"}>
                {audit.status === "in-progress" ? "Em Andamento" : "Agendada"}
              </Badge>
            </div>
          </div>
          <Progress value={audit.progress} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total de Itens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-success">{stats.ok}</p>
            <p className="text-xs text-muted-foreground">Conformes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.nc}</p>
            <p className="text-xs text-muted-foreground">Não Conformes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-warning">{stats.observation}</p>
            <p className="text-xs text-muted-foreground">Observações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Checklist by Category */}
      <div className="space-y-4">
        {Object.entries(categorizedItems).map(([category, items]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{category}</span>
                <Badge variant="outline">
                  {items.filter(i => i.status !== "pending").length}/{items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.code}
                      </Badge>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm mt-2">{item.description}</p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant={item.status === "ok" ? "default" : "outline"}
                      className="h-8 w-8 p-0"
                      onClick={() => updateItemStatus(item.id, "ok")}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={item.status === "nc" ? "destructive" : "outline"}
                      className="h-8 w-8 p-0"
                      onClick={() => updateItemStatus(item.id, "nc")}
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Evidência - {item.code}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mt-2">
                              Clique ou arraste para fazer upload
                            </p>
                          </div>
                          <Textarea placeholder="Observações adicionais..." />
                          <Button className="w-full">Salvar Evidência</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => {
          toast.success("Rascunho salvo localmente", { description: "Os dados da auditoria foram salvos na sessão atual." });
        }}>
          <FileText className="h-4 w-4 mr-2" />
          Salvar Rascunho
        </Button>
        <Button onClick={() => { window.history.pushState({}, '', '/compliance?tab=audits'); window.dispatchEvent(new PopStateEvent('popstate')); toast.success("Navegando para Compliance Hub > Auditorias"); }}>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Finalizar Auditoria
        </Button>
      </div>
    </div>
  );
}

export default AuditManagement;
