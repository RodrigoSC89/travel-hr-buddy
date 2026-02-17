/**
 * MLC Recruitment Compliance - Regulation 1.4
 * Agency management, scoring, and checklist compliance
 * PRODUCTION: Wired to Supabase mlc_recruitment_agencies + mlc_recruitment_checklist
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CheckCircle, AlertTriangle, Shield, FileText, Users, Globe, Clock, Star, Plus } from "lucide-react";
import { toast } from "sonner";

interface Agency {
  id: string;
  agency_code: string;
  name: string;
  country: string;
  license_number: string;
  license_expiry: string;
  status: "approved" | "conditional" | "under_review" | "blacklisted";
  compliance_score: number;
  last_audit: string;
  placements: number;
  complaints: number;
  certifications: string[];
}

interface ChecklistItem {
  id: string;
  requirement: string;
  regulation: string;
  status: "compliant" | "non_compliant" | "partial";
}

const statusConfig: Record<string, { label: string; color: string }> = {
  approved: { label: "Aprovada", color: "bg-success/10 text-success border-success/30" },
  conditional: { label: "Condicional", color: "bg-warning/10 text-warning border-warning/30" },
  under_review: { label: "Em Análise", color: "bg-info/10 text-info border-info/30" },
  blacklisted: { label: "Bloqueada", color: "bg-destructive/10 text-destructive border-destructive/30" },
};

const checkStatus: Record<string, { label: string; color: string }> = {
  compliant: { label: "✓", color: "text-success" },
  non_compliant: { label: "✗", color: "text-destructive" },
  partial: { label: "◐", color: "text-warning" },
};

const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { requirement: "Agência licenciada pelo Estado de Bandeira ou Estado do Porto", regulation: "Standard A1.4 §2", status: "compliant" },
  { requirement: "Sistema de proteção ao marítimo (seguro, garantia financeira)", regulation: "Standard A1.4 §5(c)(vi)", status: "compliant" },
  { requirement: "Nenhuma taxa cobrada do marítimo (exceto custo de certificados)", regulation: "Standard A1.4 §5(b)", status: "compliant" },
  { requirement: "Registro atualizado de todas as colocações realizadas", regulation: "Standard A1.4 §5(c)(i)", status: "compliant" },
  { requirement: "Marítimo informado sobre direitos e deveres antes do embarque", regulation: "Standard A1.4 §5(c)(ii)", status: "partial" },
  { requirement: "Verificação de qualificação e documentos do marítimo", regulation: "Standard A1.4 §5(c)(iii)", status: "compliant" },
  { requirement: "SEA conforme normas nacionais antes do embarque", regulation: "Standard A1.4 §5(c)(iv)", status: "compliant" },
  { requirement: "Procedimento de reclamação disponível ao marítimo", regulation: "Standard A1.4 §5(c)(v)", status: "compliant" },
  { requirement: "Sistema de lista negra de agências não conforme", regulation: "Guideline B1.4 §3", status: "compliant" },
  { requirement: "Auditoria anual de agências de recrutamento", regulation: "Standard A1.4 §9", status: "partial" },
];

export const MLCRecruitmentCompliance: React.FC = () => {
  const [tab, setTab] = useState("agencies");
  const [showAdd, setShowAdd] = useState(false);
  const queryClient = useQueryClient();

  const { data: agencies = [] } = useQuery({
    queryKey: ['mlc-recruitment-agencies'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('mlc_recruitment_agencies')
        .select('*').order('compliance_score', { ascending: false });
      if (error) throw error;
      return (data || []) as Agency[];
    },
  });

  const { data: checklist = [] } = useQuery({
    queryKey: ['mlc-recruitment-checklist'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('mlc_recruitment_checklist')
        .select('*').order('regulation');
      if (error) throw error;
      return (data || []) as ChecklistItem[];
    },
  });

  const seedChecklist = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from as Function)('mlc_recruitment_checklist').insert(DEFAULT_CHECKLIST);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mlc-recruitment-checklist'] }),
  });

  const addAgency = useMutation({
    mutationFn: async (agency: Partial<Agency>) => {
      const { error } = await (supabase.from as Function)('mlc_recruitment_agencies').insert(agency);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlc-recruitment-agencies'] });
      toast.success('Agência adicionada');
      setShowAdd(false);
    },
  });

  const updateAgencyStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase.from as Function)('mlc_recruitment_agencies')
        .update({ status, updated_at: new Date().toISOString() } as never).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlc-recruitment-agencies'] });
      toast.success('Status atualizado');
    },
  });

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    addAgency.mutate({
      agency_code: `AG-${String(Date.now()).slice(-4)}`,
      name: String(fd.get('name')),
      country: String(fd.get('country')),
      license_number: String(fd.get('license_number')),
      license_expiry: String(fd.get('license_expiry')),
      status: 'under_review',
      compliance_score: 0,
      placements: 0,
      complaints: 0,
      certifications: ['MLC 2006'],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mlc_recruitment_agencies columns not fully in generated types
    } as any);
  };

  const approvedCount = agencies.filter(a => a.status === "approved").length;
  const avgScore = agencies.length > 0 ? Math.round(agencies.reduce((a, ag) => a + Number(ag.compliance_score), 0) / agencies.length) : 0;
  const totalPlacements = agencies.reduce((a, ag) => a + Number(ag.placements || 0), 0);
  const complianceRate = checklist.length > 0
    ? Math.round((checklist.filter(c => c.status === "compliant").length / checklist.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Building2 className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Agências</p></div>
          <p className="text-2xl font-bold">{agencies.length}</p>
          <p className="text-xs text-muted-foreground">{approvedCount} aprovadas</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Star className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">Score Médio</p></div>
          <p className="text-2xl font-bold">{avgScore}%</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Colocações</p></div>
          <p className="text-2xl font-bold">{totalPlacements}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Shield className="h-4 w-4 text-success" /><p className="text-xs text-muted-foreground">Conformidade</p></div>
          <p className="text-2xl font-bold text-success">{complianceRate}%</p>
        </CardContent></Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="agencies" className="gap-1"><Building2 className="h-3 w-3" />Agências</TabsTrigger>
          <TabsTrigger value="checklist" className="gap-1"><CheckCircle className="h-3 w-3" />Checklist A1.4</TabsTrigger>
        </TabsList>

        <TabsContent value="agencies" className="space-y-3 mt-4">
          <div className="flex justify-end">
            <Dialog open={showAdd} onOpenChange={setShowAdd}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-3 w-3" />Nova Agência</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Cadastrar Agência</DialogTitle></DialogHeader>
                <form onSubmit={handleAdd} className="space-y-3">
                  <Input name="name" placeholder="Nome da agência" required />
                  <Input name="country" placeholder="País" required />
                  <Input name="license_number" placeholder="Nº Licença" required />
                  <Input name="license_expiry" type="date" required />
                  <Button type="submit" className="w-full">Salvar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {agencies.length === 0 && (
            <Card className="bg-muted/30"><CardContent className="py-8 text-center text-muted-foreground">
              Nenhuma agência cadastrada. Clique em "Nova Agência" para começar.
            </CardContent></Card>
          )}

          {agencies.map(ag => {
            const st = statusConfig[ag.status] || statusConfig.under_review;
            const daysToExpiry = ag.license_expiry ? Math.ceil((new Date(ag.license_expiry).getTime() - Date.now()) / 86400000) : 0;
            return (
              <Card key={ag.id} className="bg-card/50">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">{ag.agency_code}</span>
                        <Badge variant="outline" className={st.color}>{st.label}</Badge>
                        <Badge variant="outline"><Globe className="h-3 w-3 mr-1" />{ag.country}</Badge>
                      </div>
                      <p className="font-medium">{ag.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><FileText className="h-3 w-3" />Lic: {ag.license_number}</span>
                        <span className={`flex items-center gap-1 ${daysToExpiry < 90 ? "text-warning" : ""}`}>
                          <Clock className="h-3 w-3" />Exp: {ag.license_expiry} ({daysToExpiry}d)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(ag.certifications || []).map(c => (
                          <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className={`text-2xl font-bold ${Number(ag.compliance_score) >= 90 ? "text-success" : Number(ag.compliance_score) >= 70 ? "text-warning" : "text-destructive"}`}>
                        {ag.compliance_score}%
                      </p>
                      <p className="text-xs text-muted-foreground">{ag.placements} colocações</p>
                      {Number(ag.complaints) > 0 && (
                        <p className="text-xs text-destructive">{ag.complaints} reclamações</p>
                      )}
                    </div>
                  </div>
                  <Progress value={Number(ag.compliance_score)} className="h-1.5" />
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Checklist — Standard A1.4</CardTitle>
                  <CardDescription>Requisitos obrigatórios para recrutamento e colocação</CardDescription>
                </div>
                {checklist.length === 0 && (
                  <Button size="sm" variant="outline" onClick={() => seedChecklist.mutate()}>Inicializar Checklist</Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {checklist.map(item => {
                const cs = checkStatus[item.status] || checkStatus.partial;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                    <span className={`text-lg font-bold ${cs.color}`}>{cs.label}</span>
                    <div className="flex-1">
                      <p className="text-sm">{item.requirement}</p>
                      <p className="text-xs text-muted-foreground">{item.regulation}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
