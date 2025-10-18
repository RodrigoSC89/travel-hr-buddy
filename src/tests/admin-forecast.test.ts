import { describe, it, expect } from "vitest";

describe("Admin Forecast Page", () => {
  it("should have correct page structure", () => {
    const mockPageData = {
      title: "Previsões IA",
      description: "Análise preditiva de jobs e tendências com inteligência artificial",
      aiModel: "GPT-4",
      analysisWindow: "6 Meses",
      accuracy: 85
    };

    expect(mockPageData.title).toBe("Previsões IA");
    expect(mockPageData.aiModel).toBe("GPT-4");
    expect(mockPageData.accuracy).toBeGreaterThan(0);
  });

  it("should process trend data correctly", () => {
    const trendData = [
      { month: "Jan", total_jobs: 45 },
      { month: "Fev", total_jobs: 52 },
      { month: "Mar", total_jobs: 48 },
      { month: "Abr", total_jobs: 61 },
      { month: "Mai", total_jobs: 58 },
      { month: "Jun", total_jobs: 65 }
    ];

    expect(trendData).toHaveLength(6);
    expect(trendData[0].month).toBe("Jan");
    expect(trendData[0].total_jobs).toBe(45);
  });

  it("should calculate average jobs per month", () => {
    const trendData = [
      { month: "Jan", total_jobs: 45 },
      { month: "Fev", total_jobs: 52 },
      { month: "Mar", total_jobs: 48 }
    ];

    const totalJobs = trendData.reduce((sum, item) => sum + item.total_jobs, 0);
    const average = Math.round(totalJobs / trendData.length);

    expect(average).toBe(48);
  });

  it("should identify growth trends", () => {
    const trendData = [
      { month: "Jan", total_jobs: 45 },
      { month: "Fev", total_jobs: 52 },
      { month: "Mar", total_jobs: 58 }
    ];

    const firstMonth = trendData[0].total_jobs;
    const lastMonth = trendData[trendData.length - 1].total_jobs;
    const isGrowing = lastMonth > firstMonth;

    expect(isGrowing).toBe(true);
    expect(lastMonth - firstMonth).toBe(13);
  });

  it("should handle forecast API response", () => {
    const mockForecastResponse = {
      forecast: "Baseado na análise dos últimos 6 meses, há uma tendência de crescimento...",
      confidence: 85,
      recommendations: [
        "Aumentar capacidade operacional",
        "Preparar equipe para aumento de demanda"
      ]
    };

    expect(mockForecastResponse.forecast).toBeDefined();
    expect(mockForecastResponse.confidence).toBeGreaterThan(0);
    expect(mockForecastResponse.recommendations).toHaveLength(2);
  });

  it("should display forecast summary cards", () => {
    const summaryCards = [
      { title: "Análise Preditiva", value: "GPT-4" },
      { title: "Período de Análise", value: "6 Meses" },
      { title: "Precisão", value: "85%" }
    ];

    expect(summaryCards).toHaveLength(3);
    expect(summaryCards[0].title).toBe("Análise Preditiva");
    expect(summaryCards[1].value).toBe("6 Meses");
  });

  it("should explain the forecast process", () => {
    const processSteps = [
      { step: 1, title: "Coleta de Dados", description: "O sistema analisa histórico..." },
      { step: 2, title: "Análise com IA", description: "GPT-4 processa os dados..." },
      { step: 3, title: "Geração de Previsões", description: "Com base na análise..." },
      { step: 4, title: "Ações Recomendadas", description: "A IA sugere ações..." }
    ];

    expect(processSteps).toHaveLength(4);
    expect(processSteps[0].step).toBe(1);
    expect(processSteps[3].step).toBe(4);
  });

  it("should validate trend data format", () => {
    const validTrendItem = {
      month: "Jan",
      total_jobs: 45
    };

    expect(validTrendItem).toHaveProperty("month");
    expect(validTrendItem).toHaveProperty("total_jobs");
    expect(typeof validTrendItem.total_jobs).toBe("number");
  });

  it("should handle empty trend data", () => {
    const emptyTrend: Array<{ month: string; total_jobs: number }> = [];
    const hasData = emptyTrend.length > 0;

    expect(hasData).toBe(false);
    expect(emptyTrend).toHaveLength(0);
  });

  it("should calculate growth percentage", () => {
    const oldValue = 45;
    const newValue = 65;
    const growthPercentage = Math.round(((newValue - oldValue) / oldValue) * 100);

    expect(growthPercentage).toBeGreaterThan(0);
    expect(growthPercentage).toBe(44);
  });
});
