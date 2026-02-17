/**
 * Evidence Collaboration - Comments, assignments and real-time review
 */
import React, { useState, useCallback, useEffect, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare, Users, Send, UserPlus, CheckCircle2, Clock,
  XCircle, Loader2, AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { EvidenceItem, EvidenceElement, EvidencePack } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  pack: EvidencePack;
  items: EvidenceItem[];
  elements: EvidenceElement[];
}

interface Comment {
  id: string;
  item_id: string;
  user_name: string;
  comment_text: string;
  comment_type: string;
  created_at: string;
}

interface Assignment {
  id: string;
  item_id: string;
  assigned_to_name: string;
  assigned_by_name: string;
  status: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
}

export const EvidenceCollaboration = memo(({ pack, items, elements }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState("comment");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assigneeName, setAssigneeName] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [activeTab, setActiveTab] = useState<"comments" | "assignments">("comments");
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [commentsRes, assignmentsRes] = await Promise.all([
      supabase.from("audit_evidence_comments")
        .select("*")
        .eq("pack_id", pack.id)
        .order("created_at", { ascending: false }),
      supabase.from("audit_evidence_assignments")
        .select("*")
        .eq("pack_id", pack.id)
        .order("created_at", { ascending: false }),
    ]);

    setComments((commentsRes.data as unknown as Comment[]) || []);
    setAssignments((assignmentsRes.data as unknown as Assignment[]) || []);
    setIsLoading(false);
  }, [pack.id]);

  useEffect(() => { loadData(); }, [loadData]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`collab-${pack.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "audit_evidence_comments",
        filter: `pack_id=eq.${pack.id}`,
      }, (payload) => {
        setComments(prev => [payload.new as Comment, ...prev]);
      })
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "audit_evidence_assignments",
        filter: `pack_id=eq.${pack.id}`,
      }, () => {
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pack.id, loadData]);

  const addComment = useCallback(async () => {
    if (!newComment.trim() || !selectedItem) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      await supabase.from("audit_evidence_comments").insert({
        item_id: selectedItem,
        pack_id: pack.id,
        user_id: user.id,
        user_name: user.email?.split("@")[0] || "Usuário",
        comment_text: newComment.trim(),
        comment_type: commentType,
      });

      setNewComment("");
      toast.success("Comentário adicionado!");
    } catch (error) {
      toast.error("Erro ao adicionar comentário");
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, selectedItem, pack.id, commentType]);

  const addAssignment = useCallback(async () => {
    if (!assigneeName.trim() || !selectedItem) return;
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      await supabase.from("audit_evidence_assignments").insert({
        item_id: selectedItem,
        pack_id: pack.id,
        assigned_to: user.id,
        assigned_to_name: assigneeName.trim(),
        assigned_by: user.id,
        assigned_by_name: user.email?.split("@")[0] || "Usuário",
        due_date: assignDueDate || null,
        notes: assignNotes || null,
      });

      setAssigneeName("");
      setAssignNotes("");
      setAssignDueDate("");
      toast.success("Responsável atribuído!");
    } catch (error) {
      toast.error("Erro ao atribuir");
    } finally {
      setIsSubmitting(false);
    }
  }, [assigneeName, selectedItem, pack.id, assignNotes, assignDueDate]);

  const updateAssignmentStatus = useCallback(async (id: string, status: string) => {
    await supabase.from("audit_evidence_assignments")
      .update({ status })
      .eq("id", id);
    toast.success("Status atualizado!");
  }, []);

  // Items with gaps for assignment
  const gapItems = items.filter(i => i.evidence_status !== "found");
  const selectedItemData = items.find(i => i.id === selectedItem);
  const selectedElement = selectedItemData ? elements.find(e => e.id === selectedItemData.element_id) : null;
  const itemComments = comments.filter(c => c.item_id === selectedItem);
  const itemAssignments = assignments.filter(a => a.item_id === selectedItem);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Item Selector */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Itens para Revisão ({gapItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <ScrollArea className="h-[500px]">
            <div className="space-y-1 pr-1">
              {gapItems.map(item => {
                const el = elements.find(e => e.id === item.element_id);
                const itemCommentCount = comments.filter(c => c.item_id === item.id).length;
                const itemAssignCount = assignments.filter(a => a.item_id === item.id).length;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item.id)}
                    className={cn(
                      "p-2.5 rounded-lg cursor-pointer transition-colors text-xs",
                      selectedItem === item.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge variant="outline" className="text-[9px]">{el?.element_code || "?"}</Badge>
                      <span className="font-medium truncate">{item.item_number}</span>
                      {item.is_critical && <Badge variant="destructive" className="text-[9px] h-3.5">!</Badge>}
                    </div>
                    <p className="text-muted-foreground line-clamp-2">{item.item_text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {itemCommentCount > 0 && (
                        <span className="flex items-center gap-0.5 text-muted-foreground">
                          <MessageSquare className="h-3 w-3" /> {itemCommentCount}
                        </span>
                      )}
                      {itemAssignCount > 0 && (
                        <span className="flex items-center gap-0.5 text-muted-foreground">
                          <UserPlus className="h-3 w-3" /> {itemAssignCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detail Panel */}
      <Card className="lg:col-span-2">
        {selectedItem && selectedItemData ? (
          <>
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {selectedElement?.element_code} / {selectedItemData.item_number}
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={activeTab === "comments" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("comments")}
                    className="gap-1 h-7 text-xs"
                  >
                    <MessageSquare className="h-3 w-3" /> Comentários ({itemComments.length})
                  </Button>
                  <Button
                    variant={activeTab === "assignments" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("assignments")}
                    className="gap-1 h-7 text-xs"
                  >
                    <UserPlus className="h-3 w-3" /> Responsáveis ({itemAssignments.length})
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{selectedItemData.item_text}</p>
            </CardHeader>

            <CardContent className="space-y-3">
              {activeTab === "comments" ? (
                <>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-1">
                      {itemComments.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Nenhum comentário neste item
                        </p>
                      )}
                      {itemComments.map(c => (
                        <div key={c.id} className="p-3 rounded-lg bg-muted/30 border">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{c.user_name}</span>
                              <Badge variant="outline" className="text-[9px]">
                                {c.comment_type === "approval" ? "✅ Aprovação" :
                                 c.comment_type === "rejection" ? "❌ Rejeição" :
                                 c.comment_type === "review" ? "👁️ Revisão" : "💬 Comentário"}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(c.created_at).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm">{c.comment_text}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Select value={commentType} onValueChange={setCommentType}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comment">💬 Comentário</SelectItem>
                          <SelectItem value="review">👁️ Revisão</SelectItem>
                          <SelectItem value="approval">✅ Aprovação</SelectItem>
                          <SelectItem value="rejection">❌ Rejeição</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Escreva um comentário..."
                        className="min-h-[60px] resize-none text-sm"
                      />
                      <Button onClick={addComment} disabled={isSubmitting || !newComment.trim()} size="icon" className="shrink-0 h-[60px] w-[60px]">
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2 pr-1">
                      {itemAssignments.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Nenhum responsável atribuído
                        </p>
                      )}
                      {itemAssignments.map(a => (
                        <div key={a.id} className="p-3 rounded-lg bg-muted/30 border">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <UserPlus className="h-3.5 w-3.5 text-primary" />
                              <span className="text-sm font-medium">{a.assigned_to_name}</span>
                              <Badge variant={
                                a.status === "completed" ? "default" :
                                a.status === "in_progress" ? "secondary" :
                                a.status === "rejected" ? "destructive" : "outline"
                              } className="text-[9px]">
                                {a.status === "completed" ? "✅ Concluído" :
                                 a.status === "in_progress" ? "🔄 Em Andamento" :
                                 a.status === "rejected" ? "❌ Rejeitado" : "⏳ Pendente"}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {a.due_date ? `Prazo: ${new Date(a.due_date).toLocaleDateString("pt-BR")}` : "Sem prazo"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">Atribuído por: {a.assigned_by_name}</p>
                          {a.notes && <p className="text-xs mt-1">{a.notes}</p>}
                          <div className="flex gap-1 mt-2">
                            {a.status !== "completed" && (
                              <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => updateAssignmentStatus(a.id, "completed")}>
                                <CheckCircle2 className="h-3 w-3 mr-0.5" /> Concluir
                              </Button>
                            )}
                            {a.status === "pending" && (
                              <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => updateAssignmentStatus(a.id, "in_progress")}>
                                <Clock className="h-3 w-3 mr-0.5" /> Iniciar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="space-y-2 border-t pt-3">
                    <p className="text-xs font-medium">Atribuir Responsável</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={assigneeName}
                        onChange={e => setAssigneeName(e.target.value)}
                        placeholder="Nome do responsável"
                        className="text-sm h-8"
                      />
                      <Input
                        type="date"
                        value={assignDueDate}
                        onChange={e => setAssignDueDate(e.target.value)}
                        className="text-sm h-8"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={assignNotes}
                        onChange={e => setAssignNotes(e.target.value)}
                        placeholder="Notas (opcional)"
                        className="text-sm h-8"
                      />
                      <Button onClick={addAssignment} disabled={isSubmitting || !assigneeName.trim()} size="sm" className="gap-1 h-8">
                        {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                        Atribuir
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="py-20 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Selecione um item para colaborar</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
});

EvidenceCollaboration.displayName = "EvidenceCollaboration";
