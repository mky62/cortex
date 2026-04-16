"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
    CreditCardIcon,
    LayoutDashboardIcon,
    PaletteIcon,
    InboxIcon,
    LibraryBigIcon,
    Mic
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
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

const accountItems = [
    {
        title:"Plans & Billing",
        url: "/billing",
        icon: CreditCardIcon
    }
]

import React from 'react'

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
                        <OrganizationSwitcher
                         hidePersonal 
                         skipInvitationScreen
                         appearance={{
                            elements:
                            {
                                rootBox: "w-full! h-8!",
                                avatarBox: "size-4 rounded-sm!",
                                organizationSwitcherTrigger: "w-full! justify-start! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!",
                                organizationPreview: "group-data-[collapsible=icon]:justify-center! gap-2!",
                                organizationPreviewTextContainer: "group-data-[collapsible=icon]:hidden! text-sm! font-medium! text-sidebar-foreground!",
                                oragnizationSwitcherTriggerIcon: "group-data-[collapsible=icon]:hidden! ml-auto! text-sidebar-foreground"
                            }
                         }}></OrganizationSwitcher>
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
                                    className={cn(isActive(item.url) && "bg-gradient-to-b from-sidebar-primary to-[#0b63f3]! text-sidebar-primary-foreground! hover:to-[#0b63f3]/60!")}
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
                <SidebarGroupLabel>Configuration</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {configurationItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                    asChild
                                    tooltip={item.title}
                                    isActive={isActive(item.url)}
                                     className={cn(isActive(item.url) && "bg-gradient-to-b from-sidebar-primary to-[#0b63f3]! text-sidebar-primary-foreground! hover:to-[#0b63f3]/60!")}
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
                <SidebarGroupLabel>Account</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {accountItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                    asChild
                                    tooltip={item.title}
                                    isActive={isActive(item.url)}
                                     className={cn(isActive(item.url) && "bg-gradient-to-b from-sidebar-primary to-[#0b63f3]! text-sidebar-primary-foreground! hover:to-[#0b63f3]/60!")}
                                   
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
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                  <UserButton
                  showName
                  appearance={{
                    elements: {
                        rootBox: "w-full! h-8!",
                        userButtonTrigger: "w-full! p-2! hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! ",
                        userButtonBox: "w-full! flex-row-reverse justify-start! gap-2! group-data-[collapsible=icon]:justify-center!",
                        userButtonIdentifier: "text-sm! font-medium! text-sidebar-foreground! group-data-[collapsible=icon]:hidden!",
                        userButtonAvatarBox: "size-4 rounded-sm!"
                    }
                  }}  />          
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
        <SidebarRail/>
    </Sidebar>
  )
}   
          

