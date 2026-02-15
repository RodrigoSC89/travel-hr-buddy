/**
 * WhatsApp Bot Page
 * Send alerts and messages to crew via Twilio WhatsApp integration
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Phone, Send, Users, Bell, Clock, CheckCircle2, XCircle, MessageSquare,
  AlertTriangle, Shield, FileText, Ship, Loader2, History
} from "lucide-react";

const MESSAGE_TEMPLATES = [
  {
    id: "cert-expiry",
    icon: AlertTriangle,
    label: "Certificate Expiring",
    template: "⚠️ ALERTA: Seu certificado {{cert_type}} vence em {{days}} dias. Agende renovação o mais breve possível. — Nauti One",
  },
  {
    id: "embark-notice",
    icon: Ship,
    label: "Embarkation Notice",
    template: "🚢 EMBARQUE: Você está escalado para embarcar no {{vessel}} em {{date}}. Confirme disponibilidade respondendo SIM. — Nauti One",
  },
  {
    id: "audit-alert",
    icon: Shield,
    label: "Audit Notification",
    template: "🔍 AUDITORIA: Auditoria {{audit_type}} agendada para {{date}} no {{vessel}}. Verifique documentação necessária. — Nauti One",
  },
  {
    id: "payroll",
    icon: FileText,
    label: "Payroll Notification",
    template: "💰 PAGAMENTO: Seu contracheque de {{month}} está disponível no portal. Valor líquido: R$ {{value}}. — Nauti One",
  },
  {
    id: "custom",
    icon: MessageSquare,
    label: "Custom Message",
    template: "",
  },
];

export default function WhatsAppBotPage() {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [batchMode, setBatchMode] = useState(false);
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);

  // Fetch crew members for batch sending
  const { data: crewMembers = [] } = useQuery({
    queryKey: ["crew-whatsapp"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crew_members")
        .select("id, full_name, rank, phone, vessel_id")
        .not("phone", "is", null)
        .order("full_name");
      return data || [];
    },
  });

  // Fetch sent messages from ai_audit_logs (used as notification log)
  const { data: sentMessages = [] } = useQuery({
    queryKey: ["whatsapp-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_audit_logs")
        .select("id, user_input, ai_response, created_at, module_name")
        .eq("module_name", "whatsapp")
        .order("created_at", { ascending: false })
        .limit(50);
      return (data || []).map((d: any) => ({
        id: d.id,
        recipient: d.user_input,
        content: d.ai_response,
        status: "sent",
        sent_at: d.created_at,
      }));
    },
  });

  // Send WhatsApp message mutation
  const sendMessage = useMutation({
    mutationFn: async (payload: { to: string; message: string }) => {
      const { data, error } = await supabase.functions.invoke("twilio-send-whatsapp", {
        body: payload,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Mensagem WhatsApp enviada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["whatsapp-logs"] });
      setMessage("");
      setPhoneNumber("");
    },
    onError: (err: Error) => {
      toast.error(`Erro ao enviar: ${err.message}`);
    },
  });

  // Send batch messages
  const sendBatch = useMutation({
    mutationFn: async (payload: { recipients: string[]; message: string }) => {
      const results = await Promise.allSettled(
        payload.recipients.map((to) =>
          supabase.functions.invoke("twilio-send-whatsapp", {
            body: { to, message: payload.message },
          })
        )
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) throw new Error(`${failed} mensagens falharam`);
      return results;
    },
    onSuccess: (_, vars) => {
      toast.success(`${vars.recipients.length} mensagens enviadas!`);
      queryClient.invalidateQueries({ queryKey: ["whatsapp-logs"] });
      setSelectedCrew([]);
      setMessage("");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = MESSAGE_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) setMessage(tmpl.template);
  };

  const handleSend = () => {
    if (!message.trim()) return toast.error("Mensagem é obrigatória");

    if (batchMode) {
      const phones = crewMembers
        .filter((c) => selectedCrew.includes(c.id))
        .map((c) => c.phone!)
        .filter(Boolean);
      if (phones.length === 0) return toast.error("Selecione ao menos um tripulante");
      sendBatch.mutate({ recipients: phones, message });
    } else {
      if (!phoneNumber.trim()) return toast.error("Número de telefone é obrigatório");
      sendMessage.mutate({ to: phoneNumber, message });
    }
  };

  const isSending = sendMessage.isPending || sendBatch.isPending;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Phone className="h-6 w-6 text-primary" />
            WhatsApp Bot
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie alertas e notificações para tripulação via WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {crewMembers.length} tripulantes com telefone
          </Badge>
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Twilio conectado
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Compose */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="compose">
            <TabsList>
              <TabsTrigger value="compose" className="gap-1.5">
                <Send className="h-3.5 w-3.5" /> Enviar
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5">
                <History className="h-3.5 w-3.5" /> Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4 mt-4">
              {/* Templates */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Templates de Mensagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {MESSAGE_TEMPLATES.map((t) => (
                      <Button
                        key={t.id}
                        variant={selectedTemplate === t.id ? "default" : "outline"}
                        size="sm"
                        className="gap-1.5 text-xs h-auto py-2"
                        onClick={() => handleTemplateSelect(t.id)}
                      >
                        <t.icon className="h-3.5 w-3.5" />
                        {t.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recipient */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Destinatário</CardTitle>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="batch-mode" className="text-xs text-muted-foreground">
                        Envio em lote
                      </Label>
                      <Switch id="batch-mode" checked={batchMode} onCheckedChange={setBatchMode} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {batchMode ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">
                          {selectedCrew.length} selecionados
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() =>
                            setSelectedCrew(
                              selectedCrew.length === crewMembers.length
                                ? []
                                : crewMembers.map((c) => c.id)
                            )
                          }
                        >
                          {selectedCrew.length === crewMembers.length ? "Desmarcar todos" : "Selecionar todos"}
                        </Button>
                      </div>
                      <ScrollArea className="h-40 border rounded-lg p-2">
                        <div className="space-y-1">
                          {crewMembers.map((crew) => (
                            <label
                              key={crew.id}
                              className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCrew.includes(crew.id)}
                                onChange={(e) =>
                                  setSelectedCrew((prev) =>
                                    e.target.checked
                                      ? [...prev, crew.id]
                                      : prev.filter((id) => id !== crew.id)
                                  )
                                }
                                className="rounded"
                              />
                              <span className="font-medium">{crew.full_name}</span>
                              <span className="text-muted-foreground text-xs">— {crew.rank}</span>
                              <span className="text-muted-foreground text-xs ml-auto">{crew.phone}</span>
                            </label>
                          ))}
                          {crewMembers.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              Nenhum tripulante com telefone cadastrado
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Número WhatsApp (com código do país)</Label>
                      <Input
                        id="phone"
                        placeholder="+5511999999999"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Message */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Mensagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Digite a mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{message.length} caracteres</span>
                    <Button onClick={handleSend} disabled={isSending} className="gap-2">
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {batchMode
                        ? `Enviar para ${selectedCrew.length} tripulantes`
                        : "Enviar WhatsApp"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="h-4 w-4" /> Mensagens Enviadas
                  </CardTitle>
                  <CardDescription>Últimas 50 mensagens WhatsApp</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {sentMessages.map((msg: any) => (
                        <div
                          key={msg.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-card/50"
                        >
                          <div
                            className={`p-1.5 rounded-full ${
                              msg.status === "sent"
                                ? "bg-green-500/10 text-green-500"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {msg.status === "sent" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{msg.recipient}</span>
                              <Badge variant="outline" className="text-[10px]">
                                {msg.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {msg.content}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                              {msg.sent_at
                                ? new Date(msg.sent_at).toLocaleString("pt-BR")
                                : "—"}
                            </span>
                          </div>
                        </div>
                      ))}
                      {sentMessages.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Nenhuma mensagem enviada ainda
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4" /> Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  label: "Mensagens Hoje",
                  value: sentMessages.filter(
                    (m: any) =>
                      m.sent_at &&
                      new Date(m.sent_at).toDateString() === new Date().toDateString()
                  ).length,
                  icon: MessageSquare,
                  color: "text-primary",
                },
                {
                  label: "Total Enviadas",
                  value: sentMessages.length,
                  icon: Send,
                  color: "text-green-500",
                },
                {
                  label: "Taxa de Entrega",
                  value: sentMessages.length > 0
                    ? `${Math.round(
                        (sentMessages.filter((m: any) => m.status === "sent").length /
                          sentMessages.length) *
                          100
                      )}%`
                    : "—",
                  icon: CheckCircle2,
                  color: "text-emerald-500",
                },
                {
                  label: "Tripulantes Alcançáveis",
                  value: crewMembers.length,
                  icon: Users,
                  color: "text-blue-500",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="font-semibold text-sm">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Automações Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "Alerta de certificado vencendo", active: true },
                  { label: "Notificação de embarque", active: true },
                  { label: "Lembrete de treinamento", active: false },
                  { label: "Resultado de auditoria", active: false },
                ].map((auto) => (
                  <div
                    key={auto.label}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-xs">{auto.label}</span>
                    <Badge
                      variant={auto.active ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {auto.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
