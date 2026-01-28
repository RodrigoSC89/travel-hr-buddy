/**
 * Fraud Alert List - ML-based fraud detection alerts
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle, XCircle, DollarSign, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FraudAlert {
  id: string;
  timestamp: Date;
  transactionId: string;
  amount: number;
  vendor: string;
  userId: string;
  userName: string;
  fraudScore: number;
  indicators: string[];
  status: 'pending' | 'approved' | 'rejected' | 'investigating';
}

interface FraudAlertListProps {
  alerts?: FraudAlert[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onInvestigate?: (id: string) => void;
  className?: string;
}

const STATUS_CONFIG = {
  pending: { color: 'bg-yellow-500', label: 'Pendente' },
  approved: { color: 'bg-green-500', label: 'Aprovado' },
  rejected: { color: 'bg-red-500', label: 'Rejeitado' },
  investigating: { color: 'bg-blue-500', label: 'Investigando' },
};

export function FraudAlertList({ 
  alerts = [], 
  onApprove, 
  onReject, 
  onInvestigate,
  className 
}: FraudAlertListProps) {
  const pendingCount = alerts.filter(a => a.status === 'pending').length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Fraud Detection
            </CardTitle>
            <CardDescription>Alertas de transações suspeitas</CardDescription>
          </div>
          {pendingCount > 0 && (
            <Badge variant="destructive">
              {pendingCount} pendente(s)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p>Nenhuma transação suspeita</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {alerts.map((alert) => {
                const statusConfig = STATUS_CONFIG[alert.status];
                
                return (
                  <div 
                    key={alert.id}
                    className={cn(
                      "p-4 rounded-lg border",
                      alert.fraudScore >= 80 && "bg-red-500/10 border-red-500/20",
                      alert.fraudScore >= 50 && alert.fraudScore < 80 && "bg-yellow-500/10 border-yellow-500/20",
                      alert.fraudScore < 50 && "bg-muted/50"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">
                            ${alert.amount.toLocaleString()}
                          </span>
                          <Badge className={cn(statusConfig.color, "text-white text-xs")}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.vendor}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "text-xl font-bold",
                          alert.fraudScore >= 80 ? "text-red-500" :
                          alert.fraudScore >= 50 ? "text-yellow-500" : "text-green-500"
                        )}>
                          {alert.fraudScore}%
                        </div>
                        <p className="text-xs text-muted-foreground">Fraud Score</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {alert.userName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>

                    {/* Indicators */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {alert.indicators.slice(0, 3).map((indicator, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {indicator}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    {alert.status === 'pending' && (
                      <div className="flex gap-2">
                        {onApprove && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 h-8"
                            onClick={() => onApprove(alert.id)}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aprovar
                          </Button>
                        )}
                        {onReject && (
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="flex-1 h-8"
                            onClick={() => onReject(alert.id)}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejeitar
                          </Button>
                        )}
                        {onInvestigate && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-8"
                            onClick={() => onInvestigate(alert.id)}
                          >
                            Investigar
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default FraudAlertList;
