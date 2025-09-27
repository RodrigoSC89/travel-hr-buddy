import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Store, 
  Download, 
  Star, 
  Search, 
  Filter,
  Zap,
  Shield,
  Anchor,
  Globe,
  BarChart,
  FileText,
  Users,
  Settings,
  Truck
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  downloads: number;
  price: 'free' | 'paid' | 'freemium';
  icon: React.ComponentType<any>;
  features: string[];
  developer: string;
  version: string;
}

export const IntegrationMarketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Port Management Pro',
      description: 'Gestão completa de operações portuárias com rastreamento em tempo real',
      category: 'operations',
      rating: 4.8,
      downloads: 1250,
      price: 'paid',
      icon: Anchor,
      features: ['API REST', 'Webhooks', 'Dashboard', 'Mobile'],
      developer: 'Maritime Solutions',
      version: '2.1.0'
    },
    {
      id: '2',
      name: 'Weather Pro Maritime',
      description: 'Previsões meteorológicas precisas para navegação marítima',
      category: 'weather',
      rating: 4.9,
      downloads: 2100,
      price: 'freemium',
      icon: Globe,
      features: ['API Weather', 'Alertas', 'Mapas', 'Histórico'],
      developer: 'WeatherTech',
      version: '1.5.2'
    },
    {
      id: '3',
      name: 'Fleet Analytics Suite',
      description: 'Analytics avançado para performance e otimização de frotas',
      category: 'analytics',
      rating: 4.7,
      downloads: 890,
      price: 'paid',
      icon: BarChart,
      features: ['ML Analytics', 'Dashboards', 'Reports', 'API'],
      developer: 'DataMarine',
      version: '3.0.1'
    },
    {
      id: '4',
      name: 'Document Manager',
      description: 'Gestão digital de documentos marítimos e certificações',
      category: 'documents',
      rating: 4.6,
      downloads: 1500,
      price: 'free',
      icon: FileText,
      features: ['OCR', 'Blockchain', 'Cloud Storage', 'Templates'],
      developer: 'DocuMarine',
      version: '1.8.0'
    },
    {
      id: '5',
      name: 'Crew Management Plus',
      description: 'Solução completa para gestão de tripulação e escala',
      category: 'hr',
      rating: 4.5,
      downloads: 750,
      price: 'freemium',
      icon: Users,
      features: ['Schedule', 'Certificates', 'Training', 'Compliance'],
      developer: 'CrewTech',
      version: '2.3.1'
    },
    {
      id: '6',
      name: 'Cargo Logistics Hub',
      description: 'Otimização logística e rastreamento de cargas',
      category: 'logistics',
      rating: 4.4,
      downloads: 620,
      price: 'paid',
      icon: Truck,
      features: ['Tracking', 'Route Optimization', 'Customs', 'EDI'],
      developer: 'LogiMarine',
      version: '1.9.3'
    }
  ];

  const categories = [
    { id: 'all', name: 'Todas', count: integrations.length },
    { id: 'operations', name: 'Operações', count: integrations.filter(i => i.category === 'operations').length },
    { id: 'weather', name: 'Meteorologia', count: integrations.filter(i => i.category === 'weather').length },
    { id: 'analytics', name: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length },
    { id: 'documents', name: 'Documentos', count: integrations.filter(i => i.category === 'documents').length },
    { id: 'hr', name: 'RH', count: integrations.filter(i => i.category === 'hr').length },
    { id: 'logistics', name: 'Logística', count: integrations.filter(i => i.category === 'logistics').length }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getPriceColor = (price: string) => {
    switch (price) {
      case 'free': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'paid': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'freemium': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriceText = (price: string) => {
    switch (price) {
      case 'free': return 'Gratuito';
      case 'paid': return 'Pago';
      case 'freemium': return 'Freemium';
      default: return price;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Store className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Marketplace de Integrações</h1>
          <Badge variant="secondary">127 Integrações</Badge>
        </div>
        <p className="text-muted-foreground">
          Descubra e instale integrações para expandir as funcionalidades do Nautilus
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar integrações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="md:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name} ({category.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const IconComponent = integration.icon;
              return (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">v{integration.version}</p>
                        </div>
                      </div>
                      <Badge className={getPriceColor(integration.price)}>
                        {getPriceText(integration.price)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {integration.description}
                    </p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{integration.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-muted-foreground" />
                        <span>{integration.downloads.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recursos:</p>
                      <div className="flex flex-wrap gap-1">
                        {integration.features.slice(0, 3).map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {integration.features.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{integration.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Por {integration.developer}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Instalar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredIntegrations.length === 0 && (
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma integração encontrada</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou termo de busca
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Developer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Para Desenvolvedores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Crie e publique suas próprias integrações no marketplace Nautilus
          </p>
          <div className="flex gap-4">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Documentação da API
            </Button>
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Processo de Certificação
            </Button>
            <Button>
              <Zap className="w-4 h-4 mr-2" />
              Publicar Integração
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};