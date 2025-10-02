"use client";

interface Props {
  agentId: string;
}
export const WidgetView = ({ agentId }: Props) => {
  return (
    <main className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      Widget View : {agentId}
    </main>
  );
};
