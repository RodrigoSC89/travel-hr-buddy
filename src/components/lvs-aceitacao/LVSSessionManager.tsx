/**
 * LVS Session Manager - Create/load acceptance sessions with Supabase persistence
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Plus, FolderOpen, Ship, Calendar, Target, Loader2, CheckCircle2
} from "lucide-react";
import type { LVSSession } from "./useLVSPersistence";

interface Props {
  sessions: LVSSession[];
  activeSession: LVSSession | null;
  onCreateSession: (title: string, vesselId?: string, targetDate?: string) => Promise<any>;
  onLoadSession: (sessionId: string) => Promise<void>;
  isLoading: boolean;
}

export function LVSSessionManager({ sessions, activeSession, onCreateSession, onLoadSession, isLoading }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("LVS Aceitação RSV");
  const [targetDate, setTargetDate] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) { toast.error("Informe o título"); return; }
    setCreating(true);
    await onCreateSession(title, undefined, targetDate || undefined);
    setCreating(false);
    setCreateOpen(false);
    setTitle("LVS Aceitação RSV");
    setTargetDate("");
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Ship className="h-5 w-5 text-primary" />
            {activeSession ? (
              <>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{activeSession.title}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      Score: {activeSession.overall_score}%
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {activeSession.approved_items}/{activeSession.total_items} aprovados
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sessão ativa • Criada em {new Date(activeSession.created_at).toLocaleDateString("pt-BR")}
                    {activeSession.target_date && ` • Meta: ${new Date(activeSession.target_date).toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Nova Sessão
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground flex-1">Nenhuma sessão ativa — crie ou carregue uma sessão para persistir dados</span>
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Criar Sessão
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Ship className="h-5 w-5" /> Gerenciar Sessões LVS</DialogTitle>
          </DialogHeader>

          {/* Create */}
          <div className="space-y-3 border-b pb-4">
            <h4 className="text-sm font-medium">Nova Sessão</h4>
            <Input placeholder="Título da sessão" value={title} onChange={e => setTitle(e.target.value)} />
            <Input type="date" placeholder="Data meta" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
            <Button className="w-full" onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Criar Sessão (&gt;250 itens)
            </Button>
          </div>

          {/* Existing */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Sessões Anteriores ({sessions.length})</h4>
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {sessions.map(s => (
                  <Card
                    key={s.id}
                    className={`cursor-pointer hover:bg-muted/30 transition ${activeSession?.id === s.id ? "border-primary" : ""}`}
                    onClick={() => { onLoadSession(s.id); setCreateOpen(false); }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        {activeSession?.id === s.id && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                        <span className="text-sm font-medium truncate">{s.title}</span>
                        <Badge variant="secondary" className="text-[10px] ml-auto">{s.overall_score}%</Badge>
                      </div>
                      <Progress value={s.overall_score} className="h-1 mb-1" />
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span>{new Date(s.created_at).toLocaleDateString("pt-BR")}</span>
                        <span>{s.approved_items}/{s.total_items} aprovados</span>
                        {s.target_date && <span>Meta: {new Date(s.target_date).toLocaleDateString("pt-BR")}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {sessions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Nenhuma sessão encontrada</p>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
