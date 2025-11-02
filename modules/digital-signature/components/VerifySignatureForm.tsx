/**
 * Verify Signature Form Component
 * PATCH 153.0 - Signature verification interface
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, Loader2, CheckCircle, XCircle } from "lucide-react";
import { verifySignature } from "../services/signature-service";
import { SignatureVerification } from "../types";

export const VerifySignatureForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [signedDocumentId, setSignedDocumentId] = useState("");
  const [verification, setVerification] = useState<SignatureVerification | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await verifySignature(signedDocumentId);
      setVerification(result);
      
      if (result.valid) {
        toast.success("Signature is valid!");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error verifying signature:", error);
      toast.error("Failed to verify signature");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verify Signature
        </CardTitle>
        <CardDescription>
          Validate digital signatures using public key verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signedDocumentId">Signed Document ID</Label>
            <Input
              id="signedDocumentId"
              value={signedDocumentId}
              onChange={(e) => setSignedDocumentId(e.target.value)}
              placeholder="SIGNED-1234567890"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verify Signature
              </>
            )}
          </Button>
        </form>

        {verification && (
          <div className="mt-6 p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Verification Result</h3>
              <Badge variant={verification.valid ? "default" : "destructive"}>
                {verification.valid ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {verification.valid ? "VALID" : "INVALID"}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Message:</span>
                <p>{verification.message}</p>
              </div>
              
              <div>
                <span className="text-muted-foreground">Verified At:</span>
                <p>{new Date(verification.verifiedAt).toLocaleString()}</p>
              </div>

              {verification.signedDocument && (
                <>
                  <div>
                    <span className="text-muted-foreground">Signed By:</span>
                    <p>{verification.signedDocument.signedBy}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Signed At:</span>
                    <p>{new Date(verification.signedDocument.signedAt).toLocaleString()}</p>
                  </div>
                  {verification.signedDocument.reason && (
                    <div>
                      <span className="text-muted-foreground">Reason:</span>
                      <p>{verification.signedDocument.reason}</p>
                    </div>
                  )}
                </>
              )}

              {verification.certificate && (
                <>
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground font-medium">Certificate Details:</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p>{verification.certificate.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Issuer:</span>
                    <p>{verification.certificate.issuer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valid Until:</span>
                    <p>{new Date(verification.certificate.validTo).toLocaleDateString()}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
