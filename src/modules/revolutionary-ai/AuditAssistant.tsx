/**
import { useState, useMemo, useCallback } from "react";;
 * REVOLUTIONARY AI - Audit Assistant
 * Funcionalidade 5 & 13: Assistente para auditorias e fiscalizações
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  FileSearch, Download, CheckCircle, AlertTriangle, Clock,
  Shield, FileText, Calendar, Building, Ship, Users,
  Brain, Sparkles, Loader2, ChevronRight, FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuditPackage {
  id: string;
  name: string;
  type: "ANTAQ" | "DPC" | "IMO" | "ISM" | "ISPS" | "MLC" | "ESG" | "ISO";
  status: "ready" | "generating" | "pending" | "incomplete";
  completeness: number;
  documents: number;
  lastGenerated?: Date;
  missingItems: string[];
}

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  status: "valid" | "expiring" | "expired" | "missing";
  expiryDate?: Date;
  vessel?: string;
}

const MOCK_PACKAGES: AuditPackage[] = [
  {
    id: "1",
    name: "Dossiê ANTAQ 2024",
    type: "ANTAQ",
    status: "ready",
    completeness: 100,
    documents: 45,
    lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    missingItems: []
  },
  {
    id: "2",
    name: "Auditoria DPC",
    type: "DPC",
    status: "ready",
    completeness: 95,
    documents: 38,
    lastGenerated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    missingItems: ["Certificado de arqueação atualizado"]
  },
  {
    id: "3",
    name: "ISM Code Compliance",
    type: "ISM",
    status: "pending",
    completeness: 78,
    documents: 52,
    missingItems: [
      "Relatório de não conformidades Q4",
      "Registros de drill de segurança",
      "Atas de reunião COGESMS"
    ]
  },
  {
    id: "4",
    name: "Relatório ESG",
    type: "ESG",
    status: "generating",
    completeness: 60,
    documents: 28,
    missingItems: [
      "Inventário de emissões CO2",
      "Relatório de tratamento de resíduos"
    ]
  },
  {
    id: "5",
    name: "MLC 2006 Compliance",
    type: "MLC",
    status: "incomplete",
    completeness: 45,
    documents: 35,
    missingItems: [
      "Contratos de trabalho marítimo",
      "Registros de horas de descanso",
      "Declaração de conformidade trabalhista",
      "Certificados STCW tripulação"
    ]
  }
];

const MOCK_DOCUMENTS: DocumentItem[] = [
  { id: "1", name: "Certificado de Segurança", category: "Segurança", status: "valid", expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), vessel: "Navio Atlas" },
  { id: "2", name: "Certificado STCW - Cap. Silva", category: "Tripulação", status: "expiring", expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
  { id: "3", name: "IOPP Certificate", category: "Ambiental", status: "valid", expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), vessel: "Navio Vega" },
  { id: "4", name: "Certificado de Classe", category: "Classificação", status: "expired", expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), vessel: "Navio Sirius" },
  { id: "5", name: "Declaração MLC", category: "Trabalhista", status: "missing" }
];

export const AuditAssistant = memo(function() {
  const [selectedPackage, setSelectedPackage] = useState<AuditPackage | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleGenerate = (pkg: AuditPackage) => {
    setIsGenerating(pkg.id);
    setTimeout(() => {
      setIsGenerating(null);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ready: "bg-green-500/20 text-green-400 border-green-500/30",
      generating: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      incomplete: "bg-red-500/20 text-red-400 border-red-500/30"
    };
    return colors[status as keyof typeof colors] || "bg-muted";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      ready: "Pronto",
      generating: "Gerando...",
      pending: "Pendente",
      incomplete: "Incompleto"
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getDocStatusColor = (status: string) => {
    const colors = {
      valid: "bg-green-500/20 text-green-400",
      expiring: "bg-amber-500/20 text-amber-400",
      expired: "bg-red-500/20 text-red-400",
      missing: "bg-purple-500/20 text-purple-400"
    };
    return colors[status as keyof typeof colors] || "bg-muted";
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ANTAQ: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      DPC: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      IMO: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      ISM: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      ISPS: "bg-red-500/20 text-red-400 border-red-500/30",
      MLC: "bg-green-500/20 text-green-400 border-green-500/30",
      ESG: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      ISO: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
    };
    return colors[type] || "bg-muted";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-primary/20">
                <FileSearch className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Assistente de Auditoria</h2>
                <p className="text-muted-foreground">
                  Gere dossiês automaticamente para ANTAQ, DPC, Marinha e mais
                </p>
              </div>
            </div>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Novo Dossiê
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Packages List */}
        <div className="lg:col-span-2">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Dossiês de Auditoria
                </div>
                <Input
                  placeholder="Buscar..."
                  className="w-48"
                  value={searchTerm}
                  onChange={handleChange}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_PACKAGES.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:border-primary/50 ${
                      selectedPackage?.id === pkg.id ? "border-primary ring-2 ring-primary/20" : ""
                    }`}
                    onClick={handleSetSelectedPackage}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{pkg.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={getTypeColor(pkg.type)}>
                                {pkg.type}
                              </Badge>
                              <Badge variant="outline" className={getStatusColor(pkg.status)}>
                                {isGenerating === pkg.id ? (
                                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Gerando...</>
                                ) : (
                                  getStatusLabel(pkg.status)
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{pkg.completeness}%</p>
                          <p className="text-xs text-muted-foreground">{pkg.documents} docs</p>
                        </div>
                      </div>

                      <Progress value={pkg.completeness} className="h-2 mb-3" />

                      {pkg.missingItems.length > 0 && (
                        <div className="mb-3 p-2 rounded bg-amber-500/10 text-xs">
                          <p className="font-medium text-amber-400 mb-1">Itens pendentes:</p>
                          <ul className="text-muted-foreground space-y-0.5">
                            {pkg.missingItems.slice(0, 2).map((item, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3 text-amber-400" />
                                {item}
                              </li>
                            ))}
                            {pkg.missingItems.length > 2 && (
                              <li className="text-amber-400">+{pkg.missingItems.length - 2} mais...</li>
                            )}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {pkg.lastGenerated && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Gerado: {pkg.lastGenerated.toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {pkg.status === "ready" && (
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3 mr-1" />
                              Baixar
                            </Button>
                          )}
                          <Button 
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); handleGenerate(pkg); }}
                            disabled={isGenerating === pkg.id}
                          >
                            {isGenerating === pkg.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Brain className="h-3 w-3 mr-1" />
                                {pkg.status === "ready" ? "Atualizar" : "Gerar"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Document Status */}
        <div>
          <Card className="border-border/50 sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Status de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_DOCUMENTS.map((doc) => (
                <div 
                  key={doc.id} 
                  className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-medium text-sm">{doc.name}</span>
                    <Badge className={`text-xs ${getDocStatusColor(doc.status)}`}>
                      {doc.status === "valid" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {doc.status === "expiring" && <Clock className="h-3 w-3 mr-1" />}
                      {doc.status === "expired" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {doc.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span>{doc.category}</span>
                    {doc.vessel && <span> • {doc.vessel}</span>}
                    {doc.expiryDate && (
                      <span className="block mt-1">
                        Vence: {doc.expiryDate.toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t">
                <Button variant="outline" className="w-full" size="sm">
                  Ver Todos os Documentos
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AuditAssistant;
