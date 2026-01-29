/**
 * Agentic AI Hooks - Simplified Dashboard Hook
 */
import { useQuery } from '@tanstack/react-query';
import { AI_ENGINE_REGISTRY } from '@/lib/ai/engines';

// Combined AI Suite Dashboard Hook
export function useAISuiteDashboard() {
  return useQuery({
    queryKey: ['ai-suite-dashboard'],
    queryFn: async () => {
      return {
        totalEngines: AI_ENGINE_REGISTRY.length,
        activeEngines: AI_ENGINE_REGISTRY.filter(e => e.status === 'active').length,
        decisionsToday: 1247,
        avgResponseTime: 145,
        avgConfidence: 89.3,
        modules: {
          crew: { engines: 5, active: 5, health: 100 },
          maintenance: { engines: 5, active: 5, health: 98 },
          compliance: { engines: 5, active: 4, health: 95 },
          finance: { engines: 5, active: 5, health: 100 },
          navigation: { engines: 5, active: 4, health: 97 },
          documents: { engines: 2, active: 2, health: 100 },
          agentic: { engines: 3, active: 3, health: 99 }
        },
        recentDecisions: [
          { id: '1', engine: 'crew-matching', decision: 'Match score 92%', time: new Date() },
          { id: '2', engine: 'nc-predictor', decision: '3 NCs previstos', time: new Date() },
          { id: '3', engine: 'route-optimizer', decision: 'Rota otimizada', time: new Date() }
        ]
      };
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
    refetchInterval: false, // DISABLED - prevent infinite loading
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
