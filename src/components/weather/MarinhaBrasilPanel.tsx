/**
 * Marinha do Brasil Panel
 * Displays official maritime weather bulletins from Brazilian Navy
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Anchor,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Info,
  Waves,
  Wind,
  Eye,
  FileText,
  RefreshCw,
  MapPin,
  Calendar,
  Clock
} from "lucide-react";
import { logger } from '@/lib/logger';
import {
  fetchMarinhaBrasilData,
  type MarinhaBrasilData,
  type AvisoNavegacao,
  type PrevisaoMaritima,
  getSeverityColor
} from "@/services/weather/marinha-brasil.service";

interface MarinhaBrasilPanelProps {
  lat?: number;
  lon?: number;
  region?: string;
  compact?: boolean;
}

export function MarinhaBrasilPanel({ lat, lon, region, compact = false }: MarinhaBrasilPanelProps) {
  const { toast } = useToast();
  const [data, setData] = useState<MarinhaBrasilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("avisos");

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const result = await fetchMarinhaBrasilData({ 
        type: "all", 
        lat, 
        lon, 
        region,
        forceRefresh 
      });
      setData(result);
      
      if (forceRefresh) {
        toast({
          title: "Dados atualizados",
          description: `Boletins da Marinha do Brasil carregados (${result.regionName})`,
        });
      }
    } catch (error) {
      logger.error("Error fetching Marinha Brasil data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível obter os boletins da Marinha",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lat, lon, region]);

  const getSeverityIcon = (severidade: AvisoNavegacao["severidade"]) => {
    switch (severidade) {
      case "perigo":
        return <AlertOctagon className="h-4 w-4 text-red-500" />;
      case "alerta":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "atencao":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadgeVariant = (severidade: AvisoNavegacao["severidade"]) => {
    switch (severidade) {
      case "perigo":
        return "destructive";
      case "alerta":
        return "warning" as "default";
      case "atencao":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Dados indisponíveis</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => fetchData(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Anchor className="h-4 w-4 text-blue-600" />
              Marinha do Brasil
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {data.regionName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.avisos && data.avisos.length > 0 ? (
            data.avisos.slice(0, 2).map((aviso) => (
              <div key={aviso.id} className="flex items-start gap-2 p-2 bg-muted/50 rounded-lg">
                {getSeverityIcon(aviso.severidade)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{aviso.tipo}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{aviso.descricao}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Nenhum aviso ativo
            </p>
          )}
          
          {data.ondas && (
            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-blue-500" />
                <span className="text-xs">Ondas</span>
              </div>
              <span className="text-sm font-bold">{data.ondas.significativa}m</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Anchor className="h-5 w-5 text-blue-600" />
              Marinha do Brasil
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <MapPin className="h-3 w-3" />
              {data.regionName} • CHM / CPTEC
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={data.success ? "default" : "secondary"}>
              {data.success ? "Online" : "Cache"}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => fetchData(true)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="avisos" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Avisos
            </TabsTrigger>
            <TabsTrigger value="previsao" className="text-xs">
              <Wind className="h-3 w-3 mr-1" />
              Previsão
            </TabsTrigger>
            <TabsTrigger value="ondas" className="text-xs">
              <Waves className="h-3 w-3 mr-1" />
              Ondas
            </TabsTrigger>
            <TabsTrigger value="boletim" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Boletim
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avisos" className="mt-4">
            <ScrollArea className="h-[300px]">
              {data.avisos && data.avisos.length > 0 ? (
                <div className="space-y-3">
                  {data.avisos.map((aviso) => (
                    <Card key={aviso.id} className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getSeverityIcon(aviso.severidade)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{aviso.tipo}</span>
                              <Badge variant={getSeverityBadgeVariant(aviso.severidade)} className="text-xs">
                                {aviso.severidade.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{aviso.descricao}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(aviso.dataEmissao).toLocaleDateString("pt-BR")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Válido até {new Date(aviso.dataValidade).toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{aviso.id}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2" />
                  <p>Nenhum aviso de navegação ativo</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="previsao" className="mt-4">
            <ScrollArea className="h-[300px]">
              {data.previsao && data.previsao.length > 0 ? (
                <div className="space-y-2">
                  {data.previsao.slice(0, 8).map((prev) => (
                    <div key={prev.periodo} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{prev.periodo}</span>
                        <Badge variant="outline">{prev.mar}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Wind className="h-3 w-3 text-blue-500" />
                          <span>{prev.vento.direcao} {prev.vento.velocidadeMin}-{prev.vento.velocidadeMax} nós</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Waves className="h-3 w-3 text-cyan-500" />
                          <span>{prev.ondas.alturaMin}-{prev.ondas.alturaMax}m</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-gray-500" />
                          <span className="truncate">{prev.visibilidade}</span>
                        </div>
                      </div>
                      {prev.fenomenos && prev.fenomenos.length > 0 && (
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {prev.fenomenos.map((f, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">{f}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Previsão não disponível</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ondas" className="mt-4">
            {data.ondas ? (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-primary/10 to-info/10">
                  <CardContent className="pt-4 text-center">
                    <Waves className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{data.ondas.significativa}m</p>
                    <p className="text-xs text-muted-foreground">Altura Significativa</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-info/10 to-success/10">
                  <CardContent className="pt-4 text-center">
                    <Waves className="h-8 w-8 mx-auto mb-2 text-info" />
                    <p className="text-2xl font-bold">{data.ondas.maxima}m</p>
                    <p className="text-xs text-muted-foreground">Altura Máxima</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
                  <CardContent className="pt-4 text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{data.ondas.periodo}s</p>
                    <p className="text-xs text-muted-foreground">Período</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-info/10 to-success/10">
                  <CardContent className="pt-4 text-center">
                    <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center text-info font-bold">
                      {data.ondas.direcao}
                    </div>
                    <p className="text-2xl font-bold">{data.ondas.temperatura}°C</p>
                    <p className="text-xs text-muted-foreground">Temp. do Mar</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Dados de ondas não disponíveis</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="boletim" className="mt-4">
            {data.boletim ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{data.boletim.tipo}</h4>
                    <p className="text-xs text-muted-foreground">{data.boletim.numero}</p>
                  </div>
                  <Badge variant="outline">
                    Válido até {new Date(data.boletim.validade).toLocaleDateString("pt-BR")}
                  </Badge>
                </div>
                <ScrollArea className="h-[250px]">
                  <pre className="text-xs whitespace-pre-wrap font-mono bg-muted/50 p-4 rounded-lg">
                    {data.boletim.texto}
                  </pre>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p>Boletim não disponível</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default MarinhaBrasilPanel;
