import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Patch566Validation from "@/modules/copilot-presenter/validation/Patch566Validation";
import Patch567Validation from "@/modules/auto-tuning/validation/Patch567Validation";
import Patch568Validation from "@/modules/ai-evolution/validation/Patch568Validation";
import Patch569Validation from "@/modules/release-notes/validation/Patch569Validation";
import Patch570Validation from "@/modules/watchdog/validation/Patch570Validation";

export default function Patches566To570() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-3xl">Validação PATCH 566-570</CardTitle>
          <CardDescription>
            Sistema de apresentação inteligente, auto-tuning, evolução AI, release notes e watchdog automático
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Patch566Validation />
          <Patch567Validation />
          <Patch568Validation />
          <Patch569Validation />
          <Patch570Validation />
        </CardContent>
      </Card>
    </div>
  );
}
