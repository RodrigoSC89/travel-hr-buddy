import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  KeyRound, 
  Copy, 
  Check,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TwoFactorSettingsProps {
  onClose?: () => void;
}

export const TwoFactorSettings: React.FC<TwoFactorSettingsProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'enabled'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [factorId, setFactorId] = useState<string>('');
  const [factors, setFactors] = useState<any[]>([]);

  useEffect(() => {
    checkExistingFactors();
  }, []);

  const checkExistingFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      if (data?.all && data.all.length > 0) {
        setFactors(data.all);
        const enabledFactor = data.all.find(f => f.status === 'verified');
        if (enabledFactor) {
          setStep('enabled');
        }
      }
    } catch (error) {
      console.error('Error checking MFA factors:', error);
    }
  };

  const setupTwoFactor = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep('verify');
      
      toast({
        title: "2FA Configurado",
        description: "Escaneie o QR Code com seu app autenticador",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao configurar 2FA",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Código Inválido",
        description: "Por favor, digite um código de 6 dígitos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: factorId,
        code: verificationCode
      });

      if (error) throw error;

      setStep('enabled');
      await checkExistingFactors();
      
      toast({
        title: "2FA Ativado",
        description: "Autenticação de dois fatores foi ativada com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Código Incorreto",
        description: "Verifique o código e tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async (factorId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      await checkExistingFactors();
      setStep('setup');
      
      toast({
        title: "2FA Desativado",
        description: "Autenticação de dois fatores foi desativada",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao desativar 2FA",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copiado",
      description: "Código copiado para a área de transferência",
    });
  };

  const renderSetupStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Ativar Autenticação de Dois Fatores</h3>
          <p className="text-muted-foreground">
            Adicione uma camada extra de segurança à sua conta
          </p>
        </div>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Você precisará de um app autenticador como Google Authenticator, Authy ou Microsoft Authenticator.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          Como funciona:
        </h4>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>1. Configure seu app autenticador</li>
          <li>2. Escaneie o QR Code ou digite o código manualmente</li>
          <li>3. Digite o código de 6 dígitos para verificar</li>
          <li>4. Pronto! Sua conta estará mais segura</li>
        </ol>
      </div>

      <Button 
        onClick={setupTwoFactor} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Configurando..." : "Configurar 2FA"}
      </Button>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <KeyRound className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Verificar Configuração</h3>
          <p className="text-muted-foreground">
            Escaneie o QR Code ou digite o código no seu app
          </p>
        </div>
      </div>

      {qrCode && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border">
              <img src={qrCode} alt="QR Code" className="w-40 h-40" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ou digite este código manualmente:</Label>
            <div className="flex items-center gap-2">
              <Input
                value={secret}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(secret)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="code">Código de Verificação (6 dígitos)</Label>
        <Input
          id="code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="text-center font-mono text-lg tracking-widest"
          maxLength={6}
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep('setup')}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button
          onClick={verifyTwoFactor}
          disabled={isLoading || verificationCode.length !== 6}
          className="flex-1"
        >
          {isLoading ? "Verificando..." : "Verificar"}
        </Button>
      </div>
    </div>
  );

  const renderEnabledStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <Shield className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">2FA Ativado</h3>
          <p className="text-muted-foreground">
            Sua conta está protegida com autenticação de dois fatores
          </p>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Sua conta agora requer um código do seu app autenticador para fazer login.
        </AlertDescription>
      </Alert>

      {factors.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Fatores de Autenticação:</h4>
          {factors.map((factor) => (
            <div key={factor.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">App Autenticador</p>
                  <p className="text-sm text-muted-foreground">
                    Status: {factor.status === 'verified' ? 'Ativo' : 'Pendente'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={factor.status === 'verified' ? 'default' : 'secondary'}>
                  {factor.status === 'verified' ? 'Ativo' : 'Pendente'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disableTwoFactor(factor.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {factors.length === 0 && (
        <Button 
          onClick={() => setStep('setup')} 
          variant="outline"
          className="w-full"
        >
          Configurar Novo Fator
        </Button>
      )}
    </div>
  );

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Autenticação de Dois Fatores
        </CardTitle>
        <CardDescription>
          Proteja sua conta com uma camada adicional de segurança
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'setup' && renderSetupStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'enabled' && renderEnabledStep()}
      </CardContent>
    </Card>
  );
};