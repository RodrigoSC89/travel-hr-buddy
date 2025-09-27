import React from 'react';
import { Mic, Search, Settings, Bot } from 'lucide-react';
import FloatingShortcutButton from '@/components/ui/floating-shortcut-button';
import { useSystemActions } from '@/hooks/use-system-actions';
import { useSidebarActions } from '@/hooks/use-sidebar-actions';

// Production-ready floating action buttons with integrated functionality
const FabShortcuts: React.FC = () => {
  const { handleGlobalSearch, handleNavigateToSettings } = useSystemActions();
  const { handleModuleAccess } = useSidebarActions();

  return (
    <div className="fixed bottom-6 right-6 z-[10060] pointer-events-auto">
      <div className="flex flex-col gap-4">
        <FloatingShortcutButton
          icon={<Mic />}
          onClick={() => handleModuleAccess('voice')}
          label="Comando de voz"
          bgColor="bg-azure-700 hover:bg-azure-800"
          iconColor="text-azure-50"
          ariaLabel="Ativar comando de voz"
        />
        <FloatingShortcutButton
          icon={<Search />}
          onClick={handleGlobalSearch}
          label="Busca avançada"
          bgColor="bg-azure-700 hover:bg-azure-800"
          iconColor="text-azure-50"
          ariaLabel="Abrir busca global"
        />
        <FloatingShortcutButton
          icon={<Settings />}
          onClick={handleNavigateToSettings}
          label="Configurações"
          bgColor="bg-azure-600 hover:bg-azure-700"
          iconColor="text-azure-50"
          ariaLabel="Abrir configurações do sistema"
        />
        <FloatingShortcutButton
          icon={<Bot />}
          onClick={() => handleModuleAccess('ai-insights')}
          label="Chat IA"
          bgColor="bg-azure-600 hover:bg-azure-700"
          iconColor="text-azure-50"
          ariaLabel="Abrir assistente de IA"
        />
      </div>
    </div>
  );
};

export default FabShortcuts;
