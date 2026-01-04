import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ship, Calendar, Users } from "lucide-react";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Card container para agrupar informações relacionadas no Nautilus One.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Título do Card</CardTitle>
        <CardDescription>Descrição do card com informações adicionais.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Conteúdo do card vai aqui.</p>
      </CardContent>
      <CardFooter>
        <Button>Ação</Button>
      </CardFooter>
    </Card>
  ),
};

export const VesselCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            <CardTitle>MV Ocean Star</CardTitle>
          </div>
          <Badge className="bg-green-500/20 text-green-400">Ativo</Badge>
        </div>
        <CardDescription>IMO: 9876543 | Tipo: Tanker</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Último porto: Santos, BR</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Tripulação: 24 pessoas</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button size="sm">Ver Detalhes</Button>
        <Button size="sm" variant="outline">Histórico</Button>
      </CardFooter>
    </Card>
  ),
};

export const StatCard: Story = {
  render: () => (
    <Card className="w-[200px]">
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">147</p>
          <p className="text-sm text-muted-foreground">Módulos Ativos</p>
        </div>
      </CardContent>
    </Card>
  ),
};

export const AlertCard: Story = {
  render: () => (
    <Card className="w-[350px] border-orange-500/50 bg-orange-500/5">
      <CardHeader>
        <CardTitle className="text-orange-400">⚠️ Alerta de Manutenção</CardTitle>
        <CardDescription>Manutenção preventiva necessária</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">O motor principal requer inspeção em 48 horas.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">Agendar Manutenção</Button>
      </CardFooter>
    </Card>
  ),
};
