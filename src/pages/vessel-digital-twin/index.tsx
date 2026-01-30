/**
 * Vessel Digital Twin Module
 * Complete digital representation of a vessel
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Ship, Box, FileText, History, Gauge, Brain, 
  ChevronRight, AlertTriangle, CheckCircle2, Wrench,
  Search, Plus
} from 'lucide-react';
import { useVesselDigitalTwin } from '@/hooks/useVesselDigitalTwin';
import { ModuleGate } from '@/components/modules/ModuleGate';
import { cn } from '@/lib/utils';

// Placeholder for vessel selection - integrate with your vessel context
const useVessel = () => {
  const [selectedVessel] = useState<{ id: string; name: string; imo_number?: string; vessel_type?: string } | null>(null);
  return { selectedVessel };
};

export default function VesselDigitalTwinPage() {
  const { selectedVessel } = useVessel();
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    parts,
    manuals,
    history,
    sensors,
    stats,
    isLoading
  } = useVesselDigitalTwin(selectedVessel?.id || null);
  
  if (!selectedVessel) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <Ship className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Selecione uma Embarcação</CardTitle>
            <CardDescription>
              Escolha uma embarcação para visualizar seu Digital Twin completo
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <ModuleGate module="vessel-digital-twin">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Ship className="h-4 w-4" />
              <span>Vessel Digital Twin</span>
              <ChevronRight className="h-4 w-4" />
              <span>{selectedVessel.name}</span>
            </div>
            <h1 className="text-3xl font-bold">{selectedVessel.name}</h1>
            <p className="text-muted-foreground">
              IMO: {selectedVessel.imo_number || 'N/A'} • 
              Tipo: {selectedVessel.vessel_type || 'N/A'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
            <Button className="gap-2">
              <Brain className="h-4 w-4" />
              Perguntar à IA
            </Button>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Peças Catalogadas"
            value={stats.totalParts}
            icon={Box}
            subtitle={`${stats.criticalParts} críticas`}
          />
          <StatsCard
            title="Manuais"
            value={stats.totalManuals}
            icon={FileText}
            subtitle={`${stats.manualsWithOCR} com OCR`}
          />
          <StatsCard
            title="Sensores"
            value={stats.totalSensors}
            icon={Gauge}
            subtitle={`${stats.sensorsOnline} online`}
            variant={stats.sensorsCritical > 0 ? 'destructive' : 'default'}
          />
          <StatsCard
            title="Status Geral"
            value={stats.partsNeedingAttention + stats.partsUnderRepair}
            icon={stats.partsNeedingAttention > 0 ? AlertTriangle : CheckCircle2}
            subtitle={stats.partsNeedingAttention > 0 ? 'Itens precisam de atenção' : 'Tudo operacional'}
            variant={stats.partsNeedingAttention > 0 ? 'warning' : 'success'}
          />
        </div>
        
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="gap-2">
              <Ship className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="parts" className="gap-2">
              <Box className="h-4 w-4" />
              <span className="hidden sm:inline">Peças</span>
            </TabsTrigger>
            <TabsTrigger value="manuals" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Manuais</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
            <TabsTrigger value="sensors" className="gap-2">
              <Gauge className="h-4 w-4" />
              <span className="hidden sm:inline">Sensores</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Peça
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Upload de Manual
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <History className="h-4 w-4" />
                    Registrar Evento
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Wrench className="h-4 w-4" />
                    Agendar Manutenção
                  </Button>
                </CardContent>
              </Card>
              
              {/* Recent History */}
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Últimos Eventos</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('history')}>
                    Ver todos
                  </Button>
                </CardHeader>
                <CardContent>
                  {history.slice(0, 5).map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-start gap-3 py-2 border-b last:border-0"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        event.event_type === 'maintenance' && "bg-primary",
                        event.event_type === 'incident' && "bg-destructive",
                        event.event_type === 'inspection' && "bg-accent",
                        !['maintenance', 'incident', 'inspection'].includes(event.event_type) && "bg-muted-foreground"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.event_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Badge variant="outline">{event.event_type}</Badge>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum evento registrado
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="parts">
            <Card>
              <CardHeader>
                <CardTitle>Catálogo de Peças</CardTitle>
                <CardDescription>
                  {parts.length} peças catalogadas nesta embarcação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma peça cadastrada ainda
                  </p>
                ) : (
                  <div className="space-y-2">
                    {parts.slice(0, 10).map(part => (
                      <div key={part.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-sm text-muted-foreground">{part.part_number || 'Sem número'}</p>
                        </div>
                        <Badge variant={part.status === 'operational' ? 'default' : 'destructive'}>
                          {part.status || 'N/A'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="manuals">
            <Card>
              <CardHeader>
                <CardTitle>Biblioteca de Manuais</CardTitle>
                <CardDescription>
                  {manuals.length} manuais disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {manuals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum manual cadastrado ainda
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {manuals.map(manual => (
                      <div key={manual.id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{manual.title}</p>
                          <p className="text-sm text-muted-foreground">{manual.manual_type}</p>
                        </div>
                        {manual.ocr_processed && (
                          <Badge variant="secondary">OCR</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Histórico Completo</CardTitle>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum evento no histórico
                  </p>
                ) : (
                  <div className="space-y-4">
                    {history.map(event => (
                      <div key={event.id} className="flex gap-4 p-4 border rounded-lg">
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {new Date(event.event_date).getDate()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.event_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <Badge className="mt-2" variant="outline">{event.event_type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sensors">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard de Sensores</CardTitle>
                <CardDescription>
                  {sensors.length} sensores ativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sensors.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum sensor configurado
                  </p>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {sensors.map(sensor => (
                      <Card key={sensor.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{sensor.name}</p>
                            <Badge variant={sensor.status === 'online' ? 'default' : 'destructive'}>
                              {sensor.status}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold">
                            {sensor.current_value ?? 'N/A'} {sensor.unit || ''}
                          </p>
                          <p className="text-sm text-muted-foreground">{sensor.location}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModuleGate>
  );
}

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

function StatsCard({ title, value, icon: Icon, subtitle, variant = 'default' }: StatsCardProps) {
  return (
    <Card className={cn(
      variant === 'success' && 'border-accent bg-accent/5',
      variant === 'warning' && 'border-secondary bg-secondary/5',
      variant === 'destructive' && 'border-destructive bg-destructive/5'
    )}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Icon className={cn(
            "h-8 w-8",
            variant === 'default' && 'text-muted-foreground',
            variant === 'success' && 'text-accent',
            variant === 'warning' && 'text-secondary',
            variant === 'destructive' && 'text-destructive'
          )} />
        </div>
      </CardContent>
    </Card>
  );
}
