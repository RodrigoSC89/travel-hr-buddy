import { useState, useCallback } from "react";;
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Brain,
  Bell,
  Settings,
  Filter,
  Shield,
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  BarChart3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Import components
import TrainingDashboardSection from "./components/TrainingDashboardSection";
import DrillsCalendarSection from "./components/DrillsCalendarSection";
import CrewTrainingSection from "./components/CrewTrainingSection";
import CertificationsSection from "./components/CertificationsSection";
import ReportsSection from "./components/ReportsSection";
import ISPSCodeSection from "./components/ISPSCodeSection";
import TrainingCreatorSection from "./components/TrainingCreatorSection";
import { NotificationsDialog } from "./components/NotificationsDialog";
import { SettingsDialog } from "./components/SettingsDialog";
import { FiltersDialog } from "./components/FiltersDialog";

export default function SolasIspsTraining() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "1", title: "Drill de Incêndio Agendado", message: "Simulado de combate a incêndio em 3 dias", read: false, date: "2024-01-15" },
    { id: "2", title: "Certificação Expirando", message: "STCW de João Silva expira em 30 dias", read: false, date: "2024-01-14" },
    { id: "3", title: "Novo Treinamento Disponível", message: "Módulo ISPS Code Awareness disponível", read: true, date: "2024-01-13" },
    { id: "4", title: "Drill Concluído", message: "Drill de Abandono concluído com sucesso", read: true, date: "2024-01-12" },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Todas as notificações marcadas como lidas");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-orange-500/10 via-red-500/10 to-amber-500/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  SOLAS, ISPS & ISM Training
                  <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20">
                    <Brain className="h-3 w-3 mr-1" />
                    IA Embarcada
                  </Badge>
                </h1>
                <p className="text-muted-foreground">
                  Centro de treinamentos, drills obrigatórios e certificações STCW
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar treinamentos..."
                  value={searchQuery}
                  onChange={handleChange}
                  className="pl-9 w-64"
                />
              </div>

              {/* Filters */}
              <Button variant="outline" size="icon" onClick={handleSetFiltersOpen}>
                <Filter className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <Button
                variant="outline"
                size="icon"
                className="relative"
                onClick={handleSetNotificationsOpen}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Settings */}
              <Button variant="outline" size="icon" onClick={handleSetSettingsOpen}>
                <Settings className="h-4 w-4" />
              </Button>

              {/* Create New */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="cursor-pointer">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Drill
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Criar Treinamento
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <FileText className="h-4 w-4 mr-2" />
                    Adicionar Certificação
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    <Brain className="h-4 w-4 mr-2" />
                    Gerar com IA
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-7 bg-muted/50">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden lg:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="drills" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden lg:inline">Drills</span>
            </TabsTrigger>
            <TabsTrigger value="crew" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden lg:inline">Tripulação</span>
            </TabsTrigger>
            <TabsTrigger value="certs" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden lg:inline">Certificações</span>
            </TabsTrigger>
            <TabsTrigger value="isps" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden lg:inline">ISPS Code</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden lg:inline">Criar</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden lg:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <TrainingDashboardSection searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="drills">
            <DrillsCalendarSection />
          </TabsContent>

          <TabsContent value="crew">
            <CrewTrainingSection searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="certs">
            <CertificationsSection searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="isps">
            <ISPSCodeSection />
          </TabsContent>

          <TabsContent value="create">
            <TrainingCreatorSection />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <NotificationsDialog
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNotificationClick={(id: string) => {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }}
      />

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      <FiltersDialog open={filtersOpen} onOpenChange={setFiltersOpen} />
    </div>
  );
}
