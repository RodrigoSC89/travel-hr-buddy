// Stub implementation for blockchain service to fix build
// This resolves a pre-existing broken import

export const recordTransaction = async (data: any) => {
  console.log("Record transaction stub called", data);
  return { txHash: "stub-tx-hash" };
};

export const verifyTransaction = async (txHash: string) => {
  console.log("Verify transaction stub called", txHash);
  return { valid: true };
};

export const getTransactionHistory = async () => {
  console.log("Get transaction history stub called");
  return [];
};
