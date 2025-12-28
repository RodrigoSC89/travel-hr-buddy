import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

/**
 * Tabs component for organizing content into sections.
 */
const meta: Meta<typeof Tabs> = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

/** Basic tabs */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm text-muted-foreground">Content for Tab 1</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-sm text-muted-foreground">Content for Tab 2</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-sm text-muted-foreground">Content for Tab 3</p>
      </TabsContent>
    </Tabs>
  ),
};

/** Tabs with cards */
export const WithCards: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@johndoe" />
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
            <Button>Update password</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

/** Disabled tabs */
export const WithDisabled: Story = {
  render: () => (
    <Tabs defaultValue="active" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="inactive" disabled>Inactive</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <p className="text-sm text-muted-foreground">This tab is active.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-muted-foreground">Settings content here.</p>
      </TabsContent>
    </Tabs>
  ),
};

/** Full width tabs */
export const FullWidth: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-4">
        <h3 className="text-lg font-semibold">Overview</h3>
        <p className="text-muted-foreground">View your dashboard overview here.</p>
      </TabsContent>
      <TabsContent value="analytics" className="p-4">
        <h3 className="text-lg font-semibold">Analytics</h3>
        <p className="text-muted-foreground">Track your analytics metrics.</p>
      </TabsContent>
      <TabsContent value="reports" className="p-4">
        <h3 className="text-lg font-semibold">Reports</h3>
        <p className="text-muted-foreground">Generate and view reports.</p>
      </TabsContent>
      <TabsContent value="settings" className="p-4">
        <h3 className="text-lg font-semibold">Settings</h3>
        <p className="text-muted-foreground">Configure your preferences.</p>
      </TabsContent>
    </Tabs>
  ),
};

/** Vertical-style tabs */
export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="day1" className="w-full">
      <TabsList className="flex flex-wrap h-auto">
        <TabsTrigger value="day1">Mon</TabsTrigger>
        <TabsTrigger value="day2">Tue</TabsTrigger>
        <TabsTrigger value="day3">Wed</TabsTrigger>
        <TabsTrigger value="day4">Thu</TabsTrigger>
        <TabsTrigger value="day5">Fri</TabsTrigger>
        <TabsTrigger value="day6">Sat</TabsTrigger>
        <TabsTrigger value="day7">Sun</TabsTrigger>
      </TabsList>
      <TabsContent value="day1" className="p-4">
        Monday schedule
      </TabsContent>
      <TabsContent value="day2" className="p-4">
        Tuesday schedule
      </TabsContent>
      <TabsContent value="day3" className="p-4">
        Wednesday schedule
      </TabsContent>
      <TabsContent value="day4" className="p-4">
        Thursday schedule
      </TabsContent>
      <TabsContent value="day5" className="p-4">
        Friday schedule
      </TabsContent>
      <TabsContent value="day6" className="p-4">
        Saturday schedule
      </TabsContent>
      <TabsContent value="day7" className="p-4">
        Sunday schedule
      </TabsContent>
    </Tabs>
  ),
};
