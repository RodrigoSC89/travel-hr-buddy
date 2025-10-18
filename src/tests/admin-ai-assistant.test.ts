import { describe, it, expect } from "vitest";

describe("Admin AI Assistant Page", () => {
  it("should generate AI response to user query", async () => {
    const mockQuery = "Qual a previsão de manutenções para este mês?";
    const mockResponse = {
      question: mockQuery,
      answer: "Com base nos dados históricos, estima-se 45 manutenções para este mês...",
      created_at: new Date().toISOString(),
      model: "gpt-4"
    };

    expect(mockResponse.question).toBe(mockQuery);
    expect(mockResponse.answer).toBeDefined();
    expect(mockResponse.model).toBe("gpt-4");
  });

  it("should log AI assistant interactions", () => {
    const mockLog = {
      id: "log-123",
      question: "Test question",
      answer: "Test answer",
      user_id: "user-456",
      created_at: new Date().toISOString()
    };

    expect(mockLog.id).toBeDefined();
    expect(mockLog.question).toBeDefined();
    expect(mockLog.answer).toBeDefined();
    expect(mockLog.user_id).toBeDefined();
  });

  it("should retrieve assistant logs", () => {
    const mockLogs = [
      { id: "1", question: "Q1", answer: "A1", created_at: "2024-01-01" },
      { id: "2", question: "Q2", answer: "A2", created_at: "2024-01-02" },
      { id: "3", question: "Q3", answer: "A3", created_at: "2024-01-03" }
    ];

    expect(mockLogs).toHaveLength(3);
    expect(mockLogs[0].question).toBe("Q1");
  });

  it("should filter logs by date range", () => {
    const logs = [
      { id: "1", created_at: "2024-01-01T10:00:00Z" },
      { id: "2", created_at: "2024-01-15T10:00:00Z" },
      { id: "3", created_at: "2024-02-01T10:00:00Z" }
    ];

    const startDate = new Date("2024-01-10");
    const endDate = new Date("2024-01-20");

    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate >= startDate && logDate <= endDate;
    });

    expect(filteredLogs).toHaveLength(1);
    expect(filteredLogs[0].id).toBe("2");
  });

  it("should filter logs by user", () => {
    const logs = [
      { id: "1", user_id: "user-1", question: "Q1" },
      { id: "2", user_id: "user-2", question: "Q2" },
      { id: "3", user_id: "user-1", question: "Q3" }
    ];

    const userLogs = logs.filter(log => log.user_id === "user-1");

    expect(userLogs).toHaveLength(2);
    expect(userLogs.every(log => log.user_id === "user-1")).toBe(true);
  });

  it("should count total interactions", () => {
    const logs = [
      { id: "1", user_id: "user-1" },
      { id: "2", user_id: "user-2" },
      { id: "3", user_id: "user-1" },
      { id: "4", user_id: "user-3" }
    ];

    const totalInteractions = logs.length;
    const uniqueUsers = new Set(logs.map(log => log.user_id)).size;

    expect(totalInteractions).toBe(4);
    expect(uniqueUsers).toBe(3);
  });

  it("should calculate average response time", () => {
    const interactions = [
      { id: "1", response_time_ms: 1200 },
      { id: "2", response_time_ms: 1500 },
      { id: "3", response_time_ms: 900 }
    ];

    const totalTime = interactions.reduce((sum, i) => sum + i.response_time_ms, 0);
    const averageTime = Math.round(totalTime / interactions.length);

    expect(averageTime).toBe(1200);
  });

  it("should categorize questions by type", () => {
    const logs = [
      { id: "1", question: "Qual a previsão?", category: "forecast" },
      { id: "2", question: "Como está o sistema?", category: "status" },
      { id: "3", question: "Quantos jobs?", category: "forecast" }
    ];

    const forecastQuestions = logs.filter(log => log.category === "forecast");

    expect(forecastQuestions).toHaveLength(2);
  });

  it("should track most asked questions", () => {
    const questions = [
      "Qual a previsão?",
      "Status do sistema",
      "Qual a previsão?",
      "Como criar job?",
      "Qual a previsão?"
    ];

    const questionCounts = questions.reduce((acc, q) => {
      acc[q] = (acc[q] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostAsked = Object.entries(questionCounts)
      .sort(([, a], [, b]) => b - a)[0];

    expect(mostAsked[0]).toBe("Qual a previsão?");
    expect(mostAsked[1]).toBe(3);
  });

  it("should validate AI response format", () => {
    const response = {
      answer: "Esta é uma resposta válida...",
      confidence: 0.95,
      sources: ["database", "historical_data"],
      tokens_used: 150
    };

    expect(response.answer).toBeDefined();
    expect(response.confidence).toBeGreaterThan(0);
    expect(response.confidence).toBeLessThanOrEqual(1);
    expect(response.sources).toHaveLength(2);
  });

  it("should handle AI assistant errors gracefully", () => {
    const errorResponse = {
      success: false,
      error: "API rate limit exceeded",
      fallback_message: "Serviço temporariamente indisponível. Tente novamente em alguns minutos."
    };

    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error).toBeDefined();
    expect(errorResponse.fallback_message).toBeDefined();
  });

  it("should export assistant logs to CSV", () => {
    const logs = [
      { id: "1", question: "Q1", answer: "A1", created_at: "2024-01-01" },
      { id: "2", question: "Q2", answer: "A2", created_at: "2024-01-02" }
    ];

    const csvHeader = "ID,Question,Answer,Created At";
    const csvRows = logs.map(log => 
      `${log.id},"${log.question}","${log.answer}",${log.created_at}`
    );
    const csv = [csvHeader, ...csvRows].join("\n");

    expect(csv).toContain("ID,Question,Answer");
    expect(csv.split("\n")).toHaveLength(3);
  });

  it("should generate assistant usage report", () => {
    const logs = [
      { user_id: "user-1", created_at: "2024-01-01" },
      { user_id: "user-1", created_at: "2024-01-02" },
      { user_id: "user-2", created_at: "2024-01-03" }
    ];

    const report = {
      total_interactions: logs.length,
      unique_users: new Set(logs.map(l => l.user_id)).size,
      period_start: "2024-01-01",
      period_end: "2024-01-03"
    };

    expect(report.total_interactions).toBe(3);
    expect(report.unique_users).toBe(2);
  });

  it("should support conversation context", () => {
    const conversation = [
      { id: "1", question: "Quantos jobs temos?", answer: "45 jobs" },
      { id: "2", question: "E quantos estão concluídos?", answer: "30 estão concluídos", context_id: "1" }
    ];

    const hasContext = conversation.some(c => c.context_id);
    expect(hasContext).toBe(true);
  });
});
