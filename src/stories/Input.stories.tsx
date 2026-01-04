import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Mail, Lock, User } from "lucide-react";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Campo de entrada de texto padrão do Nautilus One.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url"],
    },
    disabled: {
      control: "boolean",
    },
    placeholder: {
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Digite aqui...",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="seu@email.com" />
    </div>
  ),
};

export const Password: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="password">Senha</Label>
      <Input type="password" id="password" placeholder="••••••••" />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Buscar..." />
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" type="email" placeholder="Email" />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" type="password" placeholder="Senha" />
      </div>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-10" placeholder="Nome de usuário" />
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: "Campo desabilitado",
    disabled: true,
  },
};

export const Error: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="error" className="text-red-500">Email inválido</Label>
      <Input 
        id="error" 
        type="email" 
        placeholder="Email" 
        className="border-red-500 focus-visible:ring-red-500"
        defaultValue="email-invalido"
      />
      <p className="text-sm text-red-500">Por favor, insira um email válido.</p>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <Input className="h-8 text-sm" placeholder="Pequeno" />
      <Input placeholder="Padrão" />
      <Input className="h-12 text-lg" placeholder="Grande" />
    </div>
  ),
};
