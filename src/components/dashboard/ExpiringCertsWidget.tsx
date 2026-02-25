/**
 * ExpiringCertsWidget - Real-time alert widget for expiring certificates
 * Queries crew_certifications from Supabase
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Clock, Shield, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExpiringCert {
  id: string;
  certificate_name: string;
  expiry_date: string;
  crew_member_id: string;
  crew_name: string;
  days_until_expiry: number;
  severity: 'critical' | 'warning' | 'info';
}

export function ExpiringCertsWidget() {
  const navigate = useNavigate();

  const { data: certs = [], isLoading } = useQuery({
    queryKey: ['expiring-certs-widget'],
    queryFn: async () => {
      const now = new Date();
      const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('crew_certifications')
        .select('id, certificate_name, expiry_date, crew_member_id, crew_members!crew_certifications_crew_member_id_fkey(full_name)')
        .not('expiry_date', 'is', null)
        .lte('expiry_date', ninetyDays.toISOString())
        .order('expiry_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      return (data || []).map((cert: any): ExpiringCert => {
        const expiryDate = new Date(cert.expiry_date);
        const days = differenceInDays(expiryDate, now);
        return {
          id: cert.id,
          certificate_name: cert.certificate_name || 'Certificado',
          expiry_date: cert.expiry_date,
          crew_member_id: cert.crew_member_id,
          crew_name: cert.crew_members?.full_name || 'N/A',
          days_until_expiry: days,
          severity: days < 0 ? 'critical' : days <= 30 ? 'warning' : 'info',
        };
      });
    },
    staleTime: 60000,
  });

  if (isLoading) {
    return <Skeleton className="h-64" />;
  }

  const critical = certs.filter(c => c.severity === 'critical').length;
  const warning = certs.filter(c => c.severity === 'warning').length;

  return (
    <Card className="border-warning/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-warning" />
            Certificações Expirando
          </div>
          <div className="flex gap-1.5">
            {critical > 0 && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                {critical} vencidas
              </Badge>
            )}
            {warning > 0 && (
              <Badge className="bg-warning/15 text-warning border-warning/30 text-[10px] px-1.5 py-0">
                {warning} em 30d
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {certs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            <Shield className="h-8 w-8 mx-auto mb-2 opacity-30" />
            Nenhuma certificação próxima do vencimento
          </div>
        ) : (
          <>
            {certs.slice(0, 5).map((cert) => (
              <div
                key={cert.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                  cert.severity === 'critical' ? 'bg-destructive/5 border-destructive/20' :
                  cert.severity === 'warning' ? 'bg-warning/5 border-warning/20' :
                  'bg-muted/30 border-border/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {cert.severity === 'critical' ? (
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 text-warning shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{cert.certificate_name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{cert.crew_name}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className={`text-xs font-bold ${
                    cert.severity === 'critical' ? 'text-destructive' :
                    cert.severity === 'warning' ? 'text-warning' : 'text-muted-foreground'
                  }`}>
                    {cert.days_until_expiry < 0 
                      ? `${Math.abs(cert.days_until_expiry)}d atrás`
                      : `${cert.days_until_expiry}d`
                    }
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(cert.expiry_date), 'dd/MM/yy', { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}

            {certs.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => navigate('/maritime-command?tab=certifications')}
              >
                Ver todas ({certs.length}) <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}