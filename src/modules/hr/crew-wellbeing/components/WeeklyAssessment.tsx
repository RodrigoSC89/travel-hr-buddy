import { useState, useCallback } from "react";;

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Brain, Heart, Moon, Battery, AlertCircle } from "lucide-react";

export const WeeklyAssessment: React.FC = () => {
  const [formData, setFormData] = useState({
    sleep_hours: 7,
    sleep_quality: 3,
    mood_rating: 3,
    stress_level: 3,
    energy_level: 3,
    nutrition_rating: 3,
    exercise_minutes: 0,
    water_intake_liters: 2.0,
    notes: "",
    concerns: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to submit an assessment",
          variant: "destructive",
        });
        return;
      }

      const concerns = formData.concerns
        ? formData.concerns.split(",").map((c) => c.trim()).filter((c) => c)
        : [];

      const { error } = await supabase.from("health_checkins").insert({
        user_id: user.id,
        sleep_hours: formData.sleep_hours,
        sleep_quality: formData.sleep_quality,
        mood_rating: formData.mood_rating,
        stress_level: formData.stress_level,
        energy_level: formData.energy_level,
        nutrition_rating: formData.nutrition_rating,
        exercise_minutes: formData.exercise_minutes,
        water_intake_liters: formData.water_intake_liters,
        notes: formData.notes,
        concerns: concerns.length > 0 ? concerns : null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your weekly assessment has been submitted",
      });

      // Reset form
      setFormData({
        sleep_hours: 7,
        sleep_quality: 3,
        mood_rating: 3,
        stress_level: 3,
        energy_level: 3,
        nutrition_rating: 3,
        exercise_minutes: 0,
        water_intake_liters: 2.0,
        notes: "",
        concerns: "",
      });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (value: number) => {
    switch (value) {
    case 1:
      return "Very Poor";
    case 2:
      return "Poor";
    case 3:
      return "Fair";
    case 4:
      return "Good";
    case 5:
      return "Excellent";
    default:
      return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          Weekly Wellbeing Assessment
        </CardTitle>
        <CardDescription>
          Complete your weekly self-assessment to track your wellbeing over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sleep Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Sleep</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Hours of Sleep (last night)</Label>
                <Input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.sleep_hours}
                  onChange={handleChange})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Sleep Quality: {getRatingLabel(formData.sleep_quality)}</Label>
                <Slider
                  value={[formData.sleep_quality]}
                  onValueChange={([value]) => setFormData({ ...formData, sleep_quality: value })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Mental Health Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Mental Health</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Mood Rating: {getRatingLabel(formData.mood_rating)}</Label>
                <Slider
                  value={[formData.mood_rating]}
                  onValueChange={([value]) => setFormData({ ...formData, mood_rating: value })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Stress Level: {getRatingLabel(6 - formData.stress_level)}</Label>
                <Slider
                  value={[formData.stress_level]}
                  onValueChange={([value]) => setFormData({ ...formData, stress_level: value })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Physical Health Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Physical Health</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Energy Level: {getRatingLabel(formData.energy_level)}</Label>
                <Slider
                  value={[formData.energy_level]}
                  onValueChange={([value]) => setFormData({ ...formData, energy_level: value })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Nutrition Rating: {getRatingLabel(formData.nutrition_rating)}</Label>
                <Slider
                  value={[formData.nutrition_rating]}
                  onValueChange={([value]) => setFormData({ ...formData, nutrition_rating: value })}
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Exercise (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.exercise_minutes}
                  onChange={handleChange})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Water Intake (liters)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.water_intake_liters}
                  onChange={handleChange})}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Additional Information</h3>
            </div>
            
            <div className="space-y-2">
              <Label>Concerns (comma-separated)</Label>
              <Input
                placeholder="e.g., headache, fatigue, anxiety"
                value={formData.concerns}
                onChange={handleChange})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any other information you'd like to share..."
                value={formData.notes}
                onChange={handleChange})}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  sleep_hours: 7,
                  sleep_quality: 3,
                  mood_rating: 3,
                  stress_level: 3,
                  energy_level: 3,
                  nutrition_rating: 3,
                  exercise_minutes: 0,
                  water_intake_liters: 2.0,
                  notes: "",
                  concerns: "",
                });
              }}
            >
              Reset
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});
