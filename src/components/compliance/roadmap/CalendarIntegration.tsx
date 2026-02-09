/**
 * Calendar Integration - Phase 5
 * OAuth2 integration with Google Calendar and Microsoft Graph API
 */

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAuditLog } from "@/hooks/use-audit-log";
import { 
  Calendar, Link, RefreshCw, Check, Clock, 
  Download, Settings, ExternalLink,
  CheckCircle2, XCircle, Loader2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { logger } from '@/lib/logger';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "audit" | "inspection" | "deadline" | "training";
  source: "local" | "outlook" | "google";
  synced: boolean;
  priority: "critical" | "high" | "medium" | "low";
}

interface CalendarConnection {
  provider: "outlook" | "google";
  email: string;
  connected: boolean;
  lastSync: Date | null;
  autoSync: boolean;
}

export const CalendarIntegration = () => {
  const { user } = useAuth();
  const { logSuccess, logError } = useAuditLog();
  const [connections, setConnections] = useState<CalendarConnection[]>([
    { provider: "outlook", email: "", connected: false, lastSync: null, autoSync: true },
    { provider: "google", email: "", connected: false, lastSync: null, autoSync: true }
  ]);
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    syncAudits: true,
    syncInspections: true,
    syncDeadlines: true,
    syncTrainings: true,
    reminderDays: 7,
    autoCreateReminders: true
  });

  // Fetch events - using mock data due to schema constraints
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        // Mock events for demo - real integration would query actual tables
        const calendarEvents: CalendarEvent[] = [
          { id: "evt-1", title: "Auditoria PEOTRAM Semestral", date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), type: "audit", source: "local", synced: false, priority: "critical" },
          { id: "evt-2", title: "Inspeção MLC 2006", date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), type: "inspection", source: "local", synced: false, priority: "high" },
          { id: "evt-3", title: "Prazo Renovação ISM", date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), type: "deadline", source: "local", synced: false, priority: "critical" },
          { id: "evt-4", title: "Treinamento SGSO", date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), type: "training", source: "local", synced: true, priority: "medium" }
        ];

        setEvents(calendarEvents);
        logSuccess("FETCH", "calendar_events", null, { count: calendarEvents.length });
      } catch (error) {
        logger.error("Error fetching events:", error);
        logError("FETCH", "calendar_events", error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleConnect = useCallback(async (provider: "outlook" | "google") => {
    toast.info(`Iniciando conexão OAuth2 com ${provider === "outlook" ? "Microsoft" : "Google"}...`);
    
    // Build OAuth URL based on provider
    const redirectUri = `${window.location.origin}/auth/callback`;
    const state = btoa(JSON.stringify({ provider, userId: user?.id }));
    
    let authUrl: string;
    
    if (provider === "google") {
      // Google Calendar OAuth2
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
        access_type: 'offline',
        prompt: 'consent',
        state
      });
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } else {
      // Microsoft Graph OAuth2
      const params = new URLSearchParams({
        client_id: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'Calendars.ReadWrite offline_access',
        state
      });
      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
    }

    // Check if client IDs are configured
    if ((provider === "google" && !import.meta.env.VITE_GOOGLE_CLIENT_ID) ||
        (provider === "outlook" && !import.meta.env.VITE_MICROSOFT_CLIENT_ID)) {
      toast.error(`Integração ${provider === "outlook" ? "Outlook" : "Google Calendar"} não configurada`, {
        description: "Configure as credenciais OAuth nas variáveis de ambiente."
      });
      return;
    }

    // Open OAuth window
    window.open(authUrl, '_blank', 'width=500,height=600');
  }, [user, logSuccess]);

  const handleDisconnect = useCallback(async (provider: "outlook" | "google") => {
    setConnections(prev => prev.map(conn => 
      conn.provider === provider 
        ? { ...conn, connected: false, email: "", lastSync: null }
        : conn
    ));
    logSuccess("DISCONNECT", "calendar_integration", null, { provider });
    toast.success(`${provider === "outlook" ? "Outlook" : "Google Calendar"} desconectado.`);
  }, [logSuccess]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    toast.info("Sincronizando eventos com calendários externos...");
    
    try {
      // Call edge function to sync calendars
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { 
          events: events.filter(e => !e.synced),
          connections: connections.filter(c => c.connected)
        }
      });

      if (error) throw error;

      setEvents(prev => prev.map(evt => ({ ...evt, synced: true })));
      setConnections(prev => prev.map(conn => 
        conn.connected ? { ...conn, lastSync: new Date() } : conn
      ));
      
      logSuccess("SYNC", "calendar_events", null, { syncedCount: events.length });
      toast.success(`Sincronização concluída! ${events.length} eventos atualizados.`);
    } catch (error) {
      logger.error("Sync error:", error);
      toast.error("Erro na sincronização do calendário", {
        description: "Verifique a configuração da integração e tente novamente."
      });
    } finally {
      setSyncing(false);
    }
  }, [events, connections, logSuccess]);

  const handleExportICS = useCallback(() => {
    const icsContent = events.map(evt => `BEGIN:VEVENT
DTSTART:${format(evt.date, "yyyyMMdd")}T090000Z
DTEND:${format(evt.date, "yyyyMMdd")}T180000Z
SUMMARY:${evt.title}
DESCRIPTION:Evento de ${evt.type} - NautiOne Compliance
UID:${evt.id}@nautione.app
END:VEVENT`).join("\n");

    const blob = new Blob([`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//NautiOne//Compliance Calendar//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
${icsContent}
END:VCALENDAR`], { type: "text/calendar;charset=utf-8" });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nautione-compliance-${format(new Date(), "yyyy-MM-dd")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    
    logSuccess("EXPORT", "calendar_ics", null, { eventCount: events.length });
    toast.success("Calendário exportado com sucesso!");
  }, [events, logSuccess]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-500/10 text-red-500 border-red-500/30";
      case "high": return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "medium": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "low": return "bg-green-500/10 text-green-500 border-green-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "audit": return "📋";
      case "inspection": return "🔍";
      case "deadline": return "⏰";
      case "training": return "🎓";
      default: return "📅";
    }
  };

  const connectedCount = connections.filter(c => c.connected).length;
  const syncedCount = events.filter(e => e.synced).length;
  const pendingCount = events.filter(e => !e.synced).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Integração de Calendário
          </h2>
          <p className="text-muted-foreground">
            Sincronize auditorias e prazos com Outlook e Google Calendar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportICS}>
            <Download className="h-4 w-4 mr-2" />
            Exportar .ICS
          </Button>
          <Button onClick={handleSync} disabled={syncing || connectedCount === 0}>
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Sincronizar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conexões</p>
                <p className="text-2xl font-bold">{connectedCount}/2</p>
              </div>
              <Link className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sincronizados</p>
                <p className="text-2xl font-bold">{syncedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="connections">Conexões</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Outlook Card */}
            <Card className={connections[0].connected ? "border-green-500/30" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">
                    O
                  </div>
                  Microsoft Outlook
                  {connections[0].connected && (
                    <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-500">
                      <Check className="h-3 w-3 mr-1" /> Conectado
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Sincronize com Microsoft 365 via Graph API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connections[0].connected ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Conta</span>
                      <span className="text-sm font-medium">{connections[0].email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Última Sync</span>
                      <span className="text-sm font-medium">
                        {connections[0].lastSync 
                          ? format(connections[0].lastSync, "dd/MM HH:mm", { locale: ptBR })
                          : "Nunca"
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="outlook-auto">Auto Sync</Label>
                      <Switch id="outlook-auto" checked={connections[0].autoSync} />
                    </div>
                    <Separator />
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => handleDisconnect("outlook")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleConnect("outlook")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Conectar com Microsoft
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Google Calendar Card */}
            <Card className={connections[1].connected ? "border-green-500/30" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-sm">
                    G
                  </div>
                  Google Calendar
                  {connections[1].connected && (
                    <Badge variant="outline" className="ml-auto bg-green-500/10 text-green-500">
                      <Check className="h-3 w-3 mr-1" /> Conectado
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Sincronize com Google Calendar via OAuth2
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connections[1].connected ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Conta</span>
                      <span className="text-sm font-medium">{connections[1].email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Última Sync</span>
                      <span className="text-sm font-medium">
                        {connections[1].lastSync 
                          ? format(connections[1].lastSync, "dd/MM HH:mm", { locale: ptBR })
                          : "Nunca"
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="google-auto">Auto Sync</Label>
                      <Switch id="google-auto" checked={connections[1].autoSync} />
                    </div>
                    <Separator />
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => handleDisconnect("google")}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleConnect("google")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Conectar com Google
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Compliance</CardTitle>
              <CardDescription>
                Auditorias, inspeções e prazos para sincronizar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {events.map(event => (
                    <div 
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(event.type)}</span>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(event.date, "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getPriorityColor(event.priority)}>
                          {event.priority}
                        </Badge>
                        {event.synced ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Sync
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                            <Clock className="h-3 w-3 mr-1" />
                            Pendente
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Sincronização
              </CardTitle>
              <CardDescription>
                Configure quais tipos de eventos sincronizar automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Tipos de Eventos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-audits">Auditorias</Label>
                    <Switch 
                      id="sync-audits" 
                      checked={syncSettings.syncAudits}
                      onCheckedChange={(checked) => 
                        setSyncSettings(prev => ({ ...prev, syncAudits: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-inspections">Inspeções</Label>
                    <Switch 
                      id="sync-inspections" 
                      checked={syncSettings.syncInspections}
                      onCheckedChange={(checked) => 
                        setSyncSettings(prev => ({ ...prev, syncInspections: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-deadlines">Prazos</Label>
                    <Switch 
                      id="sync-deadlines" 
                      checked={syncSettings.syncDeadlines}
                      onCheckedChange={(checked) => 
                        setSyncSettings(prev => ({ ...prev, syncDeadlines: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-trainings">Treinamentos</Label>
                    <Switch 
                      id="sync-trainings" 
                      checked={syncSettings.syncTrainings}
                      onCheckedChange={(checked) => 
                        setSyncSettings(prev => ({ ...prev, syncTrainings: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Lembretes</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-reminders">Criar lembretes automaticamente</Label>
                  <Switch 
                    id="auto-reminders" 
                    checked={syncSettings.autoCreateReminders}
                    onCheckedChange={(checked) => 
                      setSyncSettings(prev => ({ ...prev, autoCreateReminders: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-days">Antecedência (dias)</Label>
                  <Select 
                    value={syncSettings.reminderDays.toString()}
                    onValueChange={(value) => 
                      setSyncSettings(prev => ({ ...prev, reminderDays: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 dia</SelectItem>
                      <SelectItem value="3">3 dias</SelectItem>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="14">14 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <Button 
                className="w-full" 
                onClick={() => {
                  logSuccess("UPDATE", "calendar_settings", null, syncSettings);
                  toast.success("Configurações salvas!");
                }}
              >
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarIntegration;
