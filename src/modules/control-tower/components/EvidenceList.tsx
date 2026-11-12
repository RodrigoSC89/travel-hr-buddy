import * as React from "react";
import { FileText, Loader2, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { openEvidence, useDeleteEvidence, useEvidences, useUploadEvidence, type EvidenceParent } from "../api";
import { fmtDateTime, memberName } from "../lib/format";
import { useCtContext } from "../context";

const MAX_MB = 25;

export function EvidenceList({ parent, readOnly }: { parent: EvidenceParent; readOnly?: boolean }) {
  const { members } = useCtContext();
  const { data: evidences = [], isLoading } = useEvidences(parent);
  const upload = useUploadEvidence(parent);
  const remove = useDeleteEvidence(parent);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      if (f.size > MAX_MB * 1024 * 1024) {
        toast.error(`${f.name}: limite de ${MAX_MB} MB por arquivo`);
        continue;
      }
      await upload.mutateAsync(f).catch(() => undefined);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Carregando…</p>
      ) : evidences.length === 0 ? (
        <p className="text-xs text-muted-foreground">Nenhum arquivo anexado.</p>
      ) : (
        <ul className="space-y-1.5">
          {evidences.map((ev) => (
            <li key={ev.id} className="flex items-center gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5 text-sm">
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <button type="button" className="min-w-0 flex-1 truncate text-left hover:underline" onClick={() => openEvidence(ev)}>
                {ev.file_name}
              </button>
              <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">
                {memberName(members, ev.uploaded_by)} · {fmtDateTime(ev.created_at)}
              </span>
              {!readOnly && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  aria-label={`Remover ${ev.file_name}`}
                  onClick={() => remove.mutate(ev)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!readOnly && (
        <>
          <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
            {upload.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paperclip className="mr-2 h-4 w-4" />}
            Anexar arquivo
          </Button>
        </>
      )}
    </div>
  );
}
