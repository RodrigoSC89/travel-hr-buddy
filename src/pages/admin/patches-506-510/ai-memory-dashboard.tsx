import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Search, Filter, Download, RefreshCw, TrendingUp } from "lucide-react";
import { AIMemoryService } from "@/services/ai-memory-service";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AIMemoryEvent {
  id?: string;
  user_id?: string;
  organization_id?: string;
  event_type: string;
  event_data: any;
  context?: string;
  metadata?: Record<string, any>;
  confidence?: number;
  created_at?: string;
}

const AIMemoryDashboard = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<AIMemoryEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AIMemoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, selectedType, events]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await AIMemoryService.getRecentEvents(100);
      setEvents(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar eventos",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (selectedType !== "all") {
      filtered = filtered.filter(e => e.event_type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(e => 
        (e.context?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        e.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.user_id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

  const eventTypes = Array.from(new Set(events.map(e => e.event_type)));
  
  const uniqueUsers = new Set(events.map(e => e.user_id).filter(Boolean));

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-500";
    if (confidence >= 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  const exportEvents = () => {
    const dataStr = JSON.stringify(filteredEvents, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `ai-memory-events-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const stats = {
    total: events.length,
    avgConfidence: events.length > 0 ? events.reduce((sum, e) => sum + (e.confidence || 0), 0) / events.length : 0,
    uniqueUsers: uniqueUsers.size,
    uniqueTypes: eventTypes.length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold">AI Memory Layer</h1>
            <p className="text-muted-foreground">PATCH 506 - Event History & Context Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadEvents} variant="outline" size="icon">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={exportEvents} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Eventos</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Confiança Média</CardDescription>
            <CardTitle className="text-3xl">{(stats.avgConfidence * 100).toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Usuários Únicos</CardDescription>
            <CardTitle className="text-3xl">{stats.uniqueUsers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tipos de Evento</CardDescription>
            <CardTitle className="text-3xl">{stats.uniqueTypes}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por contexto, tipo ou agente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <select
              className="border rounded-md px-3 py-2"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Todos os tipos</option>
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes ({filteredEvents.length})</CardTitle>
          <CardDescription>Histórico de eventos AI com embeddings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando eventos...</div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum evento encontrado</div>
            ) : (
              filteredEvents.map(event => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{event.event_type}</Badge>
                      {event.user_id && (
                        <Badge variant="secondary" className="text-xs">
                          User: {event.user_id.slice(0, 8)}...
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getConfidenceColor(event.confidence || 0)}`}>
                        {((event.confidence || 0) * 100).toFixed(0)}%
                      </span>
                      {event.created_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                  {event.context && <p className="text-sm mb-2">{event.context}</p>}
                  {event.event_data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        Ver dados do evento
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                        {JSON.stringify(event.event_data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIMemoryDashboard;
