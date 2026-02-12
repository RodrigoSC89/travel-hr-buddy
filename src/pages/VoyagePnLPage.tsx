/**
 * VoyagePnLPage - Voyage Profit & Loss with REAL Supabase Data
 * Uses voyage_accounting + voyage_plans tables (no Math.random())
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { RefreshCw, Download, DollarSign, TrendingUp, TrendingDown, Ship, Anchor } from 'lucide-react';
import { useVoyagePnL } from '@/hooks/useVoyagePnL';

export default function VoyagePnLPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading, error, refetch } = useVoyagePnL();

  const voyages = data?.voyages || [];
  const stats = data?.stats;

  const filteredVoyages = voyages.filter(v =>
    v.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.voyageNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (!filteredVoyages.length) {
      toast.error('Nenhum dado para exportar');
      return;
    }

    const csv = [
      ['Voyage', 'Vessel', 'Revenue', 'Costs', 'Profit', 'Margin %', 'TCE $/day', 'Status', 'Departure', 'Arrival'].join(','),
      ...filteredVoyages.map(v => [
        v.voyageNumber,
        v.vesselName,
        v.revenue,
        v.costs,
        v.profit,
        v.margin.toFixed(2),
        v.tceDaily?.toFixed(0) || '—',
        v.status,
        v.departurePort,
        v.arrivalPort,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voyage-pnl-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Relatório P&L exportado');
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Erro ao carregar dados de viagens</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Voyage P&L
            <Badge variant="outline" className="ml-2 text-xs">LIVE DATA</Badge>
          </h1>
          <p className="text-muted-foreground">Análise de Lucro e Perda por Viagem — Dados Reais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { refetch(); toast.success('Dados atualizados'); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={`pnl-skeleton-${i}`}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> Receita Total
                </p>
                <p className="text-2xl font-bold text-success">
                  ${(stats?.totalRevenue || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" /> Custos Total
                </p>
                <p className="text-2xl font-bold text-destructive">
                  ${(stats?.totalCosts || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> Lucro Total
                </p>
                <p className={`text-2xl font-bold ${(stats?.totalProfit || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${(stats?.totalProfit || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Ship className="h-4 w-4" /> Margem Média
                </p>
                <p className={`text-2xl font-bold ${(stats?.avgMargin || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {(stats?.avgMargin || 0).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Anchor className="h-4 w-4" /> TCE Médio
                </p>
                <p className="text-2xl font-bold text-primary">
                  ${(stats?.avgTCE || 0).toLocaleString()}/dia
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por navio ou número da viagem..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            Viagens ({filteredVoyages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={`pnl-row-skeleton-${i}`} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredVoyages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ship className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma viagem encontrada</p>
              <p className="text-sm mt-1">Adicione viagens em Voyage Accounting para visualizar o P&L</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Viagem</th>
                    <th className="text-left p-2">Navio</th>
                    <th className="text-left p-2">Rota</th>
                    <th className="text-right p-2">Receita</th>
                    <th className="text-right p-2">Custos</th>
                    <th className="text-right p-2">Lucro</th>
                    <th className="text-right p-2">Margem</th>
                    <th className="text-right p-2">TCE</th>
                    <th className="text-center p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoyages.map((voyage) => (
                    <tr key={voyage.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono">{voyage.voyageNumber}</td>
                      <td className="p-2">{voyage.vesselName}</td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {voyage.departurePort} → {voyage.arrivalPort}
                      </td>
                      <td className="p-2 text-right text-success">
                        ${voyage.revenue.toLocaleString()}
                      </td>
                      <td className="p-2 text-right text-destructive">
                        ${voyage.costs.toLocaleString()}
                      </td>
                      <td className={`p-2 text-right font-bold ${voyage.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${voyage.profit.toLocaleString()}
                      </td>
                      <td className={`p-2 text-right ${voyage.margin >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {voyage.margin.toFixed(1)}%
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        {voyage.tceDaily ? `$${voyage.tceDaily.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-2 text-center">
                        <Badge variant={
                          voyage.status === 'completed' ? 'default' :
                          voyage.status === 'ongoing' ? 'secondary' : 'outline'
                        }>
                          {voyage.status === 'completed' ? 'Concluída' :
                           voyage.status === 'ongoing' ? 'Em Andamento' : 'Planejada'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
