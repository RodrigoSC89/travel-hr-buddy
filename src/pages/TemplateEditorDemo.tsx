import TemplateEditorWithRewrite from "@/components/templates/template-editor-with-rewrite";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TemplateEditorDemo() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Editor de Templates com IA</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
          <CardDescription>
            Este editor permite que você escreva texto e use IA para melhorar trechos específicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2">
            <li>Digite ou cole seu texto no editor abaixo</li>
            <li>Selecione o trecho que deseja melhorar</li>
            <li>Clique no botão &quot;Reescrever seleção com IA&quot;</li>
            <li>Aguarde enquanto a IA reformula o texto</li>
            <li>O texto selecionado será substituído pela versão melhorada</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
          <CardDescription>
            Selecione um trecho e clique no botão para reescrever com IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateEditorWithRewrite />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exemplos de uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Texto original:</h3>
            <p className="text-sm text-muted-foreground">
              "A empresa precisa fazer melhorias nos processos de RH para ficar mais eficiente."
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Texto reescrito (exemplo):</h3>
            <p className="text-sm text-muted-foreground">
              "A organização necessita aprimorar seus procedimentos de Recursos Humanos visando aumentar a eficiência operacional."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
