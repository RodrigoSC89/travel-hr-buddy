import { PortCostManager } from "@/components/operations/PortCostManager";
const PortCostPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Port Cost Manager</h1>
      <p className="text-muted-foreground">Port Disbursement Accounts (PDA) — proforma vs final cost analysis</p>
    </div>
    <PortCostManager />
  </div>
);
export default PortCostPage;
