/**
 * Crew Certifications Component - Manage certifications and compliance
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, AlertCircle, CheckCircle } from "lucide-react";

export function CrewCertifications() {
  // Mock data - to be replaced with real data from Supabase
  const certifications = [
    { id: 1, member: "John Smith", cert: "Master License", expiry: "2026-05-15", status: "valid" },
    { id: 2, member: "Maria Garcia", cert: "Chief Engineer License", expiry: "2025-11-20", status: "expiring" },
    { id: 3, member: "Ahmed Hassan", cert: "STCW Basic Safety", expiry: "2024-10-10", status: "expired" },
    { id: 4, member: "Lisa Chen", cert: "Engine Room Resource Management", expiry: "2026-03-01", status: "valid" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "default";
      case "expiring":
        return "outline";
      case "expired":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "expiring":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "expired":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crew Certifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(cert.status)}
                <div className="space-y-1">
                  <p className="font-medium">{cert.member}</p>
                  <p className="text-sm text-muted-foreground">{cert.cert}</p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {new Date(cert.expiry).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Badge variant={getStatusColor(cert.status)}>
                  {cert.status}
                </Badge>
                <Button variant="outline" size="sm">
                  Renew
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
