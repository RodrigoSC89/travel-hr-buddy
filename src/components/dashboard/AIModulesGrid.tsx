/**
 * AI Modules Grid - Versão otimizada
 * PATCH 900: Removidas animações pesadas
 */

import { useState, memo, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  FileText, 
  Shield,
  BarChart3,
  Users,
  Ship,
  Navigation,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface AIModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'standby' | 'learning';
  accuracy: number;
  category: 'core' | 'operations' | 'safety' | 'analytics';
  route: string;
}

const modules: AIModule[] = [
  {
    id: 'nlp',
    name: 'Processamento de Linguagem',
    description: 'Análise e compreensão de texto',
    icon: <MessageSquare className="h-5 w-5" />,
    status: 'active',
    accuracy: 94,
    category: 'core',
    route: '/ai/copilot'
  },
  {
    id: 'document',
    name: 'Análise de Documentos',
    description: 'OCR e extração de dados',
    icon: <FileText className="h-5 w-5" />,
    status: 'active',
    accuracy: 91,
    category: 'core',
    route: '/ai/document-analysis'
  },
  {
    id: 'predictive',
    name: 'Análise Preditiva',
    description: 'Previsões e tendências',
    icon: <BarChart3 className="h-5 w-5" />,
    status: 'active',
    accuracy: 87,
    category: 'analytics',
    route: '/ai/insights'
  },
  {
    id: 'safety',
    name: 'Monitoramento de Segurança',
    description: 'Detecção de riscos e alertas',
    icon: <Shield className="h-5 w-5" />,
    status: 'active',
    accuracy: 96,
    category: 'safety',
    route: '/security'
  },
  {
    id: 'crew',
    name: 'Gestão de Tripulação',
    description: 'Otimização de escalas',
    icon: <Users className="h-5 w-5" />,
    status: 'active',
    accuracy: 89,
    category: 'operations',
    route: '/crew'
  },
  {
    id: 'vessel',
    name: 'Monitoramento de Embarcações',
    description: 'Tracking e manutenção',
    icon: <Ship className="h-5 w-5" />,
    status: 'active',
    accuracy: 92,
    category: 'operations',
    route: '/fleet'
  },
  {
    id: 'navigation',
    name: 'Assistente de Navegação',
    description: 'Rotas otimizadas',
    icon: <Navigation className="h-5 w-5" />,
    status: 'active',
    accuracy: 88,
    category: 'operations',
    route: '/ai/navigation'
  },
  {
    id: 'compliance',
    name: 'Compliance Marítimo',
    description: 'Verificação de conformidade',
    icon: <CheckCircle className="h-5 w-5" />,
    status: 'active',
    accuracy: 95,
    category: 'safety',
    route: '/ai/compliance'
  },
];

const categories = [
  { id: 'all', name: 'Todos' },
  { id: 'core', name: 'Core' },
  { id: 'operations', name: 'Operações' },
  { id: 'safety', name: 'Segurança' },
  { id: 'analytics', name: 'Analytics' },
];

const ModuleCard = memo(({ module, onClick }: { module: AIModule; onClick: () => void }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'standby': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
    }
  };

  return (
    <Card 
      className="group hover:shadow-md hover:border-primary/50 transition-shadow cursor-pointer bg-card/50"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {module.icon}
          </div>
          <Badge 
            variant="outline" 
            className={`text-[10px] ${getStatusColor(module.status)}`}
          >
            {module.status === 'active' ? 'Ativo' : 'Standby'}
          </Badge>
        </div>
        
        <h3 className="font-medium text-sm mb-1">{module.name}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
          {module.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full"
                style={{ width: `${module.accuracy}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {module.accuracy}%
            </span>
          </div>
          <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
});

ModuleCard.displayName = 'ModuleCard';

function AIModulesGridComponent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  const filteredModules = useMemo(() => 
    selectedCategory === 'all' 
      ? modules 
      : modules.filter(m => m.category === selectedCategory),
    [selectedCategory]
  );

  const handleCategoryChange = useCallback((id: string) => {
    setSelectedCategory(id);
  }, []);

  const handleModuleClick = useCallback((module: AIModule) => {
    toast({
      title: module.name,
      description: `Acessando ${module.description.toLowerCase()}...`,
      duration: 2000,
    });
    navigate(module.route);
  }, [navigate, toast]);

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(cat.id)}
            className="whitespace-nowrap"
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Modules Grid - Sem animações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredModules.map((module) => (
          <ModuleCard 
            key={module.id} 
            module={module} 
            onClick={() => handleModuleClick(module)}
          />
        ))}
      </div>
    </div>
  );
}

export const AIModulesGrid = memo(AIModulesGridComponent);
