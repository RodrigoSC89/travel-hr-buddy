import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Send, 
  Ship, 
  FileText, 
  Globe, 
  Book,
  AlertCircle,
  CheckCircle,
  Sparkles,
  MessageSquare,
  Database
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  category?: 'imo' | 'solas' | 'stcw' | 'marpol' | 'general';
  confidence?: number;
}

interface KnowledgeBase {
  imo: string[];
  solas: string[];
  stcw: string[];
  marpol: string[];
}

const MaritimeGPT: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('pt');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const knowledgeBase: KnowledgeBase = {
    imo: [
      'Organização Marítima Internacional - Regulamentos e convenções',
      'Códigos de segurança marítima',
      'Padrões internacionais de navegação'
    ],
    solas: [
      'Safety of Life at Sea - Convenção internacional',
      'Requisitos de segurança para embarcações',
      'Equipamentos de salva-vidas obrigatórios'
    ],
    stcw: [
      'Standards of Training, Certification and Watchkeeping',
      'Requisitos de certificação para marítimos',
      'Padrões de treinamento internacional'
    ],
    marpol: [
      'Convenção Internacional para Prevenção da Poluição por Navios',
      'Anexos I-VI sobre diferentes tipos de poluição',
      'Requisitos de gestão ambiental'
    ]
  };

  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: '🌊 Olá! Sou o MaritimeGPT, seu assistente especializado em regulamentações marítimas internacionais. Posso ajudá-lo com questões sobre IMO, SOLAS, STCW, MARPOL e muito mais. Como posso auxiliá-lo hoje?',
      timestamp: new Date(),
      category: 'general',
      confidence: 100
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    setTimeout(() => {
      const aiResponse = generateMaritimeResponse(input);
      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 1000);
  };

  const generateMaritimeResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    let category: 'imo' | 'solas' | 'stcw' | 'marpol' | 'general' = 'general';
    let response = '';
    let confidence = 85;

    if (lowerQuery.includes('imo') || lowerQuery.includes('organização')) {
      category = 'imo';
      response = '📋 Sobre IMO (International Maritime Organization):\n\n' +
        '• Agência especializada das Nações Unidas\n' +
        '• Responsável por segurança e proteção ambiental marítima\n' +
        '• Desenvolve convenções e códigos internacionais\n' +
        '• 175 Estados-membros atualmente\n\n' +
        'Principais convenções: SOLAS, MARPOL, STCW, COLREG, Load Lines';
      confidence = 95;
    } else if (lowerQuery.includes('solas') || lowerQuery.includes('segurança') || lowerQuery.includes('vida')) {
      category = 'solas';
      response = '🛟 SOLAS (Safety of Life at Sea):\n\n' +
        '• Tratado internacional mais importante sobre segurança marítima\n' +
        '• Estabelece padrões mínimos de construção, equipamento e operação\n' +
        '• Capítulos cobrem: construção, combate a incêndio, salva-vidas, radiocomunicações\n' +
        '• ISM Code e ISPS Code são partes do SOLAS\n\n' +
        'Última atualização: Emendas 2020-2024';
      confidence = 92;
    } else if (lowerQuery.includes('stcw') || lowerQuery.includes('certificação') || lowerQuery.includes('treinamento')) {
      category = 'stcw';
      response = '🎓 STCW (Standards of Training, Certification and Watchkeeping):\n\n' +
        '• Convenção sobre padrões de treinamento, certificação e serviço de quarto\n' +
        '• Estabelece qualificações mínimas para marítimos\n' +
        '• Certificados reconhecidos internacionalmente\n' +
        '• Requisitos de atualização e revalidação\n\n' +
        'Emendas Manila 2010: Requisitos modernizados';
      confidence = 90;
    } else if (lowerQuery.includes('marpol') || lowerQuery.includes('poluição') || lowerQuery.includes('ambiental')) {
      category = 'marpol';
      response = '🌍 MARPOL (Marine Pollution Convention):\n\n' +
        '• Prevenção da poluição marítima por navios\n' +
        '• Anexo I: Óleo\n' +
        '• Anexo II: Substâncias líquidas nocivas a granel\n' +
        '• Anexo III: Substâncias perigosas em forma embalada\n' +
        '• Anexo IV: Esgoto\n' +
        '• Anexo V: Lixo\n' +
        '• Anexo VI: Poluição do ar e gases de efeito estufa\n\n' +
        'IMO 2020: Limite de 0.5% de enxofre no combustível';
      confidence = 93;
    } else if (lowerQuery.includes('documento') || lowerQuery.includes('relatório')) {
      response = '📄 Análise de Documentos Técnicos:\n\n' +
        'Posso analisar e interpretar:\n' +
        '• Certificados de navegação\n' +
        '• Relatórios de inspeção\n' +
        '• Documentos de compliance\n' +
        '• Planos de segurança\n' +
        '• Manuais operacionais\n\n' +
        'Por favor, forneça o tipo específico de documento para análise detalhada.';
      confidence = 88;
    } else {
      response = '🤖 Posso ajudá-lo com:\n\n' +
        '• Regulamentações IMO e convenções internacionais\n' +
        '• Requisitos SOLAS de segurança\n' +
        '• Certificações STCW para tripulação\n' +
        '• Compliance MARPOL ambiental\n' +
        '• Análise de documentos técnicos\n' +
        '• Geração de relatórios especializados\n\n' +
        'Pergunta: "' + query + '"\n' +
        'Por favor, seja mais específico sobre qual área marítima você precisa de ajuda.';
      confidence = 75;
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      category,
      confidence
    };
  };

  const quickQuestions = [
    { text: 'O que é SOLAS?', category: 'solas' },
    { text: 'Requisitos STCW para oficiais', category: 'stcw' },
    { text: 'MARPOL Anexo VI - Emissões', category: 'marpol' },
    { text: 'Como gerar relatório de compliance?', category: 'general' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            MaritimeGPT
          </h1>
          <p className="text-muted-foreground mt-1">
            Assistente IA Especializado em Regulamentações Marítimas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            Base: IMO, SOLAS, STCW, MARPOL
          </Badge>
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="pt">🇧🇷 Português</option>
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Español</option>
            <option value="fr">🇫🇷 Français</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Chat MaritimeGPT
              </CardTitle>
              <CardDescription>
                Pergunte sobre regulamentações, análise documentos, gere relatórios
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && (
                            <Brain className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="whitespace-pre-line text-sm">{message.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                              {message.category && message.category !== 'general' && (
                                <Badge variant="secondary" className="text-xs">
                                  {message.category.toUpperCase()}
                                </Badge>
                              )}
                              {message.confidence && (
                                <span className="text-xs opacity-70">
                                  {message.confidence}% confiança
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 animate-pulse" />
                          <span className="text-sm">Processando...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Pergunte sobre regulamentações marítimas..."
                  disabled={isProcessing}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={isProcessing || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Perguntas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickQuestions.map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => setInput(q.text)}
                >
                  <span className="text-xs">{q.text}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Book className="h-4 w-4" />
                Base de Conhecimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="imo" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="imo" className="text-xs">IMO</TabsTrigger>
                  <TabsTrigger value="solas" className="text-xs">SOLAS</TabsTrigger>
                </TabsList>
                <TabsContent value="imo" className="space-y-2">
                  {knowledgeBase.imo.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-green-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="solas" className="space-y-2">
                  {knowledgeBase.solas.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 mt-0.5 text-green-600" />
                      <span>{item}</span>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Capacidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Análise de documentos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Geração de relatórios</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Suporte multilíngue</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Base IMO atualizada</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaritimeGPT;
