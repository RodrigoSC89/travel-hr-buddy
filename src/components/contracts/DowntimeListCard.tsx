/**
 * DowntimeListCard - Lista de downtimes com status de validação
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, Plus, AlertTriangle, CheckCircle, 
  XCircle, RefreshCw, Eye, Zap, Ship
} from 'lucide-react';
import { VesselDowntime, useVesselDowntimes } from '@/hooks/use-vessel-downtimes';
import { DowntimeFormDialog } from './DowntimeFormDialog';
import { DowntimeValidationCard } from './DowntimeValidationCard';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  vesselId?: string;
  contractId?: string;
}

export function DowntimeListCard({ vesselId, contractId }: Props) {
  const { downtimes, loading, createDowntime, refresh, stats } = useVesselDowntimes(vesselId);
  const [showForm, setShowForm] = useState(false);
  const [selectedDowntime, setSelectedDowntime] = useState<VesselDowntime | null>(null);

  const getStatusBadge = (status: VesselDowntime['validation_status']) => {
    const config = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pendente' },
      approved: { variant: 'default' as const, icon: CheckCircle, label: 'Aprovado' },
      requires_review: { variant: 'outline' as const, icon: AlertTriangle, label: 'Revisão' },
      rejected: { variant: 'destructive' as const, icon: XCircle, label: 'Rejeitado' },
    };
    const { variant, icon: Icon, label } = config[status] || config.pending;
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" /> {label}
      </Badge>
    );
  };

  const getCategoryLabel = (category: VesselDowntime['category']) => {
    const labels: Record<string, string> = {
      mechanical: 'Mecânico',
      weather: 'Clima',
      operational: 'Operacional',
      administrative: 'Administrativo',
      regulatory: 'Regulatório',
      emergency: 'Emergência',
    };
    return labels[category] || category;
  };

  const handleSubmit = async (data: Parameters<typeof createDowntime>[0]) => {
    await createDowntime({
      ...data,
      vessel_id: vesselId,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Registro de Downtimes</CardTitle>
                <CardDescription>
                  {stats.total} eventos • {stats.totalHours.toFixed(1)}h total
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-1" /> Registrar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-primary/10">
              <p className="text-2xl font-bold text-primary">{stats.approved}</p>
              <p className="text-xs text-muted-foreground">Aprovados</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-secondary/50">
              <p className="text-2xl font-bold text-secondary-foreground">{stats.requiresReview}</p>
              <p className="text-xs text-muted-foreground">Em Revisão</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-accent/50">
              <p className="text-2xl font-bold">{stats.totalHours.toFixed(0)}h</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* List */}
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : downtimes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Ship className="h-8 w-8 mb-2" />
                <p>Nenhum downtime registrado</p>
                <Button variant="link" size="sm" onClick={() => setShowForm(true)}>
                  Registrar primeiro evento
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {downtimes.map((dt) => (
                  <div 
                    key={dt.id} 
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDowntime(dt)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(dt.category)}
                          </Badge>
                          {getStatusBadge(dt.validation_status)}
                        </div>
                        <p className="text-sm font-medium line-clamp-2">
                          {dt.reported_reason}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{format(new Date(dt.start_time), 'dd/MM/yyyy HH:mm')}</span>
                          {dt.duration_hours && (
                            <span className="font-medium">{dt.duration_hours.toFixed(1)}h</span>
                          )}
                          <span>{formatDistanceToNow(new Date(dt.created_at), { addSuffix: true, locale: ptBR })}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {dt.validation_status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDowntime(dt);
                            }}
                          >
                            <Zap className="h-4 w-4" />
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
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <DowntimeFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleSubmit}
        contractId={contractId}
      />

      {/* Validation Panel */}
      {selectedDowntime && (
        <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-xl z-50 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Validação de Downtime</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDowntime(null)}>
              ✕
            </Button>
          </div>
          <DowntimeValidationCard 
            downtimeId={selectedDowntime.id}
            onValidationComplete={() => {
              refresh();
              setSelectedDowntime(null);
            }}
          />
        </div>
      )}
    </>
  );
}

export default DowntimeListCard;
