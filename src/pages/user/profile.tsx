/**
 * PATCH 510: User Profile Page with Session Management
 * Displays user profile and active session information
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActiveSessionDisplay } from "@/components/auth/ActiveSessionDisplay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Settings } from "lucide-react";

export default function UserProfilePage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-2">
        <User className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">Manage your account and security settings</p>
        </div>
      </div>

      <Tabs defaultValue="session" className="space-y-4">
        <TabsList>
          <TabsTrigger value="session">
            <Shield className="w-4 h-4 mr-2" />
            Session & Security
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile Info
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="session" className="space-y-4">
          <ActiveSessionDisplay />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>View and edit your profile details</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Profile information section - to be implemented based on your needs.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Settings section - to be implemented based on your needs.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
