import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CrewHealthRecord, WellbeingAlert } from '@/types/modules';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Activity, AlertTriangle, TrendingUp, Brain } from 'lucide-react';
import { toast } from 'sonner';

export function CrewWellbeingDashboard() {
  const [healthRecords, setHealthRecords] = useState<CrewHealthRecord[]>([]);
  const [alerts, setAlerts] = useState<WellbeingAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWellbeingData();
  }, []);

  const loadWellbeingData = async () => {
    try {
      const [recordsRes, alertsRes] = await Promise.all([
        supabase
          .from('crew_health_records')
          .select('*')
          .order('record_date', { ascending: false })
          .limit(20),
        supabase
          .from('wellbeing_alerts')
          .select('*')
          .eq('status', 'active')
          .order('severity', { ascending: false })
          .order('detected_at', { ascending: false })
      ]);

      if (recordsRes.error) throw recordsRes.error;
      if (alertsRes.error) throw alertsRes.error;

      setHealthRecords(recordsRes.data || []);
      setAlerts(alertsRes.data || []);
    } catch (error) {
      console.error('Error loading wellbeing data:', error);
      toast.error('Failed to load wellbeing data');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      critical: 'destructive'
    };

    return (
      <Badge variant={variants[severity] || 'default'}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getHealthStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      excellent: 'text-green-500',
      good: 'text-blue-500',
      fair: 'text-yellow-500',
      poor: 'text-orange-500',
      critical: 'text-red-500'
    };

    return colors[status] || 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading wellbeing data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Crew Wellbeing</h2>
          <p className="text-sm text-muted-foreground">
            Health monitoring and AI-powered wellbeing insights
          </p>
        </div>
        <Button>
          <Heart className="mr-2 h-4 w-4" />
          New Health Record
        </Button>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Active Alerts
          </TabsTrigger>
          <TabsTrigger value="records">
            <Activity className="mr-2 h-4 w-4" />
            Health Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <Heart className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-muted-foreground">No active wellbeing alerts</p>
                <p className="text-xs text-muted-foreground mt-2">All crew members are in good health</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id} className={alert.severity === 'critical' ? 'border-red-500' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      {alert.title}
                    </CardTitle>
                    <div className="flex gap-2">
                      {getSeverityBadge(alert.severity)}
                      {alert.ai_generated && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {alert.alert_type.replace('_', ' ').toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{alert.description}</p>
                  
                  {alert.recommended_actions && alert.recommended_actions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Recommended Actions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {alert.recommended_actions.map((action, index) => (
                          <li key={index} className="text-sm text-muted-foreground">{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {alert.ai_confidence_score && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground">
                        AI Confidence: {(alert.ai_confidence_score * 100).toFixed(0)}%
                      </p>
                      <div className="w-full h-1 bg-secondary rounded-full mt-1">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${alert.ai_confidence_score * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Acknowledge</Button>
                    <Button size="sm">Take Action</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {healthRecords.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center p-8">
                  <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No health records available</p>
                  <Button variant="outline" className="mt-4">
                    Add First Record
                  </Button>
                </CardContent>
              </Card>
            ) : (
              healthRecords.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base capitalize">
                        {record.record_type.replace('_', ' ')}
                      </CardTitle>
                      {record.overall_health_status && (
                        <Badge className={getHealthStatusColor(record.overall_health_status)}>
                          {record.overall_health_status}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {new Date(record.record_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {record.fatigue_level && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fatigue Level:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{record.fatigue_level}/10</span>
                            <div className="w-20 h-2 bg-secondary rounded-full">
                              <div
                                className={`h-full rounded-full ${
                                  record.fatigue_level > 7 ? 'bg-red-500' :
                                  record.fatigue_level > 4 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${(record.fatigue_level / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {record.stress_level && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stress Level:</span>
                          <span className="font-medium">{record.stress_level}/10</span>
                        </div>
                      )}
                      
                      {record.sleep_hours && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sleep:</span>
                          <span className="font-medium">{record.sleep_hours}h ({record.sleep_quality})</span>
                        </div>
                      )}
                      
                      {record.heart_rate_bpm && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Heart Rate:</span>
                          <span className="font-medium">{record.heart_rate_bpm} bpm</span>
                        </div>
                      )}
                      
                      {record.is_fit_for_duty !== undefined && (
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-muted-foreground">Fit for Duty:</span>
                          <Badge variant={record.is_fit_for_duty ? 'default' : 'destructive'}>
                            {record.is_fit_for_duty ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
