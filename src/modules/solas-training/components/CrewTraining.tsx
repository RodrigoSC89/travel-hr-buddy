import { useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Award,
  Calendar,
  User,
} from "lucide-react";
import { CrewMember, Certification, DrillParticipation } from "../types";
import { format, parseISO, differenceInDays } from "date-fns";

interface CrewTrainingProps {
  crewMembers: CrewMember[];
  certifications: Certification[];
  onViewDetails: (member: CrewMember) => void;
  onViewCertificate: (cert: Certification) => void;
  onScheduleRenewal: (cert: Certification) => void;
}

export default function CrewTraining({ 
  crewMembers, 
  certifications, 
  onViewDetails,
  onViewCertificate,
  onScheduleRenewal 
}: CrewTrainingProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCertDialog, setShowCertDialog] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  const getMemberCertifications = (memberId: string) => {
    return certifications.filter(c => c.crewMemberId === memberId);
  };

  const getComplianceScore = (memberId: string) => {
    const memberCerts = getMemberCertifications(memberId);
    if (memberCerts.length === 0) return 0;
    const validCerts = memberCerts.filter(c => c.status === "valid").length;
    return Math.round((validCerts / memberCerts.length) * 100);
  };

  const filteredMembers = crewMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || member.trainingStatus === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleViewDetails = (member: CrewMember) => {
    setSelectedMember(member);
    setShowDetailsDialog(true);
    onViewDetails(member);
  };

  const handleViewCertificate = (cert: Certification) => {
    setSelectedCert(cert);
    setShowCertDialog(true);
    onViewCertificate(cert);
  };

  const stats = {
    total: crewMembers.length,
    compliant: crewMembers.filter(m => m.trainingStatus === "compliant").length,
    expiring: crewMembers.filter(m => m.trainingStatus === "expiring").length,
    nonCompliant: crewMembers.filter(m => m.trainingStatus === "non-compliant").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tripulação</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformes</p>
                <p className="text-2xl font-bold text-green-600">{stats.compliant}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expirando</p>
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
                <p className="text-sm text-muted-foreground">Não Conformes</p>
                <p className="text-2xl font-bold text-red-600">{stats.nonCompliant}</p>
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
                placeholder="Buscar tripulante..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="deck">Convés</SelectItem>
                <SelectItem value="engine">Máquinas</SelectItem>
                <SelectItem value="catering">Cozinha</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="compliant">Conforme</SelectItem>
                <SelectItem value="expiring">Expirando</SelectItem>
                <SelectItem value="non-compliant">Não Conforme</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Crew Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tripulação e Certificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tripulante</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Conformidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map(member => {
                  const complianceScore = getComplianceScore(member.id);
                  const memberCerts = getMemberCertifications(member.id);
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.photoUrl} />
                            <AvatarFallback>{member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{memberCerts.length} certificações</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.position}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {member.department === "deck" ? "Convés" :
                            member.department === "engine" ? "Máquinas" :
                              member.department === "catering" ? "Cozinha" : "Hotel"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={complianceScore} className="w-20" />
                          <span className="text-sm">{complianceScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          member.trainingStatus === "compliant" ? "default" :
                            member.trainingStatus === "expiring" ? "secondary" : "destructive"
                        }>
                          {member.trainingStatus === "compliant" ? "Conforme" :
                            member.trainingStatus === "expiring" ? "Expirando" : "Não Conforme"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(member)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Member Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {selectedMember?.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {selectedMember?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedMember?.position} • {selectedMember?.department === "deck" ? "Convés" : 
                selectedMember?.department === "engine" ? "Máquinas" : "Outro"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Data de Admissão</p>
                <p className="font-medium">{selectedMember?.joinDate ? format(parseISO(selectedMember.joinDate), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status de Treinamento</p>
                <Badge variant={
                  selectedMember?.trainingStatus === "compliant" ? "default" :
                    selectedMember?.trainingStatus === "expiring" ? "secondary" : "destructive"
                }>
                  {selectedMember?.trainingStatus === "compliant" ? "Conforme" :
                    selectedMember?.trainingStatus === "expiring" ? "Expirando" : "Não Conforme"}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certificações STCW
              </h4>
              <div className="space-y-2">
                {selectedMember && getMemberCertifications(selectedMember.id).map(cert => {
                  const daysUntilExpiry = differenceInDays(parseISO(cert.expiryDate), new Date());
                  return (
                    <div key={cert.id} className={`p-3 rounded-lg border ${
                      cert.status === "expired" ? "bg-destructive/5 border-destructive/30" :
                        cert.status === "expiring" ? "bg-amber-500/5 border-amber-500/30" : ""
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-sm text-muted-foreground">{cert.code}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            cert.status === "valid" ? "outline" :
                              cert.status === "expiring" ? "secondary" : "destructive"
                          }>
                            {cert.status === "valid" ? "Válido" :
                              cert.status === "expiring" ? `Expira em ${daysUntilExpiry} dias` : "Expirado"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Válido até: {format(parseISO(cert.expiryDate), "dd/MM/yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewCertificate(cert)}>
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        {(cert.status === "expiring" || cert.status === "expired") && (
                          <Button variant="ghost" size="sm" onClick={() => onScheduleRenewal(cert)}>
                            <Calendar className="h-3 w-3 mr-1" />
                            Agendar Renovação
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Fechar</Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exportar Perfil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Certificate Dialog */}
      <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {selectedCert?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Código</p>
                <p className="font-medium">{selectedCert?.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={
                  selectedCert?.status === "valid" ? "outline" :
                    selectedCert?.status === "expiring" ? "secondary" : "destructive"
                }>
                  {selectedCert?.status === "valid" ? "Válido" :
                    selectedCert?.status === "expiring" ? "Expirando" : "Expirado"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Emissão</p>
                <p className="font-medium">{selectedCert?.issueDate ? format(parseISO(selectedCert.issueDate), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Validade</p>
                <p className="font-medium">{selectedCert?.expiryDate ? format(parseISO(selectedCert.expiryDate), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Autoridade Emissora</p>
                <p className="font-medium">{selectedCert?.issuingAuthority}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCertDialog(false)}>Fechar</Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Baixar Certificado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
