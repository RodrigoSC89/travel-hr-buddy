import { Patch611Validation } from "@/visual/validation/Patch611Validation";
import { Patch612Validation } from "@/ai/inference/validation/Patch612Validation";
import { Patch613Validation } from "@/ai/decisions/validation/Patch613Validation";
import { Patch614Validation } from "@/ai/security/validation/Patch614Validation";
import { Patch615Validation } from "@/copilot/strategy/validation/Patch615Validation";

export default function Patches611To615() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PATCHES 611-615 Validation Suite</h1>
        <p className="text-muted-foreground">
          Validação completa dos patches 611 a 615 - Sistemas de Visualização 3D, Inferência, Decisões Autônomas, Ameaças e Estratégia de Copiloto
        </p>
      </div>

      <div className="space-y-6">
        <Patch611Validation />
        <Patch612Validation />
        <Patch613Validation />
        <Patch614Validation />
        <Patch615Validation />
      </div>
    </div>
  );
}
