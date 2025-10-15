import React, { useState, useEffect } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import IncidentAiModal from "@/components/dp/IncidentAiModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Shield,
  AlertTriangle,
  FileText,
  TrendingUp,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Incident {
  id: string;
  title: string;
  date: string;
  vessel: string;
  location: string;
  classDP: string;
  rootCause: string;
  tags: string[];
  summary: string;
  link: string;
}

const DPIntelligence = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    dp1: 0,
    dp2: 0,
    dp3: 0
  });

  useEffect(() => {
    // Fetch incidents from API
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        // Try to fetch from Supabase edge function
        const response = await fetch("/functions/v1/dp-intel-feed");
        if (response.ok) {
          const data = await response.json();
          setIncidents(data.incidents || []);
        } else {
          // Fallback to demo data
          loadDemoData();
        }
      } catch (error) {
        console.error("Error fetching incidents:", error);
        // Fallback to demo data
        loadDemoData();
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const loadDemoData = () => {
    const demoIncidents = [
      {
        id: "imca-2025-014",
        title: "Loss of Position Due to Gyro Drift",
        date: "2025-09-12",
        vessel: "DP Shuttle Tanker X",
        location: "Campos Basin",
        rootCause: "Sensor drift not compensated",
        classDP: "DP Class 2",
        source: "IMCA Safety Flash 42/25",
        link: "https://www.imca-int.com/safety-events/42-25/",
        summary: "The vessel experienced a gradual loss of position due to undetected gyro drift during tandem loading ops.",
        tags: ["gyro", "drive off", "sensor", "position loss"],
      },
      {
        id: "imca-2025-009",
        title: "Thruster Control Software Failure During ROV Ops",
        date: "2025-08-05",
        vessel: "DP DSV Subsea Alpha",
        location: "North Sea",
        rootCause: "Unexpected software reboot",
        classDP: "DP Class 3",
        source: "IMCA SF 37/25",
        link: "https://www.imca-int.com/safety-events/37-25/",
        summary: "During critical ROV launch, the vessel experienced a momentary loss of thruster control.",
        tags: ["thruster", "software", "rov", "reboot"],
      },
      {
        id: "imca-2025-006",
        title: "Reference System Failure in Heavy Weather",
        date: "2025-07-18",
        vessel: "DP Drillship Beta",
        location: "Gulf of Mexico",
        rootCause: "Multiple DGPS reference loss",
        classDP: "DP Class 3",
        source: "IMCA SF 31/25",
        link: "https://www.imca-int.com/safety-events/31-25/",
        summary: "During heavy weather operations, the vessel lost multiple DGPS references simultaneously.",
        tags: ["dgps", "reference system", "weather", "acoustic"],
      },
      {
        id: "imca-2024-089",
        title: "Power Management System Malfunction",
        date: "2024-12-03",
        vessel: "DP Construction Vessel Gamma",
        location: "Santos Basin",
        rootCause: "PMS configuration error",
        classDP: "DP Class 2",
        source: "IMCA SF 89/24",
        link: "https://www.imca-int.com/safety-events/89-24/",
        summary: "The Power Management System experienced a configuration error that resulted in unnecessary load shedding.",
        tags: ["pms", "power", "load shedding", "configuration"],
      },
      {
        id: "imca-2024-076",
        title: "Wind Sensor Calibration Issue",
        date: "2024-10-22",
        vessel: "DP Pipelay Vessel Delta",
        location: "West Africa",
        rootCause: "Incorrect wind sensor calibration",
        classDP: "DP Class 2",
        source: "IMCA SF 76/24",
        link: "https://www.imca-int.com/safety-events/76-24/",
        summary: "During pipelaying operations, it was discovered that the wind sensor had been incorrectly calibrated.",
        tags: ["wind sensor", "calibration", "thruster allocation"],
      }
    ];
    setIncidents(demoIncidents);
  };

  useEffect(() => {
    // Calculate statistics
    const total = incidents.length;
    const dp1 = incidents.filter(i => i.classDP?.toLowerCase().includes("1")).length;
    const dp2 = incidents.filter(i => i.classDP?.toLowerCase().includes("2")).length;
    const dp3 = incidents.filter(i => i.classDP?.toLowerCase().includes("3")).length;
    
    setStats({ total, dp1, dp2, dp3 });
  }, [incidents]);

  useEffect(() => {
    // Filter incidents based on search query and selected class
    let filtered = incidents;

    // Apply class filter
    if (selectedClass) {
      filtered = filtered.filter(incident => 
        incident.classDP?.toLowerCase().includes(selectedClass.toLowerCase())
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(incident => 
        incident.title?.toLowerCase().includes(query) ||
        incident.vessel?.toLowerCase().includes(query) ||
        incident.location?.toLowerCase().includes(query) ||
        incident.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredIncidents(filtered);
  }, [searchQuery, selectedClass, incidents]);

  const getClassBadgeColor = (dpClass: string) => {
    if (dpClass?.includes("1")) return "bg-blue-500";
    if (dpClass?.includes("2")) return "bg-yellow-500";
    if (dpClass?.includes("3")) return "bg-red-500";
    return "bg-gray-500";
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Brain}
        title="Centro de Inteligência DP"
        description="Base de conhecimento de incidentes DP com análise por IA"
        gradient="indigo"
        badges={[
          { icon: Shield, label: "IMCA Compliance" },
          { icon: FileText, label: "Relatórios Técnicos" },
          { icon: TrendingUp, label: "Análise IA" }
        ]}
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Incidentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedClass(selectedClass === "1" ? null : "1")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                DP Class 1
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.dp1}</div>
                <Badge className="bg-blue-500">DP-1</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedClass(selectedClass === "2" ? null : "2")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                DP Class 2
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.dp2}</div>
                <Badge className="bg-yellow-500">DP-2</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedClass(selectedClass === "3" ? null : "3")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                DP Class 3
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.dp3}</div>
                <Badge className="bg-red-500">DP-3</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, embarcação, local ou tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {selectedClass && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedClass(null)}
                    className="whitespace-nowrap"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Limpar Filtro
                  </Button>
                )}
              </div>
            </div>
            {(searchQuery || selectedClass) && (
              <div className="mt-4 text-sm text-muted-foreground">
                Mostrando {filteredIncidents.length} de {stats.total} incidentes
                {selectedClass && ` (DP Class ${selectedClass})`}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Incidents List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando incidentes...</p>
            </div>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum incidente encontrado</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedClass 
                    ? "Tente ajustar os filtros de busca" 
                    : "Não há incidentes cadastrados no momento"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIncidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base leading-tight">{incident.title}</CardTitle>
                    <Badge className={getClassBadgeColor(incident.classDP)}>
                      {incident.classDP}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{incident.date}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm line-clamp-3">{incident.summary}</p>
                  
                  <div className="space-y-2">
                    <div className="text-xs">
                      <span className="font-semibold">Embarcação:</span> {incident.vessel}
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Local:</span> {incident.location}
                    </div>
                    <div className="text-xs">
                      <span className="font-semibold">Causa Raiz:</span> {incident.rootCause}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {incident.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {incident.tags?.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{incident.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(incident.link, "_blank")}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Ver Relatório
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        localStorage.setItem("incident_to_analyze", JSON.stringify(incident));
                        window.dispatchEvent(new Event("storage"));
                      }}
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      Analisar IA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* AI Analysis Modal */}
      <IncidentAiModal />
    </ModulePageWrapper>
  );
};

export default DPIntelligence;
