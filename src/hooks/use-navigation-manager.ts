import { useNavigate, NavigateOptions } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { isValidRoute, getSuggestion } from "@/utils/route-audit";

/**
 * Enhanced Navigation Manager with error handling, user feedback, and route validation
 */
export const useNavigationManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const navigateTo = (
    path: string,
    options?: NavigateOptions & { 
      showToast?: boolean;
      toastMessage?: string;
      skipValidation?: boolean;
    }
  ) => {
    try {
      const { showToast = false, toastMessage, skipValidation = false, ...navigateOptions } = options || {};
      
      // Validate route in development mode
      if (import.meta.env.DEV && !skipValidation && !isValidRoute(path)) {
        const suggestion = getSuggestion(path);
        console.warn(
          `[NavigationManager] Invalid route: "${path}"`,
          suggestion ? `\n  → Suggestion: "${suggestion}"` : "",
          "\n  → Add to VALID_ROUTES in src/utils/route-audit.ts if valid"
        );
        
        // Show toast warning in development
        toast({
          title: "⚠️ Rota Inválida (Dev)",
          description: suggestion 
            ? `"${path}" não existe. Use "${suggestion}"?` 
            : `"${path}" não encontrada no App.tsx`,
          variant: "destructive",
          duration: 5000,
        });
      }
      
      navigate(path, navigateOptions);
      
      if (showToast) {
        toast({
          title: "Navegação",
          description: toastMessage || "Redirecionando...",
          duration: 1000,
        });
      }
    } catch (error) {
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
      toast({
        title: "Erro de Navegação",
        description: "Não foi possível voltar.",
        variant: "destructive",
      });
    }
  };

  const navigateHome = () => {
    navigateTo("/central-comando", { replace: true, skipValidation: true });
  };

  /**
   * Navigate with automatic route suggestion/correction
   */
  const navigateSafe = (path: string, options?: NavigateOptions) => {
    const suggestion = getSuggestion(path);
    const targetPath = suggestion || path;
    
    if (suggestion && import.meta.env.DEV) {
      console.info(`[NavigationManager] Auto-corrected: "${path}" → "${suggestion}"`);
    }
    
    navigateTo(targetPath, { ...options, skipValidation: true });
  };

  return {
    navigateTo,
    navigateBack,
    navigateHome,
    navigateSafe,
    isValidRoute,
  };
};
