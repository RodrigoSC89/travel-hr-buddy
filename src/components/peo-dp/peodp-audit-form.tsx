/**
import { useMemo, useState, useCallback } from "react";;
 * PEO-DP Audit Form
 * Formulário de auditoria com checklist dinâmico baseado no PEO-DP Petrobras
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Users,
  GraduationCap,
  FileText,
  Radio,
  Wrench,
  TestTube,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  MinusCircle,
  HelpCircle,
  Save,
  Download,
  Ship
} from "lucide-react";
import {
  type PEODPRequirement,
  type PEODPAuditItem,
  type PEODPSection,
  type ComplianceStatus,
  PEODP_SECTIONS,
  PEODP_DEFAULT_REQUIREMENTS,
  calculateAuditScore,
  calculateSectionScores,
  getStatusColor,
  getStatusBgColor,
  getStatusLabel,
  getScoreLevel,
  getScoreColor
} from "@/types/peodp-checklist";
import { toast } from "sonner";

const SECTION_ICONS: Record<string, React.ElementType> = {
  Users, GraduationCap, FileText, Radio, Wrench, TestTube
};

interface PEODPAuditFormProps {
  vesselName: string;
  vesselId?: string;
  dpClass: "DP1" | "DP2" | "DP3";
  requirements?: PEODPRequirement[];
  initialItems?: PEODPAuditItem[];
  onSave?: (items: PEODPAuditItem[], score: number) => void;
  onComplete?: (items: PEODPAuditItem[], score: number) => void;
}

export const PEODPAuditForm = memo(function({
  vesselName,
  vesselId,
  dpClass,
  requirements = PEODP_DEFAULT_REQUIREMENTS,
  initialItems,
  onSave,
  onComplete
}: PEODPAuditFormProps) {
  const [activeSection, setActiveSection] = useState<PEODPSection>("gestao");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Initialize audit items
  const [auditItems, setAuditItems] = useState<Map<string, PEODPAuditItem>>(() => {
    const map = new Map<string, PEODPAuditItem>();
    
    if (initialItems) {
      initialItems.forEach(item => map.set(item.requirementId, item));
    }
    
    // Initialize missing items with "pendente" status
    requirements.forEach(req => {
      if (!map.has(req.id)) {
        map.set(req.id, {
          requirementId: req.id,
          status: "pendente"
        });
      }
    });
    
    return map;
  });

  // Group requirements by section
  const requirementsBySection = useMemo(() => {
    const grouped: Record<PEODPSection, PEODPRequirement[]> = {
      gestao: [],
      treinamentos: [],
      procedimentos: [],
      operacao: [],
      manutencao: [],
      testes_anuais: []
    };
    
    requirements.forEach(req => {
      grouped[req.section].push(req);
  });
    
    return grouped;
  }, [requirements]);

  // Calculate scores
  const items = Array.from(auditItems.values());
  const totalScore = calculateAuditScore(items, requirements);
  const sectionScores = calculateSectionScores(items, requirements);

  // Count items by status per section
  const sectionStats = useMemo(() => {
    const stats: Record<PEODPSection, { total: number; completed: number; conformes: number; naoConformes: number }> = {} as unknown;
    
    PEODP_SECTIONS.forEach(section => {
      const sectionReqs = requirementsBySection[section.id];
      const sectionItems = sectionReqs.map(req => auditItems.get(req.id)).filter(Boolean);
      
      stats[section.id] = {
        total: sectionReqs.length,
        completed: sectionItems.filter(item => item?.status !== "pendente").length,
        conformes: sectionItems.filter(item => item?.status === "conforme").length,
        naoConformes: sectionItems.filter(item => item?.status === "nao_conforme").length
      };
  });
    
    return stats;
  }, [requirementsBySection, auditItems]);

  const updateItem = (reqId: string, updates: Partial<PEODPAuditItem>) => {
    setAuditItems(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(reqId) || { requirementId: reqId, status: "pendente" as ComplianceStatus };
      newMap.set(reqId, { ...existing, ...updates });
      return newMap;
  });
  });

  const toggleExpanded = (reqId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reqId)) {
        newSet.delete(reqId);
      } else {
        newSet.add(reqId);
      }
      return newSet;
  });
  });

  const handleSave = () => {
    onSave?.(items, totalScore);
    toast.success("Auditoria salva com sucesso!");
  };

  const handleComplete = () => {
    const pendingCount = items.filter(i => i.status === "pendente").length;
    if (pendingCount > 0) {
      toast.error(`Ainda há ${pendingCount} itens pendentes de avaliação`);
      return;
    }
    onComplete?.(items, totalScore);
    toast.success("Auditoria concluída!");
  };

  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
    case "conforme": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "parcial": return <MinusCircle className="h-4 w-4 text-yellow-600" />;
    case "nao_conforme": return <AlertCircle className="h-4 w-4 text-red-600" />;
    case "nao_aplicavel": return <HelpCircle className="h-4 w-4 text-gray-400" />;
    default: return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with score */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ship className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-xl">{vesselName}</CardTitle>
                <CardDescription>
                  Auditoria PEO-DP • Classe {dpClass}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>
                {totalScore}%
              </div>
              <p className="text-sm text-muted-foreground">{getScoreLevel(totalScore)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={totalScore} className="h-3" />
          <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
            <span>{items.filter(i => i.status !== "pendente").length} de {requirements.length} itens avaliados</span>
            <span>{items.filter(i => i.status === "conforme").length} conformes</span>
          </div>
        </CardContent>
      </Card>

      {/* Section tabs */}
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as PEODPSection}>
        <TabsList className="grid w-full grid-cols-6 h-auto">
          {PEODP_SECTIONS.map(section => {
            const Icon = SECTION_ICONS[section.icon] || FileText;
            const stats = sectionStats[section.id];
            
            return (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="flex flex-col items-center gap-1 py-3 px-2"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{section.name}</span>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[10px] px-1">
                    {stats.completed}/{stats.total}
                  </Badge>
                  <span className={`text-[10px] font-bold ${getScoreColor(sectionScores[section.id])}`}>
                    {sectionScores[section.id]}%
                  </span>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {PEODP_SECTIONS.map(section => (
          <TabsContent key={section.id} value={section.id} className="mt-4">
            <Card>
              <CardHeader className={`bg-${section.color}-50 border-b`}>
                <CardTitle className="text-lg flex items-center gap-2">
                  {React.createElement(SECTION_ICONS[section.icon] || FileText, { className: "h-5 w-5" })}
                  {section.code} - {section.name}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <div className="divide-y">
                    {requirementsBySection[section.id].map(req => {
                      const item = auditItems.get(req.id);
                      const isExpanded = expandedItems.has(req.id);
                      
                      return (
                        <Collapsible
                          key={req.id}
                          open={isExpanded}
                          onOpenChange={() => toggleExpanded(req.id}
                        >
                          <div className={`p-4 ${getStatusBgColor(item?.status || "pendente")}`}>
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {req.code}
                                    </Badge>
                                    {req.mandatory && (
                                      <Badge variant="destructive" className="text-[10px]">
                                        Obrigatório
                                      </Badge>
                                    )}
                                    {req.reference && (
                                      <Badge variant="secondary" className="text-[10px]">
                                        {req.reference}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-medium text-sm">{req.title}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(item?.status || "pendente")}
                                  <Badge
                                    variant={item?.status === "conforme" ? "default" : 
                                      item?.status === "nao_conforme" ? "destructive" : "secondary"}
                                  >
                                    {getStatusLabel(item?.status || "pendente")}
                                  </Badge>
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent className="mt-4 space-y-4">
                              <Separator />
                              
                              <div className="text-sm text-muted-foreground">
                                {req.description}
                              </div>

                              <div className="space-y-3">
                                <Label>Status de Conformidade</Label>
                                <RadioGroup
                                  value={item?.status || "pendente"}
                                  onValueChange={(value) => updateItem(req.id, { status: value as ComplianceStatus })}
                                  className="flex flex-wrap gap-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="conforme" id={`${req.id}-conforme`} />
                                    <Label htmlFor={`${req.id}-conforme`} className="flex items-center gap-1 cursor-pointer">
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                      Conforme
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="parcial" id={`${req.id}-parcial`} />
                                    <Label htmlFor={`${req.id}-parcial`} className="flex items-center gap-1 cursor-pointer">
                                      <MinusCircle className="h-4 w-4 text-yellow-600" />
                                      Parcial
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="nao_conforme" id={`${req.id}-nao_conforme`} />
                                    <Label htmlFor={`${req.id}-nao_conforme`} className="flex items-center gap-1 cursor-pointer">
                                      <AlertCircle className="h-4 w-4 text-red-600" />
                                      Não Conforme
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="nao_aplicavel" id={`${req.id}-na`} />
                                    <Label htmlFor={`${req.id}-na`} className="flex items-center gap-1 cursor-pointer">
                                      <HelpCircle className="h-4 w-4 text-gray-400" />
                                      N/A
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`${req.id}-evidence`}>Evidência</Label>
                                  <Textarea
                                    id={`${req.id}-evidence`}
                                    placeholder="Descreva as evidências encontradas..."
                                    value={item?.evidence || ""}
                                    onChange={handleChange})}
                                    rows={3}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${req.id}-observations`}>Observações</Label>
                                  <Textarea
                                    id={`${req.id}-observations`}
                                    placeholder="Observações adicionais..."
                                    value={item?.observations || ""}
                                    onChange={handleChange})}
                                    rows={3}
                                  />
                                </div>
                              </div>

                              {(item?.status === "parcial" || item?.status === "nao_conforme") && (
                                <div className="space-y-2">
                                  <Label htmlFor={`${req.id}-action`}>Ação Requerida</Label>
                                  <Textarea
                                    id={`${req.id}-action`}
                                    placeholder="Descreva a ação corretiva necessária..."
                                    value={item?.actionRequired || ""}
                                    onChange={handleChange})}
                                    rows={2}
                                  />
                                </div>
                              )}
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {items.filter(i => i.status === "pendente").length} itens pendentes
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button onClick={handleComplete}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Concluir Auditoria
          </Button>
        </div>
      </div>
    </div>
  );
}
