import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Shield, 
  Calendar,
  Plus,
  Trash2,
  Edit,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  X
} from "lucide-react";

interface Certificate {
  id: string;
  name: string;
  type: string;
  vesselId?: string;
  vesselName?: string;
  issuedDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
  issuingAuthority: string;
  documentUrl?: string;
}

const CERTIFICATE_TYPES = [
  "IOPP Certificate",
  "Safety Management Certificate",
  "Safety Equipment Certificate",
  "Safety Radio Certificate",
  "Safety Construction Certificate",
  "Load Line Certificate",
  "Tonnage Certificate",
  "DOC - Document of Compliance",
  "SMC - Safety Management Certificate",
  "ISSC - International Ship Security Certificate",
  "MLC Certificate",
  "Ballast Water Certificate",
  "Anti-Fouling Certificate",
  "CLC Certificate",
  "Bunker Convention Certificate",
  "Other"
];

const ISSUING_AUTHORITIES = [
  "DNV",
  "Lloyd's Register",
  "Bureau Veritas",
  "ABS",
  "ClassNK",
  "RINA",
  "Marinha do Brasil",
  "ANTAQ",
  "IMO",
  "Flag State",
  "Other"
];

// Mock data for demonstration
const initialCertificates: Certificate[] = [
  {
    id: "1",
    name: "IOPP Certificate",
    type: "IOPP Certificate",
    vesselName: "MV Atlantic Star",
    issuedDate: "2024-01-15",
    expiryDate: "2029-01-15",
    status: "valid",
    issuingAuthority: "DNV"
  },
  {
    id: "2",
    name: "Safety Management Certificate",
    type: "SMC - Safety Management Certificate",
    vesselName: "MV Pacific Voyager",
    issuedDate: "2023-06-01",
    expiryDate: "2025-03-01",
    status: "expiring",
    issuingAuthority: "Lloyd's Register"
  },
  {
    id: "3",
    name: "MLC Certificate",
    type: "MLC Certificate",
    vesselName: "MV Atlantic Star",
    issuedDate: "2022-08-15",
    expiryDate: "2024-08-15",
    status: "expired",
    issuingAuthority: "Marinha do Brasil"
  }
];

const DocumentationCenter: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    vesselName: "",
    issuedDate: "",
    expiryDate: "",
    issuingAuthority: "",
    documentUrl: ""
  });

  const getStatusFromDates = (expiryDate: string): "valid" | "expiring" | "expired" => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= 90) return "expiring";
    return "valid";
  };

  const handleCreate = () => {
    if (!formData.name || !formData.type || !formData.expiryDate) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const newCertificate: Certificate = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      vesselName: formData.vesselName,
      issuedDate: formData.issuedDate || new Date().toISOString().split('T')[0],
      expiryDate: formData.expiryDate,
      status: getStatusFromDates(formData.expiryDate),
      issuingAuthority: formData.issuingAuthority,
      documentUrl: formData.documentUrl
    };

    setCertificates(prev => [...prev, newCertificate]);
    setIsCreateOpen(false);
    setFormData({ name: "", type: "", vesselName: "", issuedDate: "", expiryDate: "", issuingAuthority: "", documentUrl: "" });
    toast.success("Certificado adicionado com sucesso!");
  };

  const handleEdit = () => {
    if (!selectedCertificate) return;

    setCertificates(prev => prev.map(cert => 
      cert.id === selectedCertificate.id 
        ? {
            ...cert,
            name: formData.name || cert.name,
            type: formData.type || cert.type,
            vesselName: formData.vesselName || cert.vesselName,
            issuedDate: formData.issuedDate || cert.issuedDate,
            expiryDate: formData.expiryDate || cert.expiryDate,
            status: getStatusFromDates(formData.expiryDate || cert.expiryDate),
            issuingAuthority: formData.issuingAuthority || cert.issuingAuthority
          }
        : cert
    ));
    setIsEditOpen(false);
    setSelectedCertificate(null);
    toast.success("Certificado atualizado com sucesso!");
  };

  const handleDelete = () => {
    if (!selectedCertificate) return;
    setCertificates(prev => prev.filter(cert => cert.id !== selectedCertificate.id));
    setIsDeleteOpen(false);
    setSelectedCertificate(null);
    toast.success("Certificado excluído com sucesso!");
  };

  const openEditDialog = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setFormData({
      name: certificate.name,
      type: certificate.type,
      vesselName: certificate.vesselName || "",
      issuedDate: certificate.issuedDate,
      expiryDate: certificate.expiryDate,
      issuingAuthority: certificate.issuingAuthority,
      documentUrl: certificate.documentUrl || ""
    });
    setIsEditOpen(true);
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cert.vesselName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cert.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: certificates.length,
    valid: certificates.filter(c => c.status === "valid").length,
    expiring: certificates.filter(c => c.status === "expiring").length,
    expired: certificates.filter(c => c.status === "expired").length
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-info opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Válidos</p>
                <p className="text-2xl font-bold text-success">{stats.valid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencendo</p>
                <p className="text-2xl font-bold text-warning">{stats.expiring}</p>
              </div>
              <Clock className="h-8 w-8 text-warning opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirados</p>
                <p className="text-2xl font-bold text-destructive">{stats.expired}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Centro de Documentação
              </CardTitle>
              <CardDescription>
                Gestão centralizada de certificados e documentos da frota
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Certificado
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar certificados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="valid">Válidos</SelectItem>
                <SelectItem value="expiring">Vencendo</SelectItem>
                <SelectItem value="expired">Expirados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Certificates List */}
          <ScrollArea className="h-[400px]">
            {filteredCertificates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum certificado encontrado</p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Certificado
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        cert.status === "valid" ? "bg-success/10" :
                        cert.status === "expiring" ? "bg-warning/10" :
                        "bg-destructive/10"
                      }`}>
                        <FileText className={`h-5 w-5 ${
                          cert.status === "valid" ? "text-success" :
                          cert.status === "expiring" ? "text-warning" :
                          "text-destructive"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{cert.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{cert.vesselName}</span>
                          <span>•</span>
                          <span>{cert.issuingAuthority}</span>
                          <span>•</span>
                          <span>Vence: {new Date(cert.expiryDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        cert.status === "valid" ? "default" :
                        cert.status === "expiring" ? "secondary" :
                        "destructive"
                      }>
                        {cert.status === "valid" ? "Válido" :
                         cert.status === "expiring" ? "Vencendo" : "Expirado"}
                      </Badge>
                      <Button variant="ghost" size="icon" title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Editar" onClick={() => openEditDialog(cert)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedCertificate(cert);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Certificado</DialogTitle>
            <DialogDescription>
              Adicione um novo certificado ou documento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Certificado *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: IOPP Certificate"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Input
                value={formData.vesselName}
                onChange={(e) => setFormData(prev => ({ ...prev, vesselName: e.target.value }))}
                placeholder="Nome da embarcação"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Emissão</Label>
                <Input
                  type="date"
                  value={formData.issuedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issuedDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade *</Label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Autoridade Emissora</Label>
              <Select value={formData.issuingAuthority} onValueChange={(v) => setFormData(prev => ({ ...prev, issuingAuthority: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ISSUING_AUTHORITIES.map((auth) => (
                    <SelectItem key={auth} value={auth}>{auth}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Certificado</DialogTitle>
            <DialogDescription>
              Atualize as informações do certificado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Certificado</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Embarcação</Label>
              <Input
                value={formData.vesselName}
                onChange={(e) => setFormData(prev => ({ ...prev, vesselName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Emissão</Label>
                <Input
                  type="date"
                  value={formData.issuedDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issuedDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Validade</Label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Autoridade Emissora</Label>
              <Select value={formData.issuingAuthority} onValueChange={(v) => setFormData(prev => ({ ...prev, issuingAuthority: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISSUING_AUTHORITIES.map((auth) => (
                    <SelectItem key={auth} value={auth}>{auth}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o certificado "{selectedCertificate?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentationCenter;
