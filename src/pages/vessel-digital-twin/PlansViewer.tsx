/**
 * Plans Viewer Component
 * Interactive vessel plans (GA Plans)
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Map,
  Layers,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  FileText
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PlansViewerProps {
  vesselId: string;
}

interface VesselPlan {
  id: string;
  name: string;
  plan_type: string;
  deck_level: string | null;
  file_url: string;
  file_type: string | null;
  thumbnail_url: string | null;
  interactive_data: unknown[];
  scale: string | null;
  revision: string | null;
  revision_date: string | null;
  notes: string | null;
}

const PLAN_TYPES = [
  { value: 'all', label: 'Todos os Planos' },
  { value: 'general_arrangement', label: 'Arranjo Geral' },
  { value: 'fire_control', label: 'Controle de Incêndio' },
  { value: 'safety', label: 'Segurança' },
  { value: 'electrical', label: 'Elétrica' },
  { value: 'piping', label: 'Tubulações' },
  { value: 'deck', label: 'Convés' },
  { value: 'engine_room', label: 'Praça de Máquinas' },
];

const TYPE_COLORS: Record<string, string> = {
  general_arrangement: 'bg-blue-100 text-blue-800',
  fire_control: 'bg-red-100 text-red-800',
  safety: 'bg-green-100 text-green-800',
  electrical: 'bg-amber-100 text-amber-800',
  piping: 'bg-cyan-100 text-cyan-800',
  deck: 'bg-purple-100 text-purple-800',
  engine_room: 'bg-gray-100 text-gray-800',
};

export default function PlansViewer({ vesselId }: PlansViewerProps) {
  const [planType, setPlanType] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState<VesselPlan | null>(null);
  const [zoom, setZoom] = useState(100);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['vessel-plans', vesselId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vessel_plans')
        .select('*')
        .eq('vessel_id', vesselId)
        .order('plan_type')
        .order('name');
      
      if (error) throw error;
      return data as unknown as VesselPlan[];
    },
    enabled: !!vesselId,
    staleTime: 5 * 60 * 1000,
  });

  const filteredPlans = plans?.filter(plan => 
    planType === 'all' || plan.plan_type === planType
  ) || [];

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(200, Math.max(50, prev + delta)));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Skeleton className="h-[600px]" />
        </div>
        <div className="lg:col-span-3">
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Plans List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Planos
            </CardTitle>
            <Select value={planType} onValueChange={setPlanType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                {PLAN_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {filteredPlans.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Map className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum plano encontrado</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredPlans.map(plan => (
                    <button
                      key={plan.id}
                      className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                        selectedPlan?.id === plan.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <div className="flex items-start gap-3">
                        {plan.thumbnail_url ? (
                          <img 
                            src={plan.thumbnail_url} 
                            alt={plan.name}
                            className="h-12 w-16 object-cover rounded border"
                          />
                        ) : (
                          <div className="h-12 w-16 bg-muted rounded border flex items-center justify-center">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{plan.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${TYPE_COLORS[plan.plan_type] || ''}`}
                            >
                              {plan.plan_type.replace('_', ' ')}
                            </Badge>
                            {plan.deck_level && (
                              <Badge variant="outline" className="text-xs">
                                {plan.deck_level}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Plan Viewer */}
      <div className="lg:col-span-3">
        <Card className="h-full">
          {selectedPlan ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg">{selectedPlan.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={TYPE_COLORS[selectedPlan.plan_type]}>
                      {selectedPlan.plan_type.replace('_', ' ')}
                    </Badge>
                    {selectedPlan.revision && (
                      <Badge variant="outline">Rev. {selectedPlan.revision}</Badge>
                    )}
                    {selectedPlan.scale && (
                      <Badge variant="outline">Escala: {selectedPlan.scale}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleZoom(-10)}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm w-12 text-center">{zoom}%</span>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => handleZoom(10)}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => window.open(selectedPlan.file_url, '_blank')}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="border rounded-lg bg-muted/30 overflow-auto"
                  style={{ height: '500px' }}
                >
                  <div 
                    className="p-4 min-w-full flex items-center justify-center"
                    style={{ 
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'top left',
                      transition: 'transform 0.2s'
                    }}
                  >
                    {selectedPlan.file_type?.includes('pdf') ? (
                      <iframe
                        src={`${selectedPlan.file_url}#view=FitH`}
                        className="w-full h-[600px] border-0"
                        title={selectedPlan.name}
                      />
                    ) : (
                      <img
                        src={selectedPlan.file_url}
                        alt={selectedPlan.name}
                        className="max-w-none"
                      />
                    )}
                  </div>
                </div>
                
                {selectedPlan.notes && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    <strong>Notas:</strong> {selectedPlan.notes}
                  </p>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Selecione um plano</p>
                <p className="text-sm">Escolha um plano na lista para visualizar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
