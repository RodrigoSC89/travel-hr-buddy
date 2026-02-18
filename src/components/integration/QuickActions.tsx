/**
 * NAUTI ONE — Quick Actions
 * Contextual action buttons that create cross-module records
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wrench, AlertTriangle, FileText, Anchor, DollarSign,
  Shield, Users, ClipboardCheck, Zap, Plus
} from "lucide-react";
import type { EntityType } from "@/lib/domain/types";
import { toast } from "sonner";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  targetRoute: string;
  params?: Record<string, string | undefined>;
  color: string;
}

const QUICK_ACTIONS_MAP: Partial<Record<EntityType, (ctx: ActionContext) => QuickAction[]>> = {
  vessel: (ctx) => [
    {
      id: 'create-voyage',
      label: 'Nova Viagem',
      description: 'Criar viagem para este navio',
      icon: <Anchor className="h-4 w-4" />,
      targetRoute: '/voyage-management',
      params: { vessel_id: ctx.entityId },
      color: 'text-blue-400',
    },
    {
      id: 'create-wo',
      label: 'Nova OS',
      description: 'Criar ordem de serviço',
      icon: <Wrench className="h-4 w-4" />,
      targetRoute: '/maintenance',
      params: { vessel_id: ctx.entityId, action: 'new' },
      color: 'text-orange-400',
    },
    {
      id: 'create-audit',
      label: 'Nova Auditoria',
      description: 'Iniciar auditoria interna',
      icon: <ClipboardCheck className="h-4 w-4" />,
      targetRoute: '/compliance',
      params: { vessel_id: ctx.entityId, action: 'new-audit' },
      color: 'text-purple-400',
    },
    {
      id: 'view-crew',
      label: 'Ver Tripulação',
      description: 'Gestão de tripulação',
      icon: <Users className="h-4 w-4" />,
      targetRoute: '/crew-management',
      params: { vessel_id: ctx.entityId },
      color: 'text-green-400',
    },
  ],
  audit: (ctx) => [
    {
      id: 'create-finding',
      label: 'Registrar Achado',
      description: 'Nova não-conformidade',
      icon: <AlertTriangle className="h-4 w-4" />,
      targetRoute: '/non-conformities',
      params: { audit_id: ctx.entityId, action: 'new' },
      color: 'text-red-400',
    },
    {
      id: 'attach-evidence',
      label: 'Anexar Evidência',
      description: 'Vincular documento',
      icon: <FileText className="h-4 w-4" />,
      targetRoute: '/document-center',
      params: { entity_type: 'audit', entity_id: ctx.entityId },
      color: 'text-blue-400',
    },
  ],
  finding: (ctx) => [
    {
      id: 'create-capa',
      label: 'Criar CAPA',
      description: 'Ação corretiva/preventiva',
      icon: <Shield className="h-4 w-4" />,
      targetRoute: '/non-conformities',
      params: { finding_id: ctx.entityId, action: 'new-capa' },
      color: 'text-purple-400',
    },
    {
      id: 'create-wo-from-finding',
      label: 'Criar OS',
      description: 'Ordem de serviço corretiva',
      icon: <Wrench className="h-4 w-4" />,
      targetRoute: '/maintenance',
      params: { source: 'finding', source_id: ctx.entityId, action: 'new' },
      color: 'text-orange-400',
    },
  ],
  work_order: (ctx) => [
    {
      id: 'create-po',
      label: 'Criar Pedido de Compra',
      description: 'PO para peças/serviços',
      icon: <DollarSign className="h-4 w-4" />,
      targetRoute: '/procurement',
      params: { source: 'work_order', source_id: ctx.entityId },
      color: 'text-green-400',
    },
    {
      id: 'attach-docs',
      label: 'Anexar Documentos',
      description: 'Evidências e relatórios',
      icon: <FileText className="h-4 w-4" />,
      targetRoute: '/document-center',
      params: { entity_type: 'work_order', entity_id: ctx.entityId },
      color: 'text-blue-400',
    },
  ],
  voyage: (ctx) => [
    {
      id: 'view-pnl',
      label: 'Ver P&L',
      description: 'Resultado financeiro',
      icon: <DollarSign className="h-4 w-4" />,
      targetRoute: '/voyage-pnl',
      params: { voyage_id: ctx.entityId },
      color: 'text-green-400',
    },
    {
      id: 'track-vessel',
      label: 'Rastrear Navio',
      description: 'Posição e tracking',
      icon: <Anchor className="h-4 w-4" />,
      targetRoute: '/fleet-tracking',
      params: { vessel_id: ctx.vesselId ?? '' },
      color: 'text-cyan-400',
    },
  ],
};

interface ActionContext {
  entityId: string;
  entityType: EntityType;
  vesselId?: string;
  extra?: Record<string, string>;
}

interface QuickActionsProps {
  entityType: EntityType;
  entityId: string;
  vesselId?: string;
  className?: string;
  compact?: boolean;
}

export function QuickActions({ entityType, entityId, vesselId, className, compact }: QuickActionsProps) {
  const navigate = useNavigate();
  const ctx: ActionContext = { entityId, entityType, vesselId };
  const actionsFn = QUICK_ACTIONS_MAP[entityType];
  const actions = actionsFn?.(ctx) ?? [];

  if (actions.length === 0) return null;

  const handleAction = (action: QuickAction) => {
    const filtered: Record<string, string> = {};
    if (action.params) {
      for (const [k, v] of Object.entries(action.params)) {
        if (v !== undefined) filtered[k] = v;
      }
    }
    const params = new URLSearchParams(filtered);
    const url = `${action.targetRoute}${params.toString() ? `?${params.toString()}` : ''}`;
    toast.info(`Abrindo: ${action.label}`);
    navigate(url);
  };

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className ?? ''}`}>
        {actions.map((action) => (
          <Button
            key={action.id}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-8"
            onClick={() => handleAction(action)}
          >
            <span className={action.color}>{action.icon}</span>
            {action.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Card className={`border-border/50 bg-card/50 backdrop-blur ${className ?? ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Ações Rápidas
          <Badge variant="outline" className="ml-auto text-xs">{actions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="h-auto py-3 px-3 flex flex-col items-start gap-1 hover:bg-muted/50 transition-colors"
              onClick={() => handleAction(action)}
            >
              <div className="flex items-center gap-2">
                <span className={action.color}>{action.icon}</span>
                <span className="text-xs font-medium">{action.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-normal">
                {action.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
