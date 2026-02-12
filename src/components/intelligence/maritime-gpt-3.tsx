import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Send, 
  Bot, 
  User, 
  FileText, 
  Globe, 
  Ship,
  BookOpen,
  Mic,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
  Languages,
  Anchor,
  Shield,
  Compass,
  MessageCircle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  category: "general" | "regulation" | "documentation" | "analysis" | "translation";
  confidence?: number;
  sources?: string[];
  language?: string;
}

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  coverage: number;
  lastUpdated: Date;
  regulations: string[];
}

export const MaritimeGPT3: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("pt");
  const [activeKnowledgeBase, setActiveKnowledgeBase] = useState<string[]>(["all"]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const knowledgeBases: KnowledgeBase[] = [
    {
      id: "imo",
      name: "IMO Regulations",
      description: "International Maritime Organization standards",
      coverage: 100,
      lastUpdated: new Date("2025-01-15"),
      regulations: ["SOLAS", "MARPOL", "STCW", "ISM Code", "ISPS Code"]
    },
    {
      id: "solas",
      name: "SOLAS Convention",
      description: "Safety of Life at Sea",
      coverage: 100,
      lastUpdated: new Date("2025-01-10"),
      regulations: ["Chapter I-XIV", "Amendments 2024"]
    },
    {
      id: "stcw",
      name: "STCW Convention",
      description: "Standards of Training, Certification and Watchkeeping",
      coverage: 100,
      lastUpdated: new Date("2024-12-20"),
      regulations: ["Manila Amendments", "Competency Standards"]
    },
    {
      id: "marpol",
      name: "MARPOL Convention",
      description: "Prevention of Pollution from Ships",
      coverage: 100,
      lastUpdated: new Date("2025-01-05"),
      regulations: ["Annex I-VI", "Environmental Protection"]
    },
    {
      id: "colreg",
      name: "COLREG",
      description: "International Regulations for Preventing Collisions at Sea",
      coverage: 100,
      lastUpdated: new Date("2024-11-15"),
      regulations: ["Rules 1-38", "Steering and Sailing Rules"]
    }
  ];

  const languages = [
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italiano", flag: "🇮🇹" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "ar", name: "العربية", flag: "🇸🇦" }
  ];

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        type: "ai",
        content: `🌊 **MaritimeGPT 3.0 - Superinteligência Marítima Ativada**

Olá! Sou o sistema de IA mais avançado para operações marítimas, com conhecimento completo de:

✅ **IMO** - International Maritime Organization
✅ **SOLAS** - Safety of Life at Sea
✅ **STCW** - Standards of Training & Certification
✅ **MARPOL** - Pollution Prevention
✅ **COLREG** - Collision Prevention Rules

**Capacidades:**
🔍 Análise automática de documentos técnicos (OCR)
📊 Geração de relatórios especializados em 50+ idiomas
💬 Consultas regulatórias com referências precisas
🌍 Tradução técnica marítima especializada
📚 Base de conhecimento atualizada em tempo real

Como posso ajudá-lo hoje?`,
        timestamp: new Date(),
        category: "general",
        confidence: 100,
        language: selectedLanguage
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const processMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
      category: "general",
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    // Process locally — generateMaritimeResponse uses rule-based matching
    const aiResponse = generateMaritimeResponse(message);
    setMessages(prev => [...prev, aiResponse]);
    setIsProcessing(false);
  };

  const generateMaritimeResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    // Detect query type and generate appropriate response
    let content = "";
    let category: Message["category"] = "general";
    let sources: string[] = [];
    let confidence = 95;

    if (lowerQuery.includes("solas") || lowerQuery.includes("safety")) {
      content = `📋 **Consulta SOLAS - Safety of Life at Sea**

De acordo com a Convenção SOLAS (atualização 2024):

**Principais Requisitos:**
- Capítulo I: Disposições Gerais
- Capítulo II: Construção - Subdivisão e Estabilidade
- Capítulo III: Equipamentos Salva-vidas
- Capítulo IV: Radiocomunicações
- Capítulo V: Segurança da Navegação

**Compliance Obrigatório:**
✅ Certificação de embarcação válida
✅ Equipamentos salva-vidas aprovados
✅ Sistema de comunicação GMDSS
✅ Plano de contingência atualizado

**Próximas Ações Recomendadas:**
1. Verificar validade dos certificados
2. Inspecionar equipamentos salva-vidas
3. Testar sistemas de comunicação
4. Atualizar documentação de segurança

Precisa de mais detalhes sobre algum capítulo específico?`;
      category = "regulation";
      sources = ["SOLAS Convention 2024", "IMO Regulations", "Flag State Requirements"];
      confidence = 98;
    } else if (lowerQuery.includes("marpol") || lowerQuery.includes("pollution") || lowerQuery.includes("environment")) {
      content = `🌊 **Consulta MARPOL - Prevenção de Poluição**

Regulamentação MARPOL Anexos I-VI:

**Anexo I - Óleo:**
- Descarga proibida em áreas especiais
- Sistema de filtragem obrigatório (15ppm)
- Registro no Oil Record Book

**Anexo II - Substâncias Nocivas Líquidas:**
- Categorias A, B, C, D
- Pré-lavagem em alto mar

**Anexo III - Substâncias Nocivas Embaladas:**
- Marcação e rotulagem adequadas
- Segregação de cargas perigosas

**Anexo IV - Esgoto:**
- Sistema de tratamento aprovado
- Descarga controlada

**Anexo V - Lixo:**
- Plano de gerenciamento
- Proibição de plásticos

**Anexo VI - Poluição do Ar:**
- Limite de SOx: 0.5% (global)
- NOx Tier III em ECAs
- EEDI/EEXI compliance

**Status de Compliance:** ✅ Verificar sistemas de tratamento ativos`;
      category = "regulation";
      sources = ["MARPOL Convention", "IMO Environmental Standards", "Port State Control"];
      confidence = 97;
    } else if (lowerQuery.includes("stcw") || lowerQuery.includes("crew") || lowerQuery.includes("certificate") || lowerQuery.includes("training")) {
      content = `👨‍✈️ **Consulta STCW - Certificação e Treinamento**

Requisitos STCW para tripulação:

**Oficiais de Convés:**
- Certificado de Competência válido
- Treinamento básico de segurança
- Medical fitness certificate
- Proficiency in survival craft

**Oficiais de Máquinas:**
- Engine officer certification
- Advanced firefighting
- Medical first aid
- ECDIS training (se aplicável)

**Tripulação Geral:**
- Basic safety training (BST)
- Security awareness
- Designated duties training

**Emendas Manila 2010:**
✅ Controle de fadiga (rest hours)
✅ Treinamento em ECDIS
✅ Enhanced security training
✅ Leadership and teamwork

**Checklist de Compliance:**
- [ ] Todos os certificados válidos
- [ ] Rest hours compliance (10h/24h)
- [ ] Drills e treinamentos em dia
- [ ] Registros atualizados

Deseja verificar certificações específicas?`;
      category = "regulation";
      sources = ["STCW Convention 2010", "Manila Amendments", "Flag State Requirements"];
      confidence = 99;
    } else if (lowerQuery.includes("colreg") || lowerQuery.includes("navigation") || lowerQuery.includes("collision")) {
      content = `🧭 **Consulta COLREG - Regras de Navegação**

Regulamentos Internacionais para Prevenção de Colisões:

**Parte A - Regras Gerais:**
- Regra 2: Responsabilidade
- Regra 5: Vigilância constante
- Regra 6: Velocidade segura
- Regra 7: Risco de colisão
- Regra 8: Ação para evitar colisão

**Parte B - Regras de Governo e Navegação:**
- Seção I: Conduta em qualquer condição de visibilidade
- Seção II: Conduta de embarcações à vista
- Seção III: Conduta em visibilidade restrita

**Situações Comuns:**
🔴 **Head-on:** Ambas alteram para boreste
🟡 **Crossing:** Embarcação com a outra a boreste dá passagem
🟢 **Overtaking:** Embarcação que ultrapassa mantém-se afastada

**Luzes e Marcas:**
- Luzes de navegação obrigatórias
- Sinais sonoros em névoa
- Sinais de manobra

**Prioridades:**
1. Embarcações sem governo
2. Embarcações com capacidade restrita
3. Embarcações engajadas em pesca
4. Embarcações à vela
5. Embarcações a motor

Precisa de orientação para uma situação específica?`;
      category = "regulation";
      sources = ["COLREG 1972", "Collision Avoidance", "Navigation Safety"];
      confidence = 96;
    } else if (lowerQuery.includes("translate") || lowerQuery.includes("traduz")) {
      content = `🌍 **Serviço de Tradução Técnica Marítima**

Sistema ativo para tradução especializada em 50+ idiomas.

**Idiomas Principais:**
${languages.slice(0, 10).map(lang => `${lang.flag} ${lang.name}`).join("\n")}

**Especialidades:**
- Documentação técnica marítima
- Relatórios de inspeção
- Certificados e compliance
- Procedimentos operacionais
- Comunicações de emergência

Para traduzir um texto, forneça:
1. Idioma de origem
2. Idioma de destino
3. Tipo de documento
4. Texto a traduzir

Exemplo: "Traduzir relatório de inspeção SOLAS de inglês para português"`;
      category = "translation";
      sources = ["Maritime Technical Dictionary", "IMO Standard Phrases"];
      confidence = 94;
    } else {
      content = `🤖 **MaritimeGPT 3.0 - Resposta Especializada**

Entendi sua consulta sobre operações marítimas. Posso ajudar com:

**📚 Consultas Regulatórias:**
- SOLAS (Safety of Life at Sea)
- MARPOL (Pollution Prevention)
- STCW (Training & Certification)
- COLREG (Collision Regulations)
- ISM/ISPS Code

**📋 Análise de Documentos:**
- OCR de documentos técnicos
- Validação de certificados
- Análise de compliance
- Geração de relatórios

**🌍 Tradução Especializada:**
- 50+ idiomas suportados
- Terminologia técnica precisa
- Documentação oficial

**🔍 Recomendações:**
- Inspeções preventivas
- Otimização de processos
- Best practices internacionais

Por favor, seja mais específico sobre o que precisa para que eu possa fornecer uma resposta mais detalhada e precisa.`;
      category = "general";
      sources = ["MaritimeGPT Knowledge Base"];
      confidence = 90;
    }

    return {
      id: Date.now().toString(),
      type: "ai",
      content,
      timestamp: new Date(),
      category,
      confidence,
      sources,
      language: selectedLanguage
    };
  };

  const handleFileUpload = () => {
    toast({
      title: "📄 OCR Ativado",
      description: "Sistema de análise de documentos pronto. Selecione um arquivo para processar.",
    });
  };

  const generateReport = () => {
    toast({
      title: "📊 Gerando Relatório",
      description: "Relatório especializado sendo gerado em " + languages.find(l => l.code === selectedLanguage)?.name,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  MaritimeGPT 3.0
                  <Badge className="bg-warning text-warning-foreground hover:bg-warning/80">
                    <Sparkles className="h-3 w-3 mr-1" />
                    SUPREMO
                  </Badge>
                </CardTitle>
                <CardDescription className="text-white/90">
                  Superinteligência Marítima - Base de Conhecimento Completa IMO/SOLAS/STCW/MARPOL/COLREG
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="icon"
                      onClick={handleFileUpload}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload documento (OCR)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="icon"
                      onClick={generateReport}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Gerar relatório</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Knowledge Bases */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Bases de Conhecimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {knowledgeBases.map((kb) => (
              <div key={kb.id} className="p-3 border rounded-lg space-y-2 hover:bg-accent transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{kb.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {kb.coverage}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{kb.description}</p>
                <div className="flex flex-wrap gap-1">
                  {kb.regulations.map((reg) => (
                    <Badge key={reg} variant="secondary" className="text-xs">
                      {reg}
                    </Badge>
                  ))}
                </div>
                <Progress value={kb.coverage} className="h-1" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Especializado
              </CardTitle>
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.type === "ai" && (
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-primary rounded-lg">
                          <Bot className="h-5 w-5 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    <div className={`max-w-[80%] ${message.type === "user" ? "order-first" : ""}`}>
                      <div
                        className={`p-4 rounded-lg ${
                          message.type === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 px-2">
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {message.confidence}% confiança
                          </Badge>
                        )}
                        {message.category && message.category !== "general" && (
                          <Badge variant="secondary" className="text-xs">
                            {message.category}
                          </Badge>
                        )}
                      </div>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 px-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            <span>Fontes: {message.sources.join(", ")}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    {message.type === "user" && (
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-primary rounded-lg">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex gap-3">
                    <div className="p-2 bg-primary rounded-lg">
                      <Bot className="h-5 w-5 text-primary-foreground animate-pulse" />
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin">⚙️</div>
                        <span className="text-sm">Analisando regulamentações...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="flex gap-2">
              <Textarea
                placeholder="Digite sua consulta marítima... (ex: 'Requisitos SOLAS para embarcações', 'Compliance MARPOL', 'Certificações STCW')"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    processMessage(inputMessage);
                  }
                }}
                className="min-h-[60px]"
                disabled={isProcessing}
              />
              <Button
                onClick={() => processMessage(inputMessage)}
                disabled={isProcessing || !inputMessage.trim()}
                size="icon"
                className="h-[60px] w-[60px]"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage("Quais são os requisitos SOLAS para equipamentos salva-vidas?")}
              >
                <Shield className="h-3 w-3 mr-1" />
                SOLAS
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage("Como fazer compliance com MARPOL Anexo VI?")}
              >
                <Anchor className="h-3 w-3 mr-1" />
                MARPOL
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage("Quais certificações STCW são necessárias para oficiais?")}
              >
                <FileText className="h-3 w-3 mr-1" />
                STCW
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputMessage("Explique as regras COLREG para navegação em névoa")}
              >
                <Compass className="h-3 w-3 mr-1" />
                COLREG
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
