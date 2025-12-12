/**
 * Efficiency KPI Component
 * PATCH 622 - Modularized dashboard metric
 */

import { Card, CardContent } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { memo, memo, useEffect, useState } from "react";;;
import { supabase } from "@/integrations/supabase/client";

export const EfficiencyKPI = memo(function() {
  const [efficiency, setEfficiency] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchEfficiency = async () => {
      try {
        // Simulate fetching efficiency data - replace with actual query
        // const { data, error } = await supabase.from('performance_metrics').select('efficiency').single();
        
        // For now, simulate delay and data
        await new Promise(resolve => setTimeout(resolve, 550));
        
        if (mounted) {
          setEfficiency("A+"); // Example value
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

    return () => {
      mounted = false;
    };
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
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Eficiência</p>
              <p className="text-sm text-red-600">Erro ao carregar</p>
            </div>
            <Zap className="h-8 w-8 text-red-300" />
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
            <p className="text-3xl font-bold text-orange-600">{efficiency}</p>
          </div>
          <Zap className="h-8 w-8 text-orange-600" />
        </div>
      </CardContent>
    </Card>
  );
}
