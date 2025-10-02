import {
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { cookies } from "next/headers";
import React from "react";
import AgentSidebar from "./agent-sidebar";

export const AgentLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AgentSidebar />
      <main className="flex flex-1 flex-col min-h-screen py-2 pr-2 overflow-auto">
        <div className="bg-white rounded-md h-full border-2 border-primary/25">
          <SidebarTrigger />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};
