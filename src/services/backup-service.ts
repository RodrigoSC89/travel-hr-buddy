// PATCH 507: Automated Backup Service
import { supabase } from "@/integrations/supabase/client";
import { Logger } from "@/lib/utils/logger";

export interface SystemBackup {
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

export class BackupService {
  /**
   * Get all backups (admin only)
   */
  static async getAllBackups(): Promise<SystemBackup[]> {
    try {
      const { data, error } = await supabase
        .from("system_backups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        Logger.error("Error fetching backups", error, "BackupService");
        return [];
      }

      return (data || []).map(d => ({
        id: d.id,
        backup_type: d.backup_type,
        file_path: d.file_path,
        file_size: d.file_size,
        backup_status: d.backup_status,
        metadata: (d.metadata as any) || {},
        created_by: d.created_by,
        created_at: d.created_at,
        completed_at: d.completed_at,
        error_message: d.error_message
      }));
    } catch (error) {
      Logger.error("Exception fetching backups", error, "BackupService");
      return [];
    }
  }

  /**
   * Create a backup record (called by cron or manual trigger)
   */
  static async createBackupRecord(
    filePath: string,
    backupType: string = "automatic",
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("system_backups")
        .insert({
          backup_type: backupType,
          file_path: filePath,
          backup_status: "completed",
          metadata: metadata || {},
          created_by: user?.id,
          completed_at: new Date().toISOString()
        });

      if (error) {
        Logger.error("Error creating backup record", error, "BackupService");
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      Logger.error("Exception creating backup record", error, "BackupService");
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get backup by ID
   */
  static async getBackupById(backupId: string): Promise<SystemBackup | null> {
    try {
      const { data, error } = await supabase
        .from("system_backups")
        .select("*")
        .eq("id", backupId)
        .maybeSingle();

      if (error) {
        Logger.error("Error fetching backup", error, "BackupService");
        return null;
      }

      return data ? {
        id: data.id,
        backup_type: data.backup_type,
        file_path: data.file_path,
        file_size: data.file_size,
        backup_status: data.backup_status,
        metadata: (data.metadata as any) || {},
        created_by: data.created_by,
        created_at: data.created_at,
        completed_at: data.completed_at,
        error_message: data.error_message
      } : null;
    } catch (error) {
      Logger.error("Exception fetching backup", error, "BackupService");
      return null;
    }
  }

  /**
   * Delete old backups (keep last N)
   */
  static async cleanupOldBackups(keepCount: number = 7): Promise<number> {
    try {
      const allBackups = await this.getAllBackups();
      
      if (allBackups.length <= keepCount) return 0;

      const toDelete = allBackups.slice(keepCount);
      const deleteIds = toDelete.map(b => b.id).filter(Boolean) as string[];

      if (deleteIds.length === 0) return 0;

      const { error } = await supabase
        .from("system_backups")
        .delete()
        .in("id", deleteIds);

      if (error) {
        Logger.error("Error deleting old backups", error, "BackupService");
        return 0;
      }

      return deleteIds.length;
    } catch (error) {
      Logger.error("Exception deleting old backups", error, "BackupService");
      return 0;
    }
  }

  /**
   * Simulate backup creation (for testing)
   */
  static async simulateBackup(): Promise<{ success: boolean; backup?: SystemBackup; error?: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = `/backups/nautilus_backup_${timestamp}.sql.gz`;
    
    const result = await this.createBackupRecord(filePath, "manual", {
      size_mb: Math.floor(Math.random() * 50) + 10,
      tables_count: 45,
      simulated: true
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const backups = await this.getAllBackups();
    return { success: true, backup: backups[0] };
  }
}
