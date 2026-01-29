/**
 * SSO Login Button Component
 * Phase 3: Enterprise Security - Single Sign-On Integration
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Building2,
  ChevronRight,
  KeyRound,
  Loader2,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import { ssoManager, type SSOProvider, type SSOConfig } from "@/lib/security/sso-manager";

interface SSOProviderInfo {
  id: SSOProvider;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const SSO_PROVIDERS: SSOProviderInfo[] = [
  {
    id: "azure",
    name: "Microsoft",
    icon: (
      <svg viewBox="0 0 21 21" className="h-5 w-5" fill="currentColor">
        <rect x="1" y="1" width="9" height="9" fill="#f25022" />
        <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
        <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
      </svg>
    ),
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
  },
  {
    id: "google",
    name: "Google Workspace",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    color: "text-blue-600",
    bgColor: "bg-blue-600/10 hover:bg-blue-600/20",
  },
  {
    id: "okta",
    name: "Okta",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#007DC1">
        <path d="M12 0C5.389 0 0 5.35 0 12s5.35 12 12 12 12-5.35 12-12S18.611 0 12 0zm0 18c-3.325 0-6-2.675-6-6s2.675-6 6-6 6 2.675 6 6-2.675 6-6 6z" />
      </svg>
    ),
    color: "text-cyan-600",
    bgColor: "bg-cyan-600/10 hover:bg-cyan-600/20",
  },
];

interface SSOLoginButtonProps {
  onSuccess?: (session: { provider: SSOProvider; email: string }) => void;
  onError?: (error: Error) => void;
  providers?: SSOProvider[];
  showEnterpriseBadge?: boolean;
  compact?: boolean;
  config?: Partial<SSOConfig>;
}

export function SSOLoginButton({
  onSuccess,
  onError,
  providers,
  showEnterpriseBadge = true,
  compact = false,
  config,
}: SSOLoginButtonProps) {
  const [isLoading, setIsLoading] = useState<SSOProvider | "detecting" | null>(null);
  const [showDomainInput, setShowDomainInput] = useState(false);
  const [domain, setDomain] = useState("");

  const filteredProviders = providers
    ? SSO_PROVIDERS.filter((p) => providers.includes(p.id))
    : SSO_PROVIDERS;

  useEffect(() => {
    // Configure SSO if config provided
    if (config) {
      ssoManager.configure(config as SSOConfig);
    }
  }, [config]);

  const handleSSOLogin = async (providerId: SSOProvider) => {
    setIsLoading(providerId);
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      // Configure provider if not already configured
      if (!ssoManager.getSession()) {
        const defaultConfig: SSOConfig = {
          provider: providerId,
          clientId: "demo-client-id", // In production, use real client ID
          scopes: ["openid", "profile", "email"],
          tenantId: providerId === "azure" ? "common" : undefined,
          domain: domain || undefined,
        };
        ssoManager.configure(config as SSOConfig || defaultConfig);
      }

      let loginUrl: string;
      
      switch (providerId) {
        case "azure":
          loginUrl = ssoManager.getAzureADLoginUrl(redirectUri);
          break;
        case "okta":
          loginUrl = ssoManager.getOktaLoginUrl(redirectUri);
          break;
        case "google":
          loginUrl = ssoManager.getGoogleWorkspaceLoginUrl(redirectUri);
          break;
        default:
          throw new Error("Unsupported provider");
      }

      // Store provider for callback handling
      sessionStorage.setItem("sso_provider", providerId);
      
      // Redirect to SSO provider
      window.location.href = loginUrl;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "SSO login failed";
      toast.error(errorMessage);
      onError?.(new Error(errorMessage));
      setIsLoading(null);
    }
  };

  const handleDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      toast.error("Por favor, insira o domínio da sua organização");
      return;
    }
    // Try to detect provider based on domain
    toast.info("Selecione um provedor SSO para continuar");
    setShowDomainInput(false);
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        {filteredProviders.map((provider) => (
          <motion.div key={provider.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleSSOLogin(provider.id)}
              disabled={isLoading !== null}
              className={provider.bgColor}
              title={`Login com ${provider.name}`}
            >
              {isLoading === provider.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                provider.icon
              )}
            </Button>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Single Sign-On</CardTitle>
          {showEnterpriseBadge && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 rounded-full border border-amber-500/30">
              <Sparkles className="h-3 w-3" />
              Enterprise
            </span>
          )}
        </div>
        <CardDescription>
          Faça login com a conta da sua organização
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Domain Input Option */}
        {showDomainInput ? (
          <form onSubmit={handleDomainSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="domain">Domínio da organização</Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  type="text"
                  placeholder="suaempresa.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={isLoading !== null}
                />
                <Button type="submit" disabled={isLoading !== null}>
                  {isLoading === "detecting" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowDomainInput(false)}
            >
              Voltar para provedores
            </Button>
          </form>
        ) : (
          <>
            {/* SSO Provider Buttons */}
            <div className="space-y-2">
              {filteredProviders.map((provider) => (
                <motion.div
                  key={provider.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Button
                    variant="outline"
                    className={`w-full justify-start gap-3 h-12 ${provider.bgColor}`}
                    onClick={() => handleSSOLogin(provider.id)}
                    disabled={isLoading !== null}
                  >
                    {isLoading === provider.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      provider.icon
                    )}
                    <span className="flex-1 text-left">Continuar com {provider.name}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                ou
              </span>
            </div>

            {/* Domain Discovery Option */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setShowDomainInput(true)}
            >
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-left">Usar domínio da empresa</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </>
        )}

        {/* Security Note */}
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            SSO usa autenticação segura da sua organização. Suas credenciais nunca são
            compartilhadas com terceiros.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SSO Callback Handler Component
 * Handles the callback from SSO providers
 */
export function SSOCallbackHandler({
  onSuccess,
  onError,
}: {
  onSuccess?: (session: { provider: SSOProvider; email: string }) => void;
  onError?: (error: Error) => void;
}) {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processando autenticação...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const error = params.get("error");

        if (error) {
          throw new Error(params.get("error_description") || error);
        }

        if (!code) {
          throw new Error("Código de autorização não encontrado");
        }

        // Validate state
        if (state && !ssoManager.validateState(state)) {
          throw new Error("Parâmetros de autenticação inválidos (state mismatch)");
        }

        // Get provider from session
        const provider = (sessionStorage.getItem("sso_provider") || "azure") as SSOProvider;
        sessionStorage.removeItem("sso_provider");

        const session = await ssoManager.handleCallback(code, provider);

        setStatus("success");
        setMessage("Login realizado com sucesso!");
        toast.success("Bem-vindo!");
        onSuccess?.({ provider: session.provider, email: session.email });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
        setStatus("error");
        setMessage(errorMessage);
        toast.error(errorMessage);
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    };

    handleCallback();
  }, [onSuccess, onError]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          {status === "processing" && (
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          )}
          {status === "success" && (
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
              <KeyRound className="h-6 w-6 text-green-600" />
            </div>
          )}
          {status === "error" && (
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
          )}
          <p className={status === "error" ? "text-destructive" : "text-muted-foreground"}>
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default SSOLoginButton;
