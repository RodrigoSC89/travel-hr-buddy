import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  CheckCircle, 
  Camera, 
  Mic,
  Ship,
  User,
  Target,
  Shield,
  AlertTriangle,
  LifeBuoy,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';
import type { Checklist, ChecklistItem } from './checklist-types';

interface SafetyChecklistProps {
  checklist: Checklist;
  onSave: (checklist: Checklist) => Promise<void>;
  onSubmit: (checklist: Checklist) => Promise<void>;
  onBack: () => void;
}

// Mock safety checklist items
const safetyChecklistItems: ChecklistItem[] = [
  {
    id: 'safety-1',
    title: 'Inspeção dos Equipamentos de Combate a Incêndio',
    description: 'Verificar extintores, hidrantes, sistema de CO2 e equipamentos fixos',
    type: 'boolean',
    required: true,
    category: 'Combate a Incêndio',
    order: 1,
    status: 'pending'
  },
  {
    id: 'safety-2',
    title: 'Verificação dos Botes Salva-vidas',
    description: 'Inspeção visual, teste de lançamento e equipamentos de sobrevivência',
    type: 'boolean',
    required: true,
    category: 'Abandono',
    order: 2,
    status: 'pending'
  },
  {
    id: 'safety-3',
    title: 'Teste dos Sistemas de Alarme',
    description: 'Alarme geral, abandono, incêndio e man overboard',
    type: 'boolean',
    required: true,
    category: 'Alarmes',
    order: 3,
    status: 'pending'
  },
  {
    id: 'safety-4',
    title: 'Verificação dos EPIs',
    description: 'Coletes salva-vidas, capacetes, óculos de proteção, luvas',
    type: 'boolean',
    required: true,
    category: 'EPI',
    order: 4,
    status: 'pending'
  },
  {
    id: 'safety-5',
    title: 'Contagem de Pessoas a Bordo',
    description: 'Verificar número atual de tripulantes e visitantes',
    type: 'number',
    required: true,
    category: 'Controle',
    order: 5,
    unit: 'pessoas',
    minValue: 1,
    maxValue: 100,
    status: 'pending'
  },
  {
    id: 'safety-6',
    title: 'Inspeção dos Equipamentos de Resgate',
    description: 'Balsas salva-vidas, MOB boat, equipamentos de busca e salvamento',
    type: 'boolean',
    required: true,
    category: 'Resgate',
    order: 6,
    status: 'pending'
  },
  {
    id: 'safety-7',
    title: 'Verificação das Saídas de Emergência',
    description: 'Portas de escape, corredores, iluminação de emergência',
    type: 'boolean',
    required: true,
    category: 'Escape',
    order: 7,
    status: 'pending'
  },
  {
    id: 'safety-8',
    title: 'Teste dos Sistemas de Ventilação',
    description: 'Ventilação de emergência e sistemas de exaustão',
    type: 'boolean',
    required: true,
    category: 'Ventilação',
    order: 8,
    status: 'pending'
  },
  {
    id: 'safety-9',
    title: 'Verificação de Materiais Perigosos',
    description: 'Armazenamento adequado de produtos químicos e combustíveis',
    type: 'boolean',
    required: true,
    category: 'Materiais Perigosos',
    order: 9,
    status: 'pending'
  },
  {
    id: 'safety-10',
    title: 'Observações de Segurança',
    description: 'Registrar quaisquer observações ou não conformidades',
    type: 'text',
    required: false,
    category: 'Observações',
    order: 10,
    status: 'pending'
  }
];

export const SafetyChecklist: React.FC<SafetyChecklistProps> = ({
  checklist: initialChecklist,
  onSave,
  onSubmit,
  onBack
}) => {
  const [checklist, setChecklist] = useState<Checklist>({
    ...initialChecklist,
    items: safetyChecklistItems
  });

  const [activeTab, setActiveTab] = useState('items');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Array.from(new Set(checklist.items.map(item => item.category)));
  const filteredItems = selectedCategory === 'all' 
    ? checklist.items 
    : checklist.items.filter(item => item.category === selectedCategory);

  const completedItems = checklist.items.filter(item => item.status === 'completed').length;
  const totalItems = checklist.items.length;
  const progressPercentage = (completedItems / totalItems) * 100;

  const handleItemChange = (itemId: string, field: string, value: any) => {
    setChecklist(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              [field]: value,
              status: field === 'value' && value !== undefined ? 'completed' : item.status,
              timestamp: field === 'value' ? new Date().toISOString() : item.timestamp
            }
          : item
      )
    }));
  };

  const handleSave = async () => {
    try {
      await onSave(checklist);
      toast.success('Checklist salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar checklist');
    }
  };

  const handleSubmit = async () => {
    const incompleteRequired = checklist.items.filter(item => item.required && item.status !== 'completed');
    
    if (incompleteRequired.length > 0) {
      toast.error(`Existem ${incompleteRequired.length} itens obrigatórios não concluídos`);
      return;
    }

    try {
      await onSubmit({
        ...checklist,
        status: 'pending_review',
        completedAt: new Date().toISOString()
      });
      toast.success('Checklist enviado para revisão!');
    } catch (error) {
      toast.error('Erro ao enviar checklist');
    }
  };

  const renderItemInput = (item: ChecklistItem) => {
    switch (item.type) {
      case 'boolean':
        return (
          <Checkbox
            checked={item.value === true}
            onCheckedChange={(checked) => handleItemChange(item.id, 'value', checked)}
            className="mr-2"
          />
        );
      
      case 'number':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={item.value || ''}
              onChange={(e) => handleItemChange(item.id, 'value', parseFloat(e.target.value))}
              placeholder={`Min: ${item.minValue}, Max: ${item.maxValue}`}
              className="w-32"
            />
            {item.unit && <span className="text-sm text-muted-foreground">{item.unit}</span>}
          </div>
        );
      
      case 'text':
        return (
          <Input
            value={item.value || ''}
            onChange={(e) => handleItemChange(item.id, 'value', e.target.value)}
            placeholder="Digite sua observação..."
            className="w-full"
          />
        );
      
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Combate a Incêndio': return <Flame className="w-4 h-4" />;
      case 'Abandono': return <LifeBuoy className="w-4 h-4" />;
      case 'Alarmes': return <AlertTriangle className="w-4 h-4" />;
      case 'EPI': return <Shield className="w-4 h-4" />;
      case 'Resgate': return <LifeBuoy className="w-4 h-4" />;
      case 'Escape': return <AlertTriangle className="w-4 h-4" />;
      case 'Ventilação': return <Ship className="w-4 h-4" />;
      case 'Materiais Perigosos': return <AlertTriangle className="w-4 h-4" />;
      case 'Controle': return <Target className="w-4 h-4" />;
      case 'Observações': return <User className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Combate a Incêndio': return 'text-red-600 bg-red-50';
      case 'Abandono': return 'text-orange-600 bg-orange-50';
      case 'Alarmes': return 'text-yellow-600 bg-yellow-50';
      case 'EPI': return 'text-blue-600 bg-blue-50';
      case 'Resgate': return 'text-purple-600 bg-purple-50';
      case 'Escape': return 'text-green-600 bg-green-50';
      case 'Ventilação': return 'text-cyan-600 bg-cyan-50';
      case 'Materiais Perigosos': return 'text-red-600 bg-red-50';
      case 'Controle': return 'text-gray-600 bg-gray-50';
      case 'Observações': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{checklist.title}</h1>
                <p className="text-muted-foreground">{checklist.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-red-50 text-red-700">
                <Shield className="w-4 h-4 mr-2" />
                Segurança
              </Badge>
              <Badge variant={checklist.priority === 'high' ? 'destructive' : 'default'}>
                {checklist.priority}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso da Inspeção de Segurança</span>
              <span className="text-sm text-muted-foreground">
                {completedItems} de {totalItems} itens concluídos
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="items">Itens de Segurança</TabsTrigger>
                <TabsTrigger value="evidence">Evidências</TabsTrigger>
                <TabsTrigger value="summary">Resumo</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="space-y-6">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Todas as Categorias
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="flex items-center gap-2"
                    >
                      {getCategoryIcon(category)}
                      {category}
                    </Button>
                  ))}
                </div>

                {/* Checklist Items */}
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className={`transition-colors ${
                      item.status === 'completed' ? 'bg-green-50 border-green-200' : ''
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {renderItemInput(item)}
                              <div>
                                <CardTitle className="text-lg">{item.title}</CardTitle>
                                {item.required && (
                                  <Badge variant="destructive" className="text-xs mt-1">
                                    Obrigatório
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <CardDescription className="mt-2">
                              {item.description}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status === 'completed' && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            <Badge variant="outline" className={`flex items-center gap-1 ${getCategoryColor(item.category)}`}>
                              {getCategoryIcon(item.category)}
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {/* Notes */}
                        <div>
                          <label className="text-sm font-medium">Observações:</label>
                          <Textarea
                            value={item.notes || ''}
                            onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                            placeholder="Adicione observações sobre este item de segurança..."
                            className="mt-1"
                            rows={2}
                          />
                        </div>

                        {/* Evidence Actions */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Camera className="w-4 h-4 mr-2" />
                            Foto
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mic className="w-4 h-4 mr-2" />
                            Áudio
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="evidence" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Evidências de Segurança</CardTitle>
                    <CardDescription>
                      Documentos, fotos e registros da inspeção de segurança
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Nenhuma evidência coletada ainda
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo da Inspeção de Segurança</CardTitle>
                    <CardDescription>
                      Status geral e ações necessárias
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{completedItems}</div>
                        <div className="text-sm text-muted-foreground">Itens Concluídos</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{totalItems - completedItems}</div>
                        <div className="text-sm text-muted-foreground">Itens Pendentes</div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Observações Gerais de Segurança:</label>
                      <Textarea
                        placeholder="Adicione comentários sobre o estado geral de segurança do navio..."
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vessel Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Ship className="w-4 h-4" />
                  Informações do Navio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Nome:</strong> {checklist.vessel.name}</div>
                <div><strong>Tipo:</strong> {checklist.vessel.type}</div>
                <div><strong>IMO:</strong> {checklist.vessel.imo}</div>
                <div><strong>Bandeira:</strong> {checklist.vessel.flag}</div>
                <div><strong>Operador:</strong> {checklist.vessel.operator}</div>
              </CardContent>
            </Card>

            {/* Inspector Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Responsável pela Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Nome:</strong> {checklist.inspector.name}</div>
                <div><strong>Licença:</strong> {checklist.inspector.license}</div>
                <div><strong>Empresa:</strong> {checklist.inspector.company}</div>
                <div><strong>Email:</strong> {checklist.inspector.email}</div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Progresso:</span>
                  <span className="font-medium">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Duração estimada:</span>
                  <span className="font-medium">{checklist.estimatedDuration}min</span>
                </div>
                <div className="flex justify-between">
                  <span>Prioridade:</span>
                  <Badge variant={checklist.priority === 'high' ? 'destructive' : 'default'} className="text-xs">
                    {checklist.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={handleSave} className="w-full" variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Salvar Progresso
              </Button>
              <Button onClick={handleSubmit} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar para Revisão
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};