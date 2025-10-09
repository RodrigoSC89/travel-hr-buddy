import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  MoreHorizontal,
  Sparkles,
  Brain,
  Zap,
  Target,
  TrendingUp,
  FileText,
  Image,
  BarChart3,
  Users,
  Ship,
  Calendar,
  Settings,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: string[];
  actions?: Action[];
  suggestions?: string[];
}

interface Action {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CopilotCapability {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "analytics" | "automation" | "compliance" | "operations";
  examples: string[];
}

const NautilusCopilotAdvanced: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const capabilities: CopilotCapability[] = [
    {
      id: "1",
      name: "Fleet Analytics",
      description: "Analyze vessel performance, fuel consumption, and route optimization",
      icon: <Ship className="h-4 w-4" />,
      category: "analytics",
      examples: [
        "Show me fuel consumption trends for Vessel A",
        "Which route is most efficient for cargo delivery?",
        "Compare performance metrics across the fleet"
      ]
    },
    {
      id: "2",
      name: "Compliance Monitoring",
      description: "Track certifications, PEOTRAM audits, and regulatory requirements",
      icon: <FileText className="h-4 w-4" />,
      category: "compliance",
      examples: [
        "Check upcoming certificate expirations",
        "Generate PEOTRAM compliance report",
        "Review safety audit findings"
      ]
    },
    {
      id: "3",
      name: "Crew Management",
      description: "Optimize crew scheduling, training, and performance tracking",
      icon: <Users className="h-4 w-4" />,
      category: "operations",
      examples: [
        "Schedule crew rotation for next month",
        "Find certified officers for emergency deployment",
        "Track training completion rates"
      ]
    },
    {
      id: "4",
      name: "Predictive Insights",
      description: "Forecast maintenance needs, market trends, and operational risks",
      icon: <TrendingUp className="h-4 w-4" />,
      category: "analytics",
      examples: [
        "Predict next maintenance window for engines",
        "Forecast freight rates for Q2",
        "Identify potential safety risks"
      ]
    },
    {
      id: "5",
      name: "Smart Automation",
      description: "Automate workflows, reports, and routine operational tasks",
      icon: <Zap className="h-4 w-4" />,
      category: "automation",
      examples: [
        "Set up automatic port arrival notifications",
        "Create weekly performance reports",
        "Automate certificate renewal reminders"
      ]
    },
    {
      id: "6",
      name: "Document Intelligence",
      description: "Extract insights from documents, contracts, and reports",
      icon: <Brain className="h-4 w-4" />,
      category: "operations",
      examples: [
        "Summarize latest industry regulations",
        "Extract key terms from charter agreements",
        "Analyze incident report patterns"
      ]
    }
  ];

  const initialMessage: Message = {
    id: "1",
    type: "assistant",
    content: `Hello! I'm your Nautilus Copilot, an AI assistant specialized in maritime operations. I can help you with:

🚢 **Fleet Analytics** - Performance insights and optimization
📋 **Compliance** - PEOTRAM audits, certifications, regulations  
👥 **Crew Management** - Scheduling, training, performance
📊 **Predictive Analytics** - Maintenance forecasting, risk analysis
⚡ **Automation** - Workflow optimization, smart notifications
🧠 **Document Intelligence** - Contract analysis, report generation

What would you like assistance with today?`,
    timestamp: new Date(),
    suggestions: [
      "Show me fleet performance overview",
      "Check upcoming certificate expirations",
      "Schedule crew for next voyage",
      "Generate compliance report"
    ]
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([initialMessage]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
        actions: [
          {
            id: "1",
            label: "View Details",
            icon: <BarChart3 className="h-3 w-3" />,
            action: () => toast({ title: "Opening detailed view..." })
          },
          {
            id: "2",
            label: "Export Data",
            icon: <FileText className="h-3 w-3" />,
            action: () => toast({ title: "Exporting data..." })
          }
        ],
        suggestions: [
          "Tell me more about this",
          "Show related metrics",
          "Set up monitoring alert"
        ]
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsProcessing(false);
    }, 2000);
  };

  const generateAIResponse = (input: string): string => {
    const responses = [
      "Based on your fleet data, I've identified several optimization opportunities. Your vessels are showing 15% higher fuel consumption than industry average. I recommend reviewing route planning and engine maintenance schedules.",
      
      "I found 3 certificates expiring in the next 30 days. Would you like me to initiate the renewal process? I can also set up automatic reminders for future expirations.",
      
      "Crew scheduling analysis complete. I've identified optimal rotation patterns that could reduce fatigue by 20% while maintaining operational efficiency. Shall I generate the updated schedule?",
      
      "Your PEOTRAM compliance score is 94.2%. I've detected minor gaps in documentation for safety procedures. I can help generate the missing reports and set up preventive measures."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    toast({
      title: isListening ? "Voice input stopped" : "Voice input started",
      description: isListening ? "Click again to start listening" : "Speak your question"
    });
  };

  const getCategoryColor = (category: CopilotCapability["category"]) => {
    switch (category) {
    case "analytics": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "automation": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "compliance": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "operations": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    default: return "bg-muted text-muted-foreground";
    }
  };

  const handleScheduleMaintenance = () => {
    toast({
      title: "🔧 Agendar Manutenção",
      description: "Abrindo sistema de agendamento de manutenção preventiva"
    });
    // TODO: Open maintenance scheduling dialog
  };

  const handleGenerateReport = () => {
    toast({
      title: "📄 Gerar Relatório",
      description: "Iniciando geração de relatório operacional"
    });
    // TODO: Open report generation dialog
  };

  const handleCrewPlanning = () => {
    toast({
      title: "👥 Planejamento de Tripulação",
      description: "Abrindo ferramenta de planejamento e escalas de tripulação"
    });
    // TODO: Open crew planning interface
  };

  return (
    <div className="h-[600px] flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Capabilities
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col">
          <Card className="flex-1 flex flex-col card-elegant">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-nautical flex items-center justify-center">
                  <Bot className="h-4 w-4 text-azure-50" />
                </div>
                Nautilus Copilot
                <Badge variant="secondary" className="ml-auto">
                  <div className="h-2 w-2 bg-success rounded-full mr-1" />
                  Online
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 px-6">
                <div className="space-y-4 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                        <div
                          className={`rounded-lg p-4 ${
                            message.type === "user"
                              ? "bg-gradient-nautical text-azure-50"
                              : "bg-muted"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          
                          {message.actions && (
                            <div className="flex gap-2 mt-3">
                              {message.actions.map((action) => (
                                <Button
                                  key={action.id}
                                  variant="outline"
                                  size="sm"
                                  onClick={action.action}
                                  className="h-7"
                                >
                                  {action.icon}
                                  <span className="ml-1">{action.label}</span>
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          {message.suggestions && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="h-6 text-xs"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span className="text-sm">Analyzing your request...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              <div className="p-6 pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleVoiceToggle}
                    className={isListening ? "bg-destructive text-destructive-foreground" : ""}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  
                  <div className="flex-1">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask me anything about your maritime operations..."
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      disabled={isProcessing}
                    />
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isProcessing}
                    className="btn-nautical"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities" className="flex-1">
          <div className="grid gap-4 md:grid-cols-2">
            {capabilities.map((capability) => (
              <Card key={capability.id} className="card-elegant hover-lift">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {capability.icon}
                    {capability.name}
                    <Badge 
                      variant="secondary" 
                      className={`ml-auto ${getCategoryColor(capability.category)}`}
                    >
                      {capability.category}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {capability.description}
                  </p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Examples:
                    </p>
                    {capability.examples.map((example, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="h-auto p-2 text-left justify-start text-xs w-full"
                        onClick={() => {
                          setActiveTab("chat");
                          setInputValue(example);
                        }}
                      >
                        "{example}"
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="flex-1">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-maritime">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nautical mb-2">+12.5%</div>
                <p className="text-sm text-muted-foreground">
                  Fleet efficiency improved this quarter through AI-driven optimizations
                </p>
              </CardContent>
            </Card>

            <Card className="card-maritime">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Automation Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nautical mb-2">47 hrs</div>
                <p className="text-sm text-muted-foreground">
                  Time saved monthly through automated workflows and reporting
                </p>
              </CardContent>
            </Card>

            <Card className="card-maritime">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nautical mb-2">23</div>
                <p className="text-sm text-muted-foreground">
                  Active recommendations for operational improvements
                </p>
              </CardContent>
            </Card>

            <Card className="card-maritime">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleScheduleMaintenance}>
                  <Calendar className="h-3 w-3 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleGenerateReport}>
                  <FileText className="h-3 w-3 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={handleCrewPlanning}>
                  <Users className="h-3 w-3 mr-2" />
                  Crew Planning
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NautilusCopilotAdvanced;