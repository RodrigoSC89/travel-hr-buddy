// Re-export all checklist types from the main types directory
export * from "@/components/maritime-checklists/checklist-types";

// Additional module-specific types can be added here
export interface ChecklistModule {
  id: string;
  name: string;
  description: string;
}
