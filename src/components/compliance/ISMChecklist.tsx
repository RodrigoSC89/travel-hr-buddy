/**
 * ISM/ISPS Checklist Component
 * Quick reference guide for maritime compliance requirements
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ISMChecklist() {
  const ismRequirements = [
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

  const ispsRequirements = [
    {
      code: "ISPS Code Part B-16",
      title: "Security Incident Procedures",
      description: "Procedures for responding to security threats and breaches.",
    },
  ];

  const imcaRequirements = [
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
    <Card className="bg-gray-950 border-cyan-800">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          ISM/ISPS Compliance Checklist
        </CardTitle>
        <CardDescription className="text-gray-400">
          Key maritime compliance requirements and standards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="ism" className="border-cyan-800/50">
            <AccordionTrigger className="text-cyan-400 hover:text-cyan-300">
              ISM Code Requirements
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {ismRequirements.map((req, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gray-900 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-200">{req.code}</div>
                      <div className="text-sm text-cyan-400 mt-1">{req.title}</div>
                      <div className="text-sm text-gray-400 mt-1">{req.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="isps" className="border-cyan-800/50">
            <AccordionTrigger className="text-cyan-400 hover:text-cyan-300">
              ISPS Code Requirements
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {ispsRequirements.map((req, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gray-900 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-200">{req.code}</div>
                      <div className="text-sm text-cyan-400 mt-1">{req.title}</div>
                      <div className="text-sm text-gray-400 mt-1">{req.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="imca" className="border-cyan-800/50">
            <AccordionTrigger className="text-cyan-400 hover:text-cyan-300">
              IMCA Guidelines
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {imcaRequirements.map((req, idx) => (
                  <div key={idx} className="flex gap-3 p-3 bg-gray-900 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-gray-200">{req.code}</div>
                      <div className="text-sm text-cyan-400 mt-1">{req.title}</div>
                      <div className="text-sm text-gray-400 mt-1">{req.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
