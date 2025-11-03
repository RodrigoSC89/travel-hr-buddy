/**
 * PATCH 598 - Quiz Generator Placeholder
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function QuizGenerator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Quiz Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Generate personalized quizzes based on crew member errors and weak areas.
        </p>
        <Button>Generate Quiz</Button>
      </CardContent>
    </Card>
  );
}
