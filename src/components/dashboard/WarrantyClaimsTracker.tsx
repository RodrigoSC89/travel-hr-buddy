import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, DollarSign, Clock, CheckCircle, AlertTriangle, FileText } from "lucide-react";

export function WarrantyClaimsTracker() {
  const { data: claims = [], isLoading } = useQuery({
    queryKey: ["warranty-claims-tracker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("warranty_claims")
        .select("id, status, claim_amount, recovered_amount, equipment, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return <Card className="animate-pulse"><CardContent className="h-64" /></Card>;
  }

  const total = claims.length;
  const open = claims.filter(c => c.status === "open" || c.status === "submitted" || c.status === "in_review").length;
  const approved = claims.filter(c => c.status === "approved" || c.status === "resolved").length;
  const rejected = claims.filter(c => c.status === "rejected" || c.status === "denied").length;

  const totalClaimed = claims.reduce((s, c) => s + (c.claim_amount || 0), 0);
  const totalRecovered = claims.reduce((s, c) => s + (c.recovered_amount || 0), 0);
  const recoveryRate = totalClaimed > 0 ? Math.round((totalRecovered / totalClaimed) * 100) : 0;

  // Equipment breakdown
  const typeMap: Record<string, number> = {};
  claims.forEach(c => {
    const t = c.equipment || "general";
    typeMap[t] = (typeMap[t] || 0) + 1;
  });
  const topTypes = Object.entries(typeMap).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Recent claims
  const recent = claims.slice(0, 5);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Warranty Claims Tracker
          <Badge variant="outline" className="ml-auto text-xs">{total} claims</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <Clock className="h-4 w-4 text-warning mx-auto mb-1" />
            <p className="text-lg font-bold text-warning">{open}</p>
            <p className="text-[10px] text-muted-foreground">Em Aberto</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <CheckCircle className="h-4 w-4 text-success mx-auto mb-1" />
            <p className="text-lg font-bold text-success">{approved}</p>
            <p className="text-[10px] text-muted-foreground">Aprovadas</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <AlertTriangle className="h-4 w-4 text-destructive mx-auto mb-1" />
            <p className="text-lg font-bold text-destructive">{rejected}</p>
            <p className="text-[10px] text-muted-foreground">Rejeitadas</p>
          </div>
        </div>

        {/* Financial Recovery */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Recuperação Financeira
            </span>
            <Badge variant="outline" className={`text-xs ${recoveryRate >= 50 ? "text-success" : "text-destructive"}`}>
              {recoveryRate}% recuperado
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Reivindicado</p>
              <p className="font-bold">{formatCurrency(totalClaimed)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Recuperado</p>
              <p className="font-bold text-success">{formatCurrency(totalRecovered)}</p>
            </div>
          </div>
        </div>

        {/* Claim Types */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Equipamentos</p>
          <div className="flex flex-wrap gap-1.5">
            {topTypes.map(([type, count]) => (
              <Badge key={type} variant="secondary" className="text-xs capitalize">
                {type.replace(/_/g, " ")} ({count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Recent Claims */}
        {recent.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Recentes</p>
            <div className="space-y-1.5">
              {recent.slice(0, 3).map(c => (
                <div key={c.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[120px] capitalize">{c.equipment?.replace(/_/g, " ") || "Claim"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{formatCurrency(c.claim_amount || 0)}</span>
                    <Badge variant={c.status === "approved" || c.status === "resolved" ? "default" : "secondary"} className="text-[10px]">
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WarrantyClaimsTracker;
