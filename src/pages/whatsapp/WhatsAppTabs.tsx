import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, Users, Bell, CheckCircle2, XCircle, MessageSquare, Loader2, History
} from "lucide-react";

interface MessageTemplate {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  template: string;
}

interface WhatsAppTabsProps {
  templates: MessageTemplate[];
  crewMembers: { id: string; full_name: string; rank: string | null; phone: string | null; vessel_id: string | null }[];
  sentMessages: { id: string; recipient: string; content: string; status: string; sent_at: string }[];
  onSend: (data: { phoneNumber?: string; message: string; selectedCrew?: string[] }) => void;
  isSending: boolean;
}

export function WhatsAppTabs({ templates, crewMembers, sentMessages, onSend, isSending }: WhatsAppTabsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [batchMode, setBatchMode] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) setMessage(tmpl.template);
  };

  const handleSend = () => {
    onSend({ phoneNumber, message, selectedCrew: batchMode ? selectedCrew : undefined });
  };

  return (
    <>
      <TabsContent value="compose" className="space-y-4 mt-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Templates de Mensagem</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {templates.map((t) => (
                <Button key={t.id} variant={selectedTemplate === t.id ? "default" : "outline"} size="sm" className="gap-1.5 text-xs h-auto py-2" onClick={() => handleTemplateSelect(t.id)}>
                  <t.icon className="h-3.5 w-3.5" />{t.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Destinatário</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="batch-mode" className="text-xs text-muted-foreground">Envio em lote</Label>
                <Switch id="batch-mode" checked={batchMode} onCheckedChange={setBatchMode} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {batchMode ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">{selectedCrew.length} selecionados</Label>
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setSelectedCrew(selectedCrew.length === crewMembers.length ? [] : crewMembers.map((c) => c.id))}>
                    {selectedCrew.length === crewMembers.length ? "Desmarcar todos" : "Selecionar todos"}
                  </Button>
                </div>
                <ScrollArea className="h-40 border rounded-lg p-2">
                  <div className="space-y-1">
                    {crewMembers.map((crew) => (
                      <label key={crew.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm">
                        <input type="checkbox" checked={selectedCrew.includes(crew.id)} onChange={(e) => setSelectedCrew((prev) => e.target.checked ? [...prev, crew.id] : prev.filter((id) => id !== crew.id))} className="rounded" />
                        <span className="font-medium">{crew.full_name}</span>
                        <span className="text-muted-foreground text-xs">— {crew.rank}</span>
                        <span className="text-muted-foreground text-xs ml-auto">{crew.phone}</span>
                      </label>
                    ))}
                    {crewMembers.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum tripulante com telefone cadastrado</p>}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="phone">Número WhatsApp (com código do país)</Label>
                <Input id="phone" placeholder="+5511999999999" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Mensagem</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Textarea placeholder="Digite a mensagem..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="resize-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{message.length} caracteres</span>
              <Button onClick={handleSend} disabled={isSending} className="gap-2">
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {batchMode ? `Enviar para ${selectedCrew.length} tripulantes` : "Enviar WhatsApp"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4" /> Mensagens Enviadas</CardTitle>
            <CardDescription>Últimas 50 mensagens WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {sentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                    <div className={`p-1.5 rounded-full ${msg.status === "sent" ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                      {msg.status === "sent" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{msg.recipient}</span>
                        <Badge variant="outline" className="text-[10px]">{msg.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{msg.content}</p>
                      <span className="text-[10px] text-muted-foreground">{msg.sent_at ? new Date(msg.sent_at).toLocaleString("pt-BR") : "—"}</span>
                    </div>
                  </div>
                ))}
                {sentMessages.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem enviada ainda</p>}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
}
