/**
 * PATCH 353: Employee Portal - Complete Self-Service
 * Enhanced with benefits, payroll, feedback, and personal documents
 */

import { useState } from "react";
import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, Calendar, Award, Shield, DollarSign, FileText, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { EmployeeRequests } from "./components/EmployeeRequests";
import { EmployeeHistory } from "./components/EmployeeHistory";
import { EmployeeBenefits } from "./components/EmployeeBenefits";
import { EmployeePayroll } from "./components/EmployeePayroll";
import { EmployeePersonalDocuments } from "./components/EmployeePersonalDocuments";

const PortalFuncionarioModule = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Employee Portal</h1>
          <p className="text-muted-foreground">
            Complete self-service portal with benefits, payroll, and document management
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">487</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Duty</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">70% available</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certifications</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Valid</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Benefits
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Payroll
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Employee Portal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Complete self-service portal with benefits management, payroll access,
                document upload, and feedback system. All data is secured with Row Level
                Security (RLS) - you can only access your own information.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    View your health insurance, retirement plans, and other benefits
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Payroll
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Access payslips, view payment history, and download tax documents
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Upload and manage personal identification documents
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits">
          <EmployeeBenefits />
        </TabsContent>

        <TabsContent value="payroll">
          <EmployeePayroll />
        </TabsContent>

        <TabsContent value="documents">
          <EmployeePersonalDocuments />
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Feedback & Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Autoavaliação Q4 2024</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">Prazo: 15 Jan 2025</p>
                      <Button className="w-full" onClick={() => toast.success("Formulário de autoavaliação aberto")}>
                        Iniciar Autoavaliação
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="border-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Feedback para Gestor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">Anônimo e confidencial</p>
                      <Button variant="outline" className="w-full" onClick={() => toast.success("Formulário de feedback aberto")}>
                        Enviar Feedback
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Avaliações Recentes</h4>
                  {[
                    { period: "Q3 2024", score: "4.2/5.0", status: "Concluída" },
                    { period: "Q2 2024", score: "4.0/5.0", status: "Concluída" },
                  ].map((review, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span>{review.period}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{review.score}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => toast.info(`Visualizando avaliação ${review.period}`)}>
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <EmployeeRequests />
        </TabsContent>

        <TabsContent value="history">
          <EmployeeHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PortalFuncionarioModule;
