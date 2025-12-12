/**
 * Certificates Panel Component
 * Painel completo de certificados com funcionalidades avançadas
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Award,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MoreVertical,
  Eye,
  Edit,
  Download,
  Bell,
  FileText,
  Clock,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import type { Certificate } from "../types";

interface CertificatesPanelProps {
  certificates: Certificate[];
  onAddCertificate: () => void;
  onViewCertificate: (certId: string) => void;
  onEditCertificate: (certId: string) => void;
  onDownloadCertificate: (certId: string) => void;
  onSetReminder: (certId: string) => void;
}

export function CertificatesPanel({
  certificates,
  onAddCertificate,
  onViewCertificate,
  onEditCertificate,
  onDownloadCertificate,
  onSetReminder,
}: CertificatesPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const getStatusInfo = (status: Certificate["status"], expiryDate: string) => {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);

    switch (status) {
    case "valid":
      return {
        variant: "default" as const,
        label: "Válido",
        icon: <CheckCircle2 className="h-3 w-3" />,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
      };
    case "expiring-soon":
      return {
        variant: "secondary" as const,
        label: `Expira em ${daysUntilExpiry} dias`,
        icon: <Clock className="h-3 w-3" />,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
      };
    case "expired":
      return {
        variant: "destructive" as const,
        label: "Expirado",
        icon: <XCircle className="h-3 w-3" />,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
      };
    case "pending-renewal":
      return {
        variant: "outline" as const,
        label: "Aguardando Renovação",
        icon: <AlertTriangle className="h-3 w-3" />,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
      };
    default:
      return {
        variant: "outline" as const,
        label: status,
        icon: null,
        color: "",
        bgColor: "",
      };
    }
  };

  const getExpiryProgress = (expiryDate: string) => {
    const today = new Date();
    const expiry = parseISO(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);
    
    // Assuming certificates have 1 year validity
    const totalDays = 365;
    const progress = Math.max(0, Math.min(100, ((totalDays - daysUntilExpiry) / totalDays) * 100));
    
    return {
      progress: 100 - progress,
      daysLeft: daysUntilExpiry,
    };
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesType = typeFilter === "all" || cert.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const uniqueTypes = [...new Set(certificates.map((c) => c.type))];

  // Stats
  const stats = {
    total: certificates.length,
    valid: certificates.filter((c) => c.status === "valid").length,
    expiringSoon: certificates.filter((c) => c.status === "expiring-soon").length,
    expired: certificates.filter((c) => c.status === "expired").length,
    pendingRenewal: certificates.filter((c) => c.status === "pending-renewal").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Válidos</p>
                <p className="text-2xl font-bold">{stats.valid}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expirando</p>
                <p className="text-2xl font-bold">{stats.expiringSoon}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expirados</p>
                <p className="text-2xl font-bold">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Renovação</p>
                <p className="text-2xl font-bold">{stats.pendingRenewal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Certificados
            </CardTitle>
            <Button onClick={onAddCertificate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Certificado
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar certificado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="valid">Válido</SelectItem>
                <SelectItem value="expiring-soon">Expirando</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="pending-renewal">Aguardando Renovação</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {uniqueTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map((cert) => {
            const statusInfo = getStatusInfo(cert.status, cert.expiryDate);
            const expiryInfo = getExpiryProgress(cert.expiryDate);

            return (
              <Card key={cert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                        <Award className={`h-5 w-5 ${statusInfo.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium line-clamp-1">{cert.name}</h4>
                        <p className="text-sm text-muted-foreground">{cert.type}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewCertificate(cert.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditCertificate(cert.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        {cert.documentUrl && (
                          <DropdownMenuItem onClick={() => onDownloadCertificate(cert.id)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onSetReminder(cert.id)}>
                          <Bell className="h-4 w-4 mr-2" />
                          Configurar Lembrete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                        {statusInfo.icon}
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{cert.vesselName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Award className="h-4 w-4" />
                        <span>{cert.issuingAuthority}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Validade</span>
                        <span className={expiryInfo.daysLeft < 30 ? "text-red-500" : ""}>
                          {cert.expiryDate}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Tempo restante</span>
                          <span className={expiryInfo.daysLeft < 30 ? "text-red-500" : "text-muted-foreground"}>
                            {expiryInfo.daysLeft > 0 ? `${expiryInfo.daysLeft} dias` : "Expirado"}
                          </span>
                        </div>
                        <Progress
                          value={expiryInfo.progress}
                          className={`h-1.5 ${expiryInfo.daysLeft < 30 ? "[&>div]:bg-red-500" : ""}`}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
