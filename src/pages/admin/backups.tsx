/**
 * PATCH 507: Backup Management Admin Panel
 * View, download, and manage system backups
 */

import { useEffect, useState, useCallback } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, Trash2, Database, Calendar, HardDrive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface BackupSnapshot {
  id: string;
  backup_name: string;
  backup_type: string;
  status: string;
  storage_path: string;
  file_size: number;
  checksum: string;
  tables_included: string[];
  records_count: Record<string, number>;
  created_at: string;
  completed_at: string;
  error_message?: string;
}

interface BackupStats {
  total_backups: number;
  completed_backups: number;
  failed_backups: number;
  total_size: number;
  last_backup_date: string;
  next_backup_due: string;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<BackupSnapshot[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBackups();
    loadStats();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as unknown)
        .from("backup_snapshots")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setBackups((data || []) as unknown);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load backups",
        variant: "destructive",
      };
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await (supabase as unknown).rpc("get_backup_stats");

      if (error) throw error;

      if (data && data.length > 0) {
        setStats(data[0] as unknown);
      }
    } catch (error) {
      // Silent fail for stats
    }
  };

  const triggerBackup = async () => {
    try {
      setTriggering(true);
      toast({
        title: "Backup Started",
        description: "Manual backup is being created...",
      };

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekly-backup`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Backup failed");
      }

      toast({
        title: "Success",
        description: "Backup completed successfully",
      });

      loadBackups();
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to trigger backup",
        variant: "destructive",
      });
    } finally {
      setTriggering(false);
    }
  };

  const downloadBackup = async (backup: BackupSnapshot) => {
    try {
      if (!backup.storage_path) {
        throw new Error("No storage path available");
      }

      const { data, error } = await supabase.storage
        .from("backups")
        .download(backup.storage_path.replace("backups/", ""));

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${backup.backup_name}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Backup downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download backup",
        variant: "destructive",
      });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      in_progress: "secondary",
      failed: "destructive",
      pending: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Backups</h1>
          <p className="text-muted-foreground">Manage automated and manual backups</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadBackups} variant="outline" disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={triggerBackup} disabled={triggering}>
            <Database className="w-4 h-4 mr-2" />
            {triggering ? "Creating..." : "Manual Backup"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Backups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_backups}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completed_backups}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBytes(stats.total_size)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Next Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {stats.next_backup_due
                  ? formatDistanceToNow(new Date(stats.next_backup_due), { addSuffix: true })
                  : "Not scheduled"}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>View and download previous backups</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading backups...</div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No backups found. Create your first backup to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{backup.backup_name}</h3>
                      {getStatusBadge(backup.status)}
                      <Badge variant="outline">{backup.backup_type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(backup.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                        {backup.file_size && (
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            {formatBytes(backup.file_size)}
                          </span>
                        )}
                        <span>{backup.tables_included?.length || 0} tables</span>
                      </div>
                      {backup.error_message && (
                        <div className="text-red-600 text-xs">{backup.error_message}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {backup.status === "completed" && backup.storage_path && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handledownloadBackup}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
