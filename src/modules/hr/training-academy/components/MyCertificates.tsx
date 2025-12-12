import { useEffect, useState } from "react";;

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateCertificatePDF } from "../services/generateCertificatePDF";

export const MyCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("academy_certificates")
        .select("*, academy_courses(title)")
        .eq("user_id", user.id)
        .order("issued_date", { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error loading certificates",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (cert: unknown: unknown: unknown) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const blob = await generateCertificatePDF({
        id: cert.id,
        certificate_number: cert.certificate_number,
        course_title: cert.academy_courses?.title || "Course",
        issued_date: cert.issued_date,
        final_score: cert.final_score,
        user_name: profile?.full_name || user.email || "Student",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${cert.certificate_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Certificate downloaded",
        description: "Your certificate has been downloaded.",
      });
    } catch (error: SupabaseError | null) {
      toast({
        title: "Error downloading certificate",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading certificates...</div>;
  }

  return (
    <div className="space-y-4">
      {certificates.map((cert) => (
        <Card key={cert.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">{cert.academy_courses?.title || "Course"}</CardTitle>
            </div>
            <Badge variant={cert.is_valid ? "default" : "secondary"}>
              {cert.is_valid ? "Valid" : "Expired"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Certificate No: {cert.certificate_number}
                </p>
                <p className="text-sm text-muted-foreground">
                  Issued: {new Date(cert.issued_date).toLocaleDateString()}
                </p>
                <p className="text-sm font-semibold">
                  Final Score: {cert.final_score}%
                </p>
              </div>
              <Button onClick={() => handleDownload(cert)} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {certificates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
            <p className="text-muted-foreground">
              Complete courses to earn certificates
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
