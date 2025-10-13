'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  Bot,
  Users,
  TestTube,
  Plug,
  Bird,
  ChartCandlestick,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
  {
    title: 'Overview',
    items: [
      {
        title: 'Dashboard',
        url: '/portfolio',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Trading',
    items: [
      {
        title: 'Bots',
        url: '/bots',
        icon: Bot,
      },
      {
        title: 'Market Data',
        url: '/market',
        icon: ChartCandlestick,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Accounts',
        url: '/accounts',
        icon: Users,
      },
      {
        title: 'Connectors',
        url: '/connectors',
        icon: Plug,
      },
    ],
  },
  {
    title: 'Development',
    items: [
      {
        title: 'API Test',
        url: '/api-test',
        icon: TestTube,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenuButton size="lg" asChild>
          <Link href="/portfolio" className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bird className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Hummingbot</span>
              <span className="truncate text-xs">Dashboard</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}