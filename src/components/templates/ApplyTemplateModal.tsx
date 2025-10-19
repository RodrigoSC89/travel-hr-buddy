import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, AlertTriangle } from "lucide-react";

interface ApplyTemplateModalProps {
  onApply: (content: string) => void;
}

/**
 * ApplyTemplateModal Component - Placeholder
 * 
 * This is a placeholder component for the Apply Template Modal.
 * The full implementation requires the ai_document_templates table in Supabase.
 * 
 * To enable this feature:
 * 1. Create the ai_document_templates table migration
 * 2. Run supabase gen types to update types
 * 3. Replace this file with src/_legacy/ApplyTemplateModal.tsx
 */
export default function ApplyTemplateModal({ onApply }: ApplyTemplateModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          📂 Aplicar Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Aplicar Template</DialogTitle>
          <DialogDescription>
            Recurso temporariamente indisponível
          </DialogDescription>
        </DialogHeader>
        
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Recurso Indisponível</AlertTitle>
          <AlertDescription>
            O recurso de templates requer a criação da tabela <code className="bg-muted px-1 py-0.5 rounded">ai_document_templates</code> no banco de dados Supabase.
            <br /><br />
            Para ativar este recurso:
            <ol className="list-decimal ml-6 mt-2 space-y-1">
              <li>Criar a migração da tabela ai_document_templates</li>
              <li>Executar <code className="bg-muted px-1 py-0.5 rounded">supabase gen types</code></li>
              <li>Implementar o componente completo de <code className="bg-muted px-1 py-0.5 rounded">src/_legacy/ApplyTemplateModal.tsx</code></li>
            </ol>
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
