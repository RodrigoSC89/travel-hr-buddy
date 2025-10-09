import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Palette,
  Building,
  Users,
  Settings,
  Plus,
  Edit,
  Copy,
  Check,
  Upload,
  Eye,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomField {
  id: string;
  name: string;
  type: "text" | "number" | "date" | "select" | "boolean";
  required: boolean;
  options?: string[];
  module: string;
}

interface Theme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  customCss?: string;
}

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  users: number;
  plan: "basic" | "premium" | "enterprise";
  customFields: number;
  theme: string;
  status: "active" | "inactive";
}

export const ClientCustomization = () => {
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const { toast } = useToast();

  const themes: Theme[] = [
    {
      id: "default",
      name: "Nautilus Padrão",
      primaryColor: "#2563eb",
      secondaryColor: "#0ea5e9",
    },
    {
      id: "corporate",
      name: "Corporativo",
      primaryColor: "#1f2937",
      secondaryColor: "#374151",
    },
    {
      id: "ocean",
      name: "Oceano Profundo",
      primaryColor: "#0c4a6e",
      secondaryColor: "#0369a1",
    },
    {
      id: "sunset",
      name: "Pôr do Sol",
      primaryColor: "#dc2626",
      secondaryColor: "#ea580c",
    },
  ];

  const mockOrganizations: Organization[] = [
    {
      id: "1",
      name: "Petrobras Transporte S.A.",
      subdomain: "petrobras",
      users: 450,
      plan: "enterprise",
      customFields: 12,
      theme: "corporate",
      status: "active",
    },
    {
      id: "2",
      name: "Log-In Logística Intermodal",
      subdomain: "login",
      users: 180,
      plan: "premium",
      customFields: 8,
      theme: "ocean",
      status: "active",
    },
    {
      id: "3",
      name: "Norsul Navegação",
      subdomain: "norsul",
      users: 95,
      plan: "basic",
      customFields: 3,
      theme: "default",
      status: "active",
    },
  ];

  const defaultCustomFields: CustomField[] = [
    {
      id: "1",
      name: "Número do DPC",
      type: "text",
      required: true,
      module: "crew",
    },
    {
      id: "2",
      name: "Categoria de Navegação",
      type: "select",
      required: true,
      options: ["Cabotagem", "Longo Curso", "Interior", "Apoio Marítimo"],
      module: "vessels",
    },
    {
      id: "3",
      name: "Centro de Custo",
      type: "text",
      required: false,
      module: "voyages",
    },
  ];

  useState(() => {
    setOrganizations(mockOrganizations);
    setCustomFields(defaultCustomFields);
  });

  const addCustomField = () => {
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      name: "Novo Campo",
      type: "text",
      required: false,
      module: "crew",
    };
    setCustomFields([...customFields, newField]);
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setCustomFields(fields =>
      fields.map(field => (field.id === id ? { ...field, ...updates } : field))
    );
  };

  const removeCustomField = (id: string) => {
    setCustomFields(fields => fields.filter(field => field.id !== id));
  };

  const saveTheme = () => {
    toast({
      title: "Tema Salvo",
      description: "As configurações de tema foram aplicadas com sucesso.",
    });
  };

  const cloneOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      const newOrg: Organization = {
        ...org,
        id: `clone_${Date.now()}`,
        name: `${org.name} (Cópia)`,
        subdomain: `${org.subdomain}-copy`,
        status: "inactive",
      };
      setOrganizations([...organizations, newOrg]);
      toast({
        title: "Organização Clonada",
        description: "Uma cópia da organização foi criada com sucesso.",
      });
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "bg-primary text-primary-foreground";
      case "premium":
        return "bg-warning text-warning-foreground";
      case "basic":
        return "bg-info text-info-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-success text-success-foreground"
      : "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Customizações para Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Configure temas visuais, campos personalizados e gerencie múltiplas organizações.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="themes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="themes">Temas Visuais</TabsTrigger>
          <TabsTrigger value="fields">Campos Personalizados</TabsTrigger>
          <TabsTrigger value="organizations">Multiempresa</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-6">
          {/* Theme Customization */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Editor de Temas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Theme Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Temas Pré-definidos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map(theme => (
                      <div
                        key={theme.id}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                          selectedTheme === theme.id
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-border"
                        }`}
                        onClick={() => setSelectedTheme(theme.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.secondaryColor }}
                          />
                        </div>
                        <div className="text-sm font-medium">{theme.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Theme Options */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Personalização</h3>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="logo-upload">Logo da Empresa</Label>
                      <div className="mt-1 flex gap-2">
                        <Input type="file" accept="image/*" className="flex-1" />
                        <Button variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="primary-color">Cor Primária</Label>
                      <div className="mt-1 flex gap-2">
                        <Input type="color" defaultValue="#2563eb" className="w-16 h-10 p-1" />
                        <Input defaultValue="#2563eb" placeholder="#2563eb" className="flex-1" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondary-color">Cor Secundária</Label>
                      <div className="mt-1 flex gap-2">
                        <Input type="color" defaultValue="#0ea5e9" className="w-16 h-10 p-1" />
                        <Input defaultValue="#0ea5e9" placeholder="#0ea5e9" className="flex-1" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveTheme}>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Tema
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fields" className="space-y-6">
          {/* Custom Fields */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Campos Personalizados
                </div>
                <Button onClick={addCustomField}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Campo
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customFields.map(field => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label>Nome do Campo</Label>
                        <Input
                          value={field.name}
                          onChange={e => updateCustomField(field.id, { name: e.target.value })}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Tipo</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value: any) =>
                            updateCustomField(field.id, { type: value })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto</SelectItem>
                            <SelectItem value="number">Número</SelectItem>
                            <SelectItem value="date">Data</SelectItem>
                            <SelectItem value="select">Lista</SelectItem>
                            <SelectItem value="boolean">Sim/Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Módulo</Label>
                        <Select
                          value={field.module}
                          onValueChange={value => updateCustomField(field.id, { module: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="crew">Tripulação</SelectItem>
                            <SelectItem value="vessels">Embarcações</SelectItem>
                            <SelectItem value="voyages">Viagens</SelectItem>
                            <SelectItem value="alerts">Alertas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <Switch
                          checked={field.required}
                          onCheckedChange={checked =>
                            updateCustomField(field.id, { required: checked })
                          }
                        />
                        <Label>Obrigatório</Label>
                      </div>

                      <div className="flex items-center gap-2 pt-6">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCustomField(field.id)}
                        >
                          ✕
                        </Button>
                      </div>
                    </div>

                    {field.type === "select" && (
                      <div className="mt-3">
                        <Label>Opções (separadas por vírgula)</Label>
                        <Input
                          placeholder="Opção 1, Opção 2, Opção 3"
                          value={field.options?.join(", ") || ""}
                          onChange={e =>
                            updateCustomField(field.id, {
                              options: e.target.value
                                .split(",")
                                .map(s => s.trim())
                                .filter(Boolean),
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          {/* Organization Management */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Gestão Multiempresa
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Organização
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizations.map(org => (
                  <div key={org.id} className="border rounded-lg p-4 hover-lift">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{org.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {org.subdomain}.nautilus.com
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPlanColor(org.plan)}>{org.plan}</Badge>
                        <Badge className={getStatusColor(org.status)}>{org.status}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Usuários:</span>
                        <p className="text-muted-foreground">{org.users}</p>
                      </div>
                      <div>
                        <span className="font-medium">Campos Customizados:</span>
                        <p className="text-muted-foreground">{org.customFields}</p>
                      </div>
                      <div>
                        <span className="font-medium">Tema:</span>
                        <p className="text-muted-foreground">{org.theme}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cloneOrganization(org.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permission Matrix */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Matriz de Permissões por Grupo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Módulo</th>
                      <th className="text-center p-2">Admin</th>
                      <th className="text-center p-2">Gerente</th>
                      <th className="text-center p-2">Operador</th>
                      <th className="text-center p-2">Visitante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["Dashboard", "RH Marítimo", "Logística", "Reservas", "Relatórios"].map(
                      module => (
                        <tr key={module} className="border-b">
                          <td className="p-2 font-medium">{module}</td>
                          <td className="text-center p-2">
                            <Check className="h-4 w-4 text-success mx-auto" />
                          </td>
                          <td className="text-center p-2">
                            <Check className="h-4 w-4 text-success mx-auto" />
                          </td>
                          <td className="text-center p-2">
                            {module !== "Relatórios" ? (
                              <Check className="h-4 w-4 text-warning mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="text-center p-2">
                            {module === "Dashboard" ? (
                              <Check className="h-4 w-4 text-info mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* Configuration Templates */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Copy className="h-5 w-5 text-primary" />
                Templates de Configuração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "Armador Padrão",
                    description: "Configuração para empresas de navegação tradicionais",
                    modules: ["Dashboard", "RH", "Logística", "Viagens"],
                  },
                  {
                    name: "Offshore Premium",
                    description: "Template especializado para operações offshore",
                    modules: ["Dashboard", "RH", "Logística", "Segurança", "Compliance"],
                  },
                  {
                    name: "Turismo Náutico",
                    description: "Configuração para turismo e embarcações de recreio",
                    modules: ["Dashboard", "Reservas", "Clientes", "Rotas"],
                  },
                ].map((template, index) => (
                  <div key={index} className="border rounded-lg p-4 hover-lift">
                    <h4 className="font-semibold mb-2">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="space-y-2 mb-4">
                      <span className="text-xs font-medium">Módulos inclusos:</span>
                      <div className="flex flex-wrap gap-1">
                        {template.modules.map(module => (
                          <Badge key={module} variant="outline" className="text-xs">
                            {module}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" className="w-full">
                      Aplicar Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
