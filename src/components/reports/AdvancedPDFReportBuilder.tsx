/**
 * Advanced PDF Report Builder
 * Professional PDF reports: Voyage Report, Monthly Fleet Summary, Compliance Pack
 * Uses jsPDF with charts and branding
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** Get last autoTable Y position safely */
function getLastTableY(doc: jsPDF): number {
  return (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 0;
}

type DataRow = Record<string, unknown>;

import {
  FileText, Download, Ship, Shield, BarChart3,
  Loader2, Calendar, Anchor
} from "lucide-react";
import { format, subDays, subMonths } from "date-fns";
import { pt } from "date-fns/locale";

type ReportType = 'voyage' | 'fleet_monthly' | 'compliance';

const REPORT_TYPES: { value: ReportType; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'voyage', label: 'Voyage Report', icon: Anchor, desc: 'Relatório completo de viagem com consumo, rota e eventos' },
  { value: 'fleet_monthly', label: 'Fleet Monthly Summary', icon: Ship, desc: 'Resumo mensal da frota: KPIs, manutenção, compliance' },
  { value: 'compliance', label: 'Compliance Pack', icon: Shield, desc: 'Pacote de evidências: certificados, NCs, CAPAs, auditorias' },
];

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  // Brand header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('NAUTI ONE', 15, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Maritime Management Platform', 15, 22);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, 30);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(8);
  doc.text(subtitle, 195, 30, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc: jsPDF, pageNum: number) {
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Nauti One — Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')} — Página ${pageNum} de ${pageCount}`,
    105, 290, { align: 'center' }
  );
  doc.setTextColor(0, 0, 0);
}

export function AdvancedPDFReportBuilder() {
  const [reportType, setReportType] = useState<ReportType>('fleet_monthly');
  const [vesselId, setVesselId] = useState('');

  const { data: vessels = [] } = useQuery({
    queryKey: ['vessels-for-report'],
    queryFn: async () => {
      const { data } = await fromUntyped('vessels')
        .select('id, name, vessel_type, status, imo_number')
        .order('name')
        .limit(50);
      return (data || []) as Array<{ id: string; name: string; vessel_type: string; status: string; imo_number: string }>;
    },
    staleTime: 1000 * 60 * 30,
  });

  const generateReport = useMutation({
    mutationFn: async () => {
      const doc = new jsPDF();
      const now = new Date();

      if (reportType === 'fleet_monthly') {
        await generateFleetMonthly(doc, now);
      } else if (reportType === 'voyage') {
        await generateVoyageReport(doc, now, vesselId);
      } else if (reportType === 'compliance') {
        await generateCompliancePack(doc, now);
      }

      // Add footers
      const pages = doc.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        addFooter(doc, i);
      }

      doc.save(`NautiOne_${reportType}_${format(now, 'yyyyMMdd_HHmm')}.pdf`);
      return reportType;
    },
    onSuccess: (type) => {
      toast.success(`Relatório ${type} gerado com sucesso`);
    },
    onError: () => toast.error('Erro ao gerar relatório'),
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Gerador de Relatórios PDF
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Report type selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {REPORT_TYPES.map(rt => (
            <Button
              key={rt.value}
              variant={reportType === rt.value ? 'default' : 'outline'}
              className="h-auto flex-col items-start p-3 text-left"
              onClick={() => setReportType(rt.value)}
            >
              <div className="flex items-center gap-2 mb-1">
                <rt.icon className="h-4 w-4" />
                <span className="font-medium text-xs">{rt.label}</span>
              </div>
              <span className="text-[10px] opacity-70">{rt.desc}</span>
            </Button>
          ))}
        </div>

        {/* Vessel selector for voyage report */}
        {reportType === 'voyage' && (
          <div className="space-y-1">
            <Label className="text-xs">Embarcação</Label>
            <Select value={vesselId} onValueChange={setVesselId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Selecionar embarcação..." />
              </SelectTrigger>
              <SelectContent>
                {vessels.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.name} ({v.imo_number})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Generate button */}
        <Button
          className="w-full h-12"
          onClick={() => generateReport.mutate()}
          disabled={generateReport.isPending || (reportType === 'voyage' && !vesselId)}
        >
          {generateReport.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Gerando...</>
          ) : (
            <><Download className="h-4 w-4 mr-2" /> Gerar Relatório PDF</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════
// REPORT GENERATORS
// ═══════════════════════════════════════════

async function generateFleetMonthly(doc: jsPDF, now: Date) {
  addHeader(doc, 'Fleet Monthly Summary', format(now, 'MMMM yyyy', { locale: pt }));

  // Fetch data
  const [vesselsRes, maintenanceRes, certsRes, ncsRes, expensesRes] = await Promise.all([
    fromUntyped('vessels').select('name, vessel_type, status').limit(50),
    fromUntyped('maintenance_tasks').select('title, status, priority').eq('status', 'overdue').limit(20),
    fromUntyped('crew_certifications').select('certificate_type, expiry_date')
      .lt('expiry_date', subDays(now, -30).toISOString()).gt('expiry_date', now.toISOString()).limit(20),
    fromUntyped('non_conformities').select('title, severity, status').eq('status', 'open').limit(20),
    fromUntyped('expenses').select('amount, category')
      .gte('created_at', subMonths(now, 1).toISOString()).limit(200),
  ]);

  const vessels = (vesselsRes.data || []) as Array<Record<string, unknown>>;
  const maint = (maintenanceRes.data || []) as Array<Record<string, unknown>>;
  const certs = (certsRes.data || []) as Array<Record<string, unknown>>;
  const ncs = (ncsRes.data || []) as Array<Record<string, unknown>>;
  const expenses = (expensesRes.data || []) as Array<Record<string, unknown>>;

  const totalOpex = expenses.reduce((s: number, e) => s + Number(e.amount || 0), 0);

  // Summary KPIs
  let y = 45;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Executivo', 15, y);
  y += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const kpis = [
    ['Embarcações Ativas', `${vessels.filter(v => v.status === 'active').length} / ${vessels.length}`],
    ['OPEX Mensal', `USD ${totalOpex.toLocaleString()}`],
    ['Manutenções Atrasadas', `${maint.length}`],
    ['Certificados Expirando (30d)', `${certs.length}`],
    ['NCs Abertas', `${ncs.length}`],
  ];

  autoTable(doc, {
    startY: y,
    head: [['KPI', 'Valor']],
    body: kpis,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 15, right: 15 },
  });

  y = getLastTableY(doc) + 10;

  // Fleet table
  if (vessels.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Status da Frota', 15, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Embarcação', 'Tipo', 'Status']],
      body: vessels.map((v: any) => [v.name, v.vessel_type || '-', v.status || '-']),
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 138], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 15, right: 15 },
    });
  }
}

async function generateVoyageReport(doc: jsPDF, now: Date, vesselId: string) {
  // Fetch vessel info
  const { data: vessel } = await fromUntyped('vessels')
    .select('name, vessel_type, imo_number, flag_state')
    .eq('id', vesselId)
    .single();

  const vesselRec = (vessel || {}) as DataRow;
  const vesselName = String(vesselRec.name || 'Embarcação');
  addHeader(doc, `Voyage Report — ${vesselName}`, format(now, 'dd/MM/yyyy'));

  // Fetch voyage & noon reports
  const [voyagesRes, noonRes] = await Promise.all([
    fromUntyped('voyage_plans').select('voyage_number, origin_port, destination_port, status, departure_date, arrival_date')
      .eq('vessel_id', vesselId).order('created_at', { ascending: false }).limit(5),
    fromUntyped('noon_reports').select('report_date, latitude, longitude, speed, fuel_consumed, distance_sailed')
      .eq('vessel_id', vesselId).order('report_date', { ascending: false }).limit(20),
  ]);

  const voyages = (voyagesRes.data || []) as DataRow[];
  const noons = (noonRes.data || []) as DataRow[];

  let y = 45;

  // Vessel info
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`IMO: ${vesselRec.imo_number || 'N/A'} | Tipo: ${vesselRec.vessel_type || 'N/A'} | Bandeira: ${vesselRec.flag_state || 'N/A'}`, 15, y);
  y += 10;

  // Voyages table
  if (voyages.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Viagens Recentes', 15, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Nº', 'Origem', 'Destino', 'Status', 'Partida']],
      body: voyages.map((v) => [
        String(v.voyage_number || '-'), String(v.origin_port || '-'), String(v.destination_port || '-'),
        String(v.status || '-'), v.departure_date ? format(new Date(String(v.departure_date)), 'dd/MM/yy') : '-',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 15, right: 15 },
    });

    y = getLastTableY(doc) + 10;
  }

  // Noon reports
  if (noons.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Noon Reports', 15, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Data', 'Lat', 'Lon', 'Velocidade (kn)', 'Consumo (MT)', 'Distância (NM)']],
      body: noons.map((n) => [
        n.report_date ? format(new Date(String(n.report_date)), 'dd/MM HH:mm') : '-',
        typeof n.latitude === 'number' ? n.latitude.toFixed(4) : '-',
        typeof n.longitude === 'number' ? n.longitude.toFixed(4) : '-',
        String(n.speed || '-'), String(n.fuel_consumed || '-'), String(n.distance_sailed || '-'),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 138], fontSize: 7 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 15, right: 15 },
    });
  }
}

async function generateCompliancePack(doc: jsPDF, now: Date) {
  addHeader(doc, 'Compliance Evidence Pack', format(now, 'dd/MM/yyyy'));

  const [certsRes, ncsRes, capasRes, auditsRes] = await Promise.all([
    fromUntyped('crew_certifications').select('certificate_type, expiry_date, status')
      .order('expiry_date', { ascending: true }).limit(50),
    fromUntyped('non_conformities').select('title, severity, status, category')
      .order('created_at', { ascending: false }).limit(30),
    fromUntyped('ism_capa').select('title, status, priority')
      .order('created_at', { ascending: false }).limit(20),
    fromUntyped('internal_audits').select('audit_number, audit_type, status')
      .order('created_at', { ascending: false }).limit(10),
  ]);

  const certs = (certsRes.data || []) as DataRow[];
  const ncs = (ncsRes.data || []) as DataRow[];
  const capas = (capasRes.data || []) as DataRow[];
  const audits = (auditsRes.data || []) as DataRow[];

  let y = 45;

  // Summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Sumário de Compliance', 15, y);
  y += 5;

  autoTable(doc, {
    startY: y,
    head: [['Indicador', 'Total', 'Status']],
    body: [
      ['Certificados Monitorados', `${certs.length}`, `${certs.filter(c => c.status === 'active').length} ativos`],
      ['Não-Conformidades', `${ncs.length}`, `${ncs.filter(n => n.status === 'open').length} abertas`],
      ['CAPAs', `${capas.length}`, `${capas.filter(c => c.status === 'open').length} em aberto`],
      ['Auditorias', `${audits.length}`, `${audits.filter(a => a.status === 'completed').length} concluídas`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 15, right: 15 },
  });

  y = getLastTableY(doc) + 10;

  // NCs detail
  if (ncs.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Não-Conformidades', 15, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      head: [['Título', 'Severidade', 'Categoria', 'Status']],
      body: ncs.slice(0, 15).map((n) => [
        String(n.title || '-').substring(0, 40), String(n.severity || '-'), String(n.category || '-'), String(n.status || '-'),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [153, 27, 27], fontSize: 7 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 15, right: 15 },
    });
  }
}

export default AdvancedPDFReportBuilder;
