'use client';

import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { HealthStatusButton } from '@/components/system/health-status-button';
import { ThemePicker } from '@/components/ui/theme-picker';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAppStore } from '@/lib/store';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-foreground">
                Hummingbot Dashboard
              </h1>
            </div>
            
            {/* Header actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <ThemePicker />
              <HealthStatusButton />
              {/* Notifications, user menu, etc. */}
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* Global toast notifications */}
      <Toaster />
    </SidebarProvider>
  );
}