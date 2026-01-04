import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Toggle switch para opções binárias no Nautilus One.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="notifications" />
      <Label htmlFor="notifications">Notificações</Label>
    </div>
  ),
};

export const SettingsList: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base">Modo Escuro</Label>
          <p className="text-sm text-muted-foreground">Ativar tema escuro</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base">Notificações Push</Label>
          <p className="text-sm text-muted-foreground">Receber alertas no celular</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base">Email de Resumo</Label>
          <p className="text-sm text-muted-foreground">Resumo semanal por email</p>
        </div>
        <Switch />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base">Modo Offline</Label>
          <p className="text-sm text-muted-foreground">Sincronizar dados offline</p>
        </div>
        <Switch defaultChecked />
      </div>
    </div>
  ),
};
