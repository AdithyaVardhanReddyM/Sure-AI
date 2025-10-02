"use client";
import { UserButton } from "@clerk/nextjs";
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
import { cn } from "@workspace/ui/lib/utils";
import {
  Database,
  InboxIcon,
  PaletteIcon,
  Send,
  Settings2,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Items1 = [
  { title: "Conversations", url: "/conversations", icon: InboxIcon },
  { title: "Sources", url: "/sources", icon: Database },
];

const Items2 = [
  {
    title: "Widget Customisation",
    url: "/customisation",
    icon: PaletteIcon,
  },
  { title: "AI Actions", url: "/actions", icon: Settings2 },
];

const Items3 = [
  { title: "Deployment", url: "/deployment", icon: UploadCloud },
  { title: "Email Marketing", url: "/marketing", icon: Send },
];

const AgentSidebar = () => {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const agentId = segments[2]; // Extract agentId from /agent/{id}/...

  const isActive = (url: string) => {
    const lastSegment = segments[segments.length - 1];
    return lastSegment === url.slice(1); // Compare last segment with url without leading slash
  };
  return (
    <Sidebar className="group" collapsible="icon" variant="inset">
      <SidebarHeader>Logo</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Support & Knowledge</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Items1.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={cn(
                      isActive(item.url) &&
                        "bg-gradient-to-b from-sidebar-primary to-[#7754ad] text-sidebar-primary-foreground!"
                    )}
                  >
                    <Link href={`/agent/${agentId}/${item.url.slice(1)}`}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Configurations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Items2.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={cn(
                      isActive(item.url) &&
                        "bg-gradient-to-b from-sidebar-primary to-[#7754ad] text-sidebar-primary-foreground!"
                    )}
                  >
                    <Link href={`/agent/${agentId}/${item.url.slice(1)}`}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Deployment & Leads</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Items3.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={cn(
                      isActive(item.url) &&
                        "bg-gradient-to-b from-sidebar-primary to-[#7754ad] text-sidebar-primary-foreground!"
                    )}
                  >
                    <Link href={`/agent/${agentId}/${item.url.slice(1)}`}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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

export default AgentSidebar;
