import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChevronDown, 
  ChevronRight, 
  Edit, 
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";

/**
 * SGSO Action Plan with Incident Details
 */
export interface SGSOActionPlan {
  id: string;
  corrective_action: string;
  preventive_action: string;
  recommendation: string;
  status: "aberto" | "em_andamento" | "resolvido";
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  dp_incidents: {
    id: string;
    description: string;
    sgso_category: string;
    sgso_risk_level: string;
    updated_at: string;
    incident_date: string;
  };
}

interface SGSOHistoryTableProps {
  plans: SGSOActionPlan[];
  onEdit?: (plan: SGSOActionPlan) => void;
}

/**
 * SGSO History Table Component
 * 
 * Displays action plans history with:
 * - Color-coded status badges
 * - Expandable action plan details
 * - Risk level indicators
 * - Approval information
 * - Optional edit functionality
 */
export const SGSOHistoryTable: React.FC<SGSOHistoryTableProps> = ({ 
  plans, 
  onEdit 
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (planId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberto: {
        variant: "destructive" as const,
        icon: AlertCircle,
        label: "Aberto",
      },
      em_andamento: {
        variant: "default" as const,
        icon: Clock,
        label: "Em Andamento",
      },
      resolvido: {
        variant: "default" as const,
        icon: CheckCircle2,
        label: "Resolvido",
        className: "bg-green-600 hover:bg-green-700",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.aberto;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRiskBadge = (riskLevel: string) => {
    const riskConfig = {
      Crítico: "destructive",
      Alto: "default",
      Médio: "secondary",
      Baixo: "outline",
    };

    return (
      <Badge variant={riskConfig[riskLevel as keyof typeof riskConfig] as any || "secondary"}>
        {riskLevel}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Nenhum plano de ação encontrado para esta embarcação.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>📜 Histórico de Planos de Ação SGSO</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Incidente</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Risco</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aprovador</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <React.Fragment key={plan.id}>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell onClick={() => toggleRow(plan.id)}>
                        {expandedRows.has(plan.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </TableCell>
                      <TableCell onClick={() => toggleRow(plan.id)}>
                        {formatDate(plan.dp_incidents.updated_at || plan.dp_incidents.incident_date)}
                      </TableCell>
                      <TableCell 
                        onClick={() => toggleRow(plan.id)}
                        className="max-w-[200px] truncate"
                      >
                        {plan.dp_incidents.description}
                      </TableCell>
                      <TableCell onClick={() => toggleRow(plan.id)}>
                        {plan.dp_incidents.sgso_category || "—"}
                      </TableCell>
                      <TableCell onClick={() => toggleRow(plan.id)}>
                        {plan.dp_incidents.sgso_risk_level ? 
                          getRiskBadge(plan.dp_incidents.sgso_risk_level) : 
                          "—"
                        }
                      </TableCell>
                      <TableCell onClick={() => toggleRow(plan.id)}>
                        {getStatusBadge(plan.status)}
                      </TableCell>
                      <TableCell onClick={() => toggleRow(plan.id)}>
                        {plan.approved_by || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit(plan);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedRows.has(plan.id) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/30">
                          <div className="p-4 space-y-4">
                            <div>
                              <h4 className="font-semibold mb-2">Plano de Ação</h4>
                              <div className="space-y-3 text-sm">
                                {plan.corrective_action && (
                                  <div>
                                    <span className="font-medium">Ação Corretiva:</span>
                                    <p className="text-muted-foreground mt-1">
                                      {plan.corrective_action}
                                    </p>
                                  </div>
                                )}
                                {plan.preventive_action && (
                                  <div>
                                    <span className="font-medium">Ação Preventiva:</span>
                                    <p className="text-muted-foreground mt-1">
                                      {plan.preventive_action}
                                    </p>
                                  </div>
                                )}
                                {plan.recommendation && (
                                  <div>
                                    <span className="font-medium">Recomendações:</span>
                                    <p className="text-muted-foreground mt-1">
                                      {plan.recommendation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            {plan.approved_at && (
                              <div className="text-sm text-muted-foreground">
                                <span className="font-medium">Aprovado em:</span>{" "}
                                {formatDate(plan.approved_at)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
