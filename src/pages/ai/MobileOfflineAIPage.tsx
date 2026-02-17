/**
 * Mobile & Offline AI Page
 * AI-powered mobile capabilities and offline synchronization
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Wifi, 
  WifiOff,
  Cloud,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Brain,
  Download,
  RefreshCw
} from 'lucide-react';

export default function MobileOfflineAIPage() {
  return (
    <>
      <Helmet>
        <title>Mobile & Offline AI | Nauti One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Smartphone className="h-8 w-8 text-primary" />
              Mobile & Offline AI
            </h1>
            <p className="text-muted-foreground">
              Capacidades mobile e sincronização offline com IA
            </p>
          </div>
          <Badge variant="default" className="text-lg px-4 py-2 bg-success">
            <Wifi className="h-4 w-4 mr-2" />
            Online
          </Badge>
        </div>

        {/* Sync Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dados Sincronizados</p>
                  <p className="text-3xl font-bold text-success">100%</p>
                </div>
                <Cloud className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cache Local</p>
                  <p className="text-3xl font-bold">2.4 GB</p>
                </div>
                <HardDrive className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Última Sync</p>
                  <p className="text-3xl font-bold">2min</p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dispositivos</p>
                  <p className="text-3xl font-bold">24</p>
                </div>
                <Smartphone className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sync Modules */}
        <Card>
          <CardHeader>
            <CardTitle>Módulos Sincronizados</CardTitle>
            <CardDescription>Status de sincronização por módulo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Checklists & Inspeções', size: '450 MB', synced: 100, lastSync: '2 min' },
              { name: 'Documentos & Manuais', size: '1.2 GB', synced: 100, lastSync: '5 min' },
              { name: 'Dados de Tripulação', size: '320 MB', synced: 100, lastSync: '2 min' },
              { name: 'Manutenção & Jobs', size: '280 MB', synced: 95, lastSync: '10 min' },
              { name: 'Certificados', size: '180 MB', synced: 100, lastSync: '1 hr' },
            ].map((module) => (
              <div key={module.name} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {module.synced === 100 ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="font-medium">{module.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{module.size}</span>
                    <span>Última sync: {module.lastSync}</span>
                  </div>
                </div>
                <Progress value={module.synced} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Offline Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WifiOff className="h-5 w-5" />
                Funcionalidades Offline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { feature: 'Checklists de Inspeção', available: true },
                { feature: 'Registro de Manutenção', available: true },
                { feature: 'Consulta de Documentos', available: true },
                { feature: 'OCR de Documentos', available: true },
                { feature: 'Comandos de Voz', available: true },
                { feature: 'Relatórios PDF', available: true },
                { feature: 'Chat com IA', available: false },
              ].map((item) => (
                <div key={item.feature} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span>{item.feature}</span>
                  {item.available ? (
                    <Badge variant="default" className="bg-success">Disponível</Badge>
                  ) : (
                    <Badge variant="outline">Online Only</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Edge Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border bg-info/5 border-info/30">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-info" />
                  <span className="font-medium">OCR Local</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Processamento de documentos diretamente no dispositivo, mesmo sem conexão.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-success/5 border-success/30">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="h-4 w-4 text-success" />
                  <span className="font-medium">Voice Commands</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reconhecimento de voz offline para comandos básicos de navegação.
                </p>
              </div>
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Baixar Modelos de IA
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
