/**
 * Vessels KPI Component
 * Real data from Supabase
 */

import { Card, CardContent } from "@/components/ui/card";
import { Ship } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function VesselsKPI() {
  const [vessels, setVessels] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchVessels = async () => {
      try {
        const { count, error: queryError } = await supabase
          .from('vessels')
          .select('*', { count: 'exact', head: true })
          .in('status', ['active', 'operational']);

        if (queryError) throw queryError;
        
        if (mounted) {
          setVessels(count ?? 0);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    };

    fetchVessels();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between animate-pulse">
            <div>
              <p className="text-sm text-muted-foreground">Embarcações Ativas</p>
              <div className="h-9 w-16 bg-muted rounded mt-1"></div>
            </div>
            <Ship className="h-8 w-8 text-muted-foreground" />
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
              <p className="text-sm text-muted-foreground">Embarcações Ativas</p>
              <p className="text-sm text-destructive">Erro ao carregar</p>
            </div>
            <Ship className="h-8 w-8 text-destructive/50" />
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
            <p className="text-sm text-muted-foreground">Embarcações Ativas</p>
            <p className="text-3xl font-bold text-primary">{vessels}</p>
          </div>
          <Ship className="h-8 w-8 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
