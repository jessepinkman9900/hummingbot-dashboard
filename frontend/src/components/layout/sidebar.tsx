'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  Bot,
  Wallet,
  TrendingUp,
  Users,
  TestTube,
  Plug,
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
        icon: TrendingUp,
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
    <Sidebar>
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
    </Sidebar>
  );
}