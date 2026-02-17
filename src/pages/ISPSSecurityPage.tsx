/**
 * ISPS Security Page - International Ship and Port Facility Security Code
 * Usa o componente ISPSModule completo (SSP, Assessments, Drills, Cybersecurity)
 * + AI Evidence Generator, Voice Chat, Predictive AI
 * Módulo dedicado - NÃO é o mesmo que Security Center
 */
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import ModuleActionButton from "@/components/ui/module-action-button";
import { ISPSModule } from "@/components/safety/ISPSModule";
import { ComplianceVoiceChat } from "@/components/compliance/ComplianceVoiceChat";
import { CompliancePredictiveAI } from "@/components/compliance/CompliancePredictiveAI";
import { ComplianceEvidenceGenerator } from "@/components/compliance/ComplianceEvidenceGenerator";
import { ComplianceSGIAutoEvidence, ComplianceGapAnalyzer, ComplianceInterviewSimulator, ComplianceOneClickAuditPrep, ComplianceScoreBenchmark, ComplianceAutoNCResolver, CompliancePhotoEvidenceAI, CompliancePSCRiskPredictor } from "@/components/compliance/ai";
import { SmartEvidenceOrganizer } from "@/components/compliance/smart-evidence-organizer";
import { useMaritimeActions } from "@/hooks/useMaritimeActions";
import {
  Shield, Lock, ShieldAlert, Users, RefreshCw, Download,
  FileCheck, AlertTriangle, Eye, Sparkles, Brain, Mic, TrendingUp,
  Search, MessageSquare, Zap,
} from "lucide-react";

const ISPS_ELEMENTS = [
  { id: "A1", name: "Part A - Mandatory Requirements" },
  { id: "A2", name: "Ship Security Assessment (SSA)" },
  { id: "A3", name: "Ship Security Plan (SSP)" },
  { id: "A4", name: "Ship Security Officer (SSO)" },
  { id: "A5", name: "Company Security Officer (CSO)" },
  { id: "A6", name: "Port Facility Security Officer (PFSO)" },
  { id: "A7", name: "Security Level 1 - Normal" },
  { id: "A8", name: "Security Level 2 - Heightened" },
  { id: "A9", name: "Security Level 3 - Exceptional" },
  { id: "B1", name: "Part B - Guidance" },
  { id: "B2", name: "Declaration of Security (DoS)" },
  { id: "B3", name: "Security Drills & Exercises" },
  { id: "B4", name: "Cybersecurity" },
  { id: "B5", name: "Access Control" },
];

const ISPSSecurityPage = () => {
  const { handleExport, handleRefresh } = useMaritimeActions();
  const [activeTab, setActiveTab] = useState("isps-module");

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={ShieldAlert}
        title="ISPS Code - Ship & Port Facility Security"
        description="International Ship and Port Facility Security Code - SOLAS Chapter XI-2"
        gradient="purple"
        badges={[
          { icon: Lock, label: "ISPS Compliant" },
          { icon: Shield, label: "SSP/SSA" },
          { icon: Users, label: "CSO/SSO" },
          { icon: Eye, label: "Security Monitoring" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="isps-module" className="gap-2">
            <Shield className="h-4 w-4" />
            ISPS Completo
          </TabsTrigger>
          <TabsTrigger value="ai-evidence" className="gap-2">
            <Sparkles className="h-4 w-4" />
            IA Evidências
          </TabsTrigger>
          <TabsTrigger value="sgi-evidence" className="gap-2">
            <Eye className="h-4 w-4" />
            SGI Auto-Evidence
          </TabsTrigger>
          <TabsTrigger value="gap-analyzer" className="gap-2">
            <Search className="h-4 w-4" />
            Gap Analyzer
          </TabsTrigger>
          <TabsTrigger value="interview-sim" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Simulador Entrevista
          </TabsTrigger>
          <TabsTrigger value="audit-prep" className="gap-2">
            <Zap className="h-4 w-4" />
            Audit Prep 1-Click
          </TabsTrigger>
          <TabsTrigger value="ai-voice" className="gap-2">
            <Mic className="h-4 w-4" />
            Assistente Voz
          </TabsTrigger>
          <TabsTrigger value="ai-benchmark" className="gap-2">
            <Eye className="h-4 w-4" />
            Benchmarking
          </TabsTrigger>
          <TabsTrigger value="ai-nc-resolver" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            NC Resolver
          </TabsTrigger>
          <TabsTrigger value="ai-photo" className="gap-2">
            <Search className="h-4 w-4" />
            Foto IA
          </TabsTrigger>
          <TabsTrigger value="psc-risk" className="gap-2">
            <ShieldAlert className="h-4 w-4" />
            Risco PSC
          </TabsTrigger>
          <TabsTrigger value="ai-predictive" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            IA Preditiva
          </TabsTrigger>
          <TabsTrigger value="evidence-organizer" className="gap-2">
            <Brain className="h-4 w-4" />
            Organizador IA
          </TabsTrigger>
        </TabsList>

        {/* Full ISPS Module - SSP, Assessments, Drills, Cybersecurity */}
        <TabsContent value="isps-module" className="space-y-4">
          <ISPSModule />
        </TabsContent>

        {/* AI EVIDENCE GENERATOR */}
        <TabsContent value="ai-evidence" className="space-y-4">
          <ComplianceEvidenceGenerator
            moduleId="isps-security"
            moduleName="ISPS Code"
            elements={ISPS_ELEMENTS}
          />
        </TabsContent>

        {/* SGI AUTO-EVIDENCE */}
        <TabsContent value="sgi-evidence" className="space-y-4">
          <ComplianceSGIAutoEvidence
            moduleId="isps-security"
            moduleName="ISPS Code"
            checklistItems={ISPS_ELEMENTS.map(e => ({
              id: e.id,
              name: e.name,
              description: `ISPS Code requirement: ${e.name}`,
            }))}
          />
        </TabsContent>

        {/* GAP ANALYZER */}
        <TabsContent value="gap-analyzer" className="space-y-4">
          <ComplianceGapAnalyzer
            moduleId="isps-security"
            moduleName="ISPS Code"
            standards={["ISPS Code Part A", "ISPS Code Part B", "SOLAS Ch. XI-2", "Maritime Cybersecurity Guidelines"]}
          />
        </TabsContent>

        {/* INTERVIEW SIMULATOR */}
        <TabsContent value="interview-sim" className="space-y-4">
          <ComplianceInterviewSimulator
            moduleId="isps-security"
            moduleName="ISPS Code"
            standardContext="ISPS Code verification audit - Ship and Port Facility Security as per SOLAS Chapter XI-2. Focus on SSP implementation, Security Levels 1-3, Declaration of Security, access control, cybersecurity, and drill readiness."
          />
        </TabsContent>

        {/* ONE-CLICK AUDIT PREP */}
        <TabsContent value="audit-prep" className="space-y-4">
          <ComplianceOneClickAuditPrep
            moduleId="isps-security"
            moduleName="ISPS Code"
          />
        </TabsContent>

        {/* AI VOICE CHAT */}
        <TabsContent value="ai-voice" className="space-y-4">
          <ComplianceVoiceChat
            moduleId="isps-security"
            moduleName="ISPS Code"
            moduleDescription="Assistente de voz com IA para segurança portuária e de navios - SOLAS XI-2"
            systemContext="ISPS Code (International Ship and Port Facility Security Code) - SOLAS Chapter XI-2. Cobre Ship Security Plans (SSP), Ship Security Assessments (SSA), Security Levels 1-3, CSO/SSO roles, Declaration of Security (DoS), drills, cybersecurity, access control, e Port Facility Security."
            suggestedQuestions={[
              "Quais são os 3 níveis de segurança ISPS?",
              "O que deve conter o Ship Security Plan (SSP)?",
              "Como conduzir um Ship Security Assessment (SSA)?",
              "Quais são as responsabilidades do CSO e SSO?",
            ]}
            icon={<ShieldAlert className="h-6 w-6 text-primary" />}
          />
        </TabsContent>

        {/* AI PREDICTIVE */}
        <TabsContent value="ai-predictive" className="space-y-4">
          <CompliancePredictiveAI
            moduleId="isps-security"
            moduleName="ISPS Code"
            moduleContext="International Ship and Port Facility Security Code - Segurança marítima e portuária. Análise de ameaças, vulnerabilidades SSA, eficácia do SSP, conformidade com Security Levels, cybersecurity threats, access control effectiveness e drill readiness."
            riskAreas={[
              { name: "SSP Compliance", score: 94, trend: "up" },
              { name: "Access Control", score: 87, trend: "stable" },
              { name: "Cybersecurity", score: 76, trend: "down" },
              { name: "Drill Readiness", score: 91, trend: "up" },
              { name: "Threat Level", score: 82, trend: "stable" },
            ]}
           />
        </TabsContent>

        {/* COMPLIANCE SCORE + BENCHMARKING */}
        <TabsContent value="ai-benchmark" className="space-y-4">
          <ComplianceScoreBenchmark moduleId="isps-security" moduleName="ISPS Code" />
        </TabsContent>

        {/* AUTO NC RESOLVER */}
        <TabsContent value="ai-nc-resolver" className="space-y-4">
          <ComplianceAutoNCResolver moduleId="isps-security" moduleName="ISPS Code" />
        </TabsContent>

        {/* PHOTO EVIDENCE AI */}
        <TabsContent value="ai-photo" className="space-y-4">
          <CompliancePhotoEvidenceAI moduleId="isps-security" moduleName="ISPS Code" />
        </TabsContent>

        {/* PSC RISK PREDICTOR */}
        <TabsContent value="psc-risk" className="space-y-4">
          <CompliancePSCRiskPredictor moduleId="isps-security" moduleName="ISPS Code" />
        </TabsContent>

        <TabsContent value="evidence-organizer">
          <SmartEvidenceOrganizer framework="ism_isps" />
        </TabsContent>
      </Tabs>

      <ModuleActionButton
        moduleId="isps-security"
        moduleName="ISPS Security"
        actions={[
          { id: "isps", label: "ISPS Completo", icon: <Shield className="h-3 w-3" />, action: () => setActiveTab("isps-module") },
          { id: "evidence", label: "IA Evidências", icon: <Sparkles className="h-3 w-3" />, action: () => setActiveTab("ai-evidence") },
          { id: "voice", label: "Assistente Voz", icon: <Mic className="h-3 w-3" />, action: () => setActiveTab("ai-voice") },
          { id: "predictive", label: "IA Preditiva", icon: <Brain className="h-3 w-3" />, action: () => setActiveTab("ai-predictive") },
        ]}
        quickActions={[
          { id: "refresh", label: "Atualizar", icon: <RefreshCw className="h-3 w-3" />, action: () => handleRefresh("ISPS"), shortcut: "F5" },
          { id: "export", label: "Exportar SSP", icon: <Download className="h-3 w-3" />, action: () => handleExport("ISPS") },
        ]}
      />
    </ModulePageWrapper>
  );
};

export default ISPSSecurityPage;
