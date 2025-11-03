/**
 * Pre-PSC Form
 * Main inspection checklist form based on Port State Control guidelines
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, MinusCircle } from 'lucide-react';
import { PSCFinding } from './PSCScoreCalculator';

// PSC Checklist Categories based on Tokyo MOU and Paris MOU guidelines
const PSC_CHECKLIST_CATEGORIES = {
  'Certificates & Documentation': [
    'International Load Line Certificate',
    'International Oil Pollution Prevention (IOPP) Certificate',
    'International Sewage Pollution Prevention Certificate',
    'Minimum Safe Manning Document',
    'Crew List and Crew Certificates',
    'Garbage Management Plan',
    'Shipboard Oil Pollution Emergency Plan (SOPEP)',
    'Ship Security Plan (ISPS)',
  ],
  'Life-Saving Appliances': [
    'Lifeboats and Liferafts',
    'Lifeboat launching and release mechanism',
    'Lifejackets and immersion suits',
    'Life-buoys',
    'Emergency lighting',
    'Distress signals and flares',
  ],
  'Fire Safety': [
    'Fire detection and alarm systems',
    'Fixed fire extinguishing systems',
    'Portable fire extinguishers',
    'Fire doors and fire dampers',
    'Fire pumps and fire mains',
    'Emergency fire pump',
    'Fire drills and training records',
  ],
  'Navigation Equipment': [
    'Gyro compass',
    'Magnetic compass',
    'Radar and ARPA',
    'ECDIS (if applicable)',
    'AIS (Automatic Identification System)',
    'GMDSS equipment',
    'Echo sounder',
    'Speed and distance measuring device',
  ],
  'Structural Condition': [
    'Hull condition (corrosion, cracks, damage)',
    'Watertight integrity',
    'Cargo hold condition',
    'Ballast tanks',
    'Accommodation spaces',
    'Deck machinery',
  ],
  'Propulsion & Machinery': [
    'Main engine',
    'Auxiliary engines',
    'Steering gear',
    'Emergency steering',
    'Fuel oil system',
    'Bilge pumping arrangements',
  ],
  'Pollution Prevention': [
    'Oily water separator',
    'Oil record book',
    'Garbage record book',
    'Anti-fouling system',
    'Sewage treatment plant',
    'Ballast water management',
  ],
  'Working & Living Conditions': [
    'Crew accommodation',
    'Galley and food storage',
    'Medical facilities',
    'Sanitary facilities',
    'Recreational facilities',
    'Working conditions and hours of rest',
  ],
};

interface PrePSCFormProps {
  onSubmit: (data: {
    inspectorName: string;
    findings: PSCFinding[];
    recommendations: string[];
  }) => void;
  initialData?: {
    inspectorName?: string;
    findings?: PSCFinding[];
    recommendations?: string[];
  };
}

export function PrePSCForm({ onSubmit, initialData }: PrePSCFormProps) {
  const [inspectorName, setInspectorName] = useState(initialData?.inspectorName || '');
  const [findings, setFindings] = useState<Record<string, PSCFinding>>(
    initialData?.findings?.reduce((acc, finding) => {
      acc[`${finding.category}-${finding.item}`] = finding;
      return acc;
    }, {} as Record<string, PSCFinding>) || {}
  );
  const [recommendations, setRecommendations] = useState(
    initialData?.recommendations?.join('\n') || ''
  );

  const handleFindingChange = (
    category: string,
    item: string,
    field: keyof PSCFinding,
    value: any
  ) => {
    const key = `${category}-${item}`;
    setFindings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        category,
        item,
        [field]: value,
      } as PSCFinding,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const findingsArray = Object.values(findings).filter(
      f => f.status && f.status !== 'not-applicable'
    );

    const recommendationsArray = recommendations
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    onSubmit({
      inspectorName,
      findings: findingsArray,
      recommendations: recommendationsArray,
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'non-compliant':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'observation':
        return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'not-applicable':
        return <MinusCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getCategoryProgress = (category: string, items: string[]) => {
    const categoryFindings = items.map(item => findings[`${category}-${item}`]);
    const completed = categoryFindings.filter(f => f?.status).length;
    return `${completed}/${items.length}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inspector Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inspector">Inspector Name *</Label>
              <Input
                id="inspector"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                placeholder="Enter inspector name"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PSC Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {Object.entries(PSC_CHECKLIST_CATEGORIES).map(([category, items]) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{category}</span>
                    <Badge variant="outline">
                      {getCategoryProgress(category, items)}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-4">
                    {items.map((item) => {
                      const key = `${category}-${item}`;
                      const finding = findings[key] || {};

                      return (
                        <div key={key} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(finding.status)}
                              <Label className="text-base">{item}</Label>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Status *</Label>
                              <RadioGroup
                                value={finding.status || ''}
                                onValueChange={(value) =>
                                  handleFindingChange(category, item, 'status', value)
                                }
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="compliant" id={`${key}-compliant`} />
                                  <Label htmlFor={`${key}-compliant`}>Compliant</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="non-compliant" id={`${key}-non-compliant`} />
                                  <Label htmlFor={`${key}-non-compliant`}>Non-Compliant</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="observation" id={`${key}-observation`} />
                                  <Label htmlFor={`${key}-observation`}>Observation</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="not-applicable" id={`${key}-na`} />
                                  <Label htmlFor={`${key}-na`}>Not Applicable</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {finding.status && finding.status !== 'not-applicable' && (
                              <div>
                                <Label>Severity</Label>
                                <Select
                                  value={finding.severity || ''}
                                  onValueChange={(value) =>
                                    handleFindingChange(category, item, 'severity', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select severity" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>

                          {finding.status && finding.status !== 'not-applicable' && (
                            <div>
                              <Label>Description/Notes</Label>
                              <Textarea
                                value={finding.description || ''}
                                onChange={(e) =>
                                  handleFindingChange(category, item, 'description', e.target.value)
                                }
                                placeholder="Add notes about this item..."
                                rows={2}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={recommendations}
            onChange={(e) => setRecommendations(e.target.value)}
            placeholder="Add general recommendations or notes (one per line)..."
            rows={6}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="submit" size="lg">
          Complete Inspection
        </Button>
      </div>
    </form>
  );
}
