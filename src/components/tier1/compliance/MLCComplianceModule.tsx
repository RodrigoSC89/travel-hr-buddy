/**
 * MLC 2006 Compliance Module - Tier-1
 * Benchmark: DNV MLC Module + Helm Connect Crew Compliance
 * Features:
 * - Full MLC 2006 checklist (Titles 1-5)
 * - Seafarer agreements tracking
 * - Working hours monitoring (Reg 2.3)
 * - Crew welfare & wellbeing (Title 4)
 * - DMLC Part I & II management
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, FileText, Clock, Heart, Shield, CheckCircle,
  AlertTriangle, Calendar, Scale, Briefcase, Home, Coffee,
  Activity, Award, BookOpen, Sparkles
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MLCTitle {
  id: string;
  title: string;
  description: string;
  regulations: number;
  compliant: number;
  icon: React.ElementType;
}

const mlcTitles: MLCTitle[] = [
  {
    id: "title1",
    title: "Title 1: Minimum Requirements",
    description: "Minimum age, medical certificate, training & qualifications",
    regulations: 12,
    compliant: 12,
    icon: Award
  },
  {
    id: "title2",
    title: "Title 2: Conditions of Employment",
    description: "Seafarers' employment agreements, wages, hours of work",
    regulations: 18,
    compliant: 17,
    icon: Briefcase
  },
  {
    id: "title3",
    title: "Title 3: Accommodation, Facilities",
    description: "Food, recreational facilities, health protection",
    regulations: 15,
    compliant: 15,
    icon: Home
  },
  {
    id: "title4",
    title: "Title 4: Health & Social Security",
    description: "Medical care, welfare, social security protection",
    regulations: 10,
    compliant: 9,
    icon: Heart
  },
  {
    id: "title5",
    title: "Title 5: Compliance & Enforcement",
    description: "Flag state responsibilities, port state control",
    regulations: 8,
    compliant: 8,
    icon: Shield
  }
];

export default function MLCComplianceModule() {
  const [activeTitle, setActiveTitle] = useState("title2");

  // Fetch MLC compliance data
  const { data: complianceData } = useQuery({
    queryKey: ["mlc-compliance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_items")
        .select("*")
        .ilike("type", "%MLC%");
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate overall compliance
  const totalRegs = mlcTitles.reduce((sum, t) => sum + t.regulations, 0);
  const totalCompliant = mlcTitles.reduce((sum, t) => sum + t.compliant, 0);
  const overallCompliance = Math.round((totalCompliant / totalRegs) * 100);

  const getComplianceStatus = (compliant: number, total: number) => {
    const percentage = (compliant / total) * 100;
    if (percentage === 100) return { color: "bg-success", label: "Compliant" };
    if (percentage >= 80) return { color: "bg-warning", label: "Partial" };
    return { color: "bg-destructive", label: "Non-Compliant" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Scale className="h-7 w-7 text-violet-500" />
            MLC 2006 Compliance Center
          </h2>
          <p className="text-muted-foreground">Maritime Labour Convention compliance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success gap-1">
            <CheckCircle className="h-3 w-3" />
            {overallCompliance}% Compliant
          </Badge>
          <Button variant="outline" size="sm">Export DMLC</Button>
          <Button size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* AI Insight */}
      <Card className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border-violet-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Sparkles className="h-5 w-5 text-violet-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">AI Compliance Assistant</h3>
              <p className="text-sm text-muted-foreground">
                2 regulation gaps detected in Title 4 (Health Protection). Working hours record for 3 crew members needs attention before next PSC inspection.
              </p>
            </div>
            <Button variant="outline" size="sm">Fix Issues</Button>
          </div>
        </CardContent>
      </Card>

      {/* MLC Titles Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {mlcTitles.map((title) => {
          const status = getComplianceStatus(title.compliant, title.regulations);
          return (
            <Card 
              key={title.id} 
              className={`cursor-pointer transition-all hover:border-primary/50 ${activeTitle === title.id ? "border-primary ring-2 ring-primary/20" : ""}`}
              onClick={() => setActiveTitle(title.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <title.icon className="h-6 w-6 text-primary" />
                  <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                </div>
                <h4 className="font-medium text-sm mb-1">{title.title.split(":")[0]}</h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{title.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span>{title.compliant}/{title.regulations} regulations</span>
                  <span className="font-medium">{Math.round((title.compliant / title.regulations) * 100)}%</span>
                </div>
                <Progress value={(title.compliant / title.regulations) * 100} className="h-1.5 mt-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Title 2 Details (most common issues) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Title 2: Conditions of Employment
          </CardTitle>
          <CardDescription>Seafarers' employment agreements, wages, hours of work and rest</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="agreements" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="agreements">Agreements</TabsTrigger>
              <TabsTrigger value="hours">Hours of Work</TabsTrigger>
              <TabsTrigger value="wages">Wages</TabsTrigger>
              <TabsTrigger value="leave">Leave & Repatriation</TabsTrigger>
            </TabsList>

            <TabsContent value="agreements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-success/5 border-success/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <Badge variant="outline">Reg 2.1</Badge>
                    </div>
                    <h4 className="font-medium">SEA Valid</h4>
                    <p className="text-sm text-muted-foreground">All 45 crew members have valid employment agreements</p>
                  </CardContent>
                </Card>

                <Card className="bg-success/5 border-success/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <Badge variant="outline">Reg 2.1.2</Badge>
                    </div>
                    <h4 className="font-medium">Copy Provided</h4>
                    <p className="text-sm text-muted-foreground">All seafarers received copy of agreement</p>
                  </CardContent>
                </Card>

                <Card className="bg-warning/5 border-warning/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <Badge variant="outline">Reg 2.1.4</Badge>
                    </div>
                    <h4 className="font-medium">Notice Period</h4>
                    <p className="text-sm text-muted-foreground">3 agreements need termination clause review</p>
                    <Button variant="outline" size="sm" className="mt-2 w-full">Review Now</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="hours" className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Regulation 2.3: Hours of Work and Rest
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-success">14h</p>
                    <p className="text-xs text-muted-foreground">Max work hours/day</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-success">72h</p>
                    <p className="text-xs text-muted-foreground">Max work hours/week</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-success">10h</p>
                    <p className="text-xs text-muted-foreground">Min rest hours/day</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-success">77h</p>
                    <p className="text-xs text-muted-foreground">Min rest hours/week</p>
                  </div>
                </div>
              </div>

              {/* Crew Working Hours Status */}
              <div className="space-y-3">
                {["Master", "Chief Officer", "2nd Officer", "Chief Engineer"].map((rank, idx) => (
                  <div key={rank} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{rank}</p>
                      <p className="text-xs text-muted-foreground">Last 7 days: {58 + idx * 2}h worked</p>
                    </div>
                    <Progress value={((58 + idx * 2) / 72) * 100} className="w-32 h-2" />
                    <Badge variant={idx < 3 ? "outline" : "secondary"} className="bg-success/10 text-success">
                      Compliant
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wages" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      Regulation 2.2: Wages
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-success" />
                        Monthly wage payment verified
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-success" />
                        Currency conversion rates fair
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-success" />
                        Allotment system operational
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-success" />
                        Wage slips provided monthly
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-3">Wage Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Total Crew Payroll</span>
                        <span className="font-medium">$185,000/month</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Allotments Processed</span>
                        <span className="font-medium">38 active</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Next Payment Date</span>
                        <span className="font-medium">28 Feb 2025</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="leave" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-success/5 border-success/20">
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-8 w-8 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold">2.5 days</p>
                    <p className="text-sm text-muted-foreground">Annual leave per month</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 text-center">
                    <Home className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Repatriations this year</p>
                  </CardContent>
                </Card>
                <Card className="bg-info/5 border-info/20">
                  <CardContent className="p-4 text-center">
                    <Coffee className="h-8 w-8 text-info mx-auto mb-2" />
                    <p className="text-2xl font-bold">100%</p>
                    <p className="text-sm text-muted-foreground">Shore leave access</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* DMLC Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Declaration of Maritime Labour Compliance
          </CardTitle>
          <CardDescription>DMLC Part I & Part II status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">DMLC Part I</h4>
                <Badge className="bg-success text-white">Certified</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Issued by Flag State (Marshall Islands)</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Issue Date:</span>
                  <span className="font-medium">15 Jan 2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Expiry Date:</span>
                  <span className="font-medium">14 Jan 2029</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">DMLC Part II</h4>
                <Badge className="bg-success text-white">Approved</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Company measures for ongoing compliance</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Last Update:</span>
                  <span className="font-medium">10 Feb 2025</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Review:</span>
                  <span className="font-medium">10 Aug 2025</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
