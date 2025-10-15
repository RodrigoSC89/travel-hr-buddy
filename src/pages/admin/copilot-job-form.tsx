import { useState } from "react";
import { JobFormWithExamples } from "@/components/copilot";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Sparkles, Zap, Target, Brain } from "lucide-react";

export default function CopilotJobFormPage() {
  const [jobsCreated, setJobsCreated] = useState(0);

  const handleJobSubmit = (data: { component: string; description: string }) => {
    console.log("Job submitted:", data);
    setJobsCreated((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Copilot Job Form</h1>
          <Badge variant="secondary" className="ml-2">
            Production Ready
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Create maintenance jobs with AI-powered similar examples
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Job Form */}
        <div className="lg:col-span-2">
          <JobFormWithExamples onSubmit={handleJobSubmit} />
          
          {jobsCreated > 0 && (
            <Card className="mt-6 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    {jobsCreated} job{jobsCreated > 1 ? "s" : ""} created in this session
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Documentation */}
        <div className="lg:col-span-1 space-y-6">
          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                    1
                  </span>
                  <p className="text-sm">Enter component code (e.g., "603.0004.02")</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                    2
                  </span>
                  <p className="text-sm">Describe the maintenance problem</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                    3
                  </span>
                  <p className="text-sm">Click "Ver exemplos semelhantes"</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                    4
                  </span>
                  <p className="text-sm">AI searches historical cases with similarity scores</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                    5
                  </span>
                  <p className="text-sm">Click "Usar como base" to auto-fill</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                    6
                  </span>
                  <p className="text-sm">Review, edit, and submit the job</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Real-time AI suggestions</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Similarity scoring</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>One-click auto-fill</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Form validation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Toast notifications</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Responsive design</span>
              </div>
            </CardContent>
          </Card>

          {/* Example Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Example Scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Hydraulic System</p>
                <p className="text-xs text-muted-foreground">
                  Component: 603.0004.02<br />
                  Issue: Pressure drop detected
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Engine Maintenance</p>
                <p className="text-xs text-muted-foreground">
                  Component: 720.1001.05<br />
                  Issue: Unusual vibration
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Electrical System</p>
                <p className="text-xs text-muted-foreground">
                  Component: 450.2003.12<br />
                  Issue: Circuit malfunction
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Technology Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Technology
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium">AI:</span> OpenAI Embeddings
              </div>
              <div>
                <span className="font-medium">Framework:</span> React 18.3.1
              </div>
              <div>
                <span className="font-medium">UI:</span> Shadcn/UI + TailwindCSS
              </div>
              <div>
                <span className="font-medium">Language:</span> TypeScript (strict)
              </div>
            </CardContent>
          </Card>

          {/* Integration */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Integration</CardTitle>
              <CardDescription className="text-blue-700">
                Ready for production use
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-blue-900">
              <p>
                This component is production-ready and can be integrated into your
                application. Simply import and use with your own data sources.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
