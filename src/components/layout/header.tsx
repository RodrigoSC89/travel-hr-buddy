import React from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { UserProfileDialog } from '@/components/user/user-profile-dialog';
import { SimpleGlobalSearch } from '@/components/ui/simple-global-search';
import { OrganizationSelector } from '@/components/admin/organization-selector';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <SidebarTrigger />
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none max-w-md">
            <SimpleGlobalSearch />
          </div>
          
          <nav className="flex items-center space-x-2">
            <OrganizationSelector />
            <NotificationCenter />
            <UserProfileDialog />
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};
