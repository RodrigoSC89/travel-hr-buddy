import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown,
  ChevronUp,
  Zap,
  Settings,
  Search,
  Download,
  RefreshCw,
  Plus,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DraggableFloating from '@/components/ui/draggable-floating';
import { FloatingShortcutButton } from '@/components/ui/floating-shortcut-button';

interface ModuleAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

interface ModuleActionButtonProps {
  moduleId: string;
  moduleName: string;
  moduleIcon?: React.ReactNode;
  actions: ModuleAction[];
  quickActions?: ModuleAction[];
  storageKey?: string;
}

export const ModuleActionButton: React.FC<ModuleActionButtonProps> = ({
  moduleId,
  moduleName,
  moduleIcon = <Zap className="h-4 w-4" />,
  actions,
  quickActions = [],
  storageKey
}) => {
  const [isMinimized, setIsMinimized] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const finalStorageKey = storageKey || `${moduleId}_action_button_pos`;

  if (isMinimized) {
    return (
      <DraggableFloating
        storageKey={`${finalStorageKey}_toggle`}
        defaultPosition={() => ({
          x: Math.max(8, window.innerWidth - 48 - 16),
          y: Math.max(8, window.innerHeight - 48 - 96),
        })}
        zIndex={10050}
        ariaLabel={`Botão de Ações ${moduleName}`}
      >
        <FloatingShortcutButton
          icon={moduleIcon}
          onClick={() => setIsMinimized(false)}
          label={`Ações ${moduleName}`}
          bgColor="bg-azure-700 hover:bg-azure-800"
          iconColor="text-azure-50"
          size="md"
          ariaLabel={`Abrir ações do módulo ${moduleName}`}
          tabIndex={0}
        />
      </DraggableFloating>
    );
  }

  return (
    <DraggableFloating
      storageKey={`${finalStorageKey}_panel`}
      defaultPosition={() => ({
        x: Math.max(8, window.innerWidth - 300 - 16),
        y: Math.max(8, window.innerHeight - 200 - 120),
      })}
      zIndex={10050}
      ariaLabel={`Painel de Ações ${moduleName}`}
    >
      <Card className="p-4 shadow-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-w-sm">
        <div className="flex items-center gap-2 mb-4">
          {moduleIcon}
          <span className="text-sm font-semibold">{moduleName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="ml-auto h-6 w-6 p-0"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      
        <div className="space-y-4">
          {/* Main Actions */}
          {actions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground font-medium">Ações Principais</div>
              <div className="grid grid-cols-2 gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={action.action}
                    className="h-10 flex flex-col items-center gap-1"
                    title={action.shortcut}
                  >
                    {action.icon}
                    <span className="text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div className="space-y-2 border-t pt-3">
              <div className="text-xs text-muted-foreground font-medium">Ações Rápidas</div>
              <div className="flex flex-wrap gap-1">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    variant={action.variant || "ghost"}
                    size="sm"
                    onClick={action.action}
                    className="h-8"
                    title={action.shortcut}
                  >
                    {action.icon}
                    <span className="ml-1 text-xs">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="border-t pt-3">
            <div className="text-xs text-muted-foreground">
              Arraste para reposicionar • <Badge variant="outline" className="text-xs">ESC</Badge> para minimizar
            </div>
          </div>
        </div>
      </Card>
    </DraggableFloating>
  );
};

export default ModuleActionButton;