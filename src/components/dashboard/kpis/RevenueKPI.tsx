/**
 * Revenue KPI Component
 * PATCH 622 - Modularized dashboard metric
 */

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { memo, memo, useEffect, useState } from "react";;;
import { supabase } from "@/integrations/supabase/client";

export const RevenueKPI = memo(function() {
  const [revenue, setRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRevenue = async () => {
      try {
        // Simulate fetching revenue data - replace with actual query
        // const { data, error } = await supabase.from('financial_metrics').select('revenue').single();
        
        // For now, simulate delay and data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (mounted) {
          setRevenue(2847000); // Example value
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchRevenue();

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
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <div className="h-9 w-32 bg-muted rounded mt-1"></div>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
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
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-sm text-red-600">Erro ao carregar</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-300" />
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
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-3xl font-bold text-green-600">
              R$ {revenue?.toLocaleString("pt-BR")}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
      </CardContent>
    </Card>
  );
}
