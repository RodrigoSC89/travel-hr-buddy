import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  RefreshCw, 
  Settings, 
  Bell,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DraggableFloating from '@/components/ui/draggable-floating';

interface QuickActionsBarProps {
  onOpenSearch: () => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onOpenSearch }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [expandedButton, setExpandedButton] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const quickActions = [
    {
      id: 'search',
      label: 'Buscar',
      icon: <Search className="h-4 w-4" />,
      action: onOpenSearch,
      shortcut: 'Ctrl+K'
    },
    {
      id: 'new',
      label: 'Novo',
      icon: <Plus className="h-4 w-4" />,
      hasDropdown: true,
      items: [
        { label: 'Nova Reserva', action: () => navigate('/reservations') },
        { label: 'Novo Funcionário', action: () => navigate('/hr') },
        { label: 'Nova Viagem', action: () => navigate('/travel') },
        { label: 'Novo Alerta', action: () => navigate('/price-alerts') }
      ]
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: <Download className="h-4 w-4" />,
      action: () => {
        toast({
          title: "Exportando Dados",
          description: "Preparando relatório em PDF...",
        });
        setTimeout(() => {
          toast({
            title: "Export Concluído",
            description: "Relatório baixado com sucesso",
          });
        }, 2000);
      }
    },
    {
      id: 'refresh',
      label: 'Atualizar',
      icon: <RefreshCw className="h-4 w-4" />,
      action: () => {
        toast({
          title: "Atualizando",
          description: "Carregando dados mais recentes...",
        });
        setTimeout(() => window.location.reload(), 1000);
      },
      shortcut: 'F5'
    }
  ];

  const navigationShortcuts = [
    { label: 'Dashboard', icon: <FileText className="h-3 w-3" />, route: '/', shortcut: 'Ctrl+1' },
    { label: 'Viagens', icon: <Calendar className="h-3 w-3" />, route: '/travel', shortcut: 'Ctrl+2' },
    { label: 'RH', icon: <Users className="h-3 w-3" />, route: '/hr', shortcut: 'Ctrl+3' },
    { label: 'Alertas', icon: <TrendingUp className="h-3 w-3" />, route: '/price-alerts', shortcut: 'Ctrl+4' },
  ];

  if (!isVisible) {
    return (
      <DraggableFloating
        storageKey="quick_actions_toggle_pos"
        defaultPosition={() => ({
          x: Math.max(8, window.innerWidth - 48 - 16),
          y: Math.max(8, window.innerHeight - 48 - 96),
        })}
        zIndex={40}
        ariaLabel="Botão de Ações Rápidas"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="shadow-lg"
        >
          <Zap className="h-4 w-4" />
        </Button>
      </DraggableFloating>
    );
  }

  return (
    <DraggableFloating
      storageKey="quick_actions_panel_pos"
      defaultPosition={() => ({
        x: Math.max(8, window.innerWidth - 280 - 16),
        y: Math.max(8, window.innerHeight - 180 - 120),
      })}
      zIndex={40}
      ariaLabel="Painel de Ações Rápidas"
    >
      <Card className="p-3 shadow-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-w-xs">
        <div className="flex items-center gap-2 mb-2">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Ações Rápidas</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="ml-auto h-6 w-6 p-0"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {/* Quick Actions */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {quickActions.map((action) => (
              action.hasDropdown ? (
                <div key={action.id} className="relative">
                  <Button
                    variant={expandedButton === action.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setExpandedButton(expandedButton === action.id ? null : action.id)}
                    className="h-8"
                  >
                    {action.icon}
                    <span className="ml-1 text-xs">{action.label}</span>
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${
                      expandedButton === action.id ? 'rotate-180' : ''
                    }`} />
                  </Button>
                </div>
              ) : (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="h-8"
                  title={action.shortcut}
                >
                  {action.icon}
                  <span className="ml-1 text-xs">{action.label}</span>
                </Button>
              )
            ))}
          </div>
          
          {/* Expanded Dropdown Content */}
          {expandedButton && (
            <div className="bg-muted/50 border rounded-lg p-2 space-y-1">
              {quickActions
                .find(action => action.id === expandedButton)
                ?.items?.map((item, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      item.action();
                      setExpandedButton(null);
                    }}
                    className="w-full justify-start h-7 text-xs"
                  >
                    {item.label}
                  </Button>
                ))}
            </div>
          )}
        </div>

        {/* Navigation Shortcuts */}
        <div className="border-t pt-2">
          <div className="text-xs text-muted-foreground mb-1">Navegação</div>
          <div className="flex flex-wrap gap-1">
            {navigationShortcuts.map((nav) => (
              <Button
                key={nav.route}
                variant="ghost"
                size="sm"
                onClick={() => navigate(nav.route)}
                className="h-7 text-xs"
                title={nav.shortcut}
              >
                {nav.icon}
                <span className="ml-1">{nav.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="border-t pt-2">
          <div className="text-xs text-muted-foreground">
            Pressione <Badge variant="outline" className="text-xs">Ctrl+K</Badge> para busca global
          </div>
        </div>
      </div>
      </Card>
    </DraggableFloating>
  );
};