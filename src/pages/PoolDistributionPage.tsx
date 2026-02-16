import { PoolDistributionManager } from "@/components/operations/PoolDistributionManager";
const PoolDistributionPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Pool Distribution Manager</h1>
      <p className="text-muted-foreground">Revenue pooling, pool point calculation, and vessel earnings distribution</p>
    </div>
    <PoolDistributionManager />
  </div>
);
export default PoolDistributionPage;
