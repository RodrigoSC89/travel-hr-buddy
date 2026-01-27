import React, { useState, useCallback } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Anchor, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // PATCH iOS PWA v16: Removido connectionError - nunca usado
  // const [connectionError, setConnectionError] = useState(false);
  
  const { signIn } = useAuth();

  // Limpar sessão corrompida
  const handleClearSession = useCallback(() => {
    try {
      localStorage.removeItem('sb-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Limpar todos os itens do Supabase
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      setErrorMessage("");
      setPassword("");
      toast.success("Sessão limpa com sucesso!");
    } catch (error) {
      logger.error("Erro ao limpar sessão", error);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    setErrorMessage("");
    // PATCH iOS PWA v16: Sem verificação de conexão - não é confiável no iOS

    try {
      logger.info("Tentando login...");
      
      // Login simples - sem retry complexo que pode causar race conditions
      const { error } = await signIn(email.toLowerCase().trim(), password);
      
      if (error) {
        // Classificar tipo de erro
        const errorMsg = error.message?.toLowerCase() || "";
        
        // PATCH iOS PWA: NUNCA mostrar "Problema de conexão"
        // O iOS PWA frequentemente retorna erros de rede falsos positivos
        // Apenas mostrar erros específicos de credenciais
        
        if (errorMsg.includes("invalid") || errorMsg.includes("credentials")) {
          setErrorMessage("Email ou senha incorretos");
        } else if (errorMsg.includes("email not confirmed")) {
          setErrorMessage("Confirme seu email antes de entrar");
        } else if (errorMsg.includes("too many requests")) {
          setErrorMessage("Muitas tentativas. Aguarde um momento.");
        } else {
          // Para QUALQUER outro erro (incluindo rede), mensagem genérica
          // NÃO mencionar conexão - o iOS PWA não é confiável nesse diagnóstico
          setErrorMessage("Verifique suas credenciais e tente novamente");
        }
      } else {
        // Sucesso! Não precisa navegar - AuthContext vai detectar sessão
        toast.success("Login realizado com sucesso!");
      }
      
    } catch (error: unknown) {
      // PATCH iOS PWA: Nunca mostrar erro de conexão
      // Apenas mensagem genérica para qualquer exceção
      setErrorMessage("Tente novamente em alguns segundos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <Card className="w-full max-w-md border-border bg-card/90 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Anchor className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Nautilus One</CardTitle>
          <CardDescription className="text-slate-400">
            Gestão Operacional Marítima
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                required
              />
            </div>

            {/* Mensagem de erro */}
            {errorMessage && (
              <Alert variant="destructive" className="bg-destructive/10 border-destructive">
                <AlertDescription className="text-destructive">
                  ⚠️ {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* REMOVIDO: Erro de conexão - não é confiável no iOS PWA */}
            {/* O connectionError nunca mais será true, mantido por compatibilidade */}

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Anchor className="h-4 w-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          {/* Info de conexão */}
          <div className="text-center text-xs text-muted-foreground pt-2">
            💡 Otimizado para internet lenta (3G, 4G, 5G, Satélite)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;