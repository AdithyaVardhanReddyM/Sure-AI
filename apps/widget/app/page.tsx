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
    <main
      className="flex h-full min-h-screen w-full flex-col overflow-hidden rounded-xl border bg-muted 
     bg-[linear-gradient(30deg,hsl(241_23%_34%)_0%,hsl(242_26%_38%)_34%,hsl(245_28%_42%)_50%,hsl(247_30%_45%)_58%,hsl(249_33%_49%)_64%,hsl(250_35%_52%)_70%,hsl(253_38%_56%)_77%,hsl(254_40%_59%)_84%,hsl(256_43%_63%)_92%,hsl(258_45%_66%)_100%)]
    "
    >
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there! 👋🏻</p>
          <p className="text-lg">How can we help you today?</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1">Widget View : {agentId}</div>
      <WidgetFooter />
    </main>
  );
}
