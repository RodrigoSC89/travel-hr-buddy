import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  History, 
  Download, 
  Search,
  Filter,
  User,
  Clock,
  Settings,
  Shield,
  Eye,
  AlertTriangle,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export const DocumentationLogsTab: React.FC = () => {
  const [logFilter, setLogFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const documents = [
    {
      id: 'terms',
      title: 'Termos de Uso',
      description: 'Termos e condições de uso da plataforma',
      lastUpdated: '2024-09-15',
      version: '2.1',
      type: 'legal'
    },
    {
      id: 'privacy',
      title: 'Política de Privacidade',
      description: 'Como tratamos e protegemos seus dados',
      lastUpdated: '2024-09-10',
      version: '1.8',
      type: 'legal'
    },
    {
      id: 'manual',
      title: 'Manual do Usuário',
      description: 'Guia completo de utilização do sistema',
      lastUpdated: '2024-09-20',
      version: '3.2',
      type: 'guide'
    },
    {
      id: 'api',
      title: 'Documentação da API',
      description: 'Referência técnica para desenvolvedores',
      lastUpdated: '2024-09-25',
      version: '2.4',
      type: 'technical'
    }
  ];

  const auditLogs = [
    {
      id: '1',
      timestamp: '2024-09-29T14:30:00Z',
      user: 'carlos.silva@nautilus.com',
      action: 'Alteração de configuração',
      module: 'Segurança',
      details: 'Tempo de expiração de sessão alterado de 60 para 30 minutos',
      type: 'config_change',
      ipAddress: '192.168.1.100'
    },
    {
      id: '2',
      timestamp: '2024-09-29T13:15:00Z',
      user: 'maria.santos@nautilus.com',
      action: 'Criação de usuário',
      module: 'Usuários',
      details: 'Novo usuário criado: joao.costa@nautilus.com',
      type: 'user_management',
      ipAddress: '192.168.1.105'
    },
    {
      id: '3',
      timestamp: '2024-09-29T12:45:00Z',
      user: 'admin@nautilus.com',
      action: 'Backup de configurações',
      module: 'Sistema',
      details: 'Backup automático das configurações realizado',
      type: 'system_action',
      ipAddress: '192.168.1.1'
    },
    {
      id: '4',
      timestamp: '2024-09-29T11:20:00Z',
      user: 'carlos.silva@nautilus.com',
      action: 'Configuração de webhook',
      module: 'Integrações',
      details: 'Webhook adicionado: https://api.exemplo.com/webhook',
      type: 'integration',
      ipAddress: '192.168.1.100'
    },
    {
      id: '5',
      timestamp: '2024-09-29T10:00:00Z',
      user: 'sistema',
      action: 'Atualização de sistema',
      module: 'Sistema',
      details: 'Sistema atualizado para versão 2.1.4',
      type: 'system_update',
      ipAddress: 'localhost'
    }
  ];

  const aiRecommendations = [
    {
      id: '1',
      title: 'Otimização de Segurança',
      description: 'Considere reduzir o tempo de expiração de sessão para 15 minutos para usuários com privilégios administrativos.',
      priority: 'high',
      category: 'security',
      confidence: 85
    },
    {
      id: '2',
      title: 'Melhor Gestão de Notificações',
      description: 'Baseado no uso, recomendamos desabilitar notificações push fora do horário comercial para melhorar a experiência.',
      priority: 'medium',
      category: 'notifications',
      confidence: 78
    },
    {
      id: '3',
      title: 'Integração Sugerida',
      description: 'Detectamos uso frequente de planilhas. Considere integrar com Google Sheets ou Microsoft Excel Online.',
      priority: 'low',
      category: 'integrations',
      confidence: 92
    }
  ];

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'config_change': return <Settings className="w-4 h-4 text-blue-600" />;
      case 'user_management': return <User className="w-4 h-4 text-green-600" />;
      case 'system_action': return <Shield className="w-4 h-4 text-purple-600" />;
      case 'integration': return <Settings className="w-4 h-4 text-orange-600" />;
      case 'system_update': return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default: return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Alta Prioridade</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Média Prioridade</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800">Baixa Prioridade</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesFilter = logFilter === 'all' || log.type === logFilter;
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentação
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Logs de Auditoria
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Recomendações IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          {/* System Documentation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Documentação do Sistema
              </CardTitle>
              <CardDescription>
                Acesse termos, políticas e documentos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-medium">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>Versão {doc.version}</span>
                        <span>•</span>
                        <span>Atualizado em {new Date(doc.lastUpdated).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          {/* Audit Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Logs de Alterações de Configurações
              </CardTitle>
              <CardDescription>
                Histórico completo de mudanças no sistema com rastreabilidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar nos logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={logFilter} onValueChange={setLogFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="config_change">Configurações</SelectItem>
                    <SelectItem value="user_management">Usuários</SelectItem>
                    <SelectItem value="system_action">Sistema</SelectItem>
                    <SelectItem value="integration">Integrações</SelectItem>
                    <SelectItem value="system_update">Atualizações</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>

              {/* Logs List */}
              <div className="space-y-3">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getActionIcon(log.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{log.action}</h4>
                            <Badge variant="outline" className="text-xs">
                              {log.module}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.user}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </span>
                            <span>IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum log encontrado com os filtros aplicados</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Sugestões Inteligentes de Configuração com IA
              </CardTitle>
              <CardDescription>
                Recomendações baseadas no uso do sistema e melhores práticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiRecommendations.map((recommendation) => (
                <div key={recommendation.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{recommendation.title}</h4>
                      {getPriorityBadge(recommendation.priority)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Confiança: {recommendation.confidence}%</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {recommendation.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {recommendation.category}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Aplicar
                      </Button>
                      <Button variant="ghost" size="sm">
                        Dispensar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">IA em Ação</span>
                </div>
                <p className="text-sm text-blue-700">
                  Nossa IA analisa continuamente o uso do sistema para sugerir otimizações.
                  Novas recomendações são geradas automaticamente a cada 24 horas.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};