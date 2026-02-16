import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { WorkflowTemplate } from "./types";
import { getCategoryIcon } from "./SmartWorkflowCard";

interface TemplatesTabProps {
  templates: WorkflowTemplate[];
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({ templates }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {templates.map((template) => (
      <Card key={template.name} className="border-border hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getCategoryIcon(template.category)}
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </div>
            <Badge variant="outline">{template.category}</Badge>
          </div>
          <CardDescription>{template.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Trigger: {template.trigger}</span>
              <span>{template.steps} etapas</span>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="w-3 h-3 mr-1" /> Usar Template
            </Button>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
