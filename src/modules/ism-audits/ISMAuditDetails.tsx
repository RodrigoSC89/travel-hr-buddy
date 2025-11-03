/**
 * ISM Audit Details Component
 * PATCH-609: Detailed view of a single audit
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  Ship, 
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import type { ISMAudit } from "@/types/ism-audit";
import { calculateComplianceScore } from "@/types/ism-audit";

import { exportToPDF, formatPDFContent } from "@/lib/pdf";

interface ISMAuditDetailsProps {
  audit: ISMAudit;
  onBack: () => void;
  onEdit?: (audit: ISMAudit) => void;
}

export function ISMAuditDetails({ audit, onBack, onEdit }: ISMAuditDetailsProps) {
  const [exporting, setExporting] = useState(false);
  const score = calculateComplianceScore(audit.items);

  const itemsByCategory = audit.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof audit.items>);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const content = `
        <div style="padding: 20px;">
          <h2>Auditoria ISM - ${audit.vesselName}</h2>
          <hr style="margin: 20px 0;">
          
          <div style="margin-bottom: 30px;">
            <h3>Informações Gerais</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Embarcação:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${audit.vesselName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Tipo:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${audit.auditType === "internal" ? "Interna" : "Externa"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Data:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${new Date(audit.auditDate).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Auditor:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${audit.auditor}</td>
              </tr>
              ${audit.port ? `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Porto:</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${audit.port}</td>
              </tr>
              ` : ""}
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h3>Score de Conformidade</h3>
            <div style="font-size: 48px; font-weight: bold; color: #2563eb;">${score.score}%</div>
            <div>Nota: ${score.grade}</div>
            <div>Conformes: ${score.compliantItems}/${score.totalItems - score.notApplicableItems}</div>
            <div>Não Conformes: ${score.nonCompliantItems}</div>
          </div>

          ${audit.summary ? `
          <div style="margin-bottom: 30px;">
            <h3>Sumário Executivo</h3>
            <p style="white-space: pre-wrap;">${audit.summary}</p>
          </div>
          ` : ""}

          <div style="page-break-before: always;">
            <h3>Checklist Detalhado</h3>
            ${Object.entries(itemsByCategory).map(([category, items]) => `
              <div style="margin-bottom: 20px;">
                <h4 style="background-color: #f3f4f6; padding: 10px;">${category}</h4>
                <table style="width: 100%; border-collapse: collapse;">
                  ${items.map(item => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; width: 60%;">${item.question}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; width: 20%;">
                    ${item.compliant === "compliant" ? "✓ Conforme" : item.compliant === "non-compliant" ? "✗ Não Conforme" : item.compliant === "not-applicable" ? "N/A" : "Pendente"}
                  </td>
                  <td style="padding: 8px; border: 1px solid #ddd; width: 20%;">
                    ${item.notes || "-"}
                  </td>
                </tr>
              `).join("")}
                </table>
              </div>
            `).join("")}
          </div>
        </div>
      `;

      const formattedContent = formatPDFContent(
        `Auditoria ISM - ${audit.vesselName}`,
        content
      );

      await exportToPDF(
        formattedContent,
        `ISM_Audit_${audit.vesselName}_${audit.auditDate}.pdf`,
        {
          jsPDF: { format: "a4", orientation: "portrait" }
        }
      );
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Auditoria ISM - {audit.vesselName}
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date(audit.auditDate).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(audit)}>
              Editar
            </Button>
          )}
          <Button onClick={handleExportPDF} disabled={exporting}>
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exportando..." : "Exportar PDF"}
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Ship className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Embarcação</p>
                <p className="font-semibold">{audit.vesselName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Auditor</p>
                <p className="font-semibold">{audit.auditor}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Data</p>
                <p className="font-semibold">
                  {new Date(audit.auditDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {audit.port ? (
                <>
                  <MapPin className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Porto</p>
                    <p className="font-semibold">{audit.port}</p>
                  </div>
                </>
              ) : (
                <Badge variant="outline">
                  {audit.auditType === "internal" ? "Auditoria Interna" : "Auditoria Externa"}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Score de Conformidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {score.score}%
              </div>
              <Badge variant="outline" className="text-xl px-4 py-2">
                Nota {score.grade}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{score.compliantItems}</p>
                <p className="text-sm text-gray-600">Conformes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{score.nonCompliantItems}</p>
                <p className="text-sm text-gray-600">Não Conformes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-2xl font-bold">{score.notApplicableItems}</p>
                <p className="text-sm text-gray-600">Não Aplicável</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {audit.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Sumário Executivo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-gray-700">{audit.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Detailed Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist Detalhado</CardTitle>
          <CardDescription>{audit.items.length} itens avaliados</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Object.keys(itemsByCategory)[0]}>
            <TabsList className="mb-4">
              {Object.keys(itemsByCategory).map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(itemsByCategory).map(([category, items]) => (
              <TabsContent key={category} value={category} className="space-y-3">
                {items.map(item => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium mb-2">{item.question}</p>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Notas:</strong> {item.notes}
                            </p>
                          )}
                          {item.aiAnalysis && (
                            <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
                              <p className="text-xs font-semibold text-blue-900 mb-1">
                                Análise da IA {item.aiConfidence && `(${Math.round(item.aiConfidence * 100)}%)`}:
                              </p>
                              <p className="text-xs text-blue-800">{item.aiAnalysis}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {item.compliant === "compliant" && (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              Conforme
                            </Badge>
                          )}
                          {item.compliant === "non-compliant" && (
                            <Badge className="bg-red-100 text-red-800 border-red-300">
                              Não Conforme
                            </Badge>
                          )}
                          {item.compliant === "not-applicable" && (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-300">
                              N/A
                            </Badge>
                          )}
                          {item.compliant === "pending" && (
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
