/**
 * Compliance KPI Component
 * PATCH 622 - Modularized dashboard metric
 */

import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function ComplianceKPI() {
  const [compliance, setCompliance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchCompliance = async () => {
      try {
        // Simulate fetching compliance data - replace with actual query
        // const { data, error } = await supabase.from('compliance_metrics').select('score').single();
        
        // For now, simulate delay and data
        await new Promise(resolve => setTimeout(resolve, 700));
        
        if (mounted) {
          setCompliance(95.8); // Example value
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchCompliance();

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
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <div className="h-9 w-24 bg-gray-200 rounded mt-1"></div>
            </div>
            <Shield className="h-8 w-8 text-gray-300" />
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
              <p className="text-sm text-muted-foreground">Compliance Score</p>
              <p className="text-sm text-red-600">Erro ao carregar</p>
            </div>
            <Shield className="h-8 w-8 text-red-300" />
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
            <p className="text-3xl font-bold text-purple-600">{compliance}%</p>
          </div>
          <Shield className="h-8 w-8 text-purple-600" />
        </div>
      </CardContent>
    </Card>
  );
}
