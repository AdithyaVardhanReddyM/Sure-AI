"use client";

import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  agentIdAtom,
  contactSessionIdAtomFamily,
  conversationIdAtom,
  errorMessageAtom,
  screenAtom,
} from "../../atoms/widget-atoms";
import { createConversation } from "@workspace/database";
import { useState } from "react";
import WidgetFooter from "../components/widget-footer";

export const WidgetSelectionScreen = () => {
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
      </div>
      <WidgetFooter />
    </>
  );
};
