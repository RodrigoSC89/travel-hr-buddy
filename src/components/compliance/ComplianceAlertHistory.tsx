/**
 * Compliance Alert History Component
 * Shows historical alerts with filters by date, type, and vessel
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Bell, AlertTriangle, CheckCircle, Info, Ship, Calendar,
  Filter, Search, Download, Trash2, Eye, Clock, X, RefreshCw
} from 'lucide-react';

export interface ComplianceAlertRecord {
  id: string;
  timestamp: Date;
  type: 'critical' | 'warning' | 'info';
  module: 'mlc' | 'peotram' | 'peo-dp' | 'sgso' | 'pre-ovid' | 'geofence';
  title: string;
  message: string;
  vesselId?: string;
  vesselName?: string;
  geofenceName?: string;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

interface ComplianceAlertHistoryProps {
  onAlertClick?: (alert: ComplianceAlertRecord) => void;
}

// Generate mock historical data
const generateMockAlerts = (): ComplianceAlertRecord[] => {
  const alerts: ComplianceAlertRecord[] = [];
  const modules: ComplianceAlertRecord['module'][] = ['mlc', 'peotram', 'peo-dp', 'sgso', 'pre-ovid', 'geofence'];
  const types: ComplianceAlertRecord['type'][] = ['critical', 'warning', 'info'];
  const vessels = [
    { id: 'v1', name: 'MV Ocean Star' },
    { id: 'v2', name: 'MV Seawind' },
    { id: 'v3', name: 'MV Horizon' },
    { id: 'v4', name: 'MV Blue Wave' },
    { id: 'v5', name: 'MV Nordic Spirit' },
  ];

  const titles: Record<string, string[]> = {
    mlc: ['Inspeção MLC vencida', 'Certificado MLC expirando', 'Auditoria MLC agendada'],
    peotram: ['Treinamento obrigatório pendente', 'Certificação STCW expirando', 'Curso não concluído'],
    'peo-dp': ['Documento pessoal vencido', 'Contrato expirando', 'Atestado médico pendente'],
    sgso: ['Incidente reportado', 'Auditoria SGSO necessária', 'Plano de ação vencido'],
    'pre-ovid': ['Inspeção Pre-OVID programada', 'Deficiência não corrigida', 'Relatório pendente'],
    geofence: ['Entrada em zona de inspeção', 'Saída de área autorizada', 'Proximidade de área restrita'],
  };

  for (let i = 0; i < 50; i++) {
    const module = modules[Math.floor(Math.random() * modules.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const vessel = vessels[Math.floor(Math.random() * vessels.length)];
    const titleList = titles[module];
    const title = titleList[Math.floor(Math.random() * titleList.length)];
    const daysAgo = Math.floor(Math.random() * 30);

    alerts.push({
      id: `alert-${i}`,
      timestamp: subDays(new Date(), daysAgo),
      type,
      module,
      title,
      message: `Alerta gerado para ${vessel.name} - ${title.toLowerCase()}`,
      vesselId: vessel.id,
      vesselName: vessel.name,
      geofenceName: module === 'geofence' ? 'Port of Rotterdam' : undefined,
      acknowledged: Math.random() > 0.3,
      acknowledgedAt: Math.random() > 0.3 ? subDays(new Date(), daysAgo - 1) : undefined,
      acknowledgedBy: Math.random() > 0.3 ? 'Carlos Silva' : undefined,
    });
  }

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export function ComplianceAlertHistory({ onAlertClick }: ComplianceAlertHistoryProps) {
  const [alerts, setAlerts] = useState<ComplianceAlertRecord[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<ComplianceAlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [vesselFilter, setVesselFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [acknowledgedFilter, setAcknowledgedFilter] = useState<string>('all');

  // Load alerts
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAlerts(generateMockAlerts());
      setIsLoading(false);
    }, 500);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...alerts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(query) ||
        a.message.toLowerCase().includes(query) ||
        a.vesselName?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    // Module filter
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(a => a.module === moduleFilter);
    }

    // Vessel filter
    if (vesselFilter !== 'all') {
      filtered = filtered.filter(a => a.vesselId === vesselFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = subDays(now, 7);
          break;
        case 'month':
          startDate = subDays(now, 30);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter(a => a.timestamp >= startDate);
    }

    // Acknowledged filter
    if (acknowledgedFilter !== 'all') {
      filtered = filtered.filter(a => 
        acknowledgedFilter === 'acknowledged' ? a.acknowledged : !a.acknowledged
      );
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchQuery, typeFilter, moduleFilter, vesselFilter, dateFilter, acknowledgedFilter]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, acknowledged: true, acknowledgedAt: new Date(), acknowledgedBy: 'Usuário Atual' }
        : a
    ));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setModuleFilter('all');
    setVesselFilter('all');
    setDateFilter('all');
    setAcknowledgedFilter('all');
  };

  const getTypeIcon = (type: ComplianceAlertRecord['type']) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: ComplianceAlertRecord['type']) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/20',
      warning: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    const labels = { critical: 'Crítico', warning: 'Alerta', info: 'Info' };
    return <Badge variant="outline" className={styles[type]}>{labels[type]}</Badge>;
  };

  const getModuleBadge = (module: ComplianceAlertRecord['module']) => {
    const labels: Record<string, string> = {
      mlc: 'MLC',
      peotram: 'PEOTRAM',
      'peo-dp': 'PEO-DP',
      sgso: 'SGSO',
      'pre-ovid': 'Pre-OVID',
      geofence: 'Geofence',
    };
    return <Badge variant="secondary">{labels[module]}</Badge>;
  };

  // Get unique vessels for filter
  const uniqueVessels = Array.from(new Set(alerts.map(a => a.vesselId).filter(Boolean)));
  const vesselNames = alerts.reduce((acc, a) => {
    if (a.vesselId && a.vesselName) {
      acc[a.vesselId] = a.vesselName;
    }
    return acc;
  }, {} as Record<string, string>);

  // Stats
  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    info: alerts.filter(a => a.type === 'info').length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total de Alertas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-500">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Críticos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-orange-500">{stats.warning}</p>
              <p className="text-xs text-muted-foreground">Alertas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-blue-500">{stats.info}</p>
              <p className="text-xs text-muted-foreground">Informativos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-yellow-500">{stats.unacknowledged}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="col-span-2">
              <Label className="text-xs">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar alertas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                  <SelectItem value="warning">Alerta</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Módulo</Label>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="mlc">MLC</SelectItem>
                  <SelectItem value="peotram">PEOTRAM</SelectItem>
                  <SelectItem value="peo-dp">PEO-DP</SelectItem>
                  <SelectItem value="sgso">SGSO</SelectItem>
                  <SelectItem value="pre-ovid">Pre-OVID</SelectItem>
                  <SelectItem value="geofence">Geofence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Embarcação</Label>
              <Select value={vesselFilter} onValueChange={setVesselFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Embarcação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {uniqueVessels.map(id => (
                    <SelectItem key={id} value={id!}>{vesselNames[id!]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Período</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Últimos 7 dias</SelectItem>
                  <SelectItem value="month">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Histórico de Alertas
              <Badge variant="secondary">{filteredAlerts.length}</Badge>
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum alerta encontrado com os filtros aplicados</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg transition-colors hover:bg-muted/50 cursor-pointer ${
                      !alert.acknowledged ? 'border-l-4 border-l-primary bg-primary/5' : ''
                    }`}
                    onClick={() => onAlertClick?.(alert)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getTypeIcon(alert.type)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium">{alert.title}</p>
                            {getTypeBadge(alert.type)}
                            {getModuleBadge(alert.module)}
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(alert.timestamp, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                            {alert.vesselName && (
                              <span className="flex items-center gap-1">
                                <Ship className="h-3 w-3" />
                                {alert.vesselName}
                              </span>
                            )}
                            {alert.acknowledged && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Confirmado por {alert.acknowledgedBy}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!alert.acknowledged && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              acknowledgeAlert(alert.id);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
