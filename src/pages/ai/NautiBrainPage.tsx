/**
 * Nauti Brain Page - Dedicated AI Chat Page
 */
import { NautiBrainChat } from '@/components/ai/nauti-brain-chat';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Shield, Zap, Clock } from 'lucide-react';

export default function NautiBrainPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <Brain className="h-10 w-10 text-primary" />
            <Sparkles className="h-4 w-4 text-warning absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Nauti Brain</h1>
            <p className="text-muted-foreground">
              Assistente de IA para operações marítimas
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" /> Gemini 2.5 Flash
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" /> GPT-4o Fallback
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" /> Streaming
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Chat */}
        <div className="lg:col-span-2">
          <NautiBrainChat className="h-[calc(100vh-220px)]" />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Capabilities */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Capacidades</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">🚢</span> Gestão de frota
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">👥</span> Tripulação & certificações
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">🔧</span> Manutenção preditiva
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">📋</span> Compliance (MLC, STCW)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">📊</span> Relatórios e análises
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">⚠️</span> Alertas proativos
              </li>
            </ul>
          </Card>

          {/* Example Prompts */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Exemplos de perguntas</h3>
            <div className="space-y-2 text-sm">
              <button className="w-full text-left p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                "Quais certificados vencem este mês?"
              </button>
              <button className="w-full text-left p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                "Gere um relatório de compliance MLC"
              </button>
              <button className="w-full text-left p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                "Previsão de manutenção do motor principal"
              </button>
              <button className="w-full text-left p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                "Status da frota com alertas"
              </button>
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Performance</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">&lt;2s</p>
                <p className="text-xs text-muted-foreground">P95 Latência</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">99.5%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
