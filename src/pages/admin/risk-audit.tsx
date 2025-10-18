import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, AlertTriangle, Shield, TrendingUp, FileCheck } from "lucide-react";
import { TacticalRiskPanel } from "@/components/admin/risk-audit/TacticalRiskPanel";
import { AuditSimulator } from "@/components/admin/risk-audit/AuditSimulator";
import { RecommendedActions } from "@/components/admin/risk-audit/RecommendedActions";
import { NormativeScores } from "@/components/admin/risk-audit/NormativeScores";

export default function RiskAuditPage() {
  const [activeTab, setActiveTab] = useState("risks");

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Tactical Navigation with AI</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered risk forecasting and audit predictability
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Pending tactical risks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Readiness</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Audit readiness score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              15-day forecast window
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <FileCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Pass probability
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Tactical Risks
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Shield className="h-4 w-4 mr-2" />
            Audit Simulator
          </TabsTrigger>
          <TabsTrigger value="actions">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recommended Actions
          </TabsTrigger>
          <TabsTrigger value="scores">
            <FileCheck className="h-4 w-4 mr-2" />
            Normative Scores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="space-y-4">
          <TacticalRiskPanel />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <AuditSimulator />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <RecommendedActions />
        </TabsContent>

        <TabsContent value="scores" className="space-y-4">
          <NormativeScores />
        </TabsContent>
      </Tabs>
    </div>
  );
}
