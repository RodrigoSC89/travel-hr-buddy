import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertTriangle, TrendingUp, Ship, FileText, Anchor } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ComplianceHub = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Compliance Hub</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.2%</div>
            <p className="text-xs text-muted-foreground">Overall rating</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Requirements Met</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342/348</div>
            <p className="text-xs text-muted-foreground">98.3% compliant</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+5.4%</div>
            <p className="text-xs text-muted-foreground">Improvement this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/pre-psc")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Ship className="h-6 w-6 text-primary" />
                  <CardTitle className="text-base">Pre-PSC Inspection</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Conduct internal Port State Control audits with AI assistance and digital signatures
                </p>
                <Button variant="link" className="p-0 h-auto mt-2">
                  Launch Module →
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <CardTitle className="text-base">MLC Inspection</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Maritime Labour Convention inspection and compliance tracking
                </p>
                <Button variant="link" className="p-0 h-auto mt-2">
                  View Module →
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Anchor className="h-6 w-6 text-primary" />
                  <CardTitle className="text-base">SGSO Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Safety Management System plans and action tracking
                </p>
                <Button variant="link" className="p-0 h-auto mt-2">
                  View Module →
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Module Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Centralized compliance management with regulatory tracking, automated monitoring, 
            risk assessment, and compliance reporting across all operations. Now includes Pre-Port 
            State Control inspections with AI-powered guidance and digital signatures.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceHub;
