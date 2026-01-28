/**
 * Support Center - Central de Suporte
 * Nauti One v4.0 - Simplified Version
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HeadphonesIcon, MessageSquare, Ticket, HelpCircle, 
  Send, Clock, CheckCircle, AlertCircle, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpfulCount: number;
}

const SupportCenter = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'bot'; message: string }>>([]);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketDescription, setNewTicketDescription] = useState("");

  const tickets: SupportTicket[] = [
    { id: '1', subject: 'Problema de login', description: 'Não consigo acessar minha conta', category: 'technical', priority: 'high', status: 'in_progress', createdAt: '2026-01-28' },
    { id: '2', subject: 'Dúvida sobre relatórios', description: 'Como exportar relatórios em PDF?', category: 'general', priority: 'medium', status: 'resolved', createdAt: '2026-01-27' },
  ];

  const faqs: FAQItem[] = [
    { id: '1', question: 'Como faço login no sistema?', answer: 'Acesse a página de login e insira seu email e senha cadastrados. Se esqueceu a senha, clique em "Esqueci minha senha".', category: 'account', helpfulCount: 156 },
    { id: '2', question: 'Como adicionar um novo tripulante?', answer: 'Vá em RH & Pessoas > Gestão de Tripulação > Clique em "Adicionar Tripulante" e preencha os dados.', category: 'crew', helpfulCount: 89 },
    { id: '3', question: 'Como gerar relatórios de compliance?', answer: 'Acesse Auditorias > Reports Command e selecione o tipo de relatório desejado.', category: 'compliance', helpfulCount: 67 },
    { id: '4', question: 'O sistema funciona offline?', answer: 'Sim! O Nauti One possui modo offline. Os dados são sincronizados quando a conexão for restabelecida.', category: 'technical', helpfulCount: 124 },
  ];

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    setChatHistory(prev => [...prev, { role: 'user', message: chatMessage }]);
    
    // Simple bot response
    const response = chatMessage.toLowerCase().includes('login') 
      ? 'Para problemas de login, verifique se está usando o email correto. Se persistir, clique em "Esqueci minha senha".'
      : chatMessage.toLowerCase().includes('relatório')
      ? 'Para gerar relatórios, acesse o menu Relatórios & Documentos > Reports Command.'
      : 'Obrigado pela mensagem! Um de nossos atendentes irá responder em breve. Tempo médio de resposta: 2h.';
    
    setChatHistory(prev => [...prev, { role: 'bot', message: response }]);
    setChatMessage("");
  };

  const handleCreateTicket = () => {
    if (!newTicketSubject.trim() || !newTicketDescription.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    toast.success("Ticket criado com sucesso!");
    setNewTicketSubject("");
    setNewTicketDescription("");
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "default",
      in_progress: "secondary",
      resolved: "outline",
      closed: "outline"
    };
    const icons: Record<string, React.ReactNode> = {
      open: <AlertCircle className="h-3 w-3" />,
      in_progress: <Clock className="h-3 w-3" />,
      resolved: <CheckCircle className="h-3 w-3" />,
      closed: <CheckCircle className="h-3 w-3" />
    };
    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {icons[status]} {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HeadphonesIcon className="h-8 w-8 text-primary" />
            Support Center
          </h1>
          <p className="text-muted-foreground">Central de Suporte & Atendimento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tickets Abertos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {tickets.filter(t => t.status === 'open').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Em Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {tickets.filter(t => t.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {tickets.filter(t => t.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2.4h</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">💬 Chat Bot</TabsTrigger>
          <TabsTrigger value="tickets">🎫 Meus Tickets</TabsTrigger>
          <TabsTrigger value="new">➕ Novo Ticket</TabsTrigger>
          <TabsTrigger value="faq">❓ FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Assistente Virtual
              </CardTitle>
              <CardDescription>Chat 24/7 com nosso assistente</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-4 bg-muted/30 rounded-lg">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Olá! Como posso ajudar?</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                      <Button size="sm" variant="outline" onClick={() => setChatMessage("Como faço login?")}>Login</Button>
                      <Button size="sm" variant="outline" onClick={() => setChatMessage("Problema técnico")}>Problema técnico</Button>
                      <Button size="sm" variant="outline" onClick={() => setChatMessage("Relatórios")}>Relatórios</Button>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                        {msg.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Digite sua mensagem..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meus Tickets</CardTitle>
              <CardDescription>Acompanhe seus chamados</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Você não tem tickets abertos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Ticket className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{ticket.subject}</p>
                            <p className="text-sm text-muted-foreground">{ticket.createdAt}</p>
                          </div>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">{ticket.category}</Badge>
                        <Badge variant={ticket.priority === 'urgent' ? 'destructive' : ticket.priority === 'high' ? 'default' : 'secondary'}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abrir Novo Ticket</CardTitle>
              <CardDescription>Descreva seu problema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Assunto</label>
                <Input 
                  placeholder="Resumo do problema"
                  value={newTicketSubject}
                  onChange={(e) => setNewTicketSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea 
                  placeholder="Descreva detalhadamente..."
                  rows={6}
                  value={newTicketDescription}
                  onChange={(e) => setNewTicketDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateTicket} className="w-full">
                <Ticket className="h-4 w-4 mr-2" />
                Criar Ticket
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
              <CardDescription>Respostas para dúvidas comuns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {faqs.map((faq) => (
                  <Collapsible key={faq.id}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        <span className="font-medium text-left">{faq.question}</span>
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-4 py-3 bg-muted/30 rounded-b-lg border-x border-b">
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline">{faq.category}</Badge>
                        <span className="text-xs text-muted-foreground">{faq.helpfulCount} pessoas acharam útil</span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportCenter;
