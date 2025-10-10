import React, { useState, useCallback } from "react";
import { 
  Shield, 
  Smartphone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MFAChallenge {
  id: string;
  [key: string]: unknown;
}

interface MFAPromptProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const MFAPrompt: React.FC<MFAPromptProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState<MFAChallenge | null>(null);
  const [factorId, setFactorId] = useState<string>("");

  const initiateMFAChallenge = useCallback(async () => {
    try {
      // Get available factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const verifiedFactor = factorsData?.all?.find(f => f.status === "verified");
      if (!verifiedFactor) {
        toast({
          title: "2FA não configurado",
          description: "Configure a autenticação de dois fatores primeiro",
          variant: "destructive"
        });
        onCancel();
        return;
      }

      // Create challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id
      });
      
      if (challengeError) throw challengeError;

      setChallenge(challengeData);
      setFactorId(verifiedFactor.id);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao iniciar verificação 2FA",
        variant: "destructive"
      });
      onCancel();
    }
  }, [toast, onCancel]);

  React.useEffect(() => {
    initiateMFAChallenge();
  }, [initiateMFAChallenge]);

  const verifyMFA = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: "Código Inválido",
        description: "Digite um código de 6 dígitos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code
      });

      if (error) throw error;

      toast({
        title: "Verificação Concluída",
        description: "Código 2FA verificado com sucesso",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Código Incorreto",
        description: error instanceof Error ? error.message : "Verifique o código e tente novamente",
        variant: "destructive"
      });
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Verificação de Segurança</CardTitle>
          <CardDescription>
            Digite o código de 6 dígitos do seu app autenticador
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Abra seu app autenticador e digite o código atual para esta conta.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="mfa-code">Código de Verificação</Label>
            <Input
              id="mfa-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="text-center font-mono text-xl tracking-widest"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && code.length === 6) {
                  verifyMFA();
                }
              }}
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>O código expira em alguns minutos</span>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={verifyMFA}
              disabled={isLoading || code.length !== 6}
              className="flex-1"
            >
              {isLoading ? "Verificando..." : "Verificar"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Não consegue acessar seu app autenticador?{" "}
              <button 
                className="text-primary hover:underline"
                onClick={onCancel}
              >
                Cancelar login
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for easier MFA verification
export const useMFA = () => {
  const [showMFAPrompt, setShowMFAPrompt] = useState(false);
  const [mfaResolver, setMfaResolver] = useState<{
    resolve: (success: boolean) => void;
      } | null>(null);

  const requireMFA = (): Promise<boolean> => {
    return new Promise((resolve) => {
      setMfaResolver({ resolve });
      setShowMFAPrompt(true);
    });
  };

  const handleMFASuccess = () => {
    setShowMFAPrompt(false);
    mfaResolver?.resolve(true);
    setMfaResolver(null);
  };

  const handleMFACancel = () => {
    setShowMFAPrompt(false);
    mfaResolver?.resolve(false);
    setMfaResolver(null);
  };

  const MFAPromptComponent = showMFAPrompt ? (
    <MFAPrompt 
      onSuccess={handleMFASuccess}
      onCancel={handleMFACancel}
    />
  ) : null;

  return {
    requireMFA,
    MFAPromptComponent
  };
};