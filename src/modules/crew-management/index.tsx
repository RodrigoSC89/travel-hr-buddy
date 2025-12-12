import { useEffect, useState, useCallback } from "react";;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, RefreshCw, Brain, Award, Activity } from "lucide-react";
import { motion } from "framer-motion";

import { CrewMetrics } from "./components/CrewMetrics";
import { CrewList } from "./components/CrewList";
import { CertificationsPanel } from "./components/CertificationsPanel";
import { CrewAICopilot } from "./components/CrewAICopilot";
import { InsightsPanel } from "./components/InsightsPanel";
import { AddCrewDialog } from "./components/AddCrewDialog";

interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  status: string | null;
  employee_id: string;
  nationality: string;
  email?: string | null;
  phone?: string | null;
  join_date?: string | null;
  years_experience?: number;
}

interface Certificate {
  id: string;
  employee_id: string;
  certificate_name: string;
  issue_date: string;
  expiry_date: string;
  status: string | null;
}

const CrewManagement = () => {
  const { toast } = useToast();
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: crewData, error: crewError } = await supabase
        .from("crew_members")
        .select("id, full_name, position, status, employee_id, nationality, email, phone, join_date")
        .order("full_name")
        .limit(100);

      if (crewError) throw crewError;
      setCrewMembers((crewData as unknown as CrewMember[]) || []);

      const { data: certData, error: certError } = await supabase
        .from("employee_certificates")
        .select("id, employee_id, certificate_name, issue_date, expiry_date, status")
        .order("expiry_date", { ascending: true })
        .limit(200);

      if (certError) throw certError;
      setCertificates((certData as unknown as Certificate[]) || []);

    } catch (error) {
      console.error("Error loading crew data:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados da tripulação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCrew = crewMembers.filter(m => m.status === "active").length;
  const onLeaveCrew = crewMembers.filter(m => m.status === "on_leave").length;
  
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringCerts = certificates.filter(cert => {
    const expiry = new Date(cert.expiry_date);
    return expiry <= thirtyDaysFromNow && expiry >= today;
  }).length;

  const handleExport = () => {
    toast({ title: "Exportando...", description: "Gerando relatório da tripulação" });
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground">Carregando dados da tripulação...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Gestão de Tripulação</h1>
            <p className="text-muted-foreground">Controle completo da tripulação, certificações e escalas</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </motion.div>

      {/* Metrics */}
      <CrewMetrics
        totalCrew={crewMembers.length}
        activeCrew={activeCrew}
        onLeaveCrew={onLeaveCrew}
        expiringCerts={expiringCerts}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Lista de Tripulação
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Análise IA 2.0
              </TabsTrigger>
              <TabsTrigger value="insights-legacy">Insights</TabsTrigger>
              <TabsTrigger value="certifications" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certificações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <CrewList
                crewMembers={crewMembers}
                onViewMember={setSelectedMember}
                onAddMember={() => setShowAddDialog(true}
                onExport={handleExport}
              />
            </TabsContent>

            <TabsContent value="insights">
              <InsightsPanel />
            </TabsContent>

            <TabsContent value="insights-legacy">
              <InsightsPanel />
            </TabsContent>

            <TabsContent value="certifications">
              <CertificationsPanel certificates={certificates} crewMembers={crewMembers} />
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Copilot Sidebar */}
        <div className="xl:col-span-1 h-[600px]">
          <CrewAICopilot crewData={crewMembers} certificates={certificates} />
        </div>
      </div>

      {/* Dialogs */}
      <AddCrewDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={loadData}
      />
    </div>
  );
};

export default CrewManagement;
