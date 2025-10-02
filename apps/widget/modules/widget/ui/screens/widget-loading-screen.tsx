"use client";

import { Loader2, Sparkles } from "lucide-react";
import { WidgetHeader } from "../components/widget-header";
import { useAtomValue, useSetAtom } from "jotai";
import {
  agentIdAtom,
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  screenAtom,
} from "../../atoms/widget-atoms";
import { useEffect, useState } from "react";
import { validateAgent } from "../../../../../../packages/database/src/agents";
import { validate } from "../../../../../../packages/database/src/contactSessions";

type InitStep = "agent" | "session" | "settings" | "done";

export const WidgetLoadingScreen = ({
  agentId,
}: {
  agentId: string | null;
}) => {
  const [step, setStep] = useState<InitStep>("agent");
  const [sessionValid, setSessionValid] = useState(false);

  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setAgentId = useSetAtom(agentIdAtom);

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(agentId || "")
  );

  useEffect(() => {
    if (step !== "agent") {
      return;
    }
    setLoadingMessage("Finding Agent...");
    if (!agentId) {
      setErrorMessage("Agent ID is required");
      setScreen("error");
      return;
    }
    setLoadingMessage("Verifying Agent...");
    validateAgent(agentId)
      .then((result) => {
        if (result.valid) {
          setAgentId(agentId);
          setStep("session");
        } else {
          setErrorMessage(result.reason || "Invalid configuration");
          setScreen("error");
        }
      })
      .catch(() => {
        setErrorMessage("Unable to verify agent");
        setScreen("error");
      });
  }, [
    step,
    agentId,
    setErrorMessage,
    setScreen,
    setAgentId,
    setStep,
    validateAgent,
    setLoadingMessage,
  ]);

  useEffect(() => {
    if (step !== "session") {
      return;
    }
    setLoadingMessage("Finding contact session");
    if (!contactSessionId) {
      setSessionValid(false);
      setStep("done");
      return;
    }

    setLoadingMessage("Validating session...");

    validate(contactSessionId as string)
      .then((result) => {
        setSessionValid(result.valid);
        setStep("done");
      })
      .catch(() => {
        setSessionValid(false);
        setStep("done");
      });
  }, [step, contactSessionId, validate, setLoadingMessage]);

  useEffect(() => {
    if (step !== "done") {
      return;
    }

    const hasValidSession = contactSessionId && sessionValid;
    setScreen(hasValidSession ? "selection" : "auth");
  }, [step, contactSessionId, sessionValid, setScreen]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-2xl">Hi there! 👋🏻</p>
          <p className="text-lg">How can we help you today?</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-6 p-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 animate-ping rounded-full bg-primary/20"></div>
          </div>
          <div className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-secondary-foreground/50 to-secondary-foreground/85 p-4 backdrop-blur-sm">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>
        <div className="w-full max-w-xs">
          <div className="h-2 rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary-foreground transition-all duration-700 ease-out"
              style={{
                width:
                  step === "agent"
                    ? "33%"
                    : step === "session"
                      ? "66%"
                      : "100%",
              }}
            ></div>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white/90">
            {loadingMessage || "Preparing your experience..."}
          </p>
          <p className="mt-1 text-xs text-white/70">Just a moment</p>
        </div>
      </div>
    </>
  );
};
