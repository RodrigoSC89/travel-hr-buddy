/**
 * Natural Language Interface - Execute commands via text/voice
 */

import { memo, memo, useEffect, useRef, useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Mic, 
  MicOff, 
  Send, 
  Terminal, 
  Sparkles,
  Ship,
  Users,
  Wrench,
  Package,
  GraduationCap,
  Shield,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { motion, AnimatePresence } from "framer-motion";

interface CommandResult {
  id: string;
  command: string;
  response: string;
  module: string;
  status: "success" | "error" | "pending";
  timestamp: Date;
  actions?: { label: string; action: string }[];
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  vessel: <Ship className="h-4 w-4" />,
  crew: <Users className="h-4 w-4" />,
  maintenance: <Wrench className="h-4 w-4" />,
  procurement: <Package className="h-4 w-4" />,
  training: <GraduationCap className="h-4 w-4" />,
  qhse: <Shield className="h-4 w-4" />,
  finance: <TrendingUp className="h-4 w-4" />,
  general: <Terminal className="h-4 w-4" />,
};

const SUGGESTED_COMMANDS = [
  { text: "Mostre embarcações com manutenção pendente", module: "maintenance" },
  { text: "Quais certificados vencem este mês?", module: "crew" },
  { text: "Resuma o status operacional da frota", module: "vessel" },
  { text: "Liste tripulantes disponíveis para embarque", module: "crew" },
  { text: "Analise consumo de combustível do último mês", module: "vessel" },
  { text: "Gere relatório de compliance QHSE", module: "qhse" },
];

export const NaturalLanguageInterface = memo(function() {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [results, setResults] = useState<CommandResult[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { analyze, isLoading } = useNautilusAI();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [results]);

  const detectModule = (command: string): string => {
    const lower = command.toLowerCase();
    if (lower.includes("embarcação") || lower.includes("navio") || lower.includes("frota") || lower.includes("combustível")) return "vessel";
    if (lower.includes("tripul") || lower.includes("certificado") || lower.includes("embarque")) return "crew";
    if (lower.includes("manutenção") || lower.includes("reparo") || lower.includes("equipamento")) return "maintenance";
    if (lower.includes("compra") || lower.includes("fornecedor") || lower.includes("estoque")) return "procurement";
    if (lower.includes("treinamento") || lower.includes("curso") || lower.includes("capacitação")) return "training";
    if (lower.includes("qhse") || lower.includes("segurança") || lower.includes("compliance")) return "qhse";
    if (lower.includes("financ") || lower.includes("custo") || lower.includes("orçamento")) return "finance";
    return "general";
  };

  const executeCommand = async (command: string) => {
    if (!command.trim()) return;

    const module = detectModule(command);
    const pendingResult: CommandResult = {
      id: Date.now().toString(),
      command,
      response: "",
      module,
      status: "pending",
      timestamp: new Date(),
    };

    setResults(prev => [...prev, pendingResult]);
    setInput("");

    try {
      const response = await analyze(
        module as unknown,
        command,
        { command, module, timestamp: new Date().toISOString() }
      );

      setResults(prev =>
        prev.map(r =>
          r.id === pendingResult.id
            ? {
              ...r,
              response: response?.response || "Comando processado com sucesso.",
              status: "success" as const,
              actions: [
                { label: "Ver detalhes", action: "view" },
                { label: "Exportar", action: "export" },
              ],
            }
            : r
        )
      );
    } catch (error) {
      setResults(prev =>
        prev.map(r =>
          r.id === pendingResult.id
            ? {
              ...r,
              response: "Erro ao processar comando. Tente novamente.",
              status: "error",
            }
            : r
        )
      );
    }
  };

  const toggleVoice = () => {
    if (!isListening) {
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = (window as unknown).webkitSpeechRecognition || (window as unknown).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "pt-BR";
        recognition.onresult = (event: Event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognition.start();
        setIsListening(true);
      }
    } else {
      setIsListening(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          Interface de Linguagem Natural
          <Badge variant="outline" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Command Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && executeCommand(input)}
              placeholder="Digite um comando em linguagem natural..."
              className="pr-10"
              disabled={isLoading}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={toggleVoice}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 text-destructive animate-pulse" />
              ) : (
                <Mic className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <Button onClick={() => handleexecuteCommand} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        {/* Suggested Commands */}
        {results.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Comandos sugeridos:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_COMMANDS.slice(0, 4).map((cmd, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleexecuteCommand}
                >
                  {MODULE_ICONS[cmd.module]}
                  <span className="ml-1 truncate max-w-[200px]">{cmd.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <ScrollArea className="h-[300px]" ref={scrollRef}>
          <AnimatePresence>
            {results.map((result) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 space-y-2"
              >
                {/* User Command */}
                <div className="flex items-start gap-2 justify-end">
                  <div className="bg-primary/10 rounded-lg px-3 py-2 max-w-[80%]">
                    <p className="text-sm">{result.command}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    {MODULE_ICONS[result.module]}
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2 max-w-[80%]">
                    {result.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Processando...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          {result.status === "success" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-destructive" />
                          )}
                          <Badge variant="outline" className="text-[10px]">
                            {result.module}
                          </Badge>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{result.response}</p>
                        {result.actions && (
                          <div className="flex gap-2 mt-2">
                            {result.actions.map((action, i) => (
                              <Button key={i} variant="ghost" size="sm" className="h-6 text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
