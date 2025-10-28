/**
 * Weather Alerts Component
 * PATCH 386 - Real-time weather alert system with notifications
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CloudRain, Wind, Thermometer, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WeatherAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  type: 'wind' | 'rain' | 'temperature' | 'storm' | 'fog';
  title: string;
  description: string;
  location: string;
  validUntil: string;
  isActive: boolean;
}

export const WeatherAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWeatherAlerts();
    
    // Set up real-time subscription for new alerts
    const subscription = supabase
      .channel('weather_alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'weather_alerts'
      }, (payload) => {
        const newAlert = payload.new as any;
        handleNewAlert(newAlert);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchWeatherAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weather_alerts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAlerts: WeatherAlert[] = (data || []).map((alert: any) => ({
        id: alert.id,
        severity: alert.severity || 'info',
        type: alert.alert_type || 'wind',
        title: alert.title,
        description: alert.description,
        location: alert.location || 'Unknown',
        validUntil: alert.valid_until,
        isActive: alert.is_active
      }));

      setAlerts(formattedAlerts);
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAlert = (newAlert: any) => {
    const alert: WeatherAlert = {
      id: newAlert.id,
      severity: newAlert.severity || 'info',
      type: newAlert.alert_type || 'wind',
      title: newAlert.title,
      description: newAlert.description,
      location: newAlert.location || 'Unknown',
      validUntil: newAlert.valid_until,
      isActive: newAlert.is_active
    };

    setAlerts(prev => [alert, ...prev]);

    // Show system notification for critical alerts
    if (alert.severity === 'critical') {
      toast({
        title: `⚠️ ${alert.title}`,
        description: alert.description,
        variant: 'destructive',
      });

      // Request browser notification permission if critical
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(alert.title, {
          body: alert.description,
          icon: '/weather-alert-icon.png',
          tag: alert.id,
        });
      }
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'wind':
        return <Wind className="h-5 w-5" />;
      case 'rain':
      case 'storm':
        return <CloudRain className="h-5 w-5" />;
      case 'temperature':
        return <Thermometer className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Weather Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading alerts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Weather Alerts
          </div>
          <Badge variant="outline">{alerts.length} Active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No active weather alerts. All conditions normal.
          </p>
        ) : (
          alerts.map((alert) => (
            <Alert key={alert.id} variant={getSeverityVariant(alert.severity)}>
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <AlertTitle className="flex items-center justify-between">
                    {alert.title}
                    <Badge variant={getSeverityVariant(alert.severity)} className="ml-2">
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription className="mt-2">
                    {alert.description}
                  </AlertDescription>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>Location: {alert.location}</p>
                    <p>Valid until: {new Date(alert.validUntil).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
};
