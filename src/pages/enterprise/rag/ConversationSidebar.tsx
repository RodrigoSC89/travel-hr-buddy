/**
 * RAG Assistant - Conversation Sidebar
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, History, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export const ConversationSidebar = ({ conversations, activeId, onSelect, onCreate, onDelete }: ConversationSidebarProps) => (
  <Card className="w-64 flex-shrink-0">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardTitle className="text-sm">Conversas</CardTitle>
        <Button size="sm" onClick={onCreate}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
    <CardContent className="p-2">
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg cursor-pointer group",
                activeId === conv.id ? "bg-primary/10" : "hover:bg-muted"
              )}
              onClick={() => onSelect(conv.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <History className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="text-sm truncate">{conv.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
                aria-label="Excluir conversa"
                title="Excluir"
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma conversa ainda
            </p>
          )}
        </div>
      </ScrollArea>
    </CardContent>
  </Card>
);
