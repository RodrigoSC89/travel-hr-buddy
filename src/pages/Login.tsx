import React, { useState, useCallback } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Anchor, Wifi, WifiOff, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [connectionError, setConnectionError] = useState(false);
  
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
      setConnectionError(false);
      setPassword("");
      toast.success("Sessão limpa com sucesso!");
    } catch (error) {
      console.error("Erro ao limpar sessão:", error);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    setErrorMessage("");
    setConnectionError(false);

    try {
      console.log("🔐 Tentando login...");
      
      // Login simples - sem retry complexo que pode causar race conditions
      const { error } = await signIn(email.toLowerCase().trim(), password);
      
      if (error) {
        // Classificar tipo de erro
        const errorMsg = error.message?.toLowerCase() || "";
        
        // Erros de rede/conexão
        if (errorMsg.includes("network") || 
            errorMsg.includes("fetch") || 
            errorMsg.includes("timeout") ||
            errorMsg.includes("retryable") ||
            errorMsg.includes("failed to fetch")) {
          setConnectionError(true);
          setErrorMessage("Problema de conexão. Verifique sua internet.");
        } 
        // Credenciais inválidas
        else if (errorMsg.includes("invalid") || errorMsg.includes("credentials")) {
          setErrorMessage("Email ou senha incorretos");
        }
        // Outros erros
        else {
          setErrorMessage(error.message || "Erro ao fazer login");
        }
      } else {
        // Sucesso! Não precisa navegar - AuthContext vai detectar sessão
        toast.success("Login realizado com sucesso!");
      }
      
    } catch (err: any) {
      console.error("Erro no login:", err);
      
      // Verificar se é erro de rede
      const isNetworkError = err.name === "TypeError" || 
                             err.message?.includes("fetch") ||
                             err.message?.includes("network");
      
      if (isNetworkError) {
        setConnectionError(true);
        setErrorMessage("Problema de conexão. Verifique sua internet.");
      } else {
        setErrorMessage(err.message || "Erro ao fazer login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/90 backdrop-blur-sm">
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
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                required
              />
            </div>

            {/* Mensagem de erro */}
            {errorMessage && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-700">
                <AlertDescription className="text-red-200">
                  ⚠️ {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Erro de conexão com opções */}
            {connectionError && (
              <Alert className="bg-amber-900/50 border-amber-700">
                <div className="flex items-center gap-2 mb-2">
                  <WifiOff className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-200 text-sm font-medium">
                    Problema de conexão detectado
                  </span>
                </div>
                <AlertDescription className="text-amber-300/80 text-xs">
                  O sistema está otimizado para conexões lentas (3G/4G/5G/Satélite).
                </AlertDescription>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearSession}
                  className="mt-2 text-amber-200 border-amber-600 hover:bg-amber-800/50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar sessão
                </Button>
              </Alert>
            )}

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
                  <Wifi className="h-4 w-4 mr-2" />
                  Entrar
                </>
              )}
            </Button>
          </form>

          {/* Info de conexão */}
          <div className="text-center text-xs text-slate-500 pt-2">
            💡 Otimizado para internet lenta (3G, 4G, 5G, Satélite)
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;