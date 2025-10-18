import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Play, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AUDIT_TYPES = ['Petrobras', 'IBAMA', 'ISO', 'IMCA', 'ISM', 'SGSO'];

interface AuditPrediction {
  id: string;
  vessel_id: string;
  audit_type: string;
  expected_score: number;
  probability: string;
  confidence_level: number;
  weaknesses: string[];
  recommendations: string[];
  compliance_areas: Record<string, number>;
}

interface Vessel {
  id: string;
  name: string;
}

export function AuditSimulator() {
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>('');
  const [selectedAuditType, setSelectedAuditType] = useState<string>('');
  const [prediction, setPrediction] = useState<AuditPrediction | null>(null);

  useEffect(() => {
    loadVessels();
  }, []);

  const loadVessels = async () => {
    try {
      const { data } = await supabase
        .from('vessels')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (data) {
        setVessels(data);
      }
    } catch (error: any) {
      console.error('Error loading vessels:', error);
      toast.error('Failed to load vessels');
    }
  };

  const simulateAudit = async () => {
    if (!selectedVessel || !selectedAuditType) {
      toast.error('Please select both vessel and audit type');
      return;
    }

    setSimulating(true);
    try {
      const response = await fetch('/api/audit/score-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vessel_id: selectedVessel,
          audit_type: selectedAuditType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate prediction');
      }

      const data = await response.json();
      setPrediction(data.prediction);
      toast.success('Audit prediction generated successfully');
    } catch (error: any) {
      console.error('Error simulating audit:', error);
      toast.error('Failed to simulate audit');
    } finally {
      setSimulating(false);
    }
  };

  const getProbabilityIcon = (probability: string) => {
    switch (probability) {
      case 'Alta':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'Baixa':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'Alta':
        return 'text-green-600';
      case 'Baixa':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Simulador de Auditoria</h2>
        <p className="text-sm text-muted-foreground">
          Simule resultados de auditorias com base em dados históricos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração da Simulação</CardTitle>
          <CardDescription>
            Selecione a embarcação e o tipo de auditoria para gerar uma previsão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Embarcação</label>
              <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map((vessel) => (
                    <SelectItem key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Auditoria</label>
              <Select value={selectedAuditType} onValueChange={setSelectedAuditType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={simulateAudit}
            disabled={!selectedVessel || !selectedAuditType || simulating}
            className="w-full"
          >
            <Play className={`w-4 h-4 mr-2 ${simulating ? 'animate-pulse' : ''}`} />
            {simulating ? 'Simulando...' : 'Simular Auditoria'}
          </Button>
        </CardContent>
      </Card>

      {prediction && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Simulação</CardTitle>
              <CardDescription>
                Previsão para auditoria {prediction.audit_type}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Score Esperado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${getScoreColor(prediction.expected_score)}`}>
                      {prediction.expected_score}
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Probabilidade de Aprovação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      {getProbabilityIcon(prediction.probability)}
                      <span className={`text-2xl font-bold ${getProbabilityColor(prediction.probability)}`}>
                        {prediction.probability}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Confiança da IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(prediction.confidence_level * 100)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Áreas de Conformidade</h4>
                <div className="space-y-3">
                  {Object.entries(prediction.compliance_areas).map(([area, score]) => (
                    <div key={area} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{area}</span>
                        <span className="font-semibold">{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Fragilidades Identificadas</h4>
                <ul className="space-y-1">
                  {prediction.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Recomendações</h4>
                <ul className="space-y-1">
                  {prediction.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
