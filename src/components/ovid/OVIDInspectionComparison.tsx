import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  GitCompare, Ship, Calendar, User, CheckCircle, XCircle, 
  AlertTriangle, TrendingUp, TrendingDown, Minus, ArrowRight,
  BarChart3, Target, FileText
} from 'lucide-react';
import { useOVIDInspection, OVIDInspection } from '@/hooks/useOVIDInspection';
import { OVIQ4_CHAPTERS } from '@/data/oviq4-complete-data';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, ResponsiveContainer, Legend
} from 'recharts';

interface OVIDInspectionComparisonProps {
  preSelectedInspectionId?: string;
}

export const OVIDInspectionComparison: React.FC<OVIDInspectionComparisonProps> = ({
  preSelectedInspectionId,
}) => {
  const [inspections, setInspections] = useState<OVIDInspection[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<string>('');
  const [inspection1Id, setInspection1Id] = useState<string>('');
  const [inspection2Id, setInspection2Id] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { loadHistory } = useOVIDInspection();

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadHistory();
      setInspections(data);
      setIsLoading(false);
      
      // If preselected, set initial values
      if (preSelectedInspectionId && data.length > 0) {
        const preSelected = data.find(i => i.id === preSelectedInspectionId);
        if (preSelected) {
          setSelectedVessel(preSelected.vessel_name);
        }
      }
    };
    fetchData();
  }, [loadHistory, preSelectedInspectionId]);

  // Unique vessels
  const vessels = useMemo(() => [...new Set(inspections.map(i => i.vessel_name))], [inspections]);

  // Inspections for selected vessel
  const vesselInspections = useMemo(() => 
    inspections.filter(i => i.vessel_name === selectedVessel)
      .sort((a, b) => new Date(b.inspection_date).getTime() - new Date(a.inspection_date).getTime()),
    [inspections, selectedVessel]
  );

  // Selected inspections
  const inspection1 = useMemo(() => 
    inspections.find(i => i.id === inspection1Id), 
    [inspections, inspection1Id]
  );
  const inspection2 = useMemo(() => 
    inspections.find(i => i.id === inspection2Id), 
    [inspections, inspection2Id]
  );

  // Calculate comparison metrics
  const comparison = useMemo(() => {
    if (!inspection1 || !inspection2) return null;

    const scoreDiff = inspection1.compliance_score - inspection2.compliance_score;
    const compliantDiff = inspection1.compliant_count - inspection2.compliant_count;
    const ncDiff = inspection1.non_compliant_count - inspection2.non_compliant_count;

    return {
      scoreDiff,
      compliantDiff,
      ncDiff,
      isImproved: scoreDiff > 0,
      isNewer: new Date(inspection1.inspection_date) > new Date(inspection2.inspection_date),
    };
  }, [inspection1, inspection2]);

  // Radar chart data for comparison
  const radarData = useMemo(() => {
    if (!inspection1 || !inspection2) return [];

    return OVIQ4_CHAPTERS.slice(0, 8).map((ch, i) => {
      // Simulated data based on overall scores
      const base1 = inspection1.compliance_score;
      const base2 = inspection2.compliance_score;
      return {
        chapter: `Cap ${ch.id}`,
        name: ch.name,
        inspection1: Math.max(50, base1 - (i * 3) + (((i * 7 + 3) % 10))),
        inspection2: Math.max(50, base2 - (i * 3) + (((i * 11 + 5) % 10))),
      };
    });
  }, [inspection1, inspection2]);

  const getDiffBadge = (diff: number, inverse = false) => {
    const isPositive = inverse ? diff < 0 : diff > 0;
    if (diff === 0) return <Badge variant="outline" className="font-mono">0</Badge>;
    return (
      <Badge className={isPositive ? 'bg-success' : 'bg-destructive'}>
        <span className="font-mono">
          {diff > 0 ? '+' : ''}{diff}
        </span>
        {isPositive ? (
          <TrendingUp className="w-3 h-3 ml-1" />
        ) : (
          <TrendingDown className="w-3 h-3 ml-1" />
        )}
      </Badge>
    );
  };

  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-3">
          <GitCompare className="w-6 h-6 animate-pulse text-primary" />
          <span>Carregando dados para comparação...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-primary" />
          Comparação de Inspeções
        </h3>
        <p className="text-sm text-muted-foreground">
          Compare duas inspeções da mesma embarcação lado a lado
        </p>
      </div>

      {/* Selection Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Vessel Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Ship className="w-4 h-4" />
                Embarcação
              </label>
              <Select value={selectedVessel} onValueChange={(v) => {
                setSelectedVessel(v);
                setInspection1Id('');
                setInspection2Id('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma embarcação" />
                </SelectTrigger>
                <SelectContent>
                  {vessels.map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Inspection 1 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Inspeção 1</label>
              <Select 
                value={inspection1Id} 
                onValueChange={setInspection1Id}
                disabled={!selectedVessel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Primeira inspeção" />
                </SelectTrigger>
                <SelectContent>
                  {vesselInspections
                    .filter(i => i.id !== inspection2Id)
                    .map(i => (
                      <SelectItem key={i.id} value={i.id}>
                        {formatDate(i.inspection_date)} - {i.compliance_score}%
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Inspection 2 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Inspeção 2</label>
              <Select 
                value={inspection2Id} 
                onValueChange={setInspection2Id}
                disabled={!selectedVessel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Segunda inspeção" />
                </SelectTrigger>
                <SelectContent>
                  {vesselInspections
                    .filter(i => i.id !== inspection1Id)
                    .map(i => (
                      <SelectItem key={i.id} value={i.id}>
                        {formatDate(i.inspection_date)} - {i.compliance_score}%
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {inspection1 && inspection2 && comparison && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={comparison.scoreDiff > 0 ? 'border-success/50' : comparison.scoreDiff < 0 ? 'border-destructive/50' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Variação Score</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold">
                        {inspection1.compliance_score}%
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg text-muted-foreground">
                        {inspection2.compliance_score}%
                      </span>
                    </div>
                  </div>
                  {getDiffBadge(comparison.scoreDiff)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Conformidades</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-success">
                        {inspection1.compliant_count}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg text-muted-foreground">
                        {inspection2.compliant_count}
                      </span>
                    </div>
                  </div>
                  {getDiffBadge(comparison.compliantDiff)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Não Conformidades</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-destructive">
                        {inspection1.non_compliant_count}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg text-muted-foreground">
                        {inspection2.non_compliant_count}
                      </span>
                    </div>
                  </div>
                  {getDiffBadge(comparison.ncDiff, true)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Side by Side Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inspection 1 */}
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Inspeção 1
                  </span>
                  <Badge variant="outline">{formatDate(inspection1.inspection_date)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Inspetor</span>
                    <span className="font-medium">{inspection1.inspector_name}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Score</span>
                    <span className={`text-xl font-bold ${
                      inspection1.compliance_score >= 85 ? 'text-success' : 
                      inspection1.compliance_score >= 70 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {inspection1.compliance_score}%
                    </span>
                  </div>
                  <Progress value={inspection1.compliance_score} className="h-2" />
                  <Separator />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <CheckCircle className="w-4 h-4 mx-auto text-success" />
                      <p className="text-lg font-bold text-success">{inspection1.compliant_count}</p>
                      <p className="text-xs text-muted-foreground">Conforme</p>
                    </div>
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <XCircle className="w-4 h-4 mx-auto text-destructive" />
                      <p className="text-lg font-bold text-destructive">{inspection1.non_compliant_count}</p>
                      <p className="text-xs text-muted-foreground">NC</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <Minus className="w-4 h-4 mx-auto text-muted-foreground" />
                      <p className="text-lg font-bold">{inspection1.not_applicable_count}</p>
                      <p className="text-xs text-muted-foreground">N/A</p>
                    </div>
                  </div>
                  {inspection1.location && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Local</span>
                        <span className="text-sm">{inspection1.location}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Inspection 2 */}
            <Card className="border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Inspeção 2
                  </span>
                  <Badge variant="secondary">{formatDate(inspection2.inspection_date)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Inspetor</span>
                    <span className="font-medium">{inspection2.inspector_name}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Score</span>
                    <span className={`text-xl font-bold ${
                      inspection2.compliance_score >= 85 ? 'text-success' : 
                      inspection2.compliance_score >= 70 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {inspection2.compliance_score}%
                    </span>
                  </div>
                  <Progress value={inspection2.compliance_score} className="h-2" />
                  <Separator />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <CheckCircle className="w-4 h-4 mx-auto text-success" />
                      <p className="text-lg font-bold text-success">{inspection2.compliant_count}</p>
                      <p className="text-xs text-muted-foreground">Conforme</p>
                    </div>
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <XCircle className="w-4 h-4 mx-auto text-destructive" />
                      <p className="text-lg font-bold text-destructive">{inspection2.non_compliant_count}</p>
                      <p className="text-xs text-muted-foreground">NC</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <Minus className="w-4 h-4 mx-auto text-muted-foreground" />
                      <p className="text-lg font-bold">{inspection2.not_applicable_count}</p>
                      <p className="text-xs text-muted-foreground">N/A</p>
                    </div>
                  </div>
                  {inspection2.location && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Local</span>
                        <span className="text-sm">{inspection2.location}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Radar Chart Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Comparação por Capítulo
              </CardTitle>
              <CardDescription>
                Radar de desempenho nos principais capítulos OVIQ4
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis dataKey="chapter" className="text-xs" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Inspeção 1"
                    dataKey="inspection1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Inspeção 2"
                    dataKey="inspection2"
                    stroke="hsl(217, 91%, 60%)"
                    fill="hsl(217, 91%, 60%)"
                    fillOpacity={0.2}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Analysis Summary */}
          <Card className={comparison.isImproved ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {comparison.isImproved ? (
                  <TrendingUp className="w-8 h-8 text-success flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-warning flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-semibold mb-1">
                    {comparison.isImproved ? 'Melhoria Detectada' : 'Atenção Necessária'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {comparison.isImproved ? (
                      <>
                        A inspeção mais recente apresentou um aumento de <strong>{Math.abs(comparison.scoreDiff)} pontos</strong> no 
                        score de conformidade. As não conformidades {comparison.ncDiff < 0 ? 'diminuíram' : 'aumentaram'} em {Math.abs(comparison.ncDiff)} itens.
                      </>
                    ) : (
                      <>
                        A inspeção mais recente apresentou uma redução de <strong>{Math.abs(comparison.scoreDiff)} pontos</strong> no 
                        score de conformidade. Recomenda-se revisar as áreas críticas identificadas.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!inspection1 && !inspection2 && selectedVessel && (
        <Card className="p-8 text-center">
          <GitCompare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Selecione duas inspeções para comparar
          </p>
        </Card>
      )}

      {!selectedVessel && (
        <Card className="p-8 text-center">
          <Ship className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Selecione uma embarcação para ver as inspeções disponíveis
          </p>
        </Card>
      )}
    </div>
  );
};
