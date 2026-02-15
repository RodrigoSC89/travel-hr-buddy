/**
 * Blockchain Certificate Verifier - World-Class Compliance
 * Immutable audit trail for maritime certificates using hash chain
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Shield, Link2, CheckCircle, XCircle, Search, Lock, Hash, Clock, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LedgerBlock {
  id: string;
  block_number: number;
  hash: string;
  previous_hash: string;
  action_type: string;
  action_description: string;
  agent_name: string;
  module: string;
  timestamp: string;
  confidence: number | null;
  human_override: boolean | null;
}

export function BlockchainCertificateVerifier() {
  const [blocks, setBlocks] = useState<LedgerBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchHash, setSearchHash] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [integrityResult, setIntegrityResult] = useState<{ valid: boolean; checked: number; broken: number } | null>(null);

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    const { data } = await supabase
      .from("ai_blockchain_audit")
      .select("*")
      .order("block_number", { ascending: false })
      .limit(50);

    if (data) setBlocks(data as unknown as LedgerBlock[]);
    setLoading(false);
  };

  const verifyChainIntegrity = async () => {
    setVerifying(true);
    try {
      const { data } = await supabase
        .from("ai_blockchain_audit")
        .select("block_number, hash, previous_hash")
        .order("block_number", { ascending: true })
        .limit(500);

      if (!data || data.length === 0) {
        setIntegrityResult({ valid: true, checked: 0, broken: 0 });
        toast.info("Nenhum bloco encontrado na cadeia");
        return;
      }

      let broken = 0;
      for (let i = 1; i < data.length; i++) {
        if (data[i].previous_hash !== data[i - 1].hash) {
          broken++;
        }
      }

      const result = { valid: broken === 0, checked: data.length, broken };
      setIntegrityResult(result);

      if (result.valid) {
        toast.success(`Cadeia íntegra — ${result.checked} blocos verificados`);
      } else {
        toast.error(`Integridade comprometida — ${result.broken} elo(s) quebrado(s)`);
      }
    } catch (err) {
      toast.error("Erro na verificação");
    } finally {
      setVerifying(false);
    }
  };

  const filteredBlocks = searchHash
    ? blocks.filter(b => b.hash.includes(searchHash) || b.action_description.toLowerCase().includes(searchHash.toLowerCase()))
    : blocks;

  const truncateHash = (hash: string) => `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            Blockchain de Certificados — Trilha de Auditoria Imutável
          </CardTitle>
          <CardDescription>
            Cada ação em certificados é registrada com hash criptográfico encadeado, garantindo rastreabilidade total e prova de integridade para auditorias PSC e Flag State.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Integrity Check */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total de Blocos</p>
                <p className="text-2xl font-bold">{blocks.length}</p>
              </div>
              <Hash className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Integridade</p>
                {integrityResult ? (
                  <div className="flex items-center gap-1">
                    {integrityResult.valid ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <span className={`text-lg font-bold ${integrityResult.valid ? "text-success" : "text-destructive"}`}>
                      {integrityResult.valid ? "VÁLIDA" : "COMPROMETIDA"}
                    </span>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">—</p>
                )}
              </div>
              <Shield className="h-6 w-6 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-center">
            <Button onClick={verifyChainIntegrity} disabled={verifying} className="gap-2 w-full">
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {verifying ? "Verificando..." : "Verificar Integridade da Cadeia"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchHash}
          onChange={e => setSearchHash(e.target.value)}
          placeholder="Buscar por hash ou descrição..."
          className="pl-10"
        />
      </div>

      {/* Chain */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Cadeia de Blocos ({filteredBlocks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : filteredBlocks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum bloco encontrado</p>
              <p className="text-sm">Registros de certificados aparecerão aqui automaticamente</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredBlocks.map((block, i) => (
                  <div key={block.id} className="relative">
                    {i < filteredBlocks.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-border" />
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center z-10">
                        <span className="text-xs font-bold text-primary">#{block.block_number}</span>
                      </div>
                      <div className="flex-1 p-3 border rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{block.action_description}</p>
                            <p className="text-xs text-muted-foreground">{block.agent_name} • {block.module}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {block.action_type}
                            </Badge>
                            {block.human_override && (
                              <Badge variant="secondary" className="text-xs">Override</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {truncateHash(block.hash)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Link2 className="h-3 w-3" />
                            prev: {truncateHash(block.previous_hash)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(block.timestamp).toLocaleString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
