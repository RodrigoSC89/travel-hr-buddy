/**
 * Port API Page
 * Real-time port information via Edge Function
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Anchor, Ship, Clock, MapPin, RefreshCw, Search, Calendar, Loader2, Waves, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

interface PortTerminal {
  name: string;
  type: string;
  berths: number;
}

interface PortContacts {
  [key: string]: string;
}

interface PortInfo {
  code: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  type: string;
  status?: string;
  waitTime?: string;
  currentVessels?: number;
  maxDraft?: number;
  terminals?: PortTerminal[];
  services?: string[];
  contacts?: PortContacts;
}

interface PortDetails extends PortInfo {
  averageWaitTime?: string;
  maxLOA?: number;
}

export default function PortAPI() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<PortInfo | null>(null);
  const [portDetails, setPortDetails] = useState<PortDetails | null>(null);

  const fetchPorts = async (query?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("port-api", {
        body: { 
          operation: "search",
          query: query || undefined
        }
      });

      if (error) throw error;

      if (data?.ports) {
        setPorts(data.ports);
        if (!query) {
          toast.success(`${data.ports.length} portos carregados`);
        }
      }
    } catch (err) {
      logger.error("Error fetching ports:", err);
      toast.error("Erro ao carregar portos");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPortDetails = async (portCode: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("port-api", {
        body: { 
          operation: "details",
          portCode
        }
      });

      if (error) throw error;

      if (data?.port) {
        setPortDetails(data.port);
      }
    } catch (err) {
      logger.error("Error fetching port details:", err);
    }
  };

  useEffect(() => {
    fetchPorts();
  }, []);

  const handleSearch = () => {
    fetchPorts(searchQuery);
  };

  const handleSelectPort = (port: PortInfo) => {
    setSelectedPort(port);
    fetchPortDetails(port.code);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Operational": return "bg-success";
      case "Congested": return "bg-warning";
      case "Weather Alert": return "bg-warning";
      default: return "bg-muted";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Anchor className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Port API</h1>
            <p className="text-muted-foreground">Informações portuárias em tempo real</p>
          </div>
        </div>
        <Button onClick={() => fetchPorts()} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Porto
          </CardTitle>
          <CardDescription>Digite o nome ou código UN/LOCODE do porto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Ex: Santos, BRSSZ, Rotterdam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              <span className="ml-2">Buscar</span>
            </Button>
          </div>
          
          {/* Quick Access */}
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Portos populares:</p>
            <div className="flex flex-wrap gap-2">
              {ports.slice(0, 6).map((port) => (
                <Badge
                  key={port.code}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleSelectPort(port)}
                >
                  <Anchor className="h-3 w-3 mr-1" />
                  {port.code}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Port Details */}
      {selectedPort && portDetails && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {portDetails.name}
              </CardTitle>
              <div className="flex gap-2">
                <Badge className={getStatusColor(portDetails.status)}>
                  {portDetails.status}
                </Badge>
                <Badge variant="outline">{portDetails.code}</Badge>
              </div>
            </div>
            <CardDescription>{portDetails.type} • {portDetails.country}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Ship className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{portDetails.currentVessels || "N/A"}</p>
                <p className="text-sm text-muted-foreground">Navios no Porto</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-warning" />
                <p className="text-2xl font-bold">{portDetails.averageWaitTime || "N/A"}</p>
                <p className="text-sm text-muted-foreground">Tempo Médio Espera</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Waves className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{portDetails.maxDraft}m</p>
                <p className="text-sm text-muted-foreground">Calado Máximo</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Anchor className="h-6 w-6 mx-auto mb-2 text-accent-foreground" />
                <p className="text-2xl font-bold">{portDetails.maxLOA}m</p>
                <p className="text-sm text-muted-foreground">LOA Máximo</p>
              </div>
            </div>

            {/* Terminals */}
            {portDetails.terminals && (
              <div>
                <h4 className="font-medium mb-3">Terminais</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {portDetails.terminals.map((terminal: PortTerminal, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border bg-card">
                      <p className="font-medium">{terminal.name}</p>
                      <p className="text-sm text-muted-foreground">{terminal.type}</p>
                      <Badge variant="outline" className="mt-2">{terminal.berths} berços</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {portDetails.services && (
              <div>
                <h4 className="font-medium mb-3">Serviços Disponíveis</h4>
                <div className="flex flex-wrap gap-2">
                  {portDetails.services.map((service: string, idx: number) => (
                    <Badge key={idx} variant="secondary">{service}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts */}
            {portDetails.contacts && (
              <div>
                <h4 className="font-medium mb-3">Contatos</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(portDetails.contacts).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-3 rounded-lg border">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground capitalize">{key}</p>
                        <p className="font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ports Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span>Carregando portos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ports.map((port) => (
            <Card 
              key={port.code} 
              className={`cursor-pointer hover:border-primary/50 transition-colors ${
                selectedPort?.code === port.code ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleSelectPort(port)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Anchor className="h-4 w-4" />
                    {port.code}
                  </CardTitle>
                  <Badge className={`${getStatusColor(port.status)} text-xs`}>
                    {port.status}
                  </Badge>
                </div>
                <CardDescription>{port.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="truncate ml-2">{port.type}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">País:</span>
                  <span>{port.country}</span>
                </div>
                {port.waitTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Espera:</span>
                    <span className="font-medium text-warning">{port.waitTime}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {ports.length === 0 && !isLoading && (
        <Card className="text-center py-12">
          <Anchor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Nenhum porto encontrado</p>
          <p className="text-muted-foreground">Tente buscar por outro nome ou código</p>
        </Card>
      )}
    </div>
  );
}
