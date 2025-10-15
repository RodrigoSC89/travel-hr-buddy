import { JobFormWithExamples } from "@/components/copilot";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

export default function CopilotJobForm() {
  const handleJobSubmit = (data: { component: string; description: string }) => {
    console.log("Job submitted:", data);
    // In a real application, this would call an API to save the job
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            <Sparkles className="h-10 w-10 text-primary" />
            Job Form with AI Examples
          </h1>
          <p className="text-lg text-muted-foreground">
            Create maintenance jobs with intelligent suggestions from historical data
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-sm">
              🤖 AI Integration
            </Badge>
            <Badge variant="secondary" className="text-sm">
              🔍 Intelligent Search
            </Badge>
            <Badge variant="secondary" className="text-sm">
              🔧 Maintenance
            </Badge>
          </div>
        </div>

        {/* Main Component */}
        <JobFormWithExamples onSubmit={handleJobSubmit} />
      </div>
    </div>
  );
}
