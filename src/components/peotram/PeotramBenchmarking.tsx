/**
 * PEOTRAM Fleet Benchmarking
 * Compare vessel scores against fleet average and industry benchmarks
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3, TrendingUp, TrendingDown, Award, Ship, Target,
  ArrowUpRight, ArrowDownRight, Minus, Trophy
} from 'lucide-react';

interface VesselBenchmark {
  id: string;
  name: string;
  type: string;
  overallScore: number;
  elementScores: Record<string, number>;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  lastAuditDate: string;
  ranking: number;
}

const INDUSTRY_AVG: Record<string, number> = {
  'E1-LGR': 72, 'E2-CL': 68, 'E3-GR': 71, 'E4-OP': 65,
  'E5-ST': 70, 'E6-MN': 63, 'E7-GM': 69, 'E8-AQ': 74,
  'E9-RH': 67, 'E10-GI': 72, 'E11-PE': 60, 'E12-AI': 58, 'E13-MC': 66,
};
const INDUSTRY_AVG_OVERALL = Math.round(Object.values(INDUSTRY_AVG).reduce((a, b) => a + b, 0) / Object.keys(INDUSTRY_AVG).length);

const VESSELS: VesselBenchmark[] = [
  { id: '1', name: 'AHTS Netuno I', type: 'AHTS', overallScore: 89, elementScores: { 'E1-LGR': 92, 'E2-CL': 88, 'E3-GR': 90, 'E4-OP': 85, 'E5-ST': 91, 'E6-MN': 82, 'E7-GM': 88, 'E8-AQ': 93, 'E9-RH': 86, 'E10-GI': 90, 'E11-PE': 84, 'E12-AI': 88, 'E13-MC': 92 }, trend: 'up', trendValue: 4, lastAuditDate: '2026-01-15', ranking: 1 },
  { id: '2', name: 'PSV Poseidon II', type: 'PSV', overallScore: 82, elementScores: { 'E1-LGR': 85, 'E2-CL': 80, 'E3-GR': 84, 'E4-OP': 78, 'E5-ST': 83, 'E6-MN': 75, 'E7-GM': 82, 'E8-AQ': 86, 'E9-RH': 79, 'E10-GI': 84, 'E11-PE': 77, 'E12-AI': 80, 'E13-MC': 85 }, trend: 'up', trendValue: 2, lastAuditDate: '2026-01-20', ranking: 2 },
  { id: '3', name: 'PLSV Tritão III', type: 'PLSV', overallScore: 76, elementScores: { 'E1-LGR': 78, 'E2-CL': 74, 'E3-GR': 76, 'E4-OP': 72, 'E5-ST': 77, 'E6-MN': 70, 'E7-GM': 75, 'E8-AQ': 80, 'E9-RH': 73, 'E10-GI': 78, 'E11-PE': 71, 'E12-AI': 74, 'E13-MC': 78 }, trend: 'stable', trendValue: 0, lastAuditDate: '2025-12-10', ranking: 3 },
  { id: '4', name: 'RSV Oceano IV', type: 'RSV', overallScore: 71, elementScores: { 'E1-LGR': 74, 'E2-CL': 68, 'E3-GR': 72, 'E4-OP': 65, 'E5-ST': 73, 'E6-MN': 62, 'E7-GM': 70, 'E8-AQ': 76, 'E9-RH': 68, 'E10-GI': 73, 'E11-PE': 64, 'E12-AI': 67, 'E13-MC': 72 }, trend: 'down', trendValue: -3, lastAuditDate: '2025-11-28', ranking: 4 },
];

const fleetAvg = Math.round(VESSELS.reduce((a, v) => a + v.overallScore, 0) / VESSELS.length);

const ELEMENT_NAMES: Record<string, string> = {
  'E1-LGR': 'Liderança e Gestão', 'E2-CL': 'Compliance Legal', 'E3-GR': 'Gestão de Riscos',
  'E4-OP': 'Operações', 'E5-ST': 'Segurança do Trabalho', 'E6-MN': 'Manutenção',
  'E7-GM': 'Gestão de Mudanças', 'E8-AQ': 'Aquisição e Contratação', 'E9-RH': 'Recursos Humanos',
  'E10-GI': 'Gestão da Informação', 'E11-PE': 'Preparação p/ Emergência', 'E12-AI': 'Análise de Incidentes',
  'E13-MC': 'Melhoria Contínua',
};

function getTrendIcon(trend: string) {
  if (trend === 'up') return <ArrowUpRight className="h-3.5 w-3.5 text-success" />;
  if (trend === 'down') return <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

function getScoreColor(score: number) {
  if (score >= 85) return 'text-success';
  if (score >= 70) return 'text-warning';
  return 'text-destructive';
}

export function PeotramBenchmarking() {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const vessel = VESSELS.find(v => v.id === selectedVessel);

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Fleet Benchmarking PEOTRAM
          </CardTitle>
          <CardDescription>Comparação de scores por embarcação vs média da frota e indústria</CardDescription>
        </CardHeader>
      </Card>

      {/* Fleet Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Ship className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Média da Frota</span>
            </div>
            <p className="text-2xl font-bold text-primary">{fleetAvg}%</p>
            <Progress value={fleetAvg} className="h-1.5 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Média Indústria</span>
            </div>
            <p className="text-2xl font-bold">{INDUSTRY_AVG_OVERALL}%</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-success" />
              <span className="text-xs text-success">+{fleetAvg - INDUSTRY_AVG_OVERALL}pts acima</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-warning" />
              <span className="text-xs text-muted-foreground">Melhor Embarcação</span>
            </div>
            <p className="text-sm font-bold">{VESSELS[0].name}</p>
            <p className="text-lg font-bold text-success">{VESSELS[0].overallScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Embarcações</span>
            </div>
            <p className="text-2xl font-bold">{VESSELS.length}</p>
            <p className="text-xs text-muted-foreground">{VESSELS.filter(v => v.trend === 'up').length} em melhoria</p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking */}
      <div className="space-y-3">
        {VESSELS.map((v, idx) => (
          <Card
            key={v.id}
            className={`cursor-pointer transition-all hover:shadow-md ${selectedVessel === v.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedVessel(selectedVessel === v.id ? null : v.id)}
          >
            <CardContent className="py-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'}`}>
                    #{v.ranking}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.type} • Última auditoria: {new Date(v.lastAuditDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(v.trend)}
                    <span className={`text-xs ${v.trend === 'up' ? 'text-success' : v.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {v.trendValue > 0 ? '+' : ''}{v.trendValue}pts
                    </span>
                  </div>
                  <div className="w-24">
                    <Progress value={v.overallScore} className="h-2" />
                  </div>
                  <span className={`text-lg font-bold min-w-[45px] text-right ${getScoreColor(v.overallScore)}`}>{v.overallScore}%</span>
                  <Badge variant="outline" className={v.overallScore > INDUSTRY_AVG_OVERALL ? 'bg-success/10 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/30'}>
                    {v.overallScore > INDUSTRY_AVG_OVERALL ? 'Acima' : 'Abaixo'}
                  </Badge>
                </div>
              </div>

              {/* Element breakdown when selected */}
              {selectedVessel === v.id && (
                <div className="mt-4 pt-3 border-t border-border/50 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Score por Elemento vs Indústria</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(v.elementScores).map(([key, score]) => {
                      const industryVal = INDUSTRY_AVG[key] || 65;
                      const diff = score - industryVal;
                      return (
                        <div key={key} className="flex items-center gap-2 text-xs">
                          <span className="w-[140px] truncate text-muted-foreground">{ELEMENT_NAMES[key] || key}</span>
                          <div className="flex-1">
                            <Progress value={score} className="h-1.5" />
                          </div>
                          <span className={`font-medium min-w-[32px] text-right ${getScoreColor(score)}`}>{score}%</span>
                          <span className={`min-w-[40px] text-right ${diff >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {diff >= 0 ? '+' : ''}{diff}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
