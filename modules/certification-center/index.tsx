/**
 * Certification Center - Main Module
 * PATCH 151.0 - Digital Certification System
 * 
 * Features:
 * - Issue ISM, ISPS, IMCA certificates
 * - Generate PDF with QR Code
 * - SHA256 hash validation
 * - Certificate verification endpoint
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, Shield, History } from "lucide-react";
import { CertificationForm } from "./components/CertificationForm";
import { CertificateValidator } from "./components/CertificateValidator";
import { CertificateHistory } from "./components/CertificateHistory";

export const CertificationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState("issue");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCertificateIssued = () => {
    // Refresh history when new certificate is issued
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Certification Center</h1>
        <p className="text-muted-foreground">
          Digital issuance and validation of maritime certificates (ISM, ISPS, IMCA)
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="issue" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Issue Certificate
          </TabsTrigger>
          <TabsTrigger value="validate" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Validate
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issue" className="mt-6">
          <CertificationForm onSuccess={handleCertificateIssued} />
        </TabsContent>

        <TabsContent value="validate" className="mt-6">
          <CertificateValidator />
        </TabsContent>

        <TabsContent value="history" className="mt-6" key={refreshKey}>
          <CertificateHistory />
        </TabsContent>
      </Tabs>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ISM Certificate</CardTitle>
            <CardDescription>International Safety Management</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Safety management system certification for vessels and shipping companies.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ISPS Certificate</CardTitle>
            <CardDescription>International Ship and Port Security</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Security certification for ships and port facilities under SOLAS.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">IMCA Certificate</CardTitle>
            <CardDescription>International Marine Contractors</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Certification for marine contracting and offshore operations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificationCenter;

// Re-export types and services for external use
export * from "./types";
export * from "./services/certification-service";
export * from "./utils/pdf-generator";
