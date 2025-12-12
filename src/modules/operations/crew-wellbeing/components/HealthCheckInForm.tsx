import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Activity, Brain, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const HealthCheckInForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    mood: "neutral",
    mood_score: 5,
    sleep_hours: 7,
    sleep_quality: "good",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    heart_rate: "",
    stress_level: 5,
    energy_level: 5,
    notes: "",
});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("crew_health_metrics").insert([
        {
          user_id: user.id,
          ...formData,
          blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null,
          blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null,
          heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : null,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Health check-in recorded",
        description: "Your health data has been saved successfully.",
      });

      // Reset form
      setFormData({
        mood: "neutral",
        mood_score: 5,
        sleep_hours: 7,
        sleep_quality: "good",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        heart_rate: "",
        stress_level: 5,
        energy_level: 5,
        notes: "",
      });

      onSuccess();
    } catch (error: unknown: unknown: unknown) {
      toast({
        title: "Error recording health data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Health Check-In</CardTitle>
        <CardDescription>Record your physical and mental wellbeing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold">Mental Wellbeing</Label>
            </div>

            <div className="space-y-2">
              <Label>How are you feeling today?</Label>
              <Select value={formData.mood} onValueChange={(v) => setFormData({ ...formData, mood: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">😊 Excellent</SelectItem>
                  <SelectItem value="good">🙂 Good</SelectItem>
                  <SelectItem value="neutral">😐 Neutral</SelectItem>
                  <SelectItem value="bad">🙁 Bad</SelectItem>
                  <SelectItem value="very_bad">😞 Very Bad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mood Score: {formData.mood_score}/10</Label>
              <Slider
                value={[formData.mood_score]}
                onValueChange={([v]) => setFormData({ ...formData, mood_score: v })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Stress Level: {formData.stress_level}/10</Label>
              <Slider
                value={[formData.stress_level]}
                onValueChange={([v]) => setFormData({ ...formData, stress_level: v })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Sleep Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Moon className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold">Sleep</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hours of Sleep</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.sleep_hours}
                  onChange={handleChange}
                  min="0"
                  max="24"
                />
              </div>

              <div className="space-y-2">
                <Label>Sleep Quality</Label>
                <Select value={formData.sleep_quality} onValueChange={(v) => setFormData({ ...formData, sleep_quality: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Physical Health Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-primary" />
              <Label className="text-base font-semibold">Physical Health</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Blood Pressure (Systolic)</Label>
                <Input
                  type="number"
                  placeholder="120"
                  value={formData.blood_pressure_systolic}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Blood Pressure (Diastolic)</Label>
                <Input
                  type="number"
                  placeholder="80"
                  value={formData.blood_pressure_diastolic}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Heart Rate (bpm)</Label>
              <Input
                type="number"
                placeholder="72"
                value={formData.heart_rate}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label>Energy Level: {formData.energy_level}/10</Label>
              <Slider
                value={[formData.energy_level]}
                onValueChange={([v]) => setFormData({ ...formData, energy_level: v })}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any symptoms, concerns, or additional information..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Submit Check-In"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
