import { useState, useMemo, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Heart, 
  Moon, 
  Apple, 
  Smile, 
  Activity, 
  AlertCircle,
  Save,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HealthMetrics {
  sleep_hours: number;
  sleep_quality: number;
  nutrition_rating: number;
  mood_rating: number;
  stress_level: number;
  energy_level: number;
  exercise_minutes: number;
  water_intake_liters: number;
  notes: string;
}

export const HealthCheckin: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<HealthMetrics>({
    sleep_hours: 7,
    sleep_quality: 3,
    nutrition_rating: 3,
    mood_rating: 3,
    stress_level: 3,
    energy_level: 3,
    exercise_minutes: 30,
    water_intake_liters: 2,
    notes: ""
  });

  const handleSubmit = async () => {
    // TODO: Implement actual save to Supabase
    toast({
      title: "Health Check-in Saved",
      description: "Your health metrics have been recorded successfully"
    });
  };

  const getRatingColor = (rating: number, inverse: boolean = false) => {
    if (inverse) {
      if (rating >= 4) return "text-red-500";
      if (rating === 3) return "text-yellow-500";
      return "text-green-500";
    }
    if (rating >= 4) return "text-green-500";
    if (rating === 3) return "text-yellow-500";
    return "text-red-500";
  };

  const getRatingIcon = (value: number) => {
    if (value >= 4) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Daily Health Check-in
          </CardTitle>
          <CardDescription>Track your wellbeing metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sleep */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-blue-500" />
                <Label>Sleep</Label>
              </div>
              <span className="text-sm font-medium">{metrics.sleep_hours} hours</span>
            </div>
            <Input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={metrics.sleep_hours}
              onChange={handleChange})}
              className="w-full"
            />
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Sleep Quality</Label>
                <span className={`text-sm font-medium ${getRatingColor(metrics.sleep_quality)}`}>
                  {metrics.sleep_quality}/5
                </span>
              </div>
              <Slider
                value={[metrics.sleep_quality]}
                onValueChange={(value) => setMetrics({ ...metrics, sleep_quality: value[0] })}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Nutrition */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-green-500" />
                <Label>Nutrition</Label>
              </div>
              <span className={`text-sm font-medium ${getRatingColor(metrics.nutrition_rating)}`}>
                {metrics.nutrition_rating}/5
              </span>
            </div>
            <Slider
              value={[metrics.nutrition_rating]}
              onValueChange={(value) => setMetrics({ ...metrics, nutrition_rating: value[0] })}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-yellow-500" />
                <Label>Mood</Label>
              </div>
              <span className={`text-sm font-medium ${getRatingColor(metrics.mood_rating)}`}>
                {metrics.mood_rating}/5
              </span>
            </div>
            <Slider
              value={[metrics.mood_rating]}
              onValueChange={(value) => setMetrics({ ...metrics, mood_rating: value[0] })}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          {/* Stress Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <Label>Stress Level</Label>
              </div>
              <span className={`text-sm font-medium ${getRatingColor(metrics.stress_level, true)}`}>
                {metrics.stress_level}/5
              </span>
            </div>
            <Slider
              value={[metrics.stress_level]}
              onValueChange={(value) => setMetrics({ ...metrics, stress_level: value[0] })}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          {/* Energy Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <Label>Energy Level</Label>
              </div>
              <span className={`text-sm font-medium ${getRatingColor(metrics.energy_level)}`}>
                {metrics.energy_level}/5
              </span>
            </div>
            <Slider
              value={[metrics.energy_level]}
              onValueChange={(value) => setMetrics({ ...metrics, energy_level: value[0] })}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
          </div>

          {/* Exercise */}
          <div className="space-y-2">
            <Label>Exercise (minutes)</Label>
            <Input
              type="number"
              min="0"
              max="300"
              value={metrics.exercise_minutes}
              onChange={handleChange})}
            />
          </div>

          {/* Water Intake */}
          <div className="space-y-2">
            <Label>Water Intake (liters)</Label>
            <Input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={metrics.water_intake_liters}
              onChange={handleChange})}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any concerns or notes about your wellbeing..."
              value={metrics.notes}
              onChange={handleChange})}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Check-in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});
