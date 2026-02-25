/**
 * QuickSeedBanner - Shows a banner on empty dashboards to seed demo data
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Database, Rocket, X, CheckCircle, Ship, Users, Wrench } from "lucide-react";
import { seedDemoData, type SeedProgress } from "@/lib/seed/demo-data-seeder";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function QuickSeedBanner() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState<SeedProgress | null>(null);
  const [dismissed, setDismissed] = useState(() => 
    localStorage.getItem("nauti-seed-banner-dismissed") === "true"
  );
  const [seedDone, setSeedDone] = useState(false);

  // Check if there's any data already
  const { data: vesselCount } = useQuery({
    queryKey: ["vessel-count-check"],
    queryFn: async () => {
      const { count } = await supabase.from("vessels").select("id", { count: "exact", head: true });
      return count ?? 0;
    },
    staleTime: 60000,
  });

  // Get user's organization
  const { data: orgId } = useQuery({
    queryKey: ["user-org-for-seed"],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .maybeSingle();
      return data?.organization_id || null;
    },
    enabled: !!user?.id,
  });

  const handleSeed = useCallback(async () => {
    if (!orgId) {
      toast.error("Complete o onboarding primeiro", { 
        description: "Acesse /welcome para configurar sua organização." 
      });
      return;
    }
    setIsSeeding(true);
    setSeedDone(false);
    try {
      const result = await seedDemoData(orgId, (p) => setSeedProgress(p));
      if (result.success) {
        setSeedDone(true);
        toast.success("Dados demo carregados!", {
          description: `${Object.values(result.created).reduce((a, b) => a + b, 0)} registros criados em ${(result.durationMs / 1000).toFixed(1)}s`,
        });
        queryClient.invalidateQueries();
      } else {
        toast.error("Alguns erros ocorreram", { description: result.errors[0] });
      }
    } catch (err) {
      toast.error("Erro ao carregar dados demo");
    } finally {
      setIsSeeding(false);
    }
  }, [orgId, queryClient]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("nauti-seed-banner-dismissed", "true");
  };

  // Don't show if dismissed, already has data, or seed complete
  if (dismissed || (vesselCount && vesselCount > 0) || seedDone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-4 mb-6 overflow-hidden"
      >
        {/* Dismiss */}
        <button 
          onClick={handleDismiss} 
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              🚀 Comece com dados realistas
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Popule o sistema com embarcações, tripulação, viagens e certificações de demonstração para explorar todas as funcionalidades.
            </p>

            {/* Seed progress */}
            {isSeeding && seedProgress && (
              <div className="mb-3 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{seedProgress.step.replace("_", " ")}</span>
                  <span>{seedProgress.current}/{seedProgress.total}</span>
                </div>
                <Progress value={(seedProgress.current / seedProgress.total) * 100} className="h-1.5" />
              </div>
            )}

            {/* What will be created */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { icon: Ship, label: "3 Embarcações" },
                { icon: Users, label: "15 Tripulantes" },
                { icon: Wrench, label: "Manutenções" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground">
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
              ))}
            </div>

            <Button
              size="sm"
              onClick={handleSeed}
              disabled={isSeeding || !orgId}
              className="gap-2"
            >
              {isSeeding ? (
                <>
                  <Rocket className="h-3.5 w-3.5 animate-pulse" />
                  Carregando...
                </>
              ) : (
                <>
                  <Rocket className="h-3.5 w-3.5" />
                  Carregar Dados Demo
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-primary/5 pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}
