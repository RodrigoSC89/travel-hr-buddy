import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  PEOTRAM_2024_ELEMENTOS_OFICIAIS,
  getElementosCriticosOficial,
  getTotalRequisitosOficial,
  type PeotramElementoCompleto
} from "@/data/peotram-2024-integrated";
import { 
  PEOTRAM_2024_ELEMENTS, 
  getTotalItems, 
  getCriticalElements,
  type PeotramElement 
} from "./peotram-13-elements-data";
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Star,
  ChevronLeft,
  ChevronRight,
  FileCheck,
  Shield,
  Users,
  Settings,
  BookOpen,
  Wrench,
  Building,
  Briefcase,
  RefreshCw,
  MessageSquare,
  Search,
  Bell
} from "lucide-react";

interface ElementProgress {
  elementNumber: number;
  completedItems: number;
  totalItems: number;
  conformantItems: number;
  nonConformantItems: number;
  status: 'pending' | 'in_progress' | 'completed';
}

interface Peotram13ElementsTabsProps {
  auditId?: string;
  progress?: Record<number, ElementProgress>;
  onElementSelect?: (elementNumber: number) => void;
  onItemSelect?: (elementNumber: number, itemId: string) => void;
  renderElementContent?: (element: PeotramElement) => React.ReactNode;
}

const ELEMENT_ICONS: Record<number, React.ComponentType<any>> = {
  1: Shield,
  2: FileCheck,
  3: AlertTriangle,
  4: BookOpen,
  5: Users,
  6: Wrench,
  7: Building,
  8: Briefcase,
  9: RefreshCw,
  10: Settings,
  11: MessageSquare,
  12: Search,
  13: Bell
};

export const Peotram13ElementsTabs: React.FC<Peotram13ElementsTabsProps> = ({
  progress = {},
  onElementSelect,
  onItemSelect,
  renderElementContent
}) => {
  const [activeElement, setActiveElement] = useState(1);
  
  const getProgressForElement = (elementNumber: number): ElementProgress => {
    return progress[elementNumber] || {
      elementNumber,
      completedItems: 0,
      totalItems: PEOTRAM_2024_ELEMENTS.find(e => e.elementNumber === elementNumber)?.totalItems || 0,
      conformantItems: 0,
      nonConformantItems: 0,
      status: 'pending'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success border-success/30';
      case 'in_progress': return 'bg-warning/20 text-warning border-warning/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getProgressPercent = (p: ElementProgress) => {
    return p.totalItems > 0 ? Math.round((p.completedItems / p.totalItems) * 100) : 0;
  };

  const totalItems = getTotalItems();
  const criticalElements = getCriticalElements();
  const totalCompleted = Object.values(progress).reduce((acc, p) => acc + p.completedItems, 0);
  const overallProgress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const handleElementChange = (value: string) => {
    const num = parseInt(value);
    setActiveElement(num);
    onElementSelect?.(num);
  };

  const navigateElement = (direction: 'prev' | 'next') => {
    const newElement = direction === 'prev' 
      ? Math.max(1, activeElement - 1)
      : Math.min(13, activeElement + 1);
    setActiveElement(newElement);
    onElementSelect?.(newElement);
  };

  return (
    <div className="space-y-4">
      {/* Header com progresso geral */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold">Progresso Geral da Auditoria</h3>
              <p className="text-sm text-muted-foreground">
                {totalCompleted} de {totalItems} itens avaliados
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary">{overallProgress}%</span>
              <p className="text-xs text-muted-foreground">Conformidade</p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
          
          {/* Indicadores rápidos */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-destructive" />
              <span>{criticalElements.length} elementos críticos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-success" />
              <span>{Object.values(progress).filter(p => p.status === 'completed').length} concluídos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-warning" />
              <span>{Object.values(progress).filter(p => p.status === 'in_progress').length} em andamento</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação entre elementos */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateElement('prev')}
          disabled={activeElement === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <ScrollArea className="flex-1">
          <div className="flex gap-1 pb-2">
            {PEOTRAM_2024_ELEMENTS.map((element) => {
              const p = getProgressForElement(element.elementNumber);
              const percent = getProgressPercent(p);
              const Icon = ELEMENT_ICONS[element.elementNumber] || FileCheck;
              
              return (
                <Button
                  key={element.elementNumber}
                  variant={activeElement === element.elementNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleElementChange(element.elementNumber.toString())}
                  className={`flex-shrink-0 min-w-[100px] relative ${
                    element.isCritical ? 'border-destructive/50' : ''
                  }`}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  <span>Elem {element.elementNumber}</span>
                  {element.isCritical && (
                    <Star className="w-3 h-3 absolute -top-1 -right-1 text-destructive fill-destructive" />
                  )}
                  {percent > 0 && (
                    <span className={`ml-1 text-xs ${percent === 100 ? 'text-success' : 'text-muted-foreground'}`}>
                      {percent}%
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigateElement('next')}
          disabled={activeElement === 13}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Conteúdo do elemento ativo */}
      {PEOTRAM_2024_ELEMENTS.map((element) => {
        if (element.elementNumber !== activeElement) return null;
        
        const p = getProgressForElement(element.elementNumber);
        const percent = getProgressPercent(p);
        const Icon = ELEMENT_ICONS[element.elementNumber] || FileCheck;
        
        return (
          <Card key={element.id} className={element.isCritical ? 'border-destructive/30' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${element.isCritical ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    <Icon className={`w-6 h-6 ${element.isCritical ? 'text-destructive' : 'text-primary'}`} />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Elemento {element.elementNumber}: {element.elementName}
                      {element.isCritical && (
                        <Badge variant="destructive" className="ml-2">
                          <Star className="w-3 h-3 mr-1" />
                          Crítico
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {element.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(p.status)}>
                    {p.status === 'completed' ? 'Concluído' : 
                     p.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    Peso: {element.weightPercentage}%
                  </p>
                </div>
              </div>
              
              {/* Progresso do elemento */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progresso: {p.completedItems}/{p.totalItems} itens</span>
                  <span className="font-medium">{percent}%</span>
                </div>
                <Progress value={percent} className="h-2" />
              </div>

              {/* Documentação necessária */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-2">Documentação Necessária:</p>
                <div className="flex flex-wrap gap-1">
                  {element.documentationRequired.map((doc, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {/* Renderizar conteúdo customizado ou seções padrão */}
              {renderElementContent ? (
                renderElementContent(element)
              ) : (
                <div className="space-y-4">
                  {element.sections.map((section) => (
                    <div key={section.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">
                        {section.sectionNumber} - {section.sectionName}
                      </h4>
                      <div className="space-y-2">
                        {section.items.map((item) => (
                          <div 
                            key={item.id}
                            className="p-3 bg-muted/20 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors"
                            onClick={() => onItemSelect?.(element.elementNumber, item.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {item.itemNumber}: {item.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Ref: {item.normReference}
                                </p>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={
                                  item.criticalityLevel === 'critical' ? 'border-destructive text-destructive' :
                                  item.criticalityLevel === 'major' ? 'border-warning text-warning' :
                                  'border-muted'
                                }
                              >
                                {item.criticalityLevel}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default Peotram13ElementsTabs;
