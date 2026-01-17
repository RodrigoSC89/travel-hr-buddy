/**
 * Calendar Integration - Phase 5
 * Outlook/Google Calendar integration for automatic audit scheduling
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Calendar, Link, RefreshCw, Check, Clock, Bell, 
  Download, Upload, Settings, ExternalLink, AlertTriangle,
  CheckCircle2, XCircle, Loader2
} from "lucide-react";
import { format, addDays, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [connections, setConnections] = useState<CalendarConnection[]>([
    { provider: "outlook", email: "", connected: false, lastSync: null, autoSync: true },
    { provider: "google", email: "", connected: false, lastSync: null, autoSync: true }
  ]);
  
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "evt-1",
      title: "Auditoria PEOTRAM - Vessel Alpha",
      date: addDays(new Date(), 3),
      type: "audit",
      source: "local",
      synced: false,
      priority: "critical"
    },
    {
      id: "evt-2",
      title: "Inspeção MLC 2006 - Vessel Beta",
      date: addDays(new Date(), 7),
      type: "inspection",
      source: "local",
      synced: true,
      priority: "high"
    },
    {
      id: "evt-3",
      title: "Prazo Renovação ISM - Vessel Gamma",
      date: addDays(new Date(), 14),
      type: "deadline",
      source: "local",
      synced: false,
      priority: "critical"
    },
    {
      id: "evt-4",
      title: "Treinamento SGSO Obrigatório",
      date: addDays(new Date(), 21),
      type: "training",
      source: "local",
      synced: true,
      priority: "medium"
    }
  ]);

  const [syncing, setSyncing] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    syncAudits: true,
    syncInspections: true,
    syncDeadlines: true,
    syncTrainings: true,
    reminderDays: 7,
    autoCreateReminders: true
  });

  const handleConnect = useCallback(async (provider: "outlook" | "google") => {
    toast.info(`Conectando ao ${provider === "outlook" ? "Microsoft Outlook" : "Google Calendar"}...`);
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setConnections(prev => prev.map(conn => 
      conn.provider === provider 
        ? { 
            ...conn, 
            connected: true, 
            email: provider === "outlook" ? "user@empresa.com.br" : "user@gmail.com",
            lastSync: new Date()
          }
        : conn
    ));
    
    toast.success(`${provider === "outlook" ? "Outlook" : "Google Calendar"} conectado com sucesso!`);
  }, []);

  const handleDisconnect = useCallback(async (provider: "outlook" | "google") => {
    setConnections(prev => prev.map(conn => 
      conn.provider === provider 
        ? { ...conn, connected: false, email: "", lastSync: null }
        : conn
    ));
    toast.success(`${provider === "outlook" ? "Outlook" : "Google Calendar"} desconectado.`);
  }, []);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    toast.info("Sincronizando eventos com calendários externos...");
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setEvents(prev => prev.map(evt => ({ ...evt, synced: true })));
    setConnections(prev => prev.map(conn => 
      conn.connected ? { ...conn, lastSync: new Date() } : conn
    ));
    
    setSyncing(false);
    toast.success("Sincronização concluída! 4 eventos atualizados.");
  }, []);

  const handleExportICS = useCallback(() => {
    const icsContent = events.map(evt => `
BEGIN:VEVENT
DTSTART:${format(evt.date, "yyyyMMdd")}T090000Z
DTEND:${format(evt.date, "yyyyMMdd")}T180000Z
SUMMARY:${evt.title}
DESCRIPTION:Evento de ${evt.type} - NautiOne Compliance
END:VEVENT
    `).join("\n");

    const blob = new Blob([`BEGIN:VCALENDAR\nVERSION:2.0\n${icsContent}\nEND:VCALENDAR`], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nautione-compliance-calendar.ics";
    a.click();
    
    toast.success("Calendário exportado com sucesso!");
  }, [events]);

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
            Sincronizar Agora
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conexões Ativas</p>
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
                <p className="text-sm text-muted-foreground">Eventos Sincronizados</p>
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
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
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
                  Sincronize com seu calendário do Outlook/Microsoft 365
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
                      <span className="text-sm text-muted-foreground">Última Sincronização</span>
                      <span className="text-sm font-medium">
                        {connections[0].lastSync 
                          ? format(connections[0].lastSync, "dd/MM HH:mm", { locale: ptBR })
                          : "Nunca"
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="outlook-auto">Sincronização Automática</Label>
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
                  Sincronize com seu Google Calendar pessoal ou corporativo
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
                      <span className="text-sm text-muted-foreground">Última Sincronização</span>
                      <span className="text-sm font-medium">
                        {connections[1].lastSync 
                          ? format(connections[1].lastSync, "dd/MM HH:mm", { locale: ptBR })
                          : "Nunca"
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="google-auto">Sincronização Automática</Label>
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
              <CardTitle className="flex items-center justify-between">
                <span>Eventos Programados</span>
                <Badge variant="outline">{events.length} eventos</Badge>
              </CardTitle>
              <CardDescription>
                Auditorias, inspeções e prazos a serem sincronizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {events.map(event => (
                    <div 
                      key={event.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getTypeIcon(event.type)}</span>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(event.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
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
                            Sincronizado
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
                Defina quais eventos sincronizar e configurações de lembretes
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
                <h4 className="font-medium">Lembretes Automáticos</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-reminders">Criar Lembretes Automaticamente</Label>
                  <Switch 
                    id="auto-reminders" 
                    checked={syncSettings.autoCreateReminders}
                    onCheckedChange={(checked) => 
                      setSyncSettings(prev => ({ ...prev, autoCreateReminders: checked }))
                    }
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Label htmlFor="reminder-days">Dias de Antecedência</Label>
                  <Select 
                    value={String(syncSettings.reminderDays)}
                    onValueChange={(val) => 
                      setSyncSettings(prev => ({ ...prev, reminderDays: Number(val) }))
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

              <Button className="w-full">
                <Check className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
