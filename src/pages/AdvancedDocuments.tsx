import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedDocumentScanner } from "@/components/documents/enhanced-document-scanner";
import { AdvancedDocumentCenter } from "@/components/documents/advanced-document-center";
import IntelligentDocumentManager from "@/components/documents/intelligent-document-manager";
import { DocumentValidator } from "@/components/ui/document-validator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Scan, 
  Brain, 
  FileCheck, 
  Search,
  Archive,
  Settings,
  BarChart3
} from "lucide-react";

const AdvancedDocumentsPage = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Centro Avançado de Documentos
          </h1>
          <p className="text-lg text-muted-foreground">
            Plataforma completa para digitalização, análise e gestão inteligente de documentos
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Scan className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-medium">Scanner IA</h3>
                <p className="text-sm text-muted-foreground">OCR avançado</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-medium">Análise IA</h3>
                <p className="text-sm text-muted-foreground">Insights automáticos</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <FileCheck className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-medium">Validação</h3>
                <p className="text-sm text-muted-foreground">Verificação automática</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Archive className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-medium">Gestão</h3>
                <p className="text-sm text-muted-foreground">Organização inteligente</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="scanner" className="space-y-6">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 md:grid-cols-5 min-w-fit">
              <TabsTrigger value="scanner" className="gap-2">
                <Scan className="h-4 w-4" />
                <span className="hidden sm:inline">Scanner IA</span>
                <span className="sm:hidden">Scanner</span>
              </TabsTrigger>
              <TabsTrigger value="management" className="gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Gestão</span>
                <span className="sm:hidden">Gestão</span>
              </TabsTrigger>
              <TabsTrigger value="intelligent" className="gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Análise IA</span>
                <span className="sm:hidden">IA</span>
              </TabsTrigger>
              <TabsTrigger value="validator" className="gap-2">
                <FileCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Validação</span>
                <span className="sm:hidden">Valid.</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Scanner Tab */}
          <TabsContent value="scanner" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Scanner de Documentos Inteligente
                </CardTitle>
                <CardDescription>
                  Capture documentos com câmera ou upload, com OCR avançado e análise de IA em tempo real. 
                  Suporte completo para dispositivos móveis e tablets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedDocumentScanner />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Centro de Gestão de Documentos
                </CardTitle>
                <CardDescription>
                  Sistema completo para organizar, categorizar e gerenciar documentos com fluxos de aprovação avançados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdvancedDocumentCenter />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Intelligent Tab */}
          <TabsContent value="intelligent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Análise Inteligente de Documentos
                </CardTitle>
                <CardDescription>
                  IA avançada para análise de conteúdo, extração de insights e organização automática de documentos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IntelligentDocumentManager />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Validator Tab */}
          <TabsContent value="validator" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Validação de Documentos
                </CardTitle>
                <CardDescription>
                  Sistema de validação automática para certificados, licenças e outros documentos oficiais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Certificados Marítimos</h3>
                    <DocumentValidator 
                      documentType="certificate" 
                      onValidationComplete={(result) => console.log("Certificado validado:", result)}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Licenças e Permissões</h3>
                    <DocumentValidator 
                      documentType="license"
                      onValidationComplete={(result) => console.log("Licença validada:", result)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documentos Processados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">1,247</div>
                  <p className="text-sm text-muted-foreground">Este mês (+23%)</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taxa de Precisão OCR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">97.8%</div>
                  <p className="text-sm text-muted-foreground">Média de confiança</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Documentos Validados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">892</div>
                  <p className="text-sm text-muted-foreground">Aprovados automaticamente</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tempo Médio de Processamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">2.3s</div>
                  <p className="text-sm text-muted-foreground">Por documento</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categorias Detectadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-indigo-600">15</div>
                  <p className="text-sm text-muted-foreground">Tipos diferentes</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Economia de Tempo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-teal-600">147h</div>
                  <p className="text-sm text-muted-foreground">Vs processo manual</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics Features */}
            <Card>
              <CardHeader>
                <CardTitle>Relatórios e Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900">Documentos Mais Processados</h4>
                    <ul className="mt-2 space-y-1 text-sm text-blue-700">
                      <li>• Certificados de Segurança (34%)</li>
                      <li>• Licenças Marítimas (28%)</li>
                      <li>• Contratos (22%)</li>
                      <li>• Relatórios de Vistoria (16%)</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900">Melhorias Detectadas</h4>
                    <ul className="mt-2 space-y-1 text-sm text-green-700">
                      <li>• 85% redução no tempo de processamento</li>
                      <li>• 92% menos erros de digitação</li>
                      <li>• 78% economia em custos operacionais</li>
                      <li>• 96% satisfação dos usuários</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedDocumentsPage;