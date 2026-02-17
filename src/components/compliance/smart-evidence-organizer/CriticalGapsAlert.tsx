/**
 * Critical Gaps Alert - Post-processing notifications for critical gaps
 */
import React, { useMemo, memo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldAlert, XCircle, AlertTriangle, ChevronDown, ChevronUp,
  Bell, Zap, FileWarning
} from "lucide-react";
import type { EvidenceItem, EvidenceElement } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  items: EvidenceItem[];
  elements: EvidenceElement[];
  overallScore: number;
  onRematchGaps: () => void;
  isRematching: boolean;
}

export const CriticalGapsAlert = memo(({ items, elements, overallScore, onRematchGaps, isRematching }: Props) => {
  const [expanded, setExpanded] = useState(true);

  const criticalGaps = useMemo(() =>
    items.filter(i => i.is_critical && (i.evidence_status === "not_found" || i.evidence_status === "pending")),
    [items]
  );

  const allGaps = useMemo(() =>
    items.filter(i => i.evidence_status === "not_found" || i.evidence_status === "pending"),
    [items]
  );

  const partialItems = useMemo(() =>
    items.filter(i => i.evidence_status === "partial"),
    [items]
  );

  const worstElements = useMemo(() =>
    [...elements]
      .filter(e => e.compliance_score < 60)
      .sort((a, b) => a.compliance_score - b.compliance_score)
      .slice(0, 5),
    [elements]
  );

  if (criticalGaps.length === 0 && allGaps.length === 0) return null;

  const severity = criticalGaps.length > 3 ? "critical" : criticalGaps.length > 0 ? "warning" : "info";

  return (
    <Card className={cn(
      "border-2",
      severity === "critical" ? "border-destructive/50 bg-destructive/5" :
      severity === "warning" ? "border-yellow-500/50 bg-yellow-500/5" :
      "border-primary/30 bg-primary/5"
    )}>
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {severity === "critical" ? (
              <ShieldAlert className="h-5 w-5 text-destructive animate-pulse" />
            ) : (
              <Bell className="h-5 w-5 text-yellow-500" />
            )}
            <span className={severity === "critical" ? "text-destructive" : "text-yellow-600"}>
              {severity === "critical"
                ? `⚠️ ${criticalGaps.length} Gaps CRÍTICOS Detectados`
                : `${allGaps.length} Gaps Detectados`}
            </span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={severity === "critical" ? "destructive" : "default"}
              onClick={onRematchGaps}
              disabled={isRematching}
              className="gap-1"
            >
              <Zap className="h-3 w-3" />
              {isRematching ? "Re-processando..." : `Re-match ${allGaps.length + partialItems.length} itens`}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pb-3 space-y-3">
          {/* Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="flex items-center gap-2 p-2 bg-background rounded">
              <XCircle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-lg font-bold text-destructive">{allGaps.length}</p>
                <p className="text-[10px] text-muted-foreground">Não encontradas</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background rounded">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-lg font-bold text-yellow-500">{partialItems.length}</p>
                <p className="text-[10px] text-muted-foreground">Parciais</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background rounded">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-lg font-bold text-destructive">{criticalGaps.length}</p>
                <p className="text-[10px] text-muted-foreground">Críticos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background rounded">
              <FileWarning className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-bold">{worstElements.length}</p>
                <p className="text-[10px] text-muted-foreground">Elementos &lt;60%</p>
              </div>
            </div>
          </div>

          {/* Critical Items List */}
          {criticalGaps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-destructive mb-2">Itens Críticos sem Evidência:</p>
              <ScrollArea className="h-[160px]">
                <div className="space-y-1.5 pr-2">
                  {criticalGaps.map(item => (
                    <div key={item.id} className="flex items-start gap-2 p-2 bg-destructive/5 border border-destructive/20 rounded-md">
                      <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{item.item_number} — {item.item_text}</p>
                        {item.ai_suggestion && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">💡 {item.ai_suggestion}</p>
                        )}
                      </div>
                      <Badge variant="destructive" className="text-[9px] shrink-0">CRÍTICO</Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Worst Elements */}
          {worstElements.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-yellow-600 mb-2">Elementos com Menor Conformidade:</p>
              <div className="flex flex-wrap gap-2">
                {worstElements.map(el => (
                  <Badge
                    key={el.id}
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-600"
                  >
                    {el.element_code || `E${el.element_number}`}: {el.compliance_score.toFixed(0)}%
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
});

CriticalGapsAlert.displayName = "CriticalGapsAlert";
