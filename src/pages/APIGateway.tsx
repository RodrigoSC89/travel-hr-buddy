import { useEffect, useState, useCallback } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plug, Activity, Key, Globe, Plus, Copy, MoreHorizontal, Eye, EyeOff, Trash2, Power, PowerOff } from "lucide-react";
import { apiKeyManager } from "@/modules/api-gateway/services/api-key-manager";
import { ApiKey } from "@/modules/api-gateway/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function APIGateway() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState("*");
  const [newKeyExpiry, setNewKeyExpiry] = useState("365");

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = () => {
    setKeys(apiKeyManager.getAllKeys());
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
  };
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Chave copiada para a área de transferência");
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Nome da chave é obrigatório");
      return;
    }

    const scopes = newKeyScope.split(",").map(s => s.trim()).filter(Boolean);
    const expiryDays = parseInt(newKeyExpiry) || undefined;
    
    apiKeyManager.createKey(newKeyName, scopes, expiryDays);
    loadKeys();
    setIsCreateOpen(false);
    setNewKeyName("");
    setNewKeyScope("*");
    setNewKeyExpiry("365");
    toast.success("Chave API criada com sucesso");
  };

  const handleDeleteKey = (keyId: string) => {
    apiKeyManager.deleteKey(keyId);
    loadKeys();
    toast.success("Chave API excluída");
  });

  const handleToggleActive = (keyId: string, isActive: boolean) => {
    if (isActive) {
      apiKeyManager.revokeKey(keyId);
      toast.info("Chave API desativada");
    } else {
      apiKeyManager.activateKey(keyId);
      toast.success("Chave API ativada");
    }
    loadKeys();
  });

  const maskKey = (key: string) => {
    return key.substring(0, 7) + "•".repeat(20) + key.substring(key.length - 4);
  });

  const activeKeys = keys.filter(k => k.isActive);
  const totalRequests = keys.reduce((sum, k) => sum + k.requestCount, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Gateway</h1>
          <p className="text-muted-foreground">
            Gerenciamento de APIs e integrações externas
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova API Key</DialogTitle>
              <DialogDescription>
                Crie uma nova chave de API para integração externa
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Nome da Chave</Label>
                <Input
                  id="keyName"
                  placeholder="Ex: Integração ERP"
                  value={newKeyName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyScope">Escopo (separado por vírgula)</Label>
                <Input
                  id="keyScope"
                  placeholder="* para acesso total, ou: documents,analytics"
                  value={newKeyScope}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  Use * para acesso total ou especifique módulos: auth, documents, analytics, profile
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyExpiry">Validade (dias)</Label>
                <Input
                  id="keyExpiry"
                  type="number"
                  placeholder="365"
                  value={newKeyExpiry}
                  onChange={handleChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleSetIsCreateOpen}>
                Cancelar
              </Button>
              <Button onClick={handleCreateKey}>Criar Chave</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">APIs Ativas</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeKeys.length}</div>
            <p className="text-xs text-muted-foreground">de {keys.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requisições</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keys.length}</div>
            <p className="text-xs text-muted-foreground">Configuradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Globe className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas API Keys</CardTitle>
          <CardDescription>
            Gerencie suas chaves de API para integrações externas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Chave</TableHead>
                <TableHead>Escopo</TableHead>
                <TableHead>Requisições</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Expira em</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handletoggleKeyVisibility}
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handlecopyKey}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {apiKey.scope.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                      {apiKey.scope.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{apiKey.scope.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{apiKey.requestCount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(apiKey.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {apiKey.expiresAt 
                      ? format(apiKey.expiresAt, "dd/MM/yyyy", { locale: ptBR })
                      : "Nunca"
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={apiKey.isActive ? "default" : "destructive"}>
                      {apiKey.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlecopyKey}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar chave
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handlehandleToggleActive}
                        >
                          {apiKey.isActive ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handlehandleDeleteKey}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {keys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma API Key encontrada. Crie uma nova para começar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
