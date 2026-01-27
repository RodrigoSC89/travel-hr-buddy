import React, { useState, useEffect } from "react";
import { BaseChecklistManager } from "./base-checklist-manager";
import { DPChecklist } from "./dp-checklist";
import { MachineRoutineChecklist } from "./machine-routine-checklist";
import { NauticalRoutineChecklist } from "./nautical-routine-checklist";
import { SafetyChecklist } from "./safety-checklist";
import { EnvironmentalChecklist } from "./environmental-checklist";
import { useChecklistPersistence } from "@/hooks/use-checklist-persistence";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

  // Use the persistence hook
  const {
    isSaving,
    isSubmitting,
    lastSaved,
    saveChecklist,
    submitChecklist,
    createFromTemplate
  } = useChecklistPersistence({ userId, vesselId });

  const handleChecklistSelect = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
    setCurrentView("checklist");
  };

  const handleTemplateSelect = async (template: ChecklistTemplate) => {
    setSelectedTemplate(template);
    // Create new checklist from template
    const newChecklist = await createFromTemplate(template);
    if (newChecklist) {
      setSelectedChecklist(newChecklist);
      setCurrentView("checklist");
      toast({
        title: "📋 Checklist criado",
        description: `Novo checklist baseado em "${template.name}"`
      });
    }
  };

  const handleSaveChecklist = async (checklist: Checklist) => {
    const success = await saveChecklist(checklist);
    if (success) {
      setSelectedChecklist(checklist);
    }
  };

  const handleSubmitChecklist = async (checklist: Checklist) => {
    const success = await submitChecklist(checklist);
    if (success) {
      setSelectedChecklist({ ...checklist, status: 'pending_review' });
    }
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
      // Fallback genérico para tipos de checklist não reconhecidos
      return (
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Checklist: {selectedChecklist.type}</h3>
            <button
              onClick={handleBackToManager}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Voltar
            </button>
          </div>
          <div className="border rounded-lg p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground mb-4">
              Este tipo de checklist utiliza o formato padrão.
            </p>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3 p-2 bg-background rounded">
                  <input type="checkbox" className="h-4 w-4" />
                  <span>Item de verificação #{i}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                handleSubmitChecklist(selectedChecklist);
              }}
              className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Concluir Checklist
            </button>
          </div>
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