"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { WidgetHeader } from "../components/widget-header";
import {
  agentIdAtom,
  contactSessionIdAtomFamily,
  conversationIdAtom,
  screenAtom,
} from "../../atoms/widget-atoms";
import WidgetFooter from "../components/widget-footer";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getManyConversations } from "../../../../../../packages/database/src/conversations";
import { formatDistanceToNow } from "date-fns";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";

export const WidgetInboxScreen = () => {
  const setScreen = useSetAtom(screenAtom);
  const setConversationId = useSetAtom(conversationIdAtom);

  const agentId = useAtomValue(agentIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(agentId || "")
  );

  const [conversations, setConversations] = useState<
    | {
        conversationId: string;
        agentId: string;
        lastMessage: string | null;
        createdAt: Date;
        status: "escalated" | "notEscalated";
      }[]
    | null
  >(null);

  useEffect(() => {
    if (contactSessionId) {
      getManyConversations(contactSessionId).then((result) => {
        setConversations(result);
      });
    }
  }, [contactSessionId]);

  return (
    <>
      <div className="bg-gradient-to-b to-secondary-foreground from-primary">
        <WidgetHeader className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <Button
              size="icon"
              className="bg-white/10 hover:bg-white/20"
              onClick={() => setScreen("selection")}
            >
              <ArrowLeftIcon />
            </Button>
            <p>Inbox</p>
          </div>
        </WidgetHeader>
      </div>
      <div className="flex flex-1 flex-col gap-y-3 p-4 bg-white overflow-y-auto">
        {conversations &&
          conversations.length > 0 &&
          conversations.map((conversation) => (
            <Button
              className="h-20 w-full justify-between"
              key={conversation.conversationId}
              onClick={() => {
                setConversationId(conversation.conversationId);
                setScreen("chat");
              }}
              variant="outline"
            >
              <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="text-muted-foreground text-xs">Chat</p>
                  <p className="text-xs">
                    {formatDistanceToNow(new Date(conversation.createdAt))}
                  </p>
                </div>
                <div className="flex w-full items-center justify-between gap-x-2">
                  <p className="truncate text-sm">{conversation.lastMessage}</p>
                  <ConversationStatusIcon status={conversation.status} />
                </div>
              </div>
            </Button>
          ))}
      </div>
      <WidgetFooter />
    </>
  );
};
