/**
 * Maritime Patches 151-155 Validation Hub
 * Centralized validation for maritime operational enhancements
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, FileSignature, Link2, Shield, Send } from "lucide-react";
import { Patch151Validation } from "./Patch151Validation";
import { Patch153Validation } from "./Patch153Validation";

export default function Patches151to155Validation() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Maritime Patches 151-155 Validation</h1>
        <p className="text-muted-foreground">
          Comprehensive validation for certification, port integration, digital signature, blockchain logs, and regulatory communication
        </p>
      </div>

      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle>Validation Summary</CardTitle>
          <CardDescription>
            Status dos patches marítimos implementados
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <FileCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-sm font-medium">PATCH 151</div>
            <div className="text-xs text-muted-foreground">Certification</div>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <Shield className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-sm font-medium">PATCH 152</div>
            <div className="text-xs text-muted-foreground">Port Authority</div>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <FileSignature className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-sm font-medium">PATCH 153</div>
            <div className="text-xs text-muted-foreground">Digital Signature</div>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <Link2 className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-sm font-medium">PATCH 154</div>
            <div className="text-xs text-muted-foreground">Blockchain Logs</div>
          </div>
          <div className="text-center p-4 bg-background/50 rounded-lg">
            <Send className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
            <div className="text-sm font-medium">PATCH 155</div>
            <div className="text-xs text-muted-foreground">Regulatory Channel</div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="151" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="151">PATCH 151</TabsTrigger>
          <TabsTrigger value="152">PATCH 152</TabsTrigger>
          <TabsTrigger value="153">PATCH 153</TabsTrigger>
          <TabsTrigger value="154">PATCH 154</TabsTrigger>
          <TabsTrigger value="155">PATCH 155</TabsTrigger>
        </TabsList>

        <TabsContent value="151">
          <Patch151Validation />
        </TabsContent>

        <TabsContent value="152">
          <Card>
            <CardHeader>
              <CardTitle>PATCH 152 – Port Authority Integration</CardTitle>
              <CardDescription>
                API integration with ANTAQ, Portbase, and OpenPort systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Validation pending implementation. Features: vessel arrival submission, real-time ETA updates,
                crew information sync, document compliance checking.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="153">
          <Patch153Validation />
        </TabsContent>

        <TabsContent value="154">
          <Card>
            <CardHeader>
              <CardTitle>PATCH 154 – Blockchain Log Registry</CardTitle>
              <CardDescription>
                Immutable log storage on Ethereum/Polygon networks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Validation pending implementation. Features: SHA-256 hash registration on blockchain,
                Ethereum Rinkeby and Polygon Mumbai support, block explorer integration.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="155">
          <Card>
            <CardHeader>
              <CardTitle>PATCH 155 – Regulatory Communication Channel</CardTitle>
              <CardDescription>
                Secure, encrypted communication with regulatory bodies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Validation pending implementation. Features: AES-256 encryption, email/WhatsApp notifications,
                temporary storage with 90-day auto-cleanup, full audit trail.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
