"use client";
import { Bot, ChevronDown, Settings } from "lucide-react";

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
} from "@workspace/ui/components/sidebar";
import { UserButton } from "@clerk/nextjs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@workspace/ui/lib/utils";

export const DashboardSidebar = () => {
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (url === "/") {
      return pathname === "/";
    }
    return pathname === url;
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        <SidebarHeader>Logo</SidebarHeader>
        <Collapsible className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem className="mb-3">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard")}
                    className={cn(
                      isActive("/dashboard") &&
                        "bg-gradient-to-b from-sidebar-primary to-[#7754ad] text-sidebar-primary-foreground!"
                    )}
                  >
                    <Link href="/dashboard">
                      <Bot className="size-4" />
                      <span>Agents</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>

            <SidebarMenuButton asChild>
              <CollapsibleTrigger>
                <Settings className="size-4" />
                Settings
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarMenuButton>
            <CollapsibleContent>
              <SidebarMenuButton asChild>
                <a>
                  <span>General</span>
                </a>
              </SidebarMenuButton>
              <SidebarMenuButton
                asChild
                isActive={isActive("/dashboard/plans")}
                className={cn(
                  isActive("/dashboard/plans") &&
                    "bg-gradient-to-b from-sidebar-primary to-[#7754ad] text-sidebar-primary-foreground!"
                )}
              >
                <Link href="/dashboard/plans">
                  <span>Plans & Billing</span>
                </Link>
              </SidebarMenuButton>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter>
        <UserButton
          showName
          appearance={{
            elements: {
              rootBox: "w-full! h-8!",
              userButtonTrigger:
                "w-full! p-2! hover: bg-sidebar-accent! hover: text-sidebar-accent-foreground! group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon] :p-2!",
              userButtonBox:
                "w-full! flex-row-reverse! justify-end! gap-2! group-data-[collapsible=icon]: justify-center! text-sidebar-foreground!",
              userButtonOuterIdentifier:
                "pl-0! group-data-[collapsible=icon]:hidden!",
              avatarBox: "size-4!",
            },
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
};
