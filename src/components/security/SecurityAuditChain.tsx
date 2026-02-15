/**
 * Sprint 4: Security Audit Chain Verifier
 * Blockchain-style audit trail verification with visual chain integrity
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield, Link2, CheckCircle, AlertTriangle, RefreshCw,
  Hash, Clock, User, Activity, Lock
} from "lucide-react";
import { toast } from "sonner";

interface AuditBlock {
  id: string;
  block_number: number;
  action_type: string;
  resource_type: string;
  current_hash: string;
  previous_hash: string | null;
  timestamp: string;
  user_id: string | null;
  severity: string;
}

interface ChainIntegrity {
  is_valid: boolean;
  broken_at_block: number | null;
  message: string;
  total_blocks: number;
  verified_at: Date;
}

export const SecurityAuditChain: React.FC = () => {
  const [blocks, setBlocks] = useState<AuditBlock[]>([]);
  const [integrity, setIntegrity] = useState<ChainIntegrity | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const verifyChainIntegrity = async () => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.rpc("verify_audit_chain_integrity");
      if (error) throw error;

      const result = data?.[0];
      const { count } = await supabase
        .from("security_audit_chain")
        .select("*", { count: "exact", head: true });

      setIntegrity({
        is_valid: result?.is_valid ?? true,
        broken_at_block: result?.broken_at_block ?? null,
        message: result?.message ?? "Chain verified",
        total_blocks: count ?? 0,
        verified_at: new Date(),
      });

      toast.success(result?.is_valid ? "Cadeia de auditoria íntegra ✓" : "Falha na integridade detectada!");
    } catch (err) {
      toast.error("Erro ao verificar integridade da cadeia");
    } finally {
      setIsVerifying(false);
    }
  };

  const loadRecentBlocks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("security_audit_chain")
        .select("id, block_number, action_type, resource_type, current_hash, previous_hash, timestamp, user_id")
        .order("block_number", { ascending: false })
        .limit(20);

      if (error) throw error;
      setBlocks((data || []).map((d: Record<string, unknown>) => ({ ...d, severity: 'info' })) as AuditBlock[]);
    } catch {
      toast.error("Erro ao carregar blocos de auditoria");
    } finally {
      setIsLoading(false);
    }
  };

  const truncateHash = (hash: string) =>
    hash ? `${hash.slice(0, 8)}...${hash.slice(-8)}` : "—";

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive/20 text-destructive";
      case "warning": return "bg-warning/20 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Link2 className="w-6 h-6 text-primary" />
            Blockchain Audit Trail
          </h2>
          <p className="text-muted-foreground text-sm">
            Cadeia de auditoria imutável com verificação de integridade SHA-256
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadRecentBlocks} variant="outline" disabled={isLoading}>
            <Activity className="w-4 h-4 mr-2" />
            Carregar Blocos
          </Button>
          <Button onClick={verifyChainIntegrity} disabled={isVerifying}>
            <Shield className={`w-4 h-4 mr-2 ${isVerifying ? "animate-spin" : ""}`} />
            {isVerifying ? "Verificando..." : "Verificar Integridade"}
          </Button>
        </div>
      </div>

      {/* Integrity Status */}
      {integrity && (
        <Card className={`border-2 ${integrity.is_valid ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {integrity.is_valid ? (
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-success" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg">
                    {integrity.is_valid ? "Cadeia Íntegra" : "Integridade Comprometida"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{integrity.message}</p>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {integrity.total_blocks} blocos verificados
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {integrity.verified_at.toLocaleString("pt-BR")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Blocks */}
      {blocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              Blocos Recentes ({blocks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                >
                  {/* Chain link indicator */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-mono font-bold text-primary">
                      #{block.block_number}
                    </div>
                    {idx < blocks.length - 1 && (
                      <div className="w-0.5 h-4 bg-primary/20 mt-1" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{block.action_type}</span>
                      <Badge variant="outline" className="text-xs">
                        {block.resource_type}
                      </Badge>
                      <Badge className={`text-xs ${getSeverityColor(block.severity)}`}>
                        {block.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                      <span title={block.current_hash}>
                        Hash: {truncateHash(block.current_hash)}
                      </span>
                      <span>→</span>
                      <span title={block.previous_hash || "genesis"}>
                        Prev: {block.previous_hash ? truncateHash(block.previous_hash) : "genesis"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(block.timestamp).toLocaleString("pt-BR")}
                    </div>
                    {block.user_id && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {block.user_id.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {blocks.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Link2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Clique em "Carregar Blocos" para visualizar a cadeia de auditoria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
