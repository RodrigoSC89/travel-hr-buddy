/**
 * ESG Dashboard
 * Compliance Ambiental e Emissões
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Leaf, Droplets, Wind, Zap, TrendingDown,
  TrendingUp, AlertTriangle, Download, BarChart3,
  Globe, ThermometerSun, Waves, Factory
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EmissionData {
  vessel: string;
  co2: number;
  sox: number;
  nox: number;
  trend: 'up' | 'down' | 'stable';
  efficiency: number;
}

export function ESGDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const emissionData: EmissionData[] = [
    { vessel: 'Navio Sirius', co2: 245, sox: 0.8, nox: 1.2, trend: 'down', efficiency: 92 },
    { vessel: 'Navio Vega', co2: 312, sox: 1.1, nox: 1.8, trend: 'up', efficiency: 78 },
    { vessel: 'Navio Polaris', co2: 189, sox: 0.5, nox: 0.9, trend: 'down', efficiency: 95 },
    { vessel: 'Navio Orion', co2: 278, sox: 0.9, nox: 1.5, trend: 'stable', efficiency: 85 }
  ];

  const totalCO2 = emissionData.reduce((acc, curr) => acc + curr.co2, 0);
  const avgEfficiency = emissionData.reduce((acc, curr) => acc + curr.efficiency, 0) / emissionData.length;

  const esgMetrics = {
    environmental: {
      score: 78,
      items: [
        { label: 'Emissões CO2', value: '1,024 ton', status: 'good' },
        { label: 'Consumo Combustível', value: '42,500 L', status: 'warning' },
        { label: 'Descarte Resíduos', value: '98% conforme', status: 'good' },
        { label: 'Água Tratada', value: '100%', status: 'good' }
      ]
    },
    social: {
      score: 85,
      items: [
        { label: 'Segurança Tripulação', value: '0 acidentes', status: 'good' },
        { label: 'Treinamentos', value: '95% completos', status: 'good' },
        { label: 'Satisfação Equipe', value: '4.2/5', status: 'warning' },
        { label: 'Horas Extras', value: 'Dentro do limite', status: 'good' }
      ]
    },
    governance: {
      score: 92,
      items: [
        { label: 'Certificações', value: '100% válidas', status: 'good' },
        { label: 'Auditorias', value: '2 pendentes', status: 'warning' },
        { label: 'Compliance ANTAQ', value: '100%', status: 'good' },
        { label: 'Documentação', value: 'Atualizada', status: 'good' }
      ]
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-500';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <div className="h-4 w-4 bg-muted rounded" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-500" />
            Dashboard ESG
          </h2>
          <p className="text-muted-foreground">Monitoramento ambiental, social e governança</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === 'week' && 'Semana'}
              {period === 'month' && 'Mês'}
              {period === 'quarter' && 'Trimestre'}
              {period === 'year' && 'Ano'}
            </Button>
          ))}
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20">
                  <Factory className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total CO2</p>
                  <p className="text-2xl font-bold">{totalCO2} ton</p>
                  <p className="text-xs text-green-500 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> -12% vs mês anterior
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Eficiência Média</p>
                  <p className="text-2xl font-bold">{avgEfficiency.toFixed(0)}%</p>
                  <p className="text-xs text-blue-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +5% vs meta
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-cyan-500/30 bg-cyan-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-cyan-500/20">
                  <Droplets className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Água Tratada</p>
                  <p className="text-2xl font-bold">100%</p>
                  <p className="text-xs text-cyan-500">IMO compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-purple-500/20">
                  <Globe className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score ESG</p>
                  <p className="text-2xl font-bold">85/100</p>
                  <Badge className="bg-purple-500/20 text-purple-500">Nível A</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ESG Tabs */}
      <Tabs defaultValue="environmental" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="environmental" className="gap-2">
            <Leaf className="h-4 w-4" />
            Ambiental ({esgMetrics.environmental.score}%)
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Wind className="h-4 w-4" />
            Social ({esgMetrics.social.score}%)
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Governança ({esgMetrics.governance.score}%)
          </TabsTrigger>
        </TabsList>

        {Object.entries(esgMetrics).map(([key, data]) => (
          <TabsContent key={key} value={key}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Score Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary">{data.score}%</div>
                      <Progress value={data.score} className="mt-4 h-3" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {data.items.map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 rounded-lg bg-muted/50"
                        >
                          <p className="text-sm text-muted-foreground">{item.label}</p>
                          <p className={`font-medium ${getStatusColor(item.status)}`}>
                            {item.value}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Alertas e Recomendações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.items.filter(i => i.status !== 'good').length > 0 ? (
                      data.items.filter(i => i.status !== 'good').map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5"
                        >
                          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-muted-foreground">
                              Recomendação: Revisar e tomar ações corretivas
                            </p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Leaf className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <p>Todos os indicadores dentro da meta!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Emissions by Vessel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ThermometerSun className="h-5 w-5" />
            Emissões por Embarcação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emissionData.map((vessel, index) => (
              <motion.div
                key={vessel.vessel}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Waves className="h-5 w-5 text-primary" />
                    <span className="font-medium">{vessel.vessel}</span>
                    {getTrendIcon(vessel.trend)}
                  </div>
                  <Badge variant={vessel.efficiency >= 90 ? 'default' : 'secondary'}>
                    Eficiência: {vessel.efficiency}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">CO2 (ton)</p>
                    <p className="font-medium">{vessel.co2}</p>
                    <Progress value={(vessel.co2 / 400) * 100} className="h-1 mt-1" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SOx (ton)</p>
                    <p className="font-medium">{vessel.sox}</p>
                    <Progress value={(vessel.sox / 2) * 100} className="h-1 mt-1" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">NOx (ton)</p>
                    <p className="font-medium">{vessel.nox}</p>
                    <Progress value={(vessel.nox / 2) * 100} className="h-1 mt-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
