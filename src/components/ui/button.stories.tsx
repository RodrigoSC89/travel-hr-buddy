import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Mail, Loader2, ChevronRight } from "lucide-react";

/**
 * Button component for user actions.
 * Supports multiple variants, sizes, and states.
 */
const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "Size variant",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/** Primary button for main actions */
export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

/** Secondary button for less prominent actions */
export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};

/** Outline button for tertiary actions */
export const Outline: Story = {
  args: {
    children: "Outline",
    variant: "outline",
  },
};

/** Destructive button for dangerous actions */
export const Destructive: Story = {
  args: {
    children: "Delete",
    variant: "destructive",
  },
};

/** Ghost button for subtle actions */
export const Ghost: Story = {
  args: {
    children: "Ghost",
    variant: "ghost",
  },
};

/** Link-styled button */
export const Link: Story = {
  args: {
    children: "Link",
    variant: "link",
  },
};

/** Button with icon */
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Mail className="mr-2 h-4 w-4" />
        Login with Email
      </>
    ),
  },
};

/** Loading state with spinner */
export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </>
    ),
  },
};

/** Icon-only button */
export const IconOnly: Story = {
  args: {
    size: "icon",
    children: <ChevronRight className="h-4 w-4" />,
  },
};

/** Small size button */
export const Small: Story = {
  args: {
    size: "sm",
    children: "Small",
  },
};

/** Large size button */
export const Large: Story = {
  args: {
    size: "lg",
    children: "Large",
  },
};

/** Disabled button */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};
