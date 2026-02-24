/**
 * Financial Authority Matrix
 * Approval thresholds per user/role with US$ limits (Gap: AMOS / SpecTec)
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DollarSign, Shield, Edit, Save, RotateCcw, AlertTriangle,
  TrendingUp, CheckCircle2, Clock, Ban, ArrowUpRight, Wallet,
  Receipt, ShoppingCart,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations/motion-variants";

interface AuthorityLevel {
  role: string;
  roleLabel: string;
  purchaseOrder: number;
  requisition: number;
  invoice: number;
  budget: number;
  contractSigning: number;
  emergencySpend: number;
  requiresCountersign: boolean;
  countersignAbove: number;
}

const AUTHORITY_LEVELS: AuthorityLevel[] = [
  { role: "admin", roleLabel: "Diretor / Admin", purchaseOrder: 500000, requisition: 500000, invoice: 500000, budget: 1000000, contractSigning: 1000000, emergencySpend: 100000, requiresCountersign: false, countersignAbove: 0 },
  { role: "hr_manager", roleLabel: "Gerente de RH", purchaseOrder: 50000, requisition: 100000, invoice: 50000, budget: 200000, contractSigning: 100000, emergencySpend: 25000, requiresCountersign: true, countersignAbove: 50000 },
  { role: "manager", roleLabel: "Gerente", purchaseOrder: 25000, requisition: 50000, invoice: 25000, budget: 100000, contractSigning: 50000, emergencySpend: 10000, requiresCountersign: true, countersignAbove: 25000 },
  { role: "coordinator", roleLabel: "Coordenador", purchaseOrder: 10000, requisition: 20000, invoice: 10000, budget: 30000, contractSigning: 0, emergencySpend: 5000, requiresCountersign: true, countersignAbove: 10000 },
  { role: "supervisor", roleLabel: "Supervisor", purchaseOrder: 5000, requisition: 10000, invoice: 5000, budget: 15000, contractSigning: 0, emergencySpend: 2500, requiresCountersign: true, countersignAbove: 5000 },
  { role: "employee", roleLabel: "Colaborador", purchaseOrder: 0, requisition: 2000, invoice: 0, budget: 0, contractSigning: 0, emergencySpend: 0, requiresCountersign: true, countersignAbove: 0 },
];

const PENDING_APPROVALS = [
  { id: "1", type: "PO", description: "Spare parts — Main Engine", amount: 35000, requester: "Carlos Mendes", vessel: "MV Santos", status: "pending", requiredLevel: "manager" },
  { id: "2", type: "REQ", description: "Provisões — Viagem 45", amount: 8500, requester: "Marina Oliveira", vessel: "MV Paranaguá", status: "pending", requiredLevel: "coordinator" },
  { id: "3", type: "INV", description: "Port Agency — Rotterdam", amount: 120000, requester: "Pedro Santos", vessel: "MV Atlantic Star", status: "escalated", requiredLevel: "admin" },
  { id: "4", type: "EMG", description: "Emergency Repair — Crane", amount: 45000, requester: "João Silva", vessel: "AHTS Petrobras I", status: "pending", requiredLevel: "hr_manager" },
];

const formatCurrency = (value: number) => {
  if (value === 0) return "—";
  if (value >= 1000000) return `US$ ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `US$ ${(value / 1000).toFixed(0)}K`;
  return `US$ ${value}`;
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  PO: { label: "Purchase Order", icon: ShoppingCart, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  REQ: { label: "Requisição", icon: Receipt, color: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
  INV: { label: "Invoice", icon: DollarSign, color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  EMG: { label: "Emergência", icon: AlertTriangle, color: "bg-red-500/10 text-red-600 border-red-500/20" },
};

export const FinancialAuthorityMatrix: React.FC = () => {
  const [authorities, setAuthorities] = useState(AUTHORITY_LEVELS);
  const [hasChanges, setHasChanges] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<AuthorityLevel | null>(null);

  const openEdit = (auth: AuthorityLevel) => {
    setEditingRole({ ...auth });
    setShowEditDialog(true);
  };

  const saveEdit = () => {
    if (!editingRole) return;
    setAuthorities(prev => prev.map(a => a.role === editingRole.role ? editingRole : a));
    setHasChanges(true);
    setShowEditDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Pending Financial Approvals */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Pendentes", value: PENDING_APPROVALS.filter(p => p.status === "pending").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-500/5 border-amber-500/20" },
          { label: "Escalados", value: PENDING_APPROVALS.filter(p => p.status === "escalated").length, icon: ArrowUpRight, color: "text-red-600", bg: "bg-red-500/5 border-red-500/20" },
          { label: "Valor Total Pendente", value: formatCurrency(PENDING_APPROVALS.reduce((s, p) => s + p.amount, 0)), icon: Wallet, color: "text-primary", bg: "bg-primary/5 border-primary/20" },
          { label: "Aprovados (30d)", value: "47", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-500/5 border-emerald-500/20" },
        ].map(stat => (
          <Card key={stat.label} className={stat.bg}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aprovações Financeiras Pendentes
          </CardTitle>
          <CardDescription>Itens aguardando aprovação conforme a matriz de autoridade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PENDING_APPROVALS.map(item => {
              const config = TYPE_CONFIG[item.type];
              const TypeIcon = config.icon;
              return (
                <div key={item.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/30 transition-all">
                  <div className={`p-2 rounded-lg ${config.color.split(" ").slice(0, 1).join(" ")}`}>
                    <TypeIcon className={`h-4 w-4 ${config.color.split(" ")[1]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={config.color}>{config.label}</Badge>
                      <span className="text-sm font-medium">{item.description}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>{item.requester}</span>
                      <span>•</span>
                      <span>{item.vessel}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(item.amount)}</p>
                    <p className="text-[10px] text-muted-foreground">Requer: {AUTHORITY_LEVELS.find(a => a.role === item.requiredLevel)?.roleLabel}</p>
                  </div>
                  {item.status === "escalated" && (
                    <Badge variant="destructive" className="text-xs">
                      <ArrowUpRight className="h-3 w-3 mr-1" />Escalado
                    </Badge>
                  )}
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-500/20 hover:bg-red-500/10">
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Authority Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Matriz de Autoridade Financeira
              </CardTitle>
              <CardDescription>Limites de aprovação (US$) por cargo — modelo AMOS / SpecTec</CardDescription>
            </div>
            {hasChanges && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setAuthorities(AUTHORITY_LEVELS); setHasChanges(false); }}>
                  <RotateCcw className="h-4 w-4 mr-1" />Reverter
                </Button>
                <Button size="sm" onClick={() => setHasChanges(false)}>
                  <Save className="h-4 w-4 mr-1" />Salvar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Cargo</TableHead>
                  <TableHead className="text-center">Purchase Order</TableHead>
                  <TableHead className="text-center">Requisição</TableHead>
                  <TableHead className="text-center">Invoice</TableHead>
                  <TableHead className="text-center">Budget</TableHead>
                  <TableHead className="text-center">Contrato</TableHead>
                  <TableHead className="text-center">Emergência</TableHead>
                  <TableHead className="text-center">Contra-Assinatura</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authorities.map(auth => (
                  <TableRow key={auth.role}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{auth.roleLabel}</span>
                      </div>
                    </TableCell>
                    {["purchaseOrder", "requisition", "invoice", "budget", "contractSigning", "emergencySpend"].map(field => (
                      <TableCell key={field} className="text-center">
                        <span className={`text-sm font-mono ${auth[field as keyof AuthorityLevel] === 0 ? "text-muted-foreground" : "font-semibold"}`}>
                          {formatCurrency(auth[field as keyof AuthorityLevel] as number)}
                        </span>
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      {auth.requiresCountersign ? (
                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                          &gt; {formatCurrency(auth.countersignAbove)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Autônomo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(auth)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-muted/50 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong>Contra-assinatura:</strong> Transações acima do limite definido requerem aprovação adicional de um nível hierárquico superior. Transações de emergência seguem limites separados com auditoria automática.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Limites — {editingRole?.roleLabel}</DialogTitle>
            <DialogDescription>Configure os limites de aprovação financeira em US$</DialogDescription>
          </DialogHeader>
          {editingRole && (
            <div className="grid grid-cols-2 gap-4 py-2">
              {[
                { key: "purchaseOrder", label: "Purchase Order" },
                { key: "requisition", label: "Requisição" },
                { key: "invoice", label: "Invoice" },
                { key: "budget", label: "Budget" },
                { key: "contractSigning", label: "Contrato" },
                { key: "emergencySpend", label: "Emergência" },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-sm font-medium">{field.label}</label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={editingRole[field.key as keyof AuthorityLevel] as number}
                      onChange={(e) => setEditingRole({ ...editingRole, [field.key]: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={saveEdit}><Save className="h-4 w-4 mr-1" />Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
