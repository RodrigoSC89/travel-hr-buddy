/**
 * PATCH 608: Travel Recommendations with LLM
 * AI-powered travel recommendations
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, MapPin, Calendar, DollarSign, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TravelRecommendation {
  destination: string;
  bestTime: string;
  estimatedCost: string;
  highlights: string[];
  transportation: string;
  accommodation: string;
  reasoning: string;
}

export default function TravelRecommendations() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState<TravelRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateRecommendations = async () => {
    if (!query.trim()) {
      toast({
        title: "Missing Information",
        description: "Please describe your travel preferences",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI recommendation generation
    setTimeout(() => {
      const mockRecommendations: TravelRecommendation[] = [
        {
          destination: "Fernando de Noronha",
          bestTime: "August - November",
          estimatedCost: "$1,500 - $2,500",
          highlights: ["Pristine beaches", "Marine life", "Diving", "Ecological reserve"],
          transportation: "Flight from major cities + boat",
          accommodation: "Beach resorts and eco-lodges",
          reasoning: "Based on your interest in beach destinations and marine life, Fernando de Noronha offers world-class diving and pristine beaches during the dry season.",
        },
        {
          destination: "Amazon Rainforest",
          bestTime: "June - November",
          estimatedCost: "$1,200 - $2,000",
          highlights: ["Wildlife tours", "Indigenous culture", "River cruises", "Biodiversity"],
          transportation: "Flight to Manaus + river boat",
          accommodation: "Jungle lodges and river boats",
          reasoning: "For adventure seekers, the Amazon during dry season offers the best wildlife viewing and accessible trails.",
        },
        {
          destination: "Iguazu Falls",
          bestTime: "March - May, September - November",
          estimatedCost: "$800 - $1,500",
          highlights: ["Waterfalls", "National park", "Wildlife", "Border experience"],
          transportation: "Flight to Foz do Iguaçu",
          accommodation: "Hotels near the park",
          reasoning: "Ideal for nature lovers, combining spectacular waterfalls with subtropical forest exploration.",
        },
      ];

      setRecommendations(mockRecommendations);
      setIsGenerating(false);

      toast({
        title: "Recommendations Generated",
        description: "AI has analyzed your preferences",
      });
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Travel Recommendations
          </CardTitle>
          <CardDescription>
            Get personalized travel suggestions powered by AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Describe your travel preferences... (e.g., 'I want a beach destination with good diving opportunities in Brazil, budget around $2000, traveling in October')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
            />
          </div>

          <Button 
            onClick={generateRecommendations} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Recommendations...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Personalized Recommendations</h3>
          {recommendations.map((rec, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {rec.destination}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4" />
                      Best Time to Visit
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.bestTime}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <DollarSign className="h-4 w-4" />
                      Estimated Cost
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.estimatedCost}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {rec.highlights.map((highlight, i) => (
                      <Badge key={i} variant="secondary">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium">Transportation</h4>
                    <p className="text-sm text-muted-foreground">{rec.transportation}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Accommodation</h4>
                    <p className="text-sm text-muted-foreground">{rec.accommodation}</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 text-blue-500" />
                    <div>
                      <h4 className="text-sm font-medium">AI Reasoning</h4>
                      <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
