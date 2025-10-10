import React, { useState } from "react";
import { Bell, Bot, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/theme-provider";
import { SimpleGlobalSearch } from "@/components/ui/simple-global-search";
import { UserMenu } from "@/components/auth/user-menu";

export function SmartHeader() {
  const { theme, setTheme } = useTheme();
  const [notificationCount] = useState(3);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-zinc-800 dark:bg-zinc-900 text-white shadow-md border-b border-zinc-700">
      <h1 className="text-xl font-semibold flex items-center gap-2">
        <span>🚀 Nautilus One</span>
      </h1>

      <div className="flex-1 max-w-md mx-auto">
        <SimpleGlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-800 transition-colors"
          title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-800 transition-colors"
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {notificationCount}
            </span>
          )}
        </Button>

        {/* AI Assistant */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-800 transition-colors"
          title="Assistente IA"
        >
          <Bot className="w-5 h-5" />
        </Button>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
