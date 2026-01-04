import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Settings, Users, Ship, BarChart } from "lucide-react";

const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Componente de abas para organizar conteúdo no Nautilus One.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Aba 1</TabsTrigger>
        <TabsTrigger value="tab2">Aba 2</TabsTrigger>
        <TabsTrigger value="tab3">Aba 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo Aba 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Conteúdo da primeira aba.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tab2">
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo Aba 2</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Conteúdo da segunda aba.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="tab3">
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo Aba 3</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Conteúdo da terceira aba.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="vessels" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="vessels" className="flex items-center gap-2">
          <Ship className="h-4 w-4" />
          Embarcações
        </TabsTrigger>
        <TabsTrigger value="crew" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Tripulação
        </TabsTrigger>
        <TabsTrigger value="docs" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documentos
        </TabsTrigger>
        <TabsTrigger value="reports" className="flex items-center gap-2">
          <BarChart className="h-4 w-4" />
          Relatórios
        </TabsTrigger>
      </TabsList>
      <TabsContent value="vessels">
        <Card>
          <CardHeader>
            <CardTitle>Embarcações</CardTitle>
            <CardDescription>Gerencie sua frota de embarcações.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Lista de embarcações aqui.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="crew">
        <Card>
          <CardHeader>
            <CardTitle>Tripulação</CardTitle>
            <CardDescription>Gerencie os membros da tripulação.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Lista de tripulantes aqui.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="docs">
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>Documentos e certificados.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Lista de documentos aqui.</p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>Relatórios</CardTitle>
            <CardDescription>Relatórios e analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Relatórios aqui.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="general" orientation="vertical" className="flex gap-4 w-[600px]">
      <TabsList className="flex-col h-auto">
        <TabsTrigger value="general" className="w-full justify-start">
          <Settings className="h-4 w-4 mr-2" />
          Geral
        </TabsTrigger>
        <TabsTrigger value="security" className="w-full justify-start">
          <Users className="h-4 w-4 mr-2" />
          Segurança
        </TabsTrigger>
        <TabsTrigger value="notifications" className="w-full justify-start">
          <FileText className="h-4 w-4 mr-2" />
          Notificações
        </TabsTrigger>
      </TabsList>
      <div className="flex-1">
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configurações gerais do sistema.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configurações de segurança.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configurações de notificações.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full max-w-2xl">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Relatórios</TabsTrigger>
        <TabsTrigger value="settings">Config</TabsTrigger>
        <TabsTrigger value="help">Ajuda</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        <p>Conteúdo de Visão Geral</p>
      </TabsContent>
      <TabsContent value="analytics" className="mt-4">
        <p>Conteúdo de Analytics</p>
      </TabsContent>
      <TabsContent value="reports" className="mt-4">
        <p>Conteúdo de Relatórios</p>
      </TabsContent>
      <TabsContent value="settings" className="mt-4">
        <p>Conteúdo de Configurações</p>
      </TabsContent>
      <TabsContent value="help" className="mt-4">
        <p>Conteúdo de Ajuda</p>
      </TabsContent>
    </Tabs>
  ),
};
