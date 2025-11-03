// Stub implementation for certification service to fix build
// This resolves a pre-existing broken import

export const issueCertificate = async (data: any) => {
  console.log("Certificate issuance stub called", data);
  return { success: true, certificateId: "stub-cert-id" };
};

export const validateCertificate = async (certificateId: string) => {
  console.log("Certificate validation stub called", certificateId);
  return { valid: true };
};

export const listCertificates = async () => {
  console.log("List certificates stub called");
  return [];
};
