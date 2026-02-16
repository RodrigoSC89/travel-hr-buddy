import { InsurancePIManager } from "@/components/operations/InsurancePIManager";
const InsurancePIPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Insurance & P&I Manager</h1>
      <p className="text-muted-foreground">Hull & Machinery, P&I Club, claims tracking, and policy management</p>
    </div>
    <InsurancePIManager />
  </div>
);
export default InsurancePIPage;
