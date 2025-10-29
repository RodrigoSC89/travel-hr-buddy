/**
 * PATCH 569 - Release Notes v3.5 Page
 * Public changelog with categorization and GitHub links
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, ExternalLink, Search, ThumbsUp, MessageSquare } from "lucide-react";
import { releaseNotes, categoryNames, categoryColors, PatchInfo } from "./release-data";
import { logger } from "@/lib/logger";
import { toast } from "sonner";

const ReleaseNotesV35: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [feedback, setFeedback] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const filteredNotes = releaseNotes.filter((patch) => {
    const matchesSearch =
      searchQuery === "" ||
      patch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patch.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "all" || patch.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const groupedByCategory = filteredNotes.reduce((acc, patch) => {
    if (!acc[patch.category]) {
      acc[patch.category] = [];
    }
    acc[patch.category].push(patch);
    return acc;
  }, {} as Record<string, PatchInfo[]>);

  const copyChangelog = () => {
    const markdown = generateMarkdown();
    navigator.clipboard.writeText(markdown);
    toast.success("Changelog copied to clipboard!");
    logger.info("[ReleaseNotes] Changelog copied");
  };

  const generateMarkdown = () => {
    let md = "# Release Notes v3.5\n\n";
    md += `**Total Patches:** ${releaseNotes.length}\n\n`;

    Object.entries(groupedByCategory).forEach(([category, patches]) => {
      md += `## ${categoryNames[category as keyof typeof categoryNames]}\n\n`;
      patches.forEach((patch) => {
        md += `### PATCH ${patch.id}: ${patch.title}\n`;
        md += `${patch.description}\n`;
        if (patch.githubUrl) {
          md += `[View on GitHub](${patch.githubUrl})\n`;
        }
        md += "\n";
      });
    });

    return md;
  };

  const submitFeedback = () => {
    if (feedback.trim()) {
      logger.info("[ReleaseNotes] User feedback submitted:", feedback);
      toast.success("Thank you for your feedback!");
      setFeedback("");
      setShowFeedbackForm(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white font-semibold">
            🚀 Release v3.5
          </div>
          <h1 className="text-4xl font-bold">What's New</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive changelog for PATCHES 391-570, bringing powerful new features, AI improvements, and bug fixes
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={copyChangelog} variant="outline">
              <Copy className="mr-2 h-4 w-4" />
              Copy Markdown
            </Button>
            <Button onClick={() => setShowFeedbackForm(!showFeedbackForm)} variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Feedback
            </Button>
          </div>
        </div>

        {/* Feedback Form */}
        {showFeedbackForm && (
          <Card>
            <CardHeader>
              <CardTitle>Share Your Feedback</CardTitle>
              <CardDescription>Let us know what you think about these updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Your feedback..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />
              <Button onClick={submitFeedback}>
                <ThumbsUp className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                >
                  All
                </Button>
                {Object.entries(categoryNames).map(([key, name]) => (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(categoryNames).map(([key, name]) => {
            const count = releaseNotes.filter((p) => p.category === key).length;
            return (
              <Card key={key}>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div
                      className={`inline-flex w-12 h-12 rounded-full ${
                        categoryColors[key as keyof typeof categoryColors]
                      } items-center justify-center text-white font-bold text-lg`}
                    >
                      {count}
                    </div>
                    <p className="text-sm font-medium">{name}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Release Notes */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.entries(categoryNames).map(([key, name]) => (
              <TabsTrigger key={key} value={key}>
                {name.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {Object.entries(groupedByCategory)
              .sort((a, b) => b[1].length - a[1].length)
              .map(([category, patches]) => (
                <div key={category} className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        categoryColors[category as keyof typeof categoryColors]
                      }`}
                    />
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h2>
                  {patches
                    .sort((a, b) => b.id - a.id)
                    .map((patch) => (
                      <PatchCard key={patch.id} patch={patch} />
                    ))}
                </div>
              ))}
          </TabsContent>

          {Object.keys(categoryNames).map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {groupedByCategory[category]
                ?.sort((a, b) => b.id - a.id)
                .map((patch) => (
                  <PatchCard key={patch.id} patch={patch} />
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

const PatchCard: React.FC<{ patch: PatchInfo }> = ({ patch }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline">PATCH {patch.id}</Badge>
              <Badge className={categoryColors[patch.category]}>
                {categoryNames[patch.category]}
              </Badge>
            </div>
            <CardTitle className="text-xl">{patch.title}</CardTitle>
          </div>
          {patch.githubUrl && (
            <Button variant="ghost" size="icon" asChild>
              <a href={patch.githubUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
        <CardDescription className="text-base">{patch.description}</CardDescription>
      </CardHeader>
    </Card>
  );
};

export default ReleaseNotesV35;
