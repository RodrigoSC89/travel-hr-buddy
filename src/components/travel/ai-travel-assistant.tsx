import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Plane,
  Upload,
  Download,
  Calendar,
  MapPin,
  Brain,
  FileText,
  QrCode,
  Printer,
  Mail,
  MessageSquare,
  Settings,
  TrendingUp,
  DollarSign,
  Clock,
  User,
  Shield,
  Zap,
  Globe,
  Star,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Plus,
  Bookmark,
  CreditCard,
} from "lucide-react";

interface TravelAssistantProps {
  className?: string;
}

interface TravelDocument {
  id: string;
  name: string;
  type: "passport" | "visa" | "ticket" | "hotel" | "insurance" | "other";
  url: string;
  expiryDate?: Date;
  status: "valid" | "expiring" | "expired";
  uploadDate: Date;
}

interface TravelInsight {
  id: string;
  type: "cost_saving" | "route_optimization" | "timing" | "alternative";
  title: string;
  description: string;
  impact: number;
  confidence: number;
  actionable: boolean;
}

interface PricePrediction {
  route: string;
  currentPrice: number;
  predictedPrice: number;
  trend: "rising" | "falling" | "stable";
  confidence: number;
  recommendation: string;
  bestBookingWindow: string;
}

export const AITravelAssistant: React.FC<TravelAssistantProps> = ({ className }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("assistant");
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [insights, setInsights] = useState<TravelInsight[]>([]);
  const [predictions, setPredictions] = useState<PricePrediction[]>([]);

  useEffect(() => {
    initializeAssistant();
  }, []);

  const initializeAssistant = () => {
    // Simular carregamento de dados
    loadMockData();
    generateInitialInsights();
  };

  const loadMockData = () => {
    const mockDocuments: TravelDocument[] = [
      {
        id: "1",
        name: "Passaporte Brasileiro",
        type: "passport",
        url: "/documents/passport.pdf",
        expiryDate: new Date("2028-06-15"),
        status: "valid",
        uploadDate: new Date("2024-01-10"),
      },
      {
        id: "2",
        name: "Bilhete LATAM - GRU/SDU",
        type: "ticket",
        url: "/documents/ticket-latam.pdf",
        status: "valid",
        uploadDate: new Date("2024-01-15"),
      },
      {
        id: "3",
        name: "Seguro Viagem",
        type: "insurance",
        url: "/documents/insurance.pdf",
        expiryDate: new Date("2024-12-31"),
        status: "valid",
        uploadDate: new Date("2024-01-08"),
      },
    ];
    setDocuments(mockDocuments);

    const mockPredictions: PricePrediction[] = [
      {
        route: "GRU-SDU",
        currentPrice: 299,
        predictedPrice: 259,
        trend: "falling",
        confidence: 0.85,
        recommendation: "Aguarde mais 2 semanas para comprar. Preços devem cair 13%.",
        bestBookingWindow: "15-30 dias antes da viagem",
      },
      {
        route: "GRU-MAD",
        currentPrice: 2890,
        predictedPrice: 3200,
        trend: "rising",
        confidence: 0.78,
        recommendation: "Compre agora! Preços devem subir nos próximos dias.",
        bestBookingWindow: "Imediatamente",
      },
    ];
    setPredictions(mockPredictions);
  };

  const generateInitialInsights = () => {
    const mockInsights: TravelInsight[] = [
      {
        id: "1",
        type: "cost_saving",
        title: "Economia Identificada",
        description: "Alterando seu voo para terça-feira, você pode economizar R$ 150",
        impact: 150,
        confidence: 0.9,
        actionable: true,
      },
      {
        id: "2",
        type: "route_optimization",
        title: "Rota Alternativa",
        description: "Conexão via Brasília pode ser 20% mais barata",
        impact: 200,
        confidence: 0.75,
        actionable: true,
      },
      {
        id: "3",
        type: "timing",
        title: "Melhor Momento",
        description: "Preços para Europa estão 15% abaixo da média histórica",
        impact: 500,
        confidence: 0.85,
        actionable: true,
      },
    ];
    setInsights(mockInsights);
  };

  const handleChatMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    const userMessage = { role: "user", content: message, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage("");

    try {
      // Simular resposta da IA
      setTimeout(() => {
        const responses = [
          "Posso ajudar você a encontrar os melhores preços de passagens. Para onde você gostaria de viajar?",
          "Com base nos seus dados, recomendo aguardar 2 semanas para comprar passagens para o Rio de Janeiro. Os preços devem cair 13%.",
          "Encontrei 3 opções de hotéis com excelente custo-benefício na sua data. Gostaria de ver as sugestões?",
          "Seu passaporte está válido até 2028. Para viagens internacionais, recomendo verificar se o destino exige visto.",
          "Analisando seu histórico de viagens, identifiquei que você pode economizar R$ 800 por ano escolhendo melhor os dias da semana.",
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const aiMessage = {
          role: "assistant",
          content: randomResponse,
          timestamp: new Date(),
        };

        setChatMessages(prev => [...prev, aiMessage]);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error("Erro no chat:", error);
      setIsProcessing(false);
    }
  };

  const handleDocumentUpload = async (file: File) => {
    try {
      toast({
        title: "Processando documento...",
        description: "Analisando com IA",
      });

      // Simular upload e análise
      setTimeout(() => {
        const newDoc: TravelDocument = {
          id: Date.now().toString(),
          name: file.name,
          type: "other",
          url: URL.createObjectURL(file),
          status: "valid",
          uploadDate: new Date(),
        };

        setDocuments(prev => [newDoc, ...prev]);
        toast({
          title: "Documento carregado!",
          description: "Análise IA completa",
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const exportTravelPlan = () => {
    toast({
      title: "Exportando plano...",
      description: "Gerando PDF com QR codes",
    });

    setTimeout(() => {
      toast({
        title: "Plano exportado!",
        description: "PDF salvo em Downloads",
      });
    }, 1500);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "falling":
        return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      default:
        return <BarChart3 className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "expiring":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "passport":
        return "🛂";
      case "visa":
        return "📋";
      case "ticket":
        return "✈️";
      case "hotel":
        return "🏨";
      case "insurance":
        return "🛡️";
      default:
        return "📄";
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Assistente IA de Viagens</h1>
            <p className="text-purple-100">
              Inteligência artificial para otimizar suas viagens corporativas
            </p>
          </div>
          <Brain className="h-12 w-12 text-purple-200" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-4xl">
          <TabsTrigger value="assistant" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat IA
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predições
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </TabsTrigger>
        </TabsList>

        {/* Chat IA */}
        <TabsContent value="assistant">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Assistente Inteligente
              </CardTitle>
              <CardDescription>
                Converse com a IA sobre planejamento de viagens, preços e dicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[500px]">
                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-lg mb-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Brain className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Olá! Sou seu assistente de viagens
                      </h3>
                      <p>Posso ajudar com:</p>
                      <div className="grid grid-cols-2 gap-2 mt-4 max-w-md mx-auto">
                        <Badge variant="outline">Preços de passagens</Badge>
                        <Badge variant="outline">Hotéis</Badge>
                        <Badge variant="outline">Documentos</Badge>
                        <Badge variant="outline">Roteiros</Badge>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-background border"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <span className="text-xs opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-background border p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                          <span className="text-sm">IA analisando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Digite sua pergunta sobre viagens..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && handleChatMessage(newMessage)}
                    disabled={isProcessing}
                  />
                  <Button
                    onClick={() => handleChatMessage(newMessage)}
                    disabled={isProcessing || !newMessage.trim()}
                    size="sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Economia Potencial</p>
                      <p className="text-2xl font-bold text-green-600">R$ 850</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Insights Ativos</p>
                      <p className="text-2xl font-bold">{insights.length}</p>
                    </div>
                    <Brain className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Precisão IA</p>
                      <p className="text-2xl font-bold">87%</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Insights Personalizados</CardTitle>
                <CardDescription>Recomendações baseadas em seus padrões de viagem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map(insight => (
                    <div key={insight.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            +R$ {insight.impact}
                          </div>
                          <Badge variant="outline">
                            {Math.round(insight.confidence * 100)}% confiança
                          </Badge>
                        </div>
                      </div>
                      {insight.actionable && (
                        <Button size="sm" variant="outline">
                          <Zap className="h-3 w-3 mr-1" />
                          Aplicar Sugestão
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predições */}
        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Predições de Preços
              </CardTitle>
              <CardDescription>
                Análise preditiva de preços para suas rotas favoritas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {predictions.map((prediction, index) => (
                  <div key={index} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{prediction.route}</h3>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(prediction.trend)}
                        <Badge
                          variant={
                            prediction.trend === "falling"
                              ? "default"
                              : prediction.trend === "rising"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {prediction.trend === "falling"
                            ? "Caindo"
                            : prediction.trend === "rising"
                              ? "Subindo"
                              : "Estável"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-bold">R$ {prediction.currentPrice}</div>
                        <div className="text-xs text-muted-foreground">Preço Atual</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-bold">R$ {prediction.predictedPrice}</div>
                        <div className="text-xs text-muted-foreground">Preço Previsto</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-bold">
                          {Math.round(
                            ((prediction.predictedPrice - prediction.currentPrice) /
                              prediction.currentPrice) *
                              100
                          )}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground">Variação</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-bold">
                          {Math.round(prediction.confidence * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">Confiança</div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">🤖 Recomendação da IA</h4>
                      <p className="text-blue-800 text-sm mb-2">{prediction.recommendation}</p>
                      <p className="text-blue-600 text-xs">
                        Melhor janela de compra: {prediction.bestBookingWindow}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gestão de Documentos Inteligente
              </CardTitle>
              <CardDescription>
                Upload, validação automática e alertas de vencimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload de Documentos</h3>
                  <p className="text-muted-foreground mb-4">
                    A IA validará automaticamente seus documentos
                  </p>
                  <input
                    type="file"
                    id="doc-upload"
                    className="hidden"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(handleDocumentUpload);
                    }}
                  />
                  <Button onClick={() => document.getElementById("doc-upload")?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivos
                  </Button>
                </div>

                {/* Documents List */}
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getDocumentIcon(doc.type)}</span>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.type} • Enviado em {doc.uploadDate.toLocaleDateString()}
                            {doc.expiryDate && ` • Vence em ${doc.expiryDate.toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            doc.status === "valid"
                              ? "default"
                              : doc.status === "expiring"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {getStatusIcon(doc.status)}
                          <span className="ml-1">
                            {doc.status === "valid"
                              ? "Válido"
                              : doc.status === "expiring"
                                ? "Vencendo"
                                : "Expirado"}
                          </span>
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export */}
        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Plano de Viagem</CardTitle>
                <CardDescription>Gere PDFs com QR codes e informações completas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={exportTravelPlan} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF Completo
                </Button>
                <Button variant="outline" className="w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code Check-in
                </Button>
                <Button variant="outline" className="w-full">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Itinerário
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar por Email
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integração com Apps</CardTitle>
                <CardDescription>Conecte com aplicativos de companhias aéreas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  LATAM Pass
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  GOL Smiles
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Azul TudoAzul
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Notificações
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
