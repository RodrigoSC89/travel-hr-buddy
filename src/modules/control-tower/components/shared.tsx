import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCtContext } from "../context";

export function Tone({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <Badge variant="outline" className={cn("whitespace-nowrap font-medium", className)}>
      {children}
    </Badge>
  );
}

export function Field({ label, children, className, hint }: { label: string; children: React.ReactNode; className?: string; hint?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

const NONE = "__none__";

export function OptionSelect<T extends string>({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  allowEmpty,
  className,
}: {
  value: T | null | undefined;
  onChange: (v: T | null) => void;
  options: readonly (T | { value: T; label: string })[];
  placeholder?: string;
  allowEmpty?: boolean;
  className?: string;
}) {
  const norm = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <Select value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? null : (v as T))}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {(allowEmpty || !value) && (
          <SelectItem value={NONE}>{allowEmpty && placeholder === "Selecione" ? "— Nenhum —" : placeholder}</SelectItem>
        )}
        {norm.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function MemberSelect({
  value,
  onChange,
  allowEmpty,
  exclude,
}: {
  value: string | null | undefined;
  onChange: (v: string | null) => void;
  allowEmpty?: boolean;
  exclude?: string | null;
}) {
  const { members } = useCtContext();
  return (
    <OptionSelect
      value={value}
      onChange={onChange}
      allowEmpty={allowEmpty}
      options={members.filter((m) => m.active && m.id !== exclude).map((m) => ({ value: m.id, label: m.short_name }))}
    />
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyRow({ text = "Nenhum registro" }: { text?: string }) {
  return <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{text}</div>;
}

export function MemberAvatar({ id, size = "sm" }: { id: string | null | undefined; size?: "sm" | "md" }) {
  const { members } = useCtContext();
  const m = members.find((x) => x.id === id);
  if (!m) return <span className="text-xs text-muted-foreground">—</span>;
  const hue = m.short_name === "Rodrigo" ? "bg-sky-600" : m.short_name === "Marcelo" ? "bg-teal-600" : "bg-slate-600";
  return (
    <span
      title={m.name}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white",
        hue,
        size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs",
      )}
    >
      {m.short_name.slice(0, 2).toUpperCase()}
    </span>
  );
}
