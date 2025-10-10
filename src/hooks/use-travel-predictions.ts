import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PredictionData {
  current_avg_price: number;
  predicted_price: number;
  price_trend: "rising" | "falling" | "stable";
  confidence_score: number;
  best_booking_window_start: string;
  best_booking_window_end: string;
  recommendation: string;
  demand_level: string;
}

interface PriceData {
  type: "flight" | "hotel";
  routeCode?: string;
  airlineCode?: string;
  flightNumber?: string;
  departureDate?: string;
  price: number;
  currency?: string;
  bookingClass?: string;
  source?: string;
  passengerCount?: number;
  hotelId?: string;
  hotelName?: string;
  city?: string;
  country?: string;
  checkInDate?: string;
  checkOutDate?: string;
  pricePerNight?: number;
  totalPrice?: number;
  roomType?: string;
  guestCount?: number;
  rating?: number;
  metadata?: Record<string, unknown>;
}

export const useTravelPredictions = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionData | null>(null);

  const generatePrediction = useCallback(
    async (type: "flight" | "hotel", route: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("travel-predictive-analysis", {
          body: {
            action: "generate_predictions",
            type,
            route,
          },
        });

        if (error) throw error;

        setPredictions(data.data);
        return data.data;
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao gerar predições. Tente novamente.",
          variant: "destructive",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const storePriceData = useCallback(async (priceData: PriceData) => {
    try {
      const { error } = await supabase.functions.invoke("travel-predictive-analysis", {
        body: {
          action: "store_price_data",
          data: priceData,
        },
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, []);

  const createPriceAlert = useCallback(
    async (alertData: {
      type: "flight" | "hotel";
      route: string;
      targetPrice: number;
      currentPrice?: number;
      alertType?: string;
      travelDate?: string;
      passengers?: number;
    }) => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          throw new Error("Usuário não autenticado");
        }

        const { error } = await supabase.functions.invoke("travel-predictive-analysis", {
          body: {
            action: "create_price_alert",
            data: {
              userId: userData.user.id,
              ...alertData,
            },
          },
        });

        if (error) throw error;

        toast({
          title: "Alerta Criado",
          description: "Você será notificado quando o preço atingir o valor desejado.",
        });

        return { success: true };
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao criar alerta. Tente novamente.",
          variant: "destructive",
        });
        return { success: false, error };
      }
    },
    [toast]
  );

  const getRecommendations = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase.functions.invoke("travel-predictive-analysis", {
        body: {
          action: "get_recommendations",
          data: { userId: userData.user.id },
        },
      });

      if (error) throw error;

      return data.data || [];
    } catch (error) {
      return [];
    }
  }, []);

  const analyzeTrends = useCallback(async (type: "flight" | "hotel", route: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("travel-predictive-analysis", {
        body: {
          action: "analyze_trends",
          type,
          route,
        },
      });

      if (error) throw error;

      return data.data;
    } catch (error) {
      return null;
    }
  }, []);

  const getInsights = useCallback((predictions: PredictionData | null) => {
    if (!predictions) return null;

    const priceChange = predictions.predicted_price - predictions.current_avg_price;
    const priceChangePercent = (priceChange / predictions.current_avg_price) * 100;

    return {
      priceChange,
      priceChangePercent,
      shouldBookNow: predictions.price_trend === "rising" && priceChangePercent > 5,
      shouldWait: predictions.price_trend === "falling" && priceChangePercent < -3,
      confidence: predictions.confidence_score,
      isHighConfidence: predictions.confidence_score > 0.7,
      demandLevel: predictions.demand_level,
      bestBookingPeriod: {
        start: predictions.best_booking_window_start,
        end: predictions.best_booking_window_end,
      },
      recommendation: predictions.recommendation,
    };
  }, []);

  const formatPredictionSummary = useCallback(
    (predictions: PredictionData | null) => {
      if (!predictions) return "Nenhuma predição disponível";

      const insights = getInsights(predictions);
      if (!insights) return "Erro ao processar predição";

      const trend =
        predictions.price_trend === "rising"
          ? "alta"
          : predictions.price_trend === "falling"
            ? "baixa"
            : "estável";

      return `Tendência de ${trend} com ${Math.round(insights.confidence * 100)}% de confiança. ${insights.recommendation}`;
    },
    [getInsights]
  );

  return {
    loading,
    predictions,
    generatePrediction,
    storePriceData,
    createPriceAlert,
    getRecommendations,
    analyzeTrends,
    getInsights,
    formatPredictionSummary,
  };
};
