import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DPIncident {
  description?: string;
  updated_at?: string;
  sgso_category?: string;
  sgso_risk_level?: string;
  title?: string;
  date?: string;
}

interface ActionPlan {
  id: string;
  corrective_action?: string;
  preventive_action?: string;
  recommendation?: string;
  status: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  dp_incidents?: DPIncident;
}

interface SGSOHistoryTableProps {
  plans: ActionPlan[];
  onEdit?: (planId: string) => void;
}

const statusColors: Record<string, string> = {
  aberto: "bg-red-500",
  em_andamento: "bg-yellow-500",
  resolvido: "bg-green-600",
};

const statusLabels: Record<string, string> = {
  aberto: "Aberto",
  em_andamento: "Em Andamento",
  resolvido: "Resolvido",
};

export function SGSOHistoryTable({ plans, onEdit }: SGSOHistoryTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("pt-BR");
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">📜 Histórico de Planos de Ação SGSO</h2>
      {plans.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Nenhum plano de ação encontrado para esta embarcação.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Incidente</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Plano de Ação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aprovador</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id} className="border-t">
                  <TableCell>
                    {formatDate(plan.dp_incidents?.date || plan.dp_incidents?.updated_at)}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium text-sm">
                        {plan.dp_incidents?.title || "—"}
                      </div>
                      {plan.dp_incidents?.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {plan.dp_incidents.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {plan.dp_incidents?.sgso_category || "—"}
                  </TableCell>
                  <TableCell>
                    {plan.dp_incidents?.sgso_risk_level ? (
                      <Badge variant="outline">
                        {plan.dp_incidents.sgso_risk_level}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <details className="cursor-pointer">
                      <summary className="text-blue-600 hover:underline">
                        Ver detalhes
                      </summary>
                      <div className="mt-2 space-y-2 text-sm">
                        {plan.corrective_action && (
                          <div>
                            <strong className="text-green-600">✅ Correção:</strong>{" "}
                            {plan.corrective_action}
                          </div>
                        )}
                        {plan.preventive_action && (
                          <div>
                            <strong className="text-blue-600">🔁 Prevenção:</strong>{" "}
                            {plan.preventive_action}
                          </div>
                        )}
                        {plan.recommendation && (
                          <div>
                            <strong className="text-purple-600">🧠 Recomendação:</strong>{" "}
                            {plan.recommendation}
                          </div>
                        )}
                      </div>
                    </details>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-white ${statusColors[plan.status] || "bg-gray-500"}`}
                    >
                      {statusLabels[plan.status] || plan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {plan.approved_by && (
                        <>
                          <div className="font-medium">{plan.approved_by}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDateTime(plan.approved_at)}
                          </div>
                        </>
                      )}
                      {!plan.approved_by && "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:underline p-0"
                        onClick={() => onEdit(plan.id)}
                      >
                        ✏️ Editar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
