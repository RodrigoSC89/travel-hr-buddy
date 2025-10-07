import { useNavigate, NavigateOptions } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

/**
 * Enhanced Navigation Manager with error handling and user feedback
 */
export const useNavigationManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const navigateTo = (
    path: string,
    options?: NavigateOptions & { 
      showToast?: boolean;
      toastMessage?: string;
    }
  ) => {
    try {
      const { showToast = false, toastMessage, ...navigateOptions } = options || {};
      
      navigate(path, navigateOptions);
      
      if (showToast) {
        toast({
          title: "Navegação",
          description: toastMessage || "Redirecionando...",
          duration: 1000,
        });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Erro de Navegação",
        description: "Falha ao navegar. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const navigateBack = () => {
    try {
      navigate(-1);
    } catch (error) {
      console.error('Navigation back error:', error);
      toast({
        title: "Erro de Navegação",
        description: "Não foi possível voltar.",
        variant: "destructive",
      });
    }
  };

  const navigateHome = () => {
    navigateTo('/', { replace: true });
  };

  return {
    navigateTo,
    navigateBack,
    navigateHome,
  };
};
