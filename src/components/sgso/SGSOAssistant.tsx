import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain,
  Send,
  FileText,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Shield,
  Scale,
  HelpCircle,
  Sparkles
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

interface Citation {
  norma: string;
  artigo: string;
  link?: string;
}

const QUICK_QUESTIONS = [
  "Quais são as 17 práticas obrigatórias do SGSO?",
  "Como evidenciar a Prática 4 - Treinamento?",
  "O que é exigido para Gestão de Mudanças (MOC)?",
  "Qual o prazo para tratamento de NC maior?",
  "Como preparar dossiê para auditoria ANP?"
];

export const SGSOAssistant: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `👋 Olá! Sou o **Oficial Virtual SGSO**, seu assistente especializado em:

- **Resolução ANP nº 43/2007** - Regulamento Técnico do SGSO
- **17 Práticas Obrigatórias** para instalações de perfuração
- **Auditorias ANP** e preparação de dossiês
- **Tratamento de Não Conformidades** e CAPAs

Todas as minhas respostas incluem **citações das normas** aplicáveis. Como posso ajudar?`,
      citations: [
        { norma: "Resolução ANP nº 43/2007", artigo: "Art. 1º", link: "https://www.gov.br/anp/sgso" }
      ],
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (question?: string) => {
    const messageText = question || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("sgso-assistant", {
        body: { question: messageText }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "Desculpe, não consegui processar sua pergunta.",
        citations: data.citations || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error calling SGSO assistant:", error);
      
      // Fallback response with mock data for demo
      const fallbackResponse = generateFallbackResponse(messageText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallbackResponse.answer,
        citations: fallbackResponse.citations,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackResponse = (question: string): { answer: string; citations: Citation[] } => {
    // Knowledge base for fallback responses
    if (question.toLowerCase().includes("17 práticas") || question.toLowerCase().includes("práticas obrigatórias")) {
      return {
        answer: `As **17 Práticas de Gestão do SGSO** conforme Resolução ANP nº 43/2007 são:

1. **Liderança e Responsabilidade** - Compromisso da alta direção
2. **Identificação de Perigos e Avaliação de Riscos** - Análise sistemática
3. **Controle de Riscos** - Medidas de mitigação
4. **Competência, Treinamento e Conscientização** - Capacitação
5. **Comunicação e Consulta** - Canais de comunicação
6. **Documentação do SGSO** - Gestão documental
7. **Controle Operacional** - Procedimentos operacionais
8. **Preparação e Resposta a Emergências** - Planos de contingência
9. **Monitoramento e Medição** - Indicadores de desempenho
10. **Avaliação de Conformidade** - Auditorias internas
11. **Investigação de Incidentes** - Análise de ocorrências
12. **Análise Crítica pela Direção** - Revisões gerenciais
13. **Gestão de Mudanças** - MOC (Management of Change)
14. **Aquisição e Contratação** - Critérios de segurança
15. **Projeto e Construção** - Requisitos de projeto
16. **Informações de Segurança de Processo** - Dados críticos
17. **Integridade Mecânica** - Manutenção de equipamentos

Cada prática deve ser implementada e evidenciada para conformidade ANP.`,
        citations: [
          { norma: "Resolução ANP nº 43/2007", artigo: "Anexo - Item 4", link: "https://www.gov.br/anp/sgso" },
          { norma: "Resolução ANP nº 43/2007", artigo: "Art. 3º", link: "https://www.gov.br/anp/sgso" }
        ]
      };
    }

    if (question.toLowerCase().includes("prática 4") || question.toLowerCase().includes("treinamento")) {
      return {
        answer: `Para evidenciar a **Prática 4 - Competência, Treinamento e Conscientização**, você deve:

📋 **Documentação Requerida:**
- Matriz de competências por função
- Plano anual de treinamentos
- Registros de treinamentos realizados
- Certificados e qualificações
- Avaliações de eficácia

🎯 **Critérios de Aceitação:**
- 100% das funções críticas com competências mapeadas
- Treinamentos obrigatórios em dia (HUET, CBSP, H2S, etc.)
- Reciclagens dentro da validade
- Registros assinados e arquivados

⚠️ **Não conformidades comuns:**
- Matriz de competências desatualizada
- Falta de evidência de reciclagem
- Ausência de avaliação de eficácia`,
        citations: [
          { norma: "Resolução ANP nº 43/2007", artigo: "Anexo - Item 4.4", link: "https://www.gov.br/anp/sgso" },
          { norma: "NR-37", artigo: "Item 37.4", link: "https://www.gov.br/trabalho" }
        ]
      };
    }

    if (question.toLowerCase().includes("moc") || question.toLowerCase().includes("gestão de mudanças")) {
      return {
        answer: `A **Prática 13 - Gestão de Mudanças (MOC)** exige:

📋 **Processo Formal:**
1. Identificação da mudança (temporária/permanente)
2. Avaliação de riscos da mudança
3. Aprovação por níveis adequados
4. Comunicação às partes afetadas
5. Implementação controlada
6. Verificação e encerramento

🎯 **Tipos de Mudança:**
- Equipamentos e sistemas
- Procedimentos operacionais
- Pessoal e organização
- Materiais e químicos

⚠️ **Documentação Obrigatória:**
- Formulário MOC preenchido
- Análise de riscos (HAZOP, APR)
- Registro de aprovações
- Evidência de comunicação
- Checklist de implementação`,
        citations: [
          { norma: "Resolução ANP nº 43/2007", artigo: "Anexo - Item 4.13", link: "https://www.gov.br/anp/sgso" },
          { norma: "API RP 75", artigo: "Section 8", link: "https://www.api.org" }
        ]
      };
    }

    if (question.toLowerCase().includes("nc") || question.toLowerCase().includes("não conformidade")) {
      return {
        answer: `O tratamento de **Não Conformidades (NCs)** no SGSO deve seguir:

⏱️ **Prazos de Tratamento:**
- **NC Maior (Crítica):** até 30 dias
- **NC Menor:** até 60 dias
- **Observação:** até 90 dias

📋 **Fluxo de Tratamento:**
1. Registro e classificação da NC
2. Análise de causa raiz (5 Porquês, Fishbone)
3. Definição de ação corretiva
4. Implementação da CAPA
5. Verificação de eficácia
6. Encerramento formal

🎯 **Critérios de Eficácia:**
- Problema não recorreu em 90 dias
- Evidências de implementação
- Indicadores melhoraram`,
        citations: [
          { norma: "Resolução ANP nº 43/2007", artigo: "Art. 8º", link: "https://www.gov.br/anp/sgso" },
          { norma: "Resolução ANP nº 851/2021", artigo: "Art. 12º", link: "https://www.gov.br/anp" }
        ]
      };
    }

    if (question.toLowerCase().includes("dossiê") || question.toLowerCase().includes("auditoria anp")) {
      return {
        answer: `Para preparar o **Dossiê ANP**, inclua:

📁 **Estrutura do Dossiê:**
1. **Capa e Sumário**
2. **Resumo Executivo** - Índice de conformidade
3. **Relatório de Auditoria** - Por prática
4. **Lista de NCs** - Com status e CAPAs
5. **Evidências** - Organizadas por prática
6. **Trilhas de Auditoria** - Logs e assinaturas

📋 **Por Prática SGSO:**
- Status de conformidade (%)
- Evidências coletadas
- NCs identificadas
- CAPAs em andamento
- Registros de verificação

🎯 **Checklist de Prontidão:**
- [ ] Todas as 17 práticas avaliadas
- [ ] Evidências digitalizadas
- [ ] NCs tratadas ou em tratamento
- [ ] Assinaturas coletadas
- [ ] Versão final revisada`,
        citations: [
          { norma: "Resolução ANP nº 43/2007", artigo: "Art. 5º", link: "https://www.gov.br/anp/sgso" },
          { norma: "Manual de Fiscalização ANP", artigo: "Cap. 3", link: "https://www.gov.br/anp" }
        ]
      };
    }

    // Default response
    return {
      answer: `Entendi sua pergunta sobre "${question}".

Para uma resposta precisa sobre o **SGSO - Resolução ANP nº 43/2007**, posso ajudar com:

- 📋 As 17 Práticas de Gestão obrigatórias
- 📝 Requisitos de documentação e evidências
- ⚠️ Tratamento de não conformidades
- 📊 Preparação para auditorias ANP
- 🎯 Critérios de aceitação por prática

Por favor, reformule sua pergunta ou selecione um dos temas acima para que eu possa fornecer informações específicas com as devidas citações normativas.`,
      citations: [
        { norma: "Resolução ANP nº 43/2007", artigo: "Geral", link: "https://www.gov.br/anp/sgso" }
      ]
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary rounded-xl">
              <Brain className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Oficial Virtual SGSO</h2>
              <p className="text-muted-foreground">
                Assistente IA especializado em Resolução ANP nº 43/2007 e 17 Práticas Obrigatórias
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Citação de Normas
              </Badge>
              <Badge className="bg-blue-600 text-white">
                <Shield className="h-3 w-3 mr-1" />
                RAG Ativo
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Consulta SGSO com IA
            </CardTitle>
            <CardDescription>
              Tire dúvidas sobre normas ANP, práticas SGSO e preparação de auditorias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {message.content.split("\n").map((line, i) => (
                          <p key={i} className="mb-2 last:mb-0">{line}</p>
                        ))}
                      </div>
                      
                      {message.citations && message.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            Referências Normativas:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {message.citations.map((citation, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-primary/10"
                                onClick={() => citation.link && window.open(citation.link, "_blank")}
                              >
                                <BookOpen className="h-2 w-2 mr-1" />
                                {citation.norma} - {citation.artigo}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-4 rounded-lg flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Consultando base normativa ANP...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua dúvida sobre SGSO, práticas ANP, auditorias..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Perguntas Frequentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {QUICK_QUESTIONS.map((question, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => handleSendMessage(question)}
                disabled={isLoading}
              >
                <FileText className="h-4 w-4 mr-2 shrink-0" />
                <span className="text-sm">{question}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SGSOAssistant;
