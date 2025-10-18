import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TacticalRisk {
  id: string;
  vessel_id: string;
  system: string;
  risk_type: string;
  risk_score: number;
  risk_level: string;
  description: string;
  suggested_action: string;
  status: string;
  predicted_date: string;
  valid_until: string;
}

interface VesselRiskSummary {
  vessel_id: string;
  vessel_name: string;
  total_risks: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  active_risks: number;
  unassigned_risks: number;
}

export function TacticalRiskPanel() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [riskSummaries, setRiskSummaries] = useState<VesselRiskSummary[]>([]);
  const [risks, setRisks] = useState<TacticalRisk[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    setLoading(true);
    try {
      // Get risk summaries
      const { data: summaries } = await supabase.rpc('get_vessel_risk_summary');
      if (summaries) {
        setRiskSummaries(summaries);
      }

      // Get all risks
      const { data: risksData } = await supabase
        .from('tactical_risks')
        .select('*')
        .eq('status', 'active')
        .order('risk_score', { ascending: false });
      
      if (risksData) {
        setRisks(risksData);
      }
    } catch (error: any) {
      console.error('Error loading risk data:', error);
      toast.error('Failed to load risk data');
    } finally {
      setLoading(false);
    }
  };

  const generateForecasts = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/ai/forecast-risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Generate for all vessels
      });

      if (!response.ok) {
        throw new Error('Failed to generate forecasts');
      }

      const data = await response.json();
      toast.success(`Generated forecasts for ${data.results?.length || 0} vessel(s)`);
      await loadRiskData();
    } catch (error: any) {
      console.error('Error generating forecasts:', error);
      toast.error('Failed to generate forecasts');
    } finally {
      setGenerating(false);
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'High':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'Medium':
        return <Info className="w-4 h-4 text-yellow-500" />;
      case 'Low':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'destructive';
      case 'High':
        return 'default';
      case 'Medium':
        return 'secondary';
      case 'Low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredRisks = selectedVessel
    ? risks.filter(r => r.vessel_id === selectedVessel)
    : risks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Riscos Táticos</h2>
          <p className="text-sm text-muted-foreground">
            Previsão de riscos operacionais para os próximos 15 dias
          </p>
        </div>
        <Button onClick={generateForecasts} disabled={generating || loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Gerando...' : 'Gerar Previsões'}
        </Button>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {riskSummaries.map((summary) => (
          <Card 
            key={summary.vessel_id}
            className={`cursor-pointer transition-shadow hover:shadow-lg ${
              selectedVessel === summary.vessel_id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedVessel(
              selectedVessel === summary.vessel_id ? null : summary.vessel_id
            )}
          >
            <CardHeader>
              <CardTitle className="text-lg">{summary.vessel_name}</CardTitle>
              <CardDescription>
                {summary.active_risks} riscos ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="font-semibold">{summary.critical_count}</span>
                  <span className="text-muted-foreground">Críticos</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold">{summary.high_count}</span>
                  <span className="text-muted-foreground">Altos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-yellow-500" />
                  <span className="font-semibold">{summary.medium_count}</span>
                  <span className="text-muted-foreground">Médios</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="font-semibold">{summary.low_count}</span>
                  <span className="text-muted-foreground">Baixos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Details List */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes dos Riscos</CardTitle>
          <CardDescription>
            {selectedVessel 
              ? `Riscos para embarcação selecionada (${filteredRisks.length})`
              : `Todos os riscos ativos (${filteredRisks.length})`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRisks.map((risk) => (
              <div 
                key={risk.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="mt-1">
                  {getRiskIcon(risk.risk_level)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{risk.system}</span>
                      <Badge variant={getRiskBadgeVariant(risk.risk_level)}>
                        {risk.risk_level}
                      </Badge>
                      <Badge variant="outline">{risk.risk_type}</Badge>
                    </div>
                    <span className="text-sm font-mono text-muted-foreground">
                      Score: {risk.risk_score}
                    </span>
                  </div>
                  <p className="text-sm">{risk.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Ação sugerida:</span>
                    <span className="text-foreground">{risk.suggested_action}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredRisks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum risco ativo encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
