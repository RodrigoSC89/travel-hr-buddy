import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Lock,
  Shield,
  Key,
  FileText,
  Upload,
  Download,
  Search,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Folder,
  File,
  Trash2,
  Share2,
  Brain,
  Sparkles,
  History,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Demo data
const vaultItems = [
  { id: 1, name: "Contrato_Frete_2024.pdf", type: "document", size: "2.4 MB", encrypted: true, lastAccess: "2024-01-15", category: "contracts" },
  { id: 2, name: "Certificados_IMO.zip", type: "archive", size: "15.8 MB", encrypted: true, lastAccess: "2024-01-14", category: "certificates" },
  { id: 3, name: "Credenciais_API.json", type: "credentials", size: "1.2 KB", encrypted: true, lastAccess: "2024-01-10", category: "secrets" },
  { id: 4, name: "Backup_DB_Jan.sql", type: "backup", size: "45.2 MB", encrypted: true, lastAccess: "2024-01-08", category: "backups" },
  { id: 5, name: "Relatório_Auditoria.docx", type: "document", size: "856 KB", encrypted: true, lastAccess: "2024-01-05", category: "reports" },
];

const accessLogs = [
  { id: 1, user: "admin@nautilus.com", action: "view", item: "Contrato_Frete_2024.pdf", timestamp: "2024-01-15 14:32:00", ip: "192.168.1.100" },
  { id: 2, user: "carlos@nautilus.com", action: "download", item: "Certificados_IMO.zip", timestamp: "2024-01-14 11:20:00", ip: "192.168.1.105" },
  { id: 3, user: "admin@nautilus.com", action: "upload", item: "Credenciais_API.json", timestamp: "2024-01-10 09:45:00", ip: "192.168.1.100" },
  { id: 4, user: "sistema", action: "backup", item: "Backup_DB_Jan.sql", timestamp: "2024-01-08 03:00:00", ip: "127.0.0.1" },
];

const aiInsights = [
  { id: 1, type: "warning", message: "3 documentos não foram acessados há mais de 90 dias", action: "Revisar e arquivar" },
  { id: 2, type: "info", message: "Padrão de acesso normal detectado - sem anomalias", action: null },
  { id: 3, type: "success", message: "Todos os backups estão em dia e verificados", action: null },
  { id: 4, type: "warning", message: "Certificado SSL expira em 15 dias", action: "Renovar certificado" },
];

const VaultAI: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("vault");
  const [searchQuery, setSearchQuery] = useState("");
  const [showContent, setShowContent] = useState<Record<number, boolean>>({});

  const filteredItems = vaultItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getItemIcon = (type: string) => {
    switch (type) {
      case "document": return <FileText className="h-5 w-5 text-primary" />;
      case "archive": return <Folder className="h-5 w-5 text-warning" />;
      case "credentials": return <Key className="h-5 w-5 text-destructive" />;
      case "backup": return <File className="h-5 w-5 text-success" />;
      default: return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "view": return <Eye className="h-4 w-4 text-primary" />;
      case "download": return <Download className="h-4 w-4 text-success" />;
      case "upload": return <Upload className="h-4 w-4 text-warning" />;
      case "backup": return <Shield className="h-4 w-4 text-info" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case "warning": return <Badge className="bg-warning text-warning-foreground">Atenção</Badge>;
      case "success": return <Badge className="bg-success text-success-foreground">OK</Badge>;
      case "info": return <Badge variant="outline">Info</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleToggleVisibility = (id: number) => {
    setShowContent(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownload = (item: typeof vaultItems[0]) => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${item.name}...`,
    });
  };

  const handleDelete = (item: typeof vaultItems[0]) => {
    toast({
      title: "Confirmar exclusão",
      description: `Deseja realmente excluir ${item.name}?`,
      variant: "destructive",
    });
  };

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Lock}
        title="Vault AI"
        description="Cofre digital seguro com criptografia de ponta e análise inteligente de segurança"
        gradient="purple"
        badges={[
          { icon: Shield, label: "Criptografia AES-256" },
          { icon: Brain, label: "IA de Segurança" },
          { icon: Key, label: "Acesso Controlado" }
        ]}
      />

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Itens Seguros</p>
                <p className="text-2xl font-bold text-foreground">{vaultItems.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acessos Hoje</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Espaço Usado</p>
                <p className="text-2xl font-bold text-foreground">64.5 MB</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Folder className="h-6 w-6 text-warning" />
              </div>
            </div>
            <Progress value={32} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score Segurança</p>
                <p className="text-2xl font-bold text-success">98%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="vault">
            <Lock className="h-4 w-4 mr-2" />
            Cofre
          </TabsTrigger>
          <TabsTrigger value="ai-insights">
            <Brain className="h-4 w-4 mr-2" />
            IA Insights
          </TabsTrigger>
          <TabsTrigger value="access-logs">
            <History className="h-4 w-4 mr-2" />
            Logs de Acesso
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vault" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Itens do Cofre</CardTitle>
                <CardDescription>Documentos e arquivos protegidos</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar no cofre..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                          {getItemIcon(item.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {showContent[item.id] ? item.name : "••••••••••••••••"}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleToggleVisibility(item.id)}
                            >
                              {showContent[item.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{item.size}</span>
                            <span>•</span>
                            <span>Último acesso: {item.lastAccess}</span>
                            {item.encrypted && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Criptografado
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleDownload(item)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(item)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Análise Inteligente de Segurança
              </CardTitle>
              <CardDescription>
                IA monitora padrões de acesso e identifica potenciais riscos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg border ${
                      insight.type === "warning" ? "border-warning/30 bg-warning/5" :
                      insight.type === "success" ? "border-success/30 bg-success/5" :
                      "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {insight.type === "warning" ? (
                          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                        ) : insight.type === "success" ? (
                          <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                        ) : (
                          <Brain className="h-5 w-5 text-primary mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{insight.message}</p>
                          {insight.action && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Ação sugerida: {insight.action}
                            </p>
                          )}
                        </div>
                      </div>
                      {getInsightBadge(insight.type)}
                    </div>
                    {insight.action && (
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" variant="outline">
                          Executar Ação
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access-logs" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Logs de Acesso</CardTitle>
              <CardDescription>Histórico completo de atividades no cofre</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {accessLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {getActionIcon(log.action)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{log.item}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{log.user}</span>
                            <span>•</span>
                            <Badge variant="outline">{log.action}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-foreground">{log.timestamp}</p>
                        <p className="text-xs text-muted-foreground">IP: {log.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>Gerencie as políticas de segurança do cofre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-muted-foreground">Requer 2FA para acessar itens sensíveis</p>
                </div>
                <Badge className="bg-success text-success-foreground">Ativo</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Criptografia em Repouso</p>
                  <p className="text-sm text-muted-foreground">AES-256 para todos os arquivos</p>
                </div>
                <Badge className="bg-success text-success-foreground">Ativo</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Backup Automático</p>
                  <p className="text-sm text-muted-foreground">Backup diário às 03:00</p>
                </div>
                <Badge className="bg-success text-success-foreground">Ativo</Badge>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Retenção de Logs</p>
                  <p className="text-sm text-muted-foreground">Logs mantidos por 90 dias</p>
                </div>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default VaultAI;
