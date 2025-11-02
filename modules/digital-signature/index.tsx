/**
 * Digital Signature - Main Module
 * PATCH 153.0 - ICP-Brasil & OpenCert Integration
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSignature, Shield, Upload } from "lucide-react";
import { SignDocumentForm } from "./components/SignDocumentForm";
import { VerifySignatureForm } from "./components/VerifySignatureForm";
import { CertificatesList } from "./components/CertificatesList";

export const DigitalSignature: React.FC = () => {
  const [activeTab, setActiveTab] = useState("sign");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Digital Signature</h1>
        <p className="text-muted-foreground">
          Sign documents with ICP-Brasil and OpenCert digital certificates
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sign" className="flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Sign Document
          </TabsTrigger>
          <TabsTrigger value="verify" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verify Signature
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Certificates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sign" className="mt-6">
          <SignDocumentForm />
        </TabsContent>

        <TabsContent value="verify" className="mt-6">
          <VerifySignatureForm />
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          <CertificatesList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DigitalSignature;
export * from "./types";
export * from "./services/signature-service";
