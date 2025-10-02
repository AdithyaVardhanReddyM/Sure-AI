"use client";

import { useAtomValue } from "jotai";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";
import { screenAtom } from "../../atoms/widget-atoms";

interface Props {
  agentId: string;
}
export const WidgetView = ({ agentId }: Props) => {
  const screen = useAtomValue(screenAtom);
  const screenComponents = {
    error: <p>TODO: Error</p>,
    loading: <p>TODO: Loading</p>,
    auth: <WidgetAuthScreen />,
    voice: <p>TODO: Voice</p>,
    inbox: <p>TODO: Inbox</p>,
    selection: <p>TODO: Selection</p>,
    chat: <p>TODO: Chat</p>,
    contact: <p>TODO: Contact</p>,
  };

  return (
    <main className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-transparent">
      {screenComponents[screen]}
    </main>
  );
};
