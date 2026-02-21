/**
 * NAUTI ONE — Related Records Panel
 * Shows all linked entities for any core record
 * Fetches real data from DB via foreign keys
 */

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { RELATED_RECORDS_MAP, type EntityType } from "@/lib/domain/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Ship, Anchor, Users, FileText, AlertTriangle, Wrench,
  DollarSign, MapPin, Shield, ClipboardCheck, Package,
  Clock, ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ICON_MAP: Record<string, React.ReactNode> = {
  voyage: <Anchor className="h-4 w-4" />,
  work_order: <Wrench className="h-4 w-4" />,
  maintenance_task: <Wrench className="h-4 w-4" />,
  audit: <ClipboardCheck className="h-4 w-4" />,
  certificate: <Shield className="h-4 w-4" />,
  crew_member: <Users className="h-4 w-4" />,
  alert: <AlertTriangle className="h-4 w-4" />,
  invoice: <DollarSign className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  port_call: <MapPin className="h-4 w-4" />,
  noon_report: <FileText className="h-4 w-4" />,
  expense: <DollarSign className="h-4 w-4" />,
  finding: <AlertTriangle className="h-4 w-4" />,
  inventory_item: <Package className="h-4 w-4" />,
  position: <MapPin className="h-4 w-4" />,
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-300 border-green-500/30",
  completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  overdue: "bg-red-500/20 text-red-300 border-red-500/30",
  cancelled: "bg-muted text-muted-foreground",
  draft: "bg-muted text-muted-foreground",
  open: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  closed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  on_board: "bg-green-500/20 text-green-300 border-green-500/30",
  on_leave: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

// Safe tables we can query
const QUERYABLE_TABLES = [
  'voyage_plans', 'pms_work_orders', 'internal_audits', 'class_surveys',
  'crew_members', 'soc_alerts', 'invoices', 'maintenance_tasks',
  'port_calls', 'noon_reports', 'expenses', 'entity_documents',
  'non_conformities', 'certificates'
] as const;

type QueryableTable = typeof QUERYABLE_TABLES[number];

function isQueryable(table: string): table is QueryableTable {
  return QUERYABLE_TABLES.includes(table as QueryableTable);
}

interface RelatedRecordsPanelProps {
  entityType: EntityType;
  entityId: string;
  vesselId?: string;
  className?: string;
}

function getRecordTitle(record: any, entityType: EntityType): string {
  if (record.title) return record.title;
  if (record.name) return record.name;
  if (record.full_name) return record.full_name;
  if (record.voyage_number) return `Viagem ${record.voyage_number}`;
  if (record.audit_number) return `Auditoria ${record.audit_number}`;
  if (record.invoice_number) return `Fatura ${record.invoice_number}`;
  if (record.work_order_number) return `OS ${record.work_order_number}`;
  if (record.certificate_type) return record.certificate_type;
  if (record.alert_type) return record.alert_type;
  if (record.message) return record.message.slice(0, 60);
  if (record.description) return record.description.slice(0, 60);
  return `${entityType} #${(record.id as string).slice(0, 8)}`;
}

function getRecordStatus(record: any): string | null {
  return record.status ?? record.severity ?? null;
}

function getRecordDate(record: any): string | null {
  const dateField = record.created_at ?? record.scheduled_date ?? record.due_date ?? record.start_date;
  if (!dateField) return null;
  try {
    return format(new Date(dateField), "dd MMM yyyy", { locale: ptBR });
  } catch {
    return null;
  }
}

export function RelatedRecordsPanel({ entityType, entityId, vesselId, className }: RelatedRecordsPanelProps) {
  const relatedConfigs = useMemo(() => RELATED_RECORDS_MAP[entityType] ?? [], [entityType]);
  const navigate = useNavigate();

  if (relatedConfigs.length === 0) return null;

  return (
    <Card className={`border-border/50 bg-card/50 backdrop-blur ${className ?? ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-primary" />
          Registros Relacionados
          <Badge variant="outline" className="ml-auto text-xs">
            {relatedConfigs.length} tipos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue={relatedConfigs[0]?.entityType} className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 h-auto flex-wrap">
              {relatedConfigs.map((config) => (
                <TabsTrigger
                  key={config.entityType}
                  value={config.entityType}
                  className="text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary gap-1.5 py-2"
                >
                  {ICON_MAP[config.entityType] ?? <FileText className="h-3.5 w-3.5" />}
                  {config.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {relatedConfigs.map((config) => (
            <TabsContent key={config.entityType} value={config.entityType} className="m-0">
              <RelatedRecordsList
                config={config}
                entityId={entityId}
                vesselId={vesselId}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function RelatedRecordsList({
  config,
  entityId,
  vesselId,
}: {
  config: { entityType: EntityType; label: string; foreignKey: string; targetTable: string };
  entityId: string;
  vesselId?: string;
}) {
  const tableName = config.targetTable;
  const fk = config.foreignKey;
  const lookupId = fk === 'vessel_id' ? (vesselId ?? entityId) : entityId;

  const { data, isLoading, error } = useQuery({
    queryKey: ['related-records', tableName, fk, lookupId],
    queryFn: async () => {
      if (!isQueryable(tableName)) return [];
      const { data, error } = await fromUntyped(tableName)
        .select('*')
        .eq(fk, lookupId)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!lookupId,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  if (error || !data?.length) {
    return (
      <div className="p-6 text-center text-muted-foreground text-sm">
        {error ? 'Erro ao carregar dados' : `Nenhum(a) ${config.label.toLowerCase()} encontrado(a)`}
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[300px]">
      <div className="divide-y divide-border/30">
        {data.map((record: any) => {
          const title = getRecordTitle(record, config.entityType);
          const status = getRecordStatus(record);
          const date = getRecordDate(record);
          return (
            <div
              key={record.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors group"
            >
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {ICON_MAP[config.entityType] ?? <FileText className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{title}</p>
                {date && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {date}
                  </p>
                )}
              </div>
              {status && (
                <Badge
                  variant="outline"
                  className={`text-[10px] capitalize ${STATUS_COLORS[status] ?? ''}`}
                >
                  {status}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
