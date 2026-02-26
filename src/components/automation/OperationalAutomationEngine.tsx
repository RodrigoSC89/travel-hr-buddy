/**
 * Operational Automation Engine
 * Auto-generated checklists, certificate expiry alerts 30/60/90d,
 * noon report auto-fill, PSC inspection timeline
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  AlertTriangle, Shield, FileCheck, Clock, Bell, 
  CheckCircle2, CalendarDays, Ship, RefreshCw, Zap
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { pt } from "date-fns/locale";

// Certificate Expiry Tracker with 30/60/90 day windows
function CertificateExpiryTracker() {
  const { data: certs = [], isLoading } = useQuery({
    queryKey: ['cert-expiry-automation'],
    queryFn: async () => {
      const in90 = addDays(new Date(), 90).toISOString();
      const { data } = await fromUntyped('crew_certifications')
        .select('id, certificate_type, expiry_date, status, crew_member_id')
        .lt('expiry_date', in90)
        .order('expiry_date', { ascending: true })
        .limit(50);
      return (data || []) as Array<{
        id: string; certificate_type: string; expiry_date: string;
        status: string; crew_member_id: string;
      }>;
    },
    staleTime: 1000 * 60 * 10,
  });

  const queryClient = useQueryClient();

  const generateAlerts = useMutation({
    mutationFn: async () => {
      const now = new Date();
      let created = 0;
      for (const cert of certs) {
        const days = differenceInDays(new Date(cert.expiry_date), now);
        if (days <= 0) continue;
        const severity = days <= 30 ? 'critical' : days <= 60 ? 'high' : 'medium';
        await fromUntyped('soc_alerts').insert({
          alert_type: 'certificate_expiring',
          severity,
          title: `Certificado ${cert.certificate_type} expira em ${days} dias`,
          description: `Tripulante ${cert.crew_member_id}. Renovação necessária antes de ${format(new Date(cert.expiry_date), 'dd/MM/yyyy')}.`,
          status: 'active',
        });
        created++;
      }
      return created;
    },
    onSuccess: (count) => {
      toast.success(`${count} alertas de certificados gerados`);
      queryClient.invalidateQueries({ queryKey: ['cert-expiry-automation'] });
    },
  });

  const getBand = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days <= 0) return { label: 'Expirado', color: 'destructive' as const, days };
    if (days <= 30) return { label: '30 dias', color: 'destructive' as const, days };
    if (days <= 60) return { label: '60 dias', color: 'secondary' as const, days };
    return { label: '90 dias', color: 'outline' as const, days };
  };

  const expired = certs.filter(c => differenceInDays(new Date(c.expiry_date), new Date()) <= 0);
  const in30 = certs.filter(c => { const d = differenceInDays(new Date(c.expiry_date), new Date()); return d > 0 && d <= 30; });
  const in60 = certs.filter(c => { const d = differenceInDays(new Date(c.expiry_date), new Date()); return d > 30 && d <= 60; });
  const in90 = certs.filter(c => { const d = differenceInDays(new Date(c.expiry_date), new Date()); return d > 60 && d <= 90; });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Certificados — Janela 90 Dias
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => generateAlerts.mutate()} disabled={generateAlerts.isPending}>
            <Bell className="h-3 w-3 mr-1" /> Gerar Alertas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary bands */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Expirados', count: expired.length, color: 'bg-destructive/20 text-destructive' },
            { label: '≤30d', count: in30.length, color: 'bg-destructive/10 text-destructive' },
            { label: '≤60d', count: in60.length, color: 'bg-accent/30 text-accent-foreground' },
            { label: '≤90d', count: in90.length, color: 'bg-muted text-muted-foreground' },
          ].map(b => (
            <div key={b.label} className={`rounded-lg p-2 text-center ${b.color}`}>
              <div className="text-lg font-bold">{b.count}</div>
              <div className="text-xs">{b.label}</div>
            </div>
          ))}
        </div>
        {/* List */}
        <div className="max-h-48 overflow-y-auto space-y-1">
          {isLoading ? <p className="text-xs text-muted-foreground">Carregando...</p> :
            certs.slice(0, 15).map(cert => {
              const band = getBand(cert.expiry_date);
              return (
                <div key={cert.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/30">
                  <span className="truncate flex-1">{cert.certificate_type}</span>
                  <Badge variant={band.color} className="text-[10px] ml-2">
                    {band.days <= 0 ? 'Expirado' : `${band.days}d`}
                  </Badge>
                </div>
              );
            })
          }
        </div>
      </CardContent>
    </Card>
  );
}

// Auto-Checklist Generator
function AutoChecklistGenerator() {
  const queryClient = useQueryClient();

  const generateChecklist = useMutation({
    mutationFn: async (type: string) => {
      const templates: Record<string, { title: string; items: string[] }> = {
        departure: {
          title: 'Checklist de Partida',
          items: ['Verificar documentos de despacho', 'Conferir carga e lastro', 'Teste de equipamentos de navegação',
            'Briefing de segurança com tripulação', 'Verificar condições meteorológicas', 'Confirmar plano de viagem',
            'Teste de comunicações', 'Verificar provisões e combustível'],
        },
        psc: {
          title: 'Preparação PSC',
          items: ['Certificados estatutários válidos', 'Equipamentos de salvatagem testados', 'Plano SOPEP atualizado',
            'Drill records últimos 3 meses', 'Garbage Management Plan', 'IOPP Certificate', 'ISM DOC/SMC válidos',
            'MLC conformidade verificada', 'Crew certificates válidos', 'Fire-fighting equipment testado'],
        },
        bunkering: {
          title: 'Checklist de Bunkering',
          items: ['Plano de bunkering aprovado', 'SOPEP posicionado', 'Comunicação com terminal',
            'Scuppers fechados', 'Fire watch postado', 'BDN preparado', 'Sondagens iniciais registradas'],
        },
      };
      const tpl = templates[type];
      if (!tpl) throw new Error('Template não encontrado');

      const { data: checklist } = await fromUntyped('checklists').insert({
        title: `${tpl.title} — ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
        status: 'pending',
        checklist_type: type,
        items: tpl.items.map((item, i) => ({ id: i + 1, text: item, checked: false })),
      }).select().single();

      return checklist;
    },
    onSuccess: () => {
      toast.success('Checklist gerado automaticamente');
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
    onError: () => toast.error('Erro ao gerar checklist'),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-primary" />
          Gerador Automático de Checklists
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { key: 'departure', label: 'Partida', icon: Ship, desc: '8 itens de verificação pré-saída' },
            { key: 'psc', label: 'PSC Readiness', icon: Shield, desc: '10 itens de preparação PSC' },
            { key: 'bunkering', label: 'Bunkering', icon: RefreshCw, desc: '7 itens SOPEP/BDN' },
          ].map(t => (
            <Button
              key={t.key}
              variant="outline"
              className="h-auto flex-col items-start p-3 text-left"
              onClick={() => generateChecklist.mutate(t.key)}
              disabled={generateChecklist.isPending}
            >
              <div className="flex items-center gap-2 mb-1">
                <t.icon className="h-4 w-4 text-primary" />
                <span className="font-medium text-xs">{t.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{t.desc}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// PSC Inspection Timeline
function PSCTimeline() {
  const { data: inspections = [] } = useQuery({
    queryKey: ['psc-timeline'],
    queryFn: async () => {
      const { data } = await fromUntyped('psc_inspections')
        .select('id, inspection_date, port_name, result, deficiencies_count, vessel_id, detention')
        .order('inspection_date', { ascending: false })
        .limit(10);
      return (data || []) as Array<{
        id: string; inspection_date: string; port_name: string;
        result: string; deficiencies_count: number; vessel_id: string; detention: boolean;
      }>;
    },
    staleTime: 1000 * 60 * 15,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Timeline PSC — Últimas Inspeções
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inspections.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhuma inspeção PSC registrada</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {inspections.map((insp, i) => (
              <div key={insp.id} className="flex items-center gap-3 text-xs">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${insp.detention ? 'bg-destructive' : (insp.deficiencies_count || 0) > 0 ? 'bg-accent' : 'bg-primary'}`} />
                  {i < inspections.length - 1 && <div className="w-0.5 h-6 bg-border" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{insp.port_name || 'Porto'}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(insp.inspection_date), 'dd/MM/yy', { locale: pt })}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-0.5">
                    {insp.detention && <Badge variant="destructive" className="text-[9px]">Detido</Badge>}
                    {(insp.deficiencies_count || 0) > 0 && (
                      <Badge variant="secondary" className="text-[9px]">{insp.deficiencies_count} deficiências</Badge>
                    )}
                    {!insp.detention && (insp.deficiencies_count || 0) === 0 && (
                      <Badge variant="outline" className="text-[9px] text-green-500">Limpo</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Operational Automation Engine
export function OperationalAutomationEngine() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-5 w-5 text-primary" />
        <h3 className="text-base font-semibold">Motor de Automação Operacional</h3>
      </div>
      <Tabs defaultValue="certs" className="w-full">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="certs" className="text-xs">Certificados</TabsTrigger>
          <TabsTrigger value="checklists" className="text-xs">Auto-Checklists</TabsTrigger>
          <TabsTrigger value="psc" className="text-xs">PSC Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="certs"><CertificateExpiryTracker /></TabsContent>
        <TabsContent value="checklists"><AutoChecklistGenerator /></TabsContent>
        <TabsContent value="psc"><PSCTimeline /></TabsContent>
      </Tabs>
    </div>
  );
}

export default OperationalAutomationEngine;
