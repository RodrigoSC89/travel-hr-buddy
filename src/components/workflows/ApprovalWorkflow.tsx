/**
 * Universal Approval Workflow Engine
 * Multi-level approval system for POs, Travel, Expenses, Leave
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, Clock, AlertTriangle, FileText,
  User, DollarSign, Ship, ChevronRight, MessageSquare
} from "lucide-react";

interface ApprovalItem {
  id: string;
  type: "purchase_order" | "travel" | "expense" | "leave" | "maintenance";
  title: string;
  description: string;
  requester: string;
  amount?: number;
  status: "pending" | "approved" | "rejected" | "escalated";
  priority: "low" | "medium" | "high" | "critical";
  created_at: string;
  approval_level: number;
  current_approver?: string;
  comments?: string;
}

const TYPE_CONFIG = {
  purchase_order: { icon: <FileText className="h-4 w-4" />, label: "Ordem de Compra", color: "bg-primary" },
  travel: { icon: <Ship className="h-4 w-4" />, label: "Viagem", color: "bg-accent" },
  expense: { icon: <DollarSign className="h-4 w-4" />, label: "Despesa", color: "bg-success" },
  leave: { icon: <User className="h-4 w-4" />, label: "Licença", color: "bg-warning" },
  maintenance: { icon: <AlertTriangle className="h-4 w-4" />, label: "Manutenção", color: "bg-destructive" },
};

const APPROVAL_THRESHOLDS = [
  { level: 1, label: "Supervisor", maxValue: 5000 },
  { level: 2, label: "Coordenador", maxValue: 50000 },
  { level: 3, label: "Gerente", maxValue: 200000 },
  { level: 4, label: "Diretor", maxValue: Infinity },
];

function getApprovalLevel(amount: number): number {
  for (const t of APPROVAL_THRESHOLDS) {
    if (amount <= t.maxValue) return t.level;
  }
  return 4;
}

export default function ApprovalWorkflow() {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [actionDialog, setActionDialog] = useState<"approve" | "reject" | null>(null);
  const [comments, setComments] = useState("");

  // Fetch action items as approval requests
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ["approval-workflow"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("action_items")
        .select("*")
        .in("status", ["pending", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map((item): ApprovalItem => {
        const source = String(item.source_module || "purchase_order");
        const type = (["purchase_order", "travel", "expense", "leave", "maintenance"].includes(source) ? source : "purchase_order") as ApprovalItem["type"];
        const amount = Math.abs(Number(item.description?.match(/\$[\d,.]+/)?.[0]?.replace(/[$,]/g, "")) || 0);
        
        return {
          id: item.id,
          type,
          title: item.title,
          description: item.description || "",
          requester: item.assigned_to_name || "Sistema",
          amount,
          status: item.status === "pending" ? "pending" : "pending",
          priority: (item.priority as ApprovalItem["priority"]) || "medium",
          created_at: item.created_at || new Date().toISOString(),
          approval_level: getApprovalLevel(amount),
          current_approver: item.assigned_to_name || undefined,
          comments: undefined,
        };
      });
    },
    staleTime: 15000,
  });

  // Approve/Reject mutation
  const actionMutation = useMutation({
    mutationFn: async ({ id, action, comment }: { id: string; action: "approve" | "reject"; comment: string }) => {
      const newStatus = action === "approve" ? "completed" : "cancelled";
      const { error } = await supabase
        .from("action_items")
        .update({
          status: newStatus,
          completion_date: new Date().toISOString(),
          comments: [{ action, comment, timestamp: new Date().toISOString() }] as unknown as null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.action === "approve" ? "Aprovado com sucesso" : "Rejeitado");
      queryClient.invalidateQueries({ queryKey: ["approval-workflow"] });
      setActionDialog(null);
      setSelectedItem(null);
      setComments("");
    },
    onError: () => toast.error("Falha ao processar ação"),
  });

  const pendingCount = approvals.filter(a => a.status === "pending").length;
  const criticalCount = approvals.filter(a => a.priority === "critical" || a.priority === "high").length;

  const handleAction = (action: "approve" | "reject") => {
    if (!selectedItem) return;
    actionMutation.mutate({ id: selectedItem.id, action, comment: comments });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow de Aprovações</h3>
          <p className="text-xs text-muted-foreground">{pendingCount} pendente(s) • {criticalCount} prioridade alta</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> {pendingCount}</Badge>
          {criticalCount > 0 && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> {criticalCount}</Badge>}
        </div>
      </div>

      {/* Approval Levels Visual */}
      <Card className="border-border/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {APPROVAL_THRESHOLDS.map((t, i) => (
              <div key={t.level} className="flex items-center gap-1 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  L{t.level}
                </div>
                <div>
                  <p className="text-xs font-medium">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground">{t.maxValue === Infinity ? ">$200K" : `<$${(t.maxValue / 1000).toFixed(0)}K`}</p>
                </div>
                {i < APPROVAL_THRESHOLDS.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground mx-1" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendentes ({pendingCount})</TabsTrigger>
          <TabsTrigger value="all">Todos ({approvals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-2 mt-3">
          <AnimatePresence>
            {approvals.filter(a => a.status === "pending").map((item, i) => {
              const config = TYPE_CONFIG[item.type];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-border/50" onClick={() => setSelectedItem(item)}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${config.color}/10`}>{config.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <Badge variant={item.priority === "critical" ? "destructive" : item.priority === "high" ? "default" : "secondary"} className="text-[10px] shrink-0">
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-muted-foreground">{config.label}</span>
                            <span className="text-[10px] text-muted-foreground">Por: {item.requester}</span>
                            {(item.amount ?? 0) > 0 && <span className="text-xs font-medium text-primary">${(item.amount ?? 0).toLocaleString()}</span>}
                            <Badge variant="outline" className="text-[10px]">Nível {item.approval_level}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-success hover:text-success/80" onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setActionDialog("approve"); }}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive/80" onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setActionDialog("reject"); }}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {pendingCount === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-8 w-8 mx-auto text-success mb-2" />
                <p className="text-sm font-medium">Todas as aprovações em dia</p>
                <p className="text-xs text-muted-foreground">Nenhuma pendência no momento</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-2 mt-3">
          {approvals.slice(0, 20).map(item => {
            const config = TYPE_CONFIG[item.type];
            return (
              <Card key={item.id} className="border-border/50">
                <CardContent className="p-3 flex items-center gap-3">
                  {config.icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <Badge variant={item.status === "approved" ? "default" : item.status === "rejected" ? "destructive" : "secondary"}>{item.status}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={!!actionDialog} onOpenChange={() => { setActionDialog(null); setComments(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog === "approve" ? "✅ Aprovar" : "❌ Rejeitar"} — {selectedItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedItem && (
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <p className="text-sm"><strong>Tipo:</strong> {TYPE_CONFIG[selectedItem.type].label}</p>
                <p className="text-sm"><strong>Solicitante:</strong> {selectedItem.requester}</p>
                {(selectedItem.amount ?? 0) > 0 && <p className="text-sm"><strong>Valor:</strong> ${(selectedItem.amount ?? 0).toLocaleString()}</p>}
                <p className="text-sm"><strong>Nível de Aprovação:</strong> {selectedItem.approval_level} — {APPROVAL_THRESHOLDS[selectedItem.approval_level - 1]?.label}</p>
              </div>
            )}
            <Textarea placeholder="Comentários (opcional)" value={comments} onChange={(e) => setComments(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>Cancelar</Button>
            <Button
              variant={actionDialog === "approve" ? "default" : "destructive"}
              onClick={() => actionDialog && handleAction(actionDialog)}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending ? "Processando..." : actionDialog === "approve" ? "Confirmar Aprovação" : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
