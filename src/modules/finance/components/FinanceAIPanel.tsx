/**
 * Finance AI Panel - Painel de IA para análise financeira
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Lightbulb,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useNautilusAI } from "@/hooks/useNautilusAI";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  transaction_date: string;
}

interface FinanceAIPanelProps {
  transactions: Transaction[];
  income: number;
  expenses: number;
}

export function FinanceAIPanel({ transactions, income, expenses }: FinanceAIPanelProps) {
  const { analyze, chat, isLoading } = useNautilusAI();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);

  const handleAnalyze = async () => {
    const result = await analyze("finance", "Analise as finanças e forneça insights", {
      transactions: transactions.slice(0, 20),
      income,
      expenses,
      balance: income - expenses,
      margin: ((income - expenses) / income * 100).toFixed(1),
    });
    setAnalysis(result?.response || "Análise não disponível no momento.");
  };

  const handleForecast = async () => {
    const result = await analyze("finance", "Faça previsão orçamentária para os próximos meses", {
      historicalData: transactions.slice(0, 30),
      currentMonth: new Date().toISOString().slice(0, 7),
      income,
      expenses,
    });
    setAnalysis(result?.response || "Previsão não disponível no momento.");
  };

  const handleCostRecommendations = async () => {
    const result = await analyze("finance", "Sugira formas de reduzir custos operacionais", {
      expenses: transactions.filter(t => t.type === "expense"),
      categories: [...new Set(transactions.map(t => t.category))],
      totalExpenses: expenses,
    });
    setAnalysis(result?.response || "Recomendações não disponíveis no momento.");
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatHistory(prev => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");
    
    const response = await chat("finance", userMessage, {
      transactions: transactions.slice(0, 10),
      income,
      expenses,
    });
    
    setChatHistory(prev => [...prev, { role: "assistant" as const, content: response?.response || "Desculpe, não consegui processar sua pergunta." }]);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Assistente Financeiro IA
        </CardTitle>
        <CardDescription>
          Análise inteligente e recomendações para suas finanças
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
            Analisar Finanças
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleForecast}
            disabled={isLoading}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Previsão
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCostRecommendations}
            disabled={isLoading}
          >
            <Lightbulb className="h-4 w-4 mr-1" />
            Reduzir Custos
          </Button>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Receitas</span>
            </div>
            <p className="text-lg font-bold text-green-600">
              R$ {income.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium">Despesas</span>
            </div>
            <p className="text-lg font-bold text-red-600">
              R$ {expenses.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Analysis Result */}
        {analysis && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Análise IA</span>
            </div>
            <ScrollArea className="h-40">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis}</p>
            </ScrollArea>
          </div>
        )}

        {/* Chat History */}
        {chatHistory.length > 0 && (
          <ScrollArea className="h-32 p-2 rounded-lg bg-muted/30">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 p-2 rounded-lg text-sm ${
                  msg.role === "user" 
                    ? "bg-primary/10 text-right ml-8" 
                    : "bg-muted mr-8"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </ScrollArea>
        )}

        {/* Chat Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder="Pergunte sobre suas finanças..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            rows={1}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleChat();
              }
            }}
          />
          <Button onClick={handleChat} disabled={isLoading || !chatInput.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
