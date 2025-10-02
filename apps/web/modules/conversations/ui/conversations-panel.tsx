"use client";

import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ListIcon,
  BotMessageSquare,
  BotOff,
  CornerUpLeftIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  ConversationStatus,
  Message,
  ContactSession,
  getConversationsDashboard,
} from "@workspace/database";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { formatDistanceToNow } from "date-fns";
import { getCountryFlagUrl, getCountryFromTimezone } from "@/lib/country-utils";
import { ConversationStatusIcon } from "@workspace/ui/components/conversation-status-icon";
import { Skeleton } from "@workspace/ui/components/skeleton";
export const ConversationsPanel = () => {
  const pathname = usePathname();
  const agentId = pathname.split("/")[2];
  const [conversations, setConversations] = useState<
    ({
      id: string;
      agentId: string;
      contactSessionId: string;
      status: ConversationStatus;
      createdAt: Date;
      lastMessage: Message | null;
      contactSession: ContactSession;
    } | null)[]
  >([]);
  useEffect(() => {
    setLoading(true);
    getConversationsDashboard(agentId!)
      .then((data) => {
        setConversations(data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [agentId]);

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  return (
    <div className="flex h-full w-full flex-col bg-background text-sidebar-foreground">
      <div className="flex flex-col items-end gap-3.5 border-b p-2">
        <Select onValueChange={setSelectedFilter} value={selectedFilter}>
          <SelectTrigger className="h-8 border-none px-1.5 shadow-none ring-0 hover:bg-accent hover:text-accent-foreground focus-visible:ring-0">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <ListIcon className="size-4" />
                <span>All</span>
              </div>
            </SelectItem>
            <SelectItem value="notEscalated">
              <div className="flex items-center gap-2">
                <BotMessageSquare className="size-4" />
                <span>Not Escalated</span>
              </div>
            </SelectItem>
            <SelectItem value="escalated">
              <div className="flex items-center gap-2">
                <BotOff className="size-4" />
                <span>Escalated</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="max-h-[calc(100vh-53px)]">
        {loading ? (
          <SkeletonConversations />
        ) : (
          <div className="flex w-full flex-1 flex-col text-sm">
            {(() => {
              const filteredConversations =
                selectedFilter === "all"
                  ? conversations
                  : conversations.filter(
                      (conv) => conv?.status === selectedFilter
                    );
              return filteredConversations.map((conversation) => {
                const isLastMessageFromOperator =
                  conversation?.lastMessage?.role === "humanAgent";
                const country = getCountryFromTimezone(
                  JSON.parse(conversation?.contactSession.metadata as string)
                    .timezone
                );
                const countryFlagUrl = country?.code
                  ? getCountryFlagUrl(country.code)
                  : undefined;
                return (
                  <Link
                    href={`${pathname}/${conversation?.id}`}
                    className={cn(
                      "relative flex cursor-pointer items-start gap-3 border-b p-4 py-5 text-sm leading-tight hover:bg-accent hover:text-accent-foreground",
                      pathname === `/conversation/${conversation?.id}` &&
                        "bg-accent text-accent-foreground"
                    )}
                    key={conversation?.id}
                  >
                    <div
                      className={cn(
                        "-translate-y-1/2 absolute top-1/2 left-0 h-[64%] w-1 rounded-r-full bg-neutral-300 opacity-0 transition-opacity",
                        pathname === `/conversation/${conversation?.id}` &&
                          "opacity-100"
                      )}
                    />
                    <DicebearAvatar
                      seed={conversation?.contactSessionId!}
                      badgeImageUrl={countryFlagUrl}
                      size={40}
                      className="shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex w-full items-center gap-2">
                        <span className="truncate font-bold">
                          {conversation?.contactSession.name}
                        </span>
                        <span className="ml-auto shrink-0 text-muted-foreground text-xs">
                          {formatDistanceToNow(conversation?.createdAt!)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div className="flex w-0 grow items-center gap-1">
                          {isLastMessageFromOperator && (
                            <CornerUpLeftIcon className="size-3 shrink-0 text-muted-foreground" />
                          )}
                          <span
                            className={cn(
                              "line-clamp-1 text-secondary-foreground text-xs",
                              !isLastMessageFromOperator &&
                                "font-bold text-black"
                            )}
                          >
                            {conversation?.lastMessage?.content}
                          </span>
                        </div>
                        <ConversationStatusIcon
                          status={conversation?.status!}
                        />
                      </div>
                    </div>
                  </Link>
                );
              });
            })()}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export const SkeletonConversations = () => {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
      <div className="relative flex w-full min-w-0 flex-col p-2">
        <div className="w-full space-y-2">
          {Array.from({ length: 9 }).map((_, index) => (
            <div className="flex items-start gap-3 rounded-lg p-4" key={index}>
              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <div className="flex w-full items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="ml-auto h-3 w-12 shrink-0" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
