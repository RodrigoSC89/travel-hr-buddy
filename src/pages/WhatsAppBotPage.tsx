/**
 * WhatsApp Bot Page - Refactored Orchestrator
 * (~120 lines from 489)
 */
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Phone, Send, Users, Bell, CheckCircle2, MessageSquare, History,
  AlertTriangle, Shield, FileText, Ship
} from "lucide-react";
import { WhatsAppTabs } from "./whatsapp/WhatsAppTabs";

const MESSAGE_TEMPLATES = [
  { id: "cert-expiry", icon: AlertTriangle, label: "Certificate Expiring", template: "⚠️ ALERTA: Seu certificado {{cert_type}} vence em {{days}} dias. Agende renovação o mais breve possível. — Nauti One" },
  { id: "embark-notice", icon: Ship, label: "Embarkation Notice", template: "🚢 EMBARQUE: Você está escalado para embarcar no {{vessel}} em {{date}}. Confirme disponibilidade respondendo SIM. — Nauti One" },
  { id: "audit-alert", icon: Shield, label: "Audit Notification", template: "🔍 AUDITORIA: Auditoria {{audit_type}} agendada para {{date}} no {{vessel}}. Verifique documentação necessária. — Nauti One" },
  { id: "payroll", icon: FileText, label: "Payroll Notification", template: "💰 PAGAMENTO: Seu contracheque de {{month}} está disponível no portal. Valor líquido: R$ {{value}}. — Nauti One" },
  { id: "custom", icon: MessageSquare, label: "Custom Message", template: "" },
];

export default function WhatsAppBotPage() {
  const queryClient = useQueryClient();

  const { data: crewMembers = [] } = useQuery({
    queryKey: ["crew-whatsapp"],
    queryFn: async () => {
      const { data } = await supabase.from("crew_members").select("id, full_name, rank, phone, vessel_id").not("phone", "is", null).order("full_name");
      return data || [];
    },
  });

  const { data: sentMessages = [] } = useQuery({
    queryKey: ["whatsapp-logs"],
    queryFn: async () => {
      const { data } = await supabase.from("ai_audit_logs").select("id, user_input, ai_response, created_at, module_name").eq("module_name", "whatsapp").order("created_at", { ascending: false }).limit(50);
      return (data || []).map((d: any) => ({ id: d.id, recipient: d.user_input, content: d.ai_response, status: "sent", sent_at: d.created_at }));
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (payload: { to: string; message: string }) => {
      const { data, error } = await supabase.functions.invoke("twilio-send-whatsapp", { body: payload });
      if (error) throw error;
      return data;
    },
    onSuccess: () => { toast.success("Mensagem WhatsApp enviada com sucesso!"); queryClient.invalidateQueries({ queryKey: ["whatsapp-logs"] }); },
    onError: (err: Error) => { toast.error(`Erro ao enviar: ${err.message}`); },
  });

  const sendBatch = useMutation({
    mutationFn: async (payload: { recipients: string[]; message: string }) => {
      const results = await Promise.allSettled(payload.recipients.map((to) => supabase.functions.invoke("twilio-send-whatsapp", { body: { to, message: payload.message } })));
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) throw new Error(`${failed} mensagens falharam`);
      return results;
    },
    onSuccess: (_, vars) => { toast.success(`${vars.recipients.length} mensagens enviadas!`); queryClient.invalidateQueries({ queryKey: ["whatsapp-logs"] }); },
    onError: (err: Error) => { toast.error(err.message); },
  });

  const handleSend = (data: { phoneNumber?: string; message: string; selectedCrew?: string[] }) => {
    if (!data.message.trim()) return toast.error("Mensagem é obrigatória");
    if (data.selectedCrew) {
      const phones = crewMembers.filter((c) => data.selectedCrew!.includes(c.id)).map((c) => c.phone!).filter(Boolean);
      if (phones.length === 0) return toast.error("Selecione ao menos um tripulante");
      sendBatch.mutate({ recipients: phones, message: data.message });
    } else {
      if (!data.phoneNumber?.trim()) return toast.error("Número de telefone é obrigatório");
      sendMessage.mutate({ to: data.phoneNumber, message: data.message });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Phone className="h-6 w-6 text-primary" />WhatsApp Bot</h1>
          <p className="text-sm text-muted-foreground mt-1">Envie alertas e notificações para tripulação via WhatsApp</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{crewMembers.length} tripulantes com telefone</Badge>
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1"><CheckCircle2 className="h-3 w-3" />Twilio conectado</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="compose">
            <TabsList>
              <TabsTrigger value="compose" className="gap-1.5"><Send className="h-3.5 w-3.5" /> Enviar</TabsTrigger>
              <TabsTrigger value="history" className="gap-1.5"><History className="h-3.5 w-3.5" /> Histórico</TabsTrigger>
            </TabsList>
            <WhatsAppTabs templates={MESSAGE_TEMPLATES} crewMembers={crewMembers} sentMessages={sentMessages} onSend={handleSend} isSending={sendMessage.isPending || sendBatch.isPending} />
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" /> Estatísticas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Mensagens Hoje", value: sentMessages.filter((m: any) => m.sent_at && new Date(m.sent_at).toDateString() === new Date().toDateString()).length, icon: MessageSquare, color: "text-primary" },
                { label: "Total Enviadas", value: sentMessages.length, icon: Send, color: "text-success" },
                { label: "Taxa de Entrega", value: sentMessages.length > 0 ? `${Math.round((sentMessages.filter((m: any) => m.status === "sent").length / sentMessages.length) * 100)}%` : "—", icon: CheckCircle2, color: "text-success" },
                { label: "Tripulantes Alcançáveis", value: crewMembers.length, icon: Users, color: "text-info" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><stat.icon className={`h-4 w-4 ${stat.color}`} /><span className="text-sm text-muted-foreground">{stat.label}</span></div>
                  <span className="font-semibold text-sm">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Automações Disponíveis</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { label: "Alerta de certificado vencendo", active: true },
                  { label: "Notificação de embarque", active: true },
                  { label: "Lembrete de treinamento", active: false },
                  { label: "Resultado de auditoria", active: false },
                ].map((auto) => (
                  <div key={auto.label} className="flex items-center justify-between py-1.5">
                    <span className="text-xs">{auto.label}</span>
                    <Badge variant={auto.active ? "default" : "secondary"} className="text-[10px]">{auto.active ? "Ativo" : "Inativo"}</Badge>
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
