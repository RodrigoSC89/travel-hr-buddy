/**
 * MLC DMLC Part I/II Checklist - Declaration of Maritime Labour Compliance
 * Complete checklist for MLC certification with Part I (Flag State) and Part II (Shipowner)
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertTriangle, FileText, Download, Brain, Shield } from "lucide-react";
import { toast } from "sonner";

interface DMLCItem {
  id: string;
  title: string;
  regulation: string;
  partI: string; // Flag State national requirement
  partII: string; // Measures adopted by shipowner
  status: "compliant" | "non_compliant" | "partial" | "not_verified";
  evidence: string[];
  notes: string;
}

const DMLC_ITEMS: DMLCItem[] = [
  { id: "1", title: "Minimum Age", regulation: "MLC Reg. 1.1", partI: "Minimum age 16; night work 18+; hazardous work 18+", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "2", title: "Medical Certificate", regulation: "MLC Reg. 1.2", partI: "Valid medical certificate per STCW/ILO-147; max 2 years", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "3", title: "Training and Qualifications", regulation: "MLC Reg. 1.3", partI: "Personal training per STCW; safety familiarization", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "4", title: "Recruitment and Placement", regulation: "MLC Reg. 1.4", partI: "Licensed recruitment service; no fees to seafarers", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "5", title: "Seafarers' Employment Agreements", regulation: "MLC Reg. 2.1", partI: "Written SEA; minimum content requirements; termination rights", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "6", title: "Wages", regulation: "MLC Reg. 2.2", partI: "Monthly wages; allotment facility; no hidden deductions", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "7", title: "Hours of Work and Rest", regulation: "MLC Reg. 2.3", partI: "Max 14h/24h or 72h/7d work; min 10h/24h rest; records", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "8", title: "Entitlement to Leave", regulation: "MLC Reg. 2.4", partI: "Minimum 2.5 days annual leave per month of service", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "9", title: "Repatriation", regulation: "MLC Reg. 2.5", partI: "Right to repatriation; financial security; max 11 months", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "10", title: "Seafarer Compensation for Ship's Loss/Foundering", regulation: "MLC Reg. 2.6", partI: "Compensation for unemployment due to ship loss", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "11", title: "Manning Levels", regulation: "MLC Reg. 2.7", partI: "Safe manning document; adequate crew for safe operation", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "12", title: "Accommodation and Recreational Facilities", regulation: "MLC Reg. 3.1", partI: "Minimum cabin size; berth specifications; heating/ventilation", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "13", title: "Food and Catering", regulation: "MLC Reg. 3.2", partI: "Adequate food; trained cook; hygiene standards", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "14", title: "Health and Safety Protection", regulation: "MLC Reg. 4.3", partI: "OHS policy; risk assessment; PPE; accident prevention", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "15", title: "On-board Medical Care", regulation: "MLC Reg. 4.1", partI: "Medical chest; qualified medical officer; TMAS access", partII: "", status: "not_verified", evidence: [], notes: "" },
  { id: "16", title: "On-board Complaint Procedures", regulation: "MLC Reg. 5.1.5", partI: "Fair and effective complaint procedure; no victimization", partII: "", status: "not_verified", evidence: [], notes: "" },
];

export function MLCDMLCChecklist() {
  const [items, setItems] = useState<DMLCItem[]>(DMLC_ITEMS);
  const [activeTab, setActiveTab] = useState("checklist");

  const compliantCount = items.filter(i => i.status === "compliant").length;
  const ncCount = items.filter(i => i.status === "non_compliant").length;
  const partialCount = items.filter(i => i.status === "partial").length;
  const verifiedPct = Math.round(((compliantCount + ncCount + partialCount) / items.length) * 100);

  const updateStatus = (id: string, status: DMLCItem["status"]) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  };

  const updatePartII = (id: string, value: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, partII: value } : i));
  };

  const statusColors = {
    compliant: "text-success",
    non_compliant: "text-destructive",
    partial: "text-warning",
    not_verified: "text-muted-foreground",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">DMLC — Declaration of Maritime Labour Compliance</h3>
          <p className="text-sm text-muted-foreground">Part I (Flag State) & Part II (Shipowner) • {items.length} requisitos</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast.success("DMLC exportado para PDF")} className="gap-1">
          <Download className="h-3 w-3" /> Exportar DMLC
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Conforme</p>
          <p className="text-2xl font-bold text-success">{compliantCount}</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Não Conforme</p>
          <p className="text-2xl font-bold text-destructive">{ncCount}</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Parcial</p>
          <p className="text-2xl font-bold text-warning">{partialCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-xs text-muted-foreground">Verificação</p>
          <p className="text-2xl font-bold">{verifiedPct}%</p>
        </CardContent></Card>
      </div>

      {/* DMLC Items */}
      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className={item.status === "non_compliant" ? "border-destructive/30" : item.status === "compliant" ? "border-success/20" : ""}>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono">{item.regulation}</Badge>
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  <Select value={item.status} onValueChange={(v) => updateStatus(item.id, v as DMLCItem["status"])}>
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compliant">✓ Conforme</SelectItem>
                      <SelectItem value="non_compliant">✗ Não Conforme</SelectItem>
                      <SelectItem value="partial">⚠ Parcial</SelectItem>
                      <SelectItem value="not_verified">— Não Verificado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <p className="font-medium text-muted-foreground mb-1">Part I — Flag State Requirements:</p>
                    <p>{item.partI}</p>
                  </div>
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">Part II — Shipowner Measures:</p>
                    <Textarea
                      placeholder="Descreva as medidas adotadas pelo armador..."
                      value={item.partII}
                      onChange={(e) => updatePartII(item.id, e.target.value)}
                      className="text-xs min-h-[60px]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
