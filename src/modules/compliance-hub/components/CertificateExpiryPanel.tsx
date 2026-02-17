/**
 * Certificate Expiry Panel - Compliance Hub
 * Monitoramento de certificados vencendo
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Award,
  AlertTriangle,
  Clock,
  Calendar,
  Ship,
  User,
  FileText,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Bell,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Certificate {
  id: string;
  holder: string;
  holderType: "crew" | "vessel";
  vessel?: string;
  certificateType: string;
  certificateCode: string;
  issuedDate: string;
  expiryDate: string;
  issuingAuthority: string;
  status: "valid" | "expiring_soon" | "expiring" | "expired";
  renewalStatus?: "not_started" | "in_progress" | "submitted" | "approved";
  priority: "low" | "medium" | "high" | "critical";
}

// Fallback data - awaiting backend integration
const fallbackCertificates: Certificate[] = [
  { id: "1", holder: "João Silva", holderType: "crew", vessel: "MV Atlântico Sul", certificateType: "STCW Certificate", certificateCode: "STCW-BR-2024", issuedDate: "2021-02-15", expiryDate: "2026-02-15", issuingAuthority: "Marinha do Brasil", status: "expiring", renewalStatus: "in_progress", priority: "critical" },
  { id: "2", holder: "Maria Santos", holderType: "crew", vessel: "MV Atlântico Sul", certificateType: "GMDSS Certificate", certificateCode: "GMDSS-2023", issuedDate: "2023-02-28", expiryDate: "2026-02-28", issuingAuthority: "ANATEL", status: "expiring_soon", renewalStatus: "not_started", priority: "high" },
  { id: "3", holder: "MV Atlântico Sul", holderType: "vessel", certificateType: "Safety Management Certificate", certificateCode: "SMC-2024", issuedDate: "2024-03-10", expiryDate: "2026-03-10", issuingAuthority: "Lloyd's Register", status: "expiring_soon", renewalStatus: "in_progress", priority: "high" },
  { id: "4", holder: "Pedro Costa", holderType: "crew", vessel: "MV Horizonte", certificateType: "Medical Certificate", certificateCode: "MED-2024", issuedDate: "2024-03-15", expiryDate: "2026-03-15", issuingAuthority: "DPC", status: "expiring_soon", renewalStatus: "not_started", priority: "medium" },
  { id: "5", holder: "MV Horizonte", holderType: "vessel", certificateType: "International Load Line", certificateCode: "ILL-2024", issuedDate: "2024-04-01", expiryDate: "2026-04-01", issuingAuthority: "ABS", status: "expiring_soon", priority: "medium" },
  { id: "6", holder: "Ana Lima", holderType: "crew", vessel: "MV Oceano", certificateType: "DP Certificate", certificateCode: "DP-2023", issuedDate: "2023-05-20", expiryDate: "2026-05-20", issuingAuthority: "Nautical Institute", status: "valid", priority: "low" },
  { id: "7", holder: "Carlos Mendes", holderType: "crew", vessel: "MV Pacífico", certificateType: "BOSIET", certificateCode: "BOSIET-2024", issuedDate: "2024-01-10", expiryDate: "2025-01-10", issuingAuthority: "Petrobras", status: "expired", priority: "critical" },
  { id: "8", holder: "MV Oceano", holderType: "vessel", certificateType: "ISPS Certificate", certificateCode: "ISPS-2024", issuedDate: "2024-06-01", expiryDate: "2026-06-01", issuingAuthority: "DNV GL", status: "valid", priority: "low" },
];

const expiryByMonth = [
  { month: "Fev", crew: 3, vessel: 1 },
  { month: "Mar", crew: 5, vessel: 2 },
  { month: "Abr", crew: 2, vessel: 1 },
  { month: "Mai", crew: 4, vessel: 0 },
  { month: "Jun", crew: 1, vessel: 2 },
  { month: "Jul", crew: 3, vessel: 1 },
];

const statusDistribution = [
  { name: "Válidos", value: 65, color: "hsl(var(--success))" },
  { name: "Expirando", value: 20, color: "hsl(var(--warning))" },
  { name: "Críticos", value: 10, color: "hsl(var(--destructive))" },
  { name: "Expirados", value: 5, color: "hsl(var(--muted-foreground))" },
];

function getDaysUntilExpiry(expiryDate: string): number {
  return differenceInDays(new Date(expiryDate), new Date());
}

function getStatusColor(status: Certificate["status"]) {
  const colors = {
    valid: "text-success bg-success/10 border-success/20",
    expiring_soon: "text-warning bg-warning/10 border-warning/20",
    expiring: "text-warning bg-warning/10 border-warning/20",
    expired: "text-destructive bg-destructive/10 border-destructive/20",
  };
  return colors[status];
}

function getPriorityConfig(priority: Certificate["priority"]) {
  const config = {
    critical: { label: "Crítico", className: "bg-destructive/10 text-destructive border-destructive/20 animate-pulse" },
    high: { label: "Alto", className: "bg-warning/10 text-warning border-warning/20" },
    medium: { label: "Médio", className: "bg-warning/10 text-warning border-warning/20" },
    low: { label: "Baixo", className: "bg-muted text-muted-foreground" },
  };
  return config[priority];
}

export default function CertificateExpiryPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    return fallbackCertificates
      .filter((cert) => {
        const matchesSearch = 
          cert.holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cert.certificateType.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
        const matchesType = typeFilter === "all" || cert.holderType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate));
  }, [searchTerm, statusFilter, typeFilter]);

  // Stats
  const stats = useMemo(() => {
    const expiring30 = fallbackCertificates.filter(c => {
      const days = getDaysUntilExpiry(c.expiryDate);
      return days >= 0 && days <= 30;
    }).length;
    const expiring60 = fallbackCertificates.filter(c => {
      const days = getDaysUntilExpiry(c.expiryDate);
      return days > 30 && days <= 60;
    }).length;
    const expired = fallbackCertificates.filter(c => c.status === "expired").length;
    const compliance = Math.round(((fallbackCertificates.length - expired) / fallbackCertificates.length) * 100);

    return { expiring30, expiring60, expired, compliance };
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Compliance Geral</p>
                <p className="text-2xl font-bold text-primary">{stats.compliance}%</p>
              </div>
              <Shield className="h-8 w-8 text-primary opacity-60" />
            </div>
            <Progress value={stats.compliance} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expirando em 30 dias</p>
                <p className="text-2xl font-bold text-destructive">{stats.expiring30}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expirando em 60 dias</p>
                <p className="text-2xl font-bold text-warning">{stats.expiring60}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-muted">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Expirados</p>
                <p className="text-2xl font-bold text-muted-foreground">{stats.expired}</p>
              </div>
              <XCircle className="h-8 w-8 text-muted-foreground opacity-60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Certificados Expirando por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={expiryByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="crew" fill="hsl(var(--primary))" name="Tripulação" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vessel" fill="hsl(var(--muted-foreground))" name="Embarcações" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Distribuição de Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar certificado ou titular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="valid">Válidos</SelectItem>
                <SelectItem value="expiring_soon">Expirando Breve</SelectItem>
                <SelectItem value="expiring">Expirando</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="crew">Tripulação</SelectItem>
                <SelectItem value="vessel">Embarcações</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" aria-label="Exportar certificados" title="Exportar">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Análise IA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Certificados
              </CardTitle>
              <CardDescription>
                {filteredCertificates.length} certificados encontrados
              </CardDescription>
            </div>
            <Button size="sm" variant="outline" className="gap-2">
              <Bell className="h-4 w-4" />
              Configurar Alertas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              <AnimatePresence>
                {filteredCertificates.map((cert, idx) => {
                  const daysLeft = getDaysUntilExpiry(cert.expiryDate);
                  const priorityConfig = getPriorityConfig(cert.priority);

                  return (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                      className={cn(
                        "p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer",
                        cert.priority === "critical" && "border-destructive/50"
                      )}
                      onClick={() => setSelectedCertificate(cert)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-lg flex items-center justify-center",
                            cert.holderType === "crew" ? "bg-primary/10" : "bg-accent/10"
                          )}>
                            {cert.holderType === "crew" ? (
                              <User className="h-6 w-6 text-primary" />
                            ) : (
                              <Ship className="h-6 w-6 text-accent-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{cert.holder}</p>
                            <p className="text-sm text-muted-foreground">{cert.certificateType}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{cert.certificateCode}</Badge>
                              {cert.vessel && cert.holderType === "crew" && (
                                <span className="text-xs text-muted-foreground">{cert.vessel}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <Badge variant="outline" className={priorityConfig.className}>
                              {priorityConfig.label}
                            </Badge>
                            <p className={cn(
                              "text-sm font-medium mt-1",
                              daysLeft < 0 ? "text-destructive" :
                              daysLeft <= 30 ? "text-destructive" :
                              daysLeft <= 60 ? "text-warning" : "text-muted-foreground"
                            )}>
                              {daysLeft < 0 
                                ? `Expirado há ${Math.abs(daysLeft)} dias`
                                : `${daysLeft} dias restantes`
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Expira: {format(new Date(cert.expiryDate), "dd/MM/yyyy")}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Opções do certificado" title="Opções">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                Iniciar Renovação
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Enviar Lembrete
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Ver Documento
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Portal Emissor
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {cert.renewalStatus && cert.renewalStatus !== "not_started" && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status de Renovação:</span>
                            <Badge variant={
                              cert.renewalStatus === "approved" ? "default" :
                              cert.renewalStatus === "submitted" ? "secondary" : "outline"
                            }>
                              {cert.renewalStatus === "in_progress" ? "Em Andamento" :
                               cert.renewalStatus === "submitted" ? "Submetido" :
                               cert.renewalStatus === "approved" ? "Aprovado" : "Não Iniciado"}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Certificate Detail Dialog */}
      <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
        <DialogContent className="max-w-lg">
          {selectedCertificate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    selectedCertificate.holderType === "crew" ? "bg-primary/10" : "bg-accent/10"
                  )}>
                    {selectedCertificate.holderType === "crew" ? (
                      <User className="h-5 w-5 text-primary" />
                    ) : (
                      <Ship className="h-5 w-5 text-purple-500" />
                    )}
                  </div>
                  <div>
                    <span>{selectedCertificate.certificateType}</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      {selectedCertificate.holder}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Código</p>
                    <p className="font-medium">{selectedCertificate.certificateCode}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Autoridade Emissora</p>
                    <p className="font-medium">{selectedCertificate.issuingAuthority}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Data de Emissão</p>
                    <p className="font-medium">{format(new Date(selectedCertificate.issuedDate), "dd/MM/yyyy")}</p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground">Data de Expiração</p>
                    <p className="font-medium">{format(new Date(selectedCertificate.expiryDate), "dd/MM/yyyy")}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Tempo Restante</span>
                    <span className="font-medium">{getDaysUntilExpiry(selectedCertificate.expiryDate)} dias</span>
                  </div>
                  <Progress 
                    value={Math.max(0, Math.min(100, (getDaysUntilExpiry(selectedCertificate.expiryDate) / 365) * 100))} 
                    className="h-2"
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setSelectedCertificate(null)}>
                  Fechar
                </Button>
                <Button className="gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Renovar Certificado
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
