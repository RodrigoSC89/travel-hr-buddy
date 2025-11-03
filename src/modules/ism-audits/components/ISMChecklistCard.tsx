/**
 * ISM Checklist Card Component
 * PATCH-609: Individual checklist item display
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock,
  Sparkles 
} from "lucide-react";
import type { ISMAuditItem, ComplianceStatus } from "@/types/ism-audit";

interface ISMChecklistCardProps {
  item: ISMAuditItem;
  onUpdate: (item: ISMAuditItem) => void;
  onAnalyze?: (item: ISMAuditItem) => void;
  showAIAnalysis?: boolean;
}

const statusIcons = {
  compliant: <CheckCircle2 className="h-5 w-5 text-green-600" />,
  "non-compliant": <XCircle className="h-5 w-5 text-red-600" />,
  "not-applicable": <AlertCircle className="h-5 w-5 text-gray-400" />,
  pending: <Clock className="h-5 w-5 text-yellow-600" />,
};

const statusColors = {
  compliant: "bg-green-100 text-green-800 border-green-300",
  "non-compliant": "bg-red-100 text-red-800 border-red-300",
  "not-applicable": "bg-gray-100 text-gray-800 border-gray-300",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
};

const statusLabels = {
  compliant: "Conforme",
  "non-compliant": "Não Conforme",
  "not-applicable": "Não Aplicável",
  pending: "Pendente",
};

export function ISMChecklistCard({ 
  item, 
  onUpdate, 
  onAnalyze,
  showAIAnalysis = true 
}: ISMChecklistCardProps) {
  const handleStatusChange = (status: ComplianceStatus) => {
    onUpdate({ ...item, compliant: status });
  };

  const handleNotesChange = (notes: string) => {
    onUpdate({ ...item, notes });
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Badge variant="outline" className="mb-2">
            {item.category}
          </Badge>
          <p className="text-sm font-medium text-gray-900">
            {item.question}
          </p>
        </div>
        <div className="flex-shrink-0">
          {statusIcons[item.compliant]}
        </div>
      </div>

      {/* Status Selection */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(statusLabels) as ComplianceStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
              item.compliant === status
                ? statusColors[status]
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Notes */}
      <Textarea
        placeholder="Adicionar notas ou evidências..."
        value={item.notes}
        onChange={(e) => handleNotesChange(e.target.value)}
        className="min-h-[60px] text-sm"
      />

      {/* AI Analysis Section */}
      {showAIAnalysis && (
        <div className="space-y-2">
          {onAnalyze && (
            <Button
              onClick={() => onAnalyze(item)}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Analisar com IA
            </Button>
          )}
          
          {item.aiAnalysis && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-900">
                  Análise da IA
                </span>
                {item.aiConfidence && (
                  <span className="text-xs text-blue-700">
                    Confiança: {Math.round(item.aiConfidence * 100)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-800 whitespace-pre-wrap">
                {item.aiAnalysis}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
