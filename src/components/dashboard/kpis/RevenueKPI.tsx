/**
 * Revenue KPI Component
 * Real data from crew_payroll (net_pay)
 */

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function RevenueKPI() {
  const [revenue, setRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRevenue = async () => {
      try {
        const { data, error: queryError } = await supabase
          .from('financial_transactions')
          .select('amount, type')
          .eq('type', 'income');

        if (queryError) throw queryError;

        const total = data?.reduce((sum, r) => sum + (r.amount || 0), 0) ?? 0;

        if (mounted) {
          setRevenue(total);
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
    return () => { mounted = false; };
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
      <Card className="border-destructive/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-sm text-destructive">Erro ao carregar</p>
            </div>
            <TrendingUp className="h-8 w-8 text-destructive/50" />
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
            <p className="text-3xl font-bold text-primary">
              {revenue !== null && revenue > 0
                ? `R$ ${revenue.toLocaleString("pt-BR")}`
                : 'N/A'}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
