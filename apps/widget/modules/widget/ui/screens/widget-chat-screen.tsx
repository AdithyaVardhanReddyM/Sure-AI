"use client";

import { useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ArrowLeftIcon, MenuIcon } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  agentIdAtom,
  contactSessionIdAtomFamily,
  conversationIdAtom,
  screenAtom,
} from "../../atoms/widget-atoms";
import { getOne, ConversationStatus } from "@workspace/database";

export const WidgetChatScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const conversationId = useAtomValue(conversationIdAtom);
  const agentId = useAtomValue(agentIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(agentId || "")
  );

  const [conversation, setConversation] = useState<{
    _id: string;
    status: ConversationStatus;
    threadId: string;
  } | null>(null);

  useEffect(() => {
    if (conversationId && contactSessionId) {
      getOne(contactSessionId, conversationId).then(setConversation);
    }
  }, [conversationId, contactSessionId]);

  const onBack = () => {
    setConversationId(null);
    setScreen("selection");
  };

  return (
    <>
      <WidgetHeader className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <Button
            size="icon"
            className="bg-white/10 hover:bg-white/20"
            onClick={onBack}
          >
            <ArrowLeftIcon />
          </Button>
          <p>Chat</p>
        </div>
        <Button size="icon" className="bg-white/10 hover:bg-white/20">
          <MenuIcon />
        </Button>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 bg-white">
        {JSON.stringify(conversation)}
      </div>
    </>
  );
};
