/**
import { useState, useCallback } from "react";;
 * User Feedback Component
 * Quick feedback collection for user experience
 */

import React, { memo, useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface UserFeedbackProps {
  featureId: string;
  onSubmit?: (feedback: { rating: "positive" | "negative"; comment?: string }) => void;
  className?: string;
  compact?: boolean;
}

export const UserFeedback = memo(function UserFeedback({
  featureId,
  onSubmit,
  className,
  compact = false
}: UserFeedbackProps) {
  const [rating, setRating] = useState<"positive" | "negative" | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating) {
      onSubmit?.({ rating, comment: comment || undefined });
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className={cn(
        "flex items-center gap-2 text-sm text-green-600 dark:text-green-400",
        className
      )}>
        <ThumbsUp className="h-4 w-4" />
        <span>Obrigado pelo feedback!</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-xs text-muted-foreground">Foi útil?</span>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 w-7 p-0", rating === "positive" && "text-green-500")}
          onClick={() => {
            setRating("positive");
            onSubmit?.({ rating: "positive" });
            setSubmitted(true);
          }}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 w-7 p-0", rating === "negative" && "text-red-500")}
          onClick={() => {
            setRating("negative");
            setShowComment(true);
          }}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Esta funcionalidade foi útil?</span>
        <div className="flex gap-1">
          <Button
            variant={rating === "positive" ? "default" : "outline"}
            size="sm"
            onClick={handleSetRating}
            className={cn(rating === "positive" && "bg-green-500 hover:bg-green-600")}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Sim
          </Button>
          <Button
            variant={rating === "negative" ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setRating("negative");
              setShowComment(true);
            }}
            className={cn(rating === "negative" && "bg-red-500 hover:bg-red-600")}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            Não
          </Button>
        </div>
      </div>

      {showComment && (
        <div className="space-y-2">
          <Textarea
            placeholder="Como podemos melhorar? (opcional)"
            value={comment}
            onChange={handleChange}
            rows={2}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit}>
              Enviar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSetShowComment}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {rating === "positive" && !showComment && (
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSubmit}>
            Confirmar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSetShowComment}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Adicionar comentário
          </Button>
        </div>
      )}
    </div>
  );
});

export default UserFeedback;
