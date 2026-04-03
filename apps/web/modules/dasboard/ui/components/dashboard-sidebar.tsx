"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
    CreditCardIcon,
    LayoutDashboardIcon,
    PaletteIcon,
    SettingsIcon,
    InboxIcon,
    LibraryBigIcon,
    Mic
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";


const customerSupportItems  = [
    {
        title: "Conversations",
        url: "/conversations",
        icon: InboxIcon
    },
    {
        title: "Knowledge Base",
        url: "/files",
        icon: LibraryBigIcon
    },
];

const configurationItems = [
    {
        title: "Customization",
        url: "/customization",
        icon: PaletteIcon
    },
    {
        title: "Integrations",
        url: "/integrations",
        icon: LayoutDashboardIcon
    },
    {
        title: "Voice Assistant",
        url: "/plugins/vapi",
        icon: Mic
    }
]

import React, { use } from 'react'

export default function DashboardSidebar() {
    const pathname = usePathname();

    const isActive = (url: string) => {
        if (url === '/') {
            return pathname === "/";
        }

        return pathname.startsWith(url);
    }



  return (
    <Sidebar className="group" collapsible="icon">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton>
                        <OrganizationSwitcher hidePersonal skipInvitationScreen></OrganizationSwitcher>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Customer Support</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {customerSupportItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                    asChild
                                    tooltip={item.title}
                                    isActive={isActive(item.url)}
                                    >
                                        <Link href={item.url} className={cn("flex items-center", isActive(item.url) ? "text-primary" : "text-muted-foreground")}>
                                            <item.icon className="mr-2" />
                                            {item.title}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>

            </SidebarGroup>

<SidebarGroup>
                <SidebarGroupLabel>Configuration Support</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {configurationItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                    asChild
                                    tooltip={item.title}
                                    isActive={isActive(item.url)}
                                    >
                                        <Link href={item.url} className={cn("flex items-center", isActive(item.url) ? "text-primary" : "text-muted-foreground")}>
                                            <item.icon className="mr-2" />
                                            {item.title}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>

            </SidebarGroup>


        </SidebarContent>
        <SidebarRail/>
    </Sidebar>
  )
}   
          


