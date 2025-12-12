/**
import { useState } from "react";;
 * ISM/ISPS Checklist Component
 * Quick reference guide for maritime compliance requirements
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileCheck, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface RequirementItem {
  code: string;
  title: string;
  description: string;
}

interface CollapsibleSectionProps {
  title: string;
  requirements: RequirementItem[];
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, requirements, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-border/50 last:border-0">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-4 text-left hover:text-primary transition-colors">
        <span className="font-medium text-primary">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-4">
        <div className="space-y-3">
          {requirements.map((req, idx) => (
            <div key={idx} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-foreground">{req.code}</div>
                <div className="text-sm text-primary mt-1">{req.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{req.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default function ISMChecklist() {
  const ismRequirements: RequirementItem[] = [
    {
      code: "ISM Code 9.1",
      title: "Accident and Non-conformity Reporting",
      description: "All accidents, hazardous occurrences, and non-conformities must be reported and investigated.",
    },
    {
      code: "ISM Code 10.2",
      title: "Maintenance of Ship and Equipment",
      description: "Ensure ship and equipment are maintained in accordance with regulations and standards.",
    },
    {
      code: "ISM Code 10.3",
      title: "Inspection and Reporting of Deficiencies",
      description: "Regular inspections and prompt reporting of deficiencies and non-conformities.",
    },
  ];

  const ispsRequirements: RequirementItem[] = [
    {
      code: "ISPS Code Part B-16",
      title: "Security Incident Procedures",
      description: "Procedures for responding to security threats and breaches.",
    },
  ];

  const imcaRequirements: RequirementItem[] = [
    {
      code: "IMCA M109",
      title: "DP Incident Reporting",
      description: "Guidelines for Dynamic Positioning incident reporting and analysis.",
    },
    {
      code: "IMCA M140",
      title: "DP Operations",
      description: "Recommended practices for DP operations and failure response.",
    },
    {
      code: "IMCA M254",
      title: "DP Electrical Power and Control Systems",
      description: "Guidelines for DP electrical systems and redundancy.",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          ISM/ISPS Compliance Checklist
        </CardTitle>
        <CardDescription>
          Key maritime compliance requirements and standards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <CollapsibleSection title="ISM Code Requirements" requirements={ismRequirements} defaultOpen />
          <CollapsibleSection title="ISPS Code Requirements" requirements={ispsRequirements} />
          <CollapsibleSection title="IMCA Guidelines" requirements={imcaRequirements} />
        </div>
      </CardContent>
    </Card>
  );
}
