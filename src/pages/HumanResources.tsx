import React from 'react';
import { HRDashboard } from '@/components/hr/hr-dashboard';
import { CertificateManager } from '@/components/hr/certificate-manager';
import { CertificateAlerts } from '@/components/hr/certificate-alerts';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { Header } from '@/components/layout/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Award, AlertTriangle, UserCheck } from 'lucide-react';

const HumanResources = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Recursos Humanos</h1>
              <p className="text-muted-foreground">
                Gestão completa de pessoas e certificações
              </p>
            </div>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-lg">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certificados
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertas
              </TabsTrigger>
              <TabsTrigger value="employees" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Funcionários
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <HRDashboard />
            </TabsContent>

            <TabsContent value="certificates">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciamento de Certificados</CardTitle>
                  <CardDescription>
                    Controle e monitore certificações da equipe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Certificados em desenvolvimento</h3>
                    <p className="text-muted-foreground">
                      Sistema completo de gestão de certificados será disponibilizado em breve
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="alerts">
              <CertificateAlerts />
            </TabsContent>

            <TabsContent value="employees">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Funcionários</CardTitle>
                  <CardDescription>
                    Administre informações e performance dos colaboradores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <UserCheck className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Gestão de funcionários</h3>
                    <p className="text-muted-foreground">
                      Módulo completo de gestão de pessoas em desenvolvimento
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default HumanResources;