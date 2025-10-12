import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  CheckCircle2,
  Clock,
  MessageSquare,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useAIInteractionStats } from "@/hooks/use-ai-interactions";
import { Skeleton } from "@/components/ui/skeleton";

export const AIInteractionDashboard = () => {
  const { data: stats, isLoading, error } = useAIInteractionStats();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">
            Erro ao carregar estatísticas de interação com IA
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Interações</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInteractions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as solicitações à IA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Interações bem-sucedidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats.averageDuration)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Duração média de resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Usados</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalTokensUsed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total de tokens consumidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interactions by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Interações por Tipo
          </CardTitle>
          <CardDescription>
            Distribuição de uso por tipo de interação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.interactionsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {type === "chat"
                      ? "Chat"
                      : type === "checklist_generation"
                      ? "Geração de Checklist"
                      : type === "document_summary"
                      ? "Resumo de Documento"
                      : "Outro"}
                  </Badge>
                </div>
                <span className="text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Interações Recentes
          </CardTitle>
          <CardDescription>
            Últimas 10 interações com o assistente IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {stats.recentInteractions.map((interaction) => (
                <div
                  key={interaction.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Badge
                        variant={interaction.success ? "default" : "destructive"}
                      >
                        {interaction.success ? "Sucesso" : "Falha"}
                      </Badge>
                      <Badge variant="outline" className="ml-2">
                        {interaction.interaction_type === "chat"
                          ? "Chat"
                          : interaction.interaction_type === "checklist_generation"
                          ? "Checklist"
                          : interaction.interaction_type === "document_summary"
                          ? "Resumo"
                          : "Outro"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(interaction.created_at).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2">{interaction.prompt}</p>
                  {interaction.duration_ms && (
                    <p className="text-xs text-muted-foreground">
                      Duração: {formatDuration(interaction.duration_ms)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
