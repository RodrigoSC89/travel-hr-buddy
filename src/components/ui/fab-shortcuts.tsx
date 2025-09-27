import React from 'react';
import { Mic, Search, Settings, Bot } from 'lucide-react';
import FloatingShortcutButton from '@/components/ui/floating-shortcut-button';

// Simple, accessible cluster of 4 floating action buttons (bottom-right)
// Colors per spec: bg #003366 / #004F9E, icon #FFFFFF
const FabShortcuts: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-[10060] pointer-events-auto">
      <div className="flex flex-col gap-4">
        <FloatingShortcutButton
          icon={<Mic />}
          onClick={() => console.log('Comando de voz')}
          label="Comando de voz"
          bgColor="#003366"
          iconColor="#FFFFFF"
          ariaLabel="Comando de voz"
        />
        <FloatingShortcutButton
          icon={<Search />}
          onClick={() => console.log('Busca avançada')}
          label="Busca avançada"
          bgColor="#003366"
          iconColor="#FFFFFF"
          ariaLabel="Busca avançada"
        />
        <FloatingShortcutButton
          icon={<Settings />}
          onClick={() => console.log('Configurações')}
          label="Configurações"
          bgColor="#004F9E"
          iconColor="#FFFFFF"
          ariaLabel="Configurações do sistema"
        />
        <FloatingShortcutButton
          icon={<Bot />}
          onClick={() => console.log('Chat IA')}
          label="Chat IA"
          bgColor="#004F9E"
          iconColor="#FFFFFF"
          ariaLabel="Chat com IA"
        />
      </div>
    </div>
  );
};

export default FabShortcuts;
