/**
 * Insurance & Claims AI Page
 * AI-powered insurance policy management and claims processing
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Heart, 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  FileText
} from 'lucide-react';

export default function InsuranceClaimsAIPage() {
  const claims = [
    { id: 'CLM-2026-001', title: 'Dano à carga - Container', type: 'Cargo', status: 'processing', amount: '$45,000', date: '2026-01-15' },
    { id: 'CLM-2026-002', title: 'Colisão no porto', type: 'H&M', status: 'approved', amount: '$120,000', date: '2026-01-10' },
    { id: 'CLM-2025-089', title: 'Lesão de tripulante', type: 'P&I', status: 'paid', amount: '$35,000', date: '2025-12-20' },
  ];

  const policies = [
    { type: 'Hull & Machinery', provider: 'Lloyd\'s', value: '$15M', expiry: '2026-06-30', status: 'active' },
    { type: 'P&I Insurance', provider: 'Gard', value: '$50M', expiry: '2026-02-28', status: 'expiring' },
    { type: 'Cargo Insurance', provider: 'Allianz', value: '$10M', expiry: '2026-12-31', status: 'active' },
  ];

  return (
    <>
      <Helmet>
        <title>Insurance & Claims AI | Nautilus One</title>
      </Helmet>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              Insurance & Claims AI
            </h1>
            <p className="text-muted-foreground">
              Gestão de apólices e processamento de sinistros com IA
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Novo Sinistro
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Apólices Ativas</p>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sinistros em Aberto</p>
                  <p className="text-3xl font-bold text-amber-500">4</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Recuperado (YTD)</p>
                  <p className="text-3xl font-bold text-emerald-500">$890K</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Aprovação</p>
                  <p className="text-3xl font-bold">94%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Apólices de Seguro</CardTitle>
            <CardDescription>Cobertura e status das apólices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {policies.map((policy, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      policy.status === 'active' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                    }`}>
                      <Shield className={`h-5 w-5 ${
                        policy.status === 'active' ? 'text-emerald-500' : 'text-red-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{policy.type}</p>
                      <p className="text-sm text-muted-foreground">
                        {policy.provider} • Expira: {new Date(policy.expiry).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold">{policy.value}</p>
                      <Badge variant={policy.status === 'active' ? 'default' : 'destructive'}>
                        {policy.status === 'expiring' ? 'Expirando!' : 'Ativa'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Claims */}
        <Card>
          <CardHeader>
            <CardTitle>Sinistros Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {claims.map((claim) => (
                <div 
                  key={claim.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      claim.status === 'paid' ? 'bg-emerald-500/10' : 
                      claim.status === 'approved' ? 'bg-blue-500/10' : 'bg-amber-500/10'
                    }`}>
                      {claim.status === 'paid' ? (
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      ) : claim.status === 'approved' ? (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{claim.id}</p>
                        <Badge variant="outline">{claim.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{claim.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{claim.amount}</p>
                    <Badge 
                      variant={
                        claim.status === 'paid' ? 'default' : 
                        claim.status === 'approved' ? 'secondary' : 'outline'
                      }
                    >
                      {claim.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Insights de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border bg-amber-500/5 border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Alerta de Cobertura</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Apólice P&I expira em 28 dias. Com base no histórico de sinistros, 
                recomendamos aumentar a cobertura para $75M na renovação.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
