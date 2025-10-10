// ✅ Grid de Módulos — Interface Inteligente para Nautilus One

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Ship,
  BrainCircuit,
  UserCheck,
  Plane,
  BellRing,
  Plug,
  CalendarCheck,
  MessageSquareText,
  Settings,
  Gauge,
  Mic,
  Bell,
  Cpu,
  FileText,
  Users,
  Smartphone,
  ListChecks,
  HardDrive,
  Database,
  ShieldCheck,
  Copy,
  BarChartBig,
  Activity,
  Monitor,
  FileCode2,
  Bot,
  AreaChart,
  Repeat,
  HelpCircle,
  Settings2,
  Eye,
  LucideIcon,
} from "lucide-react";

interface Module {
  name: string;
  icon: LucideIcon;
  category: string;
  slug: string;
  description?: string;
  status?: "functional" | "pending";
}

const modules: Module[] = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    category: "Core",
    slug: "dashboard",
    status: "functional",
  },
  {
    name: "Sistema Marítimo",
    icon: Ship,
    category: "Operações",
    slug: "maritime",
    status: "functional",
  },
  {
    name: "IA & Inovação",
    icon: BrainCircuit,
    category: "IA",
    slug: "innovation",
    status: "functional",
  },
  {
    name: "Portal do Funcionário",
    icon: UserCheck,
    category: "RH",
    slug: "portal",
    status: "functional",
  },
  { name: "Viagens", icon: Plane, category: "Logística", slug: "travel", status: "functional" },
  {
    name: "Alertas de Preços",
    icon: BellRing,
    category: "Financeiro",
    slug: "price-alerts",
    status: "functional",
  },
  {
    name: "Hub de Integrações",
    icon: Plug,
    category: "Sistema",
    slug: "intelligence",
    status: "functional",
  },
  {
    name: "Reservas",
    icon: CalendarCheck,
    category: "Logística",
    slug: "reservations",
    status: "functional",
  },
  {
    name: "Comunicação",
    icon: MessageSquareText,
    category: "Sistema",
    slug: "communication",
    status: "functional",
  },
  {
    name: "Configurações",
    icon: Settings,
    category: "Sistema",
    slug: "settings",
    status: "functional",
  },
  { name: "Otimização", icon: Gauge, category: "IA", slug: "optimization", status: "functional" },
  { name: "Assistente de Voz", icon: Mic, category: "IA", slug: "voice", status: "functional" },
  {
    name: "Centro de Notificações",
    icon: Bell,
    category: "Sistema",
    slug: "notifications",
    status: "pending",
  },
  {
    name: "Monitor de Sistema",
    icon: Cpu,
    category: "Sistema",
    slug: "health-monitor",
    status: "functional",
  },
  {
    name: "Documentos",
    icon: FileText,
    category: "Documentos",
    slug: "documents",
    status: "pending",
  },
  {
    name: "Colaboração",
    icon: Users,
    category: "Comunicação",
    slug: "collaboration",
    status: "functional",
  },
  {
    name: "Otimização Mobile",
    icon: Smartphone,
    category: "IA",
    slug: "mobile",
    status: "pending",
  },
  {
    name: "Checklists Inteligentes",
    icon: ListChecks,
    category: "Operações",
    slug: "checklists",
    status: "functional",
  },
  {
    name: "PEOTRAM",
    icon: HardDrive,
    category: "Operações",
    slug: "peotram",
    status: "functional",
  },
  { name: "PEO-DP", icon: Database, category: "Operações", slug: "peo-dp", status: "functional" },
  { name: "SGSO", icon: ShieldCheck, category: "Compliance", slug: "sgso", status: "functional" },
  { name: "Templates", icon: Copy, category: "Documentos", slug: "templates", status: "pending" },
  {
    name: "Analytics Avançado",
    icon: BarChartBig,
    category: "Análise",
    slug: "analytics",
    status: "functional",
  },
  {
    name: "Analytics Tempo Real",
    icon: Activity,
    category: "Análise",
    slug: "realtime",
    status: "pending",
  },
  {
    name: "Monitor Avançado",
    icon: Monitor,
    category: "Sistema",
    slug: "system-monitor",
    status: "pending",
  },
  {
    name: "Documentos IA",
    icon: FileCode2,
    category: "IA",
    slug: "documents-ai",
    status: "pending",
  },
  { name: "Assistente IA", icon: Bot, category: "IA", slug: "ai-assistant", status: "pending" },
  {
    name: "Business Intelligence",
    icon: AreaChart,
    category: "Análise",
    slug: "bi",
    status: "pending",
  },
  { name: "Smart Workflow", icon: Repeat, category: "IA", slug: "workflow", status: "pending" },
  { name: "Centro de Ajuda", icon: HelpCircle, category: "Ajuda", slug: "help", status: "pending" },
  { name: "Automação IA", icon: Settings2, category: "IA", slug: "automation", status: "pending" },
  { name: "Visão Geral", icon: Eye, category: "Core", slug: "overview", status: "pending" },
];

// Extract unique categories
const categories = Array.from(new Set(modules.map(m => m.category))).sort();

export default function ModulesGrid() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filtered = modules.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleModuleClick = (slug: string, status?: string) => {
    if (status === "functional") {
      navigate(`/${slug}`);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Search */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              📦 Todos os Módulos
            </h1>
            <p className="text-muted-foreground mt-1">
              {filtered.length} de {modules.length} módulos disponíveis
            </p>
          </div>
          <Input
            placeholder="🔍 Buscar módulo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            Todos
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((mod, i) => {
            const Icon = mod.icon;
            const isDisabled = mod.status === "pending";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: isDisabled ? 1 : 1.03 }}
                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              >
                <Card
                  className={`rounded-2xl shadow hover:shadow-lg transition-all ${
                    isDisabled ? "opacity-60" : ""
                  }`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
                    <div className="relative">
                      <Icon
                        className={`h-10 w-10 ${
                          isDisabled ? "text-muted-foreground" : "text-primary"
                        }`}
                      />
                      {isDisabled && (
                        <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                          ⚠️
                        </Badge>
                      )}
                    </div>
                    <div className="text-center space-y-1">
                      <p className="font-semibold text-lg">{mod.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {mod.category}
                      </Badge>
                    </div>
                    <Button
                      variant={isDisabled ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => handleModuleClick(mod.slug, mod.status)}
                      disabled={isDisabled}
                      className="w-full"
                    >
                      {isDisabled ? "Em Desenvolvimento" : "Acessar"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum módulo encontrado com os filtros aplicados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
