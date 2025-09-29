import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Store,
  Download,
  Star,
  Users,
  Zap,
  Search,
  Eye,
  Share,
  CheckCircle,
  Globe,
  MessageSquare,
  BarChart3,
  CreditCard,
  Brain,
  Cpu,
  Upload
} from 'lucide-react';

interface IntegrationListing {
  id: string;
  name: string;
  description: string;
  category: 'productivity' | 'communication' | 'analytics' | 'payment' | 'ai' | 'automation';
  author: string;
  version: string;
  downloads: number;
  rating: number;
  reviews: number;
  price: 'free' | 'premium';
  tags: string[];
  isVerified: boolean;
  isFeatured: boolean;
  lastUpdated: string;
  supportLevel: 'community' | 'developer' | 'enterprise';
}

export const IntegrationMarketplace: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('browse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('popular');
  const { toast } = useToast();

  const integrations: IntegrationListing[] = [
    {
      id: '1',
      name: 'Advanced WhatsApp Business',
      description: 'Integração completa com WhatsApp Business API, incluindo templates, análise de mensagens e automação inteligente.',
      category: 'communication',
      author: 'TechCorp Solutions',
      version: '2.1.4',
      downloads: 15420,
      rating: 4.8,
      reviews: 324,
      price: 'premium',
      tags: ['whatsapp', 'messaging', 'automation', 'ai'],
      isVerified: true,
      isFeatured: true,
      lastUpdated: '2024-01-15',
      supportLevel: 'enterprise'
    },
    {
      id: '2',
      name: 'Google Workspace Suite',
      description: 'Conecte-se com todo o ecossistema Google: Gmail, Calendar, Drive, Sheets e muito mais em uma única integração.',
      category: 'productivity',
      author: 'Google Partner',
      version: '1.5.2',
      downloads: 28340,
      rating: 4.9,
      reviews: 856,
      price: 'free',
      tags: ['google', 'workspace', 'calendar', 'gmail', 'drive'],
      isVerified: true,
      isFeatured: true,
      lastUpdated: '2024-01-18',
      supportLevel: 'developer'
    },
    {
      id: '3',
      name: 'AI Analytics Dashboard',
      description: 'Dashboard inteligente com análises preditivas, insights automáticos e relatórios personalizados baseados em IA.',
      category: 'ai',
      author: 'DataMind AI',
      version: '3.0.1',
      downloads: 8750,
      rating: 4.7,
      reviews: 198,
      price: 'premium',
      tags: ['ai', 'analytics', 'dashboard', 'predictions', 'insights'],
      isVerified: true,
      isFeatured: false,
      lastUpdated: '2024-01-12',
      supportLevel: 'enterprise'
    },
    {
      id: '4',
      name: 'Stripe Advanced Payments',
      description: 'Processamento avançado de pagamentos com Stripe, incluindo assinaturas, marketplace e análise financeira.',
      category: 'payment',
      author: 'FinTech Integrations',
      version: '1.8.3',
      downloads: 12680,
      rating: 4.6,
      reviews: 445,
      price: 'free',
      tags: ['stripe', 'payments', 'subscriptions', 'finance'],
      isVerified: true,
      isFeatured: false,
      lastUpdated: '2024-01-20',
      supportLevel: 'developer'
    },
    {
      id: '5',
      name: 'Slack Team Collaboration',
      description: 'Integração avançada com Slack para comunicação em equipe, notificações inteligentes e comandos personalizados.',
      category: 'communication',
      author: 'SlackWorks',
      version: '2.3.1',
      downloads: 19230,
      rating: 4.5,
      reviews: 567,
      price: 'free',
      tags: ['slack', 'collaboration', 'notifications', 'team'],
      isVerified: true,
      isFeatured: true,
      lastUpdated: '2024-01-16',
      supportLevel: 'community'
    }
  ];

  const categories = [
    { id: 'all', name: 'Todas', count: integrations.length, icon: Globe },
    { id: 'productivity', name: 'Produtividade', count: integrations.filter(i => i.category === 'productivity').length, icon: Zap },
    { id: 'communication', name: 'Comunicação', count: integrations.filter(i => i.category === 'communication').length, icon: MessageSquare },
    { id: 'analytics', name: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length, icon: BarChart3 },
    { id: 'payment', name: 'Pagamentos', count: integrations.filter(i => i.category === 'payment').length, icon: CreditCard },
    { id: 'ai', name: 'Inteligência Artificial', count: integrations.filter(i => i.category === 'ai').length, icon: Brain },
    { id: 'automation', name: 'Automação', count: integrations.filter(i => i.category === 'automation').length, icon: Cpu }
  ];

  const filters = [
    { value: 'popular', label: 'Mais Populares' },
    { value: 'newest', label: 'Mais Recentes' },
    { value: 'rating', label: 'Melhor Avaliados' },
    { value: 'free', label: 'Gratuitos' },
    { value: 'premium', label: 'Premium' },
    { value: 'verified', label: 'Verificados' }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedIntegrations = [...filteredIntegrations].sort((a, b) => {
    switch (selectedFilter) {
      case 'popular': return b.downloads - a.downloads;
      case 'newest': return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case 'rating': return b.rating - a.rating;
      case 'free': return a.price === 'free' ? -1 : 1;
      case 'premium': return a.price === 'premium' ? -1 : 1;
      case 'verified': return a.isVerified ? -1 : 1;
      default: return 0;
    }
  });

  const handleInstall = (integration: IntegrationListing) => {
    toast({
      title: "Instalando Integração",
      description: `${integration.name} está sendo instalado...`,
    });
    
    setTimeout(() => {
      toast({
        title: "Instalação Concluída",
        description: `${integration.name} foi instalado com sucesso!`,
      });
    }, 2000);
  };

  const getCategoryIcon = (category: IntegrationListing['category']) => {
    const categoryData = categories.find(c => c.id === category);
    const Icon = categoryData?.icon || Globe;
    return <Icon className="w-4 h-4" />;
  };

  const getPriceColor = (price: IntegrationListing['price']) => {
    return price === 'free' 
      ? 'bg-success/20 text-success border-success/30'
      : 'bg-warning/20 text-warning border-warning/30';
  };

  const getSupportColor = (level: IntegrationListing['supportLevel']) => {
    switch (level) {
      case 'enterprise': return 'bg-primary/20 text-primary border-primary/30';
      case 'developer': return 'bg-accent/20 text-accent border-accent/30';
      case 'community': return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl text-foreground">
                Marketplace de Integrações
              </CardTitle>
              <CardDescription>
                Descubra, instale e compartilhe integrações criadas pela comunidade
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="browse">Explorar</TabsTrigger>
          <TabsTrigger value="featured">Destaques</TabsTrigger>
          <TabsTrigger value="installed">Instaladas</TabsTrigger>
          <TabsTrigger value="publish">Publicar</TabsTrigger>
        </TabsList>

        {/* Explorar Integrações */}
        <TabsContent value="browse" className="space-y-6">
          {/* Filtros e Busca */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar integrações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select 
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      {filters.map(filter => (
                        <option key={filter.value} value={filter.value}>
                          {filter.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="whitespace-nowrap flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {category.name} ({category.count})
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Integrações */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedIntegrations.map((integration) => (
              <Card key={integration.id} className="group hover:shadow-lg transition-all duration-200 border border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        {getCategoryIcon(integration.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">{integration.name}</h3>
                          {integration.isVerified && (
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">por {integration.author}</p>
                      </div>
                    </div>
                    {integration.isFeatured && (
                      <Badge className="bg-warning/20 text-warning border-warning/30">
                        Destaque
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {integration.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-warning fill-current" />
                      <span>{integration.rating}</span>
                      <span>({integration.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{integration.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getPriceColor(integration.price)}>
                      {integration.price === 'free' ? 'Gratuito' : 'Premium'}
                    </Badge>
                    <Badge className={getSupportColor(integration.supportLevel)}>
                      {integration.supportLevel}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {integration.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {integration.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{integration.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      Detalhes
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleInstall(integration)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Instalar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Integrações em Destaque */}
        <TabsContent value="featured" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.filter(i => i.isFeatured).map((integration) => (
              <Card key={integration.id} className="border border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                        {getCategoryIcon(integration.category)}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-foreground">{integration.name}</CardTitle>
                        <p className="text-muted-foreground">por {integration.author}</p>
                      </div>
                    </div>
                    <Badge className="bg-warning/20 text-warning border-warning/30">
                      <Star className="w-3 h-3 mr-1" />
                      Destaque
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{integration.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{integration.rating}</div>
                      <p className="text-xs text-muted-foreground">Avaliação</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{integration.downloads.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Downloads</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{integration.reviews}</div>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleInstall(integration)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Instalar Agora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Integrações Instaladas */}
        <TabsContent value="installed" className="space-y-6">
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma integração instalada</h3>
              <p className="text-muted-foreground mb-4">
                Explore o marketplace e instale integrações para começar.
              </p>
              <Button onClick={() => setSelectedTab('browse')} className="bg-primary hover:bg-primary/90">
                <Store className="w-4 h-4 mr-2" />
                Explorar Marketplace
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Publicar Integração */}
        <TabsContent value="publish" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Publique sua Integração</CardTitle>
              <CardDescription>
                Compartilhe sua integração com a comunidade Nautilus
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Share className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Publique e Monetize</h3>
                <p className="text-muted-foreground mb-4">
                  Crie integrações incríveis e compartilhe com milhares de usuários.
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  <Upload className="w-4 h-4 mr-2" />
                  Começar Publicação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};