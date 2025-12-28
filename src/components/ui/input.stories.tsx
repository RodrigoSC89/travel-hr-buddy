import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";
import { Label } from "./label";
import { Search, Mail, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

/**
 * Input component for text entry fields.
 */
const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url"],
      description: "Input type",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

/** Default text input */
export const Default: Story = {
  args: {
    type: "text",
    placeholder: "Enter text...",
  },
};

/** Email input */
export const Email: Story = {
  args: {
    type: "email",
    placeholder: "name@example.com",
  },
};

/** Password input */
export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
};

/** Number input */
export const Number: Story = {
  args: {
    type: "number",
    placeholder: "0",
  },
};

/** Disabled input */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
    value: "Cannot edit",
  },
};

/** Input with label */
export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="username">Username</Label>
      <Input id="username" placeholder="Enter your username" />
    </div>
  ),
};

/** File input */
export const File: Story = {
  args: {
    type: "file",
  },
};

/** Search input with icon */
export const SearchInput: Story = {
  render: () => (
    <div className="relative w-[300px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search..." className="pl-10" />
    </div>
  ),
};

/** Input with icon */
export const WithIcon: Story = {
  render: () => (
    <div className="relative w-[300px]">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input type="email" placeholder="Email" className="pl-10" />
    </div>
  ),
};

/** Password with toggle visibility */
export const PasswordToggle: Story = {
  render: function PasswordToggleStory() {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className="relative w-[300px]">
        <Input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    );
  },
};

/** Form field group */
export const FormGroup: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="John Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email2">Email Address</Label>
        <Input id="email2" type="email" placeholder="john@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
      </div>
    </div>
  ),
};
