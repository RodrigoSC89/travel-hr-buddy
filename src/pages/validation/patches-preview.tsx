import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Brain, Eye, Mic, Box, GitBranch, Target, Shield, Lightbulb } from "lucide-react";

export default function PatchesPreview() {
  const navigate = useNavigate();

  const patchGroups = [
    {
      title: "Patches 601-605: Strategic AI Core",
      description: "Motores de raciocínio estratégico e aprendizado adaptativo",
      patches: [
        { id: 601, name: "Strategic Reasoning Engine", icon: Brain, color: "bg-blue-500" },
        { id: 602, name: "Multilevel Context Awareness", icon: Eye, color: "bg-purple-500" },
        { id: 603, name: "Multimodal Feedback Analyzer", icon: Mic, color: "bg-green-500" },
        { id: 604, name: "Mission Tactic Optimizer", icon: Target, color: "bg-orange-500" },
        { id: 605, name: "Feedback-Driven Learning Loop", icon: Lightbulb, color: "bg-yellow-500" }
      ],
      route: "/validation/patches-601-605"
    },
    {
      title: "Patches 606-610: Voice & Awareness",
      description: "Sistemas de detecção visual e comandos distribuídos por voz",
      patches: [
        { id: 606, name: "Visual Situational Awareness", icon: Eye, color: "bg-cyan-500" },
        { id: 607, name: "Anomaly Pattern Detector", icon: Shield, color: "bg-red-500" },
        { id: 608, name: "Distributed Voice Commands", icon: Mic, color: "bg-indigo-500" },
        { id: 609, name: "Voice Tactical Fallback", icon: Mic, color: "bg-pink-500" },
        { id: 610, name: "Embedded Voice Feedback", icon: Mic, color: "bg-teal-500" }
      ],
      route: "/validation/patches-606-610"
    },
    {
      title: "Patches 611-615: Advanced Operations",
      description: "Visualização 3D, inferência por grafos e recomendação estratégica",
      patches: [
        { id: 611, name: "Ops 3D Visualizer Core", icon: Box, color: "bg-violet-500" },
        { id: 612, name: "Graph-Based Inference Engine", icon: GitBranch, color: "bg-emerald-500" },
        { id: 613, name: "Autonomous Decision Simulator", icon: Brain, color: "bg-amber-500" },
        { id: 614, name: "Contextual Threat Monitor", icon: Shield, color: "bg-rose-500" },
        { id: 615, name: "Joint Copilot Strategy", icon: Lightbulb, color: "bg-sky-500" }
      ],
      route: "/validation/patches-611-615"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            NAUTILUS ONE - Validation Preview
          </h1>
          <p className="text-lg text-muted-foreground">
            Sistema completo de validação dos patches 601-615
          </p>
          <Badge variant="outline" className="text-lg px-4 py-2">
            15 Patches Implementados
          </Badge>
        </div>

        {/* Patch Groups */}
        <div className="grid gap-6">
          {patchGroups.map((group) => (
            <Card key={group.route} className="border-2 hover:border-primary/50 transition-all">
              <CardHeader>
                <CardTitle className="text-2xl">{group.title}</CardTitle>
                <CardDescription className="text-base">{group.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                  {group.patches.map((patch) => {
                    const Icon = patch.icon;
                    return (
                      <div
                        key={patch.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className={`p-2 rounded-md ${patch.color}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">PATCH {patch.id}</p>
                          <p className="text-xs text-muted-foreground truncate">{patch.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  onClick={() => navigate(group.route)}
                  className="w-full"
                  size="lg"
                >
                  Validar {group.patches.length} Patches →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">15</p>
                <p className="text-sm text-muted-foreground">Patches Validados</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">5</p>
                <p className="text-sm text-muted-foreground">Sistemas Core</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">Cobertura de Validação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
