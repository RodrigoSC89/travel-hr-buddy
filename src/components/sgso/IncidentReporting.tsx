import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { IncidentAIClassificationModal } from "@/components/sgso/IncidentAIClassificationModal";
import { IncidentClassification } from "@/lib/ai/classifyIncidentWithAI";
import {
  Bell,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Sparkles
} from "lucide-react";

interface Incident {
  id: string;
  number: string;
  type: "accident" | "near_miss" | "environmental" | "security" | "operational" | "other";
  severity: "critical" | "high" | "medium" | "low" | "negligible";
  status: "reported" | "investigating" | "resolved" | "closed";
  title: string;
  date: string;
  vessel?: string;
  reportedBy: string;
}

const SAMPLE_INCIDENTS: Incident[] = [
  {
    id: "1",
    number: "INC-2024-001",
    type: "near_miss",
    severity: "high",
    status: "investigating",
    title: "Quase colisão durante manobra de aproximação",
    date: "2024-10-05",
    vessel: "MV Atlântico",
    reportedBy: "Capitão Silva"
  },
  {
    id: "2",
    number: "INC-2024-002",
    type: "environmental",
    severity: "medium",
    status: "resolved",
    title: "Pequeno vazamento de óleo hidráulico",
    date: "2024-10-03",
    vessel: "MV Pacífico",
    reportedBy: "Eng. Santos"
  },
  {
    id: "3",
    number: "INC-2024-003",
    type: "accident",
    severity: "low",
    status: "closed",
    title: "Lesão menor em membro da tripulação",
    date: "2024-10-01",
    vessel: "MV Índico",
    reportedBy: "Médico de Bordo"
  },
  {
    id: "4",
    number: "INC-2024-004",
    type: "operational",
    severity: "critical",
    status: "reported",
    title: "Falha temporária sistema DP durante operação crítica",
    date: "2024-10-06",
    vessel: "MV Atlântico",
    reportedBy: "DPO João"
  }
];

const getSeverityColor = (severity: string) => {
  const colors = {
    critical: "bg-red-600 text-white border-red-700",
    high: "bg-orange-600 text-white border-orange-700",
    medium: "bg-yellow-600 text-white border-yellow-700",
    low: "bg-blue-600 text-white border-blue-700",
    negligible: "bg-gray-600 text-white border-gray-700"
  };
  return colors[severity as keyof typeof colors] || "bg-gray-600";
};

const getStatusColor = (status: string) => {
  const colors = {
    reported: "bg-yellow-100 text-yellow-800 border-yellow-300",
    investigating: "bg-blue-100 text-blue-800 border-blue-300",
    resolved: "bg-green-100 text-green-800 border-green-300",
    closed: "bg-secondary text-secondary-foreground border-border"
  };
  return colors[status as keyof typeof colors] || "bg-gray-100";
};

const getTypeLabel = (type: string) => {
  const labels = {
    accident: "Acidente",
    near_miss: "Quase Acidente",
    environmental: "Ambiental",
    security: "Segurança",
    operational: "Operacional",
    other: "Outro"
  };
  return labels[type as keyof typeof labels] || type;
};

const getStatusLabel = (status: string) => {
  const labels = {
    reported: "Reportado",
    investigating: "Investigando",
    resolved: "Resolvido",
    closed: "Fechado"
  };
  return labels[status as keyof typeof labels] || status;
};

const getSeverityLabel = (severity: string) => {
  const labels = {
    critical: "Crítico",
    high: "Alto",
    medium: "Médio",
    low: "Baixo",
    negligible: "Negligível"
  };
  return labels[severity as keyof typeof labels] || severity;
};

export const IncidentReporting: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiClassification, setAIClassification] = useState<IncidentClassification | null>(null);
  const [filterSeverity, setFilterSeverity] = useState({
    critical: true,
    high: true,
    medium: true,
    low: true,
    negligible: true
  });
  const [filterType, setFilterType] = useState({
    accident: true,
    near_miss: true,
    environmental: true,
    security: true,
    operational: true,
    other: true
  });
  const { toast } = useToast();

  const criticalCount = SAMPLE_INCIDENTS.filter(i => i.severity === "critical").length;
  const highCount = SAMPLE_INCIDENTS.filter(i => i.severity === "high").length;
  const openCount = SAMPLE_INCIDENTS.filter(i => i.status === "reported" || i.status === "investigating").length;

  const handleSearch = () => {
    setShowSearchDialog(!showSearchDialog);
    toast({
      title: "🔍 Busca de Incidentes",
      description: "Digite o número do incidente, título ou palavra-chave"
    });
  };

  const handleOpenAIClassification = () => {
    setShowAIModal(true);
  };

  const handleClassificationComplete = (classification: IncidentClassification) => {
    setAIClassification(classification);
    toast({
      title: "✨ Classificação aplicada",
      description: `Categoria: ${classification.sgso_category}, Risco: ${classification.sgso_risk_level}`,
    });
    // Here you would typically save this to your incident form state
    // For now, we'll just log it
    console.log("AI Classification applied:", classification);
  };

  const filteredIncidents = SAMPLE_INCIDENTS.filter(incident => {
    const matchesSearch = searchQuery === "" || 
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (incident.vessel && incident.vessel.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesSeverity = filterSeverity[incident.severity];
    const matchesType = filterType[incident.type];
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Críticos</p>
                <p className="text-3xl font-bold text-red-900">{criticalCount}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Altos</p>
                <p className="text-3xl font-bold text-orange-900">{highCount}</p>
              </div>
              <Bell className="h-12 w-12 text-orange-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Abertos</p>
                <p className="text-3xl font-bold text-blue-900">{openCount}</p>
              </div>
              <Clock className="h-12 w-12 text-blue-600 opacity-70" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total</p>
                <p className="text-3xl font-bold text-gray-900">{SAMPLE_INCIDENTS.length}</p>
              </div>
              <FileText className="h-12 w-12 text-muted-foreground opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Bell className="h-6 w-6 text-red-600" />
                Gestão de Incidentes de Segurança
              </CardTitle>
              <CardDescription className="mt-2">
                Registro, investigação e acompanhamento de incidentes
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleOpenAIClassification}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Classificar com IA
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Novo Incidente
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="grid grid-cols-5 w-auto">
                <TabsTrigger value="all">Todos ({filteredIncidents.length})</TabsTrigger>
                <TabsTrigger value="open">Abertos ({openCount})</TabsTrigger>
                <TabsTrigger value="critical">Críticos ({criticalCount})</TabsTrigger>
                <TabsTrigger value="investigating">Investigando</TabsTrigger>
                <TabsTrigger value="closed">Fechados</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2">
                <div className="relative">
                  {showSearchDialog && (
                    <div className="absolute right-0 top-12 z-50 w-80 bg-background border rounded-lg shadow-lg p-4">
                      <Input
                        placeholder="Buscar incidentes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Busque por número, título ou embarcação
                      </p>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Filtrar por Severidade</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={filterSeverity.critical}
                      onCheckedChange={(checked) => 
                        setFilterSeverity(prev => ({ ...prev, critical: !!checked }))
                      }
                    >
                      Crítico
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterSeverity.high}
                      onCheckedChange={(checked) => 
                        setFilterSeverity(prev => ({ ...prev, high: !!checked }))
                      }
                    >
                      Alto
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterSeverity.medium}
                      onCheckedChange={(checked) => 
                        setFilterSeverity(prev => ({ ...prev, medium: !!checked }))
                      }
                    >
                      Médio
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterSeverity.low}
                      onCheckedChange={(checked) => 
                        setFilterSeverity(prev => ({ ...prev, low: !!checked }))
                      }
                    >
                      Baixo
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Filtrar por Tipo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuCheckboxItem
                      checked={filterType.accident}
                      onCheckedChange={(checked) => 
                        setFilterType(prev => ({ ...prev, accident: !!checked }))
                      }
                    >
                      Acidente
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterType.near_miss}
                      onCheckedChange={(checked) => 
                        setFilterType(prev => ({ ...prev, near_miss: !!checked }))
                      }
                    >
                      Quase Acidente
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterType.environmental}
                      onCheckedChange={(checked) => 
                        setFilterType(prev => ({ ...prev, environmental: !!checked }))
                      }
                    >
                      Ambiental
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterType.security}
                      onCheckedChange={(checked) => 
                        setFilterType(prev => ({ ...prev, security: !!checked }))
                      }
                    >
                      Segurança
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterType.operational}
                      onCheckedChange={(checked) => 
                        setFilterType(prev => ({ ...prev, operational: !!checked }))
                      }
                    >
                      Operacional
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <TabsContent value="all" className="space-y-3">
              {filteredIncidents.map((incident) => (
                <Card 
                  key={incident.id}
                  className="border-2 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => setSelectedIncident(incident)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border font-bold">
                            {incident.number}
                          </Badge>
                          <h3 className="font-bold text-lg text-gray-900">{incident.title}</h3>
                        </div>
                        
                        <div className="flex gap-3 text-sm text-muted-foreground">
                          <span>📅 {incident.date}</span>
                          {incident.vessel && <span>🚢 {incident.vessel}</span>}
                          <span>👤 {incident.reportedBy}</span>
                        </div>

                        <div className="flex gap-2">
                          <Badge className={getSeverityColor(incident.severity)}>
                            {getSeverityLabel(incident.severity)}
                          </Badge>
                          <Badge className={getStatusColor(incident.status)} variant="outline">
                            {getStatusLabel(incident.status)}
                          </Badge>
                          <Badge variant="outline" className="bg-white">
                            {getTypeLabel(incident.type)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {incident.status === "reported" && (
                          <Badge className="bg-yellow-600 text-white">
                            <Clock className="h-3 w-3 mr-1" />
                            Aguardando
                          </Badge>
                        )}
                        {incident.status === "investigating" && (
                          <Badge className="bg-blue-600 text-white">
                            <Search className="h-3 w-3 mr-1" />
                            Em Análise
                          </Badge>
                        )}
                        {incident.status === "resolved" && (
                          <Badge className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolvido
                          </Badge>
                        )}
                        <Button variant="outline" size="sm" className="bg-white">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {["open", "critical", "investigating", "closed"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-3">
                {filteredIncidents.filter(i => {
                  if (tab === "open") return i.status === "reported" || i.status === "investigating";
                  if (tab === "critical") return i.severity === "critical";
                  if (tab === "investigating") return i.status === "investigating";
                  if (tab === "closed") return i.status === "closed";
                  return true;
                }).map((incident) => (
                  <Card 
                    key={incident.id}
                    className="border-2 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-secondary text-secondary-foreground border-border font-bold">
                              {incident.number}
                            </Badge>
                            <h3 className="font-bold text-lg text-gray-900">{incident.title}</h3>
                          </div>
                          
                          <div className="flex gap-2">
                            <Badge className={getSeverityColor(incident.severity)}>
                              {getSeverityLabel(incident.severity)}
                            </Badge>
                            <Badge className={getStatusColor(incident.status)} variant="outline">
                              {getStatusLabel(incident.status)}
                            </Badge>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" className="bg-white">
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Classification Modal */}
      <IncidentAIClassificationModal
        open={showAIModal}
        onOpenChange={setShowAIModal}
        onClassificationComplete={handleClassificationComplete}
      />
    </div>
  );
};

export default IncidentReporting;
