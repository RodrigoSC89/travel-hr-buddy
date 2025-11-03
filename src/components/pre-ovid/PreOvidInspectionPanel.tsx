/**
 * Pre-OVID Inspection Panel Component
 * PATCH 650 - Pre-OVID Inspection Module
 */

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Upload, Brain } from 'lucide-react';
import {
  createInspection,
  generateAIReport,
  type PreOvidInspection,
  type PreOvidResponse,
  type PreOvidEvidence,
} from '@/pages/api/pre-ovid/inspections';

export default function PreOvidInspectionPanel() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState('inspection');

  // Form state
  const [vesselName, setVesselName] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [location, setLocation] = useState('');
  const [checklistVersion, setChecklistVersion] = useState('ovid-v3');
  const [observations, setObservations] = useState('');
  const [aiReport, setAiReport] = useState('[Relatório será gerado aqui]');
  const [currentInspectionId, setCurrentInspectionId] = useState<
    string | null
  >(null);

  const handleSaveInspection = async () => {
    if (!inspectorName.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe o nome do inspetor',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual authentication context
      // Get inspector ID from useAuth() or similar context
      const mockInspectorId = 'mock-inspector-id';

      const inspection: PreOvidInspection = {
        inspector_id: mockInspectorId,
        location,
        checklist_version: checklistVersion,
        notes: observations,
        status: 'draft',
      };

      // Mock responses for demonstration
      const responses: PreOvidResponse[] = [
        {
          section: 'Segurança',
          question_number: '1',
          question_text: 'Equipamentos de segurança estão disponíveis?',
          response: 'Sim',
          comments: 'Todos os equipamentos estão em boas condições',
          non_conformity: false,
        },
        {
          section: 'Tripulação',
          question_number: '2',
          question_text: 'A tripulação possui certificações válidas?',
          response: 'Sim',
          comments: 'Certificações válidas até 2026',
          non_conformity: false,
        },
      ];

      const result = await createInspection(inspection, responses, []);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.inspectionId) {
        setCurrentInspectionId(result.inspectionId);
      }

      toast({
        title: 'Sucesso',
        description: 'Inspeção salva com sucesso!',
      });
    } catch (error) {
      console.error('Error saving inspection:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar inspeção. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAIReport = async () => {
    if (!currentInspectionId) {
      toast({
        title: 'Erro',
        description: 'Salve a inspeção antes de gerar o relatório',
        variant: 'destructive',
      });
      return;
    }

    setGeneratingReport(true);

    try {
      // TODO: Replace with actual authentication context
      const mockInspectorId = 'mock-inspector-id';
      const result = await generateAIReport(
        currentInspectionId,
        mockInspectorId
      );

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        setAiReport(
          `${result.data.summary}\n\n🔍 Achados Críticos:\n${result.data.critical_findings}\n\n📋 Plano de Ação Sugerido:\n${result.data.suggested_plan}\n\n📊 Score de Risco: ${result.data.risk_score}%\n✅ Score de Conformidade: ${result.data.compliance_score}%`
        );
      }

      toast({
        title: 'Sucesso',
        description: 'Relatório IA gerado com sucesso!',
      });
    } catch (error) {
      console.error('Error generating AI report:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar relatório IA. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Pré-OVID Inspection Module</h1>
        <p className="text-muted-foreground mt-2">
          Sistema de inspeção baseado no OCIMF Offshore Vessel Inspection
          Questionnaire (OVIQ) com assistente de IA
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inspection" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Inspeção
          </TabsTrigger>
          <TabsTrigger value="evidence" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Evidências
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Relatório IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inspection">
          <Card>
            <CardHeader>
              <CardTitle>Nova Inspeção Pré-OVID</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vessel">Embarcação</Label>
                  <Input
                    id="vessel"
                    placeholder="Nome da embarcação"
                    value={vesselName}
                    onChange={(e) => setVesselName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspector">Inspetor Responsável</Label>
                  <Input
                    id="inspector"
                    placeholder="Nome do inspetor"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Local da Inspeção</Label>
                  <Input
                    id="location"
                    placeholder="Porto, ancoradouro, etc."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checklist">Checklist OVID</Label>
                  <Select
                    value={checklistVersion}
                    onValueChange={setChecklistVersion}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar checklist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ovid-v3">
                        OVID - 3ª Edição (OVIQ2 7105)
                      </SelectItem>
                      <SelectItem value="ovid-v2">OVID - 2ª Edição</SelectItem>
                      <SelectItem value="custom">Customizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações Gerais</Label>
                <Textarea
                  id="observations"
                  placeholder="Observações sobre a inspeção..."
                  rows={6}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSaveInspection}
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Inspeção
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle>Evidências da Inspeção</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Enviar Evidências
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Arraste e solte arquivos aqui ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Suporta: PDF, JPG, PNG, MP4 (máx. 50MB)
                </p>
                <Button variant="outline" className="mt-4">
                  Selecionar Arquivos
                </Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Arquivos Enviados</h4>
                <div className="text-sm text-muted-foreground">
                  Nenhum arquivo enviado ainda
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>Relatório Gerado por IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiReport">Resumo Automático</Label>
                <Textarea
                  id="aiReport"
                  rows={12}
                  readOnly
                  value={aiReport}
                  className="font-mono text-sm"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleGenerateAIReport}
                disabled={generatingReport}
              >
                {generatingReport && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {generatingReport ? 'Gerando Relatório...' : 'Gerar Relatório IA'}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Exportar PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  Exportar CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
