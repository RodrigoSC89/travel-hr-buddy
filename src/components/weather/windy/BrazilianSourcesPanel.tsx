/**
 * Brazilian Weather Sources Panel
 * Displays data from Marinha do Brasil and CPTEC/INPE
 * PATCH WINDY-2.2
 */

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Anchor, Ship, Waves, Wind, AlertTriangle, Sun, Cloud, 
  CloudRain, RefreshCw, Loader2, MapPin, ThermometerSun,
  Eye, Gauge, Navigation, Info, ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchMarinhaBrasilData, type MarinhaBrasilData } from "@/services/weather/marinha-brasil.service";
import { fetchCPTECData, type CPTECData } from "@/services/weather/cptec-inpe.service";
import { logger } from '@/lib/logger';

interface BrazilianSourcesPanelProps {
  className?: string;
}

// Coastal regions for Marinha
const COASTAL_REGIONS = [
  { id: "N", name: "Norte" },
  { id: "NE", name: "Nordeste" },
  { id: "E", name: "Leste" },
  { id: "SE", name: "Sudeste" },
  { id: "S", name: "Sul" },
];

// Cities for CPTEC
const CITIES = [
  { name: "Santos", id: 244 },
  { name: "Rio de Janeiro", id: 241 },
  { name: "Vitória", id: 320 },
  { name: "Salvador", id: 270 },
  { name: "Recife", id: 265 },
  { name: "Fortaleza", id: 150 },
  { name: "Natal", id: 228 },
  { name: "São Paulo", id: 244 },
  { name: "Florianópolis", id: 148 },
  { name: "Porto Alegre", id: 261 },
];

const getWeatherIcon = (tempo: string) => {
  if (!tempo) return <Sun className="h-8 w-8 text-yellow-400" />;
  const t = tempo.toLowerCase();
  if (t.includes('chuva') || t.includes('chu') || t.includes('c')) {
    return <CloudRain className="h-8 w-8 text-blue-400" />;
  }
  if (t.includes('nublado') || t.includes('nub') || t.includes('n')) {
    return <Cloud className="h-8 w-8 text-gray-400" />;
  }
  if (t.includes('parcialmente') || t.includes('ps')) {
    return <Sun className="h-8 w-8 text-orange-400" />;
  }
  return <Sun className="h-8 w-8 text-yellow-400" />;
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'perigo': return 'bg-red-500/20 text-red-400 border-red-500/50';
    case 'alerta': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    case 'atencao': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    default: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
  }
};

export const BrazilianSourcesPanel: React.FC<BrazilianSourcesPanelProps> = ({
  className
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("marinha");
  
  // Marinha state
  const [selectedRegion, setSelectedRegion] = useState<string>("SE");
  const [marinhaData, setMarinhaData] = useState<MarinhaBrasilData | null>(null);
  const [marinhaLoading, setMarinhaLoading] = useState(false);
  
  // CPTEC state
  const [selectedCity, setSelectedCity] = useState<string>("Santos");
  const [cptecData, setCptecData] = useState<CPTECData | null>(null);
  const [cptecLoading, setCptecLoading] = useState(false);
  const [wavesData, setWavesData] = useState<CPTECData | null>(null);

  // Fetch Marinha data
  const fetchMarinha = useCallback(async (forceRefresh = false) => {
    setMarinhaLoading(true);
    try {
      const data = await fetchMarinhaBrasilData({
        region: selectedRegion,
        forceRefresh,
      });
      setMarinhaData(data);
      
      if (!data.success) {
        toast({
          title: "Aviso",
          description: "Usando dados em cache da Marinha",
          variant: "destructive"
        });
      }
    } catch (error) {
      logger.error('Failed to fetch Marinha data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados da Marinha",
        variant: "destructive"
      });
    } finally {
      setMarinhaLoading(false);
    }
  }, [selectedRegion, toast]);

  // Fetch CPTEC data
  const fetchCPTEC = useCallback(async (forceRefresh = false) => {
    setCptecLoading(true);
    try {
      const cityData = CITIES.find(c => c.name === selectedCity);
      
      const [previsaoData, ondasData] = await Promise.all([
        fetchCPTECData({
          type: "previsao",
          cidade: selectedCity,
          cidadeId: cityData?.id,
          dias: 7,
          forceRefresh,
        }),
        fetchCPTECData({
          type: "ondas",
          cidade: selectedCity,
          forceRefresh,
        }),
      ]);
      
      setCptecData(previsaoData);
      setWavesData(ondasData);
      
      if (!previsaoData.success) {
        toast({
          title: "Aviso",
          description: "Usando dados em cache do CPTEC",
        });
      }
    } catch (error) {
      logger.error('Failed to fetch CPTEC data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do CPTEC",
        variant: "destructive"
      });
    } finally {
      setCptecLoading(false);
    }
  }, [selectedCity, toast]);

  // Initial load
  useEffect(() => {
    fetchMarinha();
  }, [fetchMarinha]);

  useEffect(() => {
    fetchCPTEC();
  }, [fetchCPTEC]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("space-y-4 min-h-[500px]", className)}>
      <TabsList className="bg-slate-800/50 border border-white/10 w-fit">
        <TabsTrigger 
          value="marinha" 
          className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
        >
          <Anchor className="h-4 w-4 mr-2" />
          Marinha do Brasil
        </TabsTrigger>
        <TabsTrigger 
          value="cptec"
          className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
        >
          <Sun className="h-4 w-4 mr-2" />
          CPTEC/INPE
        </TabsTrigger>
      </TabsList>

      {/* Marinha do Brasil Tab */}
      <TabsContent value="marinha" className="mt-4 space-y-4">
        <div className="flex items-center gap-4">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-48 bg-slate-800 border-white/20 text-white">
              <SelectValue placeholder="Região" />
            </SelectTrigger>
            <SelectContent>
              {COASTAL_REGIONS.map(region => (
                <SelectItem key={region.id} value={region.id}>
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4" />
                    {region.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchMarinha(true)}
            disabled={marinhaLoading}
            className="border-white/20 text-white"
          >
            {marinhaLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          {marinhaData && (
            <Badge 
              variant="outline" 
              className={marinhaData.success ? "text-green-400 border-green-400/50" : "text-yellow-400 border-yellow-400/50"}
            >
              {marinhaData.success ? "Online" : "Cache"}
            </Badge>
          )}
        </div>

        {marinhaData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Condições Marítimas */}
            <Card className="bg-slate-800/70 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-base">
                  <Waves className="h-5 w-5 text-cyan-400" />
                  Condições Marítimas
                </CardTitle>
                <CardDescription className="text-white/50">
                  {marinhaData.regionName} • CHM
                </CardDescription>
              </CardHeader>
              <CardContent>
                {marinhaData.ondas ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-xs text-white/50">Ondas Significativas</p>
                      <p className="text-xl font-bold text-cyan-400">{marinhaData.ondas.significativa}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-xs text-white/50">Ondas Máximas</p>
                      <p className="text-xl font-bold text-blue-400">{marinhaData.ondas.maxima}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-xs text-white/50">Período</p>
                      <p className="text-xl font-bold text-white">{marinhaData.ondas.periodo}s</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-xs text-white/50">Direção</p>
                      <p className="text-xl font-bold text-white">{marinhaData.ondas.direcao}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 col-span-2">
                      <p className="text-xs text-white/50">Temperatura da Água</p>
                      <p className="text-xl font-bold text-green-400">{marinhaData.ondas.temperatura}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-white/50 text-center py-4">Dados indisponíveis</p>
                )}
              </CardContent>
            </Card>

            {/* Avisos de Navegação */}
            <Card className="bg-slate-800/70 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-base">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  Avisos de Navegação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {marinhaData.avisos && marinhaData.avisos.length > 0 ? (
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {marinhaData.avisos.map((aviso, i) => (
                        <div 
                          key={`aviso-${i}-${aviso.tipo}`}
                          className={cn(
                            "p-3 rounded-lg border",
                            getSeverityColor(aviso.severidade)
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {aviso.tipo}
                            </Badge>
                            <span className="text-xs opacity-70">{aviso.area}</span>
                          </div>
                          <p className="text-sm">{aviso.descricao}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Info className="h-8 w-8 text-white/20 mb-2" />
                    <p className="text-white/50">Nenhum aviso ativo</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Previsão Marítima */}
            {marinhaData.previsao && marinhaData.previsao.length > 0 && (
              <Card className="bg-slate-800/70 border-white/10 md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white text-base">
                    <Wind className="h-5 w-5 text-blue-400" />
                    Previsão Marítima
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="w-full">
                    <div className="flex gap-3">
                      {marinhaData.previsao.map((prev) => (
                        <Card key={prev.periodo} className="bg-slate-900/50 border-white/10 p-3 min-w-[180px]">
                          <p className="text-xs text-white/50 mb-2">{prev.periodo}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Wind className="h-4 w-4 text-blue-400" />
                              <span className="text-sm text-white">
                                {prev.vento.direcao} {prev.vento.velocidadeMin}-{prev.vento.velocidadeMax} kt
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Waves className="h-4 w-4 text-cyan-400" />
                              <span className="text-sm text-white">
                                {prev.ondas.alturaMin}-{prev.ondas.alturaMax}m
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-white/50" />
                              <span className="text-sm text-white/70">{prev.visibilidade}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </TabsContent>

      {/* CPTEC/INPE Tab */}
      <TabsContent value="cptec" className="mt-4 space-y-4">
        <div className="flex items-center gap-4">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-48 bg-slate-800 border-white/20 text-white">
              <SelectValue placeholder="Cidade" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map(city => (
                <SelectItem key={city.id} value={city.name}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {city.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCPTEC(true)}
            disabled={cptecLoading}
            className="border-white/20 text-white"
          >
            {cptecLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          {cptecData && (
            <Badge 
              variant="outline" 
              className={cptecData.success ? "text-green-400 border-green-400/50" : "text-yellow-400 border-yellow-400/50"}
            >
              {cptecData.success ? "Online" : "Cache"}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Previsão 7 dias */}
          <Card className="bg-slate-800/70 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <ThermometerSun className="h-5 w-5 text-yellow-400" />
                Previsão 7 Dias
              </CardTitle>
              <CardDescription className="text-white/50">
                {cptecData?.cidade || selectedCity} • CPTEC/INPE
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cptecData?.previsoes && cptecData.previsoes.length > 0 ? (
                <div className="space-y-2">
                  {cptecData.previsoes.map((prev, prevIdx) => (
                    <div 
                      key={prev.dia}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg",
                        prevIdx === 0 && "bg-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {getWeatherIcon(prev.tempo)}
                        <div>
                          <p className="text-white font-medium">
                            {new Date(prev.dia).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-white/50">{prev.tempo_descricao || prev.tempo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{prev.maxima}°</p>
                        <p className="text-white/50 text-sm">{prev.minima}°</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/50 text-center py-4">Dados indisponíveis</p>
              )}
            </CardContent>
          </Card>

          {/* Previsão de Ondas */}
          <Card className="bg-slate-800/70 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Waves className="h-5 w-5 text-cyan-400" />
                Previsão de Ondas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wavesData?.ondas && wavesData.ondas.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {wavesData.ondas.map((dia) => (
                      <div key={dia.dia} className="bg-slate-900/50 rounded-lg p-3">
                        <p className="text-white font-medium mb-2">
                          {new Date(dia.dia).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' })}
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {dia.periodos.map((periodo, j) => (
                            <div key={j} className="text-center">
                              <p className="text-xs text-white/50 capitalize">{periodo.periodo}</p>
                              <p className="text-lg font-bold text-cyan-400">
                                {periodo.altura ? `${periodo.altura}m` : '-'}
                              </p>
                              <p className="text-xs text-white/50">{periodo.agitacao}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <Waves className="h-8 w-8 text-white/20 mb-2" />
                  <p className="text-white/50">Dados de ondas indisponíveis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Link externo */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-white/50 hover:text-white"
          >
            <a href="https://www.cptec.inpe.br/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Acessar CPTEC/INPE
            </a>
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default BrazilianSourcesPanel;
