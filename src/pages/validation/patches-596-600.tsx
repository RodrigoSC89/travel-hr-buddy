import { Patch596Validation } from "@/modules/mission-intelligence/validation/Patch596Validation";
import { Patch597Validation } from "@/modules/signal-collector/validation/Patch597Validation";
import { Patch598Validation } from "@/modules/pattern-recognition/validation/Patch598Validation";
import { Patch599Validation } from "@/modules/mission-replay/validation/Patch599Validation";
import { Patch600Validation } from "@/modules/awareness-dashboard/validation/Patch600Validation";

export default function Patches596to600ValidationPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Validação de PATCHES 596-600</h1>
        <p className="text-muted-foreground">
          Sistema de inteligência persistente, coleta de sinais, reconhecimento de padrões, replay de missões e dashboard global
        </p>
      </div>

      <div className="grid gap-6">
        <Patch596Validation />
        <Patch597Validation />
        <Patch598Validation />
        <Patch599Validation />
        <Patch600Validation />
      </div>
    </div>
  );
}
