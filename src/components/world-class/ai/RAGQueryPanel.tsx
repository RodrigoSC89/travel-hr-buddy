/**
 * M007 - RAG Maritime Query Panel
 * Query maritime regulations with AI-powered answers and citations
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen, Search, Loader2, Scale, FileText, ChevronDown, 
  Sparkles, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RAGResult {
  answer: string;
  sources: string[];
  timestamp: string;
  question: string;
}

const REGULATION_OPTIONS = [
  { value: "", label: "Todas regulamentações" },
  { value: "SOLAS", label: "SOLAS" },
  { value: "MARPOL", label: "MARPOL" },
  { value: "MLC 2006", label: "MLC 2006" },
  { value: "STCW", label: "STCW" },
  { value: "ISM", label: "ISM Code" },
  { value: "ISPS", label: "ISPS Code" },
];

const QUICK_QUESTIONS = [
  "Quais são as horas mínimas de descanso segundo a MLC 2006?",
  "Requisitos STCW para Oficial de Navegação (OOW)?",
  "Limites de SOx conforme MARPOL Annex VI?",
  "Elementos obrigatórios do ISM Code para SMS?",
  "Requisitos de segurança ISPS para Security Level 2?",
  "Como calcular o CII rating conforme MARPOL?",
];

export const RAGQueryPanel: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [regulation, setRegulation] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);
  const [results, setResults] = useState<RAGResult[]>([]);
  const [expandedResult, setExpandedResult] = useState<number | null>(null);

  const handleQuery = async (q?: string) => {
    const queryText = q || question;
    if (!queryText.trim()) return;

    setIsQuerying(true);
    try {
      const { data, error } = await supabase.functions.invoke("rag-maritime-query", {
        body: {
          question: queryText,
          regulation: regulation || undefined,
          includeExamples: true,
        },
      });

      if (error) throw error;

      setResults(prev => [{
        answer: data.answer,
        sources: data.sources || [],
        timestamp: data.timestamp,
        question: queryText,
      }, ...prev]);

      setQuestion("");
      setExpandedResult(0);
    } catch (err) {
      console.error("RAG query error:", err);
      toast.error("Erro ao consultar regulamentações");
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-5 w-5 text-primary" />
          RAG Maritime Engine
          <Badge variant="outline" className="text-xs">M007</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Regulation filter */}
        <select
          value={regulation}
          onChange={(e) => setRegulation(e.target.value)}
          className="w-full h-9 px-3 rounded-md border bg-background text-sm"
        >
          {REGULATION_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Search input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            placeholder="Pergunte sobre regulamentações marítimas..."
            className="flex-1 h-9 px-3 rounded-md border bg-background text-sm"
            disabled={isQuerying}
          />
          <Button size="sm" onClick={() => handleQuery()} disabled={isQuerying || !question.trim()}>
            {isQuerying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {/* Quick questions */}
        {results.length === 0 && (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Perguntas rápidas:
            </p>
            <div className="flex flex-wrap gap-1">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setQuestion(q); handleQuery(q); }}
                  className="text-xs px-2 py-1 rounded-md border hover:bg-accent/50 transition-colors text-left"
                  disabled={isQuerying}
                >
                  {q.length > 50 ? q.substring(0, 50) + "..." : q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <ScrollArea className="h-[280px]">
            <div className="space-y-2">
              {results.map((result, i) => (
                <div key={i} className="rounded-lg border p-3 space-y-2">
                  <button
                    onClick={() => setExpandedResult(expandedResult === i ? null : i)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Scale className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm font-medium truncate">{result.question}</span>
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      expandedResult === i && "rotate-180"
                    )} />
                  </button>

                  {/* Sources */}
                  <div className="flex flex-wrap gap-1">
                    {result.sources.map((src, j) => (
                      <Badge key={j} variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {src}
                      </Badge>
                    ))}
                  </div>

                  {/* Answer */}
                  {expandedResult === i && (
                    <div className="mt-2 p-3 rounded-md bg-muted/50 text-sm whitespace-pre-wrap leading-relaxed">
                      {result.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default RAGQueryPanel;
