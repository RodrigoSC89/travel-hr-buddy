import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Document {
  title: string;
  content: string;
  created_at: string;
}

interface DocumentContentProps {
  document: Document;
}

export function DocumentContent({ document }: DocumentContentProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">📄 {document.title}</h1>
      <p className="text-sm text-muted-foreground">
        Criado em {format(new Date(document.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
          locale: ptBR,
        })}
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo Atual</CardTitle>
        </CardHeader>
        <CardContent className="whitespace-pre-wrap">
          {document.content}
        </CardContent>
      </Card>
    </div>
  );
}
