import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Heart, Moon, Zap } from "lucide-react";

export const HealthCheckIn = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    stress_level: 50,
    energy_level: 50,
    sleep_quality: 50,
    mood: 50,
    notes: "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar autenticado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("crew_health_logs").insert({
        crew_member_id: user.id,
        stress_level: formData.stress_level,
        energy_level: formData.energy_level,
        sleep_quality: formData.sleep_quality,
        mood: formData.mood,
        notes: formData.notes,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Check-in registrado",
        description: "Seus dados de bem-estar foram salvos com sucesso",
      });

      // Reset form
      setFormData({
        stress_level: 50,
        energy_level: 50,
        sleep_quality: 50,
        mood: 50,
        notes: "",
      });
    } catch (error) {
      console.error("Error submitting check-in:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o check-in",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Check-in de Bem-Estar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Nível de Estresse
            </Label>
            <span className="text-sm font-medium">{formData.stress_level}%</span>
          </div>
          <Slider
            value={[formData.stress_level]}
            onValueChange={([value]) => setFormData({ ...formData, stress_level: value })}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Nível de Energia
            </Label>
            <span className="text-sm font-medium">{formData.energy_level}%</span>
          </div>
          <Slider
            value={[formData.energy_level]}
            onValueChange={([value]) => setFormData({ ...formData, energy_level: value })}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Qualidade do Sono
            </Label>
            <span className="text-sm font-medium">{formData.sleep_quality}%</span>
          </div>
          <Slider
            value={[formData.sleep_quality]}
            onValueChange={([value]) => setFormData({ ...formData, sleep_quality: value })}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Humor Geral
            </Label>
            <span className="text-sm font-medium">{formData.mood}%</span>
          </div>
          <Slider
            value={[formData.mood]}
            onValueChange={([value]) => setFormData({ ...formData, mood: value })}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>Observações (opcional)</Label>
          <Textarea
            placeholder="Como você está se sentindo? Alguma preocupação específica?"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Salvando..." : "Registrar Check-in"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          🔒 Seus dados são confidenciais e protegidos
        </p>
      </CardContent>
    </Card>
  );
};
