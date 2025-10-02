"use client";

import WidgetFooter from "@/modules/widget/ui/components/widget-footer";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";
import { WidgetView } from "@/modules/widget/ui/views/widget-view";
import { use } from "react";

interface Props {
  searchParams: Promise<{
    agentId: string;
  }>;
}

export default function Page({ searchParams }: Props) {
  const { agentId } = use(searchParams);
  return (
    <main className="flex h-full min-h-screen w-full flex-col overflow-hidden rounded-xl border bg-gradient-to-tr from-white via-primary to-secondary-foreground">
      <WidgetView agentId={agentId} />
    </main>
  );
}
