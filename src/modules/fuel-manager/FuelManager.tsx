/**
 * Fuel Manager Module - Refatorado para dados reais
 * Módulo de gestão de combustível com IA e previsão de preços
 */

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Fuel, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Ship, 
  Calendar,
  AlertTriangle,
  Zap,
  Brain,
  Plus,
  RefreshCw,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import BunkerPriceChart from "@/components/bunker/BunkerPriceChart";
import BunkerForecastPanel from "@/components/bunker/BunkerForecastPanel";

// Types
interface FuelConsumption {
  id: string;
  vessel_id: string | null;
  vessel_name?: string;
  voyage_id?: string;
  consumption_date: string;
  fuel_type: string;
  quantity_liters: number;
  cost_usd: number;
  distance_nm: number;
  avg_speed_knots: number;
  weather_conditions?: string | null;
  notes?: string | null;
  created_at: string | null;
}

// Hook para dados de consumo de combustível
function useFuelConsumptionData() {
  return useQuery({
    queryKey: ["fuel-consumption-data"],
    queryFn: async (): Promise<FuelConsumption[]> => {
      const { data, error } = await supabase
        .from("fuel_consumption")
        .select(`
          id,
          vessel_id,
          consumption_date,
          fuel_type,
          quantity_liters,
          cost_usd,
          distance_nm,
          avg_speed_knots,
          weather_conditions,
          notes,
          created_at,
          vessels:vessel_id (name)
        `)
        .order("consumption_date", { ascending: false })
        .limit(50);

      if (error) throw error;
      
      return (data || []).map((item) => ({
        id: item.id,
        vessel_id: item.vessel_id,
        vessel_name: item.vessels?.name || "N/A",
        consumption_date: item.consumption_date,
        fuel_type: item.fuel_type,
        quantity_liters: item.quantity_liters || 0,
        cost_usd: item.cost_usd || 0,
        distance_nm: item.distance_nm || 0,
        avg_speed_knots: item.avg_speed_knots || 0,
        weather_conditions: item.weather_conditions,
        notes: item.notes,
        created_at: item.created_at
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

// Hook para embarcações
function useVesselsData() {
  return useQuery({
    queryKey: ["vessels-for-fuel"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

// Components
const FuelDashboard = ({ consumptions }: { consumptions: FuelConsumption[] }) => {
  const totalConsumption = consumptions.reduce((acc, c) => acc + (c.quantity_liters || 0), 0);
  const totalCost = consumptions.reduce((acc, c) => acc + (c.cost_usd || 0), 0);
  const avgEfficiency = consumptions.length > 0 
    ? consumptions.reduce((acc, c) => {
        const efficiency = c.quantity_liters > 0 ? (c.distance_nm / c.quantity_liters * 1000) : 0;
        return acc + efficiency;
      }, 0) / consumptions.length 
    : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consumo Total (Mês)</CardTitle>
          <Fuel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalConsumption > 0 ? `${(totalConsumption / 1000).toFixed(1)}k L` : "—"}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {totalConsumption > 0 ? (
              <>
                <TrendingDown className="h-3 w-3 text-success" />
                Dados do período
              </>
            ) : "Sem dados"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custo Total (USD)</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalCost > 0 ? `$${(totalCost / 1000).toFixed(1)}k` : "—"}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {totalCost > 0 ? "Custo acumulado" : "Sem dados"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {avgEfficiency > 0 ? `${avgEfficiency.toFixed(2)} NM/L` : "—"}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {avgEfficiency > 0 ? (
              <>
                <TrendingUp className="h-3 w-3 text-success" />
                Eficiência calculada
              </>
            ) : "Sem dados suficientes"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Economia IA</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">—</div>
          <p className="text-xs text-muted-foreground">
            Configure IA para otimizações
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const ConsumptionTable = ({ consumptions, isLoading }: { consumptions: FuelConsumption[]; isLoading: boolean }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Consumo</CardTitle>
        <CardDescription>Registros de consumo por viagem</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={`fuel-skeleton-${i}`} className="h-12 w-full" />
            ))}
          </div>
        ) : consumptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Fuel className="h-12 w-12 mb-2 opacity-30" />
            <p>Nenhum registro de consumo</p>
            <p className="text-xs">Adicione registros usando o botão acima</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Embarcação</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Litros</TableHead>
                <TableHead className="text-right">Custo (USD)</TableHead>
                <TableHead className="text-right">Distância (NM)</TableHead>
                <TableHead className="text-right">Eficiência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumptions.map((consumption) => (
                <TableRow key={consumption.id}>
                  <TableCell>
                    {format(new Date(consumption.consumption_date), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-medium">{consumption.vessel_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{consumption.fuel_type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {consumption.quantity_liters.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${consumption.cost_usd.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{consumption.distance_nm}</TableCell>
                  <TableCell className="text-right">
                    {consumption.quantity_liters > 0 
                      ? (consumption.distance_nm / consumption.quantity_liters * 1000).toFixed(3) 
                      : "—"} NM/L
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

const ConsumptionForm = ({ onClose, vessels }: { onClose: () => void; vessels: { id: string; name: string }[] }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    vessel_id: "",
    fuel_type: "MGO",
    quantity_liters: "",
    cost_usd: "",
    distance_nm: "",
    avg_speed_knots: "",
    weather_conditions: "Calm",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("fuel_consumption").insert({
      vessel_id: formData.vessel_id,
      fuel_type: formData.fuel_type,
      quantity_liters: parseFloat(formData.quantity_liters) || 0,
      cost_usd: parseFloat(formData.cost_usd) || 0,
      distance_nm: parseFloat(formData.distance_nm) || 0,
      avg_speed_knots: parseFloat(formData.avg_speed_knots) || 0,
      weather_conditions: formData.weather_conditions,
      notes: formData.notes || null,
      consumption_date: new Date().toISOString()
    });

    if (error) {
      toast({
        title: "Erro ao registrar",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Consumo registrado",
      description: "O registro de consumo foi salvo com sucesso.",
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vessel">Embarcação</Label>
          <Select value={formData.vessel_id} onValueChange={(v) => setFormData({...formData, vessel_id: v})}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a embarcação" />
            </SelectTrigger>
            <SelectContent>
              {vessels.map((vessel) => (
                <SelectItem key={vessel.id} value={vessel.id}>{vessel.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuel_type">Tipo de Combustível</Label>
          <Select value={formData.fuel_type} onValueChange={(v) => setFormData({...formData, fuel_type: v})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MGO">MGO (Marine Gas Oil)</SelectItem>
              <SelectItem value="HFO">HFO (Heavy Fuel Oil)</SelectItem>
              <SelectItem value="VLSFO">VLSFO (Very Low Sulphur)</SelectItem>
              <SelectItem value="LNG">LNG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade (Litros)</Label>
          <Input 
            type="number" 
            id="quantity"
            value={formData.quantity_liters}
            onChange={(e) => setFormData({...formData, quantity_liters: e.target.value})}
            placeholder="Ex: 45000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Custo (USD)</Label>
          <Input 
            type="number" 
            id="cost"
            value={formData.cost_usd}
            onChange={(e) => setFormData({...formData, cost_usd: e.target.value})}
            placeholder="Ex: 67500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="distance">Distância (NM)</Label>
          <Input 
            type="number" 
            id="distance"
            value={formData.distance_nm}
            onChange={(e) => setFormData({...formData, distance_nm: e.target.value})}
            placeholder="Ex: 850"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="speed">Velocidade Média (Nós)</Label>
          <Input 
            type="number" 
            id="speed"
            step="0.1"
            value={formData.avg_speed_knots}
            onChange={(e) => setFormData({...formData, avg_speed_knots: e.target.value})}
            placeholder="Ex: 14.5"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar Registro</Button>
      </div>
    </form>
  );
};

const AIPredictions = () => {
  const { toast } = useToast();

  const handleRefreshPredictions = () => {
    toast({
      title: "Previsões IA",
      description: "Configure a integração de IA para obter previsões de consumo.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Previsões com IA
            </CardTitle>
            <CardDescription>Análise preditiva de consumo e reabastecimento</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefreshPredictions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <Brain className="h-12 w-12 mb-2 opacity-30" />
          <p>Nenhuma previsão disponível</p>
          <p className="text-xs">Configure a integração de IA para análise preditiva</p>
        </div>

        <div className="p-4 bg-accent/20 rounded-lg mt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Dica de Otimização</p>
              <p className="text-sm text-muted-foreground">
                Reduzir a velocidade em 1 nó durante viagens longas pode economizar até 12% de combustível. 
                Configure a análise de IA para identificar rotas otimizáveis.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Component
const FuelManager = () => {
  const [showForm, setShowForm] = useState(false);
  const { data: consumptions = [], isLoading } = useFuelConsumptionData();
  const { data: vessels = [] } = useVesselsData();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Fuel className="h-8 w-8 text-primary" />
            Fuel Manager
          </h1>
          <p className="text-muted-foreground">
            Gestão inteligente de combustível com análise preditiva
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Registro
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Consumo</CardTitle>
            <CardDescription>Adicione um novo registro de consumo de combustível</CardDescription>
          </CardHeader>
          <CardContent>
            <ConsumptionForm onClose={() => setShowForm(false)} vessels={vessels} />
          </CardContent>
        </Card>
      )}

      <FuelDashboard consumptions={consumptions} />

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="predictions">Previsões IA</TabsTrigger>
          <TabsTrigger value="bunker-prices" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Preços Bunker
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <ConsumptionTable consumptions={consumptions} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="predictions">
          <AIPredictions />
        </TabsContent>

        <TabsContent value="bunker-prices" className="space-y-6">
          <BunkerForecastPanel />
          <BunkerPriceChart showPortSelector={true} height={350} />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Consumo</CardTitle>
              <CardDescription>Análise detalhada de padrões de consumo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>Gráficos de análise serão exibidos aqui</p>
                  <p className="text-xs">Adicione mais dados para análise</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FuelManager;
