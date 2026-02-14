/**
 * WelcomeHero - Cinematographic welcome section for Command Center
 * Shows real-time system status with premium animations
 */
import { motion, useReducedMotion } from "framer-motion";
import { Ship, Users, Shield, Brain, Activity, Globe } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { StaggeredContainer, StaggeredItem, GlassCard } from "@/components/ui/WorldClassTransitions";
import { PulseDot } from "@/components/ui/MicroInteractions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDemoMode } from "@/contexts/DemoContext";

const quickStats = [
  { key: "vessels", label: "Embarcações", icon: Ship, fallback: 12 },
  { key: "crew", label: "Tripulantes", icon: Users, fallback: 148 },
  { key: "audits", label: "Auditorias", icon: Shield, fallback: 23 },
  { key: "maintenance", label: "Manutenções", icon: Activity, fallback: 67 },
  { key: "documents", label: "Documentos", icon: Globe, fallback: 340 },
  { key: "certificates", label: "Certificados", icon: Brain, fallback: 89 },
];

export function WelcomeHero() {
  const shouldReduce = useReducedMotion();
  const { isDemoMode } = useDemoMode();

  const { data: stats } = useQuery({
    queryKey: ["system-stats-hero"],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_system_stats");
      return data as Record<string, number> | null;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !isDemoMode,
  });

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return "Boa madrugada";
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <motion.div
        initial={shouldReduce ? false : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {greeting}, <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Comandante</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Centro de Comando Operacional — Todos os sistemas operacionais
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <PulseDot color="green" size="sm" />
          <span className="text-xs font-medium text-success">Sistema Online</span>
        </div>
      </motion.div>

      {/* Quick stats grid */}
      <StaggeredContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          const value = stats?.[stat.key] ?? stat.fallback;
          return (
            <StaggeredItem key={stat.key}>
              <GlassCard className="p-4 text-center">
                <Icon className="h-5 w-5 mx-auto text-primary/70 mb-2" />
                <div className="text-2xl font-bold">
                  <AnimatedCounter value={value as number} duration={800} />
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {stat.label}
                </span>
              </GlassCard>
            </StaggeredItem>
          );
        })}
      </StaggeredContainer>
    </div>
  );
}
