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

interface QuickActionsBarProps {
  onOpenSearch: () => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onOpenSearch }) => {
  const [isVisible, setIsVisible] = useState(true);
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed right-4 bottom-20 md:right-6 md:bottom-6 z-40 shadow-lg"
      >
        <Zap className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed right-4 bottom-20 md:right-6 md:bottom-6 z-40 p-3 shadow-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 max-w-xs">
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
        <div className="flex flex-wrap gap-1">
          {quickActions.map((action) => (
            action.hasDropdown ? (
              <DropdownMenu key={action.id}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    {action.icon}
                    <span className="ml-1 text-xs">{action.label}</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {action.items?.map((item, index) => (
                    <DropdownMenuItem key={index} onClick={item.action}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
  );
};