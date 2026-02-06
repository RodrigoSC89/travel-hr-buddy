import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, AlertTriangle, CheckCircle, Clock, FileText, Plus, RefreshCw } from "lucide-react";
import { useCertificationsData } from "@/hooks/useCertificationsData";

interface Props { searchQuery?: string; }

export default function CertificationsSection({ searchQuery }: Props) {
  const { data: certs = [], isLoading } = useCertificationsData();

  const filtered = certs.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.cert.toLowerCase().includes(searchQuery.toLowerCase()));
  const valid = certs.filter(c => c.status === "valid").length;
  const expiring = certs.filter(c => c.status === "expiring").length;
  const expired = certs.filter(c => c.status === "expired").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Nenhuma certificação encontrada</p>
              <p className="text-sm">Adicione certificações STCW para visualizá-las aqui.</p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
