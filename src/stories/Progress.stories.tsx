import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "@/components/ui/progress";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Barra de progresso para indicar status de operações.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "range", min: 0, max: 100 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 60,
    className: "w-[300px]",
  },
};

export const Empty: Story = {
  args: {
    value: 0,
    className: "w-[300px]",
  },
};

export const Complete: Story = {
  args: {
    value: 100,
    className: "w-[300px]",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <div className="flex justify-between text-sm">
        <span>Upload em progresso</span>
        <span>75%</span>
      </div>
      <Progress value={75} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <div>
        <p className="text-sm mb-1">Pequeno (h-1)</p>
        <Progress value={60} className="h-1" />
      </div>
      <div>
        <p className="text-sm mb-1">Padrão (h-2)</p>
        <Progress value={60} className="h-2" />
      </div>
      <div>
        <p className="text-sm mb-1">Médio (h-3)</p>
        <Progress value={60} className="h-3" />
      </div>
      <div>
        <p className="text-sm mb-1">Grande (h-4)</p>
        <Progress value={60} className="h-4" />
      </div>
    </div>
  ),
};

export const MultipleProgress: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>PEOTRAM</span>
          <span className="text-success">100%</span>
        </div>
        <Progress value={100} />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>PEO-DP</span>
          <span className="text-info">85%</span>
        </div>
        <Progress value={85} />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>SGSO</span>
          <span className="text-warning">60%</span>
        </div>
        <Progress value={60} />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>ISPS</span>
          <span className="text-destructive">25%</span>
        </div>
        <Progress value={25} />
      </div>
    </div>
  ),
};
