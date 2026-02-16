/**
 * Crew Document Vault - vs Compas E-CMS / Adonis
 * Centralized seafarer document management with expiry tracking
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  FileText, AlertTriangle, Clock, Shield, Search,
  Upload, Download, Users, CheckCircle, XCircle, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function CrewDocumentVault() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: crewMembers } = useQuery({
    queryKey: ["crew-doc-vault"],
    queryFn: async () => {
      const { data } = await supabase.from("crew_members").select("id, full_name, rank, nationality, status").limit(50);
      return data || [];
    },
  });

  const { data: certifications } = useQuery({
    queryKey: ["crew-certifications-vault"],
    queryFn: async () => {
      const { data } = await supabase.from("crew_certifications")
        .select("id, crew_member_id, certification_name, certification_type, issue_date, expiry_date, status")
        .limit(200);
      return data || [];
    },
  });

  const now = new Date();
  const expiringIn30 = certifications?.filter(c => {
    if (!c.expiry_date) return false;
    const exp = new Date(c.expiry_date);
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
  }) || [];

  const expiringIn90 = certifications?.filter(c => {
    if (!c.expiry_date) return false;
    const exp = new Date(c.expiry_date);
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 90;
  }) || [];

  const expired = certifications?.filter(c => {
    if (!c.expiry_date) return false;
    return new Date(c.expiry_date) < now;
  }) || [];

  const valid = certifications?.filter(c => {
    if (!c.expiry_date) return true;
    const exp = new Date(c.expiry_date);
    return (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) > 90;
  }) || [];

  const totalCerts = certifications?.length || 0;
  const complianceRate = totalCerts > 0 ? ((valid.length / totalCerts) * 100) : 0;

  const filteredCrew = crewMembers?.filter(c =>
    c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rank?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-400" />
            Crew Document Vault
          </h1>
          <p className="text-muted-foreground">Centralized seafarer document management with STCW/Flag State tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" /> Bulk Upload</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Export</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { icon: FileText, label: "Total Documents", value: totalCerts, color: "text-primary" },
          { icon: CheckCircle, label: "Valid", value: valid.length, color: "text-success" },
          { icon: Clock, label: "Expiring ≤30d", value: expiringIn30.length, color: "text-warning" },
          { icon: AlertTriangle, label: "Expiring ≤90d", value: expiringIn90.length, color: "text-warning" },
          { icon: XCircle, label: "Expired", value: expired.length, color: "text-destructive" },
        ].map((kpi, i) => (
          <Card key={i} className="border-border/50 bg-card/80 backdrop-blur">
            <CardContent className="pt-4 text-center">
              <kpi.icon className={`h-5 w-5 mx-auto mb-1 ${kpi.color}`} />
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Bar */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <Shield className="h-5 w-5 text-info" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Document Compliance Rate</span>
                <span className="font-bold">{complianceRate.toFixed(1)}%</span>
              </div>
              <Progress value={complianceRate} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expiring">Expiring ({expiringIn90.length})</TabsTrigger>
          <TabsTrigger value="expired">Expired ({expired.length})</TabsTrigger>
          <TabsTrigger value="flagstate">Flag State Requirements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search crew by name or rank..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-background/50 max-w-sm"
            />
          </div>
          <div className="grid gap-3">
            {filteredCrew.slice(0, 10).map(crew => {
              const crewCerts = certifications?.filter(c => c.crew_member_id === crew.id) || [];
              const crewExpired = crewCerts.filter(c => c.expiry_date && new Date(c.expiry_date) < now).length;
              return (
                <Card key={crew.id} className="border-border/50 bg-card/80 backdrop-blur">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-4">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{crew.full_name}</p>
                        <p className="text-xs text-muted-foreground">{crew.rank} • {crew.nationality}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{crewCerts.length} docs</Badge>
                        {crewExpired > 0 && (
                          <Badge className="bg-destructive/20 text-destructive text-xs">{crewExpired} expired</Badge>
                        )}
                        <Badge className={crew.status === "active" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}>
                          {crew.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="expiring" className="space-y-3">
          {expiringIn90.map(cert => {
            const daysLeft = Math.round((new Date(cert.expiry_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const crew = crewMembers?.find(c => c.id === cert.crew_member_id);
            return (
              <Card key={cert.id} className="border-border/50 bg-card/80 backdrop-blur">
                <CardContent className="py-3">
                  <div className="flex items-center gap-4">
                    <Clock className={`h-5 w-5 ${daysLeft <= 30 ? "text-warning" : "text-warning/70"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{cert.certification_name}</p>
                      <p className="text-xs text-muted-foreground">{crew?.full_name || "Unknown"} • {cert.certification_type}</p>
                    </div>
                    <Badge className={daysLeft <= 30 ? "bg-warning/20 text-warning" : "bg-warning/10 text-warning/80"}>
                      {daysLeft} days left
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {expiringIn90.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
              <p>All documents are valid beyond 90 days</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="expired" className="space-y-3">
          {expired.map(cert => {
            const crew = crewMembers?.find(c => c.id === cert.crew_member_id);
            return (
              <Card key={cert.id} className="border-border/50 bg-card/80 backdrop-blur border-red-500/20">
                <CardContent className="py-3">
                  <div className="flex items-center gap-4">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{cert.certification_name}</p>
                      <p className="text-xs text-muted-foreground">{crew?.full_name || "Unknown"} • Expired: {new Date(cert.expiry_date!).toLocaleDateString()}</p>
                    </div>
                    <Button size="sm" variant="destructive" className="text-xs">Renew</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="flagstate" className="space-y-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader><CardTitle className="text-sm">Flag State Document Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { flag: "🇲🇭 Marshall Islands", required: 12, held: 12, compliance: 100 },
                { flag: "🇱🇷 Liberia", required: 14, held: 13, compliance: 93 },
                { flag: "🇵🇦 Panama", required: 11, held: 11, compliance: 100 },
                { flag: "🇧🇸 Bahamas", required: 13, held: 12, compliance: 92 },
              ].map((fs, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-background/50">
                  <span className="text-lg">{fs.flag}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{fs.held}/{fs.required} documents</span>
                      <span className={`font-medium ${fs.compliance === 100 ? "text-green-400" : "text-yellow-400"}`}>
                        {fs.compliance}%
                      </span>
                    </div>
                    <Progress value={fs.compliance} className="h-1.5" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
