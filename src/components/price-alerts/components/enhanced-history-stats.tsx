import { memo, memo, useEffect, useMemo, useState, useCallback } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Line, Bar } from "react-chartjs-2";
import { Download, TrendingUp, BarChart3, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  return { jsPDF, autoTable: autoTableModule.default };
};
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceHistory {
  id: string;
  route: string;
  price: number;
  recorded_at: string;
  source: string;
}

export const EnhancedHistoryStats = memo(function() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState("30d");
  const [flightHistory, setFlightHistory] = useState<PriceHistory[]>([]);
  const [hotelHistory, setHotelHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadHistoryData();
  }, [user, dateFilter]);

  const loadHistoryData = async () => {
    setIsLoading(true);
    try {
      const daysAgo = dateFilter === "7d" ? 7 : dateFilter === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch flight price history
      const { data: flightData, error: flightError } = await supabase
        .from("flight_price_history")
        .select("*")
        .gte("recorded_at", startDate.toISOString())
        .order("recorded_at", { ascending: true })
        .limit(100);

      if (flightError) throw flightError;

      // Fetch hotel price history
      const { data: hotelData, error: hotelError } = await supabase
        .from("hotel_price_history")
        .select("*")
        .gte("recorded_at", startDate.toISOString())
        .order("recorded_at", { ascending: true })
        .limit(100);

      if (hotelError) throw hotelError;

      setFlightHistory(
        (flightData || []).map((item) => ({
          id: item.id,
          route: item.route_code || "Unknown",
          price: item.price || 0,
          recorded_at: item.captured_at,
          source: "flight",
        }))
      );

      setHotelHistory(
        (hotelData || []).map((item) => ({
          id: item.id,
          route: item.hotel_name || "Unknown",
          price: item.total_price || 0,
          recorded_at: item.captured_at,
          source: "hotel",
        }))
      );
    } catch (error) {
      console.error("Error loading price history:", error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar os dados de histórico de preços",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  });

  const combinedHistory = useMemo(() => {
    return [...flightHistory, ...hotelHistory].sort(
      (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
  }, [flightHistory, hotelHistory]);

  const chartData = useMemo(() => {
    if (combinedHistory.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Group by date
    const groupedByDate: Record<string, { flight: number[]; hotel: number[] }> = {};

    combinedHistory.forEach((item) => {
      const date = new Date(item.recorded_at).toLocaleDateString("pt-BR");
      if (!groupedByDate[date]) {
        groupedByDate[date] = { flight: [], hotel: [] };
      }
      if (item.source === "flight") {
        groupedByDate[date].flight.push(item.price);
      } else {
        groupedByDate[date].hotel.push(item.price);
      }
    });

    const labels = Object.keys(groupedByDate);
    const flightPrices = labels.map((date) => {
      const prices = groupedByDate[date].flight;
      return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  };
    const hotelPrices = labels.map((date) => {
      const prices = groupedByDate[date].hotel;
      return prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  };

    return {
      labels,
      datasets: [
        {
          label: "Voos",
          data: flightPrices,
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Hotéis",
          data: hotelPrices,
          borderColor: "rgb(249, 115, 22)",
          backgroundColor: "rgba(249, 115, 22, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [combinedHistory]);

  const barChartData = useMemo(() => {
    const routeStats: Record<string, { count: number; avgPrice: number; totalPrice: number }> = {};

    combinedHistory.forEach((item) => {
      if (!routeStats[item.route]) {
        routeStats[item.route] = { count: 0, avgPrice: 0, totalPrice: 0 };
      }
      routeStats[item.route].count++;
      routeStats[item.route].totalPrice += item.price;
  };

    Object.keys(routeStats).forEach((route) => {
      routeStats[route].avgPrice = routeStats[route].totalPrice / routeStats[route].count;
  };

    const sortedRoutes = Object.entries(routeStats)
      .sort(([, a], [, b]) => b.avgPrice - a.avgPrice)
      .slice(0, 10);

    return {
      labels: sortedRoutes.map(([route]) => route),
      datasets: [
        {
          label: "Preço Médio (R$)",
          data: sortedRoutes.map(([, stats]) => stats.avgPrice),
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1,
        },
      ],
    };
  }, [combinedHistory]);

  const statistics = useMemo(() => {
    const prices = combinedHistory.map((item) => item.price);
    const flightPrices = flightHistory.map((item) => item.price);
    const hotelPrices = hotelHistory.map((item) => item.price);

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const min = (arr: number[]) => (arr.length > 0 ? Math.min(...arr) : 0);
    const max = (arr: number[]) => (arr.length > 0 ? Math.max(...arr) : 0);

    return {
      overall: {
        avg: avg(prices),
        min: min(prices),
        max: max(prices),
        count: prices.length,
      },
      flights: {
        avg: avg(flightPrices),
        min: min(flightPrices),
        max: max(flightPrices),
        count: flightPrices.length,
      },
      hotels: {
        avg: avg(hotelPrices),
        min: min(hotelPrices),
        max: max(hotelPrices),
        count: hotelPrices.length,
      },
    };
  }, [combinedHistory, flightHistory, hotelHistory]);

  const exportToCSV = () => {
    const csv = [
      ["Data", "Rota/Hotel", "Preço", "Fonte"],
      ...combinedHistory.map((item) => [
        new Date(item.recorded_at).toLocaleDateString("pt-BR"),
        item.route,
        item.price.toFixed(2),
        item.source === "flight" ? "Voo" : "Hotel",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historico-precos-${dateFilter}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exportado",
      description: "O arquivo foi baixado com sucesso",
    });
  });

  const exportToPDF = async () => {
    const { jsPDF, autoTable } = await loadJsPDF();
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Histórico de Preços", 14, 22);
    doc.setFontSize(11);
    doc.text(`Período: ${dateFilter}`, 14, 30);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 36);

    // Statistics
    doc.setFontSize(14);
    doc.text("Estatísticas", 14, 50);
    autoTable(doc, {
      startY: 55,
      head: [["Categoria", "Média", "Mínimo", "Máximo", "Total"]],
      body: [
        [
          "Geral",
          `R$ ${statistics.overall.avg.toFixed(2)}`,
          `R$ ${statistics.overall.min.toFixed(2)}`,
          `R$ ${statistics.overall.max.toFixed(2)}`,
          statistics.overall.count.toString(),
        ],
        [
          "Voos",
          `R$ ${statistics.flights.avg.toFixed(2)}`,
          `R$ ${statistics.flights.min.toFixed(2)}`,
          `R$ ${statistics.flights.max.toFixed(2)}`,
          statistics.flights.count.toString(),
        ],
        [
          "Hotéis",
          `R$ ${statistics.hotels.avg.toFixed(2)}`,
          `R$ ${statistics.hotels.min.toFixed(2)}`,
          `R$ ${statistics.hotels.max.toFixed(2)}`,
          statistics.hotels.count.toString(),
        ],
      ],
    });

    // History table
    const finalY = (doc as unknown).lastAutoTable?.finalY || 100;
    doc.setFontSize(14);
    doc.text("Histórico Detalhado", 14, finalY + 10);
    autoTable(doc, {
      startY: finalY + 15,
      head: [["Data", "Rota/Hotel", "Preço", "Fonte"]],
      body: combinedHistory.slice(0, 50).map((item) => [
        new Date(item.recorded_at).toLocaleDateString("pt-BR"),
        item.route,
        `R$ ${item.price.toFixed(2)}`,
        item.source === "flight" ? "Voo" : "Hotel",
      ]),
    });

    doc.save(`historico-precos-${dateFilter}-${Date.now()}.pdf`);

    toast({
      title: "PDF exportado",
      description: "O arquivo foi baixado com sucesso",
    });
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Carregando histórico...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Histórico e Estatísticas de Preços
              </CardTitle>
              <CardDescription>
                Análise histórica com dados agregados de voos e hotéis
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={exportToPDF} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{statistics.overall.count}</div>
                <div className="text-xs text-muted-foreground">Total de Registros</div>
                <div className="text-sm mt-2">
                  Média: <span className="font-semibold">R$ {statistics.overall.avg.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">{statistics.flights.count}</div>
                <div className="text-xs text-muted-foreground">Voos Monitorados</div>
                <div className="text-sm mt-2">
                  Média: <span className="font-semibold">R$ {statistics.flights.avg.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">{statistics.hotels.count}</div>
                <div className="text-xs text-muted-foreground">Hotéis Monitorados</div>
                <div className="text-sm mt-2">
                  Média: <span className="font-semibold">R$ {statistics.hotels.avg.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="line" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="line">
                <TrendingUp className="w-4 h-4 mr-2" />
                Tendência Temporal
              </TabsTrigger>
              <TabsTrigger value="bar">
                <BarChart3 className="w-4 h-4 mr-2" />
                Por Rota
              </TabsTrigger>
            </TabsList>
            <TabsContent value="line" className="space-y-4">
              <div className="h-80">
                {chartData.labels.length > 0 ? (
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top" as const,
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                          ticks: {
                            callback: function (value) {
                              return "R$ " + value;
                            },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="bar" className="space-y-4">
              <div className="h-80">
                {barChartData.labels.length > 0 ? (
                  <Bar
                    data={barChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function (value) {
                              return "R$ " + value;
                            },
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
});
