/**
 * Contract & Legal AI Page
 * AI-powered contract lifecycle management and legal assistant
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Scale, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  Search,
  Plus
} from 'lucide-react';

export default function ContractLegalAIPage() {
  const contracts = [
    { id: 'CTR-2026-001', title: 'Charter Party - MV Explorer', type: 'Charter', status: 'active', value: '$2.5M', expiry: '2026-12-31' },
    { id: 'CTR-2026-002', title: 'Bunker Supply Agreement', type: 'Supply', status: 'pending', value: '$850K', expiry: '2026-06-30' },
    { id: 'CTR-2026-003', title: 'Crew Manning Agreement', type: 'Manning', status: 'active', value: '$1.2M', expiry: '2027-03-15' },
    { id: 'CTR-2026-004', title: 'Insurance P&I', type: 'Insurance', status: 'expiring', value: '$500K', expiry: '2026-02-28' },
  ];

  return (
    <>
      <Helmet>
        <title>Contract & Legal AI | Nautilus One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Scale className="h-8 w-8 text-primary" />
              Contract & Legal AI
            </h1>
            <p className="text-muted-foreground">
              Gestão de contratos e assistente jurídico com IA
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Buscar Contrato
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Contrato
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contratos Ativos</p>
                  <p className="text-3xl font-bold">47</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expirando (30 dias)</p>
                  <p className="text-3xl font-bold text-amber-500">5</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes Aprovação</p>
                  <p className="text-3xl font-bold text-blue-500">8</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-3xl font-bold">$28M</p>
                </div>
                <Scale className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts List */}
        <Card>
          <CardHeader>
            <CardTitle>Contratos Recentes</CardTitle>
            <CardDescription>Gestão do ciclo de vida de contratos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div 
                  key={contract.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      contract.status === 'active' ? 'bg-success/10' : 
                      contract.status === 'expiring' ? 'bg-destructive/10' : 'bg-warning/10'
                    }`}>
                      {contract.status === 'active' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : contract.status === 'expiring' ? (
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                      ) : (
                        <Clock className="h-5 w-5 text-warning" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{contract.title}</p>
                        <Badge variant="outline">{contract.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {contract.id} • Expira: {new Date(contract.expiry).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{contract.value}</p>
                      <Badge 
                        variant={
                          contract.status === 'active' ? 'default' : 
                          contract.status === 'expiring' ? 'destructive' : 'secondary'
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Legal Assistant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Assistente Jurídico IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-destructive/5 border-destructive/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="font-medium">Alerta de Renovação</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Contrato de P&I Insurance expira em 28 dias. Iniciar processo de renovação imediatamente.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-info/5 border-info/30">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-info" />
                  <span className="font-medium">Análise de Cláusulas</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  IA detectou cláusula de penalidade favorável no novo Charter Party. Revisar termos de cancelamento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
