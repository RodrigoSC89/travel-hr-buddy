import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

/**
 * Badge component for status indicators, labels, and tags.
 */
const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "Visual style variant",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

/** Default badge for primary status */
export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};

/** Secondary badge for less emphasis */
export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

/** Destructive badge for errors or warnings */
export const Destructive: Story = {
  args: {
    children: "Error",
    variant: "destructive",
  },
};

/** Outline badge for subtle indicators */
export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

/** Example: Status badges */
export const StatusBadges: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="default">Active</Badge>
      <Badge variant="secondary">Pending</Badge>
      <Badge variant="destructive">Error</Badge>
      <Badge variant="outline">Draft</Badge>
    </div>
  ),
};

/** Example: Priority badges */
export const PriorityBadges: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge className="bg-red-500">High</Badge>
      <Badge className="bg-yellow-500">Medium</Badge>
      <Badge className="bg-green-500">Low</Badge>
    </div>
  ),
};
