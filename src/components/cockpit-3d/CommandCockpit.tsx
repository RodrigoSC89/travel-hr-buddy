/**
 * CommandCockpit Component
 * Main immersive 3D command center view
 */

import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Globe, Ship, AlertTriangle, Activity, 
  Maximize2, Minimize2, Settings, Radar, Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Globe2D } from './Globe2D';
import { MetricsHolograph } from './MetricsHolograph';
import { AIRecommendationsStream } from './AIRecommendationsStream';
import type { GlobeMarker, KPIMetric3D, AIRecommendation3D, CockpitState } from './types';
import { supabase } from '@/integrations/supabase/client';
import { Safe3DWrapper } from '@/components/3d/Safe3DWrapper';

// Lazy load 3D Globe to avoid ConcurrentRoot issues
const Globe3D = lazy(() => import('./Globe3D').then(m => ({ default: m.Globe3D })));

const GlobeLoading = () => (
  <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-muted/20 rounded-lg">
    <div className="text-center text-muted-foreground">
      <Box className="h-8 w-8 mx-auto mb-2 animate-pulse" />
      <p className="text-sm">Carregando globo 3D...</p>
    </div>
  </div>
);

export function CommandCockpit() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [state, setState] = useState<CockpitState>({
    viewMode: 'globe',
    selectedAsset: null,
    cameraPosition: [0, 0, 6],
    zoom: 1,
    showOverlays: true,
    autoRotate: true,
  });

  // Mock data - in production, fetch from Supabase
  const [markers, setMarkers] = useState<GlobeMarker[]>([]);
  const [metrics, setMetrics] = useState<KPIMetric3D[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation3D[]>([]);

  useEffect(() => {
    // Fetch real data
    fetchOperationalData();
  }, []);

  async function fetchOperationalData() {
    try {
      // Fetch vessels for markers
      const { data: vessels } = await supabase
        .from('vessels')
        .select('id, name, status')
        .limit(20);

      if (vessels) {
        const vesselMarkers: GlobeMarker[] = vessels.map((v, i) => ({
          id: v.id,
          label: v.name,
          lat: Math.random() * 180 - 90,
          lng: Math.random() * 360 - 180,
          type: 'vessel' as const,
          severity: v.status === 'active' ? 'low' : v.status === 'maintenance' ? 'medium' : 'high',
        }));
        setMarkers(vesselMarkers);
      }

      // Fetch metrics
      const { count: vesselCount } = await supabase.from('vessels').select('*', { count: 'exact', head: true });
      const { count: crewCount } = await supabase.from('crew_members').select('*', { count: 'exact', head: true });
      const { count: alertCount } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false);

      setMetrics([
        { id: 'vessels', label: 'Embarcações Ativas', value: vesselCount || 0, unit: '', trend: 'stable' },
        { id: 'crew', label: 'Tripulantes', value: crewCount || 0, unit: '', trend: 'up', trendValue: 5 },
        { id: 'compliance', label: 'Compliance', value: 94, unit: '%', trend: 'up', trendValue: 2 },
        { id: 'alerts', label: 'Alertas Ativos', value: alertCount || 0, unit: '', trend: 'down', trendValue: -12 },
      ]);

      // Generate AI recommendations
      setRecommendations([
        {
          id: '1',
          type: 'warning',
          title: 'Certificado próximo do vencimento',
          description: 'O certificado STCW de 3 tripulantes expira em 15 dias. Agende renovação.',
          priority: 'high',
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'insight',
          title: 'Otimização de rota sugerida',
          description: 'Análise indica economia de 8% no combustível com ajuste de rota.',
          priority: 'medium',
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: '3',
          type: 'action',
          title: 'Manutenção preventiva',
          description: 'Motor principal atingiu 2000h. Recomendada inspeção.',
          priority: 'medium',
          timestamp: new Date(Date.now() - 7200000),
        },
      ]);
    } catch (error) {
      console.error('Error fetching operational data:', error);
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      {/* Control bar */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5 text-primary animate-pulse" />
          <h2 className="text-lg font-bold">Cockpit de Comando</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={state.viewMode === 'globe' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setState(s => ({ ...s, viewMode: 'globe' }))}
          >
            <Globe className="h-4 w-4 mr-1" />
            Globo
          </Button>
          <Button
            variant={state.viewMode === 'fleet' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setState(s => ({ ...s, viewMode: 'fleet' }))}
          >
            <Ship className="h-4 w-4 mr-1" />
            Frota
          </Button>
          <Button
            variant={state.viewMode === 'metrics' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setState(s => ({ ...s, viewMode: 'metrics' }))}
          >
            <Activity className="h-4 w-4 mr-1" />
            Métricas
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* 3D Globe - Main area */}
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-background/40 backdrop-blur-md border border-border/50 rounded-lg overflow-hidden">
            <Safe3DWrapper 
              fallback={<Globe2D markers={markers} autoRotate={state.autoRotate} />}
              className="min-h-[400px]"
            >
              <Suspense fallback={<GlobeLoading />}>
                <Globe3D 
                  markers={markers} 
                  autoRotate={state.autoRotate}
                  onMarkerClick={(marker) => {
                    toast.info(`Selecionado: ${marker.label || 'Marcador'}`, {
                      description: `Localização: ${marker.lat?.toFixed(2) || 0}°, ${marker.lng?.toFixed(2) || 0}°`
                    });
                  }}
                />
              </Suspense>
            </Safe3DWrapper>
          </div>
          
          {/* Metrics below globe */}
          <div className="mt-4">
            <MetricsHolograph metrics={metrics} />
          </div>
        </motion.div>

        {/* AI Recommendations - Sidebar */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AIRecommendationsStream 
            recommendations={recommendations}
            maxHeight="calc(100vh - 280px)"
          />
        </motion.div>
      </div>

      {/* Status bar */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-background/80 backdrop-blur-sm border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Sistema Operacional
            </span>
            <span>{markers.length} ativos rastreados</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Última atualização: agora</span>
            <span>Latência IA: 124ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
