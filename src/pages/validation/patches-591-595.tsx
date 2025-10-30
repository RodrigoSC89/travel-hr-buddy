import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Patch591Validation from "@/modules/sociocognitive/validation/Patch591Validation";
import Patch592Validation from "@/modules/empathy/validation/Patch592Validation";
import Patch593Validation from "@/modules/neuro-adapter/validation/Patch593Validation";
import Patch594Validation from "@/modules/joint-decision/validation/Patch594Validation";
import Patch595Validation from "@/modules/emotion-feedback/validation/Patch595Validation";

export default function Patches591to595ValidationPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">PATCHES 591-595 - Human-AI Interaction Suite</CardTitle>
          <CardDescription>
            Validação dos módulos de interação humano-IA: SocioCognitive, Empathy, Neuro-Adapter, Joint Decision, Emotion Feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Execute cada validação individualmente para verificar o funcionamento dos sistemas de
            interação empática e adaptativa entre humano e IA.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Patch591Validation />
        <Patch592Validation />
        <Patch593Validation />
        <Patch594Validation />
        <Patch595Validation />
      </div>
    </div>
  );
}
