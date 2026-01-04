import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Componente de seleção dropdown do Nautilus One.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Opção 1</SelectItem>
        <SelectItem value="option2">Opção 2</SelectItem>
        <SelectItem value="option3">Opção 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label>Embarcação</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Selecione a embarcação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mv-ocean-star">MV Ocean Star</SelectItem>
          <SelectItem value="mv-atlantic">MV Atlantic</SelectItem>
          <SelectItem value="mv-pacific">MV Pacific</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Selecione o módulo" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Compliance</SelectLabel>
          <SelectItem value="peotram">PEOTRAM</SelectItem>
          <SelectItem value="peo-dp">PEO-DP</SelectItem>
          <SelectItem value="sgso">SGSO</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Operações</SelectLabel>
          <SelectItem value="vessel-contracts">Vessel Contracts</SelectItem>
          <SelectItem value="cargo">Cargo Management</SelectItem>
          <SelectItem value="charter">Charter Party</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Segurança</SelectLabel>
          <SelectItem value="imca">IMCA Incidents</SelectItem>
          <SelectItem value="isps">ISPS Security</SelectItem>
          <SelectItem value="drill">Drill Simulator</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Desabilitado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Opção 1</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const StatusSelect: Story = {
  render: () => (
    <Select defaultValue="active">
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Ativo
          </span>
        </SelectItem>
        <SelectItem value="pending">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            Pendente
          </span>
        </SelectItem>
        <SelectItem value="inactive">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Inativo
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  ),
};
