/**
 * Template Manager Component
 * Biblioteca de templates com variáveis dinâmicas
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Copy,
  Edit,
  Eye,
  Download,
  Variable,
  FileCode,
  Clock,
  User,
  Star,
  Trash2
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  variables: string[];
  lastModified: string;
  createdBy: string;
  usageCount: number;
  isFavorite: boolean;
  content: string;
}

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Relatório de Inspeção PSC",
    category: "Compliance",
    description: "Template padrão para relatórios de inspeções Port State Control",
    variables: ["{{vessel_name}}", "{{port}}", "{{date}}", "{{inspector}}", "{{findings}}"],
    lastModified: "2025-01-28",
    createdBy: "Sistema",
    usageCount: 45,
    isFavorite: true,
    content: "RELATÓRIO DE INSPEÇÃO PSC\n\nEmbarcação: {{vessel_name}}\nPorto: {{port}}\nData: {{date}}\nInspetor: {{inspector}}\n\nFindings:\n{{findings}}"
  },
  {
    id: "2",
    name: "Carta de Apresentação de Tripulação",
    category: "RH",
    description: "Carta formal para apresentação de novos tripulantes",
    variables: ["{{crew_name}}", "{{rank}}", "{{embark_date}}", "{{vessel_name}}"],
    lastModified: "2025-01-20",
    createdBy: "Maria Santos",
    usageCount: 28,
    isFavorite: false,
    content: "Prezados,\n\nVimos por meio desta apresentar {{crew_name}}, que assumirá o cargo de {{rank}} a partir de {{embark_date}} na embarcação {{vessel_name}}."
  },
  {
    id: "3",
    name: "Checklist de Partida",
    category: "Operações",
    description: "Checklist pré-partida para operações de navegação",
    variables: ["{{vessel_name}}", "{{voyage_number}}", "{{destination}}", "{{etd}}"],
    lastModified: "2025-02-01",
    createdBy: "Carlos Silva",
    usageCount: 120,
    isFavorite: true,
    content: "CHECKLIST DE PARTIDA\n\nEmbarcação: {{vessel_name}}\nViagem: {{voyage_number}}\nDestino: {{destination}}\nETD: {{etd}}"
  },
  {
    id: "4",
    name: "Relatório de Não Conformidade",
    category: "Qualidade",
    description: "Template para registro de não conformidades ISM/ISO",
    variables: ["{{nc_number}}", "{{date}}", "{{description}}", "{{root_cause}}", "{{action}}"],
    lastModified: "2025-01-15",
    createdBy: "João Auditor",
    usageCount: 67,
    isFavorite: false,
    content: "NC #: {{nc_number}}\nData: {{date}}\n\nDescrição: {{description}}\n\nCausa Raiz: {{root_cause}}\n\nAção Corretiva: {{action}}"
  }
];

export function TemplateManager() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  const generatePreview = (template: Template) => {
    let content = template.content;
    template.variables.forEach(variable => {
      const key = variable.replace(/[{}]/g, "");
      const value = variableValues[key] || `[${key}]`;
      content = content.replace(new RegExp(variable.replace(/[{}]/g, "\\$&"), "g"), value);
    });
    return content;
  };

  const categories = [...new Set(mockTemplates.map(t => t.category))];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Templates</p>
                <p className="text-3xl font-bold">{mockTemplates.length}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <FileCode className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categorias</p>
                <p className="text-3xl font-bold">{categories.length}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Documentos Gerados</p>
                <p className="text-3xl font-bold text-green-500">
                  {mockTemplates.reduce((acc, t) => acc + t.usageCount, 0)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <Copy className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Favoritos</p>
                <p className="text-3xl font-bold text-yellow-500">
                  {mockTemplates.filter(t => t.isFavorite).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Biblioteca de Templates</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileCode className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {template.name}
                      {template.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{template.category}</p>
                  </div>
                </div>
                <Badge variant="outline">{template.usageCount} usos</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{template.description}</p>

              {/* Variables */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Variáveis:</p>
                <div className="flex flex-wrap gap-1">
                  {template.variables.map((variable, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-mono">
                      <Variable className="h-3 w-3 mr-1" />
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {template.createdBy}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(template.lastModified).toLocaleDateString("pt-BR")}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setVariableValues({});
                      }}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Usar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Gerar Documento: {template.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        {template.variables.map((variable) => {
                          const key = variable.replace(/[{}]/g, "");
                          return (
                            <div key={key}>
                              <label className="text-sm font-medium">{key}</label>
                              <Input
                                placeholder={`Digite ${key}...`}
                                value={variableValues[key] || ""}
                                onChange={(e) => setVariableValues(prev => ({
                                  ...prev,
                                  [key]: e.target.value
                                }))}
                                className="mt-1"
                              />
                            </div>
                          );
                        })}
                      </div>

                      <div>
                        <label className="text-sm font-medium">Preview:</label>
                        <Textarea
                          value={generatePreview(template)}
                          readOnly
                          className="mt-1 h-48 font-mono text-sm"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          Baixar PDF
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Baixar DOCX
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TemplateManager;
