import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import {
  Search,
  User,
  FileText,
  Shield,
  Award,
  Clock,
  Calendar,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  History,
  Edit,
  Eye
} from "lucide-react";

interface CrewMember {
  id: string;
  name: string;
  initials: string;
  position: string;
  rank: string;
  status: "active" | "shore_leave" | "medical_leave" | "inactive";
  nationality: string;
  email: string;
  phone: string;
  employeeId: string;
  experienceYears: number;
  certifications: number;
  activeCertifications: number;
  expiringCertifications: number;
  dossierCompleteness: number;
  lastUpdated: string;
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
  documentUrl?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  size: string;
  category: "personal" | "professional" | "medical" | "training";
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user: string;
}

export const CrewDossierManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const crewMembers: CrewMember[] = [
    {
      id: "1",
      name: "João Silva",
      initials: "JS",
      position: "Comandante",
      rank: "Capitão",
      status: "active",
      nationality: "Brasileiro",
      email: "joao.silva@nautilus.com",
      phone: "+55 11 99999-9999",
      employeeId: "EMP001",
      experienceYears: 15,
      certifications: 12,
      activeCertifications: 10,
      expiringCertifications: 2,
      dossierCompleteness: 95,
      lastUpdated: "2024-03-10"
    },
    {
      id: "2",
      name: "Carlos Santos",
      initials: "CS",
      position: "Chefe de Máquinas",
      rank: "Oficial",
      status: "active",
      nationality: "Brasileiro",
      email: "carlos.santos@nautilus.com",
      phone: "+55 21 88888-8888",
      employeeId: "EMP002",
      experienceYears: 12,
      certifications: 10,
      activeCertifications: 8,
      expiringCertifications: 1,
      dossierCompleteness: 88,
      lastUpdated: "2024-03-08"
    },
    {
      id: "3",
      name: "Maria Oliveira",
      initials: "MO",
      position: "Oficial de Convés",
      rank: "Oficial",
      status: "shore_leave",
      nationality: "Brasileira",
      email: "maria.oliveira@nautilus.com",
      phone: "+55 11 77777-7777",
      employeeId: "EMP003",
      experienceYears: 8,
      certifications: 8,
      activeCertifications: 8,
      expiringCertifications: 0,
      dossierCompleteness: 100,
      lastUpdated: "2024-03-12"
    }
  ];

  const certificates: Certificate[] = [
    { id: "1", name: "STCW Basic Safety Training", issuer: "CIAGA", issueDate: "2022-01-15", expiryDate: "2027-01-15", status: "valid" },
    { id: "2", name: "Medical First Aid", issuer: "CIAGA", issueDate: "2022-03-20", expiryDate: "2024-03-20", status: "expiring" },
    { id: "3", name: "Advanced Fire Fighting", issuer: "CIAGA", issueDate: "2021-06-10", expiryDate: "2026-06-10", status: "valid" },
    { id: "4", name: "Survival Craft", issuer: "CIAGA", issueDate: "2020-08-05", expiryDate: "2024-08-05", status: "expiring" }
  ];

  const documents: Document[] = [
    { id: "1", name: "Passaporte", type: "PDF", uploadedAt: "2024-01-10", size: "1.2 MB", category: "personal" },
    { id: "2", name: "Caderneta de Inscrição e Registro (CIR)", type: "PDF", uploadedAt: "2024-01-10", size: "856 KB", category: "professional" },
    { id: "3", name: "Atestado de Saúde Ocupacional (ASO)", type: "PDF", uploadedAt: "2024-02-15", size: "420 KB", category: "medical" },
    { id: "4", name: "Certificado STCW", type: "PDF", uploadedAt: "2024-01-20", size: "1.5 MB", category: "training" }
  ];

  const activityLogs: ActivityLog[] = [
    { id: "1", action: "Documento atualizado", description: "ASO renovado", timestamp: "2024-03-10 14:30", user: "Sistema RH" },
    { id: "2", action: "Certificação adicionada", description: "Nova certificação STCW", timestamp: "2024-03-08 10:15", user: "Admin" },
    { id: "3", action: "Status alterado", description: "Embarcado no Navio Aurora", timestamp: "2024-03-01 08:00", user: "Coordenação" }
  ];

  const getStatusBadge = (status: CrewMember["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Ativo</Badge>;
      case "shore_leave":
        return <Badge className="bg-warning text-warning-foreground">Licença Terra</Badge>;
      case "medical_leave":
        return <Badge className="bg-orange-500 text-white">Licença Médica</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inativo</Badge>;
    }
  };

  const getCertStatusBadge = (status: Certificate["status"]) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-success text-success-foreground">Válido</Badge>;
      case "expiring":
        return <Badge className="bg-warning text-warning-foreground">Expirando</Badge>;
      case "expired":
        return <Badge variant="destructive">Expirado</Badge>;
    }
  };

  const getCategoryIcon = (category: Document["category"]) => {
    switch (category) {
      case "personal": return <User className="h-4 w-4" />;
      case "professional": return <Briefcase className="h-4 w-4" />;
      case "medical": return <Heart className="h-4 w-4" />;
      case "training": return <GraduationCap className="h-4 w-4" />;
    }
  };

  const filteredMembers = crewMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDossier = (member: CrewMember) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Dossiês</p>
                <p className="text-2xl font-bold">{crewMembers.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completos</p>
                <p className="text-2xl font-bold text-success">
                  {crewMembers.filter(m => m.dossierCompleteness === 100).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendências</p>
                <p className="text-2xl font-bold text-warning">
                  {crewMembers.filter(m => m.dossierCompleteness < 100).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cert. Expirando</p>
                <p className="text-2xl font-bold text-destructive">
                  {crewMembers.reduce((acc, m) => acc + m.expiringCertifications, 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dossier List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dossiês de Tripulação
              </CardTitle>
              <CardDescription>Gestão completa de documentos e certificações</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar Documentos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cargo ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openDossier(member)}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{member.name}</h4>
                        {getStatusBadge(member.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.position}</p>
                      <p className="text-xs text-muted-foreground">ID: {member.employeeId}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Completude do Dossiê</span>
                        <span className="text-xs font-medium">{member.dossierCompleteness}%</span>
                      </div>
                      <Progress value={member.dossierCompleteness} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-primary" />
                        <span>{member.activeCertifications}/{member.certifications} cert.</span>
                      </div>
                      {member.expiringCertifications > 0 && (
                        <Badge variant="outline" className="text-warning border-warning">
                          {member.expiringCertifications} expirando
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Eye className="h-4 w-4" />
                      Ver Dossiê
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dossier Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedMember && (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedMember.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span>{selectedMember.name}</span>
                    <p className="text-sm font-normal text-muted-foreground">
                      {selectedMember.position} • {selectedMember.employeeId}
                    </p>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="certificates">Certificações</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] mt-4">
              <TabsContent value="overview" className="mt-0">
                {selectedMember && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Email</p>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{selectedMember.email}</span>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{selectedMember.phone}</span>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Nacionalidade</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{selectedMember.nationality}</span>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Experiência</p>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span className="text-sm">{selectedMember.experienceYears} anos</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium">Completude do Dossiê</span>
                        <span className="font-bold text-lg">{selectedMember.dossierCompleteness}%</span>
                      </div>
                      <Progress value={selectedMember.dossierCompleteness} className="h-3" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg text-center">
                        <Award className="h-8 w-8 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{selectedMember.certifications}</p>
                        <p className="text-sm text-muted-foreground">Certificações</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <CheckCircle className="h-8 w-8 mx-auto text-success mb-2" />
                        <p className="text-2xl font-bold text-success">{selectedMember.activeCertifications}</p>
                        <p className="text-sm text-muted-foreground">Ativas</p>
                      </div>
                      <div className="p-4 border rounded-lg text-center">
                        <AlertTriangle className="h-8 w-8 mx-auto text-warning mb-2" />
                        <p className="text-2xl font-bold text-warning">{selectedMember.expiringCertifications}</p>
                        <p className="text-sm text-muted-foreground">Expirando</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="certificates" className="mt-0">
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p>Validade: {cert.expiryDate}</p>
                        </div>
                        {getCertStatusBadge(cert.status)}
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded">
                          {getCategoryIcon(doc.category)}
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.type} • {doc.size} • {doc.uploadedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <div className="space-y-3">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-4 border rounded-lg">
                      <History className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{log.action}</p>
                          <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{log.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Por: {log.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrewDossierManager;
