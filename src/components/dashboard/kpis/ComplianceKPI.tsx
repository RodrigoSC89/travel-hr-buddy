/**
 * Compliance KPI Component
 * Real data from Supabase audit_center_logs
 */

import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function ComplianceKPI() {
  const { data: compliance, isLoading: loading, error } = useQuery({
    queryKey: ['compliance-kpi-score'],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from('audit_center_logs')
        .select('compliance_score')
        .not('compliance_score', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (queryError) throw queryError;

      const avg = data && data.length > 0
        ? data.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / data.length
        : 0;

      return Math.round(avg * 10) / 10;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between animate-pulse">
            <div>
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <div className="h-9 w-24 bg-muted rounded mt-1"></div>
            </div>
            <Shield className="h-8 w-8 text-muted-foreground" />
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
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <p className="text-sm text-destructive">Erro ao carregar</p>
            </div>
            <Shield className="h-8 w-8 text-destructive/50" />
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
            <p className="text-sm text-muted-foreground">Compliance Score</p>
            <p className="text-3xl font-bold text-primary">
              {compliance != null && compliance > 0 ? `${compliance}%` : 'N/A'}
            </p>
          </div>
          <Shield className="h-8 w-8 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
