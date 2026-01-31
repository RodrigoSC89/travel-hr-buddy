import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Lock, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export default function SecuritySettings() {
  const navigate = useNavigate();
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  // Get current user security status
  const { data: securityStatus, refetch } = useQuery({
    queryKey: ['security-status'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if 2FA is enabled (would come from user metadata in production)
      const has2FA = user.user_metadata?.has_2fa ?? false;
      const lastPasswordChange = user.updated_at;

      return {
        has2FA,
        lastPasswordChange,
        email: user.email,
        emailVerified: user.email_confirmed_at !== null,
      };
    },
  });

  const enable2FA = async () => {
    setEnabling2FA(true);
    try {
      const { data, error } = await supabase.functions.invoke('enable-2fa');
      if (error) throw error;

      if (data?.qr_code) {
        setQrCode(data.qr_code);
        toast.success('Escaneie o QR code com seu app autenticador');
      } else {
        toast.success('2FA configurado com sucesso!');
        refetch();
      }
    } catch {
      toast.error('Erro ao ativar 2FA. Tente novamente.');
    } finally {
      setEnabling2FA(false);
    }
  };

  const requestPasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        securityStatus?.email || '',
        { redirectTo: `${window.location.origin}/auth/callback` }
      );
      if (error) throw error;
      toast.success('Email de redefinição enviado!');
    } catch (error) {
      toast.error('Erro ao enviar email de redefinição');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Segurança & Autenticação
            </h1>
            <p className="text-muted-foreground">
              Gerencie as configurações de segurança da sua conta
            </p>
          </div>
        </div>

        {/* Security Score Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Score de Segurança</CardTitle>
              <Badge 
                variant={securityStatus?.has2FA ? "default" : "secondary"}
                className={securityStatus?.has2FA ? "bg-emerald-500" : ""}
              >
                {securityStatus?.has2FA ? "Excelente" : "Pode Melhorar"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-primary">
                {securityStatus?.has2FA ? "95" : "70"}/100
              </div>
              <div className="text-sm text-muted-foreground">
                {securityStatus?.has2FA 
                  ? "Sua conta está bem protegida com 2FA ativo"
                  : "Ative a autenticação de dois fatores para aumentar sua segurança"
                }
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2FA Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Autenticação de Dois Fatores (2FA)</CardTitle>
                <CardDescription>
                  Adicione uma camada extra de segurança usando um app autenticador
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="2fa-switch">Status do 2FA</Label>
                {securityStatus?.has2FA ? (
                  <Badge className="bg-emerald-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Inativo
                  </Badge>
                )}
              </div>
              <Switch 
                id="2fa-switch" 
                checked={securityStatus?.has2FA}
                disabled={enabling2FA}
              />
            </div>

            {qrCode && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm mb-2">Escaneie com Google Authenticator ou similar:</p>
                <img src={qrCode} alt="QR Code 2FA" className="mx-auto w-48 h-48" />
              </div>
            )}

            {!securityStatus?.has2FA && (
              <Button 
                onClick={enable2FA} 
                disabled={enabling2FA}
                className="w-full"
              >
                {enabling2FA ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Ativar 2FA Agora
                  </>
                )}
              </Button>
            )}

            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <p className="font-medium mb-1">Apps recomendados:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Google Authenticator</li>
                <li>Microsoft Authenticator</li>
                <li>Authy</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <Key className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle>Senha</CardTitle>
                <CardDescription>
                  Gerencie sua senha de acesso
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Última alteração:</span>
              <span>
                {securityStatus?.lastPasswordChange 
                  ? new Date(securityStatus.lastPasswordChange).toLocaleDateString('pt-BR')
                  : 'Nunca'
                }
              </span>
            </div>
            <Button variant="outline" className="w-full" onClick={requestPasswordReset}>
              <Lock className="mr-2 h-4 w-4" />
              Alterar Senha
            </Button>
          </CardContent>
        </Card>

        {/* Sessions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sessões Ativas</CardTitle>
            <CardDescription>
              Dispositivos conectados à sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-full">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Este dispositivo</p>
                  <p className="text-xs text-muted-foreground">
                    {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                     navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                     navigator.userAgent.includes('Safari') ? 'Safari' : 'Navegador'} 
                    {' '}- Ativo agora
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-600">
                Atual
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Security Tips */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dicas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                Use senhas fortes com letras, números e símbolos
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                Nunca compartilhe suas credenciais de acesso
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                Ative a autenticação de dois fatores (2FA)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                Revise regularmente as sessões ativas
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
