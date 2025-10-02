"use client";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { WidgetHeader } from "../components/widget-header";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  agentIdAtom,
  contactSessionIdAtomFamily,
  conversationIdAtom,
  errorMessageAtom,
  screenAtom,
  widgetSettingsAtom,
} from "../../atoms/widget-atoms";
import { createConversation } from "@workspace/database";
import { useMemo, useState } from "react";
import WidgetFooter from "../components/widget-footer";

type quick_linksType = {
  description?: string;
  imageurl?: string;
  link?: string;
};

export const WidgetSelectionScreen = () => {
  const widgetSettings = useAtomValue(widgetSettingsAtom);
  const setScreen = useSetAtom(screenAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const agentId = useAtomValue(agentIdAtom);
  const setConversationId = useSetAtom(conversationIdAtom);
  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(agentId || "")
  );
  const [isPending, setIsPending] = useState(false);

  const handleNewConversation = async () => {
    if (!agentId) {
      setScreen("error");
      setErrorMessage("Missing Agent Id");
      return;
    }
    if (!contactSessionId) {
      setScreen("auth");
      return;
    }
    setIsPending(true);
    try {
      const conversationId = await createConversation(
        agentId,
        contactSessionId
      );
      setConversationId(conversationId);
      setScreen("chat");
    } catch {
      setScreen("auth");
    } finally {
      setIsPending(false);
    }
  };

  const quick_links = useMemo<quick_linksType[]>(() => {
    const raw = widgetSettings?.links;

    // Normalize any supported shape into quick_linksType
    const toLink = (val: unknown): quick_linksType | null => {
      try {
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (!trimmed) return null;

          // If it's a JSON object/stringified record
          if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              // Arrays are handled by the caller; ignore here
              return null;
            }
            return parsed as quick_linksType;
          }

          // Treat plain string as a URL
          return { link: trimmed };
        }

        if (typeof val === "object" && val !== null) {
          const obj = val as Record<string, unknown>;
          return {
            description:
              typeof obj.description === "string" ? obj.description : undefined,
            imageurl:
              typeof obj.imageurl === "string" ? obj.imageurl : undefined,
            link: typeof obj.link === "string" ? obj.link : undefined,
          };
        }
      } catch {
        return null;
      }
      return null;
    };

    if (!raw) return [];

    // Case: links stored as a JSON string
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(toLink).filter(Boolean) as quick_linksType[];
        }
        const single = toLink(parsed);
        return single ? [single] : [];
      } catch {
        // Fallback: comma-separated URLs
        const candidates = raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        return candidates.map(toLink).filter(Boolean) as quick_linksType[];
      }
    }

    // Case: links already an array (objects or strings)
    if (Array.isArray(raw)) {
      return raw.map(toLink).filter(Boolean) as quick_linksType[];
    }

    return [];
  }, [widgetSettings]);

  return (
    <>
      <WidgetHeader className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
        <div className="flex flex-col justify-between gap-y-1 px-2 py-6">
          <p className="text-2xl font-semibold">Hi there! 👋🏻</p>
          <p className="text-sm text-primary-foreground/70">
            How can we help you today?
          </p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col justify-start gap-y-3 p-4 overflow-y-auto">
        <div className="w-full">
          <Button
            className="group h-16 w-full justify-between rounded-xl border border-border/50 bg-secondary/30 text-primary-foreground backdrop-blur transition-all hover:bg-secondary/40 disabled:opacity-60"
            onClick={handleNewConversation}
            disabled={isPending}
            aria-busy={isPending}
            aria-label="Start a new conversation"
          >
            <div className="text-left">
              <p className="font-semibold">Ask a question</p>
              <p className="text-sm text-primary-foreground/70">
                Our AI Agent and team can help you
              </p>
            </div>
            <div className="flex items-center">
              {isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-0.5" />
              )}
            </div>
          </Button>
          <p className="mt-2 text-xs text-primary-foreground/60">
            Avg. reply time under 5 minutes
          </p>
        </div>

        {quick_links.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-primary-foreground/60">
              <Sparkles className="size-3 text-primary" />
              <span>Quick links</span>
            </div>
            <div className="flex w-full flex-col gap-3">
              {quick_links.map((ql, idx) => {
                const title = ql.description || "Open link";
                return (
                  <a
                    key={ql.link ?? idx}
                    href={ql.link ?? "#"}
                    target={ql.link ? "_blank" : undefined}
                    rel={ql.link ? "noopener noreferrer" : undefined}
                    aria-label={`Open ${title}`}
                    className="group block w-full"
                  >
                    <Card className="w-full pt-0 overflow-hidden rounded-xl border border-border/50 bg-secondary/30 backdrop-blur transition-colors hover:bg-secondary/40">
                      <div className="w-full">
                        {ql.imageurl ? (
                          <img
                            src={ql.imageurl}
                            alt=""
                            className="block h-32 w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-32 w-full items-center justify-center bg-primary/10">
                            <Sparkles className="size-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium">{title}</p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <WidgetFooter />
    </>
  );
};
