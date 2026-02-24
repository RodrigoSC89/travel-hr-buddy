/**
 * Auth Page - PATCH v29 Cinematic Deep Ocean Login
 * Login, Signup, Password Recovery + OAuth + System Overview
 */
import React, { useState, useEffect, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  ChevronLeft,
  Ship, Users, Shield, FileText, Brain, Wrench,
  Compass, Satellite, Briefcase, Activity, BarChart3
} from "lucide-react";
import { toast } from "sonner";
import nautiLogo from "@/assets/nauti-one-logo.png";
import { logger } from '@/lib/logger';

// Schemas and types for forms
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

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleClearSession = async () => {
    setIsLoading(true);
    try {
      await clearSession();
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
      const progressToast = toast.loading("Conectando ao servidor...", {
        description: "Aguarde, tentando estabelecer conexão segura."
      });
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });
      toast.dismiss(progressToast);
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
      if (errorMessage.includes('CORS') ||
          errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('fetch') ||
          errorMessage.includes('network') ||
          errorMessage.includes('Load failed') ||
          errorMessage.includes('aborted') ||
          errorMessage.includes('ERR_FAILED')) {
        toast.error("Servidor indisponível", { 
          description: "O servidor está reiniciando. Aguarde 2-3 minutos e tente novamente.",
          duration: 15000,
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
      const redirectUrl = `${window.location.origin}/reset-password`;
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
    } catch {
      toast.error("Erro no login", { description: "Tente novamente." });
      setOauthLoading(null);
    }
  };

  const OAuthButtons = () => (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
           <span className="bg-[hsla(220,40%,8%,0.9)] px-3 text-[hsla(210,30%,60%,0.6)]">
            ou entre com
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthSignIn("google")}
          disabled={!!oauthLoading || isLoading}
          className="w-full border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-foreground"
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
          className="w-full border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-foreground"
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
          className="w-full border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-foreground"
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

  const TroubleshootingSection = () => (
    <div className="mt-4 p-4 bg-white/[0.03] rounded-lg space-y-3 border border-white/[0.06]">
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlertCircle className="h-4 w-4 text-warning" />
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
        className="w-full border-white/10 hover:bg-white/[0.06]"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Limpar sessão e cache
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen min-h-dvh flex items-center justify-center p-3 sm:p-6 overflow-hidden relative" style={{ background: '#040a18' }}>
      {/* === CINEMATIC DEEP OCEAN BACKGROUND === */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Deep space gradient base */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #040a18 0%, #0a1628 40%, #061224 100%)' }} />
        
        {/* Aurora borealis ribbon */}
        <motion.div
          className="absolute -top-20 left-0 right-0 h-[500px]"
          style={{ 
            background: 'linear-gradient(180deg, hsla(190, 95%, 50%, 0.07) 0%, hsla(214, 84%, 46%, 0.1) 30%, hsla(270, 70%, 55%, 0.05) 60%, transparent 100%)',
            filter: 'blur(60px)',
          }}
          animate={{ opacity: [0.4, 0.7, 0.4], scaleX: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Primary orb */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsla(214, 84%, 46%, 0.25) 0%, hsla(214, 84%, 46%, 0.04) 40%, transparent 70%)', filter: 'blur(80px)' }}
          animate={{ scale: [1, 1.25, 1], x: [0, 80, 0], y: [0, -50, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Cyan orb */}
        <motion.div
          className="absolute bottom-1/4 right-[10%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsla(190, 95%, 50%, 0.18) 0%, hsla(190, 95%, 50%, 0.02) 45%, transparent 70%)', filter: 'blur(70px)' }}
          animate={{ scale: [1.1, 0.85, 1.1], x: [0, -60, 0], y: [0, 60, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Purple orb */}
        <motion.div
          className="absolute top-2/3 left-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, hsla(270, 70%, 55%, 0.1) 0%, transparent 60%)', filter: 'blur(60px)' }}
          animate={{ scale: [0.9, 1.2, 0.9], x: [0, -50, 0], y: [0, -40, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Horizontal scan line */}
        <motion.div
          className="absolute left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent 0%, hsla(190, 95%, 60%, 0.35) 50%, transparent 100%)' }}
          animate={{ top: ['-2%', '102%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

      {/* Floating particles - distributed across full viewport */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${5 + (i * 8) % 90}%`,
              top: `${15 + ((i * 17) % 70)}%`,
              width: i % 4 === 0 ? 3 : 2,
              height: i % 4 === 0 ? 3 : 2,
              background: i % 4 === 0 
                ? 'hsla(190, 95%, 70%, 0.6)' 
                : i % 3 === 0 
                  ? 'hsla(214, 84%, 65%, 0.4)' 
                  : 'hsla(190, 80%, 60%, 0.2)',
              boxShadow: i % 4 === 0 ? '0 0 8px 2px hsla(190, 95%, 60%, 0.2)' : 'none',
            }}
            animate={{ 
              y: [0, -(20 + (i % 5) * 8), 0], 
              x: [0, (i % 2 === 0 ? 10 : -10), 0],
              opacity: [0, 0.5 + (i % 3) * 0.15, 0] 
            }}
            transition={{ duration: 6 + i * 0.5, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
          />
        ))}
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(hsla(190, 95%, 50%, 0.5) 1px, transparent 1px), linear-gradient(90deg, hsla(190, 95%, 50%, 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 35%, hsla(220, 60%, 4%, 0.7) 100%)' }} />
        
        {/* Edge lines */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, hsla(190,95%,50%,0.25), transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-40" style={{ background: 'linear-gradient(to top, hsla(214,84%,46%,0.06), transparent)' }} />
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, hsla(190,95%,50%,0.12), transparent)' }} />
      </div>

      {/* === MAIN CONTENT === */}
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-5xl grid lg:grid-cols-2 gap-6 lg:gap-12 items-center relative z-10"
      >
        {/* Left Side - System Showcase */}
        <motion.div
          initial={{ opacity: 0, x: -50, filter: "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="hidden lg:flex flex-col space-y-8 justify-center"
        >
          {/* Logo & Title - Cinematic */}
          <div className="flex items-center space-x-6">
            <motion.div 
              className="relative w-28 h-28 rounded-3xl flex items-center justify-center p-4 border border-[hsla(190,95%,50%,0.2)]"
              style={{
                background: 'linear-gradient(135deg, hsla(220, 40%, 12%, 0.9), hsla(220, 40%, 8%, 0.9))',
                boxShadow: '0 0 40px hsla(214, 84%, 46%, 0.2), 0 0 80px hsla(190, 95%, 50%, 0.06), inset 0 1px 0 hsla(0, 0%, 100%, 0.08)',
                backdropFilter: 'blur(20px)',
              }}
              whileHover={{ scale: 1.06, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.3 }}
            >
              {/* Animated glow ring */}
              <motion.div
                className="absolute inset-[-1px] rounded-3xl pointer-events-none"
                style={{ boxShadow: '0 0 25px hsla(190, 95%, 50%, 0.12), inset 0 0 25px hsla(190, 95%, 50%, 0.04)' }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <img src={nautiLogo} alt="Nauti One Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_12px_hsla(190,95%,50%,0.3)]" width={80} height={80} />
            </motion.div>
            <div>
              <motion.h1 
                className="text-5xl font-bold tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <span 
                  className="bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_4s_ease-in-out_infinite]"
                  style={{ backgroundImage: 'linear-gradient(90deg, #ffffff, hsla(190,95%,70%,1), #ffffff)' }}
                >
                  NAUTI ONE
                </span>
              </motion.h1>
              <motion.p 
                className="text-sm font-medium tracking-[0.3em] uppercase mt-1"
                style={{ color: 'hsla(190,95%,60%,0.6)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                Maritime Operations Platform
              </motion.p>
            </div>
          </div>

          {/* 7 Mega-Hubs */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsla(210, 30%, 55%, 0.6)' }}>
              7 Mega-Hubs • 75+ Módulos
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: 'Comando', desc: 'NOC, SOC, Alertas', icon: Compass, badge: '7' },
                { name: 'Operações', desc: 'Frota, Viagens', icon: Ship, badge: '7' },
                { name: 'Manutenção', desc: 'Preditiva, ESG', icon: Wrench, badge: '8' },
                { name: 'Inteligência IA', desc: '10 Agentes, Chat', icon: Brain, badge: '11' },
                { name: 'Rastreamento', desc: 'AIS, SATCOM, IoT', icon: Satellite, badge: '8' },
                { name: 'Compliance', desc: '12 Auditorias', icon: Shield, badge: '22' },
              ].map((hub, index) => (
                <motion.div
                  key={hub.name}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  whileHover={{ scale: 1.04, y: -3, transition: { type: "spring", stiffness: 400, damping: 20 } }}
                  className="rounded-xl p-3 flex items-center gap-3 transition-all duration-300 group cursor-default"
                  style={{
                    background: 'hsla(220, 40%, 12%, 0.5)',
                    border: '1px solid hsla(190, 95%, 50%, 0.08)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="relative">
                    <hub.icon className="h-4 w-4 text-primary shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold truncate text-white/90">{hub.name}</span>
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 shrink-0 font-bold bg-primary/15 text-primary border-primary/20">
                        {hub.badge}
                      </Badge>
                    </div>
                    <p className="text-[10px] truncate" style={{ color: 'hsla(210, 30%, 55%, 0.6)' }}>{hub.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2.5">
            {[
              "Controle de frota em tempo real",
              "12 Auditorias marítimas (ISM, MLC, SIRE, PSC...)",
              "10 Agentes IA especializados",
              "Compliance STCW, MLC 2006 & MARPOL"
            ].map((feature, i) => (
              <motion.div 
                key={feature} 
                className="flex items-center space-x-2.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
              >
                <div className="relative">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <motion.div
                    className="absolute inset-0 bg-success/30 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 0] }}
                    transition={{ delay: 1.2 + i * 0.15, duration: 0.6 }}
                  />
                </div>
                <span className="text-sm text-white/70">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side - Auth Forms */}
        <motion.div
          initial={{ opacity: 0, x: 50, filter: "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md mx-auto px-1 sm:px-0"
        >
          <Card 
            className="border-white/[0.08] relative overflow-hidden"
            style={{
              background: 'hsla(220, 40%, 8%, 0.85)',
              backdropFilter: 'blur(24px) saturate(1.5)',
              boxShadow: '0 0 60px hsla(214, 84%, 46%, 0.08), 0 25px 50px -12px hsla(0,0%,0%,0.5), inset 0 1px 0 hsla(0,0%,100%,0.05)',
            }}
          >
            {/* Top gradient line */}
            <motion.div 
              className="absolute top-0 left-0 right-0 h-[1px]"
              style={{ background: 'linear-gradient(90deg, transparent, hsla(190,95%,50%,0.5), transparent)' }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Side glow accents */}
            <div className="absolute top-0 left-0 w-[1px] h-full" style={{ background: 'linear-gradient(180deg, transparent, hsla(190,95%,50%,0.1), transparent)' }} />
            <div className="absolute top-0 right-0 w-[1px] h-full" style={{ background: 'linear-gradient(180deg, transparent, hsla(214,84%,46%,0.1), transparent)' }} />
            
            <CardHeader className="space-y-1.5 text-center pb-4">
              {/* Mobile logo */}
              <div className="lg:hidden flex flex-col items-center mb-5 gap-2">
                <motion.div 
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center p-3 sm:p-3.5 border border-[hsla(190,95%,50%,0.2)]"
                  style={{
                    background: 'linear-gradient(135deg, hsla(220, 40%, 12%, 0.9), hsla(220, 40%, 8%, 0.9))',
                    boxShadow: '0 0 30px hsla(214, 84%, 46%, 0.15), 0 0 60px hsla(190, 95%, 50%, 0.05)',
                  }}
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <img src={nautiLogo} alt="Nauti One" className="w-full h-full object-contain drop-shadow-[0_0_10px_hsla(190,95%,50%,0.25)]" width={72} height={72} />
                </motion.div>
                <motion.p 
                  className="text-[10px] font-medium tracking-[0.25em] uppercase"
                  style={{ color: 'hsla(190,95%,60%,0.5)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Maritime Operations Platform
                </motion.p>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                {activeTab === "signin" ? "Entrar na Conta" : 
                  activeTab === "signup" ? "Criar Conta" : 
                    "Recuperar Senha"}
              </CardTitle>
              <CardDescription style={{ color: 'hsla(210, 30%, 55%, 0.6)' }}>
                {activeTab === "signin" ? "Entre com suas credenciais para acessar o sistema" :
                  activeTab === "signup" ? "Crie sua conta para começar a usar o sistema" :
                    "Digite seu email para receber as instruções"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6 h-11 p-1 rounded-lg" style={{ background: 'hsla(220, 40%, 12%, 0.8)' }}>
                  <TabsTrigger value="signin" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsla(214,84%,46%,0.3)] transition-all duration-200">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_15px_hsla(214,84%,46%,0.3)] transition-all duration-200">
                    Cadastrar
                  </TabsTrigger>
                </TabsList>

                {/* Sign In Form */}
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-white/80">Email</Label>
                      <div className="relative group">
                        <Mail className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-200 ${
                          signInForm.formState.errors.email ? 'text-destructive' : 
                          signInForm.watch("email")?.includes("@") ? 'text-emerald-400' : 'text-muted-foreground'
                        }`} />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="seu@email.com"
                          className={`pl-10 bg-white/[0.04] text-white placeholder:text-white/30 transition-all duration-200 ${
                            signInForm.formState.errors.email 
                              ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/20' 
                              : signInForm.watch("email")?.includes("@")
                                ? 'border-emerald-500/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                                : 'border-white/[0.1] focus:border-primary/50 focus:ring-primary/20'
                          }`}
                          autoComplete="email"
                          {...signInForm.register("email")}
                        />
                        {signInForm.watch("email")?.includes("@") && !signInForm.formState.errors.email && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-3">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          </motion.div>
                        )}
                      </div>
                      {signInForm.formState.errors.email && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{signInForm.formState.errors.email.message}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-white/80">Senha</Label>
                      <div className="relative group">
                        <Lock className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-200 ${
                          signInForm.formState.errors.password ? 'text-destructive' : 
                          (signInForm.watch("password")?.length ?? 0) >= 6 ? 'text-emerald-400' : 'text-muted-foreground'
                        }`} />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua senha"
                          className={`pl-10 pr-10 bg-white/[0.04] text-white placeholder:text-white/30 transition-all duration-200 ${
                            signInForm.formState.errors.password
                              ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/20'
                              : (signInForm.watch("password")?.length ?? 0) >= 6
                                ? 'border-emerald-500/30 focus:border-emerald-500/50 focus:ring-emerald-500/20'
                                : 'border-white/[0.1] focus:border-primary/50 focus:ring-primary/20'
                          }`}
                          autoComplete="current-password"
                          {...signInForm.register("password")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/50 hover:text-white/80"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {signInForm.formState.errors.password && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{signInForm.formState.errors.password.message}
                        </motion.p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-sm text-primary/70 hover:text-primary"
                        onClick={() => setActiveTab("reset")}
                      >
                        Esqueceu a senha?
                      </Button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 text-sm font-semibold relative overflow-hidden" 
                      style={{
                        boxShadow: '0 0 20px hsla(214, 84%, 46%, 0.3)',
                      }}
                      size="lg" 
                      disabled={isLoading || authLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Entrar
                    </Button>
                  </form>

                  <OAuthButtons />
                  
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-white/30 hover:text-white/50 hover:bg-white/[0.03] gap-1.5"
                      onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                    >
                      <AlertCircle className="h-3 w-3" />
                      {showTroubleshooting ? "Ocultar ajuda" : "Problemas para entrar?"}
                    </Button>
                    {showTroubleshooting && <TroubleshootingSection />}
                  </div>
                </TabsContent>

                {/* Sign Up Form */}
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-white/80">Nome Completo</Label>
                      <div className="relative group">
                        <User className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-200 ${
                          signUpForm.formState.errors.fullName ? 'text-destructive' :
                          (signUpForm.watch("fullName")?.length ?? 0) >= 2 ? 'text-emerald-400' : 'text-muted-foreground'
                        }`} />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Seu nome completo"
                          className={`pl-10 bg-white/[0.04] text-white placeholder:text-white/30 transition-all duration-200 ${
                            signUpForm.formState.errors.fullName
                              ? 'border-destructive/50 focus:border-destructive'
                              : (signUpForm.watch("fullName")?.length ?? 0) >= 2
                                ? 'border-emerald-500/30 focus:border-emerald-500/50'
                                : 'border-white/[0.1] focus:border-primary/50'
                          }`}
                          autoComplete="name"
                          {...signUpForm.register("fullName")}
                        />
                        {(signUpForm.watch("fullName")?.length ?? 0) >= 2 && !signUpForm.formState.errors.fullName && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-3">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          </motion.div>
                        )}
                      </div>
                      {signUpForm.formState.errors.fullName && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{signUpForm.formState.errors.fullName.message}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-white/80">Email</Label>
                      <div className="relative group">
                        <Mail className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-200 ${
                          signUpForm.formState.errors.email ? 'text-destructive' :
                          signUpForm.watch("email")?.includes("@") ? 'text-emerald-400' : 'text-muted-foreground'
                        }`} />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu@email.com"
                          className={`pl-10 bg-white/[0.04] text-white placeholder:text-white/30 transition-all duration-200 ${
                            signUpForm.formState.errors.email
                              ? 'border-destructive/50 focus:border-destructive'
                              : signUpForm.watch("email")?.includes("@")
                                ? 'border-emerald-500/30 focus:border-emerald-500/50'
                                : 'border-white/[0.1] focus:border-primary/50'
                          }`}
                          autoComplete="email"
                          {...signUpForm.register("email")}
                        />
                        {signUpForm.watch("email")?.includes("@") && !signUpForm.formState.errors.email && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-3">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          </motion.div>
                        )}
                      </div>
                      {signUpForm.formState.errors.email && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{signUpForm.formState.errors.email.message}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-white/80">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          className="pl-10 pr-10 bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-white placeholder:text-white/30"
                          autoComplete="new-password"
                          {...signUpForm.register("password")}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-white/50 hover:text-white/80"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {/* Password Strength Indicator */}
                      {signUpForm.watch("password")?.length > 0 && (() => {
                        const pwd = signUpForm.watch("password") || "";
                        const checks = [
                          pwd.length >= 6,
                          /[A-Z]/.test(pwd),
                          /[0-9]/.test(pwd),
                          /[^A-Za-z0-9]/.test(pwd),
                        ];
                        const strength = checks.filter(Boolean).length;
                        const labels = ["Muito fraca", "Fraca", "Razoável", "Forte"];
                        const colors = [
                          "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"
                        ];
                        return (
                          <div className="space-y-1.5">
                            <div className="flex gap-1">
                              {[0, 1, 2, 3].map(i => (
                                <motion.div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? colors[strength - 1] : "bg-white/10"}`}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ delay: i * 0.05 }}
                                />
                              ))}
                            </div>
                            <p className={`text-[10px] ${strength <= 1 ? "text-red-400" : strength === 2 ? "text-amber-400" : strength === 3 ? "text-blue-400" : "text-emerald-400"}`}>
                              {labels[strength - 1] || "Muito fraca"}
                              {strength < 4 && <span className="text-white/30"> — Use maiúsculas, números e símbolos</span>}
                            </p>
                          </div>
                        );
                      })()}
                      {signUpForm.formState.errors.password && (
                        <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm" className="text-white/80">Confirmar Senha</Label>
                      <div className="relative group">
                        <Lock className={`absolute left-3 top-3 h-4 w-4 transition-colors duration-200 ${
                          signUpForm.formState.errors.confirmPassword ? 'text-destructive' :
                          (signUpForm.watch("confirmPassword")?.length ?? 0) >= 6 && signUpForm.watch("confirmPassword") === signUpForm.watch("password") ? 'text-emerald-400' : 'text-muted-foreground'
                        }`} />
                        <Input
                          id="signup-confirm"
                          type={showPassword ? "text" : "password"}
                          placeholder="Repita a senha"
                          className={`pl-10 bg-white/[0.04] text-white placeholder:text-white/30 transition-all duration-200 ${
                            signUpForm.formState.errors.confirmPassword
                              ? 'border-destructive/50 focus:border-destructive'
                              : (signUpForm.watch("confirmPassword")?.length ?? 0) >= 6 && signUpForm.watch("confirmPassword") === signUpForm.watch("password")
                                ? 'border-emerald-500/30 focus:border-emerald-500/50'
                                : 'border-white/[0.1] focus:border-primary/50'
                          }`}
                          autoComplete="new-password"
                          {...signUpForm.register("confirmPassword")}
                        />
                        {(signUpForm.watch("confirmPassword")?.length ?? 0) >= 6 && signUpForm.watch("confirmPassword") === signUpForm.watch("password") && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-3 top-3">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                          </motion.div>
                        )}
                      </div>
                      {signUpForm.formState.errors.confirmPassword && (
                        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />{signUpForm.formState.errors.confirmPassword.message}
                        </motion.p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      style={{ boxShadow: '0 0 20px hsla(214, 84%, 46%, 0.3)' }}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Criar Conta
                    </Button>
                  </form>

                  <OAuthButtons />
                </TabsContent>

                {/* Reset Password Form */}
                <TabsContent value="reset" className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mb-2 text-white/50 hover:text-white/80 hover:bg-white/[0.04] -ml-2"
                    onClick={() => setActiveTab("signin")}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Voltar para Login
                  </Button>
                  <div className="text-center mb-4">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm" style={{ color: 'hsla(210, 30%, 55%, 0.6)' }}>Enviaremos um link seguro para redefinir sua senha.</p>
                  </div>
                  <form onSubmit={resetForm.handleSubmit(handleResetPassword)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-white/80">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10 bg-white/[0.04] border-white/[0.1] focus:border-primary/50 text-white placeholder:text-white/30"
                          autoComplete="email"
                          {...resetForm.register("email")}
                        />
                      </div>
                      {resetForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{resetForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading} style={{ boxShadow: '0 0 20px hsla(214, 84%, 46%, 0.3)' }}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                      Enviar Email de Recuperação
                    </Button>
                  </form>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* About System CTA */}
          <motion.div 
            className="text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              variant="outline"
              className="w-full max-w-md border-[hsla(190,95%,50%,0.15)] hover:border-[hsla(190,95%,50%,0.35)] hover:shadow-[0_0_25px_hsla(190,95%,50%,0.08)] transition-all duration-300"
              style={{ color: 'hsla(190,95%,60%,0.8)', background: 'hsla(190,95%,50%,0.04)' }}
              onClick={() => navigate('/about')}
            >
              <Compass className="mr-2 h-4 w-4" />
              Conheça o Sistema Nauti One
            </Button>
          </motion.div>

          {/* Footer */}
          <p className="text-center text-xs mt-4 pb-safe" style={{ color: 'hsla(210,30%,50%,0.4)' }}>
            © {new Date().getFullYear()} Nauti One • Maritime Operations Platform
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
