'use client';

import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { HealthStatusButton } from '@/components/system/health-status-button';
import { ThemePicker } from '@/components/ui/theme-picker';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AccountSelector } from '@/components/ui/account-selector';
import { ReadOnlyToggle } from '@/components/ui/read-only-toggle';
import { useAppStore } from '@/lib/store';
import { RefreshCw } from 'lucide-react';
import { useGlobalRefresh } from '@/lib/hooks/useGlobalRefresh';
import { Button } from '@/components/ui/button';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { refreshAll, isRefreshing } = useGlobalRefresh();

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border bg-card px-6 py-2 flex-shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-foreground">
                Hummingbot Dashboard
              </h1>
            </div>
            
            {/* Header actions */}
            <div className="flex items-center gap-2">
              <AccountSelector />
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

          {/* Footer - sticky to bottom */}
          <footer className="border-t border-border bg-card px-2 py-1 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Hummingbot Dashboard
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshAll}
                  disabled={isRefreshing}
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh All'}
                </Button>
                <span className="text-xs text-muted-foreground">
                  Last Updated: {new Date().toLocaleTimeString()}
                </span>
                <ReadOnlyToggle />
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Global toast notifications */}
      <Toaster />
    </SidebarProvider>
  );
}