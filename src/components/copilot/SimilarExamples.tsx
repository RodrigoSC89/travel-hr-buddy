import { useState } from "react";
import { querySimilarJobs, SimilarJobResult } from "@/lib/ai/copilot/querySimilarJobs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SimilarExamples({ input, onSelect }: { input: string, onSelect?: (text: string) => void }) {
  const [examples, setExamples] = useState<SimilarJobResult[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExamples = async () => {
    setLoading(true);
    try {
      const result = await querySimilarJobs(input);
      setExamples(result || []);
    } catch (err) {
      console.error("Erro ao buscar exemplos:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Button onClick={fetchExamples} disabled={loading}>
        {loading ? "Buscando exemplos..." : "🔍 Ver exemplos semelhantes"}
      </Button>

      {examples.length > 0 && (
        <div className="mt-4 grid gap-4">
          {examples.map((job, i) => (
            <Card key={i} className="p-4 shadow">
              <h3 className="font-semibold text-lg">🔧 {job.metadata.title}</h3>
              <p><strong>Componente:</strong> {job.metadata.component_id}</p>
              <p><strong>Data:</strong> {new Date(job.metadata.created_at).toLocaleDateString()}</p>
              <p className="mt-2"><strong>🧠 Sugestão IA:</strong><br />{job.metadata.ai_suggestion || "N/A"}</p>
              <Button
                className="mt-2"
                variant="outline"
                onClick={() => onSelect?.(job.metadata.ai_suggestion || "")}
              >📋 Usar como base</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
