import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, 
  BookOpen, 
  MessageSquare, 
  Video, 
  Download, 
  Search, 
  ExternalLink,
  Phone,
  Mail,
  Clock,
  Star,
  ChevronRight,
  FileText,
  Lightbulb,
  Users,
  Settings,
  Zap
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  rating: number;
  views: number;
}

interface VideoTutorial {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: BookOpen },
    { id: 'getting-started', name: 'Primeiros Passos', icon: Lightbulb },
    { id: 'user-management', name: 'Gestão de Usuários', icon: Users },
    { id: 'certificates', name: 'Certificados', icon: FileText },
    { id: 'reports', name: 'Relatórios', icon: FileText },
    { id: 'integration', name: 'Integrações', icon: Zap },
    { id: 'settings', name: 'Configurações', icon: Settings }
  ];

  const articles: Article[] = [
    {
      id: '1',
      title: 'Como criar um novo usuário no sistema',
      description: 'Guia passo a passo para adicionar novos usuários e configurar permissões',
      category: 'user-management',
      readTime: 5,
      rating: 4.8,
      views: 1250
    },
    {
      id: '2',
      title: 'Configurando alertas de certificados',
      description: 'Configure notificações automáticas para certificados próximos do vencimento',
      category: 'certificates',
      readTime: 8,
      rating: 4.9,
      views: 890
    },
    {
      id: '3',
      title: 'Gerando relatórios financeiros',
      description: 'Como criar e personalizar relatórios financeiros detalhados',
      category: 'reports',
      readTime: 12,
      rating: 4.7,
      views: 650
    },
    {
      id: '4',
      title: 'Primeiros passos no Nautilus One',
      description: 'Guia completo para novos usuários começarem a usar o sistema',
      category: 'getting-started',
      readTime: 15,
      rating: 4.9,
      views: 2100
    },
    {
      id: '5',
      title: 'Configurando integrações com Zapier',
      description: 'Como conectar o sistema com outras ferramentas através do Zapier',
      category: 'integration',
      readTime: 10,
      rating: 4.6,
      views: 420
    }
  ];

  const videoTutorials: VideoTutorial[] = [
    {
      id: '1',
      title: 'Visão Geral do Sistema',
      duration: '15:30',
      thumbnail: '/placeholder-video-1.jpg',
      category: 'getting-started',
      level: 'beginner'
    },
    {
      id: '2',
      title: 'Gestão Avançada de Certificados',
      duration: '22:45',
      thumbnail: '/placeholder-video-2.jpg',
      category: 'certificates',
      level: 'intermediate'
    },
    {
      id: '3',
      title: 'Configurações Avançadas do Sistema',
      duration: '18:20',
      thumbnail: '/placeholder-video-3.jpg',
      category: 'settings',
      level: 'advanced'
    }
  ];

  const faqItems = [
    {
      question: 'Como posso alterar minha senha?',
      answer: 'Vá para Configurações > Perfil > Alterar Senha. Digite sua senha atual e a nova senha duas vezes.'
    },
    {
      question: 'Por que não consigo ver alguns módulos?',
      answer: 'Os módulos visíveis dependem das suas permissões. Entre em contato com o administrador para solicitar acesso.'
    },
    {
      question: 'Como funciona o sistema de backup?',
      answer: 'O sistema realiza backups automáticos diários. Você pode configurar a frequência em Administração > Backup.'
    },
    {
      question: 'Posso exportar relatórios?',
      answer: 'Sim! Todos os relatórios podem ser exportados em PDF, Excel ou CSV usando o botão "Exportar".'
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredVideos = videoTutorials.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Iniciante';
      case 'intermediate':
        return 'Intermediário';
      case 'advanced':
        return 'Avançado';
      default:
        return level;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <HelpCircle className="w-8 h-8" />
            Centro de Ajuda
          </h1>
          <p className="text-muted-foreground">
            Encontre respostas, tutoriais e suporte para usar o Nautilus One
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat Suporte
          </Button>
          <Button>
            <Phone className="w-4 h-4 mr-2" />
            Contato
          </Button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar artigos, tutoriais..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categorias */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            <category.icon className="w-4 h-4" />
            {category.name}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="articles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="articles">Artigos</TabsTrigger>
          <TabsTrigger value="videos">Vídeo Tutoriais</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {article.description}
                      </CardDescription>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{article.rating}</span>
                      </div>
                    </div>
                    <span>{article.views} visualizações</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum artigo encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca ou selecionar uma categoria diferente
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <Card key={video.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="relative">
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-azure-800 bg-opacity-75 text-azure-50 px-2 py-1 rounded text-sm">
                    {video.duration}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{video.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getLevelColor(video.level)} variant="secondary">
                      {getLevelText(video.level)}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum vídeo encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca ou selecionar uma categoria diferente
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="faq" className="space-y-6">
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Chat ao Vivo
                </CardTitle>
                <CardDescription>
                  Fale conosco em tempo real para suporte imediato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Online agora</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tempo médio de resposta: 2 minutos
                  </p>
                  <Button className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Iniciar Chat
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Suporte
                </CardTitle>
                <CardDescription>
                  Envie sua dúvida por email e receba resposta em até 24h
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="font-medium">suporte@nautilus.com</p>
                    <p className="text-muted-foreground">Resposta em até 24 horas</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Telefone
                </CardTitle>
                <CardDescription>
                  Suporte telefônico em horário comercial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="font-medium">+55 (11) 1234-5678</p>
                    <p className="text-muted-foreground">
                      Seg - Sex: 9h às 18h<br />
                      Sáb: 9h às 12h
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Ligar Agora
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Recursos
                </CardTitle>
                <CardDescription>
                  Documentos e guias para download
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Manual do Usuário (PDF)
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Guia de Configuração
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Documentação API
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpCenter;