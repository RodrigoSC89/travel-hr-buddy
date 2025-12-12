import { memo, memo, useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Calendar,
  FileText,
  Download,
  Bell,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Certificate {
  id: string;
  employee_id: string;
  employee_name?: string;
  certificate_name: string;
  certificate_type?: string;
  issue_date: string;
  expiry_date: string;
  status: string | null;
  issuing_authority?: string;
}

interface CertificationsPanelProps {
  certificates: Certificate[];
  crewMembers: { id: string; full_name: string; employee_id: string }[];
}

export const CertificationsPanel = memo(function({ certificates, crewMembers }: CertificationsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const enrichedCertificates = certificates.map(cert => {
    const crew = crewMembers.find(c => c.employee_id === cert.employee_id || c.id === cert.employee_id);
    return {
      ...cert,
      employee_name: crew?.full_name || "Desconhecido",
    };
  });

  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

  const categorizedCerts = {
    all: enrichedCertificates,
    expired: enrichedCertificates.filter(c => isPast(new Date(c.expiry_date))),
    expiring30: enrichedCertificates.filter(c => {
      const expiry = new Date(c.expiry_date);
      return isFuture(expiry) && expiry <= thirtyDaysFromNow;
    }),
    expiring60: enrichedCertificates.filter(c => {
      const expiry = new Date(c.expiry_date);
      return expiry > thirtyDaysFromNow && expiry <= sixtyDaysFromNow;
    }),
    valid: enrichedCertificates.filter(c => {
      const expiry = new Date(c.expiry_date);
      return expiry > sixtyDaysFromNow;
    }),
  };

  const filteredCerts = categorizedCerts[activeTab as keyof typeof categorizedCerts]?.filter(cert =>
    cert.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.certificate_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getCertStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);

    if (isPast(expiry)) {
      return { label: "Vencido", variant: "destructive" as const, icon: AlertTriangle, color: "text-rose-500" };
    }
    if (daysUntilExpiry <= 30) {
      return { label: `${daysUntilExpiry} dias`, variant: "default" as const, icon: Clock, color: "text-amber-500" };
    }
    if (daysUntilExpiry <= 60) {
      return { label: `${daysUntilExpiry} dias`, variant: "secondary" as const, icon: Clock, color: "text-yellow-500" };
    }
    return { label: "Válido", variant: "outline" as const, icon: CheckCircle, color: "text-emerald-500" };
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Certificações</CardTitle>
            <CardDescription>Controle de certificados e vencimentos da tripulação</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Configurar Alertas
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-3 border-rose-500/30 bg-rose-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vencidos</p>
                <p className="text-2xl font-bold text-rose-500">{categorizedCerts.expired.length}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
          </Card>
          <Card className="p-3 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vencendo (30d)</p>
                <p className="text-2xl font-bold text-amber-500">{categorizedCerts.expiring30.length}</p>
              </div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </Card>
          <Card className="p-3 border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Atenção (60d)</p>
                <p className="text-2xl font-bold text-yellow-600">{categorizedCerts.expiring60.length}</p>
              </div>
              <Calendar className="h-5 w-5 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-3 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Dia</p>
                <p className="text-2xl font-bold text-emerald-500">{categorizedCerts.valid.length}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
          </Card>
        </div>

        {/* Tabs and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList>
              <TabsTrigger value="all">
                Todos ({categorizedCerts.all.length})
              </TabsTrigger>
              <TabsTrigger value="expired" className="text-rose-500">
                Vencidos ({categorizedCerts.expired.length})
              </TabsTrigger>
              <TabsTrigger value="expiring30">
                30 dias ({categorizedCerts.expiring30.length})
              </TabsTrigger>
              <TabsTrigger value="valid">
                Válidos ({categorizedCerts.valid.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar certificado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Certificates List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredCerts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-muted-foreground"
              >
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum certificado encontrado</p>
              </motion.div>
            ) : (
              filteredCerts.map((cert, index) => {
                const status = getCertStatus(cert.expiry_date);
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.02 }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        status.variant === "destructive" ? "bg-rose-500/10" :
                          status.variant === "default" ? "bg-amber-500/10" :
                            "bg-muted"
                      }`}>
                        <FileText className={`h-4 w-4 ${status.color}`} />
                      </div>
                      <div>
                        <p className="font-medium">{cert.certificate_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {cert.employee_name} • Emitido: {format(new Date(cert.issue_date), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-sm text-muted-foreground">Vencimento</p>
                        <p className="font-medium">{format(new Date(cert.expiry_date), "dd/MM/yyyy", { locale: ptBR })}</p>
                      </div>
                      <Badge variant={status.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
