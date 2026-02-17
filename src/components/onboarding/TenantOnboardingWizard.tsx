/**
 * Tenant Onboarding Wizard
 * Guided multi-step flow for new tenants: Create Org → Add Vessel → Add Crew
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Building2, Ship, Users, CheckCircle2, ArrowRight, ArrowLeft,
  Rocket, Anchor
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const STEPS = [
  { id: "org", label: "Organização", icon: Building2, desc: "Configure sua empresa" },
  { id: "vessel", label: "Embarcação", icon: Ship, desc: "Adicione sua primeira embarcação" },
  { id: "crew", label: "Tripulação", icon: Users, desc: "Cadastre os primeiros tripulantes" },
  { id: "done", label: "Concluído", icon: CheckCircle2, desc: "Pronto para usar!" },
];

const VESSEL_TYPES = [
  "AHTS", "PSV", "PLSV", "OSRV", "FPSO", "Tanker", "Bulk Carrier",
  "Container Ship", "Tug", "Barge", "Drill Ship", "Jack-up", "Semi-submersible",
];

const RANKS = [
  "Master", "Chief Officer", "2nd Officer", "3rd Officer",
  "Chief Engineer", "2nd Engineer", "3rd Engineer",
  "Bosun", "AB Seaman", "OS Seaman", "Motorman", "Cook", "Steward",
];

export default function TenantOnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Org data
  const [orgName, setOrgName] = useState("");
  const [orgCountry, setOrgCountry] = useState("Brazil");
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);

  // Vessel data
  const [vesselName, setVesselName] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [imoNumber, setImoNumber] = useState("");
  const [flagState, setFlagState] = useState("Brazil");
  const [createdVesselId, setCreatedVesselId] = useState<string | null>(null);

  // Crew data
  const [crewMembers, setCrewMembers] = useState([
    { full_name: "", rank: "", nationality: "Brazilian", email: "" },
  ]);

  const progress = ((step + 1) / STEPS.length) * 100;

  const handleCreateOrg = useCallback(async () => {
    if (!orgName.trim()) { toast.error("Nome da organização é obrigatório"); return; }
    setIsSubmitting(true);
    try {
      // organizations requires: name, slug (required fields per types)
      const slug = orgName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { data, error } = await supabase.from("organizations").insert({
        name: orgName.trim(),
        slug,
        owner_id: user?.id,
      }).select("id").single();

      if (error) throw error;
      setCreatedOrgId(data.id);

      // Add user as org member
      await supabase.from("organization_members").insert({
        organization_id: data.id,
        user_id: user?.id ?? "",
        role: "owner",
        status: "active",
      });

      toast.success("Organização criada com sucesso!");
      setStep(1);
    } catch (err: unknown) {
      toast.error(`Erro: ${err instanceof Error ? err.message : "Falha ao criar organização"}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [orgName, orgCountry, user]);

  const handleCreateVessel = useCallback(async () => {
    if (!vesselName.trim()) { toast.error("Nome da embarcação é obrigatório"); return; }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.from("vessels").insert({
        name: vesselName.trim(),
        vessel_type: vesselType || "PSV",
        imo_number: imoNumber || null,
        flag_state: flagState,
        status: "active",
        organization_id: createdOrgId,
      }).select("id").single();

      if (error) throw error;
      setCreatedVesselId(data.id);
      toast.success("Embarcação criada com sucesso!");
      setStep(2);
    } catch (err: unknown) {
      toast.error(`Erro: ${err instanceof Error ? err.message : "Falha ao criar embarcação"}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [vesselName, vesselType, imoNumber, flagState, createdOrgId]);

  const handleAddCrew = useCallback(async () => {
    const validCrew = crewMembers.filter(c => c.full_name.trim());
    if (validCrew.length === 0) { toast.error("Adicione pelo menos um tripulante"); return; }
    setIsSubmitting(true);
    try {
      const inserts = validCrew.map((c, idx) => ({
        full_name: c.full_name.trim(),
        rank: c.rank || "AB Seaman",
        nationality: c.nationality || "Brazilian",
        email: c.email || null,
        vessel_id: createdVesselId,
        organization_id: createdOrgId,
        status: "on_board",
        // Required fields per schema
        employee_id: `NEW-${Date.now()}-${idx}`,
        position: c.rank || "Seaman",
      }));

      const { error } = await supabase.from("crew_members").insert(inserts);
      if (error) throw error;

      toast.success(`${validCrew.length} tripulante(s) cadastrado(s)!`);
      setStep(3);

      // Mark onboarding as complete
      localStorage.setItem("nauti-tenant-onboarding-complete", "true");
    } catch (err: unknown) {
      toast.error(`Erro: ${err instanceof Error ? err.message : "Falha ao cadastrar tripulação"}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [crewMembers, createdVesselId, createdOrgId]);

  const addCrewRow = () => {
    setCrewMembers(prev => [...prev, { full_name: "", rank: "", nationality: "Brazilian", email: "" }]);
  };

  const updateCrew = (index: number, field: string, value: string) => {
    setCrewMembers(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Anchor className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Nauti One</h1>
          </div>
          <p className="text-muted-foreground">Configure sua plataforma marítima em poucos minutos</p>
        </motion.div>

        {/* Progress */}
        <div className="space-y-3">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between">
            {STEPS.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-1.5 text-xs ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>
                <s.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {step === 0 && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" /> Sua Organização
                  </CardTitle>
                  <CardDescription>Dados da empresa ou companhia marítima</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Nome da Organização *</Label>
                    <Input id="org-name" placeholder="Ex: Petrobras, CBO, Bram Offshore" value={orgName} onChange={e => setOrgName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-country">País</Label>
                    <Select value={orgCountry} onValueChange={setOrgCountry}>
                      <SelectTrigger id="org-country"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Brazil", "United States", "Norway", "United Kingdom", "Singapore", "Netherlands", "Germany", "France", "Japan", "China"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateOrg} disabled={isSubmitting} className="w-full gap-2">
                    {isSubmitting ? "Criando..." : "Criar Organização"} <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 1 && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" /> Primeira Embarcação
                  </CardTitle>
                  <CardDescription>Cadastre uma embarcação para começar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vessel-name">Nome da Embarcação *</Label>
                    <Input id="vessel-name" placeholder="Ex: Skandi Salvador" value={vesselName} onChange={e => setVesselName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select value={vesselType} onValueChange={setVesselType}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {VESSEL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imo">IMO Number</Label>
                      <Input id="imo" placeholder="9xxxxxx" value={imoNumber} onChange={e => setImoNumber(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Flag State</Label>
                    <Select value={flagState} onValueChange={setFlagState}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Brazil", "Panama", "Liberia", "Marshall Islands", "Bahamas", "Malta", "Singapore", "Norway", "United Kingdom"].map(f => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(0)} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Voltar
                    </Button>
                    <Button onClick={handleCreateVessel} disabled={isSubmitting} className="flex-1 gap-2">
                      {isSubmitting ? "Criando..." : "Criar Embarcação"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Tripulação Inicial
                  </CardTitle>
                  <CardDescription>Cadastre membros da tripulação (pode adicionar mais depois)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {crewMembers.map((crew, idx) => (
                    <div key={`crew-row-${idx}`} className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/30 border">
                      <div className="space-y-1">
                        <Label className="text-xs">Nome Completo *</Label>
                        <Input placeholder="João da Silva" value={crew.full_name} onChange={e => updateCrew(idx, "full_name", e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Posto/Função</Label>
                        <Select value={crew.rank} onValueChange={v => updateCrew(idx, "rank", v)}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addCrewRow} className="w-full" size="sm">
                    + Adicionar mais tripulante
                  </Button>
                  <Separator />
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Voltar
                    </Button>
                    <Button onClick={handleAddCrew} disabled={isSubmitting} className="flex-1 gap-2">
                      {isSubmitting ? "Salvando..." : "Cadastrar Tripulação"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" onClick={() => { setStep(3); localStorage.setItem("nauti-tenant-onboarding-complete", "true"); }} className="w-full text-muted-foreground text-sm">
                    Pular esta etapa →
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 3 && (
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-12 pb-8 text-center space-y-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
                    className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                    <Rocket className="h-10 w-10 text-primary-foreground" />
                  </motion.div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold">🎉 Tudo Pronto!</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Sua plataforma está configurada. Explore os módulos e descubra o poder do Nauti One.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Organização", icon: Building2, done: !!createdOrgId },
                      { label: "Embarcação", icon: Ship, done: !!createdVesselId },
                      { label: "Tripulação", icon: Users, done: crewMembers.some(c => c.full_name.trim()) },
                    ].map(item => (
                      <div key={item.label} className={`p-3 rounded-lg border ${item.done ? "border-primary/30 bg-primary/5" : "border-border"}`}>
                        <item.icon className={`h-5 w-5 mx-auto mb-1 ${item.done ? "text-primary" : "text-muted-foreground"}`} />
                        <div className="text-xs font-medium">{item.label}</div>
                        {item.done && <Badge variant="secondary" className="mt-1 text-[10px]">✓</Badge>}
                      </div>
                    ))}
                  </div>
                  <Button size="lg" onClick={() => navigate("/command")} className="gap-2 px-8">
                    Ir para o Dashboard <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
