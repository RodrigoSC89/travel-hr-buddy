import { useState, useMemo, useCallback } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Search,
  Download,
  Eye,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Award,
  Upload,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Certification, CrewMember } from "../types";
import { format, parseISO, differenceInDays } from "date-fns";

interface CertificationsTabProps {
  certifications: Certification[];
  crewMembers: CrewMember[];
  onViewCertificate: (cert: Certification) => void;
  onRenewCertificate: (cert: Certification) => void;
  onUploadCertificate: (cert: Certification, file: File) => void;
}

const stcwCategories = [
  { code: "A-VI/1", name: "Basic Safety Training" },
  { code: "A-VI/2-1", name: "Proficiency in Survival Craft" },
  { code: "A-VI/3", name: "Advanced Fire Fighting" },
  { code: "A-VI/4-1", name: "Medical First Aid" },
  { code: "A-VI/4-2", name: "Medical Care" },
  { code: "A-VI/6-1", name: "Security Awareness" },
  { code: "A-VI/6-2", name: "Security Duties" },
];

export default function CertificationsTab({ 
  certifications, 
  crewMembers,
  onViewCertificate, 
  onRenewCertificate,
  onUploadCertificate
}: CertificationsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showRenewDialog, setShowRenewDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const { toast } = useToast();

  const getCrewMember = (id: string) => crewMembers.find(m => m.id === id);

  const filteredCerts = certifications.filter(cert => {
    const member = getCrewMember(cert.crewMemberId);
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || cert.code.includes(categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  };

  const stats = {
    total: certifications.length,
    valid: certifications.filter(c => c.status === "valid").length,
    expiring: certifications.filter(c => c.status === "expiring").length,
    expired: certifications.filter(c => c.status === "expired").length,
  };

  const handleRenew = (cert: Certification) => {
    setSelectedCert(cert);
    setShowRenewDialog(true);
  };

  const handleConfirmRenew = () => {
    if (selectedCert) {
      onRenewCertificate(selectedCert);
      toast({
        title: "Renovação Agendada",
        description: `A renovação de ${selectedCert.name} foi agendada com sucesso.`,
      });
      setShowRenewDialog(false);
      setSelectedCert(null);
    }
  };

  const handleView = (cert: Certification) => {
    setSelectedCert(cert);
    onViewCertificate(cert);
  };

  const handleUpload = (cert: Certification) => {
    setSelectedCert(cert);
    setShowUploadDialog(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedCert) {
      onUploadCertificate(selectedCert, file);
      toast({
        title: "Documento Enviado",
        description: "O certificado foi atualizado com sucesso.",
      });
      setShowUploadDialog(false);
    }
  };

  const groupedByStatus = {
    expired: filteredCerts.filter(c => c.status === "expired"),
    expiring: filteredCerts.filter(c => c.status === "expiring"),
    valid: filteredCerts.filter(c => c.status === "valid"),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Certificações</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Válidas</p>
                <p className="text-2xl font-bold text-green-600">{stats.valid}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirando (90 dias)</p>
                <p className="text-2xl font-bold text-amber-600">{stats.expiring}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expiradas</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar certificação, tripulante ou código..." 
                className="pl-10"
                value={searchTerm}
                onChange={handleChange}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="valid">Válidas</SelectItem>
                <SelectItem value="expiring">Expirando</SelectItem>
                <SelectItem value="expired">Expiradas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria STCW" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {stcwCategories.map(cat => (
                  <SelectItem key={cat.code} value={cat.code}>{cat.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certifications by Status */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({filteredCerts.length})</TabsTrigger>
          <TabsTrigger value="expired" className="text-destructive">
            Expiradas ({groupedByStatus.expired.length})
          </TabsTrigger>
          <TabsTrigger value="expiring" className="text-amber-600">
            Expirando ({groupedByStatus.expiring.length})
          </TabsTrigger>
          <TabsTrigger value="valid">Válidas ({groupedByStatus.valid.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <CertificationsList 
            certifications={filteredCerts} 
            crewMembers={crewMembers}
            onView={handleView}
            onRenew={handleRenew}
            onUpload={handleUpload}
          />
        </TabsContent>
        <TabsContent value="expired">
          <CertificationsList 
            certifications={groupedByStatus.expired} 
            crewMembers={crewMembers}
            onView={handleView}
            onRenew={handleRenew}
            onUpload={handleUpload}
          />
        </TabsContent>
        <TabsContent value="expiring">
          <CertificationsList 
            certifications={groupedByStatus.expiring} 
            crewMembers={crewMembers}
            onView={handleView}
            onRenew={handleRenew}
            onUpload={handleUpload}
          />
        </TabsContent>
        <TabsContent value="valid">
          <CertificationsList 
            certifications={groupedByStatus.valid} 
            crewMembers={crewMembers}
            onView={handleView}
            onRenew={handleRenew}
            onUpload={handleUpload}
          />
        </TabsContent>
      </Tabs>

      {/* Renew Dialog */}
      <Dialog open={showRenewDialog} onOpenChange={setShowRenewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Agendar Renovação
            </DialogTitle>
            <DialogDescription>
              Agende a renovação da certificação {selectedCert?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Certificação</p>
              <p className="font-medium">{selectedCert?.name}</p>
              <p className="text-sm text-muted-foreground">{selectedCert?.code}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Preferencial</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porto">No Porto</SelectItem>
                    <SelectItem value="bordo">A Bordo</SelectItem>
                    <SelectItem value="centro">Centro de Treinamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowRenewDialog}>Cancelar</Button>
            <Button onClick={handleConfirmRenew}>
              <Calendar className="h-4 w-4 mr-2" />
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Atualizar Certificado
            </DialogTitle>
            <DialogDescription>
              Faça upload do novo documento de certificação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste o arquivo ou clique para selecionar
              </p>
              <Input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="max-w-xs mx-auto"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowUploadDialog}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CertificationsList({ 
  certifications, 
  crewMembers,
  onView,
  onRenew,
  onUpload
}: { 
  certifications: Certification[];
  crewMembers: CrewMember[];
  onView: (cert: Certification) => void;
  onRenew: (cert: Certification) => void;
  onUpload: (cert: Certification) => void;
}) {
  const getCrewMember = (id: string) => crewMembers.find(m => m.id === id);

  if (certifications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma certificação encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {certifications.map(cert => {
              const member = getCrewMember(cert.crewMemberId);
              const daysUntilExpiry = differenceInDays(parseISO(cert.expiryDate), new Date());
              
              return (
                <div key={cert.id} className={`p-4 rounded-lg border ${
                  cert.status === "expired" ? "bg-destructive/5 border-destructive/30" :
                    cert.status === "expiring" ? "bg-amber-500/5 border-amber-500/30" : ""
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{cert.name}</h4>
                        <Badge variant="outline">{cert.code}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Tripulante: {member?.name || "N/A"} • {member?.position}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Emissão: {format(parseISO(cert.issueDate), "dd/MM/yyyy")}</span>
                        <span>Validade: {format(parseISO(cert.expiryDate), "dd/MM/yyyy")}</span>
                        <span>{cert.issuingAuthority}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        cert.status === "valid" ? "outline" :
                          cert.status === "expiring" ? "secondary" : "destructive"
                      }>
                        {cert.status === "valid" ? "Válido" :
                          cert.status === "expiring" ? `Expira em ${daysUntilExpiry} dias` : "Expirado"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" size="sm" onClick={() => handleonView}>
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Certificado
                    </Button>
                    {(cert.status === "expiring" || cert.status === "expired") && (
                      <Button variant="ghost" size="sm" onClick={() => handleonRenew}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Renovar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleonUpload}>
                      <Upload className="h-4 w-4 mr-1" />
                      Atualizar Doc
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
