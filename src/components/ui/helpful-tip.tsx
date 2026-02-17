import React from "react";
import { Lightbulb, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TipProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export const HelpfulTip: React.FC<TipProps> = ({
  title,
  description,
  action,
  onDismiss
}) => {
  return (
    <Card className="border-info/30 bg-info/10 animate-slide-in-down">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-info/20 rounded-full">
            <Lightbulb className="h-4 w-4 text-info" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="font-medium text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
            {action && (
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="border-info/30 text-info hover:bg-info/20"
              >
                {action.label}
              </Button>
            )}
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0 text-info hover:bg-info/20"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};