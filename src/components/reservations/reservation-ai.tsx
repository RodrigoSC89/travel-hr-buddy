import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lightbulb,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { EnhancedReservation } from "./enhanced-reservations-dashboard";
import { useToast } from "@/hooks/use-toast";

interface ReservationAIProps {
  reservations: EnhancedReservation[];
  onReservationUpdate: () => void;
}

interface AIInsight {
  id: string;
  type: "conflict" | "optimization" | "reminder" | "cost_saving";
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  reservationIds: string[];
  suggestion: string;
  automatable: boolean;
}

export const ReservationAI: React.FC<ReservationAIProps> = ({
  reservations,
  onReservationUpdate,
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateInsights();
  }, [reservations]);

  const generateInsights = () => {
    setLoading(true);

    const newInsights: AIInsight[] = [];

    // Detect conflicts
    reservations.forEach(reservation => {
      const conflicts = reservations.filter(
        other =>
          other.id !== reservation.id &&
          other.user_id === reservation.user_id &&
          new Date(other.start_date) < new Date(reservation.end_date) &&
          new Date(other.end_date) > new Date(reservation.start_date)
      );

      if (conflicts.length > 0) {
        newInsights.push({
          id: `conflict_${reservation.id}`,
          type: "conflict",
          title: "Conflito de Agendamento Detectado",
          description: `A reserva "${reservation.title}" conflita com ${conflicts.length} outra(s) reserva(s).`,
          severity: "critical",
          reservationIds: [reservation.id, ...conflicts.map(c => c.id)],
          suggestion:
            "Considere reagendar uma das reservas ou verificar se há sobreposição intencional.",
          automatable: false,
        });
      }
    });

    // Detect upcoming check-ins
    const upcomingReservations = reservations.filter(r => {
      const startDate = new Date(r.start_date);
      const now = new Date();
      const daysDiff = (startDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7 && daysDiff > 0 && r.status === "confirmed";
    });

    upcomingReservations.forEach(reservation => {
      const startDate = new Date(reservation.start_date);
      const daysDiff = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));

      newInsights.push({
        id: `reminder_${reservation.id}`,
        type: "reminder",
        title: "Lembrete de Check-in",
        description: `Check-in em ${daysDiff} dia(s) para "${reservation.title}".`,
        severity: daysDiff <= 2 ? "high" : "medium",
        reservationIds: [reservation.id],
        suggestion: "Confirme os detalhes da reserva e prepare a documentação necessária.",
        automatable: true,
      });
    });

    // Detect cost optimization opportunities
    const hotelReservations = reservations.filter(
      r => r.reservation_type === "hotel" && r.total_amount && r.total_amount > 500
    );

    if (hotelReservations.length > 0) {
      const avgCost =
        hotelReservations.reduce((sum, r) => sum + (r.total_amount || 0), 0) /
        hotelReservations.length;
      const expensiveReservations = hotelReservations.filter(
        r => (r.total_amount || 0) > avgCost * 1.5
      );

      if (expensiveReservations.length > 0) {
        newInsights.push({
          id: "cost_optimization",
          type: "cost_saving",
          title: "Oportunidade de Economia",
          description: `${expensiveReservations.length} reserva(s) estão acima da média de custo.`,
          severity: "medium",
          reservationIds: expensiveReservations.map(r => r.id),
          suggestion:
            "Considere negociar tarifas corporativas ou buscar alternativas mais econômicas.",
          automatable: false,
        });
      }
    }

    // Detect missing information
    const incompleteReservations = reservations.filter(
      r => !r.confirmation_number || !r.contact_info || !r.address
    );

    if (incompleteReservations.length > 0) {
      newInsights.push({
        id: "incomplete_info",
        type: "optimization",
        title: "Informações Incompletas",
        description: `${incompleteReservations.length} reserva(s) possuem informações incompletas.`,
        severity: "medium",
        reservationIds: incompleteReservations.map(r => r.id),
        suggestion: "Complete as informações faltantes para melhor organização e controle.",
        automatable: false,
      });
    }

    setInsights(newInsights);
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "conflict":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "cost_saving":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "optimization":
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bot className="h-5 w-5" />;
    }
  };

  const handleApplySuggestion = (insight: AIInsight) => {
    if (insight.automatable) {
      // Here you would implement automatic actions
      toast({
        title: "Ação Aplicada",
        description: "Sugestão aplicada automaticamente",
      });
    } else {
      toast({
        title: "Ação Manual Necessária",
        description: "Esta sugestão requer ação manual",
        variant: "default",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Assistente de IA para Reservas
          </h3>
          <p className="text-muted-foreground">
            Análises inteligentes e sugestões para otimizar suas reservas
          </p>
        </div>
        <Button variant="outline" onClick={generateInsights} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar Análise
        </Button>
      </div>

      {/* AI Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Conflitos</p>
                <p className="text-2xl font-bold">
                  {insights.filter(i => i.type === "conflict").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Lembretes</p>
                <p className="text-2xl font-bold">
                  {insights.filter(i => i.type === "reminder").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Economia</p>
                <p className="text-2xl font-bold">
                  {insights.filter(i => i.type === "cost_saving").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Otimizações</p>
                <p className="text-2xl font-bold">
                  {insights.filter(i => i.type === "optimization").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tudo em Ordem!</h3>
              <p className="text-muted-foreground">
                Não foram detectados problemas ou oportunidades de melhoria nas suas reservas.
              </p>
            </CardContent>
          </Card>
        ) : (
          insights.map(insight => (
            <Card key={insight.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(insight.type)}
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <p className="text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getSeverityColor(insight.severity)}>
                      {insight.severity === "critical"
                        ? "Crítico"
                        : insight.severity === "high"
                          ? "Alto"
                          : insight.severity === "medium"
                            ? "Médio"
                            : "Baixo"}
                    </Badge>
                    {insight.automatable && <Badge variant="outline">Automatizável</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">Sugestão:</h4>
                    <p className="text-muted-foreground">{insight.suggestion}</p>
                  </div>

                  {insight.reservationIds.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-1">Reservas Afetadas:</h4>
                      <div className="flex flex-wrap gap-1">
                        {insight.reservationIds.map(id => {
                          const reservation = reservations.find(r => r.id === id);
                          return reservation ? (
                            <Badge key={id} variant="secondary" className="text-xs">
                              {reservation.title}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApplySuggestion(insight)}
                      disabled={!insight.automatable}
                    >
                      {insight.automatable ? "Aplicar Automaticamente" : "Ação Manual"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Mark as dismissed
                        setInsights(insights.filter(i => i.id !== insight.id));
                      }}
                    >
                      Dispensar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
