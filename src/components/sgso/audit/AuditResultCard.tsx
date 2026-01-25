/**
 * Audit Result Card Component
 * Displays and edits a single audit result
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle, AlertTriangle, FileText } from "lucide-react";
import { AuditResult, AuditStatus } from "./types";
import { getStatusColor } from "./audit-utils";

interface AuditResultCardProps {
  result: AuditResult;
  index: number;
  onUpdate: (index: number, updates: Partial<AuditResult>) => void;
}

const StatusIcon = ({ status }: { status: AuditStatus }) => {
  const icons = {
    compliant: CheckCircle,
    non_compliant: XCircle,
    partial: AlertTriangle,
    not_applicable: FileText,
  };
  const Icon = icons[status];
  return <Icon className="h-3 w-3 mr-1" />;
};

export const AuditResultCard = React.memo(function AuditResultCard({
  result,
  index,
  onUpdate,
}: AuditResultCardProps) {
  return (
    <Card className="border-2">
      <CardContent className="pt-6 space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">{result.area}</p>
          <p className="font-semibold">{result.criterion}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Status</Label>
            <Select
              value={result.status}
              onValueChange={(value) =>
                onUpdate(index, { status: value as AuditStatus })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compliant">Conforme</SelectItem>
                <SelectItem value="non_compliant">Não Conforme</SelectItem>
                <SelectItem value="partial">Parcialmente Conforme</SelectItem>
                <SelectItem value="not_applicable">Não Aplicável</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Badge className={getStatusColor(result.status)}>
              <StatusIcon status={result.status} />
              {result.status === "compliant" && "Conforme"}
              {result.status === "non_compliant" && "Não Conforme"}
              {result.status === "partial" && "Parcial"}
              {result.status === "not_applicable" && "N/A"}
            </Badge>
          </div>
        </div>

        <div>
          <Label>Comentários</Label>
          <Textarea
            value={result.comments}
            onChange={(e) => onUpdate(index, { comments: e.target.value })}
            placeholder="Observações, evidências e ações necessárias..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
});
