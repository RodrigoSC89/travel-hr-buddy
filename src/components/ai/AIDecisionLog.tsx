/**
 * AI Decision Log - Real-time log of AI decisions with blockchain audit trail
 * PATCH: Integrated with Supabase ai_blockchain_audit table
 */
import { useState, useEffect } from "react";
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
  Brain,
  Loader2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const AGENT_EMOJIS: Record<string, string> = {
  'captain': '🎯',
  'engineer': '🔧',
  'navigator': '🧭',
  'safety': '🛡️',
  'economist': '💰',
  'hr': '👥',
  'compliance': '📋',
  'default': '🤖'
};

const STATUS_CONFIG = {
  approved: { color: 'bg-green-500', icon: CheckCircle, label: 'Aprovado' },
  pending: { color: 'bg-yellow-500', icon: Clock, label: 'Pendente' },
  rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejeitado' },
  executed: { color: 'bg-blue-500', icon: Activity, label: 'Executado' },
};

export function AIDecisionLog({ 
  decisions: propDecisions, 
  className,
  maxHeight = "400px"
}: AIDecisionLogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [isLoading, setIsLoading] = useState(!propDecisions);
  const { toast } = useToast();

  // Fetch decisions from database if not provided as props
  useEffect(() => {
    if (propDecisions) {
      setDecisions(propDecisions);
      return;
    }

    const fetchDecisions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('ai_blockchain_audit')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);

        if (error) throw error;

        const transformedData: AIDecision[] = (data || []).map(item => ({
          id: item.id,
          timestamp: new Date(item.timestamp),
          agent: item.agent_name,
          agentEmoji: AGENT_EMOJIS[item.agent_name.toLowerCase()] || AGENT_EMOJIS.default,
          module: item.module,
          action: item.action_description,
          confidence: Math.round((item.confidence || 0.85) * 100),
          status: item.human_override ? 'approved' : 'executed',
          humanOverride: item.human_override || false,
          blockHash: item.hash ? `${item.hash.slice(0, 6)}...${item.hash.slice(-4)}` : undefined,
          details: item.reasoning || undefined
        }));

        setDecisions(transformedData);
      } catch (error) {
        console.error('Error fetching AI decisions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDecisions();
  }, [propDecisions]);

  const handleApprove = async (decisionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_blockchain_audit')
        .update({ human_override: true, override_reason: 'Approved by user' })
        .eq('id', decisionId);

      if (error) throw error;

      setDecisions(prev => prev.map(d => 
        d.id === decisionId ? { ...d, status: 'approved' as const, humanOverride: true } : d
      ));

      toast({
        title: "Decisão aprovada",
        description: "A decisão de IA foi aprovada com sucesso."
      });
    } catch (error) {
      console.error('Error approving decision:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a decisão.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (decisionId: string) => {
    try {
      const { error } = await supabase
        .from('ai_blockchain_audit')
        .update({ human_override: true, override_reason: 'Rejected by user' })
        .eq('id', decisionId);

      if (error) throw error;

      setDecisions(prev => prev.map(d => 
        d.id === decisionId ? { ...d, status: 'rejected' as const, humanOverride: true } : d
      ));

      toast({
        title: "Decisão rejeitada",
        description: "A decisão de IA foi rejeitada."
      });
    } catch (error) {
      console.error('Error rejecting decision:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a decisão.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Log de Decisões AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Carregando decisões...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {decisions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma decisão de IA registrada.</p>
          </div>
        ) : (
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
                            <span className="ml-1 font-mono">{decision.id.slice(0, 8)}...</span>
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
                              <Button 
                                size="sm" 
                                variant="default" 
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(decision.id);
                                }}
                              >
                                Aprovar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(decision.id);
                                }}
                              >
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
        )}
      </CardContent>
    </Card>
  );
}

export default AIDecisionLog;
