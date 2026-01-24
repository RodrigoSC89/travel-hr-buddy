/**
 * Health Check-In Offline Component - PATCH 1000
 * PATCH iOS PWA v14: Removed offline notice - navigator.onLine unreliable
 * Example of offline-first form that works without connectivity
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOfflineMutation } from '@/hooks/unified/useOffline';
import { indexedDBSync } from '@/lib/offline/indexeddb-sync';
import { toast } from 'sonner';
import { Heart, Moon, Brain, Cloud, Send, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthCheckInData {
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'bad';
  stress_level: number;
  sleep_quality: number;
  energy_level: number;
  notes?: string;
}

const MOOD_OPTIONS = [
  { value: 'excellent', label: 'Excelente 😊', color: 'bg-success' },
  { value: 'good', label: 'Bom 🙂', color: 'bg-success/80' },
  { value: 'neutral', label: 'Neutro 😐', color: 'bg-warning' },
  { value: 'poor', label: 'Ruim 😕', color: 'bg-warning/80' },
  { value: 'bad', label: 'Muito Ruim 😞', color: 'bg-destructive' },
];

export function HealthCheckInOffline() {
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState<HealthCheckInData>({
    mood: 'good',
    stress_level: 3,
    sleep_quality: 3,
    energy_level: 3,
    notes: '',
  });

  const mutation = useOfflineMutation<any, HealthCheckInData>({
    mutationFn: async (data) => {
      const checkInData = {
        ...data,
        id: `checkin-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        created_at: new Date().toISOString(),
      };
      
      await indexedDBSync.queueOperation(
        'insert',
        'crew_health_checkins',
        checkInData,
        'normal'
      );
      
      return checkInData;
    },
    actionType: 'health_checkin',
    successMessage: 'Check-in salvo com sucesso!',
    offlineMessage: 'Check-in salvo. Será sincronizado automaticamente.',
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          mood: 'good',
          stress_level: 3,
          sleep_quality: 3,
          energy_level: 3,
          notes: '',
        });
      }, 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const selectedMood = MOOD_OPTIONS.find(m => m.value === formData.mood);

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Check-in Registrado!</h3>
          <p className="text-muted-foreground text-sm">
            Seus dados foram salvos com sucesso.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-destructive" />
            Check-in de Saúde
          </CardTitle>
          <Badge 
            variant="outline" 
            className="flex items-center gap-1 text-success border-success/50"
          >
            <Cloud className="h-3 w-3" />
            Pronto
          </Badge>
        </div>
        <CardDescription>
          Registre como você está se sentindo. Funciona mesmo sem conexão!
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Selection */}
          <div className="space-y-2">
            <Label>Como você está se sentindo?</Label>
            <Select
              value={formData.mood}
              onValueChange={(value: HealthCheckInData['mood']) => 
                setFormData(prev => ({ ...prev, mood: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu humor" />
              </SelectTrigger>
              <SelectContent>
                {MOOD_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", option.color)} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stress Level */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-violet-500" />
              Nível de Estresse: {formData.stress_level}/5
            </Label>
            <Slider
              value={[formData.stress_level]}
              onValueChange={([value]) => 
                setFormData(prev => ({ ...prev, stress_level: value }))
              }
              min={1}
              max={5}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Relaxado</span>
              <span>Muito Estressado</span>
            </div>
          </div>

          {/* Sleep Quality */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-secondary" />
              Qualidade do Sono: {formData.sleep_quality}/5
            </Label>
            <Slider
              value={[formData.sleep_quality]}
              onValueChange={([value]) => 
                setFormData(prev => ({ ...prev, sleep_quality: value }))
              }
              min={1}
              max={5}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Péssimo</span>
              <span>Excelente</span>
            </div>
          </div>

          {/* Energy Level */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              ⚡ Nível de Energia: {formData.energy_level}/5
            </Label>
            <Slider
              value={[formData.energy_level]}
              onValueChange={([value]) => 
                setFormData(prev => ({ ...prev, energy_level: value }))
              }
              min={1}
              max={5}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Exausto</span>
              <span>Energizado</span>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Como você está se sentindo hoje?"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Salvando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Check-in
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default HealthCheckInOffline;
