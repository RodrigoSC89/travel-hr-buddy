/**
import { useState, useCallback } from "react";;
 * AI Data Lake - Lago de Dados para IA
 * Repositório centralizado de dados para treinamento de modelos
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Database,
  HardDrive,
  Folder,
  File,
  Search,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  Filter,
  Clock,
  CheckCircle,
  FileText,
  BarChart3,
  Activity,
  Layers,
  Shield,
  Sparkles,
  FolderOpen
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { useToast } from "@/hooks/use-toast";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface DataSource {
  id: string;
  name: string;
  type: "structured" | "unstructured" | "semi-structured" | "streaming";
  format: string;
  size: string;
  records: number;
  lastUpdated: string;
  quality: number;
  status: "active" | "syncing" | "error";
  category: string;
}

const AIDataLake: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const dataSources: DataSource[] = [
    {
      id: "1",
      name: "Telemetria de Embarcações",
      type: "streaming",
      format: "JSON/Parquet",
      size: "12.4TB",
      records: 2847392847,
      lastUpdated: "2024-01-15 14:30:00",
      quality: 98.5,
      status: "active",
      category: "Operacional"
    },
    {
      id: "2",
      name: "Logs de Manutenção",
      type: "structured",
      format: "PostgreSQL",
      size: "8.7TB",
      records: 156789234,
      lastUpdated: "2024-01-15 12:00:00",
      quality: 94.2,
      status: "active",
      category: "Manutenção"
    },
    {
      id: "3",
      name: "Documentos OCR",
      type: "unstructured",
      format: "PDF/Images",
      size: "15.3TB",
      records: 4567890,
      lastUpdated: "2024-01-15 10:00:00",
      quality: 89.7,
      status: "syncing",
      category: "Documentos"
    },
    {
      id: "4",
      name: "Dados Meteorológicos",
      type: "semi-structured",
      format: "NetCDF/CSV",
      size: "5.2TB",
      records: 89234567,
      lastUpdated: "2024-01-15 13:45:00",
      quality: 96.8,
      status: "active",
      category: "Ambiental"
    },
    {
      id: "5",
      name: "Histórico de Rotas",
      type: "structured",
      format: "GeoJSON",
      size: "3.1TB",
      records: 12345678,
      lastUpdated: "2024-01-14 18:00:00",
      quality: 99.1,
      status: "active",
      category: "Navegação"
    },
    {
      id: "6",
      name: "Dados de Tripulação",
      type: "structured",
      format: "PostgreSQL",
      size: "890GB",
      records: 567890,
      lastUpdated: "2024-01-15 08:00:00",
      quality: 97.3,
      status: "error",
      category: "RH"
    }
  ];

  const storageDistribution = [
    { name: "Operacional", value: 35, color: "#3b82f6" },
    { name: "Manutenção", value: 25, color: "#22c55e" },
    { name: "Documentos", value: 20, color: "#f59e0b" },
    { name: "Navegação", value: 12, color: "#8b5cf6" },
    { name: "Outros", value: 8, color: "#6b7280" },
  ];

  const dataQualityTrend = [
    { month: "Set", quality: 91.2 },
    { month: "Out", quality: 92.5 },
    { month: "Nov", quality: 94.1 },
    { month: "Dez", quality: 95.8 },
    { month: "Jan", quality: 96.4 },
  ];

  const categories = ["Todos", "Operacional", "Manutenção", "Documentos", "Navegação", "Ambiental", "RH"];

  const getStatusBadge = (status: DataSource["status"]) => {
    switch (status) {
    case "active":
      return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Ativo</Badge>;
    case "syncing":
      return <Badge className="bg-blue-500/20 text-blue-400"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Sincronizando</Badge>;
    case "error":
      return <Badge className="bg-red-500/20 text-red-400"><Activity className="h-3 w-3 mr-1" />Erro</Badge>;
    }
  };

  const getTypeBadge = (type: DataSource["type"]) => {
    switch (type) {
    case "structured":
      return <Badge variant="outline" className="border-blue-500/30 text-blue-400">Estruturado</Badge>;
    case "unstructured":
      return <Badge variant="outline" className="border-orange-500/30 text-orange-400">Não-Estruturado</Badge>;
    case "semi-structured":
      return <Badge variant="outline" className="border-purple-500/30 text-purple-400">Semi-Estruturado</Badge>;
    case "streaming":
      return <Badge variant="outline" className="border-green-500/30 text-green-400">Streaming</Badge>;
    }
  };

  const filteredSources = dataSources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === "Todos" || source.category === selectedCategory;
    return matchesSearch && matchesCategory;
  };

  const handleExploreData = (sourceId: string) => {
    toast({
      title: "Abrindo Explorador de Dados",
      description: "Carregando schema e preview dos dados...",
    };
  };

  const handleSyncData = (sourceId: string) => {
    toast({
      title: "Sincronização Iniciada",
      description: "Os dados estão sendo sincronizados com o Data Lake.",
    };
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Database}
        title="Lago de Dados IA"
        description="Repositório centralizado de dados para treinamento de modelos de IA"
        gradient="blue"
        badges={[
          { icon: HardDrive, label: "45.7TB" },
          { icon: Layers, label: `${dataSources.length} Fontes` },
          { icon: Shield, label: "Criptografado" }
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Armazenamento Total</p>
                <p className="text-2xl font-bold">45.7TB</p>
              </div>
              <HardDrive className="h-8 w-8 text-cyan-400" />
            </div>
            <Progress value={72} className="mt-3 h-1" />
            <p className="text-xs text-muted-foreground mt-1">72% de 64TB usado</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualidade Média</p>
                <p className="text-2xl font-bold">95.9%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Registros</p>
                <p className="text-2xl font-bold">3.2B</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fontes de Dados</p>
                <p className="text-2xl font-bold">{dataSources.length}</p>
              </div>
              <Database className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sources">Fontes de Dados</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
          <TabsTrigger value="quality">Qualidade</TabsTrigger>
          <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar fontes de dados..." 
                className="pl-10"
                value={searchQuery}
                onChange={handleChange}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button 
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={handleSetSelectedCategory}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Data Sources Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSources.map((source) => (
              <Card key={source.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      {source.name}
                    </CardTitle>
                    {getStatusBadge(source.status)}
                  </div>
                  <CardDescription className="flex items-center gap-2">
                    {getTypeBadge(source.type)}
                    <Badge variant="outline">{source.format}</Badge>
                    <Badge variant="secondary">{source.category}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tamanho:</span>
                      <span className="ml-2 font-medium">{source.size}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Registros:</span>
                      <span className="ml-2 font-medium">{source.records.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Qualidade dos Dados</span>
                      <span className={source.quality >= 95 ? "text-green-500" : source.quality >= 90 ? "text-yellow-500" : "text-red-500"}>
                        {source.quality}%
                      </span>
                    </div>
                    <Progress value={source.quality} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Atualizado: {source.lastUpdated}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => handlehandleExploreData}>
                      <Eye className="h-4 w-4 mr-1" />
                      Explorar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handlehandleSyncData}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Sincronizar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Distribuição por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={storageDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {storageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Estrutura de Diretórios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {categories.slice(1).map((category) => (
                      <div key={category} className="p-3 rounded-lg border bg-muted/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-primary" />
                            <span className="font-medium">{category}</span>
                          </div>
                          <Badge variant="outline">
                            {dataSources.filter(s => s.category === category).length} fontes
                          </Badge>
                        </div>
                        <div className="ml-6 mt-2 space-y-1">
                          {dataSources.filter(s => s.category === category).map(source => (
                            <div key={source.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <File className="h-3 w-3" />
                              {source.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Evolução da Qualidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dataQualityTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[85, 100]} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="quality" fill="hsl(var(--primary))" name="Qualidade %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Métricas de Qualidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Completude</span>
                      <span className="text-green-500">97.8%</span>
                    </div>
                    <Progress value={97.8} className="h-2" />
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Consistência</span>
                      <span className="text-blue-500">95.4%</span>
                    </div>
                    <Progress value={95.4} className="h-2" />
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Precisão</span>
                      <span className="text-purple-500">94.1%</span>
                    </div>
                    <Progress value={94.1} className="h-2" />
                  </div>
                  <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Atualidade</span>
                      <span className="text-orange-500">96.9%</span>
                    </div>
                    <Progress value={96.9} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipelines" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Pipelines de Ingestão
              </CardTitle>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Novo Pipeline
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {[
                    { name: "Telemetria Real-time", source: "IoT Sensors", target: "Raw Zone", status: "running", rate: "1.2K/s" },
                    { name: "ETL Diário - Manutenção", source: "PostgreSQL", target: "Curated Zone", status: "scheduled", rate: "-" },
                    { name: "OCR Document Pipeline", source: "S3 Bucket", target: "Processed Zone", status: "running", rate: "45/min" },
                    { name: "Weather Data Sync", source: "API Externa", target: "Raw Zone", status: "idle", rate: "-" },
                    { name: "Crew Data Integration", source: "HR System", target: "Curated Zone", status: "failed", rate: "-" },
                  ].map((pipeline, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">{pipeline.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {pipeline.source} → {pipeline.target}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {pipeline.rate !== "-" && (
                            <Badge variant="outline">{pipeline.rate}</Badge>
                          )}
                          <Badge className={
                            pipeline.status === "running" ? "bg-green-500/20 text-green-400" :
                              pipeline.status === "scheduled" ? "bg-blue-500/20 text-blue-400" :
                                pipeline.status === "failed" ? "bg-red-500/20 text-red-400" :
                                  "bg-gray-500/20 text-gray-400"
                          }>
                            {pipeline.status}
                          </Badge>
                        </div>
                      </div>
                      {pipeline.status === "running" && (
                        <Progress value={Math.random() * 100} className="h-1" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default AIDataLake;
