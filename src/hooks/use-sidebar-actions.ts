import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';

// Hook para ações da navegação lateral
export const useSidebarActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { canAccessModule } = usePermissions();

  const handleNavigation = (module: string) => {
    switch (module) {
      case 'dashboard':
        navigate('/');
        break;
      case 'hr':
        navigate('/hr');
        break;
      case 'maritime':
        navigate('/maritime');
        break;
      case 'innovation':
        navigate('/innovation');
        break;
      case 'price-alerts':
        navigate('/price-alerts');
        break;
      case 'analytics':
        navigate('/analytics');
        break;
      case 'reservations':
        navigate('/');
        toast({
          title: "Reservas",
          description: "Carregando sistema de reservas",
        });
        break;
      case 'reports':
        navigate('/reports');
        break;
      case 'communication':
        navigate('/communication');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'admin':
        if (!canAccessModule('admin')) {
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar o painel administrativo.",
            variant: "destructive",
          });
          return;
        }
        navigate('/admin');
        break;
      case 'executive':
        navigate('/');
        toast({
          title: "Dashboard Executivo",
          description: "Carregando painel executivo",
        });
        break;
      case 'flights':
      case 'hotels':
      case 'travel':
        navigate('/travel');
        break;
      case 'fleet-management':
      case 'crew-management':
      case 'maritime-certifications':
        navigate('/maritime');
        break;
      case 'predictive-analytics':
      case 'automation':
        navigate('/innovation');
        break;
      case 'intelligence':
        navigate('/intelligence');
        break;
      case 'optimization':
        navigate('/optimization');
        break;
      default:
        toast({
          title: "Módulo",
          description: `Carregando ${module}`,
        });
        break;
    }
  };

  return { handleNavigation };
};