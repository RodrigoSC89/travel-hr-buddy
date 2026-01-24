import { useState } from "react";
import { useAISFeed } from "@/hooks/useAISFeed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Ship, MapPin, Navigation, Clock, Anchor, RefreshCw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AISTrackerPage() {
  const [searchMMSI, setSearchMMSI] = useState("");
  const [activeMMSI, setActiveMMSI] = useState<string | undefined>();

  const { data, isLoading, isError, error, refetch, isFetching } = useAISFeed(activeMMSI);

  const handleSearch = () => {
    if (searchMMSI.trim()) {
      setActiveMMSI(searchMMSI.trim());
    }
  };

  // Sample vessels for demo
  const sampleVessels = [
    { mmsi: "538005989", name: "MSC OSCAR", type: "Container Ship" },
    { mmsi: "477333400", name: "EVER GIVEN", type: "Container Ship" },
    { mmsi: "563048100", name: "VALE BRASIL", type: "Bulk Carrier" },
    { mmsi: "352848000", name: "HARMONY OF THE SEAS", type: "Cruise Ship" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            📡 AIS Tracker
          </h1>
          <p className="text-muted-foreground">
            Rastreamento de embarcações em tempo real via MarineTraffic AIS
          </p>
        </div>
        {activeMMSI && (
          <Button 
            variant="outline" 
            onClick={() => refetch()} 
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
            Atualizar
          </Button>
        )}
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Embarcação
          </CardTitle>
          <CardDescription>
            Digite o MMSI da embarcação para rastrear sua posição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 flex-1 min-w-[200px]">
              <Label htmlFor="mmsi">MMSI (Maritime Mobile Service Identity)</Label>
              <Input
                id="mmsi"
                type="text"
                value={searchMMSI}
                onChange={(e) => setSearchMMSI(e.target.value)}
                placeholder="Ex: 538005989"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading || !searchMMSI.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Rastrear
            </Button>
          </div>

          {/* Sample Vessels */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Embarcações de exemplo:</p>
            <div className="flex flex-wrap gap-2">
              {sampleVessels.map((vessel) => (
                <Badge
                  key={vessel.mmsi}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => {
                    setSearchMMSI(vessel.mmsi);
                    setActiveMMSI(vessel.mmsi);
                  }}
                >
                  <Ship className="h-3 w-3 mr-1" />
                  {vessel.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Buscando dados AIS...</span>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Erro ao carregar dados: {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Verifique se o MMSI está correto e tente novamente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Vessel Data */}
      {data && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vessel Info Card */}
          <Card className="bg-gradient-to-br from-primary/10 to-info/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                Informações da Embarcação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">MMSI</p>
                  <p className="font-mono font-bold">{activeMMSI}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="default" className="bg-success">
                    Rastreando
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position Card */}
          <Card className="bg-gradient-to-br from-success/10 to-info/10 border-success/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-success" />
                Posição Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Latitude</p>
                  <p className="font-mono font-bold">
                    {data.track?.[0]?.lat?.toFixed(6) ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Longitude</p>
                  <p className="font-mono font-bold">
                    {data.track?.[0]?.lng?.toFixed(6) ?? "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Card */}
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-warning" />
                Navegação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Velocidade</p>
                  <p className="text-2xl font-bold text-warning">
                    {data.track?.[0]?.speed?.toFixed(1) ?? "—"} kts
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rumo</p>
                  <p className="text-2xl font-bold text-warning">
                    {data.track?.[0]?.course?.toFixed(0) ?? "—"}°
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamp Card */}
          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-secondary" />
                Última Atualização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-mono">
                {data.track?.[0]?.timestamp 
                  ? new Date(data.track[0].timestamp).toLocaleString("pt-BR")
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Track History */}
      {data?.track && data.track.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Anchor className="h-5 w-5" />
              Histórico de Posições
            </CardTitle>
            <CardDescription>
              Últimas {data.track.length} posições registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Timestamp</th>
                    <th className="text-left py-2 px-3">Latitude</th>
                    <th className="text-left py-2 px-3">Longitude</th>
                    <th className="text-left py-2 px-3">Velocidade</th>
                    <th className="text-left py-2 px-3">Rumo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.track.slice(0, 10).map((point, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3 font-mono text-xs">
                        {point.timestamp 
                          ? new Date(point.timestamp).toLocaleString("pt-BR")
                          : "—"}
                      </td>
                      <td className="py-2 px-3 font-mono">{point.lat?.toFixed(6)}</td>
                      <td className="py-2 px-3 font-mono">{point.lng?.toFixed(6)}</td>
                      <td className="py-2 px-3">{point.speed?.toFixed(1)} kts</td>
                      <td className="py-2 px-3">{point.course?.toFixed(0)}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!activeMMSI && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center py-12">
            <Ship className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma embarcação selecionada</h3>
            <p className="text-muted-foreground">
              Digite um MMSI ou selecione uma embarcação de exemplo para começar o rastreamento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
