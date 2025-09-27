import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Fingerprint,
  QrCode,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Lock
} from 'lucide-react';

export const AdvancedAuthenticationSystem: React.FC = () => {
  const [isEnabled2FA, setIsEnabled2FA] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [totpSecret, setTotpSecret] = useState('JBSWY3DPEHPK3PXP');
  const [backupCodes] = useState([
    '123456789',
    '987654321',
    '456789123',
    '789123456',
    '321654987'
  ]);
  const [activeSessions] = useState([
    {
      id: '1',
      device: 'Chrome - Windows',
      location: 'São Paulo, Brasil',
      lastActive: '2 minutos atrás',
      current: true
    },
    {
      id: '2', 
      device: 'Safari - iPhone',
      location: 'Rio de Janeiro, Brasil',
      lastActive: '1 hora atrás',
      current: false
    },
    {
      id: '3',
      device: 'Chrome - Android',
      location: 'Santos, Brasil', 
      lastActive: '1 dia atrás',
      current: false
    }
  ]);

  const [authLogs] = useState([
    {
      id: '1',
      action: 'Login bem-sucedido',
      device: 'Chrome - Windows',
      timestamp: '2024-01-15 14:30:15',
      status: 'success'
    },
    {
      id: '2',
      action: 'Tentativa de login falhada',
      device: 'Unknown',
      timestamp: '2024-01-15 12:15:30',
      status: 'failed'
    },
    {
      id: '3',
      action: '2FA configurado',
      device: 'Chrome - Windows',
      timestamp: '2024-01-15 10:45:22',
      status: 'success'
    }
  ]);

  const handleEnable2FA = () => {
    setIsEnabled2FA(!isEnabled2FA);
  };

  const handleEnableBiometric = async () => {
    if ('credentials' in navigator) {
      try {
        // Simular autenticação biométrica
        setIsBiometricEnabled(!isBiometricEnabled);
      } catch (error) {
        console.error('Biometric authentication not supported');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const revokeSession = (sessionId: string) => {
    console.log('Revoking session:', sessionId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold">Autenticação Avançada</h1>
          <Badge variant="secondary">Segurança Máxima</Badge>
        </div>
        <p className="text-muted-foreground">
          Sistema completo de autenticação multi-fator e segurança
        </p>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-lg font-bold text-green-600">Seguro</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">2FA</p>
                <p className="text-lg font-bold">{isEnabled2FA ? 'Ativo' : 'Inativo'}</p>
              </div>
              <Key className={`h-8 w-8 ${isEnabled2FA ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Biometria</p>
                <p className="text-lg font-bold">{isBiometricEnabled ? 'Ativo' : 'Inativo'}</p>
              </div>
              <Fingerprint className={`h-8 w-8 ${isBiometricEnabled ? 'text-green-500' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessões</p>
                <p className="text-lg font-bold">{activeSessions.length}</p>
              </div>
              <Smartphone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Autenticação de Dois Fatores (2FA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status do 2FA</p>
                <p className="text-sm text-muted-foreground">
                  {isEnabled2FA ? 'Proteção ativa' : 'Configurar para maior segurança'}
                </p>
              </div>
              <Button 
                onClick={handleEnable2FA}
                variant={isEnabled2FA ? 'outline' : 'default'}
              >
                {isEnabled2FA ? 'Desativar' : 'Ativar'} 2FA
              </Button>
            </div>

            {!isEnabled2FA && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-amber-800 dark:text-amber-200">
                    Recomendado
                  </span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Configure a autenticação de dois fatores para aumentar a segurança da sua conta.
                </p>
              </div>
            )}

            {isEnabled2FA && (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-4 bg-white border rounded-lg">
                      <QrCode className="w-24 h-24" />
                    </div>
                  </div>
                  <p className="text-sm text-center mb-2">
                    Escaneie o QR Code com seu app autenticador
                  </p>
                  <div className="flex items-center gap-2">
                    <Input value={totpSecret} readOnly className="font-mono text-sm" />
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(totpSecret)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Códigos de Backup</p>
                  <p className="text-sm text-muted-foreground">
                    Use estes códigos se perder acesso ao seu autenticador
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input value={code} readOnly className="font-mono text-sm" />
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(code)}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Biometric Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5" />
              Autenticação Biométrica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Biometria</p>
                <p className="text-sm text-muted-foreground">
                  {isBiometricEnabled ? 'Impressão digital configurada' : 'Configure sua impressão digital'}
                </p>
              </div>
              <Button 
                onClick={handleEnableBiometric}
                variant={isBiometricEnabled ? 'outline' : 'default'}
              >
                {isBiometricEnabled ? 'Remover' : 'Configurar'}
              </Button>
            </div>

            <div className="p-4 border rounded-lg text-center">
              <Fingerprint className={`w-16 h-16 mx-auto mb-4 ${isBiometricEnabled ? 'text-green-500' : 'text-gray-400'}`} />
              <p className="font-medium">
                {isBiometricEnabled ? 'Biometria Ativa' : 'Biometria Inativa'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isBiometricEnabled 
                  ? 'Toque no sensor para fazer login rapidamente'
                  : 'Configure para login mais rápido e seguro'
                }
              </p>
            </div>

            {!isBiometricEnabled && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Benefícios da autenticação biométrica:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Login rápido e conveniente</li>
                  <li>• Maior segurança</li>
                  <li>• Impossível de esquecer</li>
                  <li>• Única para você</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Sessões Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  session.current ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <Smartphone className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <p className="text-sm text-muted-foreground">{session.location}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.current ? 'Sessão atual' : `Ativo ${session.lastActive}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.current && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      Atual
                    </Badge>
                  )}
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                    >
                      Revogar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Log de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {authLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {log.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-sm text-muted-foreground">{log.device}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{log.timestamp}</p>
                  <Badge 
                    variant={log.status === 'success' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {log.status === 'success' ? 'Sucesso' : 'Falhou'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};