/**
 * Compliance Hub Dialogs - New Audit & Certificate
 */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Audit {
  type: "ISM" | "ISPS" | "SOLAS" | "MARPOL" | "MLC" | "Internal";
}

interface AuditDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  newAudit: { title: string; type: Audit["type"]; vesselName: string; auditorName: string; scheduledDate: string };
  setNewAudit: (v: any) => void;
  onSubmit: () => void;
}

export function NewAuditDialog({ open, onOpenChange, newAudit, setNewAudit, onSubmit }: AuditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova Auditoria</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Título</Label><Input value={newAudit.title} onChange={(e) => setNewAudit({ ...newAudit, title: e.target.value })} placeholder="Ex: ISM Annual Audit 2024" /></div>
          <div>
            <Label>Tipo</Label>
            <Select value={newAudit.type} onValueChange={(v) => setNewAudit({ ...newAudit, type: v as Audit["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ISM">ISM</SelectItem>
                <SelectItem value="ISPS">ISPS</SelectItem>
                <SelectItem value="SOLAS">SOLAS</SelectItem>
                <SelectItem value="MARPOL">MARPOL</SelectItem>
                <SelectItem value="MLC">MLC 2006</SelectItem>
                <SelectItem value="Internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Embarcação</Label><Input value={newAudit.vesselName} onChange={(e) => setNewAudit({ ...newAudit, vesselName: e.target.value })} placeholder="Nome da embarcação" /></div>
          <div><Label>Auditor</Label><Input value={newAudit.auditorName} onChange={(e) => setNewAudit({ ...newAudit, auditorName: e.target.value })} placeholder="Nome do auditor" /></div>
          <div><Label>Data Agendada</Label><Input type="date" value={newAudit.scheduledDate} onChange={(e) => setNewAudit({ ...newAudit, scheduledDate: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit}>Criar Auditoria</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CertDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  newCert: { name: string; type: string; vesselName: string; issuedDate: string; expiryDate: string; issuingAuthority: string };
  setNewCert: (v: any) => void;
  onSubmit: () => void;
}

export function NewCertDialog({ open, onOpenChange, newCert, setNewCert, onSubmit }: CertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo Certificado</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Nome do Certificado</Label><Input value={newCert.name} onChange={(e) => setNewCert({ ...newCert, name: e.target.value })} placeholder="Ex: Safety Management Certificate" /></div>
          <div><Label>Tipo</Label><Input value={newCert.type} onChange={(e) => setNewCert({ ...newCert, type: e.target.value })} placeholder="Ex: SMC, ISSC, MLC" /></div>
          <div><Label>Embarcação</Label><Input value={newCert.vesselName} onChange={(e) => setNewCert({ ...newCert, vesselName: e.target.value })} placeholder="Nome da embarcação" /></div>
          <div><Label>Autoridade Emissora</Label><Input value={newCert.issuingAuthority} onChange={(e) => setNewCert({ ...newCert, issuingAuthority: e.target.value })} placeholder="Ex: Lloyd's Register" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Data de Emissão</Label><Input type="date" value={newCert.issuedDate} onChange={(e) => setNewCert({ ...newCert, issuedDate: e.target.value })} /></div>
            <div><Label>Data de Expiração</Label><Input type="date" value={newCert.expiryDate} onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit}>Registrar Certificado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
