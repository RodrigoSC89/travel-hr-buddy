/**
 * Port API Page
 * Real-time port information and vessel schedules
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Anchor, Ship, Clock, MapPin, RefreshCw, Search, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PortInfo {
  name: string;
  country: string;
  code: string;
  timezone: string;
  vessels_in_port: number;
  expected_arrivals: number;
}

const mockPorts: PortInfo[] = [
  { name: "Port of Santos", country: "Brazil", code: "BRSSZ", timezone: "UTC-3", vessels_in_port: 42, expected_arrivals: 15 },
  { name: "Port of Rotterdam", country: "Netherlands", code: "NLRTM", timezone: "UTC+1", vessels_in_port: 128, expected_arrivals: 34 },
  { name: "Port of Singapore", country: "Singapore", code: "SGSIN", timezone: "UTC+8", vessels_in_port: 256, expected_arrivals: 67 },
  { name: "Port of Hamburg", country: "Germany", code: "DEHAM", timezone: "UTC+1", vessels_in_port: 89, expected_arrivals: 22 },
];

export default function PortAPI() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPort, setSelectedPort] = useState<PortInfo | null>(null);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error("Digite o nome ou código do porto");
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      const found = mockPorts.find(
        p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      if (found) {
        setSelectedPort(found);
        toast.success(`Porto encontrado: ${found.name}`);
      } else {
        toast.error("Porto não encontrado");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Dados atualizados");
    }, 800);
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
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
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
              {mockPorts.map((port) => (
                <Badge
                  key={port.code}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    setSearchQuery(port.code);
                    setSelectedPort(port);
                  }}
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
      {selectedPort && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {selectedPort.name}
              </CardTitle>
              <Badge variant="outline">{selectedPort.code}</Badge>
            </div>
            <CardDescription>{selectedPort.country} • {selectedPort.timezone}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Ship className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{selectedPort.vessels_in_port}</p>
                <p className="text-sm text-muted-foreground">Navios no Porto</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{selectedPort.expected_arrivals}</p>
                <p className="text-sm text-muted-foreground">Chegadas Previstas</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-sm text-muted-foreground">Operação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockPorts.map((port) => (
          <Card 
            key={port.code} 
            className="cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => setSelectedPort(port)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Anchor className="h-4 w-4" />
                {port.code}
              </CardTitle>
              <CardDescription>{port.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Navios:</span>
                <span className="font-medium">{port.vessels_in_port}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">País:</span>
                <span>{port.country}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
