/**
 * Auth Page - PATCH v28 Production Login + Live System Metrics
 * Login, Signup, Password Recovery + OAuth + System Overview
 */
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User,
  CheckCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
  Ship, Users, Shield, FileText, Brain, Wrench,
  Compass, Satellite, Briefcase, Activity, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import nautiLogo from "@/assets/nauti-one-logo.png";
import { logger } from '@/lib/logger';

const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

const signUpSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});

const resetSchema = z.object({
  email: z.string().email("Email inválido")
});

type SignInFormData = z.infer<typeof signInSchema>;
type SignUpFormData = z.infer<typeof signUpSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, clearSession } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  // All hooks must be called before any conditional returns
  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" }
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", fullName: "" }
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" }
  });

  // Live system metrics - visible without authentication
  const { data: systemStats } = useQuery({
    queryKey: ['auth-system-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_system_stats');
      if (error || !data) {
        return { vessels: 0, crew: 0, audits: 0, documents: 0, maintenance: 0, certificates: 0 };
      }
      return data as { vessels: number; crew: number; audits: number; documents: number; maintenance: number; certificates: number };
    },
    staleTime: 300000,
    retry: 1,
  });

  // Cleanup corrupted tokens on mount
  useEffect(() => {
    const cleanup = async () => {
      try {
        const keys = Object.keys(localStorage).filter(
          k => k.includes('supabase') || k.includes('sb-')
        );
        
        for (const key of keys) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const parsed = JSON.parse(value);
              if (parsed?.refresh_token && parsed.refresh_token.length < 20) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            localStorage.removeItem(key);
          }
        }
      } catch {
        // Ignore cleanup errors
      }
    };
    cleanup();
  }, []);

  // Redirect after all hooks
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleClearSession = async () => {
    setIsLoading(true);
    try {
      await clearSession();
      
      // Also clear SW caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      
      toast.success("Sessão e cache limpos", { description: "Tente fazer login novamente." });
    } catch {
      toast.error("Erro ao limpar sessão");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });
      
      if (error) {
        const errorMsg = error.message.toLowerCase();
        logger.error('[Auth] Login error:', { message: error.message, status: error.status });
        
        if (errorMsg.includes('invalid login credentials') || errorMsg.includes('invalid')) {
          toast.error("Credenciais inválidas", { description: "Email ou senha incorretos." });
        } else if (errorMsg.includes('email not confirmed')) {
          toast.error("Email não confirmado", { description: "Verifique seu email para confirmar a conta." });
        } else if (errorMsg.includes('too many requests')) {
          toast.error("Muitas tentativas", { description: "Aguarde alguns minutos e tente novamente." });
        } else if (errorMsg.includes('request') || errorMsg.includes('fetch') || errorMsg.includes('network')) {
          toast.error("Erro de conexão", { description: "Problema de rede. Tente novamente." });
          setShowTroubleshooting(true);
        } else {
          toast.error("Erro no login", { description: error.message || "Verifique suas credenciais e tente novamente." });
        }
      } else if (authData?.user) {
        toast.success("Login realizado com sucesso");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error('[Auth] Login exception:', errorMessage);
      
      // Handle network errors specifically  
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('fetch') ||
          errorMessage.includes('network') ||
          errorMessage.includes('Load failed') ||
          errorMessage.includes('aborted')) {
        toast.error("Erro de conexão", { 
          description: "Verifique sua conexão com a internet e tente novamente." 
        });
        setShowTroubleshooting(true);
      } else {
        toast.error("Erro ao processar login", { 
          description: errorMessage || "Tente novamente em alguns segundos." 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: data.fullName }
        }
      });

      if (error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('already registered') || errorMsg.includes('already exists')) {
          toast.error("Email já cadastrado", { description: "Tente fazer login ou recuperar a senha." });
        } else if (errorMsg.includes('weak password') || errorMsg.includes('password')) {
          toast.error("Senha muito fraca", { description: "Use pelo menos 6 caracteres com letras e números." });
        } else if (errorMsg.includes('invalid email')) {
          toast.error("Email inválido", { description: "Verifique o formato do email." });
        } else {
          toast.error("Erro no cadastro", { description: error.message });
        }
      } else {
        toast.success("Cadastro realizado!", {
          description: "Verifique seu email para confirmar a conta."
        });
        setActiveTab("signin");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '';
      
      // Handle network errors specifically
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('fetch') ||
          errorMessage.includes('network')) {
        toast.error("Erro de conexão", { 
          description: "Verifique sua conexão com a internet e tente novamente." 
        });
        setShowTroubleshooting(true);
      } else {
        toast.error("Erro no cadastro", { description: "Tente novamente em alguns segundos." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetFormData) => {
    setIsLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/auth?type=recovery`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email.toLowerCase().trim(), {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast.error("Erro", { description: error.message });
      } else {
        toast.success("Email enviado!", {
          description: "Verifique seu email para redefinir a senha."
        });
        setActiveTab("signin");
      }
    } catch {
      toast.error("Erro", { description: "Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github" | "azure") => {
    setOauthLoading(provider);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUrl }
      });

      if (error) {
        toast.error("Erro no login", { description: error.message });
        setOauthLoading(null);
      }
      // Don't reset loading on success - OAuth redirects
    } catch {
      toast.error("Erro no login", { description: "Tente novamente." });
      setOauthLoading(null);
    }
  };

  // OAuth buttons component
  const OAuthButtons = () => (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            ou continue com
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthSignIn("google")}
          disabled={!!oauthLoading || isLoading}
          className="w-full"
        >
          {oauthLoading === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Continuar com Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthSignIn("github")}
          disabled={!!oauthLoading || isLoading}
          className="w-full"
        >
          {oauthLoading === "github" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          )}
          Continuar com GitHub
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthSignIn("azure")}
          disabled={!!oauthLoading || isLoading}
          className="w-full"
        >
          {oauthLoading === "azure" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z"/>
              <path fill="#81bc06" d="M12 1h10v10H12z"/>
              <path fill="#05a6f0" d="M1 12h10v10H1z"/>
              <path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
          )}
          Continuar com Microsoft
        </Button>
      </div>
    </div>
  );

  // Troubleshooting section
  const TroubleshootingSection = () => (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlertCircle className="h-4 w-4 text-amber-500" />
        Problemas para entrar?
      </div>
      <div className="text-xs text-muted-foreground space-y-2">
        <p>Se você está tendo problemas de login, especialmente no iOS Safari:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Clique no botão abaixo para limpar a sessão</li>
          <li>Se usar PWA, remova o app e adicione novamente</li>
          <li>Limpe o cache do navegador (Safari: Ajustes → Safari → Limpar dados)</li>
        </ol>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClearSession}
        disabled={isLoading}
        className="w-full"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Limpar sessão e cache
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - System Showcase */}
        <div className="hidden lg:flex flex-col space-y-6">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-xl bg-card flex items-center justify-center shadow-lg p-2 border border-border">
              <img src={nautiLogo} alt="Nauti One Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                NAUTI ONE
              </h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
                Maritime Operations Platform
              </p>
            </div>
          </div>

          {/* Live System Stats */}
          {systemStats && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Sistema Ativo — Dados em Tempo Real
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Embarcações', value: systemStats.vessels, icon: Ship, color: 'text-blue-500' },
                  { label: 'Tripulantes', value: systemStats.crew, icon: Users, color: 'text-emerald-500' },
                  { label: 'Auditorias', value: systemStats.audits, icon: Shield, color: 'text-red-500' },
                  { label: 'Documentos', value: systemStats.documents, icon: FileText, color: 'text-amber-500' },
                  { label: 'Manutenções', value: systemStats.maintenance, icon: Wrench, color: 'text-orange-500' },
                  { label: 'Certificados', value: systemStats.certificates, icon: CheckCircle, color: 'text-teal-500' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card/80 border border-border/50 rounded-lg p-3 flex items-center gap-2.5"
                  >
                    <stat.icon className={`h-4 w-4 ${stat.color} shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-lg font-bold leading-tight">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7 Mega-Hubs */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              7 Mega-Hubs • 75+ Módulos
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Comando', desc: 'NOC, SOC, Alertas', icon: Compass, badge: '7' },
                { name: 'Operações', desc: 'Frota, Viagens', icon: Ship, badge: '7' },
                { name: 'Manutenção', desc: 'Preditiva, ESG', icon: Wrench, badge: '8' },
                { name: 'Inteligência IA', desc: '10 Agentes, Chat', icon: Brain, badge: '11' },
                { name: 'Rastreamento', desc: 'AIS, SATCOM, IoT', icon: Satellite, badge: '8' },
                { name: 'Compliance', desc: '12 Auditorias', icon: Shield, badge: '22' },
              ].map((hub) => (
                <div
                  key={hub.name}
                  className="bg-card/60 border border-border/30 rounded-lg p-2.5 flex items-center gap-2.5"
                >
                  <hub.icon className="h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold truncate">{hub.name}</span>
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 shrink-0">
                        {hub.badge}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{hub.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            {[
              "Controle de frota em tempo real",
              "12 Auditorias marítimas (ISM, MLC, SIRE, PSC...)",
              "10 Agentes IA especializados",
              "Compliance STCW, MLC 2006 & MARPOL"
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-border bg-card">
            <CardHeader className="space-y-1 text-center">
              {/* Mobile logo */}
              <div className="lg:hidden flex justify-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg p-1.5">
                  <img src={nautiLogo} alt="Nauti One" className="w-full h-full object-contain" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-card-foreground">
                {activeTab === "signin" ? "Entrar na Conta" : 
                  activeTab === "signup" ? "Criar Conta" : 
                    "Recuperar Senha"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {activeTab === "signin" ? "Entre com suas credenciais para acessar o sistema" :
                  activeTab === "signup" ? "Crie sua conta para começar a usar o sistema" :
                    "Digite seu email para receber as instruções"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Cadastrar
                  </TabsTrigger>
                </TabsList>

                {/* Sign In Form */}
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          autoComplete="email"
                          {...signInForm.register("email")}
                        />
                      </div>
                      {signInForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua senha"
                          className="pl-10 pr-10"
                          autoComplete="current-password"
                          {...signInForm.register("password")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {signInForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-sm"
                        onClick={() => setActiveTab("reset")}
                      >
                        Esqueceu a senha?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Entrar
                    </Button>
                  </form>

                  <OAuthButtons />
                  
                  {/* Troubleshooting toggle */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                    >
                      {showTroubleshooting ? "Ocultar" : "Problemas para entrar?"}
                    </Button>
                    {showTroubleshooting && <TroubleshootingSection />}
                  </div>
                </TabsContent>

                {/* Sign Up Form */}
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome completo"
                          className="pl-10"
                          autoComplete="name"
                          {...signUpForm.register("fullName")}
                        />
                      </div>
                      {signUpForm.formState.errors.fullName && (
                        <p className="text-sm text-destructive">{signUpForm.formState.errors.fullName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          autoComplete="email"
                          {...signUpForm.register("email")}
                        />
                      </div>
                      {signUpForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          className="pl-10 pr-10"
                          autoComplete="new-password"
                          {...signUpForm.register("password")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {signUpForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm"
                          type={showPassword ? "text" : "password"}
                          placeholder="Repita a senha"
                          className="pl-10"
                          autoComplete="new-password"
                          {...signUpForm.register("confirmPassword")}
                        />
                      </div>
                      {signUpForm.formState.errors.confirmPassword && (
                        <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Criar Conta
                    </Button>
                  </form>

                  <OAuthButtons />
                </TabsContent>

                {/* Reset Password Form */}
                <TabsContent value="reset" className="space-y-4">
                  <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          autoComplete="email"
                          {...resetForm.register("email")}
                        />
                      </div>
                      {resetForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Enviar Email de Recuperação
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab("signin")}
                    >
                      Voltar para Login
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Demo Access Button */}
          <div className="text-center mt-4">
            <Button
              variant="outline"
              className="w-full max-w-md border-primary/30 text-primary hover:bg-primary/5"
              onClick={() => navigate('/demo')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver Demo do Sistema (sem login)
            </Button>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} Nauti One. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
