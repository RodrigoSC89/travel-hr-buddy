import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export interface SGSOActionPlan {
  id: string;
  incident_id: string;
  vessel_id: string;
  correction_action: string | null;
  prevention_action: string | null;
  recommendation_action: string | null;
  status: "aberto" | "em_andamento" | "resolvido";
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  incident: {
    id: string;
    title: string | null;
    incident_date: string;
    severity: string;
    sgso_category: string | null;
    sgso_risk_level: string | null;
    description: string | null;
  };
}

interface SGSOHistoryTableProps {
  actionPlans: SGSOActionPlan[];
  onEdit?: (planId: string) => void;
}

export const SGSOHistoryTable: React.FC<SGSOHistoryTableProps> = ({
  actionPlans,
  onEdit,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (planId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aberto":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Aberto
          </Badge>
        );
      case "em_andamento":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600">
            <Clock className="h-3 w-3" />
            Em Andamento
          </Badge>
        );
      case "resolvido":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Resolvido
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskLevelBadge = (riskLevel: string | null) => {
    if (!riskLevel) return <Badge variant="outline">N/A</Badge>;

    switch (riskLevel.toLowerCase()) {
      case "crítico":
        return <Badge variant="destructive">🔴 Crítico</Badge>;
      case "alto":
        return <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600">🟠 Alto</Badge>;
      case "médio":
        return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">🟡 Médio</Badge>;
      case "baixo":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">🟢 Baixo</Badge>;
      default:
        return <Badge variant="outline">{riskLevel}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (actionPlans.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Nenhum plano de ação encontrado para esta embarcação.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Incidente</TableHead>
              <TableHead>Data do Incidente</TableHead>
              <TableHead>Categoria SGSO</TableHead>
              <TableHead>Nível de Risco</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              {onEdit && <TableHead className="w-[100px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {actionPlans.map((plan) => (
              <React.Fragment key={plan.id}>
                <TableRow className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(plan.id)}
                      aria-label={expandedRows.has(plan.id) ? "Fechar detalhes" : "Expandir detalhes"}
                    >
                      {expandedRows.has(plan.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    {plan.incident?.title || "Sem título"}
                  </TableCell>
                  <TableCell>{formatDate(plan.incident?.incident_date || "")}</TableCell>
                  <TableCell>
                    {plan.incident?.sgso_category ? (
                      <Badge variant="outline">{plan.incident.sgso_category}</Badge>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>{getRiskLevelBadge(plan.incident?.sgso_risk_level || null)}</TableCell>
                  <TableCell>{getStatusBadge(plan.status)}</TableCell>
                  <TableCell>{formatDate(plan.created_at)}</TableCell>
                  {onEdit && (
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(plan.id);
                        }}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
                {expandedRows.has(plan.id) && (
                  <TableRow>
                    <TableCell colSpan={onEdit ? 8 : 7}>
                      <Card className="bg-muted/30">
                        <CardContent className="p-4 space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">📋 Ação Corretiva</h4>
                            <p className="text-sm text-muted-foreground">
                              {plan.correction_action || "Não especificada"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">🛡️ Ação Preventiva</h4>
                            <p className="text-sm text-muted-foreground">
                              {plan.prevention_action || "Não especificada"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">💡 Recomendação</h4>
                            <p className="text-sm text-muted-foreground">
                              {plan.recommendation_action || "Não especificada"}
                            </p>
                          </div>
                          {plan.approved_by && (
                            <div className="pt-2 border-t">
                              <p className="text-sm">
                                <span className="font-semibold">Aprovado por:</span>{" "}
                                {plan.approved_by}
                              </p>
                              {plan.approved_at && (
                                <p className="text-sm text-muted-foreground">
                                  em {formatDate(plan.approved_at)}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
