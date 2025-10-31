import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, RefreshCw, AlertTriangle, CheckCircle, XCircle, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RLSAccessLog {
  id: string;
  user_id: string | null;
  table_name: string;
  operation: string;
  access_granted: boolean;
  policy_name?: string | null;
  created_at: string;
}

const RLSAuditDashboard = () => {
  const { toast } = useToast();
  const [accessLogs, setAccessLogs] = useState<RLSAccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccessLogs();
  }, []);

  const loadAccessLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("rls_access_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setAccessLogs((data || []).map(d => ({
        id: d.id,
        user_id: d.user_id,
        table_name: d.table_name,
        operation: d.operation,
        access_granted: d.access_granted,
        policy_name: d.policy_name,
        created_at: d.created_at
      })));
    } catch (error) {
      toast({
        title: "Erro ao carregar logs",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deniedAccess = accessLogs.filter(log => !log.access_granted);
  const allowedAccess = accessLogs.filter(log => log.access_granted);

  const tableStats = accessLogs.reduce((acc, log) => {
    if (!acc[log.table_name]) {
      acc[log.table_name] = { allowed: 0, denied: 0 };
    }
    if (log.access_granted) {
      acc[log.table_name].allowed++;
    } else {
      acc[log.table_name].denied++;
    }
    return acc;
  }, {} as Record<string, { allowed: number; denied: number }>);

  const stats = {
    totalAccess: accessLogs.length,
    deniedAccess: deniedAccess.length,
    allowedAccess: allowedAccess.length,
    uniqueTables: Object.keys(tableStats).length,
    deniedRate: accessLogs.length > 0 ? (deniedAccess.length / accessLogs.length) * 100 : 0
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-bold">RLS Audit Dashboard</h1>
            <p className="text-muted-foreground">PATCH 508 - Row Level Security Monitoring</p>
          </div>
        </div>
        <Button onClick={loadAccessLogs} variant="outline" size="icon">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Acessos</CardDescription>
            <CardTitle className="text-3xl">{stats.totalAccess}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Acessos Permitidos</CardDescription>
            <CardTitle className="text-3xl text-green-500">{stats.allowedAccess}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Acessos Negados</CardDescription>
            <CardTitle className="text-3xl text-red-500">{stats.deniedAccess}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tabelas Monitoradas</CardDescription>
            <CardTitle className="text-3xl">{stats.uniqueTables}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Taxa de Bloqueio</CardDescription>
            <CardTitle className="text-3xl">{stats.deniedRate.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="denied" className="space-y-4">
        <TabsList>
          <TabsTrigger value="denied">
            <XCircle className="h-4 w-4 mr-2" />
            Acessos Negados ({deniedAccess.length})
          </TabsTrigger>
          <TabsTrigger value="allowed">
            <CheckCircle className="h-4 w-4 mr-2" />
            Acessos Permitidos ({allowedAccess.length})
          </TabsTrigger>
          <TabsTrigger value="tables">
            <Database className="h-4 w-4 mr-2" />
            Por Tabela ({stats.uniqueTables})
          </TabsTrigger>
        </TabsList>

        {/* Denied Access */}
        <TabsContent value="denied">
          <Card>
            <CardHeader>
              <CardTitle>Acessos Negados - Possíveis Ataques</CardTitle>
              <CardDescription>Tentativas de acesso bloqueadas por RLS policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deniedAccess.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    ✅ Nenhum acesso negado - Sistema seguro
                  </div>
                ) : (
                  deniedAccess.map(log => (
                    <div key={log.id} className="border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-950/20">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="destructive">{log.operation}</Badge>
                              <Badge variant="outline">{log.table_name}</Badge>
                              {log.policy_name && (
                                <Badge variant="secondary" className="text-xs">
                                  Policy: {log.policy_name}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              User ID: <code className="text-xs">{log.user_id}</code>
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allowed Access */}
        <TabsContent value="allowed">
          <Card>
            <CardHeader>
              <CardTitle>Acessos Permitidos</CardTitle>
              <CardDescription>Operações autorizadas pelas RLS policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allowedAccess.slice(0, 50).map(log => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{log.operation}</Badge>
                          <Badge variant="secondary">{log.table_name}</Badge>
                          {log.policy_name && (
                            <span className="text-xs text-muted-foreground">via {log.policy_name}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Table */}
        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle>Acessos por Tabela</CardTitle>
              <CardDescription>Estatísticas de acesso por tabela</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(tableStats).map(([table, stats]) => (
                  <div key={table} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{table}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-green-600">
                          ✓ {stats.allowed}
                        </Badge>
                        <Badge variant="outline" className="text-red-600">
                          ✗ {stats.denied}
                        </Badge>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(stats.allowed / (stats.allowed + stats.denied)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RLSAuditDashboard;
