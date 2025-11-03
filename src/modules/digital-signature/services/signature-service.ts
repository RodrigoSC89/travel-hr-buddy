// Stub implementation for signature service to fix build
// This resolves a pre-existing broken import

export const generateSignature = async (data: any) => {
  console.log("Generate signature stub called", data);
  return { signature: "stub-signature" };
};

export const uploadCertificate = async (certificate: any) => {
  console.log("Upload certificate stub called", certificate);
  return { success: true, certificateId: "stub-cert-id" };
};

export const signDocument = async (documentId: string, certificate: any) => {
  console.log("Sign document stub called", documentId, certificate);
  return { signature: "stub-signature", timestamp: new Date().toISOString() };
};

export const verifySignature = async (signature: string, data: any) => {
  console.log("Verify signature stub called", signature, data);
  return { valid: true };
};

export const listCertificates = async () => {
  console.log("List certificates stub called");
  return [];
};

export const listSignedDocuments = async () => {
  console.log("List signed documents stub called");
  return [];
};
