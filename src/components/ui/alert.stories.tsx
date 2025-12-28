import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { AlertCircle, CheckCircle, Info as InfoIcon, AlertTriangle } from "lucide-react";
const meta: Meta<typeof Alert> = {
  title: "UI/Alert",
  component: Alert,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive"],
      description: "Visual style variant",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

/** Default alert */
export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the CLI.
      </AlertDescription>
    </Alert>
  ),
};

/** Destructive alert for errors */
export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
};

/** Success alert with icon */
export const Success: Story = {
  render: () => (
    <Alert className="border-green-500 text-green-700 [&>svg]:text-green-500">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
};

/** Warning alert */
export const Warning: Story = {
  render: () => (
    <Alert className="border-yellow-500 text-yellow-700 [&>svg]:text-yellow-500">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        This action cannot be undone. Please proceed with caution.
      </AlertDescription>
    </Alert>
  ),
};

/** Info alert */
export const InfoAlert: Story = {
  render: () => (
    <Alert className="border-blue-500 text-blue-700 [&>svg]:text-blue-500">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        New features are available. Check out the changelog.
      </AlertDescription>
    </Alert>
  ),
};

/** Alert without title */
export const WithoutTitle: Story = {
  render: () => (
    <Alert>
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>
        This is a simple alert without a title.
      </AlertDescription>
    </Alert>
  ),
};

/** Multiple alerts stacked */
export const Stacked: Story = {
  render: () => (
    <div className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Note</AlertTitle>
        <AlertDescription>This is an informational message.</AlertDescription>
      </Alert>
      <Alert className="border-yellow-500 text-yellow-700 [&>svg]:text-yellow-500">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Please review before continuing.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>
    </div>
  ),
};
