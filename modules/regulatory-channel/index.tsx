/**
 * Regulatory Communication Channel - Main Module
 * PATCH 155.0 - Secure communication with regulatory bodies
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Send, History, Users } from "lucide-react";
import { listSubmissions, listAuthorities } from "./services/regulatory-service";

export const RegulatoryChannel: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [submissionsData, authoritiesData] = await Promise.all([
        listSubmissions(),
        listAuthorities()
      ]);
      setSubmissions(submissionsData);
      setAuthorities(authoritiesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      sent: "default",
      acknowledged: "default",
      responded: "default",
      closed: "outline"
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Regulatory Communication Channel</h1>
        <p className="text-muted-foreground">
          Secure, encrypted communication with maritime authorities (Marinha, ANTAQ)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <Send className="h-4 w-4 inline mr-2" />
              Total Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <History className="h-4 w-4 inline mr-2" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter(s => s.status === "pending").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <Shield className="h-4 w-4 inline mr-2" />
              Acknowledged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter(s => s.status === "acknowledged").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <Users className="h-4 w-4 inline mr-2" />
              Authorities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{authorities.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submit">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submit">
            <Send className="h-4 w-4 mr-2" />
            Submit Document
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            Submission History
          </TabsTrigger>
          <TabsTrigger value="authorities">
            <Users className="h-4 w-4 mr-2" />
            Authorities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit Secure Document</CardTitle>
              <CardDescription>
                Send encrypted documents and reports to regulatory authorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                All submissions are encrypted using AES-256 before transmission and stored
                temporarily with automatic cleanup after 90 days.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission History</CardTitle>
              <CardDescription>
                Track all submissions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No submissions found
                </p>
              ) : (
                <div className="space-y-4">
                  {submissions.slice(0, 10).map((submission) => (
                    <div key={submission.id} className="flex items-start justify-between border-b pb-3">
                      <div className="space-y-1">
                        <div className="font-medium">{submission.subject}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(submission.submittedAt).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          To: {submission.regulatory_authorities?.name || "Unknown Authority"}
                        </div>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authorities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Authorities</CardTitle>
              <CardDescription>
                Configured authorities for secure communication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {authorities.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    No authorities configured
                  </p>
                ) : (
                  authorities.map((authority) => (
                    <div key={authority.id} className="p-4 border rounded-lg">
                      <div className="font-medium">{authority.name}</div>
                      <Badge variant="outline" className="mt-2">
                        {authority.type}
                      </Badge>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {authority.email && <div>Email: {authority.email}</div>}
                        {authority.whatsapp && <div>WhatsApp: {authority.whatsapp}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-muted">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Security Features</p>
              <ul className="list-disc list-inside space-y-1">
                <li>AES-256 encryption for all data in transit and at rest</li>
                <li>Automatic notifications via email and WhatsApp</li>
                <li>Temporary storage with 90-day auto-cleanup</li>
                <li>Full audit trail and tracking</li>
                <li>Checksum verification for file integrity</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegulatoryChannel;
export * from "./types";
export * from "./services/regulatory-service";
export * from "./utils/encryption";
