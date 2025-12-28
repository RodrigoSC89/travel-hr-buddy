import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";

/**
 * Card component for grouping related content.
 */
const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

/** Basic card with all sections */
export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with additional information.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

/** Card with minimal content */
export const Simple: Story = {
  render: () => (
    <Card className="w-[350px] p-6">
      <p>Simple card with just content.</p>
    </Card>
  ),
};

/** Card with badge in header */
export const WithBadge: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Vessel Status</CardTitle>
          <Badge variant="default">Active</Badge>
        </div>
        <CardDescription>MV Nautilus One</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm"><strong>Position:</strong> 23.55°S, 46.63°W</p>
          <p className="text-sm"><strong>Speed:</strong> 12.5 knots</p>
          <p className="text-sm"><strong>Heading:</strong> 045°</p>
        </div>
      </CardContent>
    </Card>
  ),
};

/** Interactive card with actions */
export const Interactive: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Maintenance Alert</CardTitle>
        <CardDescription>Engine inspection due in 5 days</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Scheduled maintenance for main engine block. 
          Ensure parts are ordered and crew is briefed.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Dismiss</Button>
        <Button>View Details</Button>
      </CardFooter>
    </Card>
  ),
};

/** Grid of cards */
export const CardGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[720px]">
      <Card>
        <CardHeader>
          <CardTitle>Crew</CardTitle>
          <CardDescription>45 members</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">98%</p>
          <p className="text-sm text-muted-foreground">Compliance rate</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Vessels</CardTitle>
          <CardDescription>12 active</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">100%</p>
          <p className="text-sm text-muted-foreground">Operational</p>
        </CardContent>
      </Card>
    </div>
  ),
};
