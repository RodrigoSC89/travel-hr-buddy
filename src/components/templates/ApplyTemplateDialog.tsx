/**
 * PATCH 409: Enhanced Apply Template Component
 * Integrates templates with Document Hub
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TemplateApplicationService, TemplateData } from "@/services/template-application.service";
import { useAuth } from "@/contexts/AuthContext";

interface ApplyTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplateData | null;
  onApply: (content: string, metadata: any) => void;
  documentTitle?: string;
}

export const ApplyTemplateDialog: React.FC<ApplyTemplateDialogProps> = ({
  open,
  onOpenChange,
  template,
  onApply,
  documentTitle
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [variables, setVariables] = useState<string[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string>('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (template && open) {
      // Extract variables from template
      const vars = TemplateApplicationService.extractVariables(template.content);
      setVariables(vars);

      // Pre-fill with common variables
      const commonVars = TemplateApplicationService.getCommonVariables(user);
      setFormData(commonVars);

      // Update preview
      updatePreview(template.content, commonVars);
    }
  }, [template, open, user]);

  const updatePreview = (content: string, data: Record<string, string>) => {
    const previewContent = TemplateApplicationService.previewTemplate(content, data);
    setPreview(previewContent);

    // Validate
    const validation = TemplateApplicationService.validateTemplateData(content, data, variables);
    setIsValid(validation.valid);
  };

  const handleInputChange = (varName: string, value: string) => {
    const newData = { ...formData, [varName]: value };
    setFormData(newData);
    
    if (template) {
      updatePreview(template.content, newData);
    }
  };

  const handleApply = () => {
    if (!template) return;

    const validation = TemplateApplicationService.validateTemplateData(
      template.content,
      formData,
      variables
    );

    if (!validation.valid) {
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: `Por favor, preencha: ${validation.missing.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    const appliedContent = TemplateApplicationService.applyTemplate(
      template.content,
      formData
    );

    onApply(appliedContent, {
      templateId: template.id,
      templateTitle: template.title,
      appliedAt: new Date().toISOString(),
      variables: formData
    });

    toast({
      title: "Template aplicado com sucesso",
      description: "O documento foi atualizado com o template selecionado.",
    });

    onOpenChange(false);
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Aplicar Template: {template.title}
          </DialogTitle>
          <DialogDescription>
            Preencha as variáveis abaixo para aplicar o template ao documento
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Form Section */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                {isValid ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Todas as variáveis preenchidas</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">
                      {variables.length - Object.keys(formData).filter(k => formData[k]).length} variáveis pendentes
                    </span>
                  </>
                )}
              </div>

              {variables.map((varName) => {
                const hasValue = !!formData[varName];
                
                return (
                  <div key={varName} className="space-y-2">
                    <Label 
                      htmlFor={varName}
                      className={hasValue ? 'text-green-600' : 'text-orange-600'}
                    >
                      {varName.charAt(0).toUpperCase() + varName.slice(1).replace(/_/g, ' ')}
                      {!hasValue && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    
                    {varName.toLowerCase().includes('data') ? (
                      <Input
                        id={varName}
                        type="date"
                        value={formData[varName] || ''}
                        onChange={(e) => handleInputChange(varName, e.target.value)}
                        className={hasValue ? 'border-green-500' : ''}
                      />
                    ) : varName.toLowerCase().includes('email') ? (
                      <Input
                        id={varName}
                        type="email"
                        value={formData[varName] || ''}
                        onChange={(e) => handleInputChange(varName, e.target.value)}
                        placeholder={`Digite ${varName}`}
                        className={hasValue ? 'border-green-500' : ''}
                      />
                    ) : (
                      <Input
                        id={varName}
                        type="text"
                        value={formData[varName] || ''}
                        onChange={(e) => handleInputChange(varName, e.target.value)}
                        placeholder={`Digite ${varName}`}
                        className={hasValue ? 'border-green-500' : ''}
                      />
                    )}
                  </div>
                );
              })}

              {variables.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Este template não possui variáveis para preencher.
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Preview Section */}
          <div className="space-y-2">
            <Label>Preview do Documento</Label>
            <ScrollArea className="h-[400px] border rounded-md p-4 bg-muted/10">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleApply}
            disabled={!isValid}
          >
            <FileText className="h-4 w-4 mr-2" />
            Aplicar Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
