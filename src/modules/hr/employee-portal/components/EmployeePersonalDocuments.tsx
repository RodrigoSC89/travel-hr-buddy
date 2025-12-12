import { useEffect, useState } from "react";;

/**
 * PATCH 353: Employee Personal Documents Component
 * Upload and manage personal documents
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  CreditCard,
  Plus
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface PersonalDocument {
  id: string;
  document_type: string;
  document_name: string;
  document_number?: string;
  issue_date?: string;
  expiry_date?: string;
  issuing_authority?: string;
  file_url?: string;
  file_size?: number;
  mime_type?: string;
  status: string;
  created_at: string;
}

export const EmployeePersonalDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<PersonalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    document_type: "id_card",
    document_name: "",
    document_number: "",
    issue_date: "",
    expiry_date: "",
    issuing_authority: "",
    file: null as File | null
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("employee_personal_documents")
        .select("*")
        .eq("employee_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error("Error loading documents:", error);
      toast({
        title: "Error loading documents",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async () => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let fileUrl = null;
      let fileSize = null;
      let mimeType = null;

      // Upload file if provided
      if (formData.file) {
        const fileName = `${user.id}/${Date.now()}_${formData.file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("employee_documents")
          .upload(fileName, formData.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("employee_documents")
          .getPublicUrl(fileName);

        fileUrl = publicUrl;
        fileSize = formData.file.size;
        mimeType = formData.file.type;
      }

      // Calculate status based on expiry date
      let status = "valid";
      if (formData.expiry_date) {
        const daysUntilExpiry = differenceInDays(new Date(formData.expiry_date), new Date());
        if (daysUntilExpiry < 0) {
          status = "expired";
        } else if (daysUntilExpiry <= 30) {
          status = "expiring_soon";
        }
      }

      const { error } = await supabase
        .from("employee_personal_documents")
        .insert({
          employee_id: user.id,
          document_type: formData.document_type,
          document_name: formData.document_name,
          document_number: formData.document_number || null,
          issue_date: formData.issue_date || null,
          expiry_date: formData.expiry_date || null,
          issuing_authority: formData.issuing_authority || null,
          file_url: fileUrl,
          file_size: fileSize,
          mime_type: mimeType,
          status
        });

      if (error) throw error;

      toast({
        title: "✅ Document Uploaded",
        description: "Your document has been uploaded successfully",
      });

      setIsUploadOpen(false);
      resetForm();
      loadDocuments();
    } catch (error: any) {
      toast({
        title: "Error uploading document",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const { error } = await supabase
        .from("employee_personal_documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;

      toast({
        title: "Document Deleted",
        description: "Document has been removed",
      });

      loadDocuments();
    } catch (error: any) {
      toast({
        title: "Error deleting document",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      document_type: "id_card",
      document_name: "",
      document_number: "",
      issue_date: "",
      expiry_date: "",
      issuing_authority: "",
      file: null
    });
  };

  const getStatusBadge = (status: string, expiryDate?: string) => {
    const config: Record<string, { label: string; className: string; icon: any }> = {
      valid: { label: "Valid", className: "bg-green-500", icon: CheckCircle },
      expiring_soon: { label: "Expiring Soon", className: "bg-yellow-500", icon: AlertTriangle },
      expired: { label: "Expired", className: "bg-red-500", icon: XCircle },
      pending_verification: { label: "Pending", className: "bg-blue-500", icon: Clock },
      rejected: { label: "Rejected", className: "bg-red-500", icon: XCircle },
    };

    const statusConfig = config[status] || { label: status, className: "bg-gray-500", icon: FileText };
    const Icon = statusConfig.icon;

    return (
      <Badge className={statusConfig.className}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
        {status === "expiring_soon" && expiryDate && (
          <> ({differenceInDays(new Date(expiryDate), new Date())}d)</>
        )}
      </Badge>
    );
  };

  const getDocumentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      id_card: "ID Card",
      passport: "Passport",
      drivers_license: "Driver's License",
      birth_certificate: "Birth Certificate",
      social_security: "Social Security",
      work_permit: "Work Permit",
      contract: "Contract",
      certificate: "Certificate",
      diploma: "Diploma",
      other: "Other"
    };
    return labels[type] || type;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Personal Documents
              </CardTitle>
              <CardDescription>
                Upload and manage your personal identification documents
              </CardDescription>
            </div>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Personal Document</DialogTitle>
                  <DialogDescription>
                    Add a new document to your personal file
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="document_type">Document Type</Label>
                      <Select
                        value={formData.document_type}
                        onValueChange={(value) => setFormData({ ...formData, document_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id_card">ID Card</SelectItem>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="drivers_license">Driver's License</SelectItem>
                          <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                          <SelectItem value="social_security">Social Security</SelectItem>
                          <SelectItem value="work_permit">Work Permit</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                          <SelectItem value="diploma">Diploma</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="document_name">Document Name</Label>
                      <Input
                        id="document_name"
                        value={formData.document_name}
                        onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
                        placeholder="e.g., National ID"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="document_number">Document Number</Label>
                      <Input
                        id="document_number"
                        value={formData.document_number}
                        onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <Label htmlFor="issuing_authority">Issuing Authority</Label>
                      <Input
                        id="issuing_authority"
                        value={formData.issuing_authority}
                        onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="issue_date">Issue Date</Label>
                      <Input
                        id="issue_date"
                        type="date"
                        value={formData.issue_date}
                        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiry_date">Expiry Date</Label>
                      <Input
                        id="expiry_date"
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="file">Upload File</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                    />
                    {formData.file && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {formData.file.name} ({(formData.file.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={uploadDocument} disabled={uploading || !formData.document_name}>
                    {uploading ? "Uploading..." : "Upload Document"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No documents uploaded yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Badge variant="outline">{getDocumentTypeLabel(doc.document_type)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{doc.document_name}</TableCell>
                    <TableCell className="font-mono text-sm">{doc.document_number || "-"}</TableCell>
                    <TableCell>
                      {doc.expiry_date ? format(new Date(doc.expiry_date), "MMM dd, yyyy") : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status, doc.expiry_date || undefined)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {doc.file_url && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => window.open(doc.file_url!, "_blank")}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => window.open(doc.file_url!, "_blank")}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => deleteDocument(doc.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
