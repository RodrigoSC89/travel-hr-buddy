import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash, Download } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Componente de botão padrão do Nautilus One com suporte a variantes, tamanhos e ícones.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Variante visual do botão",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "Tamanho do botão",
    },
    disabled: {
      control: "boolean",
      description: "Estado desabilitado",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Botão Padrão",
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
    children: "Excluir",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Adicionar
      </Button>
      <Button variant="secondary">
        <Save className="w-4 h-4 mr-2" />
        Salvar
      </Button>
      <Button variant="destructive">
        <Trash className="w-4 h-4 mr-2" />
        Excluir
      </Button>
      <Button variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Exportar
      </Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button size="sm">Pequeno</Button>
      <Button size="default">Padrão</Button>
      <Button size="lg">Grande</Button>
      <Button size="icon">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: "Desabilitado",
    disabled: true,
  },
};

export const Loading: Story = {
  render: () => (
    <Button disabled>
      <span className="animate-spin mr-2">⏳</span>
      Carregando...
    </Button>
  ),
};
