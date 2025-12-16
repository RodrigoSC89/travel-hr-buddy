// @ts-nocheck
// PATCH 393 - Digital Signature Component using react-signature-canvas
import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SignatureCanvas from "react-signature-canvas";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Save } from "lucide-react";

interface SignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (signatureData: SignatureData) => void;
  incidentId: string;
}

export interface SignatureData {
  signature_image: string;
  signatory_name: string;
  signatory_role: string;
  signed_at: string;
}

export const SignatureDialog: React.FC<SignatureDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  incidentId,
}) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryRole, setSignatoryRole] = useState("");
  const { toast } = useToast();

  const handleClear = () => {
    signatureRef.current?.clear();
  };

  const handleSave = () => {
    if (signatureRef.current?.isEmpty()) {
      toast({
        title: "Assinatura vazia",
        description: "Por favor, assine no campo acima",
        variant: "destructive",
      });
      return;
    }

    if (!signatoryName || !signatoryRole) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e cargo",
        variant: "destructive",
      });
      return;
    }

    const signatureImage = signatureRef.current?.toDataURL("image/png");
    
    const signatureData: SignatureData = {
      signature_image: signatureImage || "",
      signatory_name: signatoryName,
      signatory_role: signatoryRole,
      signed_at: new Date().toISOString(),
    };

    onSave(signatureData);
    handleClear();
    setSignatoryName("");
    setSignatoryRole("");
    onOpenChange(false);

    toast({
      title: "Assinatura registrada",
      description: "A assinatura foi salva com sucesso",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assinatura Digital</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Signatário *</Label>
              <Input
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo *</Label>
              <Input
                value={signatoryRole}
                onChange={(e) => setSignatoryRole(e.target.value)}
                placeholder="Ex: Capitão, Engenheiro"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assine no campo abaixo *</Label>
            <div className="border rounded-lg p-2 bg-white">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: "w-full h-48 border rounded",
                  style: { touchAction: "none" }
                }}
                backgroundColor="rgb(255, 255, 255)"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use o mouse ou toque na tela para assinar. A assinatura será anexada ao relatório de incidente.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClear}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Assinatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
