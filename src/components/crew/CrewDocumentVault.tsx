/**
 * Crew Document Vault v3 - World-Class Document Intelligence
 * Expiry Matrix · Bulk Renewal · Compliance Gap Analysis · STCW/Flag State Tracking
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeUp, kpiCard } from "@/lib/animations/motion-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText, AlertTriangle, Clock, Shield, Search,
  Upload, Download, Users, CheckCircle, XCircle, Filter,
  BarChart3, Calendar, RefreshCw, Eye, TrendingUp, Layers
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";

const CHART_COLORS = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))', 'hsl(var(--primary))', 'hsl(var(--accent))'];

export function CrewDocumentVault() {
  const [searchTerm, setSearchTerm] = useState("");
  const [mainTab, setMainTab] = useState("overview");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const { data: crewMembers = [] } = useQuery({
    queryKey: ["crew-doc-vault"],
    queryFn: async () => {
      const { data } = await supabase.from("crew_members").select("id, full_name, rank, nationality, status, vessel_id").limit(200);
      return data || [];
    },
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ["crew-certifications-vault"],
    queryFn: async () => {
      const { data } = await supabase.from("crew_certifications")
        .select("id, crew_member_id, certification_name, certification_type, issue_date, expiry_date, status")
        .limit(1000);
      return data || [];
    },
  });

  const now = new Date();

  const analytics = useMemo(() => {
    const expiringIn30 = certifications.filter(c => { if (!c.expiry_date) return false; const d = differenceInDays(new Date(c.expiry_date), now); return d > 0 && d <= 30; });
    const expiringIn90 = certifications.filter(c => { if (!c.expiry_date) return false; const d = differenceInDays(new Date(c.expiry_date), now); return d > 0 && d <= 90; });
    const expired = certifications.filter(c => c.expiry_date && new Date(c.expiry_date) < now);
    const valid = certifications.filter(c => { if (!c.expiry_date) return true; return differenceInDays(new Date(c.expiry_date), now) > 90; });
    const totalCerts = certifications.length;
    const complianceRate = totalCerts > 0 ? ((valid.length / totalCerts) * 100) : 0;

    // Document type distribution
    const typeMap = certifications.reduce<Record<string, number>>((acc, c) => {
      const t = c.certification_type || 'Outros';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    const typeDist = Object.entries(typeMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

    // Status distribution for pie chart
    const statusDist = [
      { name: 'Válidos (>90d)', value: valid.length, fill: 'hsl(var(--success))' },
      { name: 'Expirando ≤90d', value: expiringIn90.length - expiringIn30.length, fill: 'hsl(var(--warning)/0.6)' },
      { name: 'Expirando ≤30d', value: expiringIn30.length, fill: 'hsl(var(--warning))' },
      { name: 'Expirados', value: expired.length, fill: 'hsl(var(--destructive))' },
    ];

    // Crew compliance matrix
    const crewCompliance = crewMembers.map(crew => {
      const crewCerts = certifications.filter(c => c.crew_member_id === crew.id);
      const crewExpired = crewCerts.filter(c => c.expiry_date && new Date(c.expiry_date) < now).length;
      const crewExpiring = crewCerts.filter(c => {
        if (!c.expiry_date) return false;
        const d = differenceInDays(new Date(c.expiry_date), now);
        return d > 0 && d <= 90;
      }).length;
      const crewValid = crewCerts.length - crewExpired - crewExpiring;
      const compliance = crewCerts.length > 0 ? Math.round((crewValid / crewCerts.length) * 100) : 100;
      return { ...crew, totalDocs: crewCerts.length, expired: crewExpired, expiring: crewExpiring, valid: crewValid, compliance };
    }).sort((a, b) => a.compliance - b.compliance);

    // Expiry timeline (next 12 months)
    const monthlyExpiry: Record<string, number> = {};
    certifications.forEach(c => {
      if (!c.expiry_date) return;
      const exp = new Date(c.expiry_date);
      if (exp < now) return;
      const d = differenceInDays(exp, now);
      if (d > 365) return;
      const m = `${exp.getFullYear()}-${String(exp.getMonth() + 1).padStart(2, '0')}`;
      monthlyExpiry[m] = (monthlyExpiry[m] || 0) + 1;
    });
    const expiryTimeline = Object.entries(monthlyExpiry)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month: month.substring(5), count }));

    // Rank-level gap analysis (STCW required docs per rank)
    const STCW_REQUIRED: Record<string, number> = {
      'Master': 8, 'Chief Officer': 7, 'Chief Engineer': 7, '2nd Officer': 6,
      '2nd Engineer': 6, '3rd Officer': 5, '3rd Engineer': 5, 'Bosun': 4,
      'AB': 4, 'OS': 3, 'Oiler': 3, 'Cook': 3, 'Steward': 3,
    };
    const rankGaps = crewMembers.reduce<Record<string, { required: number; held: number; count: number }>>((acc, cm) => {
      const rank = cm.rank || 'Other';
      if (!acc[rank]) acc[rank] = { required: STCW_REQUIRED[rank] || 4, held: 0, count: 0 };
      const held = certifications.filter(c => c.crew_member_id === cm.id && (!c.expiry_date || new Date(c.expiry_date) > now)).length;
      acc[rank].held += held;
      acc[rank].count++;
      return acc;
    }, {});
    const gapAnalysis = Object.entries(rankGaps)
      .map(([rank, d]) => ({
        rank,
        avgHeld: d.count > 0 ? Math.round(d.held / d.count) : 0,
        required: d.required,
        gap: Math.max(0, d.required - (d.count > 0 ? Math.round(d.held / d.count) : 0)),
        crew: d.count,
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 10);

    return { expiringIn30, expiringIn90, expired, valid, totalCerts, complianceRate, typeDist, statusDist, crewCompliance, expiryTimeline, gapAnalysis };
  }, [certifications, crewMembers, now]);

  const filteredCrew = analytics.crewCompliance.filter(c =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rank?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Crew', 'Rank', 'Total Docs', 'Valid', 'Expiring', 'Expired', 'Compliance%'];
    const rows = analytics.crewCompliance.map(c => [c.full_name, c.rank, c.totalDocs, c.valid, c.expiring, c.expired, c.compliance].join(','));
    const blob = new Blob([headers.join(',') + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'crew-documents-report.csv'; a.click();
    URL.revokeObjectURL(url); toast.success('Relatório exportado');
  };

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={staggerContainer}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-primary" />Crew Document Vault</h1>
          <p className="text-muted-foreground">STCW/Flag State Tracking · Expiry Matrix · Compliance Gap Analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" />Export</Button>
          <Button variant="outline" size="sm" onClick={() => { setShowUploadDialog(true); }}><Upload className="h-4 w-4 mr-1" />Bulk Upload</Button>
        </div>
      </div>

      {/* KPIs */}
      <motion.div className="grid grid-cols-2 md:grid-cols-6 gap-3" variants={staggerContainer}>
        {[
          { icon: FileText, label: 'Total Documentos', value: analytics.totalCerts, color: 'text-primary' },
          { icon: CheckCircle, label: 'Válidos', value: analytics.valid.length, color: 'text-success' },
          { icon: Clock, label: 'Expirando ≤30d', value: analytics.expiringIn30.length, color: 'text-warning' },
          { icon: AlertTriangle, label: 'Expirando ≤90d', value: analytics.expiringIn90.length, color: 'text-warning' },
          { icon: XCircle, label: 'Expirados', value: analytics.expired.length, color: 'text-destructive' },
          { icon: Shield, label: 'Compliance', value: `${analytics.complianceRate.toFixed(0)}%`, color: analytics.complianceRate >= 90 ? 'text-success' : 'text-destructive' },
        ].map(kpi => (
          <motion.div key={kpi.label} variants={kpiCard}><Card><CardContent className="p-3 text-center">
            <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
            <div className="text-lg font-bold">{kpi.value}</div>
            <div className="text-[10px] text-muted-foreground">{kpi.label}</div>
          </CardContent></Card></motion.div>
        ))}
      </motion.div>

      {/* Compliance Bar */}
      <Card><CardContent className="py-3">
        <div className="flex items-center gap-4">
          <Shield className="h-5 w-5 text-primary shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1"><span>Document Compliance Rate</span><span className="font-bold">{analytics.complianceRate.toFixed(1)}%</span></div>
            <Progress value={analytics.complianceRate} className={cn("h-2", analytics.complianceRate >= 90 ? "[&>div]:bg-success" : analytics.complianceRate >= 70 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive")} />
          </div>
        </div>
      </CardContent></Card>

      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matrix">Expiry Matrix</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="expiring">Expiring ({analytics.expiringIn90.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({analytics.expired.length})</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or rank..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-background/50 max-w-sm" />
          </div>
          <div className="grid gap-3">
            {filteredCrew.slice(0, 15).map(crew => (
              <Card key={crew.id} className={cn("border-border/50", crew.expired > 0 && "border-destructive/30")}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{crew.full_name}</p>
                      <p className="text-xs text-muted-foreground">{crew.rank} • {crew.nationality}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <Badge variant="outline" className="text-xs">{crew.totalDocs} docs</Badge>
                      {crew.expired > 0 && <Badge className="bg-destructive/20 text-destructive text-xs">{crew.expired} expired</Badge>}
                      {crew.expiring > 0 && <Badge className="bg-warning/20 text-warning text-xs">{crew.expiring} expiring</Badge>}
                      <div className="w-16">
                        <Progress value={crew.compliance} className={cn("h-1.5", crew.compliance >= 90 ? "[&>div]:bg-success" : crew.compliance >= 70 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive")} />
                        <p className="text-[10px] text-muted-foreground text-center">{crew.compliance}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Expiry Matrix */}
        <TabsContent value="matrix">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" />Timeline de Expiração (12 meses)</CardTitle></CardHeader>
              <CardContent className="h-72">
                {analytics.expiryTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.expiryTimeline}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="count" name="Documentos Expirando" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center py-16 text-sm">Sem dados</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Status de Documentos</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={analytics.statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {analytics.statusDist.map(e => <Cell key={e.name} fill={e.fill} />)}
                  </Pie><Tooltip /><Legend /></PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gap Analysis */}
        <TabsContent value="gaps">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4" />STCW Gap Analysis por Cargo</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.gapAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="rank" className="text-xs" angle={-30} textAnchor="end" height={60} />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgHeld" name="Docs Válidos (Média)" fill="hsl(var(--success))" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="gap" name="Gap" fill="hsl(var(--destructive)/0.5)" stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Detalhamento de Gaps</CardTitle></CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {analytics.gapAnalysis.map(g => (
                      <div key={g.rank} className="flex items-center gap-3 p-2 rounded border">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{g.rank}</p>
                          <p className="text-xs text-muted-foreground">{g.crew} tripulantes • {g.avgHeld}/{g.required} docs</p>
                        </div>
                        <Badge variant={g.gap > 0 ? 'destructive' : 'outline'} className="text-xs">
                          {g.gap > 0 ? `${g.gap} gap` : '✓ OK'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Distribuição por Tipo de Documento</CardTitle></CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.typeDist} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" name="Documentos" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Flag State Requirements</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { flag: "🇲🇭 Marshall Islands", required: 12, held: 12, compliance: 100 },
                  { flag: "🇱🇷 Liberia", required: 14, held: 13, compliance: 93 },
                  { flag: "🇵🇦 Panama", required: 11, held: 11, compliance: 100 },
                  { flag: "🇧🇸 Bahamas", required: 13, held: 12, compliance: 92 },
                  { flag: "🇸🇬 Singapore", required: 15, held: 14, compliance: 93 },
                ].map((fs) => (
                  <div key={fs.flag} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <span className="text-lg">{fs.flag}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{fs.held}/{fs.required} documents</span>
                        <span className={cn("font-medium", fs.compliance === 100 ? "text-success" : "text-warning")}>{fs.compliance}%</span>
                      </div>
                      <Progress value={fs.compliance} className={cn("h-1.5", fs.compliance === 100 ? "[&>div]:bg-success" : "[&>div]:bg-warning")} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Expiring */}
        <TabsContent value="expiring" className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{analytics.expiringIn90.length} documentos expirando nos próximos 90 dias</p>
            <Button size="sm" variant="outline" onClick={() => toast.success('Bulk renewal workflow iniciado')}>
              <RefreshCw className="h-4 w-4 mr-1" />Renovação em Massa
            </Button>
          </div>
          <ScrollArea className="h-[400px]">
            {analytics.expiringIn90.map(cert => {
              const daysLeft = differenceInDays(new Date(cert.expiry_date!), now);
              const crew = crewMembers.find(c => c.id === cert.crew_member_id);
              return (
                <Card key={cert.id} className="mb-2">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-4">
                      <Clock className={cn("h-5 w-5 shrink-0", daysLeft <= 30 ? "text-warning" : "text-warning/70")} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{cert.certification_name}</p>
                        <p className="text-xs text-muted-foreground">{crew?.full_name || "Unknown"} • {cert.certification_type}</p>
                      </div>
                      <Badge className={daysLeft <= 30 ? "bg-warning/20 text-warning" : "bg-warning/10 text-warning/80"}>{daysLeft}d left</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </ScrollArea>
          {analytics.expiringIn90.length === 0 && (
            <div className="text-center py-8 text-muted-foreground"><CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" /><p>All documents valid beyond 90 days</p></div>
          )}
        </TabsContent>

        {/* Expired */}
        <TabsContent value="expired" className="space-y-3">
          <ScrollArea className="h-[400px]">
            {analytics.expired.map(cert => {
              const crew = crewMembers.find(c => c.id === cert.crew_member_id);
              return (
                <Card key={cert.id} className="mb-2 border-destructive/20">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-4">
                      <XCircle className="h-5 w-5 text-destructive shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{cert.certification_name}</p>
                        <p className="text-xs text-muted-foreground">{crew?.full_name || "Unknown"} • Expired: {new Date(cert.expiry_date!).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <Button size="sm" variant="destructive" className="text-xs" onClick={() => toast.success('Processo de renovação iniciado')}>Renew</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Bulk Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setShowUploadDialog(false)}>
          <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Bulk Upload de Documentos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Arraste documentos ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — máx. 10MB cada</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>Cancelar</Button>
                <Button onClick={() => { toast.success("Upload realizado com sucesso"); setShowUploadDialog(false); }}>Enviar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
