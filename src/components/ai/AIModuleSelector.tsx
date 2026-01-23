/**
 * AI Module Selector Component
 * Permite selecionar e acessar qualquer IA especializada
 * PATCH AI-TRAINING v2.0
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Search, 
  Sparkles, 
  ChevronRight,
  MessageSquare,
  Zap
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { AI_MODULES, type AIModuleKey } from '@/lib/ai-prompts';
import { UniversalAIChat } from './UniversalAIChat';

interface AIModuleSelectorProps {
  onSelect?: (module: AIModuleKey) => void;
  showChat?: boolean;
  className?: string;
}

// Semantic color mapping for AI modules
const getModuleColorClass = (color: string) => {
  const semanticMap: Record<string, string> = {
    emerald: 'bg-success/20 text-success border-success/30',
    green: 'bg-success/20 text-success border-success/30',
    blue: 'bg-primary/20 text-primary border-primary/30',
    purple: 'bg-accent/20 text-accent border-accent/30',
    pink: 'bg-accent/20 text-accent border-accent/30',
    orange: 'bg-warning/20 text-warning border-warning/30',
    red: 'bg-destructive/20 text-destructive border-destructive/30',
    indigo: 'bg-primary/20 text-primary border-primary/30',
    cyan: 'bg-info/20 text-info border-info/30',
    teal: 'bg-info/20 text-info border-info/30',
    sky: 'bg-info/20 text-info border-info/30',
    amber: 'bg-warning/20 text-warning border-warning/30',
    lime: 'bg-success/20 text-success border-success/30',
    violet: 'bg-accent/20 text-accent border-accent/30',
    slate: 'bg-muted text-muted-foreground border-muted',
    rose: 'bg-destructive/20 text-destructive border-destructive/30'
  };
  return semanticMap[color] || 'bg-primary/20 text-primary border-primary/30';
};

export function AIModuleSelector({ onSelect, showChat = true, className }: AIModuleSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<AIModuleKey | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const modules = useMemo(() => {
    return Object.entries(AI_MODULES).map(([key, config]) => ({
      key: key as AIModuleKey,
      ...config
    }));
  }, []);

  const filteredModules = useMemo(() => {
    if (!search.trim()) return modules;
    
    const searchLower = search.toLowerCase();
    return modules.filter(m => 
      m.name.toLowerCase().includes(searchLower) ||
      m.description.toLowerCase().includes(searchLower) ||
      m.capabilities.some(c => c.toLowerCase().includes(searchLower))
    );
  }, [modules, search]);

  const handleSelect = (module: AIModuleKey) => {
    setSelectedModule(module);
    onSelect?.(module);
    if (showChat) {
      setChatOpen(true);
    }
  };

  const categories = useMemo(() => {
    return {
      'Auditorias & Compliance': ['peotram', 'peodp', 'compliance', 'mlc'],
      'Operações': ['bunker', 'cargo', 'voyage', 'charter', 'weather'],
      'Gestão': ['fleet', 'crew', 'training', 'maintenance'],
      'Inteligência': ['command', 'voice', 'safety']
    };
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar IA especializada..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6">
          {Object.entries(categories).map(([category, moduleKeys]) => {
            const categoryModules = filteredModules.filter(m => 
              moduleKeys.includes(m.key)
            );
            
            if (categoryModules.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {category}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AnimatePresence mode="popLayout">
                    {categoryModules.map((module) => (
                      <motion.div
                        key={module.key}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card 
                          className={cn(
                            'cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]',
                            selectedModule === module.key && 'ring-2 ring-primary'
                          )}
                          onClick={() => handleSelect(module.key)}
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  'w-10 h-10 rounded-lg flex items-center justify-center text-xl border',
                                  getModuleColorClass(module.color)
                                )}>
                                  {module.icon}
                                </div>
                                <div>
                                  <CardTitle className="text-base">{module.name}</CardTitle>
                                  <CardDescription className="text-xs line-clamp-1">
                                    {module.description}
                                  </CardDescription>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardHeader>
                          
                          <CardContent className="p-4 pt-0">
                            <div className="flex flex-wrap gap-1">
                              {module.capabilities.slice(0, 3).map((cap) => (
                                <Badge key={cap} variant="secondary" className="text-xs">
                                  {cap.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                              {module.capabilities.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{module.capabilities.length - 3}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{modules.length}</div>
          <div className="text-xs text-muted-foreground">IAs Especializadas</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {modules.reduce((acc, m) => acc + m.capabilities.length, 0)}
          </div>
          <div className="text-xs text-muted-foreground">Capacidades</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">24/7</div>
          <div className="text-xs text-muted-foreground">Disponibilidade</div>
        </div>
      </div>

      {/* Chat Dialog */}
      {showChat && (
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="max-w-3xl h-[80vh] p-0">
            <DialogHeader className="sr-only">
              <DialogTitle>
                {selectedModule ? AI_MODULES[selectedModule].name : 'Chat AI'}
              </DialogTitle>
            </DialogHeader>
            {selectedModule && (
              <UniversalAIChat
                module={selectedModule}
                welcomeMessage={`Olá! Sou o **${AI_MODULES[selectedModule].name}** - ${AI_MODULES[selectedModule].description}.\n\nComo posso ajudar você hoje?`}
                className="h-full border-0 rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default AIModuleSelector;
