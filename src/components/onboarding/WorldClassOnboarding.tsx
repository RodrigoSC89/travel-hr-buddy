/**
 * WorldClassOnboarding — Zero-friction, cinematic onboarding experience
 * Benchmarks: Stripe (2min to value), Linear (progressive disclosure), Vercel (beauty)
 * Consolidates: TenantOnboardingWizard + WelcomeOnboarding + ProductOnboardingTour
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Building2, Ship, Users, CheckCircle2, ArrowRight, ArrowLeft,
  Rocket, Anchor, Sparkles, Shield, BarChart3, Zap, Globe, X,
  Plus, Trash2, ChevronRight, Star, Compass
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { seedDemoData, type SeedProgress } from "@/lib/seed/demo-data-seeder";

// ─── Constants ──────────────────────────────────────────────
const STORAGE_KEY = "nauti-world-onboarding-v2";

const VESSEL_TYPES = [
  "AHTS", "PSV", "PLSV", "OSRV", "FPSO", "Tanker", "Bulk Carrier",
  "Container Ship", "Tug", "Barge", "Drill Ship", "Jack-up", "Semi-submersible",
];

const RANKS = [
  "Master", "Chief Officer", "2nd Officer", "3rd Officer",
  "Chief Engineer", "2nd Engineer", "3rd Engineer",
  "Bosun", "AB Seaman", "OS Seaman", "Motorman", "Cook", "Steward",
];

const COUNTRIES = [
  "Brazil", "United States", "Norway", "United Kingdom", "Singapore",
  "Netherlands", "Germany", "Greece", "Japan", "China", "Panama",
  "Liberia", "Marshall Islands", "Bahamas", "Malta",
];

const FLAG_STATES = [
  "Brazil", "Panama", "Liberia", "Marshall Islands", "Bahamas",
  "Malta", "Singapore", "Norway", "United Kingdom", "Antigua and Barbuda",
];

// ─── Types ──────────────────────────────────────────────────
interface CrewEntry { full_name: string; rank: string; nationality: string; }

type Phase = "welcome" | "org" | "vessel" | "crew" | "explore" | "complete";

const PHASES: { id: Phase; label: string; icon: typeof Building2 }[] = [
  { id: "welcome", label: "Início", icon: Compass },
  { id: "org", label: "Empresa", icon: Building2 },
  { id: "vessel", label: "Embarcação", icon: Ship },
  { id: "crew", label: "Tripulação", icon: Users },
  { id: "explore", label: "Explorar", icon: Sparkles },
  { id: "complete", label: "Pronto!", icon: Rocket },
];

const FEATURES = [
  { icon: Ship, title: "Gestão de Frota", desc: "AIS em tempo real", color: "from-blue-500 to-cyan-500" },
  { icon: Users, title: "Tripulação", desc: "MLC 2006 compliant", color: "from-violet-500 to-purple-500" },
  { icon: Shield, title: "Compliance", desc: "ISM, ISPS, SGSO", color: "from-emerald-500 to-green-500" },
  { icon: BarChart3, title: "Analytics", desc: "IA preditiva", color: "from-amber-500 to-orange-500" },
  { icon: Zap, title: "Automação", desc: "Zero work manual", color: "from-rose-500 to-pink-500" },
  { icon: Globe, title: "Operações", desc: "Voyage & bunker", color: "from-sky-500 to-indigo-500" },
];

// ─── Animated Background ────────────────────────────────────
const CinematicBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
    {/* Floating orbs */}
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={`orb-${i}`}
        className="absolute rounded-full bg-primary/5 blur-3xl"
        style={{
          width: `${200 + i * 80}px`,
          height: `${200 + i * 80}px`,
          left: `${10 + i * 20}%`,
          top: `${20 + (i % 3) * 25}%`,
        }}
        animate={{
          x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
          y: [0, 20 * (i % 2 === 0 ? -1 : 1), 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8 + i * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
    {/* Grid lines */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
  </div>
);

// ─── Step Indicator ─────────────────────────────────────────
const StepIndicator = ({ currentPhase }: { currentPhase: Phase }) => {
  const currentIdx = PHASES.findIndex(p => p.id === currentPhase);
  const progress = ((currentIdx + 1) / PHASES.length) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progresso do Setup</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="h-1.5" />
      <div className="flex justify-between">
        {PHASES.map((phase, i) => {
          const isActive = i === currentIdx;
          const isDone = i < currentIdx;
          const Icon = phase.icon;
          return (
            <div
              key={phase.id}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive && "scale-110",
                isDone ? "text-primary" : isActive ? "text-primary" : "text-muted-foreground/40"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 transition-all",
                isDone && "bg-primary border-primary text-primary-foreground",
                isActive && "border-primary bg-primary/10",
                !isDone && !isActive && "border-muted bg-muted/30"
              )}>
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className="text-[10px] hidden sm:block font-medium">{phase.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────
export default function WorldClassOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("welcome");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seedProgress, setSeedProgress] = useState<SeedProgress | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedComplete, setSeedComplete] = useState(false);


  // Org
  const [orgName, setOrgName] = useState("");
  const [orgCountry, setOrgCountry] = useState("Brazil");
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);

  // Vessel
  const [vesselName, setVesselName] = useState("");
  const [vesselType, setVesselType] = useState("");
  const [imoNumber, setImoNumber] = useState("");
  const [flagState, setFlagState] = useState("Brazil");
  const [createdVesselId, setCreatedVesselId] = useState<string | null>(null);

  // Crew
  const [crewMembers, setCrewMembers] = useState<CrewEntry[]>([
    { full_name: "", rank: "", nationality: "Brazilian" },
  ]);

  // Check if already completed
  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed === "true") {
      navigate("/command", { replace: true });
    }
  }, [navigate]);

  // ─── Handlers ───────────────────────────────────────
  const handleCreateOrg = useCallback(async () => {
    if (!orgName.trim()) { toast.error("Nome da organização é obrigatório"); return; }
    setIsSubmitting(true);
    try {
      const slug = orgName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const { data, error } = await supabase.from("organizations").insert({
        name: orgName.trim(),
        slug,
        owner_id: user?.id,
      }).select("id").single();
      if (error) throw error;
      setCreatedOrgId(data.id);
      await supabase.from("organization_members").insert({
        organization_id: data.id,
        user_id: user?.id ?? "",
        role: "owner",
        status: "active",
      });
      toast.success("Organização criada!");
      setPhase("vessel");
    } catch (err: unknown) {
      toast.error(`Erro: ${err instanceof Error ? err.message : "Falha ao criar organização"}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [orgName, user]);

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
      toast.success("Embarcação criada!");
      setPhase("crew");
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
        vessel_id: createdVesselId,
        organization_id: createdOrgId,
        status: "on_board",
        employee_id: `NEW-${Date.now()}-${idx}`,
        position: c.rank || "Seaman",
      }));
      const { error } = await supabase.from("crew_members").insert(inserts);
      if (error) throw error;
      toast.success(`${validCrew.length} tripulante(s) cadastrado(s)!`);
      setPhase("explore");
    } catch (err: unknown) {
      toast.error(`Erro: ${err instanceof Error ? err.message : "Falha ao cadastrar tripulação"}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [crewMembers, createdVesselId, createdOrgId]);

  const handleFinish = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    localStorage.setItem("nauti-tenant-onboarding-complete", "true");
    localStorage.setItem("nauti-onboarding-complete", "true");
    localStorage.setItem("nautilus_onboarding_completed", "true");
    setPhase("complete");
  };

  const handleSeedDemoData = useCallback(async () => {
    if (!createdOrgId) {
      toast.error("Crie uma organização primeiro para carregar dados demo");
      return;
    }
    setIsSeeding(true);
    setSeedComplete(false);
    try {
      const result = await seedDemoData(createdOrgId, (progress) => {
        setSeedProgress(progress);
      });
      if (result.success) {
        const totalCreated = Object.values(result.created).reduce((a, b) => a + b, 0);
        toast.success(`${totalCreated} registros demo criados em ${(result.durationMs / 1000).toFixed(1)}s!`);
        setSeedComplete(true);
      } else {
        toast.warning(`Dados parcialmente carregados. ${result.errors.length} erro(s).`);
        setSeedComplete(true);
      }
    } catch (err) {
      toast.error(`Erro ao carregar dados demo: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
    } finally {
      setIsSeeding(false);
    }
  }, [createdOrgId]);

  const addCrewRow = () => {
    setCrewMembers(prev => [...prev, { full_name: "", rank: "", nationality: "Brazilian" }]);
  };

  const removeCrewRow = (idx: number) => {
    if (crewMembers.length <= 1) return;
    setCrewMembers(prev => prev.filter((_, i) => i !== idx));
  };

  const updateCrew = (index: number, field: keyof CrewEntry, value: string) => {
    setCrewMembers(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  // ─── Animation variants ────────────────────────────
  const pageVariants = {
    initial: { opacity: 0, y: 30, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -20, scale: 0.97, transition: { duration: 0.25 } },
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.08 } },
  };

  const staggerItem = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <CinematicBackground />
      
      <div className="relative z-10 w-full max-w-2xl space-y-6">
        {/* Logo & branding */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <Anchor className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Nauti One
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Plataforma de Inteligência Marítima
          </p>
        </motion.div>

        {/* Step indicator - hide on welcome and complete */}
        {phase !== "welcome" && phase !== "complete" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <StepIndicator currentPhase={phase} />
          </motion.div>
        )}

        {/* Phase content */}
        <AnimatePresence mode="wait">
          {/* ═══ WELCOME ═══ */}
          {phase === "welcome" && (
            <motion.div key="welcome" {...pageVariants}>
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                <CardContent className="p-8 space-y-8">
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3, damping: 12 }}
                      className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30"
                    >
                      <Rocket className="h-10 w-10 text-primary-foreground" />
                    </motion.div>
                    <h2 className="text-2xl font-bold">Bem-vindo ao Nauti One</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Configure sua plataforma em <strong className="text-foreground">menos de 2 minutos</strong>. 
                      Vamos criar sua organização, adicionar uma embarcação e tripulação.
                    </p>
                  </div>

                  {/* Feature grid */}
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                  >
                    {FEATURES.map((feat) => (
                      <motion.div
                        key={feat.title}
                        variants={staggerItem}
                        className="group p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all cursor-default"
                      >
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${feat.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                          <feat.icon className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-sm font-medium leading-tight">{feat.title}</p>
                        <p className="text-[11px] text-muted-foreground">{feat.desc}</p>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="flex flex-col gap-3">
                    <Button
                      size="lg"
                      onClick={() => setPhase("org")}
                      className="w-full gap-2 h-12 text-base font-semibold shadow-lg shadow-primary/20"
                    >
                      <Sparkles className="h-5 w-5" />
                      Começar Configuração
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleFinish();
                        navigate("/command");
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Pular setup — explorar primeiro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ═══ ORGANIZATION ═══ */}
          {phase === "org" && (
            <motion.div key="org" {...pageVariants}>
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Sua Organização</h2>
                      <p className="text-sm text-muted-foreground">Dados da empresa ou companhia marítima</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="org-name" className="text-sm font-medium">
                        Nome da Organização <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="org-name"
                        placeholder="Ex: CBO, Bram Offshore, DOF Subsea"
                        value={orgName}
                        onChange={e => setOrgName(e.target.value)}
                        className="h-11"
                        autoFocus
                        onKeyDown={e => e.key === "Enter" && handleCreateOrg()}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">País</Label>
                      <Select value={orgCountry} onValueChange={setOrgCountry}>
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateOrg}
                    disabled={isSubmitting || !orgName.trim()}
                    className="w-full h-11 gap-2 font-semibold"
                  >
                    {isSubmitting ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                        <Compass className="h-4 w-4" />
                      </motion.div>
                    ) : null}
                    {isSubmitting ? "Criando..." : "Criar Organização"}
                    {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ═══ VESSEL ═══ */}
          {phase === "vessel" && (
            <motion.div key="vessel" {...pageVariants}>
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <Ship className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Primeira Embarcação</h2>
                      <p className="text-sm text-muted-foreground">Cadastre sua embarcação principal</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Nome da Embarcação <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        placeholder="Ex: Skandi Salvador, Far Sapphire"
                        value={vesselName}
                        onChange={e => setVesselName(e.target.value)}
                        className="h-11"
                        autoFocus
                        onKeyDown={e => e.key === "Enter" && handleCreateVessel()}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Tipo</Label>
                        <Select value={vesselType} onValueChange={setVesselType}>
                          <SelectTrigger className="h-11"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {VESSEL_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">IMO Number</Label>
                        <Input
                          placeholder="9xxxxxx"
                          value={imoNumber}
                          onChange={e => setImoNumber(e.target.value)}
                          className="h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Flag State</Label>
                      <Select value={flagState} onValueChange={setFlagState}>
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FLAG_STATES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setPhase("org")} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Voltar
                    </Button>
                    <Button
                      onClick={handleCreateVessel}
                      disabled={isSubmitting || !vesselName.trim()}
                      className="flex-1 h-11 gap-2 font-semibold"
                    >
                      {isSubmitting ? "Criando..." : "Criar Embarcação"}
                      {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ═══ CREW ═══ */}
          {phase === "crew" && (
            <motion.div key="crew" {...pageVariants}>
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-500 to-green-500" />
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Tripulação Inicial</h2>
                      <p className="text-sm text-muted-foreground">Adicione os primeiros tripulantes (pode adicionar mais depois)</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {crewMembers.map((crew, idx) => (
                      <motion.div
                        key={`crew-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 items-start p-3 rounded-xl bg-muted/30 border border-border/50"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Nome *</Label>
                            <Input
                              placeholder="João da Silva"
                              value={crew.full_name}
                              onChange={e => updateCrew(idx, "full_name", e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Posto/Função</Label>
                            <Select value={crew.rank} onValueChange={v => updateCrew(idx, "rank", v)}>
                              <SelectTrigger className="h-9"><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                {RANKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {crewMembers.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removeCrewRow(idx)} className="h-9 w-9 mt-5 text-muted-foreground hover:text-destructive" aria-label="Remover tripulante">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <Button variant="outline" onClick={addCrewRow} className="w-full gap-2" size="sm">
                    <Plus className="h-4 w-4" /> Adicionar tripulante
                  </Button>

                  <Separator />

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setPhase("vessel")} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Voltar
                    </Button>
                    <Button
                      onClick={handleAddCrew}
                      disabled={isSubmitting}
                      className="flex-1 h-11 gap-2 font-semibold"
                    >
                      {isSubmitting ? "Salvando..." : "Cadastrar Tripulação"}
                      {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setPhase("explore")}
                    className="w-full text-sm text-muted-foreground"
                  >
                    Pular esta etapa →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ═══ EXPLORE ═══ */}
          {phase === "explore" && (
            <motion.div key="explore" {...pageVariants}>
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                <CardContent className="p-8 space-y-6">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Configuração concluída!</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Aqui está um resumo do que foi criado. Você pode acessar tudo pelo menu lateral.
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Organização", value: orgName || "—", icon: Building2, done: !!createdOrgId },
                      { label: "Embarcação", value: vesselName || "—", icon: Ship, done: !!createdVesselId },
                      { label: "Tripulantes", value: `${crewMembers.filter(c => c.full_name.trim()).length}`, icon: Users, done: crewMembers.some(c => c.full_name.trim()) },
                    ].map(item => (
                      <motion.div
                        key={item.label}
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "p-4 rounded-xl border text-center transition-all",
                          item.done ? "border-primary/30 bg-primary/5" : "border-border/50 bg-muted/20"
                        )}
                      >
                        <item.icon className={cn("h-6 w-6 mx-auto mb-2", item.done ? "text-primary" : "text-muted-foreground")} />
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-semibold truncate mt-0.5">{item.value}</p>
                        {item.done && (
                          <Badge variant="secondary" className="mt-2 text-[10px] bg-primary/10 text-primary border-primary/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Criado
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Demo Data Loader */}
                  <div className="p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold">Dados de Demonstração</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Popule o sistema com dados realistas de operação marítima: embarcações, tripulação, viagens, manutenção e certificações.
                    </p>
                    {seedProgress && isSeeding && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{seedProgress.step.replace("_", " ")}</span>
                          <span>{seedProgress.current}/{seedProgress.total}</span>
                        </div>
                        <Progress value={(seedProgress.current / seedProgress.total) * 100} className="h-1.5" />
                      </div>
                    )}
                    {seedComplete ? (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Dados demo carregados!
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSeedDemoData}
                        disabled={isSeeding || !createdOrgId}
                        className="w-full gap-2"
                      >
                        {isSeeding ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <Compass className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {isSeeding ? "Carregando dados..." : "Carregar Dados Demo"}
                      </Button>
                    )}
                  </div>

                  {/* Quick links */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Próximos passos recomendados</p>
                    {[
                      { label: "Adicionar certificações da tripulação", path: "/modules/nautilus-people" },
                      { label: "Configurar checklists de compliance", path: "/compliance" },
                      { label: "Ver dashboard operacional", path: "/command" },
                    ].map((link) => (
                      <button
                        key={link.path}
                        onClick={() => {
                          handleFinish();
                          navigate(link.path);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all text-left group"
                      >
                        <span className="text-sm">{link.label}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    ))}
                  </div>

                  <Button
                    size="lg"
                    onClick={() => {
                      handleFinish();
                      navigate("/command");
                    }}
                    className="w-full h-12 gap-2 text-base font-semibold shadow-lg shadow-primary/20"
                  >
                    <Rocket className="h-5 w-5" />
                    Ir para o Command Center
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* ═══ COMPLETE (celebration) ═══ */}
          {phase === "complete" && (
            <motion.div key="complete" {...pageVariants}>
              <Card className="border-0 shadow-2xl bg-card/80 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-12 text-center space-y-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  >
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary via-accent to-primary/60 flex items-center justify-center shadow-2xl shadow-primary/40">
                      <Star className="h-12 w-12 text-primary-foreground" />
                    </div>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-3xl font-bold">🎉 Configuração Completa!</h2>
                    <p className="text-muted-foreground mt-2">
                      Redirecionando para o dashboard...
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
