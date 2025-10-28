/**
 * Certificate Validator Component
 * PATCH 151.0 - Validate certificates
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, AlertCircle, Loader2, QrCode } from "lucide-react";
import { validateCertificate } from "../services/certification-service";
import { ValidationResult } from "../types";

export const CertificateValidator: React.FC = () => {
  const [certificateId, setCertificateId] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);

  const handleValidate = async () => {
    if (!certificateId) {
      toast.error("Please enter a certificate ID");
      return;
    }

    setLoading(true);
    try {
      const validationResult = await validateCertificate(certificateId, hash || undefined);
      setResult(validationResult);
      
      if (validationResult.valid) {
        toast.success("Certificate is valid!");
      } else {
        toast.error(validationResult.message);
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Failed to validate certificate");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!result) return "default";
    return result.valid ? "success" : "destructive";
  };

  const getStatusIcon = () => {
    if (!result) return null;
    return result.valid ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Validate Certificate
        </CardTitle>
        <CardDescription>
          Verify the authenticity of a digital certificate using ID and hash
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="certificateId">Certificate ID</Label>
          <Input
            id="certificateId"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="CERT-ISM-1234567890"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hash">Hash (Optional)</Label>
          <Input
            id="hash"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="SHA-256 hash from certificate"
          />
        </div>

        <Button onClick={handleValidate} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Validate Certificate
            </>
          )}
        </Button>

        {/* Validation Result */}
        {result && (
          <div className="mt-6 p-4 border rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {getStatusIcon()}
                Validation Result
              </h3>
              <Badge variant={result.valid ? "default" : "destructive"}>
                {result.valid ? "VALID" : "INVALID"}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {result.message}
              </p>
              <p className="text-xs text-muted-foreground">
                Verified at: {new Date(result.verifiedAt).toLocaleString()}
              </p>
            </div>

            {result.certificate && (
              <div className="mt-4 space-y-3 border-t pt-4">
                <h4 className="font-semibold">Certificate Details</h4>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline" className="ml-2">{result.certificate.type}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline" className="ml-2">
                      {result.certificate.operationDetails.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Vessel:</span>
                    <span className="ml-2 font-medium">{result.certificate.vesselName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">IMO:</span>
                    <span className="ml-2">{result.certificate.imoNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issued By:</span>
                    <span className="ml-2">{result.certificate.issuedBy}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issue Date:</span>
                    <span className="ml-2">
                      {new Date(result.certificate.issuedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <span className="ml-2">
                      {new Date(result.certificate.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="font-semibold">Operation Details</div>
                  <div>
                    <span className="text-muted-foreground">Port:</span>
                    <span className="ml-2">{result.certificate.operationDetails.portName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inspector:</span>
                    <span className="ml-2">{result.certificate.operationDetails.inspectorName}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR Code Scanner Info */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="flex items-start gap-2">
            <QrCode className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">Scan QR Code</p>
              <p className="mt-1">
                Use your device camera to scan the QR code on a certificate for instant validation.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
