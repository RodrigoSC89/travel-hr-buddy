/**
 * NAUTI ONE — Cross-Module Integration Health Widget
 * Shows integration status across all modules
 */

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Network, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface ModuleIntegration {
  name: string;
  tables: string[];
  connectedTo: string[];
}

const MODULE_INTEGRATIONS: ModuleIntegration[] = [
  { name: "Fleet", tables: ["vessels"], connectedTo: ["Voyage", "Maintenance", "Compliance", "Tracking", "Crew"] },
  { name: "Voyage", tables: ["voyage_plans"], connectedTo: ["Fleet", "Finance", "Tracking", "Documents"] },
  { name: "Maintenance", tables: ["maintenance_tasks", "pms_work_orders"], connectedTo: ["Fleet", "Compliance", "Procurement", "Documents"] },
  { name: "Compliance", tables: ["internal_audits", "non_conformities"], connectedTo: ["Fleet", "Maintenance", "Documents", "Training"] },
  { name: "Finance", tables: ["invoices", "expenses"], connectedTo: ["Voyage", "Procurement", "Contracts"] },
  { name: "Crew", tables: ["crew_members"], connectedTo: ["Fleet", "Training", "Medical", "Documents"] },
  { name: "Tracking", tables: ["soc_alerts"], connectedTo: ["Fleet", "Voyage", "System"] },
  { name: "Documents", tables: ["ai_documents", "entity_documents"], connectedTo: ["All Modules"] },
  { name: "AI", tables: ["ai_decisions", "ai_insights"], connectedTo: ["All Modules"] },
];

export function IntegrationHealthWidget({ className }: { className?: string }) {
  const { data: counts } = useQuery({
    queryKey: ['integration-health-counts'],
    queryFn: async () => {
      const results: Record<string, number> = {};
      
      // Query counts in parallel for key tables
      const queries = [
        supabase.from('vessels').select('id', { count: 'exact', head: true }),
        supabase.from('voyage_plans').select('id', { count: 'exact', head: true }),
        supabase.from('maintenance_tasks').select('id', { count: 'exact', head: true }),
        supabase.from('internal_audits').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('id', { count: 'exact', head: true }),
        supabase.from('crew_members').select('id', { count: 'exact', head: true }),
        supabase.from('soc_alerts').select('id', { count: 'exact', head: true }),
        supabase.from('ai_documents').select('id', { count: 'exact', head: true }),
        supabase.from('ai_insights').select('id', { count: 'exact', head: true }),
      ];

      const responses = await Promise.all(queries);
      const tableNames = ['vessels', 'voyage_plans', 'maintenance_tasks', 'internal_audits', 'invoices', 'crew_members', 'soc_alerts', 'ai_documents', 'ai_insights'];
      
      responses.forEach((r, i) => {
        results[tableNames[i]] = r.count ?? 0;
      });

      return results;
    },
    staleTime: 60_000,
  });

  const totalRecords = Object.values(counts ?? {}).reduce((a, b) => a + b, 0);
  const activeModules = MODULE_INTEGRATIONS.filter(m => 
    m.tables.some(t => (counts?.[t] ?? 0) > 0)
  ).length;
  const integrationScore = Math.round((activeModules / MODULE_INTEGRATIONS.length) * 100);

  return (
    <Card className={`border-border/50 bg-card/50 backdrop-blur ${className ?? ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Network className="h-4 w-4 text-primary" />
          Saúde da Integração
          <Badge variant="outline" className="ml-auto text-xs">
            {activeModules}/{MODULE_INTEGRATIONS.length} módulos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Score de Integração</span>
            <span className="font-medium">{integrationScore}%</span>
          </div>
          <Progress value={integrationScore} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold">{totalRecords.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Registros Totais</p>
          </div>
          <div>
            <p className="text-lg font-bold">{activeModules}</p>
            <p className="text-[10px] text-muted-foreground">Módulos Ativos</p>
          </div>
          <div>
            <p className="text-lg font-bold">{MODULE_INTEGRATIONS.reduce((a, m) => a + m.connectedTo.length, 0)}</p>
            <p className="text-[10px] text-muted-foreground">Conexões</p>
          </div>
        </div>

        <div className="space-y-1.5">
          {MODULE_INTEGRATIONS.map(mod => {
            const hasData = mod.tables.some(t => (counts?.[t] ?? 0) > 0);
            const recordCount = mod.tables.reduce((a, t) => a + (counts?.[t] ?? 0), 0);
            return (
              <div key={mod.name} className="flex items-center gap-2 text-xs py-1">
                {hasData ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                )}
                <span className="flex-1">{mod.name}</span>
                <span className="text-muted-foreground">{recordCount}</span>
                <Badge variant="outline" className="text-[9px] h-4">
                  {mod.connectedTo.length} links
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
