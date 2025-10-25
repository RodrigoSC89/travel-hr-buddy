/**
 * AI-Assisted Training Mode Component
 * PATCH 158.0 - Training Mode with Interactive AI Guidance
 * 
 * Provides step-by-step training with AI explanations,
 * interactive checklists, and incident replay simulations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Info,
  BookOpen,
  Lightbulb,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrainingStep {
  id: string;
  title: string;
  description: string;
  aiExplanation: string;
  action: string;
  completed: boolean;
  tips: string[];
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  steps: TrainingStep[];
}

const TRAINING_MODULES: TrainingModule[] = [
  {
    id: 'dashboard-basics',
    title: 'Dashboard Navigation Basics',
    description: 'Learn to navigate the main dashboard and understand key metrics',
    difficulty: 'beginner',
    duration: '10 min',
    steps: [
      {
        id: 'step-1',
        title: 'Understanding the Main Dashboard',
        description: 'Explore the main dashboard layout and key components',
        aiExplanation: 'The dashboard provides a centralized view of all critical operations. The top section shows real-time metrics, while the sidebar gives you quick access to all modules.',
        action: 'Navigate to the main dashboard',
        completed: false,
        tips: [
          'Look for color-coded status indicators',
          'Check the notification bell for updates',
          'Use the search bar for quick access',
        ],
      },
      {
        id: 'step-2',
        title: 'Reading Key Performance Indicators',
        description: 'Interpret KPIs and metrics displayed on cards',
        aiExplanation: 'Each KPI card shows a specific metric. Green indicates good performance, yellow means attention needed, and red signals critical issues requiring immediate action.',
        action: 'Identify and explain three KPIs',
        completed: false,
        tips: [
          'Hover over metrics for detailed tooltips',
          'Click cards for detailed breakdowns',
          'Use filters to customize your view',
        ],
      },
      {
        id: 'step-3',
        title: 'Accessing Module Sections',
        description: 'Learn how to navigate between different modules',
        aiExplanation: 'The sidebar contains links to all system modules. Each module has a dedicated icon and label. Click on any module to access its features and sub-sections.',
        action: 'Navigate to at least 3 different modules',
        completed: false,
        tips: [
          'Use breadcrumbs to track your location',
          'Sidebar can be collapsed for more space',
          'Recent items appear at the top',
        ],
      },
    ],
  },
  {
    id: 'incident-response',
    title: 'Incident Response Protocol',
    description: 'Master the incident response workflow from detection to resolution',
    difficulty: 'intermediate',
    duration: '20 min',
    steps: [
      {
        id: 'step-1',
        title: 'Incident Detection and Classification',
        description: 'Identify and properly classify different types of incidents',
        aiExplanation: 'When an incident occurs, the system will alert you. Your first task is to classify it correctly: Safety, Environmental, Equipment, or Personnel. This determines the response protocol.',
        action: 'Review and classify a sample incident',
        completed: false,
        tips: [
          'Review the incident severity matrix',
          'Consider potential escalation scenarios',
          'Document initial observations',
        ],
      },
      {
        id: 'step-2',
        title: 'Immediate Response Actions',
        description: 'Execute the appropriate immediate response procedures',
        aiExplanation: 'Based on the classification, the AI will suggest immediate actions. For safety incidents, prioritize personnel evacuation. For equipment failures, follow lockout/tagout procedures.',
        action: 'Complete the immediate response checklist',
        completed: false,
        tips: [
          'Follow the order of operations strictly',
          'Communicate with team members',
          'Document all actions taken',
        ],
      },
      {
        id: 'step-3',
        title: 'Investigation and Reporting',
        description: 'Conduct thorough investigation and document findings',
        aiExplanation: 'After immediate response, investigate root causes. Use the 5 Whys technique. Document evidence, interview witnesses, and create a comprehensive report.',
        action: 'Complete incident investigation form',
        completed: false,
        tips: [
          'Take photos and collect physical evidence',
          'Interview all involved parties',
          'Identify contributing factors',
        ],
      },
    ],
  },
  {
    id: 'safety-audit',
    title: 'SGSO Safety Audit Procedures',
    description: 'Complete safety audit process from planning to corrective actions',
    difficulty: 'advanced',
    duration: '30 min',
    steps: [
      {
        id: 'step-1',
        title: 'Pre-Audit Preparation',
        description: 'Prepare documentation and checklists for the audit',
        aiExplanation: 'Before conducting an audit, gather all relevant documentation: previous audit reports, incident logs, training records, and maintenance schedules. Review applicable regulations.',
        action: 'Complete pre-audit checklist',
        completed: false,
        tips: [
          'Review IMCA guidelines',
          'Check certification expiry dates',
          'Prepare interview questions',
        ],
      },
      {
        id: 'step-2',
        title: 'Conducting the Audit',
        description: 'Perform systematic inspection and documentation',
        aiExplanation: 'During the audit, follow the IMCA audit protocol systematically. Observe operations, interview personnel, inspect equipment, and verify documentation. Record all findings objectively.',
        action: 'Complete audit inspection',
        completed: false,
        tips: [
          'Use standardized checklists',
          'Take detailed notes',
          'Verify with physical inspection',
        ],
      },
      {
        id: 'step-3',
        title: 'Corrective Action Plan',
        description: 'Develop and implement corrective actions',
        aiExplanation: 'For each finding, develop specific corrective actions with timelines and responsible parties. Prioritize based on risk level. High-risk items require immediate action.',
        action: 'Create corrective action plan',
        completed: false,
        tips: [
          'Assign clear responsibilities',
          'Set realistic deadlines',
          'Schedule follow-up verifications',
        ],
      },
    ],
  },
];

export function TrainingModePanel() {
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAIHelp, setShowAIHelp] = useState(true);

  const currentStep = selectedModule?.steps[currentStepIndex];
  const progress = selectedModule
    ? ((selectedModule.steps.filter(s => s.completed).length) / selectedModule.steps.length) * 100
    : 0;

  const handleStepComplete = () => {
    if (selectedModule && currentStep) {
      const updatedSteps = [...selectedModule.steps];
      updatedSteps[currentStepIndex].completed = true;

      setSelectedModule({
        ...selectedModule,
        steps: updatedSteps,
      });

      // Move to next step if available
      if (currentStepIndex < selectedModule.steps.length - 1) {
        setTimeout(() => setCurrentStepIndex(currentStepIndex + 1), 500);
      }
    }
  };

  const handleReset = () => {
    if (selectedModule) {
      setSelectedModule({
        ...selectedModule,
        steps: selectedModule.steps.map(step => ({ ...step, completed: false })),
      });
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="h-8 w-8" />
            AI-Assisted Training Mode
          </h1>
          <p className="text-muted-foreground mt-1">
            Interactive learning with AI guidance - PATCH 158.0
          </p>
        </div>
      </div>

      <Tabs defaultValue="modules" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="active">Active Training</TabsTrigger>
          <TabsTrigger value="replay">Incident Replay</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRAINING_MODULES.map((module) => (
              <Card
                key={module.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg',
                  selectedModule?.id === module.id && 'ring-2 ring-primary'
                )}
                onClick={() => {
                  setSelectedModule(module);
                  setCurrentStepIndex(0);
                  setIsPlaying(false);
                }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getDifficultyColor(module.difficulty)}>
                      {module.difficulty}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {module.duration}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {module.steps.length} steps
                    </span>
                    <Button size="sm" variant="ghost">
                      Start Training
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {selectedModule ? (
            <div className="space-y-6">
              {/* Module Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle>{selectedModule.title}</CardTitle>
                      <CardDescription>
                        Step {currentStepIndex + 1} of {selectedModule.steps.length}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {progress.toFixed(0)}% Complete
                    </p>
                  </div>
                </CardHeader>
              </Card>

              {/* Current Step */}
              {currentStep && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          {currentStep.completed ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                          )}
                          <div>
                            <CardTitle>{currentStep.title}</CardTitle>
                            <CardDescription>{currentStep.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-primary/10 rounded-lg">
                          <p className="font-medium mb-2">Action Required:</p>
                          <p className="text-lg">{currentStep.action}</p>
                        </div>

                        {showAIHelp && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold mb-2">AI Guidance:</p>
                                <p className="text-sm">{currentStep.aiExplanation}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <p className="font-semibold flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Tips:
                          </p>
                          <ul className="space-y-1">
                            {currentStep.tips.map((tip, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2 text-sm"
                              >
                                <span className="text-primary mt-1">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {!currentStep.completed && (
                          <Button onClick={handleStepComplete} className="w-full">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Complete This Step
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Progress Checklist
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedModule.steps.map((step, index) => (
                            <div
                              key={step.id}
                              className={cn(
                                'flex items-start gap-3 p-2 rounded cursor-pointer transition-colors',
                                index === currentStepIndex &&
                                  'bg-primary/10 border border-primary',
                                step.completed && 'opacity-60'
                              )}
                              onClick={() => setCurrentStepIndex(index)}
                            >
                              {step.completed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{step.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  Step {index + 1}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">AI Assistance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setShowAIHelp(!showAIHelp)}
                        >
                          <Lightbulb className="mr-2 h-4 w-4" />
                          {showAIHelp ? 'Hide' : 'Show'} AI Guidance
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Report Issue
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Training Module Selected
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a training module from the Modules tab to begin
                  </p>
                  <Button onClick={() => setSelectedModule(TRAINING_MODULES[0])}>
                    Start with Basics
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="replay" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Replay Simulations</CardTitle>
              <CardDescription>
                Practice incident response with simulated scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Incident replay feature coming soon. This will allow you to
                practice response procedures with realistic incident scenarios.
              </p>
              <Button disabled>
                <Play className="mr-2 h-4 w-4" />
                Start Simulation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
