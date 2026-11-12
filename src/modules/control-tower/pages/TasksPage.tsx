import * as React from "react";
import { DndContext, PointerSensor, TouchSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { CalendarClock, KanbanSquare, List, Plus, Search, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useTasks } from "../api";
import { PRIORITIES, TASK_STATUSES, priorityTone, taskStatusLabel, taskStatusTone } from "../constants";
import { useCtContext } from "../context";
import { deadlineLabel, deadlineTone, fmtShort, memberName, taskDeadline } from "../lib/format";
import { exportExcel } from "../lib/export";
import { readPref, useExportData, writePref } from "../hooks";
import type { Priority, Task, TaskStatus } from "../types";
import { TaskFormDialog } from "../components/TaskFormDialog";
import { TaskSheet } from "../components/TaskSheet";
import { TaskWorkflowDialog, taskPermissions, useTaskStatusChange, type WorkflowMode } from "../components/TaskWorkflow";
import { EmptyRow, MemberAvatar, OptionSelect, PageHeader, Tone } from "../components/shared";

type View = "kanban" | "lista";
type Scope = "todas" | "minhas" | "revisar";

function TaskCard({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { me } = useCtContext();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const dl = taskDeadline(task);
  const needsMe = task.status === "em_double_check" && taskPermissions(task, me.id).canReview;
  return (
    // dnd-kit `attributes` provide role="button" and tabIndex for keyboard access
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      className={cn(
        "cursor-grab touch-none rounded-lg border bg-card p-3 text-left shadow-sm transition hover:border-primary/50 hover:shadow active:cursor-grabbing",
        isDragging && "z-50 opacity-80 shadow-lg ring-2 ring-primary",
        needsMe && "border-violet-500/60 ring-1 ring-violet-500/40",
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground">{task.code}</span>
        <Tone className={cn("px-1.5 py-0 text-[10px]", priorityTone(task.priority))}>{task.priority}</Tone>
      </div>
      <p className="line-clamp-3 text-sm font-medium leading-snug">{task.title}</p>
      {task.front && <p className="mt-1 truncate text-xs text-muted-foreground">{task.front}</p>}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MemberAvatar id={task.executor_id} />
          <span aria-hidden>→</span>
          <MemberAvatar id={task.reviewer_id} />
        </div>
        <span className={cn("flex items-center gap-1 text-[11px]", deadlineTone[dl])}>
          <CalendarClock className="h-3 w-3" />
          {task.due_date ? fmtShort(task.due_date) : "sem prazo"}
        </span>
      </div>
      {needsMe && (
        <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-violet-600 dark:text-violet-300">
          <ShieldCheck className="h-3 w-3" /> Aguardando sua revisão
        </p>
      )}
    </div>
  );
}

function Column({ status, tasks, onOpen }: { status: TaskStatus; tasks: Task[]; onOpen: (t: Task) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const meta = TASK_STATUSES.find((s) => s.value === status);
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[78vw] max-w-[300px] shrink-0 flex-col rounded-xl border bg-muted/30 sm:w-[280px]",
        isOver && "border-primary bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between border-b px-3 py-2.5">
        <Tone className={meta?.tone}>{meta?.label}</Tone>
        <span className="text-xs font-semibold text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onOpen={() => onOpen(t)} />
        ))}
      </div>
    </div>
  );
}

const PRIORITY_ORDER: Record<Priority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
const sortTasks = (a: Task, b: Task) =>
  PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
  (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999") ||
  a.code.localeCompare(b.code);

export default function TasksPage() {
  const { me, members } = useCtContext();
  const { data: tasks = [], isLoading } = useTasks();
  const exportData = useExportData();
  const { change } = useTaskStatusChange();
  const [params, setParams] = useSearchParams();
  const [view, setView] = React.useState<View>(() => readPref<View>("ct-task-view", "kanban"));
  const [scope, setScope] = React.useState<Scope>((params.get("scope") as Scope) || "todas");
  const [query, setQuery] = React.useState("");
  const [priority, setPriority] = React.useState<Priority | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [workflow, setWorkflow] = React.useState<{ id: string; mode: WorkflowMode } | null>(null);
  const selectedId = params.get("task");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  React.useEffect(() => writePref("ct-task-view", view), [view]);

  const open = (t: Task | null) => {
    const next = new URLSearchParams(params);
    if (t) next.set("task", t.id);
    else next.delete("task");
    setParams(next, { replace: true });
  };

  const filtered = tasks
    .filter((t) => {
      if (scope === "minhas" && t.executor_id !== me.id && t.reviewer_id !== me.id) return false;
      if (scope === "revisar" && !(t.status === "em_double_check" && t.reviewer_id === me.id)) return false;
      if (priority && t.priority !== priority) return false;
      if (query) {
        const q = query.toLowerCase();
        return [t.code, t.title, t.front, t.next_action].some((x) => x?.toLowerCase().includes(q));
      }
      return true;
    })
    .sort(sortTasks);

  const onDragEnd = (e: DragEndEvent) => {
    const task = tasks.find((t) => t.id === e.active.id);
    const target = e.over?.id as TaskStatus | undefined;
    if (!task || !target || target === task.status) return;
    const perms = taskPermissions(task, me.id);

    if (target === "em_double_check") {
      if (!perms.canSubmit) return void toast.error(`Somente ${memberName(members, task.executor_id)} (executor) pode enviar para double check`);
      return setWorkflow({ id: task.id, mode: "submit" });
    }
    if (target === "concluida") {
      if (task.status !== "em_double_check") return void toast.error("A tarefa precisa passar pelo double check antes de ser concluída");
      if (!perms.canReview) return void toast.error(perms.reviewBlockReason ?? "Você não pode aprovar esta tarefa");
      return setWorkflow({ id: task.id, mode: "review" });
    }
    if (task.status === "em_double_check" && !perms.canWithdraw && !perms.canReview) {
      return void toast.error("Tarefa em double check: aguarde a revisão");
    }
    if (task.status === "em_double_check" && perms.canReview && target === "em_ajuste") {
      return setWorkflow({ id: task.id, mode: "review" });
    }
    change(task, target).then(() => toast.success(`${task.code} → ${taskStatusLabel(target)}`)).catch(() => undefined);
  };

  const selected = tasks.find((t) => t.id === selectedId) ?? null;
  const wfTask = tasks.find((t) => t.id === workflow?.id) ?? null;
  const toReview = tasks.filter((t) => t.status === "em_double_check" && taskPermissions(t, me.id).canReview).length;

  return (
    <div>
      <PageHeader
        title="Tarefas"
        subtitle="Executor principal + revisor independente. Nenhuma tarefa é concluída sem double check."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => exportData && exportExcel(exportData, "Tarefas")} disabled={!exportData}>
              Exportar Excel
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="mr-2 h-4 w-4" /> Nova tarefa
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Buscar por código, tarefa, cliente…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <ToggleGroup type="single" value={scope} onValueChange={(v) => v && setScope(v as Scope)} className="justify-start">
          <ToggleGroupItem value="todas" size="sm">Todas</ToggleGroupItem>
          <ToggleGroupItem value="minhas" size="sm">Minhas</ToggleGroupItem>
          <ToggleGroupItem value="revisar" size="sm">
            Para eu revisar {toReview > 0 && <span className="ml-1 rounded-full bg-violet-600 px-1.5 text-[10px] text-white">{toReview}</span>}
          </ToggleGroupItem>
        </ToggleGroup>
        <OptionSelect<Priority>
          className="h-9 lg:w-44"
          value={priority}
          onChange={setPriority}
          allowEmpty
          placeholder="Todas as prioridades"
          options={PRIORITIES}
        />
        <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as View)} className="lg:ml-auto">
          <ToggleGroupItem value="kanban" size="sm" aria-label="Kanban">
            <KanbanSquare className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="lista" size="sm" aria-label="Lista">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {isLoading ? (
        <EmptyRow text="Carregando tarefas…" />
      ) : view === "kanban" ? (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
            {TASK_STATUSES.map((s) => (
              <Column key={s.value} status={s.value} tasks={filtered.filter((t) => t.status === s.value)} onOpen={open} />
            ))}
          </div>
        </DndContext>
      ) : filtered.length === 0 ? (
        <EmptyRow />
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead className="w-14">Prior.</TableHead>
                <TableHead>Tarefa</TableHead>
                <TableHead className="hidden md:table-cell">Frente</TableHead>
                <TableHead>Exec · Rev</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => {
                const dl = taskDeadline(t);
                return (
                  <TableRow key={t.id} className="cursor-pointer" onClick={() => open(t)}>
                    <TableCell className="font-mono text-xs">{t.code}</TableCell>
                    <TableCell>
                      <Tone className={priorityTone(t.priority)}>{t.priority}</Tone>
                    </TableCell>
                    <TableCell className="min-w-[220px] font-medium">{t.title}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">{t.front}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {memberName(members, t.executor_id)} · {memberName(members, t.reviewer_id)}
                    </TableCell>
                    <TableCell>
                      <Tone className={taskStatusTone(t.status)}>{taskStatusLabel(t.status)}</Tone>
                    </TableCell>
                    <TableCell className={cn("whitespace-nowrap text-sm", deadlineTone[dl])} title={deadlineLabel[dl]}>
                      {t.due_date ? fmtShort(t.due_date) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <TaskFormDialog open={creating} onOpenChange={setCreating} />
      <TaskSheet task={selected} onClose={() => open(null)} />
      <TaskWorkflowDialog task={wfTask} mode={workflow?.mode ?? null} onClose={() => setWorkflow(null)} />
    </div>
  );
}
