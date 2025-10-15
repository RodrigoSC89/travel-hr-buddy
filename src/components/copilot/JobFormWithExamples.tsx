import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import SimilarExamples from "./SimilarExamples";

export default function JobFormWithExamples() {
  const [description, setDescription] = useState("");
  const [component, setComponent] = useState("");

  const handleSubmit = () => {
    console.log("Criar job:", { component, description });
    // Aqui você integraria com sua API de criação de job
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">🧠 Criar Job com IA</h2>

      <Input
        placeholder="Componente (ex: 603.0004.02)"
        value={component}
        onChange={(e) => setComponent(e.target.value)}
      />

      <Textarea
        placeholder="Descreva o problema ou ação necessária..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Button onClick={handleSubmit}>✅ Criar Job</Button>

      <SimilarExamples input={description} onSelect={(text) => setDescription(text)} />
    </div>
  );
}
