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
import { ArrowLeftIcon, InboxIcon, MessageCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getManyConversations } from "../../../../../../packages/database/src/conversations";
import { formatDistanceToNow } from "date-fns";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { Skeleton } from "@workspace/ui/components/skeleton";

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
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-border/50">
        <WidgetHeader className="py-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-x-3">
              <Button
                size="icon"
                className="bg-white/10 hover:bg-white/20 text-white rounded-full shadow-sm transition-all duration-300 hover:scale-105"
                onClick={() => setScreen("selection")}
              >
                <ArrowLeftIcon className="size-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <InboxIcon className="size-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white/85">Inbox</h1>
                  <p className="text-xs text-white/70">
                    {conversations
                      ? `${conversations.length} conversations`
                      : "Loading..."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </WidgetHeader>
      </div>
      <div className="flex flex-1 flex-col gap-y-3 p-4 bg-gradient-to-b from-background/80 to-background/90 backdrop-blur-sm overflow-y-auto">
        {conversations === null ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-auto min-h-[80px] w-full rounded-2xl" />
            </div>
          ))
        ) : conversations.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Conversations
              </h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {conversations.length} total
              </span>
            </div>
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  className="w-full p-4 bg-background/70 backdrop-blur-sm border border-border/50 rounded-2xl hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group"
                  key={conversation.conversationId}
                  onClick={() => {
                    setConversationId(conversation.conversationId);
                    setScreen("chat");
                  }}
                >
                  <div className="flex w-full flex-col gap-3 overflow-hidden">
                    <div className="flex w-full items-center justify-between gap-x-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <MessageCircleIcon className="size-4 text-primary" />
                        </div>
                        <p className="font-semibold text-foreground text-sm">
                          Chat
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                        {formatDistanceToNow(new Date(conversation.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex w-full items-center justify-between gap-x-2">
                      <p className="truncate text-sm text-foreground/90 group-hover:text-foreground transition-colors">
                        {conversation.lastMessage || "No messages yet"}
                      </p>
                      <ConversationStatusIcon status={conversation.status} />
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40"></div>
                      <p className="text-xs text-muted-foreground/70">
                        {conversation.status === "escalated"
                          ? "Escalated"
                          : "Active"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-y-6 p-8 text-center">
            <div className="bg-primary/10 p-5 rounded-full">
              <InboxIcon className="size-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-2xl text-foreground">
                No conversations yet
              </h3>
              <p className="text-base text-muted-foreground max-w-md">
                Start a new conversation with our AI assistant to see it appear
                here
              </p>
            </div>
            <Button
              className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2 shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => setScreen("selection")}
            >
              Start New Conversation
            </Button>
          </div>
        )}
      </div>
      <WidgetFooter />
    </>
  );
};
