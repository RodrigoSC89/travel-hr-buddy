import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/use-permissions';

// Hook para ações da navegação lateral
export const useSidebarActions = () => {
  // Usar hook de navegação de forma segura
  let navigate: any = null;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn('useNavigate not available in current context');
  }
  
  const { toast } = useToast();
  const { user } = useAuth();
  const { canAccessModule } = usePermissions();

  const handleNavigation = (module: string) => {
    if (!navigate) {
      toast({
        title: "Navegação não disponível",
        description: "Sistema de navegação não está disponível neste contexto.",
        variant: "destructive",
      });
      return;
    }
    
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
        toast({
          title: "Viagens",
          description: "Abrindo sistema de viagens corporativas",
        });
        break;
      case 'fleet-management':
      case 'crew-management':
      case 'maritime-certifications':
      case 'maritime':
        navigate('/maritime');
        toast({
          title: "Sistema Marítimo",
          description: "Abrindo gestão marítima",
        });
        break;
      case 'automation':
        navigate('/innovation');
        toast({
          title: "Inovação",
          description: "Abrindo centro de inovação",
        });
        break;
      case 'intelligence':
        navigate('/intelligence');
        toast({
          title: "Inteligência",
          description: "Abrindo sistema de inteligência",
        });
        break;
      case 'optimization':
        navigate('/optimization');
        toast({
          title: "Otimização",
          description: "Abrindo sistema de otimização",
        });
        break;
      case 'strategic':
        navigate('/strategic');
        toast({
          title: "Estratégico",
          description: "Abrindo central estratégica",
        });
        break;
      case 'voice':
        navigate('/voice');
        toast({
          title: "Assistente de Voz",
          description: "Abrindo interface de voz",
        });
        break;
      case 'portal':
        navigate('/portal');
        toast({
          title: "Portal do Funcionário",
          description: "Abrindo portal do funcionário",
        });
        break;
      case 'gamification':
        navigate('/gamification');
        toast({
          title: "Gamificação",
          description: "Abrindo sistema de gamificação",
        });
        break;
      case 'ar':
        navigate('/ar');
        toast({
          title: "Realidade Aumentada",
          description: "Abrindo interface AR",
        });
        break;
      case 'iot':
        navigate('/iot');
        toast({
          title: "IoT Dashboard",
          description: "Abrindo dashboard IoT",
        });
        break;
      case 'blockchain':
        navigate('/blockchain');
        toast({
          title: "Blockchain",
          description: "Abrindo sistema blockchain",
        });
        break;
      case 'predictive-analytics':
        navigate('/predictive-analytics');
        toast({
          title: "Análise Preditiva",
          description: "Abrindo análise preditiva",
        });
        break;
      default:
        // Verificar se existe rota correspondente
        const validRoutes = [
          'dashboard', 'hr', 'maritime', 'innovation', 'price-alerts', 'analytics', 
          'reservations', 'reports', 'communication', 'settings', 'admin', 
          'intelligence', 'optimization', 'strategic', 'travel', 'voice', 'portal',
          'gamification', 'ar', 'iot', 'blockchain', 'predictive-analytics'
        ];
        
        if (validRoutes.includes(module)) {
          navigate(`/${module}`);
          toast({
            title: "Navegação",
            description: `Abrindo ${module}`,
          });
        } else {
          console.log('Unknown module:', module);
          toast({
            title: "Módulo não encontrado",
            description: `O módulo "${module}" não foi encontrado`,
            variant: "destructive",
          });
        }
        break;
    }
  };

  return { handleNavigation };
};