/**
 * AI Decision Log - Real-time log of AI decisions with blockchain audit trail
 */
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Clock,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AIDecision {
  id: string;
  timestamp: Date;
  agent: string;
  agentEmoji: string;
  module: string;
  action: string;
  confidence: number;
  status: 'approved' | 'pending' | 'rejected' | 'executed';
  humanOverride?: boolean;
  blockHash?: string;
  details?: string;
}

interface AIDecisionLogProps {
  decisions?: AIDecision[];
  className?: string;
  maxHeight?: string;
}

const MOCK_DECISIONS: AIDecision[] = [
  { id: '1', timestamp: new Date(), agent: 'Engineer', agentEmoji: '🔧', module: 'maintenance', action: 'Agendar manutenção preventiva - Motor Principal', confidence: 94, status: 'executed', blockHash: '0x7f2c...3a1b' },
  { id: '2', timestamp: new Date(Date.now() - 300000), agent: 'Navigator', agentEmoji: '🧭', module: 'navigation', action: 'Otimizar rota para economia de combustível', confidence: 98, status: 'approved' },
  { id: '3', timestamp: new Date(Date.now() - 600000), agent: 'Safety', agentEmoji: '🛡️', module: 'compliance', action: 'Alerta de certificado expirando em 30 dias', confidence: 100, status: 'pending' },
  { id: '4', timestamp: new Date(Date.now() - 900000), agent: 'Captain', agentEmoji: '🎯', module: 'operations', action: 'Ajustar velocidade para ETA otimizado', confidence: 87, status: 'executed', humanOverride: true },
  { id: '5', timestamp: new Date(Date.now() - 1200000), agent: 'Economist', agentEmoji: '💰', module: 'finance', action: 'Recomendar bunkering em Rotterdam', confidence: 91, status: 'approved', blockHash: '0x3d4e...8c2f' },
];

const STATUS_CONFIG = {
  approved: { color: 'bg-green-500', icon: CheckCircle, label: 'Aprovado' },
  pending: { color: 'bg-yellow-500', icon: Clock, label: 'Pendente' },
  rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejeitado' },
  executed: { color: 'bg-blue-500', icon: Activity, label: 'Executado' },
};

export function AIDecisionLog({ 
  decisions = MOCK_DECISIONS, 
  className,
  maxHeight = "400px"
}: AIDecisionLogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Log de Decisões AI
            </CardTitle>
            <CardDescription>Histórico de decisões com audit trail blockchain</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Blockchain Verified
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="pr-4" style={{ maxHeight }}>
          <div className="space-y-3">
            {decisions.map((decision) => {
              const StatusIcon = STATUS_CONFIG[decision.status].icon;
              const isExpanded = expandedId === decision.id;

              return (
                <div 
                  key={decision.id}
                  className={cn(
                    "border rounded-lg p-3 transition-all",
                    isExpanded && "bg-muted/50"
                  )}
                >
                  <div 
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : decision.id)}
                  >
                    {/* Agent Emoji */}
                    <div className="text-xl">{decision.agentEmoji}</div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{decision.agent}</span>
                        <Badge variant="outline" className="text-xs">
                          {decision.module}
                        </Badge>
                        {decision.humanOverride && (
                          <Badge variant="secondary" className="text-xs">
                            Override
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {decision.action}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <div className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[decision.status].color)} />
                          {STATUS_CONFIG[decision.status].label}
                        </span>
                        <span>Confiança: {decision.confidence}%</span>
                        <span>
                          {formatDistanceToNow(decision.timestamp, { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </div>

                    {/* Expand Icon */}
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">ID:</span>
                          <span className="ml-1 font-mono">{decision.id}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Horário:</span>
                          <span className="ml-1">{decision.timestamp.toLocaleString('pt-BR')}</span>
                        </div>
                        {decision.blockHash && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Block Hash:</span>
                            <span className="ml-1 font-mono text-green-500">{decision.blockHash}</span>
                          </div>
                        )}
                      </div>
                      {decision.details && (
                        <p className="text-xs text-muted-foreground">{decision.details}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Ver Detalhes
                        </Button>
                        {decision.status === 'pending' && (
                          <>
                            <Button size="sm" variant="default" className="h-7 text-xs">
                              Aprovar
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 text-xs">
                              Rejeitar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default AIDecisionLog;
