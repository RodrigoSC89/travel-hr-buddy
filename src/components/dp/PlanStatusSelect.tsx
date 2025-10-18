import { useState } from "react";
import { toast } from "sonner";

interface Incident {
  id: string;
  plan_status?: string;
  plan_updated_at?: string;
}

interface PlanStatusSelectProps {
  incident: Incident;
  onUpdate?: (status: string) => void;
}

/**
 * Component for updating the action plan status of a DP incident
 * Allows selecting between: pendente, em andamento, concluído
 */
export function PlanStatusSelect({ incident, onUpdate }: PlanStatusSelectProps) {
  const [status, setStatus] = useState(incident.plan_status || "pendente");
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);

    try {
      const response = await fetch("/api/dp-incidents/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: incident.id, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar status");
      }

      toast.success("Status atualizado com sucesso!");
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate(newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar status");
      // Revert to previous status on error
      setStatus(incident.plan_status || "pendente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">Status do Plano</label>
      <select
        value={status}
        onChange={handleChange}
        className="w-full p-2 border rounded-md bg-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      >
        <option value="pendente">🕒 Pendente</option>
        <option value="em andamento">🔄 Em andamento</option>
        <option value="concluído">✅ Concluído</option>
      </select>
      {incident.plan_updated_at && (
        <p className="text-xs text-gray-500">
          Atualizado em {new Date(incident.plan_updated_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      )}
    </div>
  );
}
