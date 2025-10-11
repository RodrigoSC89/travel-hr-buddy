import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DocumentHeaderProps {
  title: string;
  createdAt: string;
}

export function DocumentHeader({ title, createdAt }: DocumentHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold">📄 {title}</h1>
      <p className="text-sm text-muted-foreground">
        Criado em {format(new Date(createdAt), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
          locale: ptBR,
        })}
      </p>
    </div>
  );
}
