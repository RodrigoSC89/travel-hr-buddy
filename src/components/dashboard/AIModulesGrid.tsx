/**
 * AI Modules Grid - Grid completo de módulos de IA
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Bot, 
  Sparkles, 
  MessageSquare, 
  FileText, 
  Shield,
  BarChart3,
  Globe,
  Users,
  Ship,
  Anchor,
  Navigation,
  Compass,
  Radio,
  AlertTriangle,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";

interface AIModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'standby' | 'learning';
  accuracy: number;
  category: 'core' | 'operations' | 'safety' | 'analytics';
}

const modules: AIModule[] = [
  {
    id: 'nlp',
    name: 'Processamento de Linguagem',
    description: 'Análise e compreensão de texto',
    icon: <MessageSquare className="h-5 w-5" />,
    status: 'active',
    accuracy: 94,
    category: 'core'
  },
  {
    id: 'document',
    name: 'Análise de Documentos',
    description: 'OCR e extração de dados',
    icon: <FileText className="h-5 w-5" />,
    status: 'active',
    accuracy: 91,
    category: 'core'
  },
  {
    id: 'predictive',
    name: 'Análise Preditiva',
    description: 'Previsões e tendências',
    icon: <BarChart3 className="h-5 w-5" />,
    status: 'active',
    accuracy: 87,
    category: 'analytics'
  },
  {
    id: 'safety',
    name: 'Monitoramento de Segurança',
    description: 'Detecção de riscos e alertas',
    icon: <Shield className="h-5 w-5" />,
    status: 'active',
    accuracy: 96,
    category: 'safety'
  },
  {
    id: 'crew',
    name: 'Gestão de Tripulação',
    description: 'Otimização de escalas e certificações',
    icon: <Users className="h-5 w-5" />,
    status: 'active',
    accuracy: 89,
    category: 'operations'
  },
  {
    id: 'vessel',
    name: 'Monitoramento de Embarcações',
    description: 'Tracking e manutenção preditiva',
    icon: <Ship className="h-5 w-5" />,
    status: 'active',
    accuracy: 92,
    category: 'operations'
  },
  {
    id: 'navigation',
    name: 'Assistente de Navegação',
    description: 'Rotas otimizadas e condições',
    icon: <Navigation className="h-5 w-5" />,
    status: 'standby',
    accuracy: 88,
    category: 'operations'
  },
  {
    id: 'compliance',
    name: 'Compliance Marítimo',
    description: 'Verificação de conformidade',
    icon: <CheckCircle className="h-5 w-5" />,
    status: 'active',
    accuracy: 95,
    category: 'safety'
  },
];

export function AIModulesGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'all', name: 'Todos', count: modules.length },
    { id: 'core', name: 'Core', count: modules.filter(m => m.category === 'core').length },
    { id: 'operations', name: 'Operações', count: modules.filter(m => m.category === 'operations').length },
    { id: 'safety', name: 'Segurança', count: modules.filter(m => m.category === 'safety').length },
    { id: 'analytics', name: 'Analytics', count: modules.filter(m => m.category === 'analytics').length },
  ];

  const filteredModules = selectedCategory === 'all' 
    ? modules 
    : modules.filter(m => m.category === selectedCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'standby': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'learning': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="whitespace-nowrap"
          >
            {cat.name}
            <Badge variant="secondary" className="ml-2 text-xs">
              {cat.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredModules.map((module, index) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer bg-card/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {module.icon}
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${getStatusColor(module.status)}`}
                  >
                    {module.status === 'active' ? 'Ativo' : 
                     module.status === 'standby' ? 'Standby' : 'Aprendendo'}
                  </Badge>
                </div>
                
                <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">
                  {module.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {module.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${module.accuracy}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {module.accuracy}%
                    </span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
