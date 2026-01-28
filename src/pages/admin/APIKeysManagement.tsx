/**
 * API Keys Management Page
 * Create, manage, and monitor API keys for external integrations
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, RefreshCw, Activity, Clock, Shield, AlertTriangle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const AVAILABLE_SCOPES = [
  { id: "read:vessels", label: "Ler Embarcações", category: "Vessels" },
  { id: "write:vessels", label: "Criar/Editar Embarcações", category: "Vessels" },
  { id: "delete:vessels", label: "Excluir Embarcações", category: "Vessels" },
  { id: "read:crew", label: "Ler Tripulação", category: "Crew" },
  { id: "write:crew", label: "Criar/Editar Tripulação", category: "Crew" },
  { id: "delete:crew", label: "Excluir Tripulação", category: "Crew" },
  { id: "read:documents", label: "Ler Documentos", category: "Documents" },
  { id: "write:documents", label: "Criar/Editar Documentos", category: "Documents" },
  { id: "read:maintenance", label: "Ler Manutenção", category: "Maintenance" },
  { id: "write:maintenance", label: "Criar/Editar Manutenção", category: "Maintenance" },
  { id: "admin:*", label: "Acesso Total (Admin)", category: "Admin" },
];

interface APIKey {
  id: string;
  key_name: string;
  key_prefix: string;
  allowed_endpoints: string[] | null;
  rate_limit_per_hour: number | null;
  is_active: boolean | null;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string | null;
  organization_id: string | null;
  metadata: Record<string, unknown> | null;
}

// Generate secure API key
function generateAPIKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "nk_live_";
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// Hash key (SHA-256)
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export default function APIKeysManagement() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([]);
  const [newKeyRateLimit, setNewKeyRateLimit] = useState("1000");
  const [newKeyExpiry, setNewKeyExpiry] = useState<string>("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  // Fetch API keys
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as APIKey[];
    },
  });

  // Fetch usage stats
  const { data: usageStats } = useQuery({
    queryKey: ["api-key-usage-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_key_usage")
        .select("api_key_id, status_code, timestamp")
        .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("timestamp", { ascending: false })
        .limit(1000);
      
      if (error) throw error;
      return data;
    },
  });

  // Create API key mutation
  const createKeyMutation = useMutation({
    mutationFn: async () => {
      const rawKey = generateAPIKey();
      const keyHash = await hashKey(rawKey);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      // Get user's organization
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      const { error } = await supabase
        .from("api_keys")
        .insert({
          organization_id: orgMember?.organization_id,
          user_id: user.id,
          key_name: newKeyName,
          key_hash: keyHash,
          key_prefix: rawKey.substring(0, 12),
          allowed_endpoints: newKeyScopes,
          rate_limit_per_hour: parseInt(newKeyRateLimit),
          expires_at: newKeyExpiry || null,
        });
      
      if (error) throw error;
      
      return rawKey;
    },
    onSuccess: (key) => {
      setGeneratedKey(key);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API Key criada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao criar API Key: ${error.message}`);
    },
  });

  // Revoke API key mutation
  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("api_keys")
        .update({
          is_active: false,
          revoked_at: new Date().toISOString(),
          revoked_by: user?.id,
        })
        .eq("id", keyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API Key revogada");
    },
  });

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Nome da API Key é obrigatório");
      return;
    }
    if (newKeyScopes.length === 0) {
      toast.error("Selecione pelo menos um escopo");
      return;
    }
    createKeyMutation.mutate();
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      toast.success("API Key copiada!");
    }
  };

  const resetDialog = () => {
    setShowCreateDialog(false);
    setNewKeyName("");
    setNewKeyScopes([]);
    setNewKeyRateLimit("1000");
    setNewKeyExpiry("");
    setGeneratedKey(null);
    setShowKey(false);
  };

  // Calculate usage by key
  const getKeyUsage24h = (keyId: string) => {
    if (!usageStats) return { total: 0, errors: 0 };
    const keyUsage = usageStats.filter(u => u.api_key_id === keyId);
    return {
      total: keyUsage.length,
      errors: keyUsage.filter(u => u.status_code >= 400).length,
    };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Key className="h-8 w-8 text-primary" />
            API Keys
          </h1>
          <p className="text-muted-foreground">
            Gerencie chaves de API para integrações externas
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={(open) => !open && resetDialog()}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Nova API Key</DialogTitle>
              <DialogDescription>
                Configure as permissões e limites para a nova chave
              </DialogDescription>
            </DialogHeader>
            
            {generatedKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                  <div className="flex items-center gap-2 text-warning mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">Salve esta chave agora!</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Esta é a única vez que você verá esta chave. Copie e salve em local seguro.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Input
                    type={showKey ? "text" : "password"}
                    value={generatedKey}
                    readOnly
                    className="font-mono"
                  />
                  <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleCopyKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <DialogFooter>
                  <Button onClick={resetDialog}>Fechar</Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome da API Key</Label>
                  <Input
                    placeholder="Ex: Integração ERP"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Escopos de Permissão</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                    {AVAILABLE_SCOPES.map((scope) => (
                      <div key={scope.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={scope.id}
                          checked={newKeyScopes.includes(scope.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewKeyScopes([...newKeyScopes, scope.id]);
                            } else {
                              setNewKeyScopes(newKeyScopes.filter(s => s !== scope.id));
                            }
                          }}
                        />
                        <label htmlFor={scope.id} className="text-sm cursor-pointer">
                          {scope.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rate Limit (req/hora)</Label>
                    <Select value={newKeyRateLimit} onValueChange={setNewKeyRateLimit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                        <SelectItem value="1000">1.000</SelectItem>
                        <SelectItem value="5000">5.000</SelectItem>
                        <SelectItem value="10000">10.000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Expiração (opcional)</Label>
                    <Input
                      type="date"
                      value={newKeyExpiry}
                      onChange={(e) => setNewKeyExpiry(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={resetDialog}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateKey} disabled={createKeyMutation.isPending}>
                    {createKeyMutation.isPending ? "Criando..." : "Criar API Key"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Keys</p>
                <p className="text-2xl font-bold">{apiKeys?.length || 0}</p>
              </div>
              <Key className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Keys Ativas</p>
                <p className="text-2xl font-bold text-success">
                  {apiKeys?.filter(k => k.is_active).length || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requests (24h)</p>
                <p className="text-2xl font-bold">{usageStats?.length || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erros (24h)</p>
                <p className="text-2xl font-bold text-destructive">
                  {usageStats?.filter(u => u.status_code >= 400).length || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chaves de API</CardTitle>
          <CardDescription>
            Todas as API Keys da sua organização
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : apiKeys?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma API Key criada ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Prefixo</TableHead>
                  <TableHead>Escopos</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead>Uso (24h)</TableHead>
                  <TableHead>Último Uso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys?.map((key) => {
                  const usage = getKeyUsage24h(key.id);
                  return (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.key_name}</TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-xs">
                          {key.key_prefix}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(key.allowed_endpoints || []).slice(0, 2).map((scope: string) => (
                            <Badge key={scope} variant="outline" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                          {(key.allowed_endpoints?.length || 0) > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(key.allowed_endpoints?.length || 0) - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{(key.rate_limit_per_hour || 1000).toLocaleString()}/h</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span>{usage.total}</span>
                          {usage.errors > 0 && (
                            <span className="text-destructive ml-1">
                              ({usage.errors} erros)
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {key.last_used_at ? (
                          formatDistanceToNow(new Date(key.last_used_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })
                        ) : (
                          "Nunca usada"
                        )}
                      </TableCell>
                      <TableCell>
                        {key.is_active ? (
                          <Badge variant="default" className="bg-success">Ativa</Badge>
                        ) : (
                          <Badge variant="destructive">Revogada</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {key.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeKeyMutation.mutate(key.id)}
                            disabled={revokeKeyMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Documentação da API</h3>
              <p className="text-sm text-muted-foreground">
                Acesse a documentação completa com exemplos de uso
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/admin/api-docs">Ver Documentação</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
