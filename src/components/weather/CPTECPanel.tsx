/**
 * CPTEC/INPE Weather Panel
 * Displays official Brazilian weather data from INPE
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  Snowflake,
  CloudSun,
  Waves,
  Wind,
  Thermometer,
  RefreshCw,
  Calendar,
  MapPin,
  Umbrella
} from "lucide-react";
import { logger } from '@/lib/logger';
import {
  fetchCPTECData,
  type CPTECData,
  type PrevisaoCPTEC,
  type PrevisaoOndas,
  getUVDescription,
  getAgitacaoColor
} from "@/services/weather/cptec-inpe.service";

interface CPTECPanelProps {
  lat?: number;
  lon?: number;
  cidade?: string;
  compact?: boolean;
}

const CIDADES_OPTIONS = [
  { value: "santos", label: "Santos, SP" },
  { value: "rio_de_janeiro", label: "Rio de Janeiro, RJ" },
  { value: "macae", label: "Macaé, RJ" },
  { value: "vitoria", label: "Vitória, ES" },
  { value: "salvador", label: "Salvador, BA" },
  { value: "recife", label: "Recife, PE" },
  { value: "fortaleza", label: "Fortaleza, CE" },
  { value: "natal", label: "Natal, RN" },
  { value: "florianopolis", label: "Florianópolis, SC" },
  { value: "porto_alegre", label: "Porto Alegre, RS" },
  { value: "belem", label: "Belém, PA" }
];

export function CPTECPanel({ lat, lon, cidade, compact = false }: CPTECPanelProps) {
  const { toast } = useToast();
  const [previsaoData, setPrevisaoData] = useState<CPTECData | null>(null);
  const [ondasData, setOndasData] = useState<CPTECData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCidade, setSelectedCidade] = useState(cidade || "santos");
  const [activeTab, setActiveTab] = useState("previsao");

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const [previsao, ondas] = await Promise.all([
        fetchCPTECData({ 
          type: "previsao", 
          cidade: selectedCidade,
          lat, 
          lon,
          forceRefresh 
        }),
        fetchCPTECData({ 
          type: "ondas", 
          cidade: selectedCidade,
          forceRefresh 
        })
      ]);
      
      setPrevisaoData(previsao);
      setOndasData(ondas);
      
      if (forceRefresh) {
        toast({
          title: "Dados atualizados",
          description: `Previsão CPTEC/INPE carregada para ${previsao.cidade || selectedCidade}`,
        });
      }
    } catch (error) {
      logger.error("Error fetching CPTEC data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível obter os dados do CPTEC/INPE",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCidade, lat, lon]);

  const getWeatherIcon = (tempo: string) => {
    const code = tempo?.toLowerCase() || "";
    if (code.includes("cl") || code === "ps") return <Sun className="h-6 w-6 text-yellow-500" />;
    if (code.includes("pn")) return <CloudSun className="h-6 w-6 text-gray-500" />;
    if (code.includes("n") || code === "e") return <Cloud className="h-6 w-6 text-gray-500" />;
    if (code.includes("c") && !code.includes("cl")) return <CloudRain className="h-6 w-6 text-blue-500" />;
    if (code.includes("cv") || code.includes("ci")) return <CloudDrizzle className="h-6 w-6 text-blue-400" />;
    if (code.includes("t")) return <CloudLightning className="h-6 w-6 text-yellow-600" />;
    if (code.includes("nv")) return <CloudFog className="h-6 w-6 text-gray-400" />;
    if (code.includes("g") || code.includes("ne")) return <Snowflake className="h-6 w-6 text-cyan-400" />;
    return <Cloud className="h-6 w-6 text-gray-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              CPTEC/INPE
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {previsaoData?.cidade || selectedCidade}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {previsaoData?.previsoes && previsaoData.previsoes.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {previsaoData.previsoes.slice(0, 3).map((prev) => (
                <div key={prev.dia} className="text-center p-2 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium">
                    {new Date(prev.dia).toLocaleDateString("pt-BR", { weekday: "short" })}
                  </p>
                  <div className="my-1 flex justify-center">
                    {getWeatherIcon(prev.tempo)}
                  </div>
                  <p className="text-sm font-bold">{prev.maxima}°</p>
                  <p className="text-xs text-muted-foreground">{prev.minima}°</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">Dados indisponíveis</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 dark:border-green-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-yellow-500" />
              CPTEC/INPE - Previsão Oficial
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPin className="h-3 w-3" />
              Centro de Previsão de Tempo e Estudos Climáticos
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedCidade} onValueChange={setSelectedCidade}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CIDADES_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => fetchData(true)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {previsaoData?.atualizacao && (
          <p className="text-xs text-muted-foreground mt-2">
            Atualizado em: {new Date(previsaoData.atualizacao).toLocaleString("pt-BR")}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="previsao">
              <Calendar className="h-4 w-4 mr-2" />
              Previsão 7 Dias
            </TabsTrigger>
            <TabsTrigger value="ondas">
              <Waves className="h-4 w-4 mr-2" />
              Ondas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="previsao" className="mt-4">
            {previsaoData?.previsoes && previsaoData.previsoes.length > 0 ? (
              <div className="grid grid-cols-7 gap-2">
                {previsaoData.previsoes.map((prev, i) => {
                  const uvInfo = getUVDescription(prev.iuv);
                  return (
                    <Card key={prev.dia} className="text-center hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <p className="text-xs font-medium mb-1">
                          {new Date(prev.dia).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" })}
                        </p>
                        <div className="flex justify-center my-2">
                          {getWeatherIcon(prev.tempo)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 h-8">
                          {prev.tempo_descricao}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <Thermometer className="h-3 w-3 text-red-500" />
                            <span className="text-sm font-bold text-red-500">{prev.maxima}°</span>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Thermometer className="h-3 w-3 text-blue-500" />
                            <span className="text-sm text-blue-500">{prev.minima}°</span>
                          </div>
                        </div>
                        {prev.iuv !== null && (
                          <div className="mt-2">
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ borderColor: uvInfo.color }}
                            >
                              UV: {prev.iuv}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Cloud className="h-8 w-8 mx-auto mb-2" />
                <p>Previsão não disponível</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ondas" className="mt-4">
            <ScrollArea className="h-[300px]">
              {ondasData?.ondas && ondasData.ondas.length > 0 ? (
                <div className="space-y-4">
                  {ondasData.ondas.map((onda) => (
                    <Card key={onda.dia} className="bg-muted/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(onda.dia).toLocaleDateString("pt-BR", { 
                            weekday: "long", 
                            day: "numeric",
                            month: "short"
                          })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                          {onda.periodos.map((periodo, j) => (
                            <div 
                              key={j} 
                              className="p-3 bg-background rounded-lg text-center"
                            >
                              <p className="text-xs font-medium capitalize mb-2">
                                {periodo.periodo}
                              </p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-center gap-1">
                                  <Waves className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm font-bold">
                                    {periodo.altura?.toFixed(1) || "-"}m
                                  </span>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ 
                                    borderColor: getAgitacaoColor(periodo.agitacao),
                                    color: getAgitacaoColor(periodo.agitacao)
                                  }}
                                >
                                  {periodo.agitacao}
                                </Badge>
                                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                  <Wind className="h-3 w-3" />
                                  {periodo.vento || "-"} km/h {periodo.vento_dir}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Dir: {periodo.direcao}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Waves className="h-8 w-8 mx-auto mb-2" />
                  <p>Previsão de ondas não disponível</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default CPTECPanel;
