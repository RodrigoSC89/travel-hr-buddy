/**
 * Flag State & IMO FAL Compliance — Gap #7
 * Digital logbook format, Flag State submission tracker, IMO FAL Convention
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Anchor, FileCheck, Globe, Shield, Ship, Flag,
  CheckCircle2, Clock, AlertTriangle, Download, Send,
  BookOpen, Stamp, FileText, Scale
} from "lucide-react";

interface FlagStateEntry {
  id: string;
  country: string;
  flag: string;
  status: "approved" | "pending" | "submitted" | "not_started";
  acceptsDigitalLogbooks: boolean;
  submissionDate?: string;
  approvalDate?: string;
  requirements: string[];
  progress: number;
}

const FLAG_STATES: FlagStateEntry[] = [
  { id: "mhl", country: "Marshall Islands", flag: "🇲🇭", status: "submitted", acceptsDigitalLogbooks: true, submissionDate: "2026-01-15", requirements: ["Electronic Record Book approval", "MEPC.312(74) compliance", "Approved software vendor registration"], progress: 65 },
  { id: "bhs", country: "Bahamas", flag: "🇧🇸", status: "pending", acceptsDigitalLogbooks: true, requirements: ["BMA Information Bulletin compliance", "Approved Electronic Systems list", "Annual audit requirement"], progress: 40 },
  { id: "pan", country: "Panama", flag: "🇵🇦", status: "not_started", acceptsDigitalLogbooks: true, requirements: ["AMP Merchant Marine Circular", "Type Approval Certificate", "Onboard inspection validation"], progress: 10 },
  { id: "lbr", country: "Liberia", flag: "🇱🇷", status: "not_started", acceptsDigitalLogbooks: true, requirements: ["LISCR Marine Advisory compliance", "Electronic Record Book Guidelines", "Flag State Inspector sign-off"], progress: 5 },
  { id: "sgp", country: "Singapore", flag: "🇸🇬", status: "not_started", acceptsDigitalLogbooks: false, requirements: ["MPA Shipping Circular", "IMO MEPC.312(74)", "Class Society endorsement"], progress: 0 },
  { id: "nor", country: "Norway (NIS)", flag: "🇳🇴", status: "not_started", acceptsDigitalLogbooks: true, requirements: ["NMA approval process", "Electronic record keeping regulations", "Data retention 3 years"], progress: 0 },
];

const IMO_FAL_FORMS = [
  { id: "fal1", name: "FAL Form 1 — General Declaration", imoRef: "IMO FAL.2/Circ.131", status: "compliant", digital: true },
  { id: "fal2", name: "FAL Form 2 — Cargo Declaration", imoRef: "IMO FAL.2/Circ.131", status: "compliant", digital: true },
  { id: "fal3", name: "FAL Form 3 — Ship's Stores Declaration", imoRef: "IMO FAL.2/Circ.131", status: "compliant", digital: true },
  { id: "fal4", name: "FAL Form 4 — Crew's Effects Declaration", imoRef: "IMO FAL.2/Circ.131", status: "compliant", digital: true },
  { id: "fal5", name: "FAL Form 5 — Crew List", imoRef: "IMO FAL.2/Circ.131", status: "compliant", digital: true },
  { id: "fal6", name: "FAL Form 6 — Passenger List", imoRef: "IMO FAL.2/Circ.131", status: "compliant", digital: true },
  { id: "fal7", name: "FAL Form 7 — Dangerous Goods Manifest", imoRef: "IMO FAL.2/Circ.131", status: "in_progress", digital: true },
  { id: "orb1", name: "Oil Record Book Part I (Machinery)", imoRef: "MEPC.312(74)", status: "compliant", digital: true },
  { id: "orb2", name: "Oil Record Book Part II (Cargo)", imoRef: "MEPC.312(74)", status: "compliant", digital: true },
  { id: "grb", name: "Garbage Record Book", imoRef: "MEPC.277(70)", status: "compliant", digital: true },
  { id: "decklog", name: "Official Deck Log Book", imoRef: "SOLAS V/28", status: "in_progress", digital: true },
  { id: "enginelog", name: "Engine Room Log Book", imoRef: "SOLAS II-1", status: "in_progress", digital: true },
];

const DIGITAL_LOGBOOK_REQS = [
  { id: "dl1", requirement: "Tamper-proof audit trail (blockchain hash)", status: "done" },
  { id: "dl2", requirement: "Electronic signature with officer credentials", status: "done" },
  { id: "dl3", requirement: "Offline-first with sync capability (2 Mbps)", status: "done" },
  { id: "dl4", requirement: "Data retention minimum 3 years", status: "done" },
  { id: "dl5", requirement: "PDF export matching IMO format exactly", status: "done" },
  { id: "dl6", requirement: "UTC timestamps with timezone tracking", status: "done" },
  { id: "dl7", requirement: "Backup redundancy (cloud + local)", status: "done" },
  { id: "dl8", requirement: "PSC Inspector read-only access mode", status: "in_progress" },
  { id: "dl9", requirement: "Class Society integration for verification", status: "in_progress" },
  { id: "dl10", requirement: "Multi-language support (EN/PT/ES/FR)", status: "done" },
];

export default function FlagStateCompliancePage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    new Set(DIGITAL_LOGBOOK_REQS.filter(r => r.status === "done").map(r => r.id))
  );

  const toggleItem = (id: string) => {
    setCheckedItems(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const approvedStates = FLAG_STATES.filter(f => f.status === "approved").length;
  const submittedStates = FLAG_STATES.filter(f => f.status === "submitted" || f.status === "pending").length;
  const falCompliant = IMO_FAL_FORMS.filter(f => f.status === "compliant").length;
  const logbookReady = (checkedItems.size / DIGITAL_LOGBOOK_REQS.length) * 100;

  const statusBadge = (s: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
      approved: { variant: "default", label: "✅ Aprovado" },
      submitted: { variant: "secondary", label: "📤 Submetido" },
      pending: { variant: "outline", label: "⏳ Pendente" },
      not_started: { variant: "outline", label: "⬜ Não Iniciado" },
      compliant: { variant: "default", label: "✅ Conforme" },
      in_progress: { variant: "secondary", label: "🔧 Em Progresso" },
    };
    return map[s] || map.not_started;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Flag className="h-8 w-8 text-primary" />
              Flag State & IMO FAL Compliance
            </h1>
            <p className="text-muted-foreground mt-1">Logbooks digitais, submissão Flag State e conformidade IMO FAL Convention</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Stamp, label: "Flag States Aprovados", value: `${approvedStates}/${FLAG_STATES.length}`, color: "text-success" },
            { icon: Send, label: "Submissões Ativas", value: submittedStates.toString(), color: "text-primary" },
            { icon: FileCheck, label: "FAL Forms Conformes", value: `${falCompliant}/${IMO_FAL_FORMS.length}`, color: "text-primary" },
            { icon: BookOpen, label: "Logbook Digital Ready", value: `${Math.round(logbookReady)}%`, color: "text-warning" },
          ].map(kpi => (
            <Card key={kpi.label} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="flagstates" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="flagstates"><Globe className="h-4 w-4 mr-2" />Flag States</TabsTrigger>
            <TabsTrigger value="fal"><FileText className="h-4 w-4 mr-2" />IMO FAL Forms</TabsTrigger>
            <TabsTrigger value="logbook"><BookOpen className="h-4 w-4 mr-2" />Digital Logbook</TabsTrigger>
          </TabsList>

          {/* Flag States Tab */}
          <TabsContent value="flagstates">
            <Card>
              <CardHeader>
                <CardTitle>Tracker de Aprovação — Flag States</CardTitle>
                <CardDescription>Progresso de submissão para aceitação de logbooks digitais</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-[60vh]">
                  <div className="space-y-3">
                    {FLAG_STATES.map(fs => {
                      const sb = statusBadge(fs.status);
                      return (
                        <div key={fs.id} className="p-4 bg-muted/30 rounded-lg border border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{fs.flag}</span>
                              <div>
                                <p className="font-medium text-foreground">{fs.country}</p>
                                <p className="text-xs text-muted-foreground">
                                  {fs.acceptsDigitalLogbooks ? "✅ Aceita logbooks digitais" : "❌ Não aceita ainda"}
                                </p>
                              </div>
                            </div>
                            <Badge variant={sb.variant}>{sb.label}</Badge>
                          </div>
                          <Progress value={fs.progress} className="h-2 mb-2" />
                          <div className="flex gap-2 flex-wrap">
                            {fs.requirements.map(r => (
                              <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                            ))}
                          </div>
                          {fs.submissionDate && (
                            <p className="text-xs text-muted-foreground mt-2">📤 Submetido: {fs.submissionDate}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IMO FAL Forms */}
          <TabsContent value="fal">
            <Card>
              <CardHeader>
                <CardTitle>IMO FAL Convention — Formulários Digitais</CardTitle>
                <CardDescription>Conformidade com MEPC.312(74) e FAL.2/Circ.131</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {IMO_FAL_FORMS.map(form => {
                    const sb = statusBadge(form.status);
                    return (
                      <div key={form.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium text-foreground text-sm">{form.name}</p>
                            <p className="text-xs text-muted-foreground">{form.imoRef}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {form.digital && <Badge variant="outline" className="text-xs">📱 Digital</Badge>}
                          <Badge variant={sb.variant} className="text-xs">{sb.label}</Badge>
                          <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Digital Logbook Readiness */}
          <TabsContent value="logbook">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Digital Logbook Readiness — {Math.round(logbookReady)}%
                </CardTitle>
                <CardDescription>Requisitos técnicos para aprovação como logbook digital oficial</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={logbookReady} className="h-3 mb-4" />
                <div className="space-y-2">
                  {DIGITAL_LOGBOOK_REQS.map(req => (
                    <div key={req.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      checkedItems.has(req.id) ? "bg-success/5 border-success/30" : "bg-muted/30 border-border/50"
                    }`}>
                      <Checkbox checked={checkedItems.has(req.id)} onCheckedChange={() => toggleItem(req.id)} />
                      <span className={`text-sm ${checkedItems.has(req.id) ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {req.requirement}
                      </span>
                      {checkedItems.has(req.id) && <CheckCircle2 className="h-4 w-4 text-success ml-auto" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
