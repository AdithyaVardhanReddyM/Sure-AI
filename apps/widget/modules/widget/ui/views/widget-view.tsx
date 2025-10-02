"use client";

import { WidgetAuthScreen } from "../screens/widget-auth-screen";

interface Props {
  agentId: string;
}
export const WidgetView = ({ agentId }: Props) => {
  return (
    <main className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-transparent">
      <WidgetAuthScreen />
    </main>
  );
};
