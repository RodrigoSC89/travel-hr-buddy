/**
 * Vessels KPI Component
 * PATCH 622 - Modularized dashboard metric
 */

import { Card, CardContent } from "@/components/ui/card";
import { Ship } from "lucide-react";
import { useEffect, useState } from "react";;;
import { supabase } from "@/integrations/supabase/client";

export function VesselsKPI() {
  const [vessels, setVessels] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchVessels = async () => {
      try {
        // Simulate fetching vessels data - replace with actual query
        // const { data, error } = await supabase.from('vessels').select('id', { count: 'exact' });
        
        // For now, simulate delay and data
        await new Promise(resolve => setTimeout(resolve, 600));
        
        if (mounted) {
          setVessels(24); // Example value
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
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Embarcações Ativas</p>
              <p className="text-sm text-red-600">Erro ao carregar</p>
            </div>
            <Ship className="h-8 w-8 text-red-300" />
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
            <p className="text-3xl font-bold text-blue-600">{vessels}</p>
          </div>
          <Ship className="h-8 w-8 text-blue-600" />
        </div>
      </CardContent>
    </Card>
  );
}
