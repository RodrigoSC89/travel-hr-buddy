import { useState, useCallback } from "react";;

/**
 * PATCH 562 - Beta Feedback System
 * 
 * Integrated feedback form component for collecting user feedback
 * during the closed beta testing phase
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface FeedbackData {
  userId: string;
  userName: string;
  email: string;
  rating: string;
  module: string;
  usabilityRating: string;
  performanceRating: string;
  comments: string;
  suggestions: string;
  bugs: string;
  timestamp: string;
  sessionDuration: number;
}

export const BetaFeedbackForm = memo(function() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStart] = useState(Date.now());
  
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    rating: "",
    module: "",
    usabilityRating: "",
    performanceRating: "",
    comments: "",
    suggestions: "",
    bugs: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const sessionDuration = (Date.now() - sessionStart) / 1000; // seconds
      
      const feedbackData: FeedbackData = {
        ...formData,
        userId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        sessionDuration,
      };

      // Store in Supabase
      const { error } = await supabase
        .from("beta_feedback")
        .insert([feedbackData]);

      if (error) throw error;

      // Also store locally for CSV/JSON export
      await fetch("/api/feedback/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      }).catch(() => {
        // Local storage fallback
        const existing = localStorage.getItem("beta_feedback") || "[]";
        const feedbacks = JSON.parse(existing);
        feedbacks.push(feedbackData);
        localStorage.setItem("beta_feedback", JSON.stringify(feedbacks));
      });

      toast({
        title: "Feedback Enviado!",
        description: "Obrigado por sua contribuição ao Travel HR Buddy Beta.",
      });

      // Reset form
      setFormData({
        userName: "",
        email: "",
        rating: "",
        module: "",
        usabilityRating: "",
        performanceRating: "",
        comments: "",
        suggestions: "",
        bugs: "",
      });
    } catch (error) {
      logger.error("[BetaFeedbackForm] Error submitting feedback:", error as Error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>🎯 Feedback Beta Phase 1</CardTitle>
        <CardDescription>
          Ajude-nos a melhorar o Travel HR Buddy compartilhando sua experiência
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="userName">Nome *</Label>
              <Input
                id="userName"
                required
                value={formData.userName}
                onChange={handleChange})}
                placeholder="Seu nome"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange})}
                placeholder="seu.email@exemplo.com"
              />
            </div>
          </div>

          {/* Overall Rating */}
          <div className="space-y-2">
            <Label>Satisfação Geral *</Label>
            <RadioGroup
              value={formData.rating}
              onValueChange={(value) => setFormData({ ...formData, rating: value })}
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="rating-5" />
                <Label htmlFor="rating-5">⭐⭐⭐⭐⭐ Excelente</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="rating-4" />
                <Label htmlFor="rating-4">⭐⭐⭐⭐ Muito Bom</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="rating-3" />
                <Label htmlFor="rating-3">⭐⭐⭐ Bom</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="rating-2" />
                <Label htmlFor="rating-2">⭐⭐ Regular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="rating-1" />
                <Label htmlFor="rating-1">⭐ Precisa Melhorar</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Module Testing */}
          <div>
            <Label htmlFor="module">Módulo Testado *</Label>
            <Input
              id="module"
              required
              value={formData.module}
              onChange={handleChange})}
              placeholder="Ex: Dashboard, Crew Management, Control Hub"
            />
          </div>

          {/* Usability Rating */}
          <div className="space-y-2">
            <Label>Facilidade de Uso *</Label>
            <RadioGroup
              value={formData.usabilityRating}
              onValueChange={(value) => setFormData({ ...formData, usabilityRating: value })}
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="usability-5" />
                <Label htmlFor="usability-5">Muito Fácil</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="usability-3" />
                <Label htmlFor="usability-3">Médio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="usability-1" />
                <Label htmlFor="usability-1">Difícil</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Performance Rating */}
          <div className="space-y-2">
            <Label>Performance do Sistema *</Label>
            <RadioGroup
              value={formData.performanceRating}
              onValueChange={(value) => setFormData({ ...formData, performanceRating: value })}
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="performance-5" />
                <Label htmlFor="performance-5">Muito Rápido</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="performance-3" />
                <Label htmlFor="performance-3">Aceitável</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="performance-1" />
                <Label htmlFor="performance-1">Lento</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Comments */}
          <div>
            <Label htmlFor="comments">Comentários Gerais</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={handleChange})}
              placeholder="Compartilhe sua experiência geral com o sistema..."
              rows={4}
            />
          </div>

          {/* Suggestions */}
          <div>
            <Label htmlFor="suggestions">Sugestões de Melhoria</Label>
            <Textarea
              id="suggestions"
              value={formData.suggestions}
              onChange={handleChange})}
              placeholder="O que você gostaria de ver melhorado ou adicionado?"
              rows={4}
            />
          </div>

          {/* Bug Reports */}
          <div>
            <Label htmlFor="bugs">Problemas Encontrados</Label>
            <Textarea
              id="bugs"
              value={formData.bugs}
              onChange={handleChange})}
              placeholder="Descreva qualquer bug ou problema que encontrou..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
