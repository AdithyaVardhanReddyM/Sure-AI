"use client";

import { Button } from "@workspace/ui/components/button";
import { WidgetHeader } from "../components/widget-header";
import { ArrowRight } from "lucide-react";
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
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-2xl">Hi there! 👋🏻</p>
          <p className="text-lg">How can we help you today?</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4  overflow-y-auto">
        <Button
          className="h-16 w-full justify-between bg-white/10 text-primary-foreground"
          onClick={handleNewConversation}
          disabled={isPending}
        >
          <div className="text-left">
            <p className="font-bold">Ask a question</p>
            <p className="text-primary-foreground/65 text-sm">
              Our AI Agent and team can help you
            </p>
          </div>
          <div>
            <ArrowRight className="size-[20px]" />
          </div>
        </Button>
      </div>
    </>
  );
};
