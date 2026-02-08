/**
 * Efficiency KPI Component
 * Real data derived from operational_checklists completion rate
 */

import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function EfficiencyKPI() {
  const [efficiency, setEfficiency] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchEfficiency = async () => {
      try {
        const { count: totalCount } = await supabase
          .from('operational_checklists')
          .select('*', { count: 'exact', head: true });

        const { count: completedCount } = await supabase
          .from('operational_checklists')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        const total = totalCount ?? 0;
        const completed = completedCount ?? 0;
        const rate = total > 0 ? (completed / total) * 100 : 0;

        // Map rate to grade
        let grade = "N/A";
        if (total > 0) {
          if (rate >= 95) grade = "A+";
          else if (rate >= 90) grade = "A";
          else if (rate >= 80) grade = "B+";
          else if (rate >= 70) grade = "B";
          else if (rate >= 60) grade = "C";
          else grade = "D";
        }

        if (mounted) {
          setEfficiency(grade);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchEfficiency();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between animate-pulse">
            <div>
              <p className="text-sm text-muted-foreground">Eficiência</p>
              <div className="h-9 w-16 bg-muted rounded mt-1"></div>
            </div>
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Eficiência</p>
              <p className="text-sm text-destructive">Erro ao carregar</p>
            </div>
            <Zap className="h-8 w-8 text-destructive/50" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Eficiência</p>
            <p className="text-3xl font-bold text-primary">{efficiency}</p>
          </div>
          <Zap className="h-8 w-8 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
