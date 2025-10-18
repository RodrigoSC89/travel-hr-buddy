import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditSimulator, PerformanceDashboard, EvidenceManager } from '@/components/external-audit';
import { FileText, Activity, FolderOpen, Shield } from 'lucide-react';

const ExternalAuditSystem: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">External Audit System</h1>
        </div>
        <p className="text-gray-600">
          ETAPA 32: Comprehensive audit simulation, performance monitoring, and evidence management
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Three integrated features for maritime compliance management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">AI Audit Simulation</h3>
              </div>
              <p className="text-sm text-blue-700">
                Generate comprehensive audit reports in 30 seconds using GPT-4 AI analysis
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Performance Dashboard</h3>
              </div>
              <p className="text-sm text-green-700">
                Real-time vessel performance metrics with advanced analytics and visualizations
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <FolderOpen className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Evidence Management</h3>
              </div>
              <p className="text-sm text-purple-700">
                Structured repository with norm templates and compliance validation workflow
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="simulator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simulator" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Simulator
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Dashboard
          </TabsTrigger>
          <TabsTrigger value="evidence" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Evidence Manager
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="mt-6">
          <AuditSimulator />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <PerformanceDashboard />
        </TabsContent>

        <TabsContent value="evidence" className="mt-6">
          <EvidenceManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExternalAuditSystem;
