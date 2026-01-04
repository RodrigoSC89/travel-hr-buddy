import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Badge para indicar status, categorias ou contagens no Nautilus One.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "Variante visual do badge",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secundário",
    variant: "secondary",
  },
};

export const Destructive: Story = {
  args: {
    children: "Crítico",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Online</Badge>
      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Offline</Badge>
      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Em Progresso</Badge>
      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Beta</Badge>
    </div>
  ),
};

export const ModuleBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">PEOTRAM</Badge>
      <Badge variant="outline">PEO-DP</Badge>
      <Badge variant="outline">SGSO</Badge>
      <Badge variant="outline">ISPS</Badge>
      <Badge variant="secondary">NEW</Badge>
    </div>
  ),
};

export const CountBadges: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="flex items-center gap-1">
        <span>Alertas</span>
        <Badge variant="destructive">12</Badge>
      </div>
      <div className="flex items-center gap-1">
        <span>Pendentes</span>
        <Badge variant="secondary">5</Badge>
      </div>
      <div className="flex items-center gap-1">
        <span>Completos</span>
        <Badge className="bg-green-500/20 text-green-400">47</Badge>
      </div>
    </div>
  ),
};
