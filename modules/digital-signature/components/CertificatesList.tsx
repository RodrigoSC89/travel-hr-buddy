/**
 * Certificates List Component
 * PATCH 153.0 - Display uploaded certificates
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileCheck } from "lucide-react";
import { listCertificates } from "../services/signature-service";
import { DigitalCertificate } from "../types";

export const CertificatesList: React.FC = () => {
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const certs = await listCertificates();
      setCertificates(certs);
    } catch (error) {
      console.error("Error loading certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCertTypeColor = (type: string) => {
    switch (type) {
    case "ICP-Brasil": return "default";
    case "OpenCert": return "secondary";
    case "Custom": return "outline";
    default: return "outline";
    }
  };

  const isExpired = (validTo: string) => {
    return new Date(validTo) < new Date();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Digital Certificates
        </CardTitle>
        <CardDescription>
          Manage uploaded certificates and keys
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Loading certificates...</p>
        ) : certificates.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No certificates uploaded yet
          </p>
        ) : (
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div 
                key={cert.id}
                className="p-4 border rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">{cert.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getCertTypeColor(cert.type)}>
                      {cert.type}
                    </Badge>
                    {isExpired(cert.validTo) && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Issuer:</span>
                    <p className="truncate">{cert.issuer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subject:</span>
                    <p className="truncate">{cert.subject}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid From:</span>
                    <p>{new Date(cert.validFrom).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid Until:</span>
                    <p>{new Date(cert.validTo).toLocaleDateString()}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Fingerprint:</span>
                    <p className="font-mono text-xs truncate">{cert.fingerprint}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Serial Number:</span>
                    <p className="text-xs">{cert.serialNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
