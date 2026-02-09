/**
 * Billing Portal - Complete Subscription Management
 * Invoice history, usage tracking, customer portal integration
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, Download, FileText, TrendingUp, Users, Ship, 
  Calendar, AlertCircle, CheckCircle2, Clock, DollarSign,
  Globe, Receipt, Settings, ArrowUpRight
} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { PRICING_TIERS, formatPrice, Currency, CURRENCY_SYMBOLS, getPriceForCurrency } from '@/lib/billing/pricing-tiers';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: Currency;
  status: 'paid' | 'pending' | 'overdue';
  pdfUrl?: string;
}

interface UsageMetric {
  name: string;
  current: number;
  limit: number | null;
  unit: string;
}

export default function BillingPortal() {
  const navigate = useNavigate();
  const { currentTier, subscriptionEnd, openCustomerPortal, isSubscribed } = useSubscription();
  const [currency, setCurrency] = useState<Currency>('BRL');
  
  // Mock data - would come from Stripe API
  const invoices: Invoice[] = [
    { id: 'INV-2026-001', date: '2026-01-01', amount: 29900, currency: 'BRL', status: 'paid' },
    { id: 'INV-2025-012', date: '2025-12-01', amount: 29900, currency: 'BRL', status: 'paid' },
    { id: 'INV-2025-011', date: '2025-11-01', amount: 29900, currency: 'BRL', status: 'paid' },
  ];

  const usage: UsageMetric[] = [
    { name: 'Colaboradores', current: 87, limit: currentTier?.employeeLimit || 150, unit: 'usuários' },
    { name: 'Embarcações', current: 12, limit: currentTier?.vesselLimit || 15, unit: 'navios' },
    { name: 'Documentos Processados (OCR)', current: 342, limit: 1000, unit: 'docs/mês' },
    { name: 'Chamadas IA', current: 1250, limit: 5000, unit: 'requests/mês' },
    { name: 'Armazenamento', current: 2.4, limit: 10, unit: 'GB' },
  ];

  const getUsagePercentage = (current: number, limit: number | null) => {
    if (!limit) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    return 'text-primary';
  };

  const statusColors = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const statusIcons = {
    paid: CheckCircle2,
    pending: Clock,
    overdue: AlertCircle,
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portal de Faturamento</h1>
          <p className="text-muted-foreground">Gerencie sua assinatura, faturas e uso</p>
        </div>
        <div className="flex gap-3">
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger className="w-32">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">🇧🇷 BRL</SelectItem>
              <SelectItem value="USD">🇺🇸 USD</SelectItem>
              <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openCustomerPortal}>
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar no Stripe
          </Button>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Plano {currentTier?.name || 'Free'}
                </CardTitle>
                <CardDescription>
                  {isSubscribed ? 'Assinatura ativa' : 'Sem assinatura ativa'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {currentTier ? formatPrice(getPriceForCurrency(currentTier, currency), currency) : 'Grátis'}
                <span className="text-xs text-muted-foreground ml-1">/mês</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{usage[0].current}</p>
                <p className="text-xs text-muted-foreground">Colaboradores</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Ship className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{usage[1].current}</p>
                <p className="text-xs text-muted-foreground">Embarcações</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{usage[2].current}</p>
                <p className="text-xs text-muted-foreground">Docs/mês</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-2xl font-bold">{subscriptionEnd ? new Date(subscriptionEnd).getDate() : '--'}</p>
                <p className="text-xs text-muted-foreground">Renova dia</p>
              </div>
            </div>
            {subscriptionEnd && (
              <p className="text-sm text-muted-foreground">
                Próxima renovação: {new Date(subscriptionEnd).toLocaleDateString('pt-BR', { 
                  day: '2-digit', month: 'long', year: 'numeric' 
                })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Projeção de Custos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Este mês</span>
                <span className="font-medium">{formatPrice(29900, currency)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Próximo mês (estimativa)</span>
                <span className="font-medium">{formatPrice(29900, currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Anual (economia 20%)</span>
                <span>{formatPrice(29900 * 12 * 0.8, currency)}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/billing')}>
              Ver todos os planos
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Usage & Invoices */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">📊 Uso & Limites</TabsTrigger>
          <TabsTrigger value="invoices">🧾 Faturas</TabsTrigger>
          <TabsTrigger value="payment">💳 Pagamento</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Consumo Atual</CardTitle>
              <CardDescription>Monitoramento em tempo real do uso da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {usage.map((metric) => {
                const percentage = getUsagePercentage(metric.current, metric.limit);
                return (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{metric.name}</span>
                      <span className={`text-sm ${getUsageColor(percentage)}`}>
                        {metric.current.toLocaleString('pt-BR')} / {metric.limit?.toLocaleString('pt-BR') || '∞'} {metric.unit}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    {percentage >= 90 && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Próximo do limite! Considere fazer upgrade.
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Faturas</CardTitle>
              <CardDescription>Todas as faturas emitidas para sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => {
                  const StatusIcon = statusIcons[invoice.status];
                  return (
                    <div 
                      key={invoice.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Receipt className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString('pt-BR', { 
                              day: '2-digit', month: 'short', year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={statusColors[invoice.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {invoice.status === 'paid' ? 'Pago' : invoice.status === 'pending' ? 'Pendente' : 'Atrasado'}
                        </Badge>
                        <span className="font-medium min-w-24 text-right">
                          {formatPrice(invoice.amount, invoice.currency)}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>Gerencie seus cartões e métodos de pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-14 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expira 12/2027</p>
                  </div>
                </div>
                <Badge>Principal</Badge>
              </div>
              <Button variant="outline" onClick={openCustomerPortal}>
                <CreditCard className="h-4 w-4 mr-2" />
                Adicionar/Alterar Cartão
              </Button>
              <p className="text-xs text-muted-foreground">
                Os pagamentos são processados de forma segura pelo Stripe. 
                Nauti One não armazena dados de cartão.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
