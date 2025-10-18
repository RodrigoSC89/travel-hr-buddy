import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PlanStatusSelectProps {
  incident: {
    id: string;
    plan_status?: string;
    plan_updated_at?: string;
  };
  onStatusChange?: (newStatus: string) => void;
}

export function PlanStatusSelect({ incident, onStatusChange }: PlanStatusSelectProps) {
  const [status, setStatus] = useState(incident.plan_status || "pendente");
  const [loading, setLoading] = useState(false);

  const handleChange = async (newStatus: string) => {
    const previousStatus = status;
    setStatus(newStatus);
    setLoading(true);

    try {
      const response = await fetch("/api/dp-incidents/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          id: incident.id, 
          status: newStatus 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar status");
      }

      const data = await response.json();
      
      if (data.ok) {
        toast.success("Status atualizado com sucesso");
        
        // Call the optional callback to update parent state
        if (onStatusChange) {
          onStatusChange(newStatus);
        }
      } else {
        throw new Error("Erro ao atualizar status");
      }
    } catch (error) {
      console.error("Error updating plan status:", error);
      
      // Revert to previous status on error
      setStatus(previousStatus);
      
      toast.error("Erro ao atualizar status", {
        description: error instanceof Error ? error.message : "Tente novamente mais tarde"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusEmoji = (statusValue: string) => {
    switch (statusValue) {
      case "pendente":
        return "🕒";
      case "em andamento":
        return "🔄";
      case "concluído":
        return "✅";
      default:
        return "🕒";
    }
  };

  const getStatusLabel = (statusValue: string) => {
    switch (statusValue) {
      case "pendente":
        return "Pendente";
      case "em andamento":
        return "Em andamento";
      case "concluído":
        return "Concluído";
      default:
        return "Pendente";
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="plan-status">Status do Plano</Label>
      <Select
        value={status}
        onValueChange={handleChange}
        disabled={loading}
      >
        <SelectTrigger id="plan-status" className="w-full">
          <SelectValue>
            {getStatusEmoji(status)} {getStatusLabel(status)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pendente">
            🕒 Pendente
          </SelectItem>
          <SelectItem value="em andamento">
            🔄 Em andamento
          </SelectItem>
          <SelectItem value="concluído">
            ✅ Concluído
          </SelectItem>
        </SelectContent>
      </Select>
      {incident.plan_updated_at && (
        <p className="text-xs text-muted-foreground">
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
