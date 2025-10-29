import { Patch581Validation } from "@/modules/predictive-strategy/validation/Patch581Validation";
import { Patch582Validation } from "@/modules/decision-simulator/validation/Patch582Validation";
import { Patch583Validation } from "@/modules/neural-governance/validation/Patch583Validation";
import { Patch584Validation } from "@/modules/strategic-consensus/validation/Patch584Validation";
import { Patch585Validation } from "@/modules/executive-summary/validation/Patch585Validation";

export default function Patches581To585() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PATCHES 581-585 Validation</h1>
        <p className="text-muted-foreground">
          AI Strategic Decision System - Predictive Engine, Simulator, Governance, Consensus & Reports
        </p>
      </div>

      <div className="grid gap-6">
        <Patch581Validation />
        <Patch582Validation />
        <Patch583Validation />
        <Patch584Validation />
        <Patch585Validation />
      </div>
    </div>
  );
}
