/**
 * Sidebar Diagnostic Panel
 * Validates that all 16 mandatory groups are present and rendered correctly
 * Route: /dev/sidebar-check
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Layers, Route } from "lucide-react";
import { SIDEBAR_ROUTES, getAllRoutes, getModuleCount } from "@/config/sidebar-routes";

// 16 mandatory groups that MUST be present
const MANDATORY_GROUPS = [
  { id: 1, emoji: "🧠", label: "Centro de Comando" },
  { id: 2, emoji: "⚓", label: "Operações Marítimas" },
  { id: 3, emoji: "🔧", label: "Manutenção" },
  { id: 4, emoji: "🌊", label: "Operações Submarinas" },
  { id: 5, emoji: "🤖", label: "IA & Automação" },
  { id: 6, emoji: "📡", label: "Telemetria & Monitoramento" },
  { id: 7, emoji: "🌐", label: "APIs & Integrações" },
  { id: 8, emoji: "📁", label: "Relatórios & Documentos" },
  { id: 9, emoji: "📢", label: "Comunicação & Alertas" },
  { id: 10, emoji: "🔍", label: "Auditorias" },
  { id: 11, emoji: "👥", label: "RH & Pessoas" },
  { id: 12, emoji: "🎓", label: "Treinamentos" },
  { id: 13, emoji: "💰", label: "Finanças & Procurement" },
  { id: 14, emoji: "🌱", label: "ESG & Sustentabilidade" },
  { id: 15, emoji: "✈️", label: "Viagens & Logística" },
  { id: 16, emoji: "⚙️", label: "Sistema & Configurações" },
];

interface GroupValidation {
  group: typeof MANDATORY_GROUPS[0];
  found: boolean;
  sidebarGroup: typeof SIDEBAR_ROUTES[0] | null;
  itemCount: number;
  issues: string[];
}

export default function SidebarCheck() {
  const validation = useMemo(() => {
    const results: GroupValidation[] = [];
    
    MANDATORY_GROUPS.forEach((mandatoryGroup) => {
      // Find matching group in SIDEBAR_ROUTES (uses 'title' not 'label')
      const found = SIDEBAR_ROUTES.find((route) => {
        const titleMatch = route.title.includes(mandatoryGroup.label) || 
                          route.title.includes(mandatoryGroup.emoji);
        return titleMatch;
      });
      
      const issues: string[] = [];
      
      if (!found) {
        issues.push(`Grupo "${mandatoryGroup.label}" não encontrado na sidebar`);
      } else {
        if (!found.items || found.items.length === 0) {
          issues.push("Grupo sem itens de navegação");
        }
      }
      
      results.push({
        group: mandatoryGroup,
        found: !!found,
        sidebarGroup: found || null,
        itemCount: found?.items?.length || 0,
        issues,
      });
    });
    
    return results;
  }, []);
  
  const allRoutes = useMemo(() => getAllRoutes(), []);
  const moduleCount = useMemo(() => getModuleCount(), []);
  
  const groupsFound = validation.filter((v) => v.found).length;
  const groupsMissing = validation.filter((v) => !v.found).length;
  const groupsWithIssues = validation.filter((v) => v.issues.length > 0).length;
  
  const overallStatus = groupsMissing === 0 ? "success" : groupsMissing <= 2 ? "warning" : "error";
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔍 Sidebar Diagnostic Panel</h1>
          <p className="text-muted-foreground mt-1">
            Validação dos 16 grupos obrigatórios do Nautilus One v3.2.0
          </p>
        </div>
        <Badge 
          variant={overallStatus === "success" ? "default" : overallStatus === "warning" ? "secondary" : "destructive"}
          className="text-lg px-4 py-2"
        >
          {overallStatus === "success" ? "✅ APROVADO" : overallStatus === "warning" ? "⚠️ ATENÇÃO" : "❌ FALHOU"}
        </Badge>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Grupos Encontrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{groupsFound}/16</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Grupos Faltando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${groupsMissing > 0 ? "text-red-600" : "text-green-600"}`}>
              {groupsMissing}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Route className="h-4 w-4" />
              Total de Rotas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allRoutes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Grupos com Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${groupsWithIssues > 0 ? "text-yellow-600" : "text-green-600"}`}>
              {groupsWithIssues}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Validation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Validação Detalhada dos 16 Grupos Obrigatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Grupo Obrigatório</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Itens</th>
                  <th className="text-left p-3">Issues</th>
                </tr>
              </thead>
              <tbody>
                {validation.map((v) => (
                  <tr key={v.group.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-mono text-muted-foreground">{v.group.id}</td>
                    <td className="p-3">
                      <span className="mr-2">{v.group.emoji}</span>
                      <span className="font-medium">{v.group.label}</span>
                    </td>
                    <td className="p-3">
                      {v.found ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Encontrado
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Faltando
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{v.itemCount} módulos</Badge>
                    </td>
                    <td className="p-3">
                      {v.issues.length > 0 ? (
                        <ul className="text-yellow-600 text-xs space-y-1">
                          {v.issues.map((issue) => (
                            <li key={issue}>⚠️ {issue}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-green-600 text-xs">✓ OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Sidebar Routes Dump */}
      <Card>
        <CardHeader>
          <CardTitle>Estrutura Atual da Sidebar ({SIDEBAR_ROUTES.length} grupos)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SIDEBAR_ROUTES.map((group: { title: string; items?: { label: string; path: string }[] }) => (
              <div key={group.title} className="border rounded-lg p-3 bg-muted/30">
                <div className="font-medium mb-2">{group.title}</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {group.items?.slice(0, 5).map((item) => (
                    <li key={item.path} className="truncate">
                      → {item.label} ({item.path})
                    </li>
                  ))}
                  {(group.items?.length || 0) > 5 && (
                    <li className="text-blue-600">+ {(group.items?.length || 0) - 5} mais...</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Nautilus One v3.2.0 • Sidebar Diagnostic Panel</p>
        <p>Última verificação: {new Date().toLocaleString("pt-BR")}</p>
      </div>
    </div>
  );
}
