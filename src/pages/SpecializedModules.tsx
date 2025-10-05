import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Heart, 
  Leaf, 
  Dna, 
  Shield, 
  Anchor,
  FileCheck,
  TrendingUp,
  AlertTriangle,
  Code,
  MessageSquare,
  ClipboardCheck
} from 'lucide-react';
import { TrainingExercisesDashboard } from '@/components/maritime/training/training-exercises-dashboard';
import { MedicalHealthDashboard } from '@/components/maritime/medical/medical-health-dashboard';
import { WasteManagementDashboard } from '@/components/maritime/waste/waste-management-dashboard';
import { VesselDNADashboard } from '@/components/maritime/vessel-dna/vessel-dna-dashboard';
import { CybersecurityDashboard } from '@/components/maritime/cybersecurity/cybersecurity-dashboard';
import { DockingProjectsDashboard } from '@/components/maritime/docking/docking-projects-dashboard';
import { ComplianceCertificationsDashboard } from '@/components/maritime/compliance/compliance-certifications-dashboard';
import { PerformanceAnalysisDashboard } from '@/components/maritime/performance/performance-analysis-dashboard';
import { RiskManagementDashboard } from '@/components/maritime/risk/risk-management-dashboard';
import { APIIntegrationsDashboard } from '@/components/maritime/api/api-integrations-dashboard';
import { CommunicationDashboard } from '@/components/maritime/enhanced-communication/communication-dashboard';
import { SmartInspectionsDashboard } from '@/components/maritime/inspections/smart-inspections-dashboard';

const SpecializedModules: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Módulos Especializados Nautilus One</h1>
        <p className="text-muted-foreground">
          Plataforma marítima completa com 12 módulos especializados e IA integrada
        </p>
      </div>

      <Tabs defaultValue="training" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Treinamentos</span>
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Saúde</span>
          </TabsTrigger>
          <TabsTrigger value="waste" className="flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            <span className="hidden sm:inline">Resíduos</span>
          </TabsTrigger>
          <TabsTrigger value="dna" className="flex items-center gap-2">
            <Dna className="w-4 h-4" />
            <span className="hidden sm:inline">Vessel DNA</span>
          </TabsTrigger>
          <TabsTrigger value="cyber" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Cibersegurança</span>
          </TabsTrigger>
          <TabsTrigger value="docking" className="flex items-center gap-2">
            <Anchor className="w-4 h-4" />
            <span className="hidden sm:inline">Docagem</span>
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Riscos</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">APIs</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Comunicação</span>
          </TabsTrigger>
          <TabsTrigger value="inspections" className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Inspeções</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="training">
          <TrainingExercisesDashboard />
        </TabsContent>

        <TabsContent value="medical">
          <MedicalHealthDashboard />
        </TabsContent>

        <TabsContent value="waste">
          <WasteManagementDashboard />
        </TabsContent>

        <TabsContent value="dna">
          <VesselDNADashboard />
        </TabsContent>

        <TabsContent value="cyber">
          <CybersecurityDashboard />
        </TabsContent>

        <TabsContent value="docking">
          <DockingProjectsDashboard />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceCertificationsDashboard />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceAnalysisDashboard />
        </TabsContent>

        <TabsContent value="risk">
          <RiskManagementDashboard />
        </TabsContent>

        <TabsContent value="api">
          <APIIntegrationsDashboard />
        </TabsContent>

        <TabsContent value="communication">
          <CommunicationDashboard />
        </TabsContent>

        <TabsContent value="inspections">
          <SmartInspectionsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SpecializedModules;
