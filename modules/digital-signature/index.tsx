/**
 * Digital Signature - Main Module
 * PATCH 153.0 - ICP-Brasil & OpenCert Integration
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSignature, Shield, Upload } from "lucide-react";

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
          <Card>
            <CardHeader>
              <CardTitle>Sign Document</CardTitle>
              <CardDescription>
                Apply digital signature to PDF documents with legal validity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload a certificate and sign documents with ICP-Brasil or OpenCert validation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Verify Signature</CardTitle>
              <CardDescription>
                Validate digital signatures using public key verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verify document authenticity and signature validity.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Digital Certificates</CardTitle>
              <CardDescription>
                Manage uploaded certificates and keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage your digital certificates for document signing.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DigitalSignature;
export * from "./types";
export * from "./services/signature-service";
