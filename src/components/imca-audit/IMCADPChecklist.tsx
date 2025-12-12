import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock, MinusCircle, AlertTriangle, FileText } from "lucide-react";
import { DP_CHECKLIST_CATEGORIES, DP_CHECKLIST_ITEMS } from "@/data/imca-dp-checklist";

interface Props {
  selectedDPClass: "DP1" | "DP2" | "DP3";
  auditData: Record<number, { status: string; notes: string; evidence: string }>;
  setAuditData: React.Dispatch<React.SetStateAction<Record<number, { status: string; notes: string; evidence: string }>>>;
}

export function IMCADPChecklist({ selectedDPClass, auditData, setAuditData }: Props) {
  const updateItem = (id: number, field: string, value: string) => {
    setAuditData(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const getStatusIcon = (status?: string) => {
    switch(status) {
    case "C": return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "NC": return <XCircle className="h-5 w-5 text-red-600" />;
    case "NA": return <MinusCircle className="h-5 w-5 text-gray-400" />;
    default: return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Checklist de Auditoria DP - {selectedDPClass}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <Accordion type="multiple" className="space-y-2">
            {DP_CHECKLIST_CATEGORIES.map(category => {
              const items = category.items.filter(i => i.applicableDPClass.includes(selectedDPClass));
              if (items.length === 0) return null;
              
              return (
                <AccordionItem key={category.code} value={category.code} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{category.name}</span>
                      <Badge variant="secondary">{items.length} itens</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    {items.map(item => (
                      <div key={item.id} className={`p-4 rounded-lg border ${item.isImperative ? "border-destructive/50 bg-destructive/5" : "bg-muted/30"}`}>
                        <div className="flex items-start gap-3">
                          {getStatusIcon(auditData[item.id]?.status)}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium">
                                  {item.id}. {item.question}
                                </p>
                                {item.isImperative && (
                                  <Badge variant="destructive" className="mt-1">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    Impeditivo
                                  </Badge>
                                )}
                              </div>
                              <Select
                                value={auditData[item.id]?.status || ""}
                                onValueChange={(v) => updateItem(item.id, "status", v)}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="C">Conforme</SelectItem>
                                  <SelectItem value="NC">Não Conforme</SelectItem>
                                  <SelectItem value="NA">N/A</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Evidência:</strong> {item.evidence}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {item.standards.map(std => (
                                <Badge key={std} variant="outline" className="text-xs">{std}</Badge>
                              ))}
                            </div>
                            <Textarea
                              placeholder="Notas do auditor..."
                              value={auditData[item.id]?.notes || ""}
                              onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                              className="min-h-[60px]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
