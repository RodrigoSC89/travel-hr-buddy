import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DocumentContentProps {
  content: string;
  title?: string;
}

export function DocumentContent({ content, title = "Conteúdo Atual" }: DocumentContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap">
        {content}
      </CardContent>
    </Card>
  );
}
