import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BackupLog {
  id: string;
  backup_type: "full" | "incremental" | "point_in_time";
  status: "started" | "completed" | "failed" | "verified";
  size_bytes?: number;
  tables_backed_up?: string[];
  duration_ms?: number;
  storage_location?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

interface SecurityScanResult {
  id: string;
  scan_type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  finding_code: string;
  title: string;
  description?: string;
  table_name?: string;
  recommendation?: string;
  status: "open" | "resolved" | "ignored" | "false_positive";
  created_at: string;
}

interface BackupStatus {
  success: boolean;
  backups: BackupLog[];
  pitr_enabled: boolean;
  retention_days: number;
  last_backup: BackupLog | null;
}

interface SecurityAuditResult {
  success: boolean;
  security_score: number;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  findings: SecurityScanResult[];
  recommendations: {
    immediate: string[];
    scheduled: string[];
  };
}

export function useBackupStatus() {
  return useQuery<BackupStatus>({
    queryKey: ["backup-status"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("automated-backup", {
        body: { action: "status" },
      });

      if (error) throw error;
      return data as BackupStatus;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backupType: "full" | "incremental" = "incremental") => {
      const { data, error } = await supabase.functions.invoke("automated-backup", {
        body: { action: "create", backup_type: backupType },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Backup criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["backup-status"] });
    },
    onError: (error) => {
      toast.error(`Falha ao criar backup: ${error.message}`);
    },
  });
}

export function useSecurityAudit() {
  const queryClient = useQueryClient();

  return useMutation<SecurityAuditResult>({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("security-rls-audit");

      if (error) throw error;
      return data as SecurityAuditResult;
    },
    onSuccess: (data) => {
      if (data.security_score >= 80) {
        toast.success(`Auditoria concluída! Score: ${data.security_score}/100`);
      } else if (data.security_score >= 50) {
        toast.warning(`Auditoria concluída. Score: ${data.security_score}/100 - Atenção necessária`);
      } else {
        toast.error(`Auditoria concluída. Score: ${data.security_score}/100 - Ação imediata necessária`);
      }
      queryClient.invalidateQueries({ queryKey: ["security-findings"] });
    },
    onError: (error) => {
      toast.error(`Falha na auditoria: ${error.message}`);
    },
  });
}

export function useSecurityFindings() {
  return useQuery<SecurityScanResult[]>({
    queryKey: ["security-findings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_scan_results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        // Silent fail - table may not be accessible
        return [];
      }

      return (data as unknown as SecurityScanResult[]) || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useResolveSecurityFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      findingId,
      status,
    }: {
      findingId: string;
      status: "resolved" | "ignored" | "false_positive";
    }) => {
      const { error } = await supabase
        .from("security_scan_results")
        .update({
          status,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", findingId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Finding atualizado!");
      queryClient.invalidateQueries({ queryKey: ["security-findings"] });
    },
    onError: (error) => {
      toast.error(`Falha ao atualizar: ${error.message}`);
    },
  });
}

export function useBackupLogs() {
  return useQuery<BackupLog[]>({
    queryKey: ["backup-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("backup_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        // Silent fail - backup_logs table may not exist
        return [];
      }

      return (data as unknown as BackupLog[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
