import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createDocument } from "@/lib/documents/api"
import { toast } from "@/hooks/use-toast"
import TipTapEditor from "@/components/editor/TipTapEditor"

export default function CreateFromTemplate({ template }: { template: any }) {
  const [variables, setVariables] = useState<Record<string, string>>({})
  const [content, setContent] = useState<any>(template.content)
  const [title, setTitle] = useState(`Documento baseado em ${template.title}`)

  const extractVariables = (raw: string) => {
    const matches = raw.match(/{{(.*?)}}/g) || []
    return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, "").trim())))
  }

  const handleChangeVar = (key: string, value: string) => {
    setVariables((prev) => ({ ...prev, [key]: value }))
  }

  const applyVariables = () => {
    let raw = typeof template.content === "string"
      ? template.content
      : JSON.stringify(template.content)

    for (const key in variables) {
      const regex = new RegExp(`{{${key}}}`, "g")
      raw = raw.replace(regex, variables[key])
    }

    try {
      const parsed = JSON.parse(raw)
      setContent(parsed)
    } catch {
      setContent(raw)
    }
  }

  const handleSave = async () => {
    try {
      await createDocument({ title, content })
      toast({
        title: "✅ Documento salvo com sucesso!",
        description: "O documento foi salvo no banco de dados.",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar documento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      })
    }
  }

  const vars = extractVariables(JSON.stringify(template.content))

  return (
    <div className="space-y-4 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">📄 Criar Documento a partir do Template</h1>

      <Input
        placeholder="Título do Documento"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {vars.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">🔧 Preencha os campos variáveis:</p>
          {vars.map((key) => (
            <Input
              key={key}
              placeholder={`Valor para ${key}`}
              onChange={(e) => handleChangeVar(key, e.target.value)}
            />
          ))}
          <Button onClick={applyVariables}>⚙️ Aplicar Variáveis</Button>
        </div>
      )}

      <div className="mt-6 border rounded-xl p-4 shadow">
        <TipTapEditor content={content} onChange={setContent} />
      </div>

      <div className="flex justify-end mt-4 space-x-2">
        <Button variant="secondary" onClick={() => window.print()}>
          🖨️ Exportar PDF
        </Button>
        <Button onClick={handleSave}>
          💾 Salvar Documento
        </Button>
      </div>
    </div>
  )
}
