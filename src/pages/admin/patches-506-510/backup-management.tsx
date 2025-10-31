import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HardDrive, Download, RefreshCw, Trash2, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { BackupService } from "@/services/backup-service";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Backup {
  id?: string;
  backup_type: string;
  file_path: string;
  file_size?: number | null;
  backup_status: string;
  metadata?: Record<string, any>;
  created_by?: string | null;
  created_at?: string;
  completed_at?: string | null;
  error_message?: string | null;
}

const BackupManagement = () => {
  const { toast } = useToast();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const data = await BackupService.getAllBackups();
      setBackups(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar backups",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateBackup = async () => {
    try {
      setSimulating(true);
      const result = await BackupService.simulateBackup();
      
      if (result.success) {
        toast({
          title: "✅ Backup Simulado",
          description: "Backup de teste criado com sucesso"
        });
        await loadBackups();
      }
    } catch (error) {
      toast({
        title: "Erro ao simular backup",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setSimulating(false);
    }
  };

  const deleteOldBackups = async () => {
    try {
      const deleted = await BackupService.cleanupOldBackups(7);
      toast({
        title: "Backups Antigos Removidos",
        description: `${deleted} backup(s) removido(s)`
      });
      await loadBackups();
    } catch (error) {
      toast({
        title: "Erro ao remover backups",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const stats = {
    total: backups.length,
    completed: backups.filter(b => b.backup_status === "completed").length,
    totalSize: backups.reduce((sum, b) => sum + (b.file_size ? b.file_size / (1024 * 1024) : 0), 0),
    lastBackup: backups.length > 0 && backups[0].created_at ? backups[0].created_at : null
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HardDrive className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold">Backup Management</h1>
            <p className="text-muted-foreground">PATCH 507 - Automated Backup System</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadBackups} variant="outline" size="icon">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={simulateBackup} disabled={simulating}>
            {simulating ? "Simulando..." : "Simular Backup"}
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          Backups automáticos são executados semanalmente. Configure o cron no <code>supabase/config.toml</code>
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Backups</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completos</CardDescription>
            <CardTitle className="text-3xl">{stats.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Tamanho Total</CardDescription>
            <CardTitle className="text-3xl">{stats.totalSize.toFixed(1)} MB</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Último Backup</CardDescription>
            <CardTitle className="text-sm">
              {stats.lastBackup ? formatDistanceToNow(new Date(stats.lastBackup), { addSuffix: true, locale: ptBR }) : "N/A"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" onClick={deleteOldBackups}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Backups Antigos (manter últimos 7)
          </Button>
        </CardContent>
      </Card>

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
          <CardDescription>Lista de todos os backups do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando backups...</div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Nenhum backup encontrado</div>
            ) : (
              backups.map(backup => (
                <div key={backup.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(backup.backup_status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{backup.backup_type}</span>
                          <Badge variant={getStatusColor(backup.backup_status) as any}>
                            {backup.backup_status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {backup.created_at && formatDistanceToNow(new Date(backup.created_at), { addSuffix: true, locale: ptBR })}
                          {backup.file_size && ` • ${(backup.file_size / (1024 * 1024)).toFixed(2)} MB`}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {backup.backup_status === "completed" && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackupManagement;
