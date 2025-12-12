/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * API Key Management Component - PHASE 2
 * Gerenciamento de chaves de API para integrações externas
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Key, 
  Plus, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Shield, 
  Activity,
  Clock,
  Globe,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ApiKey {
  id: string;
  key_name: string;
  key_prefix: string;
  tier: string | null;
  is_active: boolean | null;
  created_at: string | null;
  last_used_at: string | null;
  expires_at: string | null;
  rate_limit_per_minute: number | null;
  rate_limit_per_hour: number | null;
  rate_limit_per_day: number | null;
  allowed_endpoints: string[] | null;
}

interface ApiKeyStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time: number;
}

export const ApiKeyManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: "",
    tier: "standard",
    expiresIn: "never"
  };
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast.error("Erro ao carregar chaves de API");
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = (): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "naut_";
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  });

  const hashApiKey = async (key: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  });

  const createApiKey = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const fullKey = generateApiKey();
      const keyHash = await hashApiKey(fullKey);
      const keyPrefix = fullKey.substring(0, 10);

      // Calculate expiration
      let expiresAt = null;
      if (newKeyData.expiresIn === "30days") {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      } else if (newKeyData.expiresIn === "90days") {
        expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      } else if (newKeyData.expiresIn === "1year") {
        expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      }

      // Rate limits based on tier
      const rateLimits = {
        free: { minute: 10, hour: 100, day: 500 },
        standard: { minute: 60, hour: 1000, day: 10000 },
        premium: { minute: 300, hour: 5000, day: 50000 },
        enterprise: { minute: 1000, hour: 20000, day: 200000 }
      };

      const limits = rateLimits[newKeyData.tier as keyof typeof rateLimits] || rateLimits.standard;

      const { error } = await supabase
        .from("api_keys")
        .insert({
          user_id: user.id,
          key_name: newKeyData.name,
          key_hash: keyHash,
          key_prefix: keyPrefix,
          tier: newKeyData.tier,
          is_active: true,
          expires_at: expiresAt,
          rate_limit_per_minute: limits.minute,
          rate_limit_per_hour: limits.hour,
          rate_limit_per_day: limits.day
        });

      if (error) throw error;

      setGeneratedKey(fullKey);
      toast.success("Chave de API criada com sucesso!");
      fetchApiKeys();
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("Erro ao criar chave de API");
    }
  };

  const toggleApiKey = async (keyId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("api_keys")
        .update({ is_active: !isActive })
        .eq("id", keyId);

      if (error) throw error;
      
      toast.success(isActive ? "Chave desativada" : "Chave ativada");
      fetchApiKeys();
    } catch (error) {
      console.error("Error toggling API key:", error);
      toast.error("Erro ao atualizar chave");
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyId);

      if (error) throw error;
      
      toast.success("Chave removida com sucesso");
      fetchApiKeys();
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Erro ao remover chave");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
  });

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
    case "free": return "secondary";
    case "standard": return "default";
    case "premium": return "outline";
    case "enterprise": return "destructive";
    default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Key className="h-6 w-6 text-primary" />
            Gerenciamento de API Keys
          </h2>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie chaves de acesso para integrações externas
          </p>
        </div>
        <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Chave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Chave de API</DialogTitle>
              <DialogDescription>
                Configure os parâmetros da sua nova chave de acesso
              </DialogDescription>
            </DialogHeader>
            
            {!generatedKey ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="keyName">Nome da Chave</Label>
                  <Input
                    id="keyName"
                    placeholder="Ex: Integração ERP"
                    value={newKeyData.name}
                    onChange={handleChange}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tier de Acesso</Label>
                  <Select 
                    value={newKeyData.tier} 
                    onValueChange={(value) => setNewKeyData(prev => ({ ...prev, tier: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free (10 req/min)</SelectItem>
                      <SelectItem value="standard">Standard (60 req/min)</SelectItem>
                      <SelectItem value="premium">Premium (300 req/min)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000 req/min)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Expiração</Label>
                  <Select 
                    value={newKeyData.expiresIn} 
                    onValueChange={(value) => setNewKeyData(prev => ({ ...prev, expiresIn: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Nunca expira</SelectItem>
                      <SelectItem value="30days">30 dias</SelectItem>
                      <SelectItem value="90days">90 dias</SelectItem>
                      <SelectItem value="1year">1 ano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-600">Importante!</p>
                      <p className="text-sm text-muted-foreground">
                        Copie esta chave agora. Ela não será exibida novamente.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Sua Nova Chave de API</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        readOnly
                        type={showKey ? "text" : "password"}
                        value={generatedKey}
                        className="pr-10 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleSetShowKey}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => handlecopyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <DialogFooter>
              {!generatedKey ? (
                <Button onClick={createApiKey} disabled={!newKeyData.name}>
                  Criar Chave
                </Button>
              ) : (
                <Button onClick={() => {
                  setShowNewKeyDialog(false);
                  setGeneratedKey(null);
                  setNewKeyData({ name: "", tier: "standard", expiresIn: "never" });
                  setShowKey(false);
                }}>
                  Fechar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chaves Ativas</p>
                <p className="text-2xl font-bold">{apiKeys.filter(k => k.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Requisições (24h)</p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Globe className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Endpoints</p>
                <p className="text-2xl font-bold">6</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Shield className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rate Limit</p>
                <p className="text-2xl font-bold">OK</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Suas Chaves de API</CardTitle>
          <CardDescription>
            Gerencie o acesso às APIs do Nautilus One
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma chave de API criada</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleSetShowNewKeyDialog}
              >
                Criar Primeira Chave
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div 
                  key={key.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${key.is_active ? "bg-green-500/10" : "bg-muted"}`}>
                      <Key className={`h-5 w-5 ${key.is_active ? "text-green-500" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{key.key_name}</p>
                        <Badge variant={getTierBadgeColor(key.tier || "standard")}>
                          {key.tier || "standard"}
                        </Badge>
                        {!key.is_active && (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="font-mono">{key.key_prefix}...</span>
                        {key.created_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Criada em {format(new Date(key.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                        {key.last_used_at && (
                          <span>
                            Último uso: {format(new Date(key.last_used_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={key.is_active ?? false}
                      onCheckedChange={() => toggleApiKey(key.id, key.is_active ?? false}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handledeleteApiKey}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default ApiKeyManagement;
