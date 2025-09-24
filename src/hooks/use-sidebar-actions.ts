import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Hook para ações da navegação lateral
export const useSidebarActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNavigation = (module: string) => {
    switch (module) {
      case 'dashboard':
        navigate('/');
        break;
      case 'hr':
        navigate('/hr');
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
        navigate('/');
        toast({
          title: "Comunicação",
          description: "Carregando módulo de comunicação",
        });
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'admin':
        navigate('/');
        toast({
          title: "Administração",
          description: "Carregando painel administrativo",
        });
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