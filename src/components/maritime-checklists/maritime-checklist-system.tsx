import React, { useState } from "react";
import { BaseChecklistManager } from "./base-checklist-manager";
import { DPChecklist } from "./dp-checklist";
import { MachineRoutineChecklist } from "./machine-routine-checklist";
import { NauticalRoutineChecklist } from "./nautical-routine-checklist";
import { SafetyChecklist } from "./safety-checklist";
import { EnvironmentalChecklist } from "./environmental-checklist";
import type { Checklist, ChecklistTemplate } from "./checklist-types";

interface MaritimeChecklistSystemProps {
  userId: string;
  userRole: string;
  vesselId?: string;
}

export const MaritimeChecklistSystem: React.FC<MaritimeChecklistSystemProps> = ({
  userId,
  userRole,
  vesselId
}) => {
  const [currentView, setCurrentView] = useState<"manager" | "checklist">("manager");
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);

  const handleChecklistSelect = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setCurrentView("checklist");
  };

  const handleTemplateSelect = (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    // TODO: Create new checklist from template
  };

  const handleSaveChecklist = async (checklist: Checklist) => {
    // TODO: Implement save to Supabase
    console.log("Saving checklist:", checklist.id);
  };

  const handleSubmitChecklist = async (checklist: Checklist) => {
    // TODO: Implement submit to Supabase
    console.log("Submitting checklist:", checklist.id);
  };

  const handleBackToManager = () => {
    setCurrentView("manager");
    setSelectedChecklist(null);
    setSelectedTemplate(null);
  };

  const renderChecklistComponent = () => {
    if (!selectedChecklist) return null;

    switch (selectedChecklist.type) {
    case "dp":
      return (
        <DPChecklist
          checklist={selectedChecklist}
          onSave={handleSaveChecklist}
          onSubmit={handleSubmitChecklist}
          onBack={handleBackToManager}
        />
      );
      
    case "machine_routine":
      return (
        <MachineRoutineChecklist
          checklist={selectedChecklist}
          onSave={handleSaveChecklist}
          onSubmit={handleSubmitChecklist}
          onBack={handleBackToManager}
        />
      );
      
    case "nautical_routine":
      return (
        <NauticalRoutineChecklist
          checklist={selectedChecklist}
          onSave={handleSaveChecklist}
          onSubmit={handleSubmitChecklist}
          onBack={handleBackToManager}
        />
      );
      
    case "safety":
      return (
        <SafetyChecklist
          checklist={selectedChecklist}
          onSave={handleSaveChecklist}
          onSubmit={handleSubmitChecklist}
          onBack={handleBackToManager}
        />
      );
      
    case "environmental":
      return (
        <EnvironmentalChecklist
          checklist={selectedChecklist}
          onSave={handleSaveChecklist}
          onSubmit={handleSubmitChecklist}
          onBack={handleBackToManager}
        />
      );
      
    default:
      return (
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold mb-2">Tipo de Checklist Não Implementado</h3>
          <p className="text-muted-foreground mb-4">
              O tipo "{selectedChecklist.type}" ainda não foi implementado.
          </p>
          <button
            onClick={handleBackToManager}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
              Voltar
          </button>
        </div>
      );
    }
  };

  if (currentView === "checklist") {
    return renderChecklistComponent();
  }

  return (
    <BaseChecklistManager
      vesselId={vesselId}
      userId={userId}
      userRole={userRole}
      onChecklistSelect={handleChecklistSelect}
      onTemplateSelect={handleTemplateSelect}
    />
  );
};