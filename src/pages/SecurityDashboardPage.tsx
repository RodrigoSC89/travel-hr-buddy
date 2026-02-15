/**
 * Security Dashboard Page
 * Exposes SecurityAuditChain + SessionManager to end users
 */
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecurityAuditChain } from "@/components/security/SecurityAuditChain";
import { SessionManager } from "@/components/security/SessionManager";
import { Shield, Link2, Monitor } from "lucide-react";

export default function SecurityDashboardPage() {
  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Auditoria blockchain, sessões ativas e controles de segurança
          </p>
        </div>
      </div>

      <Tabs defaultValue="audit-chain" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="audit-chain" className="gap-2">
            <Link2 className="w-4 h-4" />
            Audit Chain
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-2">
            <Monitor className="w-4 h-4" />
            Sessões Ativas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="audit-chain" className="mt-6">
          <SecurityAuditChain />
        </TabsContent>
        <TabsContent value="sessions" className="mt-6">
          <SessionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
