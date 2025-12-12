import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, AlertTriangle, FileText, Calendar } from "lucide-react";
import { DP_CHECKLIST_ITEMS } from "@/data/imca-dp-checklist";

interface Props {
  auditData: Record<number, { status: string; notes: string; evidence: string }>;
  selectedDPClass: "DP1" | "DP2" | "DP3";
}

export const IMCADPNonConformities = memo(function({ auditData, selectedDPClass }: Props) {
  const nonConformities = Object.entries(auditData)
    .filter(([_, v]) => v.status === "NC")
    .map(([id, data]) => {
      const item = DP_CHECKLIST_ITEMS.find(i => i.id === parseInt(id));
      return { id: parseInt(id), item, data };
    })
    .filter(nc => nc.item);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Não Conformidades e Planos de Ação
        </CardTitle>
        <CardDescription>{nonConformities.length} não conformidades identificadas</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          {nonConformities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma não conformidade registrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nonConformities.map(({ id, item, data }) => (
                <Card key={id} className={item?.isImperative ? "border-destructive" : ""}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">NC-{id.toString().padStart(3, "0")}</Badge>
                          {item?.isImperative && (
                            <Badge variant="outline" className="border-destructive text-destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Impeditivo
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{item?.question}</p>
                        <p className="text-sm text-muted-foreground">{data.notes || "Sem observações"}</p>
                        <div className="flex flex-wrap gap-1">
                          {item?.standards.map(std => (
                            <Badge key={std} variant="secondary" className="text-xs">{std}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-1" />
                          Plano de Ação
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-4 w-4 mr-1" />
                          Prazo
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
