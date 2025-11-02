/**
 * Sign Document Form Component
 * PATCH 153.0 - Document signing with digital certificates
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileSignature, Loader2 } from "lucide-react";
import { signDocument, listCertificates } from "../services/signature-service";
import { DigitalCertificate } from "../types";

export const SignDocumentForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([]);
  const [formData, setFormData] = useState({
    documentId: "",
    documentName: "",
    documentUrl: "",
    certificateId: "",
    reason: "",
    location: "",
    contactInfo: ""
  });

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const certs = await listCertificates();
      setCertificates(certs);
    } catch (error) {
      console.error("Error loading certificates:", error);
      toast.error("Failed to load certificates");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const signedDoc = await signDocument(formData);
      toast.success("Document signed successfully!");
      
      // Reset form
      setFormData({
        documentId: "",
        documentName: "",
        documentUrl: "",
        certificateId: "",
        reason: "",
        location: "",
        contactInfo: ""
      });
    } catch (error) {
      console.error("Error signing document:", error);
      toast.error("Failed to sign document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="h-5 w-5" />
          Sign Document
        </CardTitle>
        <CardDescription>
          Apply digital signature to PDF documents with legal validity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="documentName">Document Name</Label>
            <Input
              id="documentName"
              value={formData.documentName}
              onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
              placeholder="contract.pdf"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentUrl">Document URL</Label>
            <Input
              id="documentUrl"
              type="url"
              value={formData.documentUrl}
              onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
              placeholder="https://example.com/document.pdf"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificateId">Digital Certificate</Label>
            <Select
              value={formData.certificateId}
              onValueChange={(value) => setFormData({ ...formData, certificateId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select certificate" />
              </SelectTrigger>
              <SelectContent>
                {certificates.length === 0 ? (
                  <SelectItem value="none" disabled>No certificates available</SelectItem>
                ) : (
                  certificates.map((cert) => (
                    <SelectItem key={cert.id} value={cert.id}>
                      {cert.name} ({cert.type})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Signing</Label>
            <Input
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Contract approval"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="São Paulo, BR"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Contact Info</Label>
              <Input
                id="contactInfo"
                type="email"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing Document...
              </>
            ) : (
              <>
                <FileSignature className="mr-2 h-4 w-4" />
                Sign Document
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
