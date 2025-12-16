/**
 * Audits Panel Component
 * Painel completo de auditorias com funcionalidades avançadas
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileCheck,
  Search,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  Sparkles,
  XCircle,
} from 'lucide-react';
import type { AuditSession, AuditFinding } from '../types';

interface AuditsPanelProps {
  audits: AuditSession[];
  onCreateAudit: () => void;
  onViewAudit: (auditId: string) => void;
  onEditAudit: (auditId: string) => void;
  onDeleteAudit: (auditId: string) => void;
  onGenerateChecklist: (auditId: string) => Promise<void>;
  onExportAudit: (auditId: string) => void;
}

export function AuditsPanel({
  audits,
  onCreateAudit,
  onViewAudit,
  onEditAudit,
  onDeleteAudit,
  onGenerateChecklist,
  onExportAudit,
}: AuditsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [generatingChecklist, setGeneratingChecklist] = useState<string | null>(null);

  const getStatusBadge = (status: AuditSession['status']) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; icon: React.ReactNode }> = {
      scheduled: { variant: 'secondary', label: 'Agendada', icon: <Calendar className="h-3 w-3" /> },
      'in-progress': { variant: 'default', label: 'Em Andamento', icon: <Clock className="h-3 w-3" /> },
      completed: { variant: 'outline', label: 'Concluída', icon: <CheckCircle2 className="h-3 w-3" /> },
      cancelled: { variant: 'destructive', label: 'Cancelada', icon: <XCircle className="h-3 w-3" /> },
    };

    const { variant, label, icon } = variants[status] || variants.scheduled;
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: AuditSession['auditType']) => {
    const labels: Record<string, string> = {
      internal: 'Interna',
      external: 'Externa',
      'flag-state': 'Bandeira',
      class: 'Classificadora',
      psc: 'PSC',
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  const getFindingsSummary = (findings: AuditFinding[]) => {
    const critical = findings.filter((f) => f.severity === 'critical').length;
    const major = findings.filter((f) => f.severity === 'major').length;
    const minor = findings.filter((f) => f.severity === 'minor').length;
    const obs = findings.filter((f) => f.severity === 'observation').length;

    return (
      <div className="flex items-center gap-2 text-sm">
        {critical > 0 && (
          <span className="flex items-center gap-1 text-red-500">
            <AlertTriangle className="h-3 w-3" />
            {critical}
          </span>
        )}
        {major > 0 && (
          <span className="flex items-center gap-1 text-orange-500">
            {major} maior
          </span>
        )}
        {minor > 0 && (
          <span className="flex items-center gap-1 text-yellow-500">
            {minor} menor
          </span>
        )}
        {obs > 0 && (
          <span className="flex items-center gap-1 text-muted-foreground">
            {obs} obs
          </span>
        )}
        {findings.length === 0 && (
          <span className="text-muted-foreground">Sem findings</span>
        )}
      </div>
    );
  };

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.auditorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
    const matchesType = typeFilter === 'all' || audit.auditType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const scheduledAudits = filteredAudits.filter((a) => a.status === 'scheduled');
  const inProgressAudits = filteredAudits.filter((a) => a.status === 'in-progress');
  const completedAudits = filteredAudits.filter((a) => a.status === 'completed');

  const handleGenerateChecklist = async (auditId: string) => {
    setGeneratingChecklist(auditId);
    try {
      await onGenerateChecklist(auditId);
    } finally {
      setGeneratingChecklist(null);
    }
  };

  const renderAuditCard = (audit: AuditSession) => (
    <div
      key={audit.id}
      className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-medium">{audit.vesselName}</h4>
            <p className="text-sm text-muted-foreground">{audit.auditorName}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewAudit(audit.id)}>
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditAudit(audit.id)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleGenerateChecklist(audit.id)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Gerar Checklist IA
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExportAudit(audit.id)}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDeleteAudit(audit.id)}
              className="text-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {getTypeBadge(audit.auditType)}
        {getStatusBadge(audit.status)}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Agendada: {audit.scheduledDate}</span>
        </div>
        {audit.completedDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4" />
            <span>Concluída: {audit.completedDate}</span>
          </div>
        )}
        <div className="pt-2 border-t">
          {getFindingsSummary(audit.findings)}
        </div>
        {audit.score !== undefined && audit.score > 0 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-muted-foreground">Score:</span>
            <Badge variant={audit.score >= 80 ? 'default' : audit.score >= 60 ? 'secondary' : 'destructive'}>
              {audit.score}%
            </Badge>
          </div>
        )}
      </div>

      {generatingChecklist === audit.id && (
        <div className="mt-3 p-2 bg-primary/5 rounded-lg flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span>Gerando checklist com IA...</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-primary" />
              Auditorias
            </CardTitle>
            <Button onClick={onCreateAudit}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Auditoria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar auditoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="in-progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="internal">Interna</SelectItem>
                <SelectItem value="external">Externa</SelectItem>
                <SelectItem value="flag-state">Bandeira</SelectItem>
                <SelectItem value="class">Classificadora</SelectItem>
                <SelectItem value="psc">PSC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audits by Status */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Todas ({filteredAudits.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Agendadas ({scheduledAudits.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            Em Andamento ({inProgressAudits.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({completedAudits.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAudits.map(renderAuditCard)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="scheduled">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledAudits.map(renderAuditCard)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="in-progress">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressAudits.map(renderAuditCard)}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="completed">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedAudits.map(renderAuditCard)}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
