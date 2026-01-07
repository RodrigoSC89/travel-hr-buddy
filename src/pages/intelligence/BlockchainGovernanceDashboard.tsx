/**
 * GDCB - Governança de Dados e Compliance Blockchain
 * Dashboard com audit trail imutável e certificados de compliance
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Lock,
  FileCheck,
  Clock,
  CheckCircle,
  Link2,
  Database,
  Search,
  Download,
  Eye,
  Hash,
  Blocks,
  Award,
  FileText,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

// Mock blockchain data
const blockchainEvents = [
  {
    id: "evt-001",
    type: "maintenance:completed",
    timestamp: "2025-01-07T14:30:00Z",
    actor: "eng_carlos_silva",
    vessel: "MV Nautilus Prime",
    description: "Manutenção motor principal - bomba combustível",
    hash: "0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    blockNumber: 18234567,
    verified: true
  },
  {
    id: "evt-002",
    type: "compliance:check:passed",
    timestamp: "2025-01-07T10:15:00Z",
    actor: "compliance_officer",
    vessel: "MV Nautilus Prime",
    description: "Inspeção SOLAS - Equipamentos de segurança",
    hash: "0x6b51d431df5d7f141cbececcf79edf3dd861c3b4069f0b11661a3eefacbba918",
    blockNumber: 18234550,
    verified: true
  },
  {
    id: "evt-003",
    type: "crew:certification:renewed",
    timestamp: "2025-01-06T16:45:00Z",
    actor: "hr_manager",
    vessel: "Fleet-wide",
    description: "Certificação STCW renovada - 15 tripulantes",
    hash: "0x3c9683017f9e4c59c57d5b969fae75d67ef9d4ef3e9b7e87c9c40b5b8c6d9e2a",
    blockNumber: 18234489,
    verified: true
  },
  {
    id: "evt-004",
    type: "incident:reported",
    timestamp: "2025-01-05T08:20:00Z",
    actor: "safety_officer",
    vessel: "MV Atlantic Star",
    description: "Near-miss reportado - escorregão no deck",
    hash: "0x2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3",
    blockNumber: 18234412,
    verified: true
  }
];

const certificates = [
  {
    id: "cert-001",
    type: "ISM Code",
    vessel: "MV Nautilus Prime",
    issueDate: "2024-03-15",
    expiryDate: "2029-03-14",
    status: "valid",
    blockchainHash: "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    authority: "Lloyd's Register"
  },
  {
    id: "cert-002",
    type: "ISPS Certificate",
    vessel: "MV Nautilus Prime",
    issueDate: "2024-06-20",
    expiryDate: "2029-06-19",
    status: "valid",
    blockchainHash: "0x4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce",
    authority: "DNV GL"
  },
  {
    id: "cert-003",
    type: "MLC 2006",
    vessel: "Fleet-wide",
    issueDate: "2024-01-10",
    expiryDate: "2026-01-09",
    status: "valid",
    blockchainHash: "0xef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
    authority: "Flag State"
  },
  {
    id: "cert-004",
    type: "SOPEP",
    vessel: "MV Atlantic Star",
    issueDate: "2023-08-05",
    expiryDate: "2025-02-04",
    status: "expiring",
    blockchainHash: "0xe7f6c011776e8db7cd330b54174fd76f7d0216b612387a5ffcfb81e6f0919683",
    authority: "Class NK"
  }
];

const blockchainStats = {
  totalTransactions: 12847,
  blocksCreated: 1284,
  eventsToday: 23,
  verificationRate: 100,
  averageConfirmation: "2.3s"
};

const transactionVolume = [
  { date: "Jan 1", transactions: 45 },
  { date: "Jan 2", transactions: 52 },
  { date: "Jan 3", transactions: 38 },
  { date: "Jan 4", transactions: 61 },
  { date: "Jan 5", transactions: 48 },
  { date: "Jan 6", transactions: 55 },
  { date: "Jan 7", transactions: 67 }
];

export default function BlockchainGovernanceDashboard() {
  const [searchHash, setSearchHash] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(blockchainEvents[0]);

  const getEventTypeIcon = (type: string) => {
    if (type.includes("maintenance")) return <FileCheck className="h-4 w-4" />;
    if (type.includes("compliance")) return <Shield className="h-4 w-4" />;
    if (type.includes("certification")) return <Award className="h-4 w-4" />;
    if (type.includes("incident")) return <AlertTriangle className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getEventTypeColor = (type: string) => {
    if (type.includes("maintenance")) return "text-blue-500 bg-blue-500/10";
    if (type.includes("compliance")) return "text-emerald-500 bg-emerald-500/10";
    if (type.includes("certification")) return "text-purple-500 bg-purple-500/10";
    if (type.includes("incident")) return "text-amber-500 bg-amber-500/10";
    return "text-muted-foreground bg-muted";
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Blocks className="h-8 w-8 text-indigo-500" />
            GDCB - Blockchain Governance
          </h1>
          <p className="text-muted-foreground mt-1">
            Audit trail imutável e certificados de compliance
          </p>
        </div>
        <Badge variant="outline" className="text-indigo-500 border-indigo-500">
          <Lock className="h-3 w-3 mr-1" />
          Rede Polygon Ativa
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border-indigo-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transações</p>
                <p className="text-2xl font-bold text-indigo-500">
                  {blockchainStats.totalTransactions.toLocaleString()}
                </p>
              </div>
              <Database className="h-8 w-8 text-indigo-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blocos</p>
                <p className="text-2xl font-bold text-purple-500">
                  {blockchainStats.blocksCreated.toLocaleString()}
                </p>
              </div>
              <Blocks className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Eventos Hoje</p>
                <p className="text-2xl font-bold text-blue-500">{blockchainStats.eventsToday}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verificação</p>
                <p className="text-2xl font-bold text-emerald-500">{blockchainStats.verificationRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmação</p>
                <p className="text-2xl font-bold text-amber-500">{blockchainStats.averageConfirmation}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          <TabsTrigger value="certificates">Certificados</TabsTrigger>
          <TabsTrigger value="verify">Verificar Hash</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lista de Eventos */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Eventos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {blockchainEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedEvent.id === event.id 
                            ? "ring-2 ring-primary bg-primary/5" 
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`p-1.5 rounded ${getEventTypeColor(event.type)}`}>
                            {getEventTypeIcon(event.type)}
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">
                            #{event.blockNumber}
                          </span>
                        </div>
                        <p className="font-medium text-sm">{event.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{event.vessel}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Detalhes do Evento */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Detalhes da Transação
                  </CardTitle>
                  {selectedEvent.verified && (
                    <Badge className="bg-emerald-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Tipo de Evento</p>
                    <p className="font-medium">{selectedEvent.type}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Timestamp</p>
                    <p className="font-medium">{new Date(selectedEvent.timestamp).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Ator</p>
                    <p className="font-medium">{selectedEvent.actor}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Embarcação</p>
                    <p className="font-medium">{selectedEvent.vessel}</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Transaction Hash
                  </p>
                  <p className="font-mono text-sm break-all">{selectedEvent.hash}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Descrição</p>
                  <p>{selectedEvent.description}</p>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver no Explorer
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Prova
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className={cert.status === "expiring" ? "border-amber-500/50" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-indigo-500/10">
                        <Award className="h-6 w-6 text-indigo-500" />
                      </div>
                      <div>
                        <h4 className="font-bold">{cert.type}</h4>
                        <p className="text-sm text-muted-foreground">{cert.vessel}</p>
                      </div>
                    </div>
                    <Badge variant={cert.status === "valid" ? "default" : "secondary"} 
                           className={cert.status === "valid" ? "bg-emerald-500" : "bg-amber-500"}>
                      {cert.status === "valid" ? "Válido" : "Expirando"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Emissão</p>
                      <p className="font-medium">{new Date(cert.issueDate).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Validade</p>
                      <p className="font-medium">{new Date(cert.expiryDate).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-2 rounded bg-muted/50">
                    <p className="text-xs text-muted-foreground">Autoridade: {cert.authority}</p>
                    <p className="text-xs font-mono text-muted-foreground truncate mt-1">
                      Hash: {cert.blockchainHash.slice(0, 20)}...
                    </p>
                  </div>

                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verificar Autenticidade
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Verificar Transação por Hash
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Cole o hash da transação (0x...)"
                  value={searchHash}
                  onChange={(e) => setSearchHash(e.target.value)}
                  className="font-mono"
                />
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Verificar
                </Button>
              </div>

              <div className="p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="font-bold text-lg text-emerald-500">Transação Verificada</h4>
                <p className="text-sm text-muted-foreground mt-2">
                  Este registro é autêntico e não foi alterado desde sua criação.
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  Bloco: #18234567 | Confirmações: 1,284 | Rede: Polygon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Volume de Transações (Últimos 7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={transactionVolume}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))" 
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="#6366f1" 
                    fill="#6366f1" 
                    fillOpacity={0.3} 
                    name="Transações"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
