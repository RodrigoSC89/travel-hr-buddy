import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, AlertTriangle, CheckCircle, Clock, FileText, Plus } from "lucide-react";

interface Props { searchQuery?: string; }

const mockCerts = [
  { id: "1", name: "João Silva", cert: "STCW Basic Safety", issue: "2022-05-15", expiry: "2027-05-15", status: "valid" },
  { id: "2", name: "Maria Santos", cert: "Advanced Fire Fighting", issue: "2021-08-20", expiry: "2024-08-20", status: "expiring" },
  { id: "3", name: "Carlos Lima", cert: "Medical First Aid", issue: "2020-03-10", expiry: "2024-03-10", status: "expiring" },
  { id: "4", name: "Ana Costa", cert: "Survival Craft", issue: "2019-11-25", expiry: "2024-01-25", status: "expired" },
  { id: "5", name: "Pedro Oliveira", cert: "SSO - Ship Security Officer", issue: "2023-01-10", expiry: "2028-01-10", status: "valid" },
];

export default function CertificationsSection({ searchQuery }: Props) {
  const filtered = mockCerts.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.cert.toLowerCase().includes(searchQuery.toLowerCase()));
  const valid = mockCerts.filter(c => c.status === "valid").length;
  const expiring = mockCerts.filter(c => c.status === "expiring").length;
  const expired = mockCerts.filter(c => c.status === "expired").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-green-500/10 border-green-500/30"><CardContent className="p-4 flex items-center gap-3"><CheckCircle className="h-6 w-6 text-green-500" /><div><p className="text-xl font-bold">{valid}</p><p className="text-sm">Válidos</p></div></CardContent></Card>
          <Card className="bg-amber-500/10 border-amber-500/30"><CardContent className="p-4 flex items-center gap-3"><Clock className="h-6 w-6 text-amber-500" /><div><p className="text-xl font-bold">{expiring}</p><p className="text-sm">Expirando</p></div></CardContent></Card>
          <Card className="bg-red-500/10 border-red-500/30"><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-6 w-6 text-red-500" /><div><p className="text-xl font-bold">{expired}</p><p className="text-sm">Expirados</p></div></CardContent></Card>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-red-600"><Plus className="h-4 w-4 mr-2" />Adicionar Certificação</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Certificações STCW</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(cert => (
              <Card key={cert.id} className={`border-2 ${cert.status === "expired" ? "border-red-500/50 bg-red-500/5" : cert.status === "expiring" ? "border-amber-500/50 bg-amber-500/5" : "border-green-500/50 bg-green-500/5"}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div><p className="font-bold">{cert.name}</p><p className="text-sm text-muted-foreground">{cert.cert}</p></div>
                    <Badge variant={cert.status === "valid" ? "default" : cert.status === "expiring" ? "secondary" : "destructive"}>{cert.status === "valid" ? "Válido" : cert.status === "expiring" ? "Expirando" : "Expirado"}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Emissão: {cert.issue}</p><p>Validade: {cert.expiry}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3"><FileText className="h-3 w-3 mr-1" />Ver Certificado</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
