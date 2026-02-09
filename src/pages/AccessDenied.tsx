/**
 * NAUTI ONE — Access Denied Page
 * Shown when a user navigates to a route they don't have access to
 */

import React from 'react';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-6 mb-6">
        <ShieldX className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Você não tem permissão para acessar este módulo. 
        Entre em contato com o administrador para solicitar acesso.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={() => navigate('/command')}>
          Ir para Command
        </Button>
      </div>
    </div>
  );
}
