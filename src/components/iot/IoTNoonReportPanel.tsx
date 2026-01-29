/**
 * IoT Noon Report Auto-Fill Panel
 * Interface revolucionária para geração automática de Noon Reports
 * INÉDITO na indústria marítima mundial
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Cpu, 
  Navigation, 
  Fuel, 
  Gauge, 
  Cloud, 
  Anchor, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  Download,
  RefreshCw,
  Zap,
  TrendingUp
} from 'lucide-react';
import { noonReportAutoFill, type NoonReportData } from '@/lib/iot';
import { useToast } from '@/hooks/use-toast';

interface IoTNoonReportPanelProps {
  vesselId?: string;
  voyageNumber?: string;
}

export const IoTNoonReportPanel: React.FC<IoTNoonReportPanelProps> = ({
  vesselId = 'vessel-demo-001',
  voyageNumber = 'VOY-2024-001'
}) => {
  const { toast } = useToast();
  const [isCollecting, setIsCollecting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<NoonReportData | null>(null);
  const [collectionProgress, setCollectionProgress] = useState(0);
  const [sensorsConnected, setSensorsConnected] = useState(0);

  useEffect(() => {
    // Simular progresso de coleta
    if (isCollecting) {
      const interval = setInterval(() => {
        setCollectionProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.random() * 5;
        });
        setSensorsConnected(prev => Math.min(prev + 1, 12));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCollecting]);

  const startDataCollection = async () => {
    setIsCollecting(true);
    setCollectionProgress(0);
    setSensorsConnected(0);
    
    try {
      await noonReportAutoFill.initializeDataCollection(vesselId);
      toast({
        title: "🚀 Coleta IoT Iniciada",
        description: "Coletando dados de sensores em tempo real para o Noon Report",
      });
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Usando dados de fallback para demonstração",
        variant: "destructive",
      });
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      const generatedReport = await noonReportAutoFill.generateNoonReport(
        vesselId,
        voyageNumber,
        new Date()
      );
      setReport(generatedReport);
      toast({
        title: "✅ Noon Report Gerado",
        description: `Confiança: ${Math.round(generatedReport.meta.confidenceScore * 100)}% - ${generatedReport.meta.sensorsUsed.length} sensores utilizados`,
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: "Por favor tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-success/20 text-success border-success/30';
    if (score >= 0.5) return 'bg-warning/20 text-warning border-warning/30';
    return 'bg-destructive/20 text-destructive border-destructive/30';
  };

  return (
    <div className="space-y-6">
      {/* Header com Status */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Noon Report Auto-Fill</CardTitle>
                <CardDescription>
                  Geração automática com dados de IoT em tempo real
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
              <Zap className="h-3 w-3 mr-1" />
              INÉDITO MUNDIAL
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-card/50 border">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Sensores Conectados</span>
              </div>
              <p className="text-2xl font-bold">{sensorsConnected}/12</p>
              <Progress value={(sensorsConnected / 12) * 100} className="mt-2 h-1" />
            </div>
            
            <div className="p-4 rounded-lg bg-card/50 border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Dados Coletados</span>
              </div>
              <p className="text-2xl font-bold">{Math.round(collectionProgress)}%</p>
              <Progress value={collectionProgress} className="mt-2 h-1" />
            </div>
            
            <div className="p-4 rounded-lg bg-card/50 border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <p className="text-lg font-medium">
                {isCollecting ? 'Coletando...' : report ? 'Relatório Pronto' : 'Aguardando'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={startDataCollection} 
              disabled={isCollecting}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isCollecting ? 'animate-spin' : ''}`} />
              {isCollecting ? 'Coletando...' : 'Iniciar Coleta IoT'}
            </Button>
            
            <Button 
              onClick={generateReport} 
              disabled={isGenerating || collectionProgress < 50}
              variant="secondary"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              {isGenerating ? 'Gerando...' : 'Gerar Noon Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Relatório Gerado */}
      {report && (
        <Tabs defaultValue="position" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="position" className="gap-2">
                <Navigation className="h-4 w-4" />
                Posição
              </TabsTrigger>
              <TabsTrigger value="consumption" className="gap-2">
                <Fuel className="h-4 w-4" />
                Consumo
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-2">
                <Gauge className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="weather" className="gap-2">
                <Cloud className="h-4 w-4" />
                Meteorologia
              </TabsTrigger>
              <TabsTrigger value="cargo" className="gap-2">
                <Anchor className="h-4 w-4" />
                Carga
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Badge className={getConfidenceColor(report.meta.confidenceScore)}>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {Math.round(report.meta.confidenceScore * 100)}% Confiança
              </Badge>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>

          <TabsContent value="position">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Dados de Posição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Latitude</p>
                    <p className="text-xl font-bold">{report.position.latitude.toFixed(4)}°</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Longitude</p>
                    <p className="text-xl font-bold">{report.position.longitude.toFixed(4)}°</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Rumo</p>
                    <p className="text-xl font-bold">{report.position.course.toFixed(0)}°</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Velocidade</p>
                    <p className="text-xl font-bold">{report.position.speed.toFixed(1)} kn</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consumption">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5 text-warning" />
                  Consumo de Combustível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">HFO</p>
                    <p className="text-xl font-bold">{report.consumption.fuelOilHFO.toFixed(1)} MT</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">MDO</p>
                    <p className="text-xl font-bold">{report.consumption.fuelOilMDO.toFixed(1)} MT</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Lub Oil</p>
                    <p className="text-xl font-bold">{report.consumption.lubOil.toFixed(2)} MT</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Água Doce</p>
                    <p className="text-xl font-bold">{report.consumption.freshWater.toFixed(0)} m³</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-success" />
                  Performance da Máquina
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">RPM Motor</p>
                    <p className="text-xl font-bold">{report.performance.mainEngineRPM.toFixed(0)}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Potência</p>
                    <p className="text-xl font-bold">{report.performance.mainEnginePower.toFixed(0)}% MCR</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Vel. Média</p>
                    <p className="text-xl font-bold">{report.performance.averageSpeed.toFixed(1)} kn</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Distância</p>
                    <p className="text-xl font-bold">{report.performance.distanceTraveled.toFixed(0)} NM</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Slip</p>
                    <p className="text-xl font-bold">{report.performance.slip.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weather">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-sky-500" />
                  Condições Meteorológicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Vento</p>
                    <p className="text-xl font-bold">{report.weather.windSpeed} kn @ {report.weather.windDirection}°</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Estado do Mar</p>
                    <p className="text-xl font-bold">Beaufort {report.weather.seaState}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Swell</p>
                    <p className="text-xl font-bold">{report.weather.swellHeight.toFixed(1)} m</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Barômetro</p>
                    <p className="text-xl font-bold">{report.weather.barometer} hPa</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cargo">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Anchor className="h-5 w-5 text-primary" />
                  Dados de Carga e Calado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Carga</p>
                    <p className="text-xl font-bold">{report.cargo.cargoWeight.toLocaleString()} MT</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Lastro</p>
                    <p className="text-xl font-bold">{report.cargo.ballastWeight.toLocaleString()} MT</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Deslocamento</p>
                    <p className="text-xl font-bold">{report.cargo.displacement.toLocaleString()} MT</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Calado Médio</p>
                    <p className="text-xl font-bold">{report.cargo.draft.mean.toFixed(2)} m</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Calado Proa</p>
                    <p className="text-xl font-bold">{report.cargo.draft.fore.toFixed(2)} m</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Calado Popa</p>
                    <p className="text-xl font-bold">{report.cargo.draft.aft.toFixed(2)} m</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Info sobre sensores utilizados */}
      {report && (
        <Card className="bg-card/50 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Sensores utilizados: {report.meta.sensorsUsed.join(', ')}
                </span>
              </div>
              <Badge variant="outline">
                Fonte: {report.meta.dataSource.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IoTNoonReportPanel;
