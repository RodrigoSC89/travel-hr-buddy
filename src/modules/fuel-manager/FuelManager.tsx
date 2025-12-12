/**
import { useState, useCallback } from "react";;
 * Fuel Manager Module - PATCH 838
 * Módulo de gestão de combustível com IA
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
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Types
interface FuelConsumption {
  id: string;
  vessel_id: string;
  vessel_name?: string;
  voyage_id?: string;
  consumption_date: string;
  fuel_type: string;
  quantity_liters: number;
  cost_usd: number;
  distance_nm: number;
  avg_speed_knots: number;
  weather_conditions?: string;
  notes?: string;
  created_at: string;
}

interface FuelPrediction {
  vessel_id: string;
  predicted_consumption: number;
  confidence: number;
  recommended_refuel_date: string;
  estimated_cost: number;
  savings_opportunity: number;
}

// Mock data for demo
const mockConsumptions: FuelConsumption[] = [
  {
    id: "1",
    vessel_id: "v1",
    vessel_name: "MV Atlantic Star",
    consumption_date: "2025-12-08",
    fuel_type: "MGO",
    quantity_liters: 45000,
    cost_usd: 67500,
    distance_nm: 850,
    avg_speed_knots: 14.5,
    weather_conditions: "Calm",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    vessel_id: "v2",
    vessel_name: "MV Pacific Dawn",
    consumption_date: "2025-12-07",
    fuel_type: "HFO",
    quantity_liters: 62000,
    cost_usd: 74400,
    distance_nm: 1200,
    avg_speed_knots: 12.8,
    weather_conditions: "Moderate",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    vessel_id: "v1",
    vessel_name: "MV Atlantic Star",
    consumption_date: "2025-12-06",
    fuel_type: "MGO",
    quantity_liters: 38000,
    cost_usd: 57000,
    distance_nm: 720,
    avg_speed_knots: 15.2,
    weather_conditions: "Calm",
    created_at: new Date().toISOString(),
  },
];

const mockPredictions: FuelPrediction[] = [
  {
    vessel_id: "v1",
    predicted_consumption: 42500,
    confidence: 0.89,
    recommended_refuel_date: "2025-12-15",
    estimated_cost: 63750,
    savings_opportunity: 4200,
  },
  {
    vessel_id: "v2",
    predicted_consumption: 58000,
    confidence: 0.82,
    recommended_refuel_date: "2025-12-12",
    estimated_cost: 69600,
    savings_opportunity: 2800,
  },
];

// Components
const FuelDashboard = () => {
  const totalConsumption = mockConsumptions.reduce((acc, c) => acc + c.quantity_liters, 0);
  const totalCost = mockConsumptions.reduce((acc, c) => acc + c.cost_usd, 0);
  const avgEfficiency = mockConsumptions.reduce((acc, c) => acc + (c.distance_nm / c.quantity_liters * 1000), 0) / mockConsumptions.length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Consumo Total (Mês)</CardTitle>
          <Fuel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{(totalConsumption / 1000).toFixed(1)}k L</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-green-500" />
            -8% vs mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custo Total (USD)</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(totalCost / 1000).toFixed(1)}k</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingDown className="h-3 w-3 text-green-500" />
            -5% vs mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Eficiência Média</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgEfficiency.toFixed(2)} NM/L</div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-green-500" />
            +3% vs mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Economia IA</CardTitle>
          <Brain className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">$7.0k</div>
          <p className="text-xs text-muted-foreground">
            Economia sugerida pela IA
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const ConsumptionTable = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Consumo</CardTitle>
        <CardDescription>Registros de consumo por viagem</CardDescription>
      </CardHeader>
      <CardContent>
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
            {mockConsumptions.map((consumption) => (
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
                  {(consumption.distance_nm / consumption.quantity_liters * 1000).toFixed(3)} NM/L
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const ConsumptionForm = ({ onClose }: { onClose: () => void }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Consumo registrado",
      description: "O registro de consumo foi salvo com sucesso.",
    });
    onClose();
  });

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
              <SelectItem value="v1">MV Atlantic Star</SelectItem>
              <SelectItem value="v2">MV Pacific Dawn</SelectItem>
              <SelectItem value="v3">MV Nordic Light</SelectItem>
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
            onChange={handleChange}
            placeholder="Ex: 45000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Custo (USD)</Label>
          <Input 
            type="number" 
            id="cost"
            value={formData.cost_usd}
            onChange={handleChange}
            placeholder="Ex: 67500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="distance">Distância (NM)</Label>
          <Input 
            type="number" 
            id="distance"
            value={formData.distance_nm}
            onChange={handleChange}
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
            onChange={handleChange}
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
      title: "Previsões atualizadas",
      description: "A IA recalculou as previsões de consumo.",
    });
  });

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
      <CardContent className="space-y-6">
        {mockPredictions.map((prediction, index) => (
          <div key={prediction.vessel_id} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ship className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {index === 0 ? "MV Atlantic Star" : "MV Pacific Dawn"}
                </span>
              </div>
              <Badge variant={prediction.confidence > 0.85 ? "default" : "secondary"}>
                {(prediction.confidence * 100).toFixed(0)}% confiança
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Previsto</p>
                <p className="text-xl font-bold">{(prediction.predicted_consumption / 1000).toFixed(1)}k L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custo Estimado</p>
                <p className="text-xl font-bold">${(prediction.estimated_cost / 1000).toFixed(1)}k</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Economia Potencial</p>
                <p className="text-xl font-bold text-green-600">${prediction.savings_opportunity.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <Calendar className="h-4 w-4 text-amber-600" />
              <span className="text-sm">
                <strong>Reabastecimento recomendado:</strong>{" "}
                {format(new Date(prediction.recommended_refuel_date), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Nível de Confiança</span>
                <span className="text-sm font-medium">{(prediction.confidence * 100).toFixed(0)}%</span>
              </div>
              <Progress value={prediction.confidence * 100} className="h-2" />
            </div>
          </div>
        ))}

        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Dica de Otimização</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Reduzir a velocidade em 1 nó durante viagens longas pode economizar até 12% de combustível. 
                A IA identificou 3 rotas onde esta otimização é viável.
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
        <Button onClick={handleSetShowForm}>
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
            <ConsumptionForm onClose={() => setShowForm(false} />
          </CardContent>
        </Card>
      )}

      <FuelDashboard />

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="predictions">Previsões IA</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <ConsumptionTable />
        </TabsContent>

        <TabsContent value="predictions">
          <AIPredictions />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Consumo</CardTitle>
              <CardDescription>Análise detalhada de padrões de consumo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Gráficos de análise serão exibidos aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FuelManager;
