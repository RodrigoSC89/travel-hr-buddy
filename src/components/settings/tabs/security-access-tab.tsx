import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Key, 
  Clock, 
  UserX, 
  AlertTriangle,
  CheckCircle,
  TestTube,
  Settings
} from 'lucide-react';
import { TwoFactorSettings } from '@/components/auth/two-factor-settings';

interface SecuritySettings {
  passwordRules: {
    minLength: number;
    requireNumbers: boolean;
    requireSymbols: boolean;
    requireUppercase: boolean;
  };
  sessionExpiry: number;
  twoFactorRequired: boolean;
  maxLoginAttempts: number;
}

interface SecurityAccessTabProps {
  settings: SecuritySettings;
  onUpdate: (updates: Partial<SecuritySettings>) => void;
  testMode: boolean;
}

export const SecurityAccessTab: React.FC<SecurityAccessTabProps> = ({
  settings,
  onUpdate,
  testMode
}) => {
  const updatePasswordRule = (rule: keyof SecuritySettings['passwordRules'], value: any) => {
    onUpdate({
      passwordRules: {
        ...settings.passwordRules,
        [rule]: value
      }
    });
  };

  const getPasswordStrength = () => {
    const { passwordRules } = settings;
    let score = 0;
    if (passwordRules.minLength >= 8) score++;
    if (passwordRules.minLength >= 12) score++;
    if (passwordRules.requireNumbers) score++;
    if (passwordRules.requireSymbols) score++;
    if (passwordRules.requireUppercase) score++;
    
    if (score <= 2) return { level: 'Baixa', color: 'text-red-600', bg: 'bg-red-100' };
    if (score <= 3) return { level: 'Média', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Alta', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="space-y-6">
      {/* Password Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Regras de Senha
            {testMode && <Badge variant="outline" className="ml-2"><TestTube className="w-3 h-3 mr-1" />Teste</Badge>}
          </CardTitle>
          <CardDescription>
            Configure os requisitos de segurança para senhas de usuários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minLength">Comprimento Mínimo</Label>
                <Input
                  id="minLength"
                  type="number"
                  min="6"
                  max="32"
                  value={settings.passwordRules.minLength}
                  onChange={(e) => updatePasswordRule('minLength', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Número mínimo de caracteres (recomendado: 12+)
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exigir Números</Label>
                    <p className="text-xs text-muted-foreground">0-9</p>
                  </div>
                  <Switch
                    checked={settings.passwordRules.requireNumbers}
                    onCheckedChange={(checked) => updatePasswordRule('requireNumbers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exigir Símbolos</Label>
                    <p className="text-xs text-muted-foreground">!@#$%^&*</p>
                  </div>
                  <Switch
                    checked={settings.passwordRules.requireSymbols}
                    onCheckedChange={(checked) => updatePasswordRule('requireSymbols', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Exigir Maiúsculas</Label>
                    <p className="text-xs text-muted-foreground">A-Z</p>
                  </div>
                  <Switch
                    checked={settings.passwordRules.requireUppercase}
                    onCheckedChange={(checked) => updatePasswordRule('requireUppercase', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Força da Política
                </h4>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${strength.color} ${strength.bg}`}>
                  {strength.level === 'Alta' ? <CheckCircle className="w-4 h-4 mr-1" /> : <AlertTriangle className="w-4 h-4 mr-1" />}
                  Segurança {strength.level}
                </div>
                
                <div className="mt-3 text-sm text-muted-foreground">
                  <p>Exemplo de senha válida:</p>
                  <code className="mt-1 p-1 bg-muted rounded text-xs">
                    MinhaSenh@123{settings.passwordRules.minLength > 12 ? 'Segura' : ''}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Política de Expiração de Sessão
          </CardTitle>
          <CardDescription>
            Configure quando as sessões de usuário devem expirar automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sessionExpiry">Tempo de Expiração (minutos)</Label>
              <Select 
                value={settings.sessionExpiry.toString()} 
                onValueChange={(value) => onUpdate({ sessionExpiry: parseInt(value) })}
              >
                <SelectTrigger id="sessionExpiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                  <SelectItem value="240">4 horas</SelectItem>
                  <SelectItem value="480">8 horas</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Usuários inativos serão desconectados automaticamente
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Tentativas de Login</Label>
              <Input
                id="maxAttempts"
                type="number"
                min="1"
                max="10"
                value={settings.maxLoginAttempts}
                onChange={(e) => onUpdate({ maxLoginAttempts: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Conta será bloqueada temporariamente após este número de tentativas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Autenticação em Dois Fatores (2FA)
          </CardTitle>
          <CardDescription>
            Configure políticas de autenticação de dois fatores para maior segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <Label className="text-base font-medium">2FA Obrigatório</Label>
              <p className="text-sm text-muted-foreground">
                Exigir autenticação de dois fatores para todos os usuários
              </p>
            </div>
            <Switch
              checked={settings.twoFactorRequired}
              onCheckedChange={(checked) => onUpdate({ twoFactorRequired: checked })}
            />
          </div>

          {settings.twoFactorRequired && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-800">2FA Obrigatório Ativo</span>
              </div>
              <p className="text-sm text-blue-700">
                Todos os novos usuários serão obrigados a configurar 2FA no primeiro login.
                Usuários existentes terão 7 dias para configurar.
              </p>
            </div>
          )}

          <Separator />

          {/* Personal 2FA Settings */}
          <div>
            <h4 className="font-medium mb-4">Suas Configurações 2FA</h4>
            <TwoFactorSettings />
          </div>
        </CardContent>
      </Card>

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-primary" />
            Controle de Acesso
          </CardTitle>
          <CardDescription>
            Configure permissões e políticas de acesso por perfil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Administrador</h5>
              <p className="text-sm text-muted-foreground mb-3">Acesso total ao sistema</p>
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Gerente RH</h5>
              <p className="text-sm text-muted-foreground mb-3">Gestão de pessoal e certificações</p>
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Funcionário</h5>
              <p className="text-sm text-muted-foreground mb-3">Acesso básico aos próprios dados</p>
              <Button variant="outline" size="sm" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};