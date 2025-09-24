// System Health Dashboard Component - versão concisa  
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Database } from 'lucide-react';

export const SystemHealthDashboard = () => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-3xl font-bold gradient-text mb-2">Segurança & Auditoria</h2>
      <p className="text-muted-foreground">Sistema de segurança avançado em desenvolvimento</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-success" />
            Nível de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-success">99.8%</p>
          <p className="text-sm text-muted-foreground">Sistema protegido</p>
        </CardContent>
      </Card>
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-warning" />
            MFA Ativo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-warning">87%</p>
          <p className="text-sm text-muted-foreground">Usuários com MFA</p>
        </CardContent>
      </Card>
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Backups Seguros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-primary">100%</p>
          <p className="text-sm text-muted-foreground">Dados protegidos</p>
        </CardContent>
      </Card>
    </div>
  </div>
);