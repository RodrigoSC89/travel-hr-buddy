/**
 * Operations Correlation Matrix
 * Visual representation of cross-module relationships and dependencies
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Network, Brain, Sparkles, Loader2,
  Ship, Users, Wrench, Shield, AlertTriangle,
  DollarSign, FileText, Anchor, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface ModuleNode {
  id: string;
  label: string;
  icon: typeof Ship;
  color: string;
  score: number;
}

interface Correlation {
  source: string;
  target: string;
  strength: number;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
}

const MODULES: ModuleNode[] = [
  { id: 'operations', label: 'Operações', icon: Ship, color: 'bg-blue-500', score: 88 },
  { id: 'crew', label: 'Tripulação', icon: Users, color: 'bg-emerald-500', score: 82 },
  { id: 'maintenance', label: 'Manutenção', icon: Wrench, color: 'bg-orange-500', score: 75 },
  { id: 'compliance', label: 'Compliance', icon: Shield, color: 'bg-purple-500', score: 91 },
  { id: 'safety', label: 'Segurança', icon: AlertTriangle, color: 'bg-red-500', score: 85 },
  { id: 'finance', label: 'Financeiro', icon: DollarSign, color: 'bg-amber-500', score: 78 },
  { id: 'documents', label: 'Documentos', icon: FileText, color: 'bg-teal-500', score: 90 },
  { id: 'tracking', label: 'Rastreamento', icon: Anchor, color: 'bg-indigo-500', score: 95 },
];

const CORRELATIONS: Correlation[] = [
  { source: 'crew', target: 'safety', strength: 92, type: 'positive', description: 'Tripulação treinada reduz incidentes de segurança em 40%' },
  { source: 'maintenance', target: 'operations', strength: 88, type: 'positive', description: 'Manutenção preventiva aumenta disponibilidade operacional' },
  { source: 'compliance', target: 'operations', strength: 85, type: 'positive', description: 'Alto compliance evita detenções PSC e atrasos' },
  { source: 'crew', target: 'maintenance', strength: 78, type: 'positive', description: 'Rotações adequadas garantem continuidade de manutenção' },
  { source: 'finance', target: 'maintenance', strength: 70, type: 'negative', description: 'Cortes orçamentários impactam qualidade da manutenção' },
  { source: 'documents', target: 'compliance', strength: 95, type: 'positive', description: 'Documentação atualizada é base para conformidade regulatória' },
  { source: 'tracking', target: 'operations', strength: 90, type: 'positive', description: 'Rastreamento em tempo real otimiza decisões operacionais' },
  { source: 'safety', target: 'compliance', strength: 82, type: 'positive', description: 'Bom histórico de segurança facilita auditorias' },
];

export function OperationsCorrelationMatrix() {
  const [aiCorrelation, setAiCorrelation] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCorrelation, setSelectedCorrelation] = useState<Correlation | null>(null);

  const runCorrelationAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('cross-module-intelligence', {
        body: { analysisType: 'correlation' },
      });
      if (error) throw error;
      setAiCorrelation(data?.analysis || 'Análise não disponível');
      toast.success('Análise de correlações concluída');
    } catch {
      toast.error('Erro na análise de correlações');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Health Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {MODULES.map(mod => {
          const Icon = mod.icon;
          const scoreColor = mod.score >= 85 ? 'text-emerald-500' : mod.score >= 70 ? 'text-amber-500' : 'text-red-500';
          return (
            <Card key={mod.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full ${mod.color} mx-auto mb-2 flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium text-sm">{mod.label}</p>
                <p className={`text-xl font-bold ${scoreColor}`}>{mod.score}%</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={runCorrelationAnalysis} disabled={isAnalyzing} className="gap-2">
          {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4" />}
          Analisar Correlações com IA
        </Button>
      </div>

      {/* AI Correlation Analysis */}
      {aiCorrelation && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                Análise de Correlações Cross-Module
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px]">
                <p className="text-sm whitespace-pre-wrap">{aiCorrelation}</p>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Correlation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Matriz de Correlações Operacionais
          </CardTitle>
          <CardDescription>Interdependências entre módulos detectadas por IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CORRELATIONS.map((corr, i) => {
              const sourceModule = MODULES.find(m => m.id === corr.source)!;
              const targetModule = MODULES.find(m => m.id === corr.target)!;
              const SourceIcon = sourceModule.icon;
              const TargetIcon = targetModule.icon;
              const strengthColor = corr.strength >= 85 ? 'text-emerald-600' : corr.strength >= 70 ? 'text-amber-600' : 'text-red-600';
              const typeColor = corr.type === 'positive' ? 'bg-emerald-500/10 border-emerald-500/30' : corr.type === 'negative' ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-500/10 border-gray-500/30';

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${typeColor} ${selectedCorrelation === corr ? 'ring-2 ring-primary/30' : ''}`}
                  onClick={() => setSelectedCorrelation(corr)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className={`p-1.5 rounded ${sourceModule.color}`}>
                        <SourceIcon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-medium">{sourceModule.label}</span>
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <div className="h-0.5 flex-1 bg-current opacity-20" />
                      <span className={`text-sm font-bold ${strengthColor}`}>{corr.strength}%</span>
                      <div className="h-0.5 flex-1 bg-current opacity-20" />
                    </div>

                    <div className="flex items-center gap-2 min-w-[120px] justify-end">
                      <span className="text-xs font-medium">{targetModule.label}</span>
                      <div className={`p-1.5 rounded ${targetModule.color}`}>
                        <TargetIcon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">{corr.description}</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
