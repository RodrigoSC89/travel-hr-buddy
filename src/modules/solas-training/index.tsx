import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LayoutDashboard, Calendar, Users, FileText, Brain, Bell, Settings, CheckCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TrainingDashboard from "./components/TrainingDashboard";
import DrillsCalendar from "./components/DrillsCalendar";
import CrewTraining from "./components/CrewTraining";
import CertificationsTab from "./components/CertificationsTab";
import ReportsTab from "./components/ReportsTab";
import { mockDrills, mockCrewMembers, mockCertifications, mockAlerts } from "./data/mockData";
import { Drill, Certification, CrewMember, TrainingAlert } from "./types";

export default function SolasTraining() {
  const [drills, setDrills] = useState(mockDrills);
  const [alerts, setAlerts] = useState(mockAlerts);
  const { toast } = useToast();

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const handleStartDrill = (drill: Drill) => {
    setDrills(prev => prev.map(d => d.id === drill.id ? { ...d, status: "scheduled" as const } : d));
    toast({ title: "Drill Iniciado", description: `${drill.name} foi iniciado com sucesso.` });
  };

  const handleScheduleDrill = (drill: Drill, date: Date) => {
    setDrills(prev => prev.map(d => d.id === drill.id ? { ...d, scheduledDate: date.toISOString(), status: "scheduled" as const } : d));
  };

  const handleViewReport = (drill: Drill) => {
    toast({ title: "Relatório", description: `Visualizando relatório de ${drill.name}` });
  };

  const handleViewDetails = (member: CrewMember) => {};
  const handleViewCertificate = (cert: Certification) => {};
  const handleScheduleRenewal = (cert: Certification) => {
    toast({ title: "Renovação Agendada", description: `Renovação de ${cert.name} foi agendada.` });
  };
  const handleRenewCertificate = (cert: Certification) => handleScheduleRenewal(cert);
  const handleUploadCertificate = (cert: Certification, file: File) => {
    toast({ title: "Upload Concluído", description: `Certificado atualizado com sucesso.` });
  };

  const handleMarkAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    toast({ title: "Notificações", description: "Todas as notificações foram marcadas como lidas." });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-r from-orange-500/10 via-red-500/10 to-amber-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  SOLAS & ISM Training
                  <Badge variant="secondary" className="ml-2"><Brain className="h-3 w-3 mr-1" />AI-Powered</Badge>
                </h1>
                <p className="text-muted-foreground">Central de treinamentos, drills e certificações STCW</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar Lidas
              </Button>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadAlerts > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">{unreadAlerts}</span>}
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">Dashboard</span></TabsTrigger>
            <TabsTrigger value="drills" className="flex items-center gap-2"><Calendar className="h-4 w-4" /><span className="hidden sm:inline">Drills</span></TabsTrigger>
            <TabsTrigger value="crew" className="flex items-center gap-2"><Users className="h-4 w-4" /><span className="hidden sm:inline">Tripulação</span></TabsTrigger>
            <TabsTrigger value="certs" className="flex items-center gap-2"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Certificações</span></TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Relatórios</span></TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><TrainingDashboard /></TabsContent>
          <TabsContent value="drills"><DrillsCalendar drills={drills} onStartDrill={handleStartDrill} onScheduleDrill={handleScheduleDrill} onViewReport={handleViewReport} /></TabsContent>
          <TabsContent value="crew"><CrewTraining crewMembers={mockCrewMembers} certifications={mockCertifications} onViewDetails={handleViewDetails} onViewCertificate={handleViewCertificate} onScheduleRenewal={handleScheduleRenewal} /></TabsContent>
          <TabsContent value="certs"><CertificationsTab certifications={mockCertifications} crewMembers={mockCrewMembers} onViewCertificate={handleViewCertificate} onRenewCertificate={handleRenewCertificate} onUploadCertificate={handleUploadCertificate} /></TabsContent>
          <TabsContent value="reports"><ReportsTab drills={drills} certifications={mockCertifications} crewMembers={mockCrewMembers} /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
