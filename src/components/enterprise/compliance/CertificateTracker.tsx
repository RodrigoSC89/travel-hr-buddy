/**
 * Certificate Tracker Component
 * Timeline de certificados com alertas de vencimento
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  Bell,
  Ship,
  FileText,
  RefreshCw,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface Certificate {
  id: string;
  name: string;
  type: string;
  vesselName: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired" | "pending";
  daysRemaining: number;
  documentUrl?: string;
}

export function CertificateTracker() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const { data, error } = await supabase
          .from("certificates")
          .select("*")
          .order("expiry_date", { ascending: true })
          .limit(100);

        if (error) {
          logger.warn("certificates query error", error);
          setLoading(false);
          return;
        }

        const now = new Date();
        const mapped: Certificate[] = (data || []).map((c) => {
          const expiry = c.expiry_date ? new Date(c.expiry_date) : new Date(Date.now() + 365 * 86400000);
          const issue = c.issue_date ? new Date(c.issue_date) : new Date(c.created_at || Date.now());
          const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
          const status: Certificate["status"] = daysRemaining < 0 ? "expired" : daysRemaining <= 90 ? "expiring" : "valid";

          return {
            id: String(c.id),
            name: String(c.certificate_number || c.certificate_type || "Certificate"),
            type: String(c.certificate_type || "N/A"),
            vesselName: "N/A",
            issuingAuthority: String(c.issuing_authority || "N/A"),
            issueDate: issue.toISOString().split("T")[0],
            expiryDate: expiry.toISOString().split("T")[0],
            status,
            daysRemaining,
          };
        });

        setCertificates(mapped);
      } catch (err) {
        logger.error("Error fetching certificates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVessel, setFilterVessel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusBadge = (status: Certificate["status"]) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-success/10 text-success border-success/20">Válido</Badge>;
      case "expiring":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Vencendo</Badge>;
      case "expired":
        return <Badge variant="destructive">Vencido</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getProgressColor = (daysRemaining: number) => {
    if (daysRemaining > 180) return "bg-success";
    if (daysRemaining > 30) return "bg-warning";
    return "bg-destructive";
  };

  const vessels = [...new Set(certificates.map(c => c.vesselName))];

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVessel = filterVessel === "all" || cert.vesselName === filterVessel;
    const matchesStatus = filterStatus === "all" || cert.status === filterStatus;
    return matchesSearch && matchesVessel && matchesStatus;
  });

  const stats = {
    total: certificates.length,
    valid: certificates.filter(c => c.status === "valid").length,
    expiring: certificates.filter(c => c.status === "expiring").length,
    expired: certificates.filter(c => c.status === "expired").length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Certificados</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Válidos</p>
                <p className="text-3xl font-bold text-success">{stats.valid}</p>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencendo (90 dias)</p>
                <p className="text-3xl font-bold text-warning">{stats.expiring}</p>
              </div>
              <div className="p-3 rounded-full bg-warning/10">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <p className="text-3xl font-bold text-destructive">{stats.expired}</p>
              </div>
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar certificados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterVessel} onValueChange={setFilterVessel}>
              <SelectTrigger className="w-[200px]">
                <Ship className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Embarcação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Embarcações</SelectItem>
                {vessels.map(vessel => (
                  <SelectItem key={vessel} value={vessel}>{vessel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="valid">Válidos</SelectItem>
                <SelectItem value="expiring">Vencendo</SelectItem>
                <SelectItem value="expired">Vencidos</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              const csv = "Nome,Tipo,Embarcação,Emissão,Vencimento,Status,Dias Restantes\n" + filteredCertificates.map(c => `${c.name},${c.type},${c.vesselName},${c.issueDate},${c.expiryDate},${c.status},${c.daysRemaining}`).join("\n");
              const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `certificados-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
              toast.success("Certificados exportados para CSV");
            }}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <div className="space-y-3">
        {filteredCertificates.map((cert) => (
          <Card key={cert.id} className={`overflow-hidden ${cert.status === "expired" ? "border-destructive/50" : cert.status === "expiring" ? "border-warning/50" : ""}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    cert.status === "valid" ? "bg-success/10" :
                    cert.status === "expiring" ? "bg-warning/10" : "bg-destructive/10"
                  }`}>
                    <Award className={`h-6 w-6 ${
                      cert.status === "valid" ? "text-success" :
                      cert.status === "expiring" ? "text-warning" : "text-destructive"
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{cert.name}</h3>
                      <Badge variant="outline">{cert.type}</Badge>
                      {getStatusBadge(cert.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Ship className="h-3 w-3" />
                        {cert.vesselName}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {cert.issuingAuthority}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Emissão: {new Date(cert.issueDate).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right min-w-[120px]">
                    <p className="font-medium">
                      {new Date(cert.expiryDate).toLocaleDateString("pt-BR")}
                    </p>
                    <p className={`text-sm ${
                      cert.daysRemaining > 180 ? "text-success" :
                      cert.daysRemaining > 0 ? "text-warning" : "text-destructive"
                    }`}>
                      {cert.daysRemaining > 0 
                        ? `${cert.daysRemaining} dias restantes`
                        : `Vencido há ${Math.abs(cert.daysRemaining)} dias`}
                    </p>
                  </div>

                  <div className="w-20">
                    <Progress 
                      value={Math.max(0, Math.min(100, (cert.daysRemaining / 365) * 100))} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { window.history.pushState({}, '', '/compliance-hub'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { window.history.pushState({}, '', '/compliance-hub'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { window.history.pushState({}, '', '/workbench?tab=documents'); window.dispatchEvent(new PopStateEvent('popstate')); toast.success(`Navegando para Document Center para ${cert.name}`); }}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default CertificateTracker;
