/**
 * MB MARITIME · OPERATIONS CONTROL TOWER
 * Sistema de gestão de contratos, entregáveis, tarefas (double check),
 * agenda e comercial. Montado em /control-tower/*.
 */
import * as React from "react";
import { Anchor, CalendarDays, ClipboardList, FileSpreadsheet, FileSignature, FileText, Handshake, LayoutDashboard, LogOut, PackageCheck, ShieldCheck } from "lucide-react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { errorMessage, useClaimMember, useCurrentMember, useMembers, useTasks, useUnclaimedMembers } from "./api";
import { CT_BASE } from "./constants";
import { CtProvider, useCtContext } from "./context";
import { useExportData } from "./hooks";
import { exportExcel, exportPdfReport } from "./lib/export";
import { taskPermissions } from "./components/TaskWorkflow";
import { MemberAvatar } from "./components/shared";

const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const ContractsPage = React.lazy(() => import("./pages/ContractsPage"));
const DeliverablesPage = React.lazy(() => import("./pages/DeliverablesPage"));
const TasksPage = React.lazy(() => import("./pages/TasksPage"));
const AgendaPage = React.lazy(() => import("./pages/AgendaPage"));
const CommercialPage = React.lazy(() => import("./pages/CommercialPage"));

const NAV = [
  { to: "", label: "Dashboard", hint: "Visão geral", icon: LayoutDashboard },
  { to: "contratos", label: "Contratos", hint: "SEAGEMS · OCEANPACT · TECHNIP", icon: FileSignature },
  { to: "entregaveis", label: "Entregáveis", hint: "Prazos, evidências, aceites", icon: PackageCheck },
  { to: "tarefas", label: "Tarefas", hint: "Kanban e double check", icon: ClipboardList },
  { to: "agenda", label: "Agenda", hint: "Reuniões e auditorias", icon: CalendarDays },
  { to: "comercial", label: "Comercial", hint: "Propostas e prospecção", icon: Handshake },
];

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-600 to-blue-900 text-white shadow">
        <Anchor className="h-5 w-5" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-wide">MB MARITIME</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Control Tower</p>
        </div>
      )}
    </div>
  );
}

function ExportMenu() {
  const data = useExportData();
  const [busy, setBusy] = React.useState(false);
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!data || busy}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Exportar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Relatórios e contingência</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => data && run(() => exportExcel(data))}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel completo (todas as abas)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => data && run(() => exportPdfReport(data))}>
          <FileText className="mr-2 h-4 w-4" /> Relatório de situação (PDF)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Shell() {
  const { me } = useCtContext();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data: tasks = [] } = useTasks();
  const pendingReview = tasks.filter((t) => t.status === "em_double_check" && taskPermissions(t, me.id).canReview).length;

  const link = (item: (typeof NAV)[number], mobile = false) => (
    <NavLink
      key={item.to}
      to={item.to ? `${CT_BASE}/${item.to}` : CT_BASE}
      end={!item.to}
      className={({ isActive }) =>
        cn(
          mobile
            ? "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm"
            : "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
          isActive ? "border-primary bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {mobile ? (
        item.label
      ) : (
        <span className="min-w-0 flex-1">
          <span className="block">{item.label}</span>
          <span className="block truncate text-[11px] font-normal text-muted-foreground">{item.hint}</span>
        </span>
      )}
      {item.to === "tarefas" && pendingReview > 0 && (
        <span className="ml-auto rounded-full bg-violet-600 px-1.5 text-[10px] font-semibold text-white" title="Aguardando sua revisão">
          {pendingReview}
        </span>
      )}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card/60 backdrop-blur lg:flex">
        <div className="border-b px-5 py-4">
          <Brand />
        </div>
        <nav className="flex-1 space-y-1 p-3">{NAV.map((n) => link(n))}</nav>
        <div className="m-3 rounded-lg border bg-muted/30 p-3 text-[11px] text-muted-foreground">
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Double check obrigatório
          </p>
          Ninguém encerra uma tarefa sozinho. Executor, revisor, data e evidência ficam registrados.
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <div className="lg:hidden">
              <Brand compact />
            </div>
            <p className="hidden text-sm font-medium text-muted-foreground sm:block lg:hidden">Control Tower</p>
            <div className="ml-auto flex items-center gap-2">
              <ExportMenu />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 px-2">
                    <MemberAvatar id={me.id} size="md" />
                    <span className="hidden text-sm sm:inline">{me.short_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {me.name}
                    <p className="text-xs font-normal text-muted-foreground">{me.role}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate(`/auth?redirect=${encodeURIComponent(CT_BASE)}`);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-2.5 lg:hidden">{NAV.map((n) => link(n, true))}</nav>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
          <React.Suspense fallback={<p className="py-20 text-center text-sm text-muted-foreground">Carregando…</p>}>
            <Routes>
              <Route index element={<DashboardPage />} />
              <Route path="contratos" element={<ContractsPage />} />
              <Route path="entregaveis" element={<DeliverablesPage />} />
              <Route path="tarefas" element={<TasksPage />} />
              <Route path="agenda" element={<AgendaPage />} />
              <Route path="comercial" element={<CommercialPage />} />
              <Route path="*" element={<Navigate to={CT_BASE} replace />} />
            </Routes>
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-background p-4">{children}</div>;
}

function ClaimProfile() {
  const { user, signOut } = useAuth();
  const { data: unclaimed = [], isLoading, error } = useUnclaimedMembers(true);
  const claim = useClaimMember();
  return (
    <Centered>
      <Card className="w-full max-w-md">
        <CardHeader>
          <Brand />
          <CardTitle className="pt-4">Primeiro acesso</CardTitle>
          <CardDescription>
            Conectado como <strong>{user?.email}</strong>. Escolha o seu perfil na MB Maritime. Cada perfil só pode ser vinculado a um login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
              Não foi possível carregar os perfis ({errorMessage(error)}). Verifique se a migração do Control Tower foi aplicada no Supabase.
            </p>
          )}
          {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {!isLoading && !error && unclaimed.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Todos os perfis já estão vinculados. Peça a um membro da equipe para cadastrar o seu acesso.
            </p>
          )}
          {unclaimed.map((m) => (
            <Button key={m.id} variant="outline" className="h-auto w-full justify-start py-3" disabled={claim.isPending} onClick={() => claim.mutate(m.id)}>
              <span className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {m.short_name.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-left">
                <span className="block font-medium">Sou {m.name}</span>
                {m.requires_email && <span className="block text-xs text-muted-foreground">Reservado para um e-mail específico</span>}
              </span>
            </Button>
          ))}
          <Button variant="ghost" size="sm" className="w-full" onClick={() => signOut()}>
            Entrar com outra conta
          </Button>
        </CardContent>
      </Card>
    </Centered>
  );
}

export default function ControlTowerApp() {
  const { user, isLoading: authLoading } = useAuth();
  const me = useCurrentMember(user?.id);
  const members = useMembers();

  React.useEffect(() => {
    const prev = document.title;
    document.title = "MB Maritime · Control Tower";
    return () => {
      document.title = prev;
    };
  }, []);

  if (authLoading || (user && me.isLoading)) {
    return <Centered><p className="text-sm text-muted-foreground">Carregando Control Tower…</p></Centered>;
  }
  if (!user) return <Navigate to={`/auth?redirect=${encodeURIComponent(CT_BASE)}`} replace />;
  if (me.error) {
    return (
      <Centered>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Control Tower indisponível</CardTitle>
            <CardDescription>{errorMessage(me.error)}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Aplique as migrações <code>20261112120000_mb_control_tower_schema.sql</code> e <code>…_seed.sql</code> no Supabase.
          </CardContent>
        </Card>
      </Centered>
    );
  }
  if (!me.data) return <ClaimProfile />;
  if (!members.data) return <Centered><p className="text-sm text-muted-foreground">Carregando equipe…</p></Centered>;

  return (
    <CtProvider value={{ me: me.data, members: members.data }}>
      <Shell />
    </CtProvider>
  );
}
