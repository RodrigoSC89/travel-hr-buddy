import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  AlertTriangle, 
  Clock, 
  FileText, 
  Calendar,
  User,
  X
} from 'lucide-react';

interface CertificateAlert {
  id: string;
  employee_id: string;
  employee_name: string;
  certificate_name: string;
  certificate_type: string;
  expiry_date: string;
  status: 'expiring_soon' | 'expired';
  days_until_expiry: number;
}

export const CertificateAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<CertificateAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlertsDialog, setShowAlertsDialog] = useState(false);

  useEffect(() => {
    loadCertificateAlerts();
  }, []);

  const loadCertificateAlerts = async () => {
    setIsLoading(true);
    try {
      // Get certificates that are expired or expiring soon
      const { data, error } = await supabase
        .from('employee_certificates')
        .select(`
          id,
          employee_id,
          certificate_name,
          certificate_type,
          expiry_date,
          status
        `)
        .in('status', ['expired', 'expiring_soon'])
        .order('expiry_date', { ascending: true });

      if (error) throw error;

      // For now, we'll simulate employee names since we don't have a direct relationship
      // In a real scenario, you'd join with an employees table
      const alertsWithEmployeeNames = (data || []).map(cert => {
        const today = new Date();
        const expiryDate = new Date(cert.expiry_date);
        const daysUntilExpiry = differenceInDays(expiryDate, today);
        
        return {
          ...cert,
          employee_name: `Funcionário ${cert.employee_id.slice(-3)}`, // Simulated name
          days_until_expiry: daysUntilExpiry
        } as CertificateAlert;
      });

      setAlerts(alertsWithEmployeeNames);
    } catch (error) {
      console.error('Error loading certificate alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertIcon = (status: string) => {
    switch (status) {
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'expiring_soon':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getAlertBadge = (status: string, daysUntilExpiry: number) => {
    if (status === 'expired') {
      return (
        <Badge variant="destructive">
          Expirado há {Math.abs(daysUntilExpiry)} dias
        </Badge>
      );
    } else if (status === 'expiring_soon') {
      return (
        <Badge variant="secondary" className="bg-warning text-warning-foreground">
          Expira em {daysUntilExpiry} dias
        </Badge>
      );
    }
    return null;
  };

  const expiredCount = alerts.filter(alert => alert.status === 'expired').length;
  const expiringSoonCount = alerts.filter(alert => alert.status === 'expiring_soon').length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Alertas de Certificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Carregando alertas...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-success">
            <FileText className="mr-2 h-5 w-5" />
            Certificados em Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Todos os certificados estão válidos!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowAlertsDialog(true)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-warning" />
              Alertas de Certificados
            </div>
            <Badge variant="destructive">
              {alerts.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Certificados que precisam de atenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {expiredCount > 0 && (
              <div className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                <span className="text-sm font-medium text-destructive">
                  Certificados Expirados
                </span>
                <Badge variant="destructive">{expiredCount}</Badge>
              </div>
            )}
            {expiringSoonCount > 0 && (
              <div className="flex items-center justify-between p-2 bg-warning/10 rounded">
                <span className="text-sm font-medium text-warning">
                  Expirando em Breve
                </span>
                <Badge variant="secondary" className="bg-warning text-warning-foreground">
                  {expiringSoonCount}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Dialog */}
      <AlertDialog open={showAlertsDialog} onOpenChange={setShowAlertsDialog}>
        <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-warning" />
              Alertas de Certificados ({alerts.length})
            </AlertDialogTitle>
            <AlertDialogDescription>
              Certificados que expiraram ou estão prestes a expirar
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.status)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold">{alert.certificate_name}</h4>
                        {getAlertBadge(alert.status, alert.days_until_expiry)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <User className="mr-1 h-4 w-4" />
                          {alert.employee_name}
                        </div>
                        <div className="flex items-center">
                          <FileText className="mr-1 h-4 w-4" />
                          {alert.certificate_type}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          Validade: {format(new Date(alert.expiry_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowAlertsDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Fechar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};